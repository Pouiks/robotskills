Robot Skills Store — POC (Spécification + Plan de réalisation)
1) Vision produit

Créer une marketplace de “skills/addons” pour robots, avec :

Utilisateurs : doivent être connectés pour télécharger/installer des skills.

Espace personnel : liste des addons téléchargés/installs, gestion des robots appairés, désinstallation (style CurseForge).

Programme développeur : optionnel, payant, donne une licence token à vie (POC) permettant de soumettre des skills.

Partenaires / Constructeurs (OEM) : espace pro pour consulter les soumissions, télécharger/fork, tester, donner un avis/validation.

Le POC doit être construit en phases, avec un niveau de rigueur “App Store” (même si les règles complètes arriveront plus tard).

2) Tech stack (scalable dès le début)
Front / Web

Next.js 14+ (App Router), TypeScript

Tailwind CSS

shadcn/ui (composants propres + cohérence)

TanStack Query (si besoin), sinon fetch server actions

Zod (validation)

next-intl (optionnel POC, mais prévoir)

Backend

Supabase :

Auth (OAuth Google/GitHub/Facebook + Email OTP fallback)

Postgres + RLS

Storage (packages + screenshots)

Edge Functions (pairing, download tokens, webhooks)

Stripe (phase 3) pour achat licence dev

Observabilité : Sentry (phase 2/3)

Scalabilité et bonnes pratiques

UI statique + listing store cacheable (ISR/Route Cache)

Assets via CDN (Supabase Storage + cache headers)

RLS stricte (sécurité by design)

Éviter N+1 (views, RPC si nécessaire)

Journalisation (audit_events)

3) Rôles et droits (RBAC)

user : navigue, télécharge, installe, gère ses robots.

developer : tout user + peut soumettre et gérer ses skills (après licence).

oem_partner : compte pro (organisation OEM) + accès aux soumissions qui le ciblent.

admin : modération, kill switch, gestion globale.

Important : le statut “developer” ne doit pas être un champ fragile dans le client. Tout doit être garanti par RLS + claims (ou table de rôles).

4) Phases de delivery (POC propre, incrémental)
Phase 0 — Fondations (1 repo propre)

Objectif : socle technique + design system + structure.

Setup Next.js, Tailwind, shadcn/ui, routing.

Layout de marque (header, footer, typographies, couleurs, composants UI).

Pages skeleton : Home, Store, Skill detail, Login, Dashboard.

Conventions :

/src/app

/src/components/ui (shadcn)

