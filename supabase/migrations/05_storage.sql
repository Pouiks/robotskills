-- ============================================
-- Robot Skills Store - Storage Policies
-- 05_storage.sql - Buckets et policies storage
-- ============================================

-- ============================================
-- CRÉER LES BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('skill-icons', 'skill-icons', true, 524288, ARRAY['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']),
  ('skill-assets', 'skill-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']),
  ('skill-packages', 'skill-packages', false, 104857600, ARRAY['application/zip', 'application/x-zip-compressed']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('org-logos', 'org-logos', true, 1048576, ARRAY['image/png', 'image/svg+xml', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Bucket: skill-icons (public read, owner write)
CREATE POLICY "Skill icons are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'skill-icons');

CREATE POLICY "Skill owners can upload icons"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'skill-icons' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id::text = (storage.foldername(name))[1]
      AND (
        skills.owner_user_id = auth.uid() OR
        (skills.owner_org_id IS NOT NULL AND is_org_member(skills.owner_org_id))
      )
    )
  );

CREATE POLICY "Skill owners can update icons"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'skill-icons' AND
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id::text = (storage.foldername(name))[1]
      AND (
        skills.owner_user_id = auth.uid() OR
        (skills.owner_org_id IS NOT NULL AND is_org_member(skills.owner_org_id))
      )
    )
  );

CREATE POLICY "Skill owners can delete icons"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'skill-icons' AND
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id::text = (storage.foldername(name))[1]
      AND (
        skills.owner_user_id = auth.uid() OR
        (skills.owner_org_id IS NOT NULL AND is_org_member(skills.owner_org_id))
      )
    )
  );

-- Bucket: skill-assets (public read, owner write)
CREATE POLICY "Skill assets are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'skill-assets');

CREATE POLICY "Skill owners can upload assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'skill-assets' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id::text = (storage.foldername(name))[1]
      AND (
        skills.owner_user_id = auth.uid() OR
        (skills.owner_org_id IS NOT NULL AND is_org_member(skills.owner_org_id))
      )
    )
  );

CREATE POLICY "Skill owners can update assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'skill-assets' AND
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id::text = (storage.foldername(name))[1]
      AND (
        skills.owner_user_id = auth.uid() OR
        (skills.owner_org_id IS NOT NULL AND is_org_member(skills.owner_org_id))
      )
    )
  );

CREATE POLICY "Skill owners can delete assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'skill-assets' AND
    EXISTS (
      SELECT 1 FROM skills
      WHERE skills.id::text = (storage.foldername(name))[1]
      AND (
        skills.owner_user_id = auth.uid() OR
        (skills.owner_org_id IS NOT NULL AND is_org_member(skills.owner_org_id))
      )
    )
  );

-- Bucket: skill-packages (private, signed URLs only)
CREATE POLICY "Skill owners can upload packages"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'skill-packages' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM skill_versions sv
      JOIN skills s ON s.id = sv.skill_id
      WHERE sv.id::text = (storage.foldername(name))[1]
      AND (
        s.owner_user_id = auth.uid() OR
        (s.owner_org_id IS NOT NULL AND is_org_member(s.owner_org_id))
      )
    )
  );

CREATE POLICY "Admins can read all packages"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'skill-packages' AND
    is_admin()
  );

-- Bucket: avatars (public read, user write own)
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Bucket: org-logos (public read, org admin write)
CREATE POLICY "Org logos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'org-logos');

CREATE POLICY "Org admins can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'org-logos' AND
    has_org_role((storage.foldername(name))[1]::uuid, 'admin')
  );

CREATE POLICY "Org admins can update logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'org-logos' AND
    has_org_role((storage.foldername(name))[1]::uuid, 'admin')
  );

CREATE POLICY "Org admins can delete logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'org-logos' AND
    has_org_role((storage.foldername(name))[1]::uuid, 'admin')
  );

-- ============================================
-- FIN DES POLICIES STORAGE
-- ============================================
