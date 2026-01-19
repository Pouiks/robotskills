-- ============================================
-- Robot Skills Store - Row Level Security
-- 02_rls.sql - Enable RLS + Policies
-- ============================================

-- ============================================
-- ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE oems ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE robots ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_pairing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oem_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur est développeur
CREATE OR REPLACE FUNCTION is_developer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND is_developer = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier l'appartenance à une organisation
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_members.org_id = is_org_member.org_id 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier le rôle dans une organisation
CREATE OR REPLACE FUNCTION has_org_role(org_id UUID, required_role org_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_members.org_id = has_org_role.org_id 
    AND user_id = auth.uid()
    AND (
      role = required_role OR
      role = 'owner' OR
      (role = 'admin' AND required_role IN ('reviewer', 'member'))
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLICIES: profiles
-- ============================================

-- Lecture de son propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Modification de son propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- ============================================
-- POLICIES: user_roles
-- ============================================

-- Lecture de ses propres rôles
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Les admins peuvent gérer les rôles
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (is_admin());

-- ============================================
-- POLICIES: organizations
-- ============================================

-- Lecture publique des organisations
CREATE POLICY "Organizations are publicly readable"
  ON organizations FOR SELECT
  USING (TRUE);

-- Modification par les owners/admins de l'org
CREATE POLICY "Org owners can update"
  ON organizations FOR UPDATE
  USING (has_org_role(id, 'admin'));

-- Création par les admins plateforme uniquement
CREATE POLICY "Platform admins can create orgs"
  ON organizations FOR INSERT
  WITH CHECK (is_admin());

-- ============================================
-- POLICIES: organization_members
-- ============================================

-- Lecture par les membres de l'org
CREATE POLICY "Org members can view membership"
  ON organization_members FOR SELECT
  USING (is_org_member(org_id) OR is_admin());

-- Gestion par les owners/admins de l'org
CREATE POLICY "Org admins can manage members"
  ON organization_members FOR ALL
  USING (has_org_role(org_id, 'admin') OR is_admin());

-- ============================================
-- POLICIES: oems
-- ============================================

-- Lecture publique des OEM
CREATE POLICY "OEMs are publicly readable"
  ON oems FOR SELECT
  USING (TRUE);

-- Modification par les admins de l'OEM
CREATE POLICY "OEM admins can update"
  ON oems FOR UPDATE
  USING (has_org_role(id, 'admin'));

-- ============================================
-- POLICIES: robot_models
-- ============================================

-- Lecture publique des modèles
CREATE POLICY "Robot models are publicly readable"
  ON robot_models FOR SELECT
  USING (TRUE);

-- Gestion par les admins de l'OEM
CREATE POLICY "OEM admins can manage models"
  ON robot_models FOR ALL
  USING (has_org_role(oem_id, 'admin'));

-- ============================================
-- POLICIES: robots
-- ============================================

-- Lecture de ses propres robots
CREATE POLICY "Users can view own robots"
  ON robots FOR SELECT
  USING (auth.uid() = user_id);

-- Création de ses propres robots
CREATE POLICY "Users can create own robots"
  ON robots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Modification de ses propres robots
CREATE POLICY "Users can update own robots"
  ON robots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression de ses propres robots
CREATE POLICY "Users can delete own robots"
  ON robots FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: robot_pairing_requests
-- ============================================

-- Lecture de ses propres requêtes de pairing
CREATE POLICY "Users can view own pairing requests"
  ON robot_pairing_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM robots 
      WHERE robots.id = robot_pairing_requests.robot_id 
      AND robots.user_id = auth.uid()
    )
  );

-- Création via fonction RPC uniquement (pas de policy INSERT directe)
-- La fonction start_pairing gère la création

-- ============================================
-- POLICIES: skills
-- ============================================

-- Lecture publique des skills publiés
CREATE POLICY "Published skills are publicly readable"
  ON skills FOR SELECT
  USING (
    status = 'published' OR
    owner_user_id = auth.uid() OR
    (owner_org_id IS NOT NULL AND is_org_member(owner_org_id)) OR
    is_admin()
  );

-- Création par les développeurs
CREATE POLICY "Developers can create skills"
  ON skills FOR INSERT
  WITH CHECK (
    is_developer() AND 
    (owner_user_id = auth.uid() OR 
     (owner_org_id IS NOT NULL AND is_org_member(owner_org_id)))
  );

-- Modification par le propriétaire
CREATE POLICY "Owners can update skills"
  ON skills FOR UPDATE
  USING (
    owner_user_id = auth.uid() OR
    (owner_org_id IS NOT NULL AND has_org_role(owner_org_id, 'admin')) OR
    is_admin()
  );

-- Suppression par le propriétaire (draft uniquement)
CREATE POLICY "Owners can delete draft skills"
  ON skills FOR DELETE
  USING (
    status = 'draft' AND (
      owner_user_id = auth.uid() OR
      (owner_org_id IS NOT NULL AND has_org_role(owner_org_id, 'admin'))
    )
  );

-- ============================================
-- POLICIES: skill_assets
-- ============================================

-- Lecture des assets des skills visibles
CREATE POLICY "Skill assets follow skill visibility"
  ON skill_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM skills 
      WHERE skills.id = skill_assets.skill_id
      AND (
        skills.status = 'published' OR
        skills.owner_user_id = auth.uid() OR
        (skills.owner_org_id IS NOT NULL AND is_org_member(skills.owner_org_id))
      )
    )
  );

-- Gestion par le propriétaire du skill
CREATE POLICY "Skill owners can manage assets"
  ON skill_assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM skills 
      WHERE skills.id = skill_assets.skill_id
      AND (
        skills.owner_user_id = auth.uid() OR
        (skills.owner_org_id IS NOT NULL AND has_org_role(skills.owner_org_id, 'admin'))
      )
    )
  );