/src/lib/supabase/*

/src/lib/validators/*

/src/server/* (server actions / services)

Qualité : ESLint + Prettier + strict TS.

DoD : UI cohérente + navigation + base projet propre.

Phase 1 — Auth + Store “read-only” + comptes

Objectif : login obligatoire pour télécharger, store consultable sans login.

Supabase Auth :

OAuth : Google + GitHub (+ Facebook si simple, sinon phase 2)

Fallback : Email OTP (magic link)

Table profiles alimentée à la création user.

Store :

Listing skills (public)

Fiche skill (public) : description, screenshots, compatibilité, permissions (placeholder)

Téléchargement : bouton “Télécharger” => si non connecté → redirect login.

DoD : un user peut créer un compte, se connecter, voir le store, accéder à son dashboard.

Phase 2 — Robots + appairage sécurisé + “CurseForge-like library”

Objectif : un user associe un robot + installe/désinstalle un skill.

Gestion robots :

Ajouter robot : marque/OEM + modèle + “Robot ID” (identifiant visible dans l’app constructeur)

Appairage sécurisé (2FA de possession) :

Flow :

user saisit Robot ID → création pairing_request (challenge + code court + expiration)

robot/app constructeur appelle une Edge Function confirm_pairing avec (Robot ID + code)

si OK → robot passe paired, association à l’utilisateur

Alternative UX : QR code affiché côté web, scanné côté app constructeur (optionnel)

Bibliothèque :

Onglet “Mes addons” :

installés par robot

téléchargés

Actions : installer / désinstaller (par robot)

Installation POC (sans vrai robot) :

“installer” = création row installations + statut installed

“désinstaller” = update statut removed

Plus tard : webhook OEM / agent robot

DoD : un user connecté peut appairer un robot (via confirmation), installer/désinstaller un addon et voir l’état.

Phase 3 — Programme développeur + soumission de skills (MVP)

Objectif : payer une licence dev + publier une soumission.

Achat licence via Stripe (ou mode “admin issue” si POC sans paiement) :

Générer un token à vie (stocké hashé)

Attribuer rôle developer (via table et/ou claim)

Portail dev :

CRUD skill (métadonnées)

Ajout screenshots

Upload package (zip) dans Storage

Création version + submission

États submission :

draft → submitted → in_review → oem_review → approved/rejected

Pré-validation automatique POC :

manifest JSON obligatoire (même minimal)

checksum, taille max, type MIME

Le skill n’est visible publiquement que si approved (ou visible en “beta” au dev).

DoD : un developer peut acheter licence, créer un skill, uploader un package, soumettre.

Phase 4 — Espace OEM/Partenaire (pro)

Objectif : un OEM voit les soumissions qui le ciblent et donne un verdict.

Comptes pro via organizations :

type = oem

members + rôles internes

OEM Portal :

Liste des submissions ciblant l’OEM

Détail submission : description style App Store, screenshots, manifest, package download

Actions : approve / reject / request_changes

Traçabilité : audit log + qui a validé quoi.

DoD : un OEM peut se connecter et valider/refuser une soumission.

Phase 5 — Sécurité “App Store” (POC renforcé)

Objectif : rendre la plateforme crédible.

RLS complète + tests RLS

“Kill switch” : désactiver une version/skill → retire du store + bloque download + marque installations “disabled”

Rate limiting (Edge + DB) sur endpoints sensibles

Audit Events systématiques (pairing, install, approve, payments)

Modération minimale : report, retrait admin

DoD : on peut couper un skill globalement et garantir la sécurité d’accès.

5) Modèle de données Supabase (tables + relations)

Note : utiliser auth.users (Supabase). profiles.id = auth.users.id (uuid).

5.1 Tables principales
profiles

id uuid pk references auth.users

email text

display_name text

avatar_url text

created_at timestamptz

user_roles

user_id uuid pk references profiles(id)

is_developer boolean default false

is_admin boolean default false

organizations

id uuid pk

type text check in ('oem','studio')

name text

slug text unique

created_at timestamptz

organization_members

org_id uuid references organizations

user_id uuid references profiles

role text check in ('owner','admin','reviewer','member')

pk (org_id,user_id)

oems

id uuid pk references organizations(id) (1:1)

brand_name text

website text

support_email text

robot_models

id uuid pk

oem_id uuid references oems(id)

model_name text

capabilities jsonb (POC)

unique (oem_id, model_name)

robots

id uuid pk

user_id uuid references profiles

oem_id uuid references oems

robot_model_id uuid references robot_models

robot_identifier text (ID fourni par OEM)

status text check in ('unpaired','pending','paired','revoked')

paired_at timestamptz

unique (oem_id, robot_identifier)

robot_pairing_requests

id uuid pk

robot_id uuid references robots

challenge text unique

code text (6 chiffres)

expires_at timestamptz

confirmed_at timestamptz

confirmed_by text (ex: 'oem_app'/'robot')

index robot_id, challenge

skills

id uuid pk

owner_user_id uuid references profiles (ou owner_org_id si studio)

owner_org_id uuid references organizations null

name text

slug text unique

short_description text

description_md text

category text

icon_path text (storage)

status text check in ('draft','published','suspended')

created_at timestamptz

skill_assets

id uuid pk

skill_id uuid references skills

type text check in ('screenshot','video','banner')

path text

sort_order int

skill_versions

id uuid pk

skill_id uuid references skills

version text (semver)

manifest jsonb (required)

release_notes text

risk_level text check in ('low','medium','high')

visibility text check in ('private','beta','public')

created_at timestamptz

unique (skill_id,version)

skill_packages

id uuid pk

skill_version_id uuid references skill_versions

storage_path text

checksum_sha256 text

signature text null (phase 5)

size_bytes bigint

created_at timestamptz

submissions

id uuid pk

skill_version_id uuid references skill_versions

submitted_by uuid references profiles

target_oem_id uuid references oems (null si “générique” POC)

status text check in ('draft','submitted','platform_review','oem_review','approved','rejected','changes_requested')

platform_review_notes text

created_at timestamptz

updated_at timestamptz

oem_reviews

id uuid pk

submission_id uuid references submissions

oem_org_id uuid references organizations

reviewer_user_id uuid references profiles

decision text check in ('approved','rejected','changes_requested')

notes text

created_at timestamptz

downloads

id uuid pk

user_id uuid references profiles

skill_version_id uuid references skill_versions

downloaded_at timestamptz

source text (store/web)

index (user_id,skill_version_id)

installations

id uuid pk

robot_id uuid references robots

skill_version_id uuid references skill_versions

status text check in ('installed','removed','disabled')

installed_at timestamptz

removed_at timestamptz null

unique (robot_id,skill_version_id)

developer_licenses

id uuid pk

user_id uuid references profiles unique

token_hash text unique

issued_at timestamptz

revoked_at timestamptz null

lifetime boolean default true

audit_events

id uuid pk

actor_user_id uuid null

actor_org_id uuid null

event_type text

payload jsonb

created_at timestamptz

index on event_type, created_at

6) RLS (règles minimales POC)

profiles : user lit/écrit uniquement son profil.

robots : user CRUD uniquement ses robots.

robot_pairing_requests : user voit uniquement ceux de ses robots ; Edge Function peut confirmer.

skills/versions/packages/assets :

owner (dev) CRUD

public read uniquement si version public et submission approved

submissions :

dev lit/écrit ses submissions

OEM lit uniquement celles où target_oem_id correspond à son org

installations/downloads : user lit uniquement ses data.

developer_licenses : user lit uniquement sa licence.

7) API / Edge Functions (liste)
Auth / Rôles

GET /api/me (server action) : profile + roles + licence + orgs

Pairing

POST /functions/start_pairing : crée pairing_request (challenge + code)

POST /functions/confirm_pairing : robot/OEM app envoie challenge + code → confirme

POST /functions/revoke_robot : révoque appairage (user)

Packages / Downloads

POST /functions/create_download_token : génère URL signée Storage (auth required)

GET /download/:skillVersionId : redirige vers signed URL

Submissions / OEM

POST /functions/submit_version

POST /functions/oem_decision : approve/reject/changes

Kill switch (phase 5)

POST /functions/disable_skill_version (admin)

8) UX / Branding (exigence)

Style : premium, sérieux, tech (pas “hobby”).

Pages critiques :

Home (hero + promesse + OEM logos placeholder)

Store (recherche, filtres, catégories)

Skill detail (comme App Store : screenshots, compatibilité, permissions, changelog)

Dashboard user : robots, addons, downloads

Dev portal : skills, versions, soumissions, analytics basiques

OEM portal : submissions à reviewer, historique décisions

Micro-interactions propres (loading states, skeletons, toasts, empty states)

Aucune page “vide” / brute.

9) Tests + pipeline
Tests

Unit : validators Zod, helpers, RBAC checks (Vitest)

E2E : auth + pairing flow + install/désinstall + soumission + décision OEM (Playwright)

RLS : scripts de tests (exécuter avec différents users) au minimum sur tables sensibles

CI

GitHub Actions :

lint + typecheck

unit tests

e2e (optionnel POC)

migration check (Supabase)

10) Critères d’acceptation (POC)

À la fin du POC (phases 1→4 minimum) :

Un user peut créer un compte (OAuth + OTP) et doit être connecté pour télécharger.

Un user peut enregistrer un robot et l’appairer via confirmation (2FA de possession).

Un user voit ses addons et peut installer/désinstaller par robot (style CurseForge).

Un developer (licence à vie token) peut créer un skill, uploader package, soumettre.

Un OEM partenaire peut se connecter, consulter la soumission, télécharger package, et rendre une décision.

Les skills approuvés deviennent publics dans le store, les autres non.

RLS empêche l’accès cross-user et cross-org.

Option phase 5 (bonus sérieux) :
8) Kill switch admin fonctionnel + audit events.

11) Contraintes importantes

Ne jamais “tricher” avec la sécurité : pas de logique d’autorisation uniquement côté front.

Tous les fichiers (packages, images) doivent être servis via URLs signées.

Versioning strict : un install pointe vers une skill_version précise.

Tout événement critique doit être loggé dans audit_events.

12) Plan de delivery (ordre d’implémentation recommandé)

Phase 0 UI + structure repo

Phase 1 Auth + Store public + dashboard minimal

Phase 2 Robots + Pairing + library + installs

Phase 3 Developer license + dev portal + submissions

Phase 4 OEM portal + décisions

Phase 5 sécurité renforcée + kill switch + audit complet