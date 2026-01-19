# Cahier des Charges Fonctionnel
## RobotSkills - Marketplace de Skills Robotiques

**Version:** 1.0 POC  
**Date:** 17 janvier 2026  
**Statut:** Proof of Concept

---

## 1. Présentation du Projet

### 1.1 Contexte

RobotSkills est une marketplace permettant aux utilisateurs de robots domestiques et professionnels de découvrir, acheter et installer des "skills" (compétences/addons) pour étendre les capacités de leurs robots. Le projet vise à créer un écosystème similaire à l'App Store d'Apple, mais dédié aux robots.

### 1.2 Objectifs

- **Pour les utilisateurs** : Découvrir et installer facilement des skills compatibles avec leurs robots
- **Pour les développeurs** : Publier et monétiser leurs skills via une plateforme validée
- **Pour les OEMs** : Contrôler et valider les skills installés sur leurs robots

### 1.3 Périmètre du POC

Ce document décrit le périmètre fonctionnel du Proof of Concept (POC), qui inclut :
- Authentification et gestion des profils
- Store public avec recherche et filtres
- Gestion des robots utilisateurs
- Programme développeur avec licence
- Wizard de soumission de skills
- Système de compatibilité OEM

---

## 2. Architecture Technique

### 2.1 Stack Technologique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Supabase (Auth, Database, Storage) |
| Base de données | PostgreSQL avec Row Level Security (RLS) |
| Validation | Zod |
| Tests | Vitest |

### 2.2 Rôles Utilisateurs

| Rôle | Description | Accès |
|------|-------------|-------|
| `user` | Utilisateur standard | Store, Dashboard, Robots |
| `developer` | Développeur avec licence | + Portail développeur |
| `oem_partner` | Partenaire constructeur | + Portail OEM (futur) |
| `admin` | Administrateur | Accès complet |

### 2.3 Règles Métier Critiques

#### 2.3.1 Statuts de Soumission et Transitions

```
                              ┌─────────────────────────────┐
                              │                             │
draft ──► submitted ──► platform_review ──► oem_review ──► approved
                              │                  │
                              ▼                  ▼
                     changes_requested ◄──── rejected
                              │
                              └─────► submitted (cycle de correction)
```

**Règles de transition :**
- `draft` → `submitted` : Toutes les données requises validées
- `submitted` → `platform_review` : Automatique (pré-check démarré)
- `platform_review` → `oem_review` : Pré-check réussi (PASS)
- `platform_review` → `changes_requested` : Pré-check échoué (FAIL)
- `changes_requested` → `submitted` : Développeur corrige et resoumet
- `oem_review` → `approved` : OEM valide
- `oem_review` → `rejected` : OEM refuse

#### 2.3.2 Mapping Permission → Niveau de Risque Minimal

| Permissions | Risque Minimum Requis |
|-------------|----------------------|
| `basic`, `storage` | `low` |
| `navigation`, `sensors`, `network` | `medium` |
| `manipulation`, `camera`, `microphone` | `high` |
| `emergency` | `critical` (obligatoire) |

**Règles de cohérence :**
- Si une permission haute est sélectionnée mais le niveau de risque déclaré est trop bas → Erreur de pré-check
- Exemple : `manipulation` + `risk=low` → FAIL

#### 2.3.3 Niveau Critical

Le niveau de risque `critical` implique des contraintes renforcées :

| Contrainte | Détail |
|------------|--------|
| Justification détaillée | Minimum 100 caractères par permission |
| Review OEM manuelle | Obligatoire, pas d'auto-approbation |
| Audit log renforcé | Toutes les actions tracées |
| Délai de validation | Minimum 24h avant approbation |

#### 2.3.4 Visibilité dans le Store

**Règles d'affichage :**
- Seuls les skills avec au moins 1 `submission_target` en statut `approved` sont visibles publiquement
- Badge "Certifié" = Au moins 1 OEM avec review complète et validée
- Skills en `draft`, `submitted`, `platform_review` → Visibles uniquement par le développeur
- Skills `rejected` → Visibles par le développeur avec raison du rejet

