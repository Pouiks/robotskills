-- ============================================
-- Robot Skills Store - Fonctions RPC
-- 04_rpc.sql - Fonctions appelables via Supabase
-- ============================================

-- ============================================
-- FONCTION: start_pairing
-- Démarre le processus d'appairage d'un robot
-- ============================================

CREATE OR REPLACE FUNCTION start_pairing(p_robot_id UUID)
RETURNS TABLE (
  challenge TEXT,
  code TEXT,
  expires_at TIMESTAMPTZ
) AS $$
DECLARE
  v_challenge TEXT;
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_robot_user_id UUID;
BEGIN
  -- Vérifier que le robot appartient à l'utilisateur
  SELECT user_id INTO v_robot_user_id
  FROM robots
  WHERE id = p_robot_id;
  
  IF v_robot_user_id IS NULL THEN
    RAISE EXCEPTION 'Robot not found';
  END IF;
  
  IF v_robot_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: robot does not belong to user';
  END IF;
  
  -- Vérifier que le robot n'est pas déjà appairé
  IF EXISTS (SELECT 1 FROM robots WHERE id = p_robot_id AND status = 'paired') THEN
    RAISE EXCEPTION 'Robot is already paired';
  END IF;
  
  -- Supprimer les anciennes requêtes expirées
  DELETE FROM robot_pairing_requests
  WHERE robot_id = p_robot_id AND expires_at < NOW();
  
  -- Générer un challenge unique (32 caractères hex)
  v_challenge := encode(gen_random_bytes(16), 'hex');
  
  -- Générer un code à 6 chiffres
  v_code := LPAD(floor(random() * 1000000)::TEXT, 6, '0');
  
  -- Expiration dans 10 minutes
  v_expires_at := NOW() + INTERVAL '10 minutes';
  
  -- Créer la requête de pairing
  INSERT INTO robot_pairing_requests (robot_id, challenge, code, expires_at)
  VALUES (p_robot_id, v_challenge, v_code, v_expires_at);
  
  -- Mettre à jour le statut du robot
  UPDATE robots SET status = 'pending' WHERE id = p_robot_id;
  
  RETURN QUERY SELECT v_challenge, v_code, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: confirm_pairing
-- Confirme l'appairage (appelé par l'app OEM/robot)
-- ============================================

CREATE OR REPLACE FUNCTION confirm_pairing(
  p_challenge TEXT,
  p_code TEXT,
  p_robot_identifier TEXT,
  p_confirmed_by TEXT DEFAULT 'oem_app'
)
RETURNS TABLE (
  success BOOLEAN,
  robot_id UUID,
  message TEXT
) AS $$
DECLARE
  v_request robot_pairing_requests%ROWTYPE;
  v_robot robots%ROWTYPE;
BEGIN
  -- Trouver la requête de pairing
  SELECT pr.* INTO v_request
  FROM robot_pairing_requests pr
  JOIN robots r ON r.id = pr.robot_id
  WHERE pr.challenge = p_challenge
    AND r.robot_identifier = p_robot_identifier
    AND pr.expires_at > NOW()
    AND pr.confirmed_at IS NULL;
  
  IF v_request.id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Invalid or expired pairing request'::TEXT;
    RETURN;
  END IF;
  
  -- Vérifier le code
  IF v_request.code != p_code THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Invalid code'::TEXT;
    RETURN;
  END IF;
  
  -- Confirmer le pairing
  UPDATE robot_pairing_requests
  SET 
    confirmed_at = NOW(),
    confirmed_by = p_confirmed_by
  WHERE id = v_request.id;
  
  -- Le trigger update_robot_on_pairing mettra à jour le robot
  
  RETURN QUERY SELECT TRUE, v_request.robot_id, 'Pairing confirmed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: revoke_robot
-- Révoque l'appairage d'un robot
-- ============================================

