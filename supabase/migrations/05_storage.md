# Supabase Storage - Configuration

## Buckets à créer

Créez les buckets suivants dans Supabase Dashboard > Storage :

### 1. `skill-icons`
- **Usage** : Icônes des skills (PNG, SVG)
- **Public** : Oui (lecture publique)
- **Max file size** : 512KB
- **Allowed MIME types** : `image/png`, `image/svg+xml`, `image/jpeg`, `image/webp`

### 2. `skill-assets`
- **Usage** : Screenshots, vidéos, bannières des skills
- **Public** : Oui (lecture publique)
- **Max file size** : 10MB
- **Allowed MIME types** : `image/png`, `image/jpeg`, `image/webp`, `video/mp4`, `video/webm`

### 3. `skill-packages`
- **Usage** : Packages ZIP des skills
- **Public** : Non (accès via signed URLs)
- **Max file size** : 100MB
- **Allowed MIME types** : `application/zip`, `application/x-zip-compressed`

### 4. `avatars`
- **Usage** : Avatars des utilisateurs
- **Public** : Oui (lecture publique)
- **Max file size** : 2MB
- **Allowed MIME types** : `image/png`, `image/jpeg`, `image/webp`

### 5. `org-logos`
- **Usage** : Logos des organisations
- **Public** : Oui (lecture publique)
- **Max file size** : 1MB
- **Allowed MIME types** : `image/png`, `image/svg+xml`, `image/jpeg`

---

## SQL pour les policies Storage

Exécutez ce SQL dans l'éditeur SQL de Supabase après avoir créé les buckets :

```sql
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
-- Lecture via signed URLs uniquement (pas de policy SELECT publique)

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
```

---

## Structure des fichiers

### skill-icons
```
skill-icons/
  └── {skill_id}/
      └── icon.png
```

### skill-assets
```
skill-assets/
  └── {skill_id}/
      ├── screenshot-1.png
      ├── screenshot-2.png
      ├── banner.png
      └── video.mp4
```

### skill-packages
```
skill-packages/
  └── {skill_version_id}/
      └── package.zip
```

### avatars
```
avatars/
  └── {user_id}/
      └── avatar.png
```

### org-logos
```
org-logos/
  └── {org_id}/
      └── logo.png
```

---

## Création des buckets via SQL (optionnel)

Si vous préférez créer les buckets via SQL :

```sql
-- Créer les buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('skill-icons', 'skill-icons', true, 524288, ARRAY['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']),
  ('skill-assets', 'skill-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']),
  ('skill-packages', 'skill-packages', false, 104857600, ARRAY['application/zip', 'application/x-zip-compressed']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('org-logos', 'org-logos', true, 1048576, ARRAY['image/png', 'image/svg+xml', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;
```

---

## Génération de Signed URLs

Pour télécharger des packages (bucket privé), utilisez les signed URLs via Edge Function ou server-side :

```typescript
// Exemple côté serveur
const { data, error } = await supabase.storage
  .from('skill-packages')
  .createSignedUrl(`${skillVersionId}/package.zip`, 3600) // 1 heure

if (data?.signedUrl) {
  // Rediriger vers l'URL signée
}
```

---

## Notes importantes

1. **Les packages sont privés** : Ils ne sont accessibles que via signed URLs générées côté serveur après vérification de l'authentification.

2. **Structure de dossiers** : Utilisez les IDs comme noms de dossiers pour faciliter les policies RLS.

3. **Nettoyage** : Implémentez un job de nettoyage pour supprimer les fichiers orphelins.

4. **CDN** : Les buckets publics bénéficient automatiquement du CDN Supabase.