---

## 3. Fonctionnalités Détaillées

### 3.1 Authentification

#### 3.1.1 Méthodes de connexion

- **OAuth** : Google, GitHub
- **Email/Mot de passe** : Inscription, connexion et réinitialisation de mot de passe

#### 3.1.2 Réinitialisation de Mot de Passe

1. Clic sur "Mot de passe oublié" sur `/login`
2. Saisie de l'email
3. Envoi d'un email avec lien de réinitialisation
4. Redirection vers formulaire de nouveau mot de passe
5. Confirmation et connexion automatique

#### 3.1.2 Flux d'authentification

1. L'utilisateur accède à `/login`
2. Choix de la méthode d'authentification
3. Validation et création de session
4. Redirection vers `/dashboard` ou URL précédente

#### 3.1.3 Protection des routes

| Route Pattern | Protection |
|---------------|------------|
| `/dashboard/*` | Utilisateur authentifié |
| `/dev/*` | Développeur avec licence valide |
| `/oem/*` | Partenaire OEM (futur) |
| `/admin/*` | Administrateur |

---

### 3.2 Store Public

#### 3.2.1 Liste des Skills (`/store`)

**Affichage :**
- Grille de cards avec icône, nom, catégorie, prix, note
- Badge "Certifié" pour les skills validés par OEM
- Tag de compatibilité avec les robots de l'utilisateur

**Fonctionnalités :**
- Recherche textuelle en temps réel
- Filtres par catégorie, prix (gratuit/payant), OEM
- Tri par popularité, date, prix

#### 3.2.2 Détail d'un Skill (`/skills/[slug]`)

**Informations affichées :**
- Icône et screenshots
- Nom, éditeur, catégorie
- Prix (gratuit ou payant)
- Description complète (Markdown)
- Changelog des versions
- Permissions requises
- OEMs compatibles

**Actions :**
- Bouton "Installer" (skill gratuit) ou "Acheter X €" (skill payant)
- Sélection du robot cible (si plusieurs robots compatibles)
- Alerte si aucun robot compatible

#### 3.2.3 Processus d'Achat (Simulation POC)

**Flux d'achat pour un skill payant :**

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Clic Acheter │ → │ Modal confirmation │ → │ Simulation paiement │
│              │    │ Prix + conditions  │    │ (pas de vraie CB)   │
└─────────────┘    └─────────────────┘    └─────────────────┘
                                                    │
                                                    ▼
                                         ┌─────────────────┐
                                         │ Toast "Achat    │
                                         │ simulé - X €"   │
                                         │ Bouton → Installer│
                                         └─────────────────┘
