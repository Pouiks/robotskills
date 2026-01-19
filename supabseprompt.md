GÉNÈRE LES SCRIPTS SQL SUPABASE POUR LE PROJET “Robot Skills Store” EN RESPECTANT /cdc.md.
Je veux des scripts prêts à coller dans Supabase (SQL Editor), organisés en fichiers logiques.

Contraintes :
- Postgres + RLS partout (par défaut deny).
- Utiliser auth.users comme source d’identité.
- Tables + indexes + constraints + enums/checks.
- Policies RLS minimales mais correctes :
  - user isolation stricte
  - org isolation stricte
  - lecture publique uniquement sur skills/versions approuvés
- Ajouter les buckets Supabase Storage nécessaires (SQL si possible via storage schema ou instructions).
- Ajouter triggers :
  - création automatique de profile à la création d’un user (trigger sur auth.users)
  - audit_events helper (optionnel)
- Ajouter fonctions RPC utiles :
  - start_pairing(robot_id) -> crée pairing_request
  - confirm_pairing(challenge, code, robot_identifier) -> confirme
  - create_download_token(skill_version_id) -> retourne path/URL (si possible SQL/RPC sinon préciser Edge Function)
- Générer le schéma complet décrit : profiles, user_roles, organizations, organization_members, oems, robot_models, robots, robot_pairing_requests, skills, skill_assets, skill_versions, skill_packages, submissions, oem_reviews, downloads, installations, developer_licenses, audit_events.

Sortie attendue :
1) 01_schema.sql (tables + indexes + constraints)
2) 02_rls.sql (enable RLS + policies)
3) 03_triggers.sql
4) 04_rpc.sql (fonctions)
5) 05_storage.md (instructions + buckets + règles)
Chaque fichier doit être séparé par un titre clair dans la réponse, et tu dois inclure des commentaires SQL.

Important :
- Pas de pseudocode.
- SQL exécutable.
- RLS doit empêcher tout accès cross-user et cross-org.
- Prévoir les champs created_at/updated_at + triggers updated_at.


YeZKAHWkkAkIJ2ut