-- PAA10: Šeimos narių teisių valdymas
--
-- `member_permissions` lentelė laiko kiekvieno šeimos nario teises konkrečioje
-- aplinkoje (environment). Lentelę rankiniu būdu sukūrė administratorius
-- tiesiogiai per Supabase dashboard (dar prieš pradedant versionuoti
-- migracijas), todėl ji jau egzistuoja gamyboje. Šis migracijos failas
-- užfiksuoja dabartinę schemą kodo repozitorijoje, kad iš kodo būtų galima
-- pilnai atkurti duomenų bazę (be „migration drift").
--
-- Naudotojas: `mobile/src/features/family/repositories/permissions.repository.ts`
-- jau naudoja šią lentelę per `loadForMember` ir `save` metodus.

-- 1. Pati lentelė - IF NOT EXISTS kad nesugestume jau egzistuojančios eilutės
CREATE TABLE IF NOT EXISTS public.member_permissions (
    id                  BIGSERIAL PRIMARY KEY,
    fk_environment_id   INTEGER NOT NULL REFERENCES public.environment(id_environment) ON DELETE CASCADE,
    fk_user_id          INTEGER NOT NULL REFERENCES public.app_user(id_user) ON DELETE CASCADE,
    can_add_products    BOOLEAN NOT NULL DEFAULT true,
    can_edit_inventory  BOOLEAN NOT NULL DEFAULT true,
    can_delete_products BOOLEAN NOT NULL DEFAULT false,
    can_view_budget     BOOLEAN NOT NULL DEFAULT true,
    can_edit_meal_plan  BOOLEAN NOT NULL DEFAULT false,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT member_permissions_fk_environment_id_fk_user_id_key
        UNIQUE (fk_environment_id, fk_user_id)
);

-- 2. Row-Level Security įjungimas
ALTER TABLE public.member_permissions ENABLE ROW LEVEL SECURITY;

-- 3. RLS politikos
-- PostgreSQL neturi `CREATE POLICY IF NOT EXISTS`, todėl pirma DROP, tada CREATE.

-- 3.1. SELECT: bet kuris tos pačios aplinkos narys gali matyti teises.
-- Naudinga, kad eilinis naudotojas žinotų, ką jis gali daryti.
DROP POLICY IF EXISTS members_view_permissions ON public.member_permissions;
CREATE POLICY members_view_permissions
    ON public.member_permissions
    FOR SELECT
    USING (
        fk_environment_id IN (
            SELECT app_user.fk_environment_id
            FROM public.app_user
            WHERE app_user.auth_uid = auth.uid()
        )
    );

-- 3.2. ALL (INSERT/UPDATE/DELETE): tik aplinkos administratorius gali keisti
-- savo šeimos narių teises. Tikrinama per `environment.fk_administrator_id`.
DROP POLICY IF EXISTS admin_manage_permissions ON public.member_permissions;
CREATE POLICY admin_manage_permissions
    ON public.member_permissions
    FOR ALL
    USING (
        fk_environment_id IN (
            SELECT environment.id_environment
            FROM public.environment
            WHERE environment.fk_administrator_id = (
                SELECT app_user.id_user
                FROM public.app_user
                WHERE app_user.auth_uid = auth.uid()
            )
        )
    );

-- 4. Indeksai greitesnei paieškai pagal narį
CREATE INDEX IF NOT EXISTS idx_member_permissions_user
    ON public.member_permissions(fk_user_id);
CREATE INDEX IF NOT EXISTS idx_member_permissions_environment
    ON public.member_permissions(fk_environment_id);
