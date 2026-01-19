-- ============================================
-- Robot Skills Store - Seed Data
-- 06_seed.sql - Données de démonstration
-- ============================================

-- ============================================
-- ORGANISATIONS OEM
-- ============================================

INSERT INTO organizations (id, type, name, slug, website)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'oem', 'RoboTech Industries', 'robotech', 'https://robotech.example.com'),
  ('22222222-2222-2222-2222-222222222222', 'oem', 'AutoBot Corp', 'autobot', 'https://autobot.example.com'),
  ('33333333-3333-3333-3333-333333333333', 'oem', 'MechaWorks', 'mechaworks', 'https://mechaworks.example.com');

-- OEM Details
INSERT INTO oems (id, brand_name, website, support_email)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'RoboTech', 'https://robotech.example.com', 'support@robotech.example.com'),
  ('22222222-2222-2222-2222-222222222222', 'AutoBot', 'https://autobot.example.com', 'support@autobot.example.com'),
  ('33333333-3333-3333-3333-333333333333', 'MechaWorks', 'https://mechaworks.example.com', 'support@mechaworks.example.com');

-- ============================================
-- MODÈLES DE ROBOTS
-- ============================================

INSERT INTO robot_models (id, oem_id, model_name, model_code, capabilities)
VALUES 
  -- RoboTech
  ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'RT-100 Home Assistant', 'RT100', 
   '{"navigation": true, "manipulation": true, "voice": true, "camera": true}'::jsonb),
  ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'RT-200 Pro', 'RT200', 
   '{"navigation": true, "manipulation": true, "voice": true, "camera": true, "lidar": true}'::jsonb),
  
  -- AutoBot
  ('bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'AB Companion', 'ABC1', 
   '{"navigation": true, "voice": true, "camera": true}'::jsonb),
  ('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'AB Worker', 'ABW1', 
   '{"navigation": true, "manipulation": true, "heavy_lift": true}'::jsonb),
  
  -- MechaWorks
  ('cccccccc-1111-1111-1111-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'MW Edu Bot', 'MWEDU', 
   '{"navigation": true, "voice": true, "display": true}'::jsonb);

-- ============================================
-- ORGANISATION STUDIO DEMO
-- ============================================

INSERT INTO organizations (id, type, name, slug, website)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'studio', 'RobotSkills Demo Studio', 'demo-studio', 'https://demo.robotskills.io');

-- ============================================
-- SKILLS DE DÉMONSTRATION
-- ============================================