CREATE OR REPLACE FUNCTION revoke_robot(p_robot_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_robot_user_id UUID;
BEGIN
  -- Vérifier que le robot appartient à l'utilisateur
  SELECT user_id INTO v_robot_user_id
  FROM robots
  WHERE id = p_robot_id;
  
  IF v_robot_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: robot does not belong to user';
  END IF;
  
  -- Révoquer le robot
  UPDATE robots
  SET 
    status = 'revoked',
    paired_at = NULL
  WHERE id = p_robot_id;
  
  -- Désactiver toutes les installations
  UPDATE installations
  SET status = 'disabled'
  WHERE robot_id = p_robot_id AND status = 'installed';
  
  -- Log l'événement
  PERFORM log_audit_event(
    'robot.revoked',
    'robot',
    p_robot_id,
    NULL
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: create_download_record
-- Enregistre un téléchargement et retourne le path storage
-- ============================================

CREATE OR REPLACE FUNCTION create_download_record(p_skill_version_id UUID)
RETURNS TABLE (
  download_id UUID,
  storage_path TEXT,
  filename TEXT
) AS $$
DECLARE
  v_download_id UUID;
  v_storage_path TEXT;
  v_skill_name TEXT;
  v_version TEXT;
BEGIN
  -- Vérifier que l'utilisateur est connecté
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: must be logged in to download';
  END IF;
  
  -- Vérifier que la version est publique et le skill publié
  IF NOT EXISTS (
    SELECT 1 
    FROM skill_versions sv
    JOIN skills s ON s.id = sv.skill_id
    WHERE sv.id = p_skill_version_id
      AND sv.visibility = 'public'
      AND s.status = 'published'
      AND sv.is_disabled = FALSE
  ) THEN
    RAISE EXCEPTION 'Skill version not available for download';
  END IF;
  
  -- Récupérer les infos du package
  SELECT sp.storage_path, s.name, sv.version
  INTO v_storage_path, v_skill_name, v_version
  FROM skill_packages sp
  JOIN skill_versions sv ON sv.id = sp.skill_version_id
  JOIN skills s ON s.id = sv.skill_id
  WHERE sv.id = p_skill_version_id
  LIMIT 1;
  
  IF v_storage_path IS NULL THEN
    RAISE EXCEPTION 'No package available for this version';
  END IF;
  
  -- Créer l'enregistrement de téléchargement
  INSERT INTO downloads (user_id, skill_version_id, source)
  VALUES (auth.uid(), p_skill_version_id, 'web')
  RETURNING id INTO v_download_id;
  
  RETURN QUERY SELECT 
    v_download_id,
    v_storage_path,
    (v_skill_name || '-' || v_version || '.zip')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: install_skill
-- Installe un skill sur un robot
-- ============================================

CREATE OR REPLACE FUNCTION install_skill(
  p_robot_id UUID,
  p_skill_version_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_installation_id UUID;
  v_robot_user_id UUID;
BEGIN
  -- Vérifier que le robot appartient à l'utilisateur
  SELECT user_id INTO v_robot_user_id
  FROM robots
  WHERE id = p_robot_id AND status = 'paired';
  
  IF v_robot_user_id IS NULL THEN
    RAISE EXCEPTION 'Robot not found or not paired';
  END IF;
  
  IF v_robot_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: robot does not belong to user';
  END IF;
  
  -- Vérifier que la version est disponible
  IF NOT EXISTS (
    SELECT 1 
    FROM skill_versions sv
    JOIN skills s ON s.id = sv.skill_id
    WHERE sv.id = p_skill_version_id
      AND sv.visibility = 'public'
      AND s.status = 'published'
      AND sv.is_disabled = FALSE
  ) THEN
    RAISE EXCEPTION 'Skill version not available';
  END IF;
  
  -- Créer ou mettre à jour l'installation
  INSERT INTO installations (robot_id, skill_version_id, status)
  VALUES (p_robot_id, p_skill_version_id, 'installed')
  ON CONFLICT (robot_id, skill_version_id) 
  DO UPDATE SET 
    status = 'installed',
    installed_at = NOW(),
    removed_at = NULL
  RETURNING id INTO v_installation_id;
  
  RETURN v_installation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: uninstall_skill
-- Désinstalle un skill d'un robot
-- ============================================

CREATE OR REPLACE FUNCTION uninstall_skill(
  p_robot_id UUID,
  p_skill_version_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_robot_user_id UUID;
BEGIN
  -- Vérifier que le robot appartient à l'utilisateur
  SELECT user_id INTO v_robot_user_id
  FROM robots
  WHERE id = p_robot_id;
  
  IF v_robot_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: robot does not belong to user';
  END IF;
  
  -- Mettre à jour l'installation
  UPDATE installations
  SET 
    status = 'removed',
    removed_at = NOW()
  WHERE robot_id = p_robot_id 
    AND skill_version_id = p_skill_version_id
    AND status = 'installed';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: submit_skill_version
-- Soumet une version pour review
-- ============================================

CREATE OR REPLACE FUNCTION submit_skill_version(
  p_skill_version_id UUID,
  p_target_oem_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_submission_id UUID;
  v_skill_owner_id UUID;
  v_skill_org_id UUID;
BEGIN
  -- Récupérer les infos du skill
  SELECT s.owner_user_id, s.owner_org_id
  INTO v_skill_owner_id, v_skill_org_id
  FROM skill_versions sv
  JOIN skills s ON s.id = sv.skill_id
  WHERE sv.id = p_skill_version_id;
  
  -- Vérifier l'ownership
  IF v_skill_owner_id IS NOT NULL AND v_skill_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: not the skill owner';
  END IF;
  
  IF v_skill_org_id IS NOT NULL AND NOT is_org_member(v_skill_org_id) THEN
    RAISE EXCEPTION 'Unauthorized: not a member of the owning organization';
  END IF;
  
  -- Créer la soumission
  INSERT INTO submissions (skill_version_id, submitted_by, target_oem_id, status)
  VALUES (p_skill_version_id, auth.uid(), p_target_oem_id, 'submitted')
  RETURNING id INTO v_submission_id;
  
  RETURN v_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: oem_review_submission
-- Permet à un OEM de reviewer une soumission
-- ============================================

CREATE OR REPLACE FUNCTION oem_review_submission(
  p_submission_id UUID,
  p_decision oem_decision,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_review_id UUID;
  v_target_oem_id UUID;
  v_new_status submission_status;
BEGIN
  -- Récupérer l'OEM ciblé
  SELECT target_oem_id INTO v_target_oem_id
  FROM submissions
  WHERE id = p_submission_id AND status = 'oem_review';
  
  IF v_target_oem_id IS NULL THEN
    RAISE EXCEPTION 'Submission not found or not in OEM review status';
  END IF;
  
  -- Vérifier que l'utilisateur est reviewer de l'OEM
  IF NOT has_org_role(v_target_oem_id, 'reviewer') THEN
    RAISE EXCEPTION 'Unauthorized: not a reviewer for this OEM';
  END IF;
  
  -- Créer la review
  INSERT INTO oem_reviews (submission_id, oem_org_id, reviewer_user_id, decision, notes)
  VALUES (p_submission_id, v_target_oem_id, auth.uid(), p_decision, p_notes)
  RETURNING id INTO v_review_id;
  
  -- Mettre à jour le statut de la soumission
  v_new_status := CASE p_decision
    WHEN 'approved' THEN 'approved'::submission_status
    WHEN 'rejected' THEN 'rejected'::submission_status
    WHEN 'changes_requested' THEN 'changes_requested'::submission_status
  END;
  
  UPDATE submissions
  SET status = v_new_status
  WHERE id = p_submission_id;
  
  -- Si approuvé, publier le skill
  IF p_decision = 'approved' THEN
    UPDATE skills s
    SET status = 'published'
    FROM skill_versions sv
    WHERE sv.skill_id = s.id
      AND sv.id = (SELECT skill_version_id FROM submissions WHERE id = p_submission_id);
    
    UPDATE skill_versions
    SET visibility = 'public'
    WHERE id = (SELECT skill_version_id FROM submissions WHERE id = p_submission_id);
  END IF;
  
  RETURN v_review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: disable_skill_version (Admin Kill Switch)
-- Désactive une version de skill (admin only)
-- ============================================

CREATE OR REPLACE FUNCTION disable_skill_version(
  p_skill_version_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;
  
  -- Désactiver la version
  UPDATE skill_versions
  SET is_disabled = TRUE
  WHERE id = p_skill_version_id;
  
  -- Désactiver toutes les installations de cette version
  UPDATE installations
  SET status = 'disabled'
  WHERE skill_version_id = p_skill_version_id AND status = 'installed';
  
  -- Log l'événement
  PERFORM log_audit_event(
    'admin.skill_version_disabled',
    'skill_version',
    p_skill_version_id,
    jsonb_build_object('reason', p_reason)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: issue_developer_license (Admin)
-- Émet une licence développeur
-- ============================================

CREATE OR REPLACE FUNCTION issue_developer_license(
  p_user_id UUID,
  p_payment_reference TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_license_id UUID;
  v_token TEXT;
  v_token_hash TEXT;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;
  
  -- Vérifier que l'utilisateur n'a pas déjà une licence
  IF EXISTS (SELECT 1 FROM developer_licenses WHERE user_id = p_user_id AND revoked_at IS NULL) THEN
    RAISE EXCEPTION 'User already has an active developer license';
  END IF;
  
  -- Générer un token unique
  v_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := encode(digest(v_token, 'sha256'), 'hex');
  
  -- Créer la licence
  INSERT INTO developer_licenses (user_id, token_hash, payment_reference)
  VALUES (p_user_id, v_token_hash, p_payment_reference)
  RETURNING id INTO v_license_id;
  
  -- Le trigger grant_developer_on_license attribuera le rôle
  
  RETURN v_license_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: get_my_stats
-- Récupère les statistiques de l'utilisateur connecté
-- ============================================

CREATE OR REPLACE FUNCTION get_my_stats()
RETURNS TABLE (
  robots_count BIGINT,
  paired_robots_count BIGINT,
  installations_count BIGINT,
  downloads_count BIGINT,
  skills_count BIGINT,
  submissions_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM robots WHERE user_id = auth.uid()),
    (SELECT COUNT(*) FROM robots WHERE user_id = auth.uid() AND status = 'paired'),
    (SELECT COUNT(*) FROM installations i 
     JOIN robots r ON r.id = i.robot_id 
     WHERE r.user_id = auth.uid() AND i.status = 'installed'),
    (SELECT COUNT(*) FROM downloads WHERE user_id = auth.uid()),
    (SELECT COUNT(*) FROM skills WHERE owner_user_id = auth.uid()),
    (SELECT COUNT(*) FROM submissions WHERE submitted_by = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIN DES FONCTIONS RPC
-- ============================================
