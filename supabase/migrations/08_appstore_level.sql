-- ============================================
-- Robot Skills Store - App Store Level Enhancements
-- 08_appstore_level.sql - ADDITIVE MIGRATION (no breaking changes)
-- ============================================

-- ============================================
-- 1. EXTEND skills TABLE (App Store metadata)
-- ============================================

-- URLs de support (App Store requirement)
ALTER TABLE skills ADD COLUMN IF NOT EXISTS support_url TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS privacy_url TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS terms_url TEXT;

-- Publisher name (si différent de owner)
ALTER TABLE skills ADD COLUMN IF NOT EXISTS publisher_name TEXT;

-- Commentaires
COMMENT ON COLUMN skills.support_url IS 'URL de support/contact pour ce skill';
COMMENT ON COLUMN skills.privacy_url IS 'URL de politique de confidentialité';
COMMENT ON COLUMN skills.terms_url IS 'URL des conditions d''utilisation';
COMMENT ON COLUMN skills.publisher_name IS 'Nom de l''éditeur affiché publiquement';

-- ============================================
-- 2. EXTEND skill_versions TABLE
-- ============================================

-- Taille minimale de package requise pour soumission
ALTER TABLE skill_versions ADD COLUMN IF NOT EXISTS min_firmware_version TEXT;

-- Permissions demandées (liste explicite pour App Store)
ALTER TABLE skill_versions ADD COLUMN IF NOT EXISTS permissions_requested JSONB DEFAULT '[]'::jsonb;

-- Justification des permissions (obligatoire App Store)
ALTER TABLE skill_versions ADD COLUMN IF NOT EXISTS permissions_justification JSONB DEFAULT '{}'::jsonb;

-- Data usage declaration (App Store requirement)
ALTER TABLE skill_versions ADD COLUMN IF NOT EXISTS data_usage JSONB DEFAULT '{
  "collects_data": false,
  "data_types": [],
  "retention_days": null,
  "shares_with_third_parties": false,
  "endpoints": []
}'::jsonb;

COMMENT ON COLUMN skill_versions.permissions_requested IS 'Liste des permissions demandées par le skill';
COMMENT ON COLUMN skill_versions.permissions_justification IS 'Justification pour chaque permission (clé=permission, valeur=texte)';
COMMENT ON COLUMN skill_versions.data_usage IS 'Déclaration d''usage des données (App Store privacy labels)';

-- ============================================
-- 3. EXTEND submissions TABLE
-- ============================================

-- Résultat de la platform review automatique
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS platform_review_result JSONB;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS platform_review_at TIMESTAMPTZ;

-- Tracking de l'OEM reviewer
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS oem_reviewed_by UUID REFERENCES profiles(id);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS oem_reviewed_at TIMESTAMPTZ;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS oem_review_notes TEXT;

COMMENT ON COLUMN submissions.platform_review_result IS 'Résultat JSON de la validation automatique';
COMMENT ON COLUMN submissions.platform_review_at IS 'Date de la platform review';
COMMENT ON COLUMN submissions.oem_reviewed_by IS 'ID du reviewer OEM';
COMMENT ON COLUMN submissions.oem_reviewed_at IS 'Date de la décision OEM';
COMMENT ON COLUMN submissions.oem_review_notes IS 'Notes/commentaires de l''OEM';

-- ============================================
-- 4. CREATE notifications TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Notifications in-app pour les utilisateurs';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- RLS pour notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Policy: users can update (mark as read) their own notifications  
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: system can insert notifications (via SECURITY DEFINER functions)
-- No direct INSERT policy for users

-- ============================================
-- 5. HELPER FUNCTIONS FOR SUBMISSION WORKFLOW
-- ============================================

-- Function to transition submission status with validation
CREATE OR REPLACE FUNCTION transition_submission_status(
  p_submission_id UUID,
  p_new_status submission_status,
  p_notes TEXT DEFAULT NULL
)
RETURNS submissions AS $$
DECLARE
  v_submission submissions;
  v_current_status submission_status;
  v_valid_transition BOOLEAN := FALSE;
BEGIN
  -- Get current submission
  SELECT * INTO v_submission FROM submissions WHERE id = p_submission_id;
  
  IF v_submission IS NULL THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
  
  v_current_status := v_submission.status;
  
  -- Validate state machine transitions
  CASE v_current_status
    WHEN 'draft' THEN
      v_valid_transition := p_new_status IN ('submitted');
    WHEN 'submitted' THEN
      v_valid_transition := p_new_status IN ('platform_review');
    WHEN 'platform_review' THEN
      v_valid_transition := p_new_status IN ('oem_review', 'changes_requested');
    WHEN 'oem_review' THEN
      v_valid_transition := p_new_status IN ('approved', 'rejected', 'changes_requested');
    WHEN 'changes_requested' THEN
      v_valid_transition := p_new_status IN ('submitted');
    WHEN 'rejected' THEN
      v_valid_transition := FALSE; -- Terminal state
    WHEN 'approved' THEN
      v_valid_transition := FALSE; -- Terminal state
  END CASE;
  
  IF NOT v_valid_transition THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
  END IF;
  
  -- Update submission
  UPDATE submissions
  SET 
    status = p_new_status,
    platform_review_notes = CASE 
      WHEN p_new_status IN ('platform_review', 'changes_requested') AND p_notes IS NOT NULL 
      THEN p_notes 
      ELSE platform_review_notes 
    END,
    oem_review_notes = CASE 
      WHEN p_new_status IN ('approved', 'rejected', 'changes_requested') AND v_current_status = 'oem_review' AND p_notes IS NOT NULL 
      THEN p_notes 
      ELSE oem_review_notes 
    END,
    updated_at = NOW()
  WHERE id = p_submission_id
  RETURNING * INTO v_submission;
  
  -- Log audit event
  INSERT INTO audit_events (actor_user_id, event_type, entity_type, entity_id, payload)
  VALUES (
    auth.uid(),
    'submission.status_changed',
    'submission',
    p_submission_id,
    jsonb_build_object(
      'old_status', v_current_status,
      'new_status', p_new_status,
      'notes', p_notes
    )
  );
  
  RETURN v_submission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS notifications AS $$
