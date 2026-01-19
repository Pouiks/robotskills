-- ============================================
-- Robot Skills Store - Skill Compatibility
-- 09_skill_compatibility.sql
-- Permet aux développeurs de déclarer les OEMs/modèles compatibles
-- ============================================

-- ============================================
-- TABLE: skill_oem_compatibility
-- Compatibilité déclarée par le développeur
-- ============================================

CREATE TABLE IF NOT EXISTS skill_oem_compatibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  oem_id UUID NOT NULL REFERENCES oems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (skill_id, oem_id)
);

COMMENT ON TABLE skill_oem_compatibility IS 'OEMs compatibles déclarés par le développeur pour chaque skill';

-- Index pour recherche rapide
CREATE INDEX idx_skill_oem_compat_skill ON skill_oem_compatibility(skill_id);
CREATE INDEX idx_skill_oem_compat_oem ON skill_oem_compatibility(oem_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE skill_oem_compatibility ENABLE ROW LEVEL SECURITY;

-- Lecture publique (pour afficher la compatibilité dans le store)
CREATE POLICY "Skill compatibility is publicly readable"
  ON skill_oem_compatibility FOR SELECT
  USING (true);

-- Les développeurs peuvent gérer la compatibilité de leurs skills
CREATE POLICY "Developers can manage own skill compatibility"
  ON skill_oem_compatibility FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id = skill_oem_compatibility.skill_id
      AND skills.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can delete own skill compatibility"
  ON skill_oem_compatibility FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id = skill_oem_compatibility.skill_id
      AND skills.owner_user_id = auth.uid()
    )
  );