```

**Données créées :**

| Table | Données |
|-------|---------|
| `purchases` | `user_id`, `skill_id`, `price_cents`, `purchased_at`, `payment_reference` |

**Comportement post-achat :**
- Le bouton "Acheter" devient "Installer"
- L'utilisateur peut installer sur ses robots compatibles
- L'achat est définitif (pas de remboursement en POC)

#### 3.2.4 Catégories de Skills

```
navigation, manipulation, perception, communication,
entertainment, productivity, education, healthcare,
industrial, other
```

---

### 3.3 Dashboard Utilisateur

#### 3.3.1 Vue d'ensemble (`/dashboard`)

- Profil utilisateur (avatar, nom, email)
- Statistiques : skills installés, robots, favoris
- Raccourcis : Ajouter robot, Parcourir store, Programme développeur

#### 3.3.2 Gestion des Robots (`/dashboard/robots`)

**Liste des robots :**
- Nom personnalisé, modèle, OEM
- Statut d'appairage
- Actions : voir détails, supprimer

**Ajout d'un robot (`/dashboard/robots/new`) :**
1. Sélection du constructeur (OEM)
2. Saisie du numéro de série
3. Nom personnalisé (optionnel)
4. Lancement de l'appairage

**Processus d'appairage :**
1. Création d'une demande d'appairage
2. Simulation de validation OEM (auto-approbation en POC)
3. Confirmation et ajout du robot

#### 3.3.3 Skills Installés (`/dashboard/skills`)

- Liste des skills installés par robot
- Statut de chaque installation
- Actions : désinstaller, mettre à jour

---

### 3.4 Programme Développeur

#### 3.4.1 Activation (`/dashboard/developer`)

**Prérequis :**
- Être authentifié
- Ne pas avoir de licence existante

**Processus :**
1. Affichage des conditions du programme
2. Clic sur "Activer ma licence (Simulation)"
3. Vérification côté serveur :
   - Utilisateur authentifié
   - Pas de licence existante
   - Simulation de paiement
4. Création de la licence avec token hashé
5. Affichage du token (une seule fois)
6. Mise à jour du rôle utilisateur

**Données créées :**
- `developer_licenses` : licence avec `token_hash`, `lifetime: true`
- `user_roles` : `is_developer: true`
- `audit_events` : log de création

#### 3.4.2 Token Développeur

- Format : `DEV-XXXX-XXXX-XXXX-XXXX`
- Hashé en SHA256 avant stockage
- Affiché une seule fois à l'activation
- Utilisable pour authentification API (futur)

---

### 3.5 Portail Développeur

#### 3.5.1 Vue d'ensemble (`/dev`)

- Statistiques : skills publiés, téléchargements, revenus
- Liste des skills récents
- Soumissions en attente
- CTA "Créer mon premier skill"

#### 3.5.2 Mes Skills (`/dev/skills`)

- Liste des skills créés
- Statuts : draft, pending_review, published, rejected
- Actions : éditer, voir soumissions, créer version

#### 3.5.3 Soumissions (`/dev/submissions`)

- Historique des soumissions
- Statuts avec timeline visuelle
- Feedback des reviewers

---

### 3.6 Wizard de Création de Skill

#### 3.6.1 Structure en 6 étapes

```
1. Identité → 2. Médias → 3. Compatibilité → 4. Permissions → 5. Package → 6. Validation
```

#### 3.6.2 Étape 1 : Identité

**Champs obligatoires :**
| Champ | Validation |
|-------|------------|
| `name` | 3-50 caractères |
| `slug` | Lettres minuscules, chiffres, tirets |
| `category` | Une des catégories définies |
| `publisherName` | 2-100 caractères |
| `shortDescription` | 10-140 caractères |
| `descriptionMd` | 50+ caractères, Markdown |

**Champs optionnels :**
- `supportUrl`, `privacyUrl`, `termsUrl` (URLs valides)

**Fonctionnalités :**
- Auto-génération du slug depuis le nom
- Aperçu en temps réel de la card store
- Validation Zod en temps réel

#### 3.6.3 Étape 2 : Médias

**Requis :**
- Icône : PNG/JPG, 512x512px, max 500KB
- Screenshots : 3-10 images, 16:9, max 2MB chacune

**Optionnel :**
- Vidéo de démonstration (URL YouTube/Vimeo)

**Stockage :**
- Bucket Supabase Storage privé
- URLs signées pour l'accès

#### 3.6.4 Étape 3 : Compatibilité

**Champs :**
- `targetOemIds` : Un ou plusieurs OEMs (obligatoire)
- `targetModels` : Modèles spécifiques (optionnel, futur)
- `minFirmwareVersion` : Version minimum (optionnel)

**Comportement :**
- Chargement dynamique des OEMs disponibles
- Multi-sélection avec checkboxes

#### 3.6.5 Étape 4 : Permissions

**Permissions disponibles :**
```
basic, navigation, manipulation, perception, sensors,
camera, microphone, network, storage, emergency
```

**Classification des risques :**
- Haut risque : `manipulation`, `emergency`, `camera`, `microphone`
- Risque moyen : `navigation`, `sensors`, `network`
- Risque faible : `basic`, `storage`

**Pour chaque permission :**
- Justification obligatoire
- Affichage du niveau de risque

**Data Usage :**
- Collecte de données (oui/non)
- Types de données collectées
- Durée de rétention
- Partage avec tiers
- Endpoints réseau utilisés

#### 3.6.6 Étape 5 : Package

**Informations de version :**
- `version` : Format semver (ex: 1.0.0)
- `releaseNotes` : Notes de version (10+ caractères)
- `riskLevel` : low, medium, high, critical

**Package :**
- Upload du fichier .zip
- Taille max : 50MB
- Validation du checksum

**Manifest (JSON) :**
```json
{
  "name": "skill-name",
  "version": "1.0.0",
  "entryPoint": "main.js",
  "permissions": ["basic", "navigation"]
}
```

#### 3.6.7 Étape 6 : Validation

**Récapitulatif complet :**
- Identité et médias
- Compatibilité OEM
- Permissions et data usage
- Package et manifest

**Actions :**
- Retour aux étapes précédentes pour modification
- Soumission pour review

---

### 3.7 Système de Review (POC)

#### 3.7.1 Statuts de Soumission

| Statut | Description |
|--------|-------------|
| `draft` | En cours de création |
| `submitted` | Soumis, en attente de pré-check |
| `platform_review` | Vérification automatique en cours |
| `changes_requested` | Modifications demandées |
| `oem_review` | En attente de validation OEM |
| `approved` | Approuvé par l'OEM |
| `rejected` | Rejeté |

#### 3.7.2 Pré-check Automatique

**Validations effectuées :**
- Structure du manifest JSON
- Cohérence permissions/niveau de risque
- Taille et format du package
- Checksum valide
- Endpoints réseau déclarés

**Résultat :**
- PASS → passage en `oem_review`
- FAIL → `changes_requested` avec rapport détaillé

---

### 3.8 Compatibilité et Filtrage

#### 3.8.1 Déclaration de Compatibilité

Lors de la soumission, le développeur doit :
1. Sélectionner les OEMs compatibles
2. Optionnellement spécifier les modèles
3. Indiquer la version firmware minimum

#### 3.8.2 Affichage dans le Store

Pour chaque skill :
- Badge avec nombre de robots compatibles de l'utilisateur
- Tag "X robot(s) compatible(s)"
- Filtre par OEM disponible

#### 3.8.3 Installation

L'installation n'est possible que si :
- L'utilisateur a un robot appairé
- Le robot est d'un OEM compatible
- Le modèle est compatible (si spécifié)
- Le firmware est suffisant (si spécifié)

---

### 3.9 Architecture Multi-OEM

#### 3.9.1 Modèle de Données

```
submission (1) ────────► submission_targets (N) ────────► oem (1)
                              │
                              ├── status (pending/reviewing/approved/rejected)
                              ├── reviewed_at
                              └── reviewer_notes
