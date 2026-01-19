-- ============================================
-- Robot Skills Store - Alignement Documentation
-- 09_alignment_doc.sql - ADDITIVE MIGRATION
-- Aligne le code avec le cahier des charges fonctionnel
-- ============================================

-- ============================================
-- 1. AJOUTER 'critical' AU RISK_LEVEL ENUM
-- ============================================

-- Note: PostgreSQL ne permet pas d'ajouter une valeur à un enum facilement
-- On utilise ALTER TYPE ... ADD VALUE
ALTER TYPE risk_level ADD VALUE IF NOT EXISTS 'critical';

-- ============================================
-- 2. TABLE: submission_targets (Multi-OEM)
-- Permet de soumettre un skill à plusieurs OEMs
-- ============================================

CREATE TABLE IF NOT EXISTS submission_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  oem_id UUID NOT NULL REFERENCES oems(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'changes_requested')),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES profiles(id),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Une soumission ne peut cibler qu'une fois le même OEM
  UNIQUE(submission_id, oem_id)
);

COMMENT ON TABLE submission_targets IS 'Cibles OEM pour chaque soumission (support Multi-OEM)';
COMMENT ON COLUMN submission_targets.status IS 'Statut de review par cet OEM spécifique';
COMMENT ON COLUMN submission_targets.reviewer_notes IS 'Notes/feedback du reviewer OEM';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_submission_targets_submission ON submission_targets(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_targets_oem ON submission_targets(oem_id);
CREATE INDEX IF NOT EXISTS idx_submission_targets_status ON submission_targets(status);

-- ============================================
-- 3. TABLE: purchases (Achats de skills)
-- Enregistre les achats simulés de skills payants
-- ============================================

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  skill_version_id UUID REFERENCES skill_versions(id),
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'refunded', 'failed')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Un utilisateur ne peut acheter qu'une fois le même skill
  UNIQUE(user_id, skill_id)
);

COMMENT ON TABLE purchases IS 'Historique des achats de skills (simulation POC)';
COMMENT ON COLUMN purchases.price_cents IS 'Prix payé en centimes';
COMMENT ON COLUMN purchases.payment_reference IS 'Référence de paiement simulée';
COMMENT ON COLUMN purchases.payment_status IS 'Statut du paiement';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_skill ON purchases(skill_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);

-- ============================================
-- 4. RLS POLICIES pour submission_targets
-- ============================================

ALTER TABLE submission_targets ENABLE ROW LEVEL SECURITY;

-- Développeurs peuvent voir leurs propres targets (via submission)
CREATE POLICY "Developers can view own submission targets"
  ON submission_targets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = submission_targets.submission_id
      AND s.submitted_by = auth.uid()
    )
  );

-- OEM partners peuvent voir les targets pour leur OEM
CREATE POLICY "OEM partners can view their targets"
  ON submission_targets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      JOIN organizations o ON o.id = om.org_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'oem'
      AND submission_targets.oem_id = o.id
    )
  );

-- OEM partners peuvent mettre à jour les targets de leur OEM
CREATE POLICY "OEM partners can update their targets"
  ON submission_targets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      JOIN organizations o ON o.id = om.org_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'oem'
      AND om.role IN ('owner', 'admin', 'reviewer')
      AND submission_targets.oem_id = o.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      JOIN organizations o ON o.id = om.org_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'oem'
      AND om.role IN ('owner', 'admin', 'reviewer')
      AND submission_targets.oem_id = o.id
    )
  );

-- Admins ont accès total
CREATE POLICY "Admins can manage all submission targets"
  ON submission_targets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- ============================================
-- 5. RLS POLICIES pour purchases
-- ============================================

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Utilisateurs peuvent voir leurs propres achats
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (user_id = auth.uid());

-- Utilisateurs peuvent créer leurs propres achats (via simulation)
CREATE POLICY "Users can create own purchases"
  ON purchases FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins ont accès total
CREATE POLICY "Admins can manage all purchases"
  ON purchases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- ============================================
-- 6. FONCTION: Créer submission avec targets Multi-OEM
-- ============================================

CREATE OR REPLACE FUNCTION create_submission_with_targets(
  p_skill_version_id UUID,
  p_oem_ids UUID[]
)
RETURNS submissions AS $$
DECLARE
  v_submission submissions;
  v_oem_id UUID;
