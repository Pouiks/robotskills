-- =============================================
-- Migration 11: Interest Tracking & Site Stats
-- =============================================

-- Table pour tracker les visites globales sur le site
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  fingerprint TEXT -- Pour éviter les doublons (hash IP + user-agent)
);

-- Index pour les requêtes de comptage
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_fingerprint ON page_visits(fingerprint);

-- Table pour tracker les clics "intéressé" (bouton Explorer le Store)
CREATE TABLE IF NOT EXISTS interest_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  fingerprint TEXT, -- Pour éviter les doublons (hash IP + user-agent)
  source TEXT DEFAULT 'hero_cta', -- D'où vient le clic
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL -- Si connecté
);

-- Index pour les requêtes de comptage
CREATE INDEX idx_interest_clicks_clicked_at ON interest_clicks(clicked_at);
CREATE INDEX idx_interest_clicks_fingerprint ON interest_clicks(fingerprint);

-- Table pour les configs du site (constructeurs contactés, etc.)
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valeur initiale pour les constructeurs contactés (3 par défaut)
INSERT INTO site_config (key, value) VALUES 
  ('contacted_oems_count', '3'::jsonb),
  ('site_launch_date', '"2025-01-01"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS pour interest_clicks
ALTER TABLE interest_clicks ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut insérer un clic (anonyme ou connecté)
CREATE POLICY "Anyone can insert interest clicks"
ON interest_clicks FOR INSERT
WITH CHECK (true);

-- Seuls les admins peuvent voir les clics (pour analytics)
CREATE POLICY "Only admins can view interest clicks"
ON interest_clicks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- RLS pour site_config
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire la config
CREATE POLICY "Anyone can read site config"
ON site_config FOR SELECT
USING (true);

-- Seuls les admins peuvent modifier la config
CREATE POLICY "Only admins can update site config"
ON site_config FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Fonction pour compter les clics uniques (par fingerprint)
CREATE OR REPLACE FUNCTION count_unique_interest_clicks()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT COALESCE(fingerprint, id::text))
  FROM interest_clicks;
$$;

-- Fonction pour compter les visiteurs uniques
CREATE OR REPLACE FUNCTION count_unique_visitors()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT COALESCE(fingerprint, id::text))
  FROM page_visits;
$$;

-- RLS pour page_visits
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut insérer une visite
CREATE POLICY "Anyone can insert page visits"
ON page_visits FOR INSERT
WITH CHECK (true);

-- Seuls les admins peuvent voir les visites
CREATE POLICY "Only admins can view page visits"
ON page_visits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.is_admin = true
  )
);

-- Accorder l'exécution à tous
GRANT EXECUTE ON FUNCTION count_unique_interest_clicks() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION count_unique_visitors() TO anon, authenticated;
