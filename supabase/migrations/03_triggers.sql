-- ============================================
-- Robot Skills Store - Triggers
-- 03_triggers.sql - Triggers et fonctions associées
-- ============================================

-- ============================================
-- TRIGGER: Création automatique de profil
-- À la création d'un utilisateur dans auth.users
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer le profil
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Créer l'entrée user_roles par défaut
  INSERT INTO public.user_roles (user_id, is_developer, is_admin)
  VALUES (NEW.id, FALSE, FALSE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TRIGGER: Mise à jour automatique de updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur toutes les tables avec updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
  BEFORE UPDATE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oems_updated_at
  BEFORE UPDATE ON oems
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robot_models_updated_at
  BEFORE UPDATE ON robot_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_robots_updated_at
  BEFORE UPDATE ON robots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_versions_updated_at
  BEFORE UPDATE ON skill_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installations_updated_at
  BEFORE UPDATE ON installations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Log des événements d'audit
-- ============================================

CREATE OR REPLACE FUNCTION log_audit_event(
  p_event_type TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_events (
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    payload
  ) VALUES (
    auth.uid(),
    p_event_type,
    p_entity_type,
    p_entity_id,
    p_payload
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Audit sur les installations
-- ============================================

CREATE OR REPLACE FUNCTION audit_installation_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      'skill.installed',
      'installation',
      NEW.id,
      jsonb_build_object(
        'robot_id', NEW.robot_id,
        'skill_version_id', NEW.skill_version_id,
        'status', NEW.status
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM log_audit_event(
      CASE 
        WHEN NEW.status = 'removed' THEN 'skill.uninstalled'
        WHEN NEW.status = 'disabled' THEN 'skill.disabled'
        ELSE 'skill.status_changed'
      END,
      'installation',
      NEW.id,
      jsonb_build_object(
        'robot_id', NEW.robot_id,
        'skill_version_id', NEW.skill_version_id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_installation_changes
  AFTER INSERT OR UPDATE ON installations
  FOR EACH ROW
  EXECUTE FUNCTION audit_installation_change();

-- ============================================
-- TRIGGER: Audit sur les soumissions
-- ============================================

CREATE OR REPLACE FUNCTION audit_submission_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      'submission.created',
      'submission',
      NEW.id,
      jsonb_build_object(
        'skill_version_id', NEW.skill_version_id,
        'target_oem_id', NEW.target_oem_id,
        'status', NEW.status
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM log_audit_event(
      'submission.status_changed',
      'submission',
      NEW.id,
      jsonb_build_object(
        'skill_version_id', NEW.skill_version_id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_submission_changes
  AFTER INSERT OR UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION audit_submission_change();

-- ============================================
-- TRIGGER: Audit sur les téléchargements
-- ============================================

CREATE OR REPLACE FUNCTION audit_download()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_audit_event(
    'skill.downloaded',
    'download',
    NEW.id,
    jsonb_build_object(
      'skill_version_id', NEW.skill_version_id,
      'source', NEW.source
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_downloads
  AFTER INSERT ON downloads
  FOR EACH ROW
  EXECUTE FUNCTION audit_download();

-- ============================================
-- TRIGGER: Audit sur les appairages
-- ============================================

CREATE OR REPLACE FUNCTION audit_pairing_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      'robot.pairing_started',
      'robot_pairing_request',
      NEW.id,
      jsonb_build_object(
        'robot_id', NEW.robot_id,
        'expires_at', NEW.expires_at
      )
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.confirmed_at IS NOT NULL AND OLD.confirmed_at IS NULL THEN
    PERFORM log_audit_event(
      'robot.pairing_confirmed',
      'robot_pairing_request',
      NEW.id,
      jsonb_build_object(
        'robot_id', NEW.robot_id,
        'confirmed_by', NEW.confirmed_by
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_pairing_changes
  AFTER INSERT OR UPDATE ON robot_pairing_requests
  FOR EACH ROW
  EXECUTE FUNCTION audit_pairing_change();

-- ============================================
-- TRIGGER: Mise à jour du statut robot après pairing
-- ============================================

CREATE OR REPLACE FUNCTION update_robot_on_pairing()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le pairing est confirmé, mettre à jour le robot
  IF NEW.confirmed_at IS NOT NULL AND OLD.confirmed_at IS NULL THEN
    UPDATE robots
    SET 
      status = 'paired',
      paired_at = NEW.confirmed_at
    WHERE id = NEW.robot_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_robot_status_on_pairing
  AFTER UPDATE ON robot_pairing_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_robot_on_pairing();

-- ============================================
-- TRIGGER: Attribution automatique is_developer après licence
-- ============================================

CREATE OR REPLACE FUNCTION grant_developer_role_on_license()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour is_developer à TRUE
  UPDATE user_roles
  SET is_developer = TRUE
  WHERE user_id = NEW.user_id;
  
  -- Log l'événement
  PERFORM log_audit_event(
    'developer.license_granted',
    'developer_license',
    NEW.id,
    jsonb_build_object(
      'user_id', NEW.user_id,
      'lifetime', NEW.lifetime
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER grant_developer_on_license
  AFTER INSERT ON developer_licenses
  FOR EACH ROW
  EXECUTE FUNCTION grant_developer_role_on_license();

-- ============================================
-- TRIGGER: Révocation du rôle développeur si licence révoquée
-- ============================================

CREATE OR REPLACE FUNCTION revoke_developer_role_on_license()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la licence est révoquée
  IF NEW.revoked_at IS NOT NULL AND OLD.revoked_at IS NULL THEN
    UPDATE user_roles
    SET is_developer = FALSE
    WHERE user_id = NEW.user_id;
    
    -- Log l'événement
    PERFORM log_audit_event(
      'developer.license_revoked',
      'developer_license',
      NEW.id,
      jsonb_build_object(
        'user_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER revoke_developer_on_license
  AFTER UPDATE ON developer_licenses
  FOR EACH ROW
  EXECUTE FUNCTION revoke_developer_role_on_license();

-- ============================================
-- FIN DES TRIGGERS
-- ============================================