DECLARE
  v_notification notifications;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, p_metadata)
  RETURNING * INTO v_notification;
  
  RETURN v_notification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. TRIGGER: Notify dev on submission status change
-- ============================================

CREATE OR REPLACE FUNCTION notify_submission_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_skill_name TEXT;
  v_dev_user_id UUID;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get skill name and dev user id
  SELECT s.name, s.owner_user_id INTO v_skill_name, v_dev_user_id
  FROM skill_versions sv
  JOIN skills s ON s.id = sv.skill_id
  WHERE sv.id = NEW.skill_version_id;
  
  -- Skip if no owner user (org-owned skills handled differently)
  IF v_dev_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Create notification based on new status
  CASE NEW.status
    WHEN 'platform_review' THEN
      v_title := 'Soumission en cours de review';
      v_message := format('Votre skill "%s" est en cours de validation automatique.', v_skill_name);
    WHEN 'oem_review' THEN
      v_title := 'Soumission envoyée à l''OEM';
      v_message := format('Votre skill "%s" a passé la validation et est maintenant en review OEM.', v_skill_name);
    WHEN 'approved' THEN
      v_title := 'Soumission approuvée !';
      v_message := format('Félicitations ! Votre skill "%s" a été approuvé et sera bientôt disponible.', v_skill_name);
    WHEN 'rejected' THEN
      v_title := 'Soumission rejetée';
      v_message := format('Votre skill "%s" a été rejeté. Consultez les commentaires pour plus de détails.', v_skill_name);
    WHEN 'changes_requested' THEN
      v_title := 'Modifications demandées';
      v_message := format('Des modifications sont requises pour votre skill "%s".', v_skill_name);
    ELSE
      RETURN NEW;
  END CASE;
  
  -- Create the notification
  PERFORM create_notification(
    v_dev_user_id,
    'submission.' || NEW.status,
    v_title,
    v_message,
    '/dev/submissions/' || NEW.id::TEXT,
    jsonb_build_object('submission_id', NEW.id, 'skill_name', v_skill_name)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_submission_status ON submissions;
CREATE TRIGGER trigger_notify_submission_status
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_submission_status_change();

-- ============================================
-- 7. VIEW: Submissions with full details (for OEM portal)
-- ============================================

CREATE OR REPLACE VIEW v_submissions_detail AS
SELECT 
  sub.id,
  sub.skill_version_id,
  sub.submitted_by,
  sub.target_oem_id,
  sub.status,
  sub.platform_review_notes,
  sub.platform_review_result,
  sub.platform_review_at,
  sub.oem_reviewed_by,
  sub.oem_reviewed_at,
  sub.oem_review_notes,
  sub.created_at,
  sub.updated_at,
  -- Skill version info
  sv.version,
  sv.manifest,
  sv.release_notes,
  sv.risk_level,
  sv.permissions_requested,
  sv.permissions_justification,
  sv.data_usage,
  -- Skill info
  s.id AS skill_id,
  s.name AS skill_name,
  s.slug AS skill_slug,
  s.short_description,
  s.description_md,
  s.category,
  s.icon_path,
  s.publisher_name,
  s.support_url,
  s.privacy_url,
  -- Submitter info
  p.display_name AS submitter_name,
  p.email AS submitter_email,
  -- OEM info
  o.brand_name AS oem_name,
  org.name AS oem_org_name,
  -- Package info
  pkg.storage_path AS package_path,
  pkg.size_bytes AS package_size,
  pkg.checksum_sha256 AS package_checksum
FROM submissions sub
JOIN skill_versions sv ON sv.id = sub.skill_version_id
JOIN skills s ON s.id = sv.skill_id
JOIN profiles p ON p.id = sub.submitted_by
LEFT JOIN oems o ON o.id = sub.target_oem_id
LEFT JOIN organizations org ON org.id = sub.target_oem_id
LEFT JOIN skill_packages pkg ON pkg.skill_version_id = sv.id;

-- ============================================
-- 8. INDEX OPTIMIZATIONS
-- ============================================

-- Index for finding submissions by OEM (for OEM portal)
CREATE INDEX IF NOT EXISTS idx_submissions_oem_status 
  ON submissions(target_oem_id, status) 
  WHERE target_oem_id IS NOT NULL;

-- Index for dev's submissions
CREATE INDEX IF NOT EXISTS idx_submissions_submitter_status
  ON submissions(submitted_by, status);

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
