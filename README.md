# RobotSkills - Robot Skills Store

Une marketplace de skills et addons pour robots, avec un système de validation par les constructeurs (OEM).

## 🚀 Stack Technique

- **Framework**: Next.js 14+ (App Router)
- **Langage**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Postgres, Storage, Edge Functions)
- **Validation**: Zod
- **Icons**: Lucide React

## 📁 Structure du Projet

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── (auth)/            # Routes d'authentification
│   ├── admin/             # Backoffice admin
│   ├── api/               # API routes
│   ├── dashboard/         # Espace utilisateur
│   ├── dev/               # Portail développeur
│   ├── oem/               # Portail OEM/Partenaire
│   ├── skills/            # Pages détail skill
│   ├── store/             # Store public
│   └── layout.tsx         # Layout principal
├── components/
│   ├── common/            # Composants réutilisables
│   ├── layout/            # Header, Footer
│   ├── skills/            # Composants skills
│   └── ui/                # Composants shadcn/ui
├── lib/
│   ├── supabase/          # Clients Supabase (client, server, middleware)
│   ├── validators/        # Schémas Zod
│   └── utils.ts           # Utilitaires
├── server/                # Server actions
├── types/                 # Types TypeScript
└── middleware.ts          # Middleware Next.js (auth)
```

## 🛠️ Installation

### Prérequis

- Node.js 18+
- npm ou pnpm
- Compte Supabase

### 1. Cloner et installer

```bash
git clone <repo-url>
cd robotstore
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Copiez `.env.example` vers `.env.local`
3. Remplissez les variables d'environnement :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site URL (pour les redirections OAuth)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Configuration OAuth (optionnel)

Pour activer la connexion Google/GitHub :

1. Dans Supabase Dashboard > Authentication > Providers
2. Activez Google et/ou GitHub
3. Configurez les credentials OAuth

### 4. Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📜 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur de production |
| `npm run lint` | Lance ESLint |
| `npm run lint:fix` | Corrige les erreurs ESLint |
| `npm run format` | Formate le code avec Prettier |
| `npm run typecheck` | Vérifie les types TypeScript |
| `npm run test` | Lance les tests en mode watch |
| `npm run test:run` | Lance les tests une seule fois |

## 🗄️ Base de Données

Le schéma de base de données est défini dans `/docs/cdc.md`. Les tables principales sont :

- `profiles` - Profils utilisateurs
- `user_roles` - Rôles (developer, admin)
- `organizations` - Organisations (OEM, studios)
- `robots` - Robots des utilisateurs
- `skills` - Skills/addons
- `skill_versions` - Versions des skills
- `submissions` - Soumissions pour review
- `installations` - Skills installés sur les robots

## 🔐 Sécurité

- **RLS (Row Level Security)** : Toutes les tables sont protégées par des politiques RLS
- **Middleware** : Les routes protégées nécessitent une authentification
- **Server Actions** : La logique métier est côté serveur
- **URLs signées** : Les fichiers sont servis via URLs Supabase signées

## 📋 Phases de Développement

- [x] **Phase 0** : Fondations (structure, UI, layout)
- [x] **Phase 1** : Auth + Store public
- [x] **Phase 2** : Robots + Pairing + Library
- [x] **Phase 3** : Programme développeur + Soumissions (voir ci-dessous)
- [ ] **Phase 4** : Espace OEM
- [ ] **Phase 5** : Sécurité renforcée + Admin

## 👨‍💻 Flux Développeur

Le programme développeur permet aux utilisateurs de publier leurs propres skills sur la marketplace.

### Devenir Développeur

1. Accédez à `/dashboard/developer`
2. Cliquez sur "Activer ma licence (Simulation)"
3. **Important** : Sauvegardez le token affiché, il ne sera plus visible ensuite
4. Vous avez maintenant accès au portail développeur `/dev`

### Créer et Soumettre un Skill

1. **Portail Développeur** (`/dev`) - Vue d'ensemble de vos skills et soumissions
2. **Nouveau Skill** (`/dev/skills/new`) - Assistant 6 étapes :
   - **Identité** : Nom, slug, catégorie, descriptions
   - **Médias** : Icône (obligatoire), screenshots (3-10), vidéo (optionnel)
   - **Compatibilité** : Sélection des OEMs compatibles
   - **Permissions** : Déclaration avec justifications obligatoires
   - **Package** : Upload ZIP, manifest JSON, checksum SHA256
   - **Review** : Récapitulatif et soumission

### Processus de Validation

```
Draft → Submitted → Platform Review → OEM Review → Approved/Rejected
                          ↓
                   Changes Requested → (corrections) → Submitted
```

1. **Validation automatique** (Platform Review)
   - Vérification du manifest JSON
   - Contrôle du package (présence, taille, checksum)
   - Cohérence permissions vs niveau de risque
   - Vérification des endpoints réseau si permission réseau

2. **Review OEM**
   - Examen manuel par le constructeur ciblé
   - Peut approuver, rejeter, ou demander des modifications

3. **Publication**
   - Une fois approuvé, le skill est visible dans le store
   - Seuls les robots de l'OEM compatible peuvent l'installer

### Permissions à Risque

Certaines permissions nécessitent une justification détaillée :

| Niveau | Permissions |
|--------|-------------|
| **Élevé** | `manipulation`, `emergency` |
| **Moyen** | `camera`, `microphone`, `navigation` |
| **Faible** | `sensors`, `network`, `storage` |

### Points d'Attention

- Les permissions doivent être cohérentes avec le niveau de risque déclaré
- La permission `network` requiert la déclaration des endpoints
- Les skills collectant des données doivent le déclarer explicitement

## 📝 TODO Post-POC

- [ ] Scan malware des packages
- [ ] Génération SBOM
- [ ] Signature cryptographique des packages
- [ ] Intégration Stripe réelle
- [ ] Rate limiting avancé
- [ ] Tests E2E complets
- [ ] Internationalisation (next-intl)
- [ ] Analytics avancées

## 📄 Documentation

- [Cahier des Charges](/docs/cdc.md)
- [Prompt Initial](/docs/initialprompt.md)

## 🤝 Contribution

Ce projet est un POC. Pour contribuer :

1. Fork le repo
2. Créez une branche feature
3. Commitez vos changements
4. Ouvrez une Pull Request

## 📜 Licence

Propriétaire - Tous droits réservés
