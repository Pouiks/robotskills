-- ============================================
-- Robot Skills Store - Schema SQL
-- 01_schema.sql - Tables, indexes, constraints
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS (Types personnalisés)
-- ============================================

-- Type d'organisation
CREATE TYPE org_type AS ENUM ('oem', 'studio');

-- Rôle dans une organisation
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'reviewer', 'member');

-- Statut d'un robot
CREATE TYPE robot_status AS ENUM ('unpaired', 'pending', 'paired', 'revoked');

-- Statut d'un skill
CREATE TYPE skill_status AS ENUM ('draft', 'published', 'suspended');

-- Type d'asset
CREATE TYPE asset_type AS ENUM ('screenshot', 'video', 'banner');

-- Niveau de risque
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- Visibilité d'une version
CREATE TYPE visibility_level AS ENUM ('private', 'beta', 'public');

-- Statut d'une soumission
CREATE TYPE submission_status AS ENUM (
  'draft', 
  'submitted', 
  'platform_review', 
  'oem_review', 
  'approved', 
  'rejected', 
  'changes_requested'
);

-- Décision OEM
CREATE TYPE oem_decision AS ENUM ('approved', 'rejected', 'changes_requested');

-- Statut d'installation
CREATE TYPE installation_status AS ENUM ('installed', 'removed', 'disabled');

-- ============================================
-- TABLE: profiles
-- Profil utilisateur (lié à auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Profils utilisateurs liés à auth.users';

-- Index pour recherche par email
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================
-- TABLE: user_roles
-- Rôles utilisateur (developer, admin)
-- ============================================
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_developer BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_roles IS 'Rôles globaux des utilisateurs';

-- ============================================
-- TABLE: organizations
-- Organisations (OEM, studios)
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type org_type NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE organizations IS 'Organisations partenaires (OEM, studios)';

-- Index sur le slug
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_type ON organizations(type);

-- ============================================
-- TABLE: organization_members
-- Membres des organisations
-- ============================================
CREATE TABLE organization_members (
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

COMMENT ON TABLE organization_members IS 'Appartenance des utilisateurs aux organisations';

-- Index pour recherche par user
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- ============================================
-- TABLE: oems
-- Détails spécifiques aux OEM (1:1 avec organizations)
-- ============================================
CREATE TABLE oems (
  id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  website TEXT,
  support_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE oems IS 'Informations spécifiques aux constructeurs OEM';

-- ============================================
-- TABLE: robot_models
-- Modèles de robots par OEM
-- ============================================
CREATE TABLE robot_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oem_id UUID NOT NULL REFERENCES oems(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  model_code TEXT,
  capabilities JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (oem_id, model_name)
);

COMMENT ON TABLE robot_models IS 'Modèles de robots disponibles par OEM';

-- Index pour recherche par OEM
CREATE INDEX idx_robot_models_oem ON robot_models(oem_id);

-- ============================================
-- TABLE: robots
-- Robots des utilisateurs
-- ============================================
CREATE TABLE robots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  oem_id UUID NOT NULL REFERENCES oems(id),
  robot_model_id UUID NOT NULL REFERENCES robot_models(id),
  robot_identifier TEXT NOT NULL,
  nickname TEXT,
  status robot_status NOT NULL DEFAULT 'unpaired',
  paired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (oem_id, robot_identifier)
);

COMMENT ON TABLE robots IS 'Robots enregistrés par les utilisateurs';

-- Index pour recherche
CREATE INDEX idx_robots_user ON robots(user_id);
CREATE INDEX idx_robots_status ON robots(status);
CREATE INDEX idx_robots_identifier ON robots(robot_identifier);

-- ============================================
-- TABLE: robot_pairing_requests
-- Requêtes d'appairage en cours
-- ============================================
CREATE TABLE robot_pairing_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  confirmed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE robot_pairing_requests IS 'Requêtes d''appairage avec challenge/code';

-- Index pour recherche
CREATE INDEX idx_pairing_robot ON robot_pairing_requests(robot_id);
CREATE INDEX idx_pairing_challenge ON robot_pairing_requests(challenge);
CREATE INDEX idx_pairing_expires ON robot_pairing_requests(expires_at);

-- ============================================
-- TABLE: skills
-- Skills/addons publiés
-- ============================================
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  owner_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description_md TEXT,
  category TEXT,
  icon_path TEXT,
  status skill_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Un skill doit avoir soit un owner_user_id soit un owner_org_id
  CONSTRAINT skills_owner_check CHECK (
    (owner_user_id IS NOT NULL AND owner_org_id IS NULL) OR
    (owner_user_id IS NULL AND owner_org_id IS NOT NULL)
  )
);

COMMENT ON TABLE skills IS 'Skills et addons de la marketplace';

-- Index pour recherche
CREATE INDEX idx_skills_slug ON skills(slug);
CREATE INDEX idx_skills_owner_user ON skills(owner_user_id);
CREATE INDEX idx_skills_owner_org ON skills(owner_org_id);
CREATE INDEX idx_skills_status ON skills(status);
CREATE INDEX idx_skills_category ON skills(category);

-- Full-text search index
CREATE INDEX idx_skills_search ON skills 
  USING GIN (to_tsvector('french', coalesce(name, '') || ' ' || coalesce(short_description, '')));

-- ============================================
-- TABLE: skill_assets
-- Assets (screenshots, vidéos, bannières)
-- ============================================
CREATE TABLE skill_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE skill_assets IS 'Assets visuels des skills';

-- Index pour recherche
CREATE INDEX idx_skill_assets_skill ON skill_assets(skill_id);

-- ============================================
-- TABLE: skill_versions
-- Versions des skills
-- ============================================
CREATE TABLE skill_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  manifest JSONB NOT NULL,
  release_notes TEXT,
  risk_level risk_level NOT NULL DEFAULT 'low',
  visibility visibility_level NOT NULL DEFAULT 'private',
  is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (skill_id, version)
);