BEGIN
  -- Vérifier qu'au moins un OEM est fourni
  IF array_length(p_oem_ids, 1) IS NULL OR array_length(p_oem_ids, 1) = 0 THEN
    RAISE EXCEPTION 'At least one OEM must be specified';
  END IF;

  -- Créer la soumission principale
  INSERT INTO submissions (skill_version_id, submitted_by, status)
  VALUES (p_skill_version_id, auth.uid(), 'draft')
  RETURNING * INTO v_submission;

  -- Créer un target pour chaque OEM
  FOREACH v_oem_id IN ARRAY p_oem_ids
  LOOP
    INSERT INTO submission_targets (submission_id, oem_id, status)
    VALUES (v_submission.id, v_oem_id, 'pending');
  END LOOP;

  -- Log audit
  INSERT INTO audit_events (actor_user_id, event_type, entity_type, entity_id, payload)
  VALUES (
    auth.uid(),
    'submission.created_multi_oem',
    'submission',
    v_submission.id,
    jsonb_build_object(
      'oem_count', array_length(p_oem_ids, 1),
      'oem_ids', p_oem_ids
    )
  );

  RETURN v_submission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. FONCTION: Vérifier si un skill est acheté
-- ============================================

CREATE OR REPLACE FUNCTION has_purchased_skill(p_skill_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM purchases
    WHERE user_id = auth.uid()
    AND skill_id = p_skill_id
    AND payment_status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. FONCTION: Simuler un achat de skill
-- ============================================

CREATE OR REPLACE FUNCTION simulate_purchase(
  p_skill_id UUID,
  p_price_cents INTEGER DEFAULT 0
)
RETURNS purchases AS $$
DECLARE
  v_purchase purchases;
  v_skill skills;
BEGIN
  -- Vérifier que le skill existe
  SELECT * INTO v_skill FROM skills WHERE id = p_skill_id;
  IF v_skill IS NULL THEN
    RAISE EXCEPTION 'Skill not found';
  END IF;

  -- Vérifier que l'utilisateur n'a pas déjà acheté ce skill
  IF has_purchased_skill(p_skill_id) THEN
    RAISE EXCEPTION 'Skill already purchased';
  END IF;

  -- Créer l'achat simulé
  INSERT INTO purchases (user_id, skill_id, price_cents, payment_reference, payment_status)
  VALUES (
    auth.uid(),
    p_skill_id,
    p_price_cents,
    'POC_SIM_' || extract(epoch from now())::text,
    'completed'
  )
  RETURNING * INTO v_purchase;

  -- Log audit
  INSERT INTO audit_events (actor_user_id, event_type, entity_type, entity_id, payload)
  VALUES (
    auth.uid(),
    'skill.purchased',
    'skill',
    p_skill_id,
    jsonb_build_object(
      'price_cents', p_price_cents,
      'purchase_id', v_purchase.id
    )
  );

  RETURN v_purchase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. TRIGGER: Mettre à jour updated_at sur submission_targets
-- ============================================

CREATE OR REPLACE FUNCTION update_submission_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_submission_targets_updated_at ON submission_targets;
CREATE TRIGGER trigger_update_submission_targets_updated_at
  BEFORE UPDATE ON submission_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_submission_targets_updated_at();

-- ============================================
-- 10. VIEW: Soumissions avec détails Multi-OEM
-- ============================================

CREATE OR REPLACE VIEW v_submissions_multi_oem AS
SELECT 
  s.id AS submission_id,
  s.skill_version_id,
  s.submitted_by,
  s.status AS submission_status,
  s.created_at AS submission_created_at,
  sv.version,
  sk.id AS skill_id,
  sk.name AS skill_name,
  sk.slug AS skill_slug,
  -- Aggregation des targets
  COUNT(st.id) AS target_count,
  COUNT(CASE WHEN st.status = 'approved' THEN 1 END) AS approved_count,
  COUNT(CASE WHEN st.status = 'rejected' THEN 1 END) AS rejected_count,
  COUNT(CASE WHEN st.status = 'pending' THEN 1 END) AS pending_count,
  -- Le skill est publiable si au moins un target est approved
  BOOL_OR(st.status = 'approved') AS is_publishable,
  -- JSON array des targets avec détails
  jsonb_agg(
    jsonb_build_object(
      'target_id', st.id,
      'oem_id', st.oem_id,
      'oem_name', o.brand_name,
      'status', st.status,
      'reviewed_at', st.reviewed_at,
      'reviewer_notes', st.reviewer_notes
    )
  ) AS targets
FROM submissions s
JOIN skill_versions sv ON sv.id = s.skill_version_id
JOIN skills sk ON sk.id = sv.skill_id
LEFT JOIN submission_targets st ON st.submission_id = s.id
LEFT JOIN oems o ON o.id = st.oem_id
GROUP BY s.id, s.skill_version_id, s.submitted_by, s.status, s.created_at,
         sv.version, sk.id, sk.name, sk.slug;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
