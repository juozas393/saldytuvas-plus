import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    // Get JWT from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Create client with user's JWT to get their ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify the user's session
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Use service role to delete all user data
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Find the app_user record
    const { data: appUser } = await adminClient
      .from('app_user')
      .select('id_user, fk_environment_id, fk_inventory_id')
      .eq('auth_uid', user.id)
      .maybeSingle();

    if (appUser) {
      const userId = appUser.id_user;
      const envId = appUser.fk_environment_id;
      const invId = appUser.fk_inventory_id;

      // 1. Break circular FKs: app_user <-> environment, app_user -> inventory
      await adminClient.from('app_user')
        .update({ fk_environment_id: null, fk_inventory_id: null })
        .eq('id_user', userId);

      // 2. Delete products FIRST (product refs shopping_list, notification, recipe via FK)
      if (invId) {
        const { data: products } = await adminClient
          .from('product').select('id_product').eq('fk_inventory_id', invId);
        if (products?.length) {
          const productIds = products.map((p: { id_product: number }) => p.id_product);
          await adminClient.from('category').delete().in('fk_product_id', productIds);
          await adminClient.from('receipt_line').delete().in('fk_product_id', productIds);
          await adminClient.from('product').delete().in('id_product', productIds);
        }
      }

      // 3. Delete shopping_list (refs app_user + budget)
      await adminClient.from('shopping_list').delete().eq('fk_member_id', userId);

      // 4. Delete budget chain: notification -> shopping_list -> budget
      const { data: budgets } = await adminClient
        .from('budget').select('id_budget').eq('fk_administrator_id', userId);
      if (budgets?.length) {
        const budgetIds = budgets.map((b: { id_budget: number }) => b.id_budget);
        await adminClient.from('notification').delete().in('fk_budget_id', budgetIds);
        await adminClient.from('shopping_list').delete().in('fk_budget_id', budgetIds);
        await adminClient.from('budget').delete().eq('fk_administrator_id', userId);
      }

      // 5. Delete food_rule (refs app_user + nutrition_plan)
      await adminClient.from('food_rule').delete().eq('fk_administrator_id', userId);

      // 6. Delete invite_code (refs app_user with NO ACTION)
      await adminClient.from('invite_code').delete().eq('created_by', userId);
      await adminClient.from('invite_code')
        .update({ used_by: null }).eq('used_by', userId);

      // 7. Delete nutrition plan chain: recipe -> dish -> nutrition_plan
      if (envId) {
        const { data: plans } = await adminClient
          .from('nutrition_plan').select('id_nutrition_plan').eq('fk_environment_id', envId);
        if (plans?.length) {
          const planIds = plans.map((p: { id_nutrition_plan: number }) => p.id_nutrition_plan);
          const { data: dishes } = await adminClient
            .from('dish').select('id_dish').in('fk_nutrition_plan_id', planIds);
          if (dishes?.length) {
            const dishIds = dishes.map((d: { id_dish: number }) => d.id_dish);
            await adminClient.from('recipe').delete().in('fk_dish_id', dishIds);
            await adminClient.from('dish').delete().in('id_dish', dishIds);
          }
          await adminClient.from('food_rule').delete().in('fk_nutrition_plan_id', planIds);
          await adminClient.from('nutrition_plan').delete().in('id_nutrition_plan', planIds);
        }

        // 8. Delete meal (refs environment, missing from old code)
        await adminClient.from('meal').delete().eq('fk_environment_id', envId);

        // 9. Delete inventory (safe now - app_user FK already NULLed)
        await adminClient.from('inventory').delete().eq('fk_environment_id', envId);
        if (invId) {
          await adminClient.from('inventory').delete().eq('id_inventory', invId);
        }

        // 10. Delete environment (safe - app_user FK NULLed, children deleted, member_permissions CASCADEs)
        await adminClient.from('environment').delete().eq('id_environment', envId);
      }

      // 11. Delete spending_entry (refs auth.users with CASCADE, but clean up explicitly)
      await adminClient.from('spending_entry').delete().eq('user_id', user.id);

      // 12. Delete app_user (safe - environment deleted, all referencing rows gone)
      await adminClient.from('app_user').delete().eq('id_user', userId);
    }

    // 9. Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('Delete account error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