-- ============================================
-- POLICIES: skill_versions
-- ============================================

-- Lecture des versions selon visibilité
CREATE POLICY "Skill versions follow visibility rules"
  ON skill_versions FOR SELECT
  USING (
    -- Version publique d'un skill publié
    (visibility = 'public' AND EXISTS (
      SELECT 1 FROM skills WHERE skills.id = skill_versions.skill_id AND skills.status = 'published'
    )) OR
    -- Propriétaire du skill
    EXISTS (
      SELECT 1 FROM skills 
      WHERE skills.id = skill_versions.skill_id
      AND (skills.owner_user_id = auth.uid() OR 
           (skills.owner_org_id IS NOT NULL AND is_org_member(skills.owner_org_id)))
    ) OR
    is_admin()
  );

-- Gestion par le propriétaire
CREATE POLICY "Skill owners can manage versions"
  ON skill_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM skills 
      WHERE skills.id = skill_versions.skill_id
      AND (
        skills.owner_user_id = auth.uid() OR
        (skills.owner_org_id IS NOT NULL AND has_org_role(skills.owner_org_id, 'admin'))
      )
    )
  );

-- ============================================
-- POLICIES: skill_packages
-- ============================================

-- Lecture des packages selon visibilité de la version
CREATE POLICY "Packages follow version visibility"
  ON skill_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM skill_versions sv
      JOIN skills s ON s.id = sv.skill_id
      WHERE sv.id = skill_packages.skill_version_id
      AND (
        (sv.visibility = 'public' AND s.status = 'published') OR
        s.owner_user_id = auth.uid() OR
        (s.owner_org_id IS NOT NULL AND is_org_member(s.owner_org_id)) OR
        is_admin()
      )
    )
  );

-- Gestion par le propriétaire
CREATE POLICY "Skill owners can manage packages"
  ON skill_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM skill_versions sv
      JOIN skills s ON s.id = sv.skill_id
      WHERE sv.id = skill_packages.skill_version_id
      AND (
        s.owner_user_id = auth.uid() OR
        (s.owner_org_id IS NOT NULL AND has_org_role(s.owner_org_id, 'admin'))
      )
    )
  );

-- ============================================
-- POLICIES: submissions
-- ============================================

-- Lecture par le soumetteur
CREATE POLICY "Submitters can view own submissions"
  ON submissions FOR SELECT
  USING (
    submitted_by = auth.uid() OR
    -- OEM ciblé peut voir
    (target_oem_id IS NOT NULL AND is_org_member(target_oem_id)) OR
    is_admin()
  );

-- Création par le propriétaire du skill
CREATE POLICY "Skill owners can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM skill_versions sv
      JOIN skills s ON s.id = sv.skill_id
      WHERE sv.id = skill_version_id
      AND (s.owner_user_id = auth.uid() OR 
           (s.owner_org_id IS NOT NULL AND is_org_member(s.owner_org_id)))
    )
  );

-- Modification par le soumetteur (draft seulement)
CREATE POLICY "Submitters can update draft submissions"
  ON submissions FOR UPDATE
  USING (
    (submitted_by = auth.uid() AND status = 'draft') OR
    is_admin()
  );

-- ============================================
-- POLICIES: oem_reviews
-- ============================================

-- Lecture par l'OEM et le soumetteur
CREATE POLICY "OEM members and submitters can view reviews"
  ON oem_reviews FOR SELECT
  USING (
    is_org_member(oem_org_id) OR
    EXISTS (
      SELECT 1 FROM submissions 
      WHERE submissions.id = oem_reviews.submission_id 
      AND submissions.submitted_by = auth.uid()
    ) OR
    is_admin()
  );

-- Création par les reviewers OEM
CREATE POLICY "OEM reviewers can create reviews"
  ON oem_reviews FOR INSERT
  WITH CHECK (
    has_org_role(oem_org_id, 'reviewer') AND
    reviewer_user_id = auth.uid()
  );

-- ============================================
-- POLICIES: downloads
-- ============================================

-- Lecture de ses propres téléchargements
CREATE POLICY "Users can view own downloads"
  ON downloads FOR SELECT
  USING (user_id = auth.uid());

-- Création (téléchargement) par utilisateurs connectés
CREATE POLICY "Authenticated users can download"
  ON downloads FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

-- ============================================
-- POLICIES: installations
-- ============================================

-- Lecture de ses propres installations
CREATE POLICY "Users can view own installations"
  ON installations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM robots 
      WHERE robots.id = installations.robot_id 
      AND robots.user_id = auth.uid()
    )
  );

-- Gestion de ses propres installations
CREATE POLICY "Users can manage own installations"
  ON installations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM robots 
      WHERE robots.id = installations.robot_id 
      AND robots.user_id = auth.uid()
    )
  );

-- ============================================
-- POLICIES: developer_licenses
-- ============================================

-- Lecture de sa propre licence
CREATE POLICY "Users can view own license"
  ON developer_licenses FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Création par admins uniquement (ou via fonction RPC pour achat)
CREATE POLICY "Admins can manage licenses"
  ON developer_licenses FOR ALL
  USING (is_admin());

-- ============================================
-- POLICIES: audit_events
-- ============================================

-- Lecture par admins uniquement
CREATE POLICY "Only admins can view audit logs"
  ON audit_events FOR SELECT
  USING (is_admin());

-- Insertion par le système (via fonctions SECURITY DEFINER)
-- Pas de policy INSERT pour les utilisateurs normaux

-- ============================================
-- FIN DES POLICIES RLS
-- ============================================
