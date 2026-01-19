# Supabase - Configuration pour Robot Skills Store

## Structure des fichiers

```
supabase/
└── migrations/
    ├── 01_schema.sql      # Tables, indexes, constraints, enums
    ├── 02_rls.sql         # Row Level Security policies
    ├── 03_triggers.sql    # Triggers (auto-profil, audit, updated_at)
    ├── 04_rpc.sql         # Fonctions RPC (pairing, install, etc.)
    ├── 05_storage.sql     # Buckets et policies storage
    ├── 05_storage.md      # Documentation storage
    └── 06_seed.sql        # Données de démonstration
```

## Installation

### Option 1 : Exécution manuelle (recommandé pour le POC)

1. Allez dans **Supabase Dashboard** > **SQL Editor**

2. Exécutez les scripts **dans l'ordre** :
   - `01_schema.sql`
   - `02_rls.sql`
   - `03_triggers.sql`
   - `04_rpc.sql`
   - `05_storage.sql`
   - `06_seed.sql` (optionnel, pour les données de démo)

### Option 2 : Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Lier au projet
supabase link --project-ref ealdpyuevhhbzvcvevdk

# Appliquer les migrations
supabase db push
```

## Configuration Auth

### Activer les providers OAuth

1. **Supabase Dashboard** > **Authentication** > **Providers**

2. Activer **Google** :
   - Client ID et Secret depuis Google Cloud Console
   - Redirect URL : `https://ealdpyuevhhbzvcvevdk.supabase.co/auth/v1/callback`

3. Activer **GitHub** :
   - Client ID et Secret depuis GitHub Developer Settings
   - Redirect URL : `https://ealdpyuevhhbzvcvevdk.supabase.co/auth/v1/callback`

4. Activer **Email** (OTP/Magic Link) :
   - Activé par défaut

### Configuration Email Templates

Personnalisez les templates dans **Authentication** > **Email Templates** :
- Confirmation
- Magic Link
- Reset Password

## Variables d'environnement

Créez un fichier `.env.local` dans le projet Next.js :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ealdpyuevhhbzvcvevdk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre_anon_key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Récupérez les clés dans **Project Settings** > **API**.

## Vérification

Après l'exécution des scripts, vérifiez :

1. **Tables créées** : Database > Tables (18 tables)
2. **RLS activé** : Chaque table doit avoir RLS enabled
3. **Policies** : Authentication > Policies
4. **Buckets** : Storage (5 buckets)
5. **Functions** : Database > Functions

## Test rapide

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Vérifier RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Vérifier les fonctions RPC
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```

## Dépannage

### Erreur "function is_admin() does not exist"

Exécutez d'abord `02_rls.sql` qui contient les fonctions helper.

### Erreur sur les policies storage

Assurez-vous que les buckets sont créés avant d'appliquer les policies.

### Trigger sur auth.users échoue

Vérifiez que vous avez les permissions sur le schéma `auth`.

## Données de test

Le fichier `06_seed.sql` crée :
- 3 organisations OEM (RoboTech, AutoBot, MechaWorks)
- 5 modèles de robots
- 1 studio de démo
- 8 skills publiés avec versions

Pour créer un utilisateur de test :
1. Créez un compte via l'interface Auth
2. Attribuez-lui des rôles via SQL :

```sql
-- Faire d'un utilisateur un admin
UPDATE user_roles SET is_admin = true 
WHERE user_id = '<user_uuid>';

-- Faire d'un utilisateur un développeur
UPDATE user_roles SET is_developer = true 
WHERE user_id = '<user_uuid>';

-- Ajouter à une organisation OEM
INSERT INTO organization_members (org_id, user_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', '<user_uuid>', 'admin');
```
