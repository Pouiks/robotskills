-- ============================================
-- Robot Skills Store - Prix des Skills
-- 07_prices.sql - Ajout de prix variés aux skills
-- ============================================

-- Mise à jour des prix (certains gratuits, certains payants)

-- Smart Navigator - 9,99€ (navigation premium)
UPDATE skills SET price_cents = 999 WHERE slug = 'smart-navigator';

-- Object Handler Pro - 14,99€ (manipulation avancée)
UPDATE skills SET price_cents = 1499 WHERE slug = 'object-handler-pro';

-- Voice Assistant Plus - GRATUIT
UPDATE skills SET price_cents = 0 WHERE slug = 'voice-assistant-plus';

-- Party DJ - 4,99€ (divertissement)
UPDATE skills SET price_cents = 499 WHERE slug = 'party-dj';

-- Meeting Assistant - 19,99€ (productivité pro)
UPDATE skills SET price_cents = 1999 WHERE slug = 'meeting-assistant';

-- Health Monitor - 24,99€ (santé/sécurité critique)
UPDATE skills SET price_cents = 2499 WHERE slug = 'health-monitor';

-- Language Tutor - GRATUIT (éducation)
UPDATE skills SET price_cents = 0 WHERE slug = 'language-tutor';

-- Security Watch - 29,99€ (sécurité premium)
UPDATE skills SET price_cents = 2999 WHERE slug = 'security-watch';

-- Vérification
SELECT name, slug, price_cents, is_free FROM skills ORDER BY price_cents DESC;
