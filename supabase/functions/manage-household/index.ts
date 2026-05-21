import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  // Get auth user
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
  }

  const body = await req.json();
  const action = body.action;

  try {
    // Find or create app_user
    let { data: appUser } = await supabase
      .from('app_user')
      .select('*')
      .eq('auth_uid', user.id)
      .maybeSingle();

    if (!appUser) {
      const { data: newUser, error: createErr } = await supabase
        .from('app_user')
        .insert({
          email: user.email || '',
          username: user.email?.split('@')[0] || 'user',
          auth_uid: user.id,
          role: 'Administratorius',
        })
        .select()
        .single();
      if (createErr) throw createErr;
      appUser = newUser;
    }

    // === CREATE HOUSEHOLD ===
    if (action === 'create') {
      const name = body.name || 'Mano saldytuvas';

      if (appUser.fk_environment_id) {
        return new Response(JSON.stringify({ error: 'Jau turite saldytuva' }), { status: 400, headers });
      }

      // Create environment
      const { data: env, error: envErr } = await supabase
        .from('environment')
        .insert({ name, fk_administrator_id: appUser.id_user })
        .select()
        .single();
      if (envErr) throw envErr;

      // Create inventories (fridge, freezer, pantry)
      const { data: inv, error: invErr } = await supabase
        .from('inventory')
        .insert({ storage_location: 'Saldytuvas', fk_environment_id: env.id_environment })
        .select()
        .single();
      if (invErr) throw invErr;

      // Link user to environment + inventory
      await supabase
        .from('app_user')
        .update({
          fk_environment_id: env.id_environment,
          fk_inventory_id: inv.id_inventory,
          role: 'Administratorius',
        })
        .eq('id_user', appUser.id_user);

      // Generate invite code
      const code = generateCode();
      await supabase
        .from('invite_code')
        .insert({
          code,
          fk_environment_id: env.id_environment,
          created_by: appUser.id_user,
        });

      return new Response(JSON.stringify({
        household: { id: env.id_environment, name: env.name },
        inviteCode: code,
        role: 'Administratorius',
      }), { headers });
    }

    // === JOIN HOUSEHOLD ===
    if (action === 'join') {
      const code = (body.code || '').toUpperCase().trim();
      if (!code) {
        return new Response(JSON.stringify({ error: 'Kodas privalomas' }), { status: 400, headers });
      }

      // If user already has a household, check if they're the only member
      // If so, auto-leave (delete the empty household)
      if (appUser.fk_environment_id) {
        const { data: otherMembers } = await supabase
          .from('app_user')
          .select('id_user')
          .eq('fk_environment_id', appUser.fk_environment_id)
          .neq('id_user', appUser.id_user);

        if (otherMembers && otherMembers.length > 0) {
          // Has other members — can't auto-leave
          return new Response(JSON.stringify({
            error: 'Jau priklausote saldytuvui su kitais nariais. Pirma isstokit is dabartinio.'
          }), { status: 400, headers });
        }

        // Only member — clean up the empty household
        const oldEnvId = appUser.fk_environment_id;

        // Unlink user first
        await supabase
          .from('app_user')
          .update({ fk_environment_id: null, fk_inventory_id: null })
          .eq('id_user', appUser.id_user);

        // Delete old invite codes
        await supabase
          .from('invite_code')
          .delete()
          .eq('fk_environment_id', oldEnvId);

        // Delete old inventories
        await supabase
          .from('inventory')
          .delete()
          .eq('fk_environment_id', oldEnvId);

        // Delete old environment
        await supabase
          .from('environment')
          .delete()
          .eq('id_environment', oldEnvId);
      }

      // Find valid code
      const { data: invite, error: invErr } = await supabase
        .from('invite_code')
        .select('*, environment:fk_environment_id(id_environment, name)')
        .eq('code', code)
        .is('used_by', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (invErr || !invite) {
        return new Response(JSON.stringify({ error: 'Kodas neteisingas arba pasibaiges' }), { status: 404, headers });
      }

      // Get inventory for the environment
      const { data: inv } = await supabase
        .from('inventory')
        .select('id_inventory')
        .eq('fk_environment_id', invite.fk_environment_id)
        .limit(1)
        .maybeSingle();

      // Mark code as used
      await supabase
        .from('invite_code')
        .update({ used_by: appUser.id_user, used_at: new Date().toISOString() })
        .eq('id', invite.id);

      // Link user to environment
      await supabase
        .from('app_user')
        .update({
          fk_environment_id: invite.fk_environment_id,
          fk_inventory_id: inv?.id_inventory || null,
          role: 'Member',
        })
        .eq('id_user', appUser.id_user);

      const envData = invite.environment as any;
      return new Response(JSON.stringify({
        household: { id: invite.fk_environment_id, name: envData?.name || 'Saldytuvas' },
        role: 'Member',
      }), { headers });
    }

    // === LEAVE HOUSEHOLD ===
    if (action === 'leave') {
      if (!appUser.fk_environment_id) {
        return new Response(JSON.stringify({ error: 'Nepriklausote jokiam saldytuvui' }), { status: 400, headers });
      }

      if (appUser.role === 'Administratorius') {
        return new Response(JSON.stringify({ error: 'Administratorius negali iseiti is savo saldytuvo' }), { status: 400, headers });
      }

      await supabase
        .from('app_user')
        .update({ fk_environment_id: null, fk_inventory_id: null, role: 'Member' })
        .eq('id_user', appUser.id_user);

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // === GET HOUSEHOLD ===
    if (action === 'get') {
      if (!appUser.fk_environment_id) {
        return new Response(JSON.stringify({ household: null, members: [], inviteCodes: [] }), { headers });
      }

      const { data: env } = await supabase
        .from('environment')
        .select('*')
        .eq('id_environment', appUser.fk_environment_id)
        .single();

      const { data: members } = await supabase
        .from('app_user')
        .select('id_user, username, email, role, created_at')
        .eq('fk_environment_id', appUser.fk_environment_id);

      // If admin, get active invite codes
      let inviteCodes: any[] = [];
      if (appUser.role === 'Administratorius') {
        const { data: codes } = await supabase
          .from('invite_code')
          .select('*')
          .eq('fk_environment_id', appUser.fk_environment_id)
          .is('used_by', null)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });
        inviteCodes = codes || [];
      }

      return new Response(JSON.stringify({
        household: env ? { id: env.id_environment, name: env.name } : null,
        members: members || [],
        inviteCodes: inviteCodes.map(c => ({ code: c.code, expiresAt: c.expires_at })),
        myRole: appUser.role,
        myUserId: appUser.id_user,
      }), { headers });
    }

    // === GENERATE NEW CODE ===
    if (action === 'generate-code') {
      if (!appUser.fk_environment_id || appUser.role !== 'Administratorius') {
        return new Response(JSON.stringify({ error: 'Tik administratorius gali generuoti kodus' }), { status: 403, headers });
      }

      const code = generateCode();
      await supabase
        .from('invite_code')
        .insert({
          code,
          fk_environment_id: appUser.fk_environment_id,
          created_by: appUser.id_user,
        });

      return new Response(JSON.stringify({ code }), { headers });
    }

    // === DEACTIVATE INVITE CODE ===
    if (action === 'deactivate-code') {
      if (!appUser.fk_environment_id || appUser.role !== 'Administratorius') {
        return new Response(JSON.stringify({ error: 'Tik administratorius gali deaktyvuoti kodus' }), { status: 403, headers });
      }

      const code = body.code;
      if (!code) {
        return new Response(JSON.stringify({ error: 'Nenurodytas kodas' }), { status: 400, headers });
      }

      const { error: deactivateErr } = await supabase
        .from('invite_code')
        .update({ expires_at: new Date(0).toISOString() })
        .eq('code', code)
        .eq('fk_environment_id', appUser.fk_environment_id)
        .is('used_by', null);

      if (deactivateErr) {
        console.error('Deactivate code failed:', deactivateErr);
        return new Response(JSON.stringify({ error: 'Nepavyko deaktyvuoti kodo' }), { status: 500, headers });
      }

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // === REMOVE MEMBER ===
    if (action === 'remove-member') {
      if (!appUser.fk_environment_id || appUser.role !== 'Administratorius') {
        return new Response(JSON.stringify({ error: 'Tik administratorius gali šalinti narius' }), { status: 403, headers });
      }

      const targetUserId = body.userId;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: 'Nenurodytas nario ID' }), { status: 400, headers });
      }

      if (targetUserId === appUser.id_user) {
        return new Response(JSON.stringify({ error: 'Negalima pašalinti savęs' }), { status: 400, headers });
      }

      const { data: targetUser } = await supabase
        .from('app_user')
        .select('id_user, fk_environment_id')
        .eq('id_user', targetUserId)
        .eq('fk_environment_id', appUser.fk_environment_id)
        .maybeSingle();

      if (!targetUser) {
        return new Response(JSON.stringify({ error: 'Narys nerastas šiame šaldytuve' }), { status: 404, headers });
      }

      const { error: removeErr } = await supabase
        .from('app_user')
        .update({ fk_environment_id: null, role: 'Member' })
        .eq('id_user', targetUserId);
      if (removeErr) {
        console.error('Remove member update failed:', removeErr);
        return new Response(JSON.stringify({ error: 'Nepavyko pašalinti nario' }), { status: 500, headers });
      }

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Vidine klaida' }),
      { status: 500, headers }
    );
  }
});