COMMENT ON TABLE skill_versions IS 'Versions des skills avec manifest';

-- Index pour recherche
CREATE INDEX idx_skill_versions_skill ON skill_versions(skill_id);
CREATE INDEX idx_skill_versions_visibility ON skill_versions(visibility);

-- ============================================
-- TABLE: skill_packages
-- Packages uploadés (ZIP)
-- ============================================
CREATE TABLE skill_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_version_id UUID NOT NULL REFERENCES skill_versions(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  signature TEXT,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE skill_packages IS 'Packages de skills (fichiers ZIP)';

-- Index pour recherche
CREATE INDEX idx_skill_packages_version ON skill_packages(skill_version_id);

-- ============================================
-- TABLE: submissions
-- Soumissions pour review
-- ============================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_version_id UUID NOT NULL REFERENCES skill_versions(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  target_oem_id UUID REFERENCES oems(id),
  status submission_status NOT NULL DEFAULT 'draft',
  platform_review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE submissions IS 'Soumissions de skills pour validation';

-- Index pour recherche
CREATE INDEX idx_submissions_version ON submissions(skill_version_id);
CREATE INDEX idx_submissions_submitter ON submissions(submitted_by);
CREATE INDEX idx_submissions_oem ON submissions(target_oem_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- ============================================
-- TABLE: oem_reviews
-- Reviews par les OEM
-- ============================================
CREATE TABLE oem_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  oem_org_id UUID NOT NULL REFERENCES organizations(id),
  reviewer_user_id UUID NOT NULL REFERENCES profiles(id),
  decision oem_decision NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE oem_reviews IS 'Reviews et décisions des OEM sur les soumissions';

-- Index pour recherche
CREATE INDEX idx_oem_reviews_submission ON oem_reviews(submission_id);
CREATE INDEX idx_oem_reviews_oem ON oem_reviews(oem_org_id);

-- ============================================
-- TABLE: downloads
-- Historique des téléchargements
-- ============================================
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_version_id UUID NOT NULL REFERENCES skill_versions(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT DEFAULT 'web'
);

COMMENT ON TABLE downloads IS 'Historique des téléchargements de skills';

-- Index pour recherche et unicité logique
CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_version ON downloads(skill_version_id);
CREATE INDEX idx_downloads_user_version ON downloads(user_id, skill_version_id);

-- ============================================
-- TABLE: installations
-- Skills installés sur les robots
-- ============================================
CREATE TABLE installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  robot_id UUID NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  skill_version_id UUID NOT NULL REFERENCES skill_versions(id) ON DELETE CASCADE,
  status installation_status NOT NULL DEFAULT 'installed',
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (robot_id, skill_version_id)
);

COMMENT ON TABLE installations IS 'Skills installés sur les robots des utilisateurs';

-- Index pour recherche
CREATE INDEX idx_installations_robot ON installations(robot_id);
CREATE INDEX idx_installations_version ON installations(skill_version_id);
CREATE INDEX idx_installations_status ON installations(status);

-- ============================================
-- TABLE: developer_licenses
-- Licences développeur
-- ============================================
CREATE TABLE developer_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  lifetime BOOLEAN NOT NULL DEFAULT TRUE,
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE developer_licenses IS 'Licences développeur à vie';

-- Index pour recherche
CREATE INDEX idx_dev_licenses_user ON developer_licenses(user_id);
CREATE INDEX idx_dev_licenses_token ON developer_licenses(token_hash);

-- ============================================
-- TABLE: audit_events
-- Journal d'audit
-- ============================================
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES profiles(id),
  actor_org_id UUID REFERENCES organizations(id),
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  payload JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_events IS 'Journal d''audit des événements critiques';

-- Index pour recherche
CREATE INDEX idx_audit_actor_user ON audit_events(actor_user_id);
CREATE INDEX idx_audit_event_type ON audit_events(event_type);
CREATE INDEX idx_audit_created_at ON audit_events(created_at);
CREATE INDEX idx_audit_entity ON audit_events(entity_type, entity_id);

-- ============================================
-- FIN DU SCHEMA
-- ============================================