INSERT INTO skills (id, owner_org_id, name, slug, short_description, description_md, category, status)
VALUES 
  -- Navigation
  ('a0000001-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444',
   'Smart Navigator', 'smart-navigator',
   'Navigation intelligente avec évitement d''obstacles en temps réel',
   '# Smart Navigator

Un système de navigation avancé pour votre robot.

## Fonctionnalités

- Cartographie automatique de l''environnement
- Évitement d''obstacles en temps réel
- Planification de trajets optimisés
- Support multi-étages

## Compatibilité

Fonctionne avec tous les robots équipés de LiDAR ou caméra de profondeur.
',
   'navigation', 'published'),
   
  -- Manipulation
  ('a0000002-0002-0002-0002-000000000002', '44444444-4444-4444-4444-444444444444',
   'Object Handler Pro', 'object-handler-pro',
   'Manipulation d''objets avec reconnaissance visuelle',
   '# Object Handler Pro

Permettez à votre robot de reconnaître et manipuler des objets du quotidien.

## Fonctionnalités

- Reconnaissance de 1000+ objets courants
- Prise adaptative selon la forme
- Estimation du poids automatique
- Mode "fragile" pour les objets délicats

## Cas d''usage

- Ranger des objets
- Servir des boissons
- Trier des déchets
',
   'manipulation', 'published'),
   
  -- Communication
  ('a0000003-0003-0003-0003-000000000003', '44444444-4444-4444-4444-444444444444',
   'Voice Assistant Plus', 'voice-assistant-plus',
   'Assistant vocal multilingue avec compréhension contextuelle',
   '# Voice Assistant Plus

Transformez votre robot en assistant vocal intelligent.

## Langues supportées

- Français
- Anglais
- Espagnol
- Allemand
- Japonais

## Fonctionnalités

- Compréhension du contexte
- Mémoire conversationnelle
- Intégration domotique
- Commandes vocales personnalisables
',
   'communication', 'published'),
   
  -- Entertainment
  ('a0000004-0004-0004-0004-000000000004', '44444444-4444-4444-4444-444444444444',
   'Party DJ', 'party-dj',
   'Transformez votre robot en DJ pour vos soirées',
   '# Party DJ

Votre robot devient l''animateur de vos fêtes !

## Fonctionnalités

- Playlists intelligentes selon l''ambiance
- Contrôle de l''éclairage connecté
- Détection du niveau d''énergie de la fête
- Mode karaoké intégré

## Intégrations

- Spotify
- Apple Music
- Philips Hue
- LIFX
',
   'entertainment', 'published'),
   
  -- Productivity
  ('a0000005-0005-0005-0005-000000000005', '44444444-4444-4444-4444-444444444444',
   'Meeting Assistant', 'meeting-assistant',
   'Assistant de réunion avec prise de notes automatique',
   '# Meeting Assistant

Optimisez vos réunions avec votre robot.

## Fonctionnalités

- Prise de notes automatique
- Résumé des points clés
- Suivi des actions à faire
- Transcription multilingue

## Intégrations

- Google Calendar
- Microsoft Teams
- Slack
- Notion
',
   'productivity', 'published'),
   
  -- Healthcare
  ('a0000006-0006-0006-0006-000000000006', '44444444-4444-4444-4444-444444444444',
   'Health Monitor', 'health-monitor',
   'Suivi de santé et rappels de médicaments',
   '# Health Monitor

Un compagnon santé pour toute la famille.

## Fonctionnalités

- Rappels de médicaments
- Suivi des constantes (avec appareils connectés)
- Détection de chutes
- Appel d''urgence automatique

## Note importante

Ce skill ne remplace pas un avis médical professionnel.
',
   'healthcare', 'published'),
   
  -- Education
  ('a0000007-0007-0007-0007-000000000007', '44444444-4444-4444-4444-444444444444',
   'Language Tutor', 'language-tutor',
   'Apprenez une nouvelle langue avec votre robot',
   '# Language Tutor

Un professeur de langues patient et disponible 24/7.

## Langues disponibles

- Anglais (débutant à avancé)
- Espagnol
- Mandarin
- Japonais
- Allemand

## Méthodologie

- Conversations immersives
- Correction de prononciation
- Exercices personnalisés
- Suivi des progrès
',
   'education', 'published'),
   
  -- Perception
  ('a0000008-0008-0008-0008-000000000008', '44444444-4444-4444-4444-444444444444',
   'Security Watch', 'security-watch',
   'Surveillance intelligente et détection d''anomalies',
   '# Security Watch

Renforcez la sécurité de votre domicile.

## Fonctionnalités

- Patrouilles programmées
- Détection d''intrusion
- Reconnaissance faciale (famille autorisée)
- Alertes en temps réel
- Enregistrement vidéo

## Respect de la vie privée

Les données restent locales sauf activation explicite du cloud.
',
   'perception', 'published');

-- ============================================
-- VERSIONS DES SKILLS
-- ============================================

