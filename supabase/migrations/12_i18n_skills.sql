-- ============================================
-- Robot Skills Store - i18n Skills
-- 12_i18n_skills.sql - Ajout des colonnes multilingues
-- ============================================

-- ============================================
-- AJOUT DES COLONNES ANGLAISES
-- ============================================

-- Ajout des colonnes pour les traductions anglaises
ALTER TABLE skills ADD COLUMN name_en TEXT;
ALTER TABLE skills ADD COLUMN short_description_en TEXT;
ALTER TABLE skills ADD COLUMN description_md_en TEXT;

-- Index pour la recherche full-text en anglais
CREATE INDEX idx_skills_search_en ON skills 
  USING GIN (to_tsvector('english', coalesce(name_en, '') || ' ' || coalesce(short_description_en, '')));

COMMENT ON COLUMN skills.name_en IS 'Nom du skill en anglais';
COMMENT ON COLUMN skills.short_description_en IS 'Description courte en anglais';
COMMENT ON COLUMN skills.description_md_en IS 'Description complète en anglais (Markdown)';

-- ============================================
-- MISE À JOUR DES SKILLS EXISTANTS
-- ============================================

-- Smart Navigator
UPDATE skills SET 
  name_en = 'Smart Navigator',
  short_description_en = 'Intelligent navigation with real-time obstacle avoidance',
  description_md_en = '# Smart Navigator

An advanced navigation system for your robot.

## Features

- Automatic environment mapping
- Real-time obstacle avoidance
- Optimized path planning
- Multi-floor support

## Compatibility

Works with all robots equipped with LiDAR or depth camera.
'
WHERE slug = 'smart-navigator';

-- Object Handler Pro
UPDATE skills SET 
  name_en = 'Object Handler Pro',
  short_description_en = 'Object manipulation with visual recognition',
  description_md_en = '# Object Handler Pro

Allow your robot to recognize and manipulate everyday objects.

## Features

- Recognition of 1000+ common objects
- Adaptive grip based on shape
- Automatic weight estimation
- "Fragile" mode for delicate objects

## Use Cases

- Tidying up objects
- Serving drinks
- Sorting waste
'
WHERE slug = 'object-handler-pro';

-- Voice Assistant Plus
UPDATE skills SET 
  name_en = 'Voice Assistant Plus',
  short_description_en = 'Multilingual voice assistant with contextual understanding',
  description_md_en = '# Voice Assistant Plus

Transform your robot into an intelligent voice assistant.

## Supported Languages

- French
- English
- Spanish
- German
- Japanese

## Features

- Context understanding
- Conversational memory
- Home automation integration
- Customizable voice commands
'
WHERE slug = 'voice-assistant-plus';

-- Party DJ
UPDATE skills SET 
  name_en = 'Party DJ',
  short_description_en = 'Turn your robot into a DJ for your parties',
  description_md_en = '# Party DJ

Your robot becomes the host of your parties!

## Features

- Smart playlists based on mood
- Connected lighting control
- Party energy level detection
- Built-in karaoke mode

## Integrations

- Spotify
- Apple Music
- Philips Hue
- LIFX
'
WHERE slug = 'party-dj';

-- Meeting Assistant
UPDATE skills SET 
  name_en = 'Meeting Assistant',
  short_description_en = 'Meeting assistant with automatic note-taking',
  description_md_en = '# Meeting Assistant

Optimize your meetings with your robot.

## Features

- Automatic note-taking
- Key points summary
- Action item tracking
- Multilingual transcription

## Integrations

- Google Calendar
- Microsoft Teams
- Slack
- Notion
'
WHERE slug = 'meeting-assistant';

-- Health Monitor
UPDATE skills SET 
  name_en = 'Health Monitor',
  short_description_en = 'Health tracking and medication reminders',
  description_md_en = '# Health Monitor

A health companion for the whole family.

## Features

- Medication reminders
- Vital signs monitoring (with connected devices)
- Fall detection
- Automatic emergency calls

## Important Note

This skill does not replace professional medical advice.
'
WHERE slug = 'health-monitor';

-- Language Tutor
UPDATE skills SET 
  name_en = 'Language Tutor',
  short_description_en = 'Learn a new language with your robot',
  description_md_en = '# Language Tutor

A patient language teacher available 24/7.

## Available Languages

- English (beginner to advanced)
- Spanish
- Mandarin
- Japanese
- German

## Methodology

- Immersive conversations
- Pronunciation correction
- Personalized exercises
- Progress tracking
'
WHERE slug = 'language-tutor';

-- Security Watch
UPDATE skills SET 
  name_en = 'Security Watch',
  short_description_en = 'Intelligent surveillance and anomaly detection',
  description_md_en = '# Security Watch

Enhance the security of your home.

## Features

- Scheduled patrols
- Intrusion detection
- Facial recognition (authorized family)
- Real-time alerts
- Video recording

## Privacy

Data stays local unless cloud is explicitly enabled.
'
WHERE slug = 'security-watch';

-- ============================================
-- FIN DE LA MIGRATION i18n
-- ============================================
