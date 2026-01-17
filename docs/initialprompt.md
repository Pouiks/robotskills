TU ES CURSOR, AGIS COMME LE TECH LEAD + ARCHITECTE + DEV FULLSTACK.
Objectif : livrer un POC complet “Robot Skills Store” en suivant STRICTEMENT le fichier /cdc.md à la racine du repo.
Tu dois produire un projet PROPRE, scalable, sécurisé (RLS by design), avec une UX premium type App Store.

0) RÈGLES ABSOLUES
- Lis /cdc.md en entier avant d’écrire du code.
- Ne saute aucune étape critique : Auth, robots, pairing, library installs, dev license token, submissions, OEM portal.
- Ne mets JAMAIS de logique d’autorisation uniquement côté front. Tout doit être sécurisé via Supabase RLS + server actions + edge functions.
- Utilise Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui.
- Utilise Supabase (Auth, Postgres, Storage, Edge Functions).
- Pas de code brouillon : types stricts, Zod validation, composants réutilisables, loaders, empty states.
- Branding : premium, sérieux, moderne, “store de référence”. Pas de styles cheap.
- Génère des données de seed/démo (facultatif) mais garde un vrai flux fonctionnel.

1) DÉMARRAGE
- Analyse la structure du repo actuel.
- Si nécessaire, initialise Next.js (App Router), Tailwind, shadcn/ui, ESLint/Prettier.
- Mets en place une architecture claire :
  - src/app (routes)
  - src/components (shared)
  - src/components/ui (shadcn)
  - src/lib (supabase client, utils)
  - src/server (server actions/services)
  - src/lib/validators (Zod)
  - src/types (types DB)
- Ajoute un README clair : setup local + env vars + commandes.

2) AUTHENTIFICATION (PHASE 1)
- Implémente Supabase Auth :
  - OAuth : Google + GitHub (Facebook optionnel)
  - fallback OTP Email
- Pages :
  - /login (UX premium)
  - /logout
- Middleware :
  - pages publiques : home, store, skill detail
  - pages protégées : dashboard, robots, library, dev portal, oem portal
- Crée un système “me” :
  - récupère profile + roles + org memberships
  - centralise dans un hook (client) et une server action (server)

3) STORE PUBLIC (PHASE 1)
- Pages :
  - / (home premium)
  - /store (listing + search + category filter)
  - /skills/[slug] (fiche skill type App Store : screenshots, description, compatibilité, permissions, changelog)
- Téléchargement :
  - bouton “Télécharger” -> si pas connecté, redirect /login
  - si connecté, appelle une server action qui crée une URL signée storage via edge function
  - log dans table downloads

4) DASHBOARD USER + ROBOTS + APPARIEMENT (PHASE 2)
- Pages protégées :
  - /dashboard (overview)
  - /dashboard/robots : CRUD robots
  - /dashboard/library : “CurseForge-like” addons par robot
- Pairing flow :
  - start pairing -> création pairing_request (challenge + code + expiry) via edge function
  - écran affiche challenge + code + instructions
  - confirm pairing -> edge function confirm_pairing (reçoit robot_id/identifier + challenge + code)
  - statut robot passe “paired”
- Installation :
  - “installer” un skill version sur un robot = row installations status installed
  - “désinstaller” = status removed
  - “disabled” si kill switch (phase 5)

5) PROGRAMME DEVELOPPEUR + LICENCE TOKEN À VIE (PHASE 3)
- Dans l’espace perso, proposer :
  - “Souscrire au programme développeur”
- POC :
  - implémenter un écran d’achat (Stripe en phase 3 si possible, sinon mode “simulate purchase” propre)
  - attribuer developer_licenses token (hashé), set is_developer = true
- Dev portal :
  - /dev (guard is_developer)
  - /dev/skills : CRUD skills
  - /dev/skills/[id] : gérer assets, versions, package upload, manifest JSON
  - /dev/submissions : lister submissions, status, feedback

6) SUBMISSIONS + WORKFLOW REVIEW (PHASE 3-4)
- Implémenter la state machine :
  - draft -> submitted -> platform_review -> oem_review -> approved/rejected/changes_requested
- POC platform review :
  - validation manifest (Zod schema)
  - check fichier package (taille, mimetype)
  - marque status platform_review puis oem_review si target_oem_id
- Publier dans store uniquement si version public + submission approved.

7) ESPACE OEM / PARTENAIRE (PHASE 4)
- Auth “professionnelle” :
  - user membre d’une organization type oem
- Pages :
  - /oem (guard membership)
  - /oem/submissions : liste ciblées
  - /oem/submissions/[id] : détail complet, téléchargement package, décision
- Actions OEM :
  - approve/reject/request_changes via edge function ou server action sécurisée
- Traçabilité :
  - écrire dans oem_reviews + audit_events

8) SÉCURITÉ RENFORCÉE + ADMIN (PHASE 5 - si possible)
- Ajoute un mini backoffice admin :
  - /admin (guard is_admin)
  - kill switch : disable skill_version (met versions disabled + installations disabled)
- Audit events :
  - log pairing start/confirm, install/uninstall, submit, decision, kill switch, download

9) QUALITÉ / TESTS
- Validation Zod côté client et server.
- Tests unitaires Vitest pour validators + services critiques.
- (Option) Playwright e2e sur flows principaux :
  - auth
  - add robot + pairing (mock confirm)
  - install/uninstall
  - dev submit
  - oem approve

10) LIVRABLES ATTENDUS
- App fonctionnelle localement avec Supabase.
- UI premium cohérente.
- Tous les cas d’usage du cdc.md couverts (phases 1→4 minimum).
- Un README complet :
  - env vars
  - setup Supabase
  - run dev
  - run tests
  - structure du projet
- Une liste “TODO post-POC” (scans malware, sbom, signature, vrai Stripe, etc.)

11) IMPORTANT : NE BLOQUE PAS
- Si une partie dépend d’un service externe (ex: Stripe), implémente une version POC propre (simulate purchase) mais architecture prête pour Stripe.
- Si tu dois choisir : privilégie toujours sécurité (RLS), flux end-to-end, UX premium.

COMMENCE PAR :
A) ouvrir /cdc.md et en extraire la checklist des features
B) proposer un plan de commits (ordre d’implémentation)
C) implémenter dans cet ordre.


travaille en commits atomiques” et “à la fin de chaque phase, exécute une passe de refactor + typecheck