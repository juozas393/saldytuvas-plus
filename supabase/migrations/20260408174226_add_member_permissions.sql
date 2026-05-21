-- PAA10: Šeimos narių teisių valdymas (pirminis apply)
--
-- Originali migracija, kuri sukūrė `member_permissions` lentelę ir pagrindines
-- RLS politikas. Ši lentelė laiko kiekvieno šeimos nario teises konkrečioje
-- aplinkoje (environment): ar gali pridėti produktus, redaguoti inventorių,
-- matyti biudžetą, redaguoti mitybos planą ir t. t.
--
-- Naudojama: `mobile/src/features/family/repositories/permissions.repository.ts`
-- per `loadForMember` ir `save` metodus.

CREATE TABLE IF NOT EXISTS public.member_permissions (
  id BIGSERIAL PRIMARY KEY,
  fk_environment_id INTEGER NOT NULL REFERENCES public.environment(id_environment) ON DELETE CASCADE,
  fk_user_id INTEGER NOT NULL REFERENCES public.app_user(id_user) ON DELETE CASCADE,
  can_add_products BOOLEAN NOT NULL DEFAULT TRUE,
  can_edit_inventory BOOLEAN NOT NULL DEFAULT TRUE,
  can_delete_products BOOLEAN NOT NULL DEFAULT FALSE,
  can_view_budget BOOLEAN NOT NULL DEFAULT TRUE,
  can_edit_meal_plan BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fk_environment_id, fk_user_id)
);

ALTER TABLE public.member_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_view_permissions" ON public.member_permissions
  FOR SELECT USING (
    fk_environment_id IN (
      SELECT fk_environment_id FROM public.app_user WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY "admin_manage_permissions" ON public.member_permissions
  FOR ALL USING (
    fk_environment_id IN (
      SELECT id_environment FROM public.environment
      WHERE fk_administrator_id = (SELECT id_user FROM public.app_user WHERE auth_uid = auth.uid())
    )
  );
