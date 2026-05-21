-- Push notification token storage
-- Kiekvienas device'as turi savo Expo push token.
-- Vienas user gali tureti kelis tokenus (telefonas + tabletas).

CREATE TABLE IF NOT EXISTS public.push_token (
  id          SERIAL PRIMARY KEY,
  auth_uid    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT NOT NULL DEFAULT 'unknown',
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(auth_uid, token)
);

-- RLS
ALTER TABLE public.push_token ENABLE ROW LEVEL SECURITY;

-- User mato tik savo tokenus
CREATE POLICY "Users can view own tokens"
  ON public.push_token FOR SELECT
  USING (auth.uid() = auth_uid);

CREATE POLICY "Users can insert own tokens"
  ON public.push_token FOR INSERT
  WITH CHECK (auth.uid() = auth_uid);

CREATE POLICY "Users can update own tokens"
  ON public.push_token FOR UPDATE
  USING (auth.uid() = auth_uid);

CREATE POLICY "Users can delete own tokens"
  ON public.push_token FOR DELETE
  USING (auth.uid() = auth_uid);

-- Index greitam lookup pagal auth_uid
CREATE INDEX idx_push_token_auth_uid ON public.push_token(auth_uid);