INSERT INTO skill_versions (id, skill_id, version, manifest, release_notes, risk_level, visibility)
VALUES 
  ('b0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000001', '1.2.0',
   '{"name": "Smart Navigator", "version": "1.2.0", "permissions": ["navigation", "sensors", "storage"], "minFirmware": "2.0.0"}'::jsonb,
   'Amélioration de l''évitement d''obstacles et support des environnements encombrés.',
   'low', 'public'),
   
  ('b0000002-0002-0002-0002-000000000002', 'a0000002-0002-0002-0002-000000000002', '2.0.1',
   '{"name": "Object Handler Pro", "version": "2.0.1", "permissions": ["manipulation", "camera", "storage"], "minFirmware": "2.5.0"}'::jsonb,
   'Correction de bugs mineurs et ajout de 50 nouveaux objets reconnus.',
   'medium', 'public'),
   
  ('b0000003-0003-0003-0003-000000000003', 'a0000003-0003-0003-0003-000000000003', '3.1.0',
   '{"name": "Voice Assistant Plus", "version": "3.1.0", "permissions": ["microphone", "speaker", "network"], "minFirmware": "2.0.0"}'::jsonb,
   'Ajout du japonais et amélioration de la compréhension contextuelle.',
   'low', 'public'),
   
  ('b0000004-0004-0004-0004-000000000004', 'a0000004-0004-0004-0004-000000000004', '1.0.0',
   '{"name": "Party DJ", "version": "1.0.0", "permissions": ["speaker", "network", "lights"], "minFirmware": "2.0.0"}'::jsonb,
   'Première version stable avec support Spotify et Philips Hue.',
   'low', 'public'),
   
  ('b0000005-0005-0005-0005-000000000005', 'a0000005-0005-0005-0005-000000000005', '2.3.0',
   '{"name": "Meeting Assistant", "version": "2.3.0", "permissions": ["microphone", "network", "storage"], "minFirmware": "2.0.0"}'::jsonb,
   'Intégration Notion et amélioration de la transcription.',
   'low', 'public'),
   
  ('b0000006-0006-0006-0006-000000000006', 'a0000006-0006-0006-0006-000000000006', '1.5.0',
   '{"name": "Health Monitor", "version": "1.5.0", "permissions": ["network", "storage", "emergency"], "minFirmware": "2.5.0"}'::jsonb,
   'Ajout de la détection de chutes améliorée.',
   'high', 'public'),
   
  ('b0000007-0007-0007-0007-000000000007', 'a0000007-0007-0007-0007-000000000007', '4.0.0',
   '{"name": "Language Tutor", "version": "4.0.0", "permissions": ["microphone", "speaker", "storage"], "minFirmware": "2.0.0"}'::jsonb,
   'Nouvelle méthodologie d''apprentissage et ajout du mandarin.',
   'low', 'public'),
   
  ('b0000008-0008-0008-0008-000000000008', 'a0000008-0008-0008-0008-000000000008', '2.1.0',
   '{"name": "Security Watch", "version": "2.1.0", "permissions": ["camera", "navigation", "storage", "network"], "minFirmware": "2.5.0"}'::jsonb,
   'Amélioration de la reconnaissance faciale et mode nuit.',
   'medium', 'public');

-- ============================================
-- COMPATIBILITÉ OEM DES SKILLS
-- ============================================

INSERT INTO skill_oem_compatibility (skill_id, oem_id)
VALUES 
  -- Smart Navigator: Compatible avec RoboTech et AutoBot (ont des capteurs navigation)
  ('a0000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111'),
  ('a0000001-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222'),
  
  -- Object Handler Pro: RoboTech uniquement (manipulation requise)
  ('a0000002-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111'),
  
  -- Voice Assistant Plus: Tous les OEMs (tous ont voice/speaker)
  ('a0000003-0003-0003-0003-000000000003', '11111111-1111-1111-1111-111111111111'),
  ('a0000003-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222'),
  ('a0000003-0003-0003-0003-000000000003', '33333333-3333-3333-3333-333333333333'),
  
  -- Party DJ: RoboTech et MechaWorks (ont display/speaker)
  ('a0000004-0004-0004-0004-000000000004', '11111111-1111-1111-1111-111111111111'),
  ('a0000004-0004-0004-0004-000000000004', '33333333-3333-3333-3333-333333333333'),
  
  -- Meeting Assistant: Tous les OEMs
  ('a0000005-0005-0005-0005-000000000005', '11111111-1111-1111-1111-111111111111'),
  ('a0000005-0005-0005-0005-000000000005', '22222222-2222-2222-2222-222222222222'),
  ('a0000005-0005-0005-0005-000000000005', '33333333-3333-3333-3333-333333333333'),
  
  -- Health Monitor: RoboTech et AutoBot
  ('a0000006-0006-0006-0006-000000000006', '11111111-1111-1111-1111-111111111111'),
  ('a0000006-0006-0006-0006-000000000006', '22222222-2222-2222-2222-222222222222'),
  
  -- Language Tutor: Tous les OEMs
  ('a0000007-0007-0007-0007-000000000007', '11111111-1111-1111-1111-111111111111'),
  ('a0000007-0007-0007-0007-000000000007', '22222222-2222-2222-2222-222222222222'),
  ('a0000007-0007-0007-0007-000000000007', '33333333-3333-3333-3333-333333333333'),
  
  -- Security Watch: RoboTech uniquement (caméra + navigation + LiDAR)
  ('a0000008-0008-0008-0008-000000000008', '11111111-1111-1111-1111-111111111111');

-- ============================================
-- FIN DES DONNÉES DE SEED
-- ============================================

-- Note: Pour créer des utilisateurs de test, utilisez l'interface Supabase Auth
-- ou créez-les via l'API. Une fois créés, vous pourrez leur attribuer des rôles
-- et les associer à des organisations.