```

**Table `submission_targets` :**

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `submission_id` | UUID | Référence vers submission |
| `oem_id` | UUID | Référence vers OEM cible |
| `status` | TEXT | Statut de review par cet OEM |
| `reviewed_at` | TIMESTAMPTZ | Date de review |
| `reviewer_notes` | TEXT | Notes du reviewer OEM |

#### 3.9.2 Comportement Multi-OEM

**À la soumission :**
1. Le développeur sélectionne N OEMs compatibles
2. Le système crée N `submission_targets` (un par OEM)
3. Chaque target démarre en statut `pending`
4. Le pré-check s'applique à la soumission globale

**Progression :**
- Chaque OEM review indépendamment son target
- Le dashboard développeur affiche le statut par OEM
- Un skill est publié dès qu'**au moins un** target est `approved`

**Exemple avec 2 OEMs :**
```
Soumission "MonSkill v1.0"
├── Target RobotiCorp → approved (3 jours)
├── Target TechBot Inc → reviewing (en cours)
└── Skill PUBLIÉ (car 1 approved)
```

---

### 3.10 Pairing Robot

#### 3.10.1 Flux de Pairing (Simulé en POC)

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ 1. Entrée N° série │ → │ 2. Challenge code │ → │ 3. Confirmation  │
│    par l'utilisateur │    │    généré (6 digits) │    │    (simulation)    │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │ 4. Robot actif   │
                                              │    dans le compte │
                                              └──────────────────┘
```

#### 3.10.2 États du Pairing Request

| Statut | Description |
|--------|-------------|
| `pending` | Demande créée, code généré, en attente de validation |
| `confirmed` | Code validé, robot actif |
| `expired` | Demande expirée (> 24h sans confirmation) |
| `failed` | Échec de validation (mauvais code) |

#### 3.10.3 Code Challenge

**Format :**
- 6 chiffres numériques (000000-999999)
- Généré aléatoirement côté serveur
- Valide pendant 24 heures

**Simulation POC :**
- L'utilisateur clique "Confirmer le pairing"
- Le système auto-valide (sans vérification réelle sur le robot)
- Le robot passe en statut actif

#### 3.10.4 Données Créées

| Table | Données |
|-------|---------|
| `robots` | Enregistrement du robot (OEM, série, nom) |
| `robot_pairing_requests` | Demande avec code, statut, timestamps |

---

## 4. Modèle de Données

### 4.1 Tables Principales

```
users (via Supabase Auth)
├── user_roles
├── developer_licenses
└── robots
    └── robot_pairing_requests

skills
├── skill_versions
│   └── submissions
├── skill_assets
├── skill_oem_compatibility
└── skill_installations

oems
└── robot_models

audit_events
notifications
```

### 4.2 Row Level Security (RLS)

Toutes les tables sont protégées par RLS :
- Les utilisateurs ne voient que leurs propres données
- Les développeurs ne voient que leurs propres skills
- Les données publiques (skills publiés) sont accessibles à tous
- Les opérations admin utilisent le `service_role`

---

## 5. Sécurité

### 5.1 Authentification

- Sessions gérées par Supabase Auth
- Tokens JWT avec refresh automatique
- Protection CSRF via cookies HTTP-only

### 5.2 Autorisation

- Vérification côté serveur pour toutes les actions
- Middleware Next.js pour la protection des routes
- Server Actions avec validation des permissions

### 5.3 Données Sensibles

- Tokens développeur hashés (SHA256)
- Mots de passe hashés par Supabase Auth
- Aucun secret en clair dans la base

### 5.4 Storage

- Buckets privés pour les assets
- URLs signées avec expiration
- Validation des types MIME

---

## 6. Limitations du POC

### 6.1 Fonctionnalités Simulées

- Paiement (simulation sans passerelle réelle)
- Appairage robot (auto-approbation)
- Installation sur robot (enregistrement sans déploiement)
- Validation OEM (arrêt à `oem_review`)

### 6.2 Fonctionnalités Non Implémentées

- Portail OEM complet
- Portail Admin
- Système de notation/avis
- Analytics développeur
- Webhooks et API publique
- Gestion des revenus/paiements

---

## 7. Évolutions Futures

### Phase 2 - OEM Portal
- Dashboard partenaire OEM
- Validation manuelle des skills
- Gestion des modèles de robots
- Statistiques d'installation

### Phase 3 - Monétisation
- Intégration Stripe
- Gestion des revenus développeur
- Abonnements et promotions

### Phase 4 - Écosystème
- API publique avec documentation
- SDK pour développeurs
- Marketplace de templates
- Communauté et forums

---

## 8. Glossaire

| Terme | Définition |
|-------|------------|
| **Skill** | Application/addon installable sur un robot |
| **OEM** | Original Equipment Manufacturer - Constructeur de robots |
| **Appairage** | Processus de liaison d'un robot au compte utilisateur |
| **RLS** | Row Level Security - Sécurité au niveau des lignes PostgreSQL |
| **Manifest** | Fichier JSON décrivant la configuration d'un skill |
| **Submission** | Demande de publication d'une version de skill |
