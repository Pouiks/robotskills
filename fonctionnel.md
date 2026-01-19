# Document de Tests Fonctionnels
## RobotSkills - Périmètre Fonctionnel

**Version:** 1.0 POC  
**Date:** 17 janvier 2026  
**Environnement de test:** http://localhost:3000

---

## 1. Légende des Statuts

| Icône | Statut |
|-------|--------|
| ✅ | Testé et fonctionnel |
| ⚠️ | Partiellement fonctionnel / Limitations |
| ❌ | Non fonctionnel / Bug |
| 🔄 | Non testé |
| 📋 | Hors périmètre POC |

---

## 2. Module Authentification

### 2.1 Connexion

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| AUTH-01 | Connexion Google OAuth | 1. Aller sur `/login` 2. Cliquer "Continuer avec Google" 3. Autoriser | Redirection vers `/dashboard` | ✅ |
| AUTH-02 | Connexion GitHub OAuth | 1. Aller sur `/login` 2. Cliquer "Continuer avec GitHub" 3. Autoriser | Redirection vers `/dashboard` | ✅ |
| AUTH-03 | Inscription email/mdp | 1. Aller sur `/login` 2. Onglet "Email / Mot de passe" 3. Cliquer "Créer un compte" 4. Remplir formulaire | Compte créé, redirection | ✅ |
| AUTH-04 | Connexion email/mdp | 1. Aller sur `/login` 2. Entrer credentials existants | Redirection vers `/dashboard` | ✅ |
| AUTH-05 | Mot de passe trop court | 1. Inscription avec mdp < 6 chars | Message d'erreur | ✅ |
| AUTH-06 | Email invalide | 1. Inscription avec email mal formaté | Message d'erreur | ✅ |
| AUTH-07 | Email déjà pris | 1. Inscription avec email existant | Message "Email déjà utilisé" | 🔄 |
| AUTH-08 | Connexion compte inexistant | 1. Connexion avec email non enregistré | Message "Identifiants invalides" | 🔄 |

### 2.2 Reset Mot de Passe

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| AUTH-09 | Lien mot de passe oublié | 1. Page `/login` 2. Cliquer "Mot de passe oublié" | Formulaire reset affiché | 🔄 |
| AUTH-10 | Envoi email reset | 1. Formulaire reset 2. Entrer email valide 3. Soumettre | Toast "Email envoyé", email reçu | 🔄 |
| AUTH-11 | Reset avec email invalide | 1. Formulaire reset 2. Email non enregistré | Message d'erreur approprié | 🔄 |
| AUTH-12 | Nouveau mot de passe | 1. Clic sur lien reset 2. Entrer nouveau mdp 3. Confirmer | Mot de passe mis à jour, connexion OK | 🔄 |
| AUTH-13 | Nouveau mdp trop court | 1. Formulaire nouveau mdp 2. Entrer < 6 chars | Erreur "Mot de passe trop court" | 🔄 |

### 2.3 Protection des Routes

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| AUTH-14 | Accès dashboard non connecté | 1. Déconnexion 2. Accéder à `/dashboard` | Redirection vers `/login` | ✅ |
| AUTH-15 | Accès dev portal sans licence | 1. Connexion user normal 2. Accéder à `/dev` | Redirection vers `/dashboard/developer` | ✅ |
| AUTH-16 | Accès dev portal avec licence | 1. Connexion développeur 2. Accéder à `/dev` | Affichage portail développeur | ✅ |
| AUTH-17 | Déconnexion | 1. Cliquer sur avatar 2. Déconnexion | Redirection vers `/` | ✅ |

---

## 3. Module Store Public

### 3.1 Liste des Skills

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| STORE-01 | Affichage liste skills | 1. Accéder à `/store` | Affichage grille de skills | ✅ |
| STORE-02 | Card skill - informations | 1. Observer une card | Icône, nom, catégorie, prix, badge certifié | ✅ |
| STORE-03 | Recherche textuelle | 1. Taper dans la barre de recherche | Filtrage en temps réel | ✅ |
| STORE-04 | Filtre par catégorie | 1. Ouvrir filtres 2. Sélectionner catégorie | Affichage skills filtrés | ✅ |
| STORE-05 | Filtre gratuit/payant | 1. Ouvrir filtres 2. Sélectionner prix | Affichage skills filtrés | ✅ |
| STORE-06 | Badge compatibilité | 1. Connecté avec robot 2. Observer cards | Badge "X robot(s) compatible(s)" | ✅ |
| STORE-07 | Pas de robots - message | 1. Connecté sans robot 2. Observer cards | Badge "0 compatible" | ✅ |

### 3.2 Page Détail Skill

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| STORE-08 | Accès page détail | 1. Cliquer sur un skill | Affichage page `/skills/[slug]` | ✅ |
| STORE-09 | Onglet Description | 1. Onglet Description actif | Affichage description Markdown | ✅ |
| STORE-10 | Onglet Changelog | 1. Cliquer onglet Changelog | Affichage historique versions | ✅ |
| STORE-11 | Onglet Permissions | 1. Cliquer onglet Permissions | Liste des permissions requises | ✅ |
| STORE-12 | Bouton Acheter (payant) | 1. Skill payant | Bouton "Acheter X €" | ✅ |
| STORE-13 | Bouton Installer (gratuit) | 1. Skill gratuit | Bouton "Installer" | ✅ |
| STORE-14 | Alerte aucun robot | 1. Connecté sans robot 2. Page détail | Alerte "Aucun robot appairé" | ✅ |
| STORE-15 | Skill inexistant | 1. Accéder à `/skills/inexistant` | Page 404 | ✅ |

---

## 4. Module Dashboard Utilisateur

### 4.1 Vue d'ensemble

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| DASH-01 | Affichage dashboard | 1. Accéder à `/dashboard` | Page avec profil et stats | ✅ |
| DASH-02 | Profil utilisateur | 1. Observer section profil | Avatar, nom, email | ✅ |
| DASH-03 | Lien "Mon profil" | 1. Cliquer "Mon profil" | Navigation vers profil | ✅ |
| DASH-04 | Lien "Ajouter robot" | 1. Cliquer "Ajouter robot" | Navigation vers `/dashboard/robots/new` | ✅ |
| DASH-05 | Lien "Parcourir Store" | 1. Cliquer "Parcourir Store" | Navigation vers `/store` | ✅ |
| DASH-06 | Lien programme dev | 1. Non développeur 2. Cliquer lien | Navigation vers `/dashboard/developer` | ✅ |

### 4.2 Gestion des Robots

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| ROBOT-01 | Liste robots vide | 1. Accéder `/dashboard/robots` 2. Sans robots | État vide avec CTA | ✅ |
| ROBOT-02 | Formulaire ajout | 1. Accéder `/dashboard/robots/new` | Formulaire avec OEM, série, nom | ✅ |
| ROBOT-03 | Sélection OEM | 1. Cliquer sur le select OEM | Liste des constructeurs | ✅ |
| ROBOT-04 | Validation numéro série | 1. Laisser vide 2. Soumettre | Message d'erreur | ✅ |
| ROBOT-05 | Ajout robot réussi | 1. Remplir formulaire complet 2. Soumettre | Robot ajouté, toast succès | ✅ |
| ROBOT-06 | Liste avec robots | 1. Après ajout 2. `/dashboard/robots` | Liste des robots affichée | ✅ |
| ROBOT-07 | Suppression robot | 1. Cliquer supprimer 2. Confirmer | Robot supprimé | ✅ |

---

## 5. Module Programme Développeur

### 5.1 Activation Licence

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| DEV-01 | Page activation | 1. Accéder `/dashboard/developer` | Page avec bouton activation | ✅ |
| DEV-02 | Activation réussie | 1. Cliquer "Activer ma licence" | Token affiché, toast succès | ✅ |
| DEV-03 | Token affiché | 1. Après activation | Token format DEV-XXXX-XXXX-XXXX-XXXX | ✅ |
| DEV-04 | Copier token | 1. Cliquer bouton copier | Token copié dans presse-papier | ✅ |
| DEV-05 | Accès portail après activation | 1. Cliquer "Accéder au portail" | Navigation vers `/dev` | ✅ |
| DEV-06 | Double activation impossible | 1. Déjà activé 2. Retenter | Message "licence déjà active" | ✅ |

### 5.2 Portail Développeur

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| DEV-07 | Dashboard développeur | 1. Accéder `/dev` | Vue d'ensemble avec stats | ✅ |
| DEV-08 | Navigation sidebar | 1. Observer sidebar | Liens: Overview, Skills, Soumissions | ✅ |
| DEV-09 | État vide skills | 1. Nouveau développeur 2. `/dev/skills` | Message "Aucun skill" + CTA | ✅ |
| DEV-10 | Bouton nouveau skill | 1. Cliquer "Nouveau Skill" | Navigation vers wizard | ✅ |

---

## 6. Module Wizard Création Skill

### 6.1 Navigation Wizard

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| WIZ-01 | Affichage wizard | 1. Accéder `/dev/skills/new` | 6 étapes affichées | ✅ |
| WIZ-02 | Indicateur progression | 1. Observer barre | Étape courante mise en évidence | ✅ |
| WIZ-03 | Bouton Précédent désactivé | 1. Étape 1 | Bouton grisé | ✅ |
| WIZ-04 | Bouton Suivant désactivé | 1. Formulaire invalide | Bouton grisé | ✅ |
| WIZ-05 | Navigation étapes | 1. Remplir 2. Cliquer Suivant | Passage à l'étape suivante | ✅ |
| WIZ-06 | Retour étape précédente | 1. Cliquer Précédent | Retour avec données conservées | ✅ |

### 6.2 Étape 1 : Identité

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| WIZ-07 | Champs affichés | 1. Étape 1 | Nom, slug, catégorie, éditeur, descriptions, URLs | ✅ |
| WIZ-08 | Auto-génération slug | 1. Taper nom | Slug généré automatiquement | ✅ |
| WIZ-09 | Validation nom (min) | 1. Nom < 3 chars | Erreur affichée | ✅ |
| WIZ-10 | Validation catégorie | 1. Aucune catégorie | Erreur affichée | ✅ |
| WIZ-11 | Validation description courte | 1. < 10 chars | Erreur affichée | ✅ |
| WIZ-12 | Validation description longue | 1. < 50 chars | Erreur affichée | ✅ |
| WIZ-13 | Aperçu en temps réel | 1. Remplir champs | Card preview mise à jour | ✅ |
| WIZ-14 | URLs optionnelles | 1. Laisser vide | Pas d'erreur | ✅ |
| WIZ-15 | URL invalide | 1. Entrer "invalid" | Erreur format URL | ✅ |

### 6.3 Étape 2 : Médias

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| WIZ-16 | Zone upload icône | 1. Étape 2 | Zone drag & drop affichée | ✅ |
| WIZ-17 | Zone upload screenshots | 1. Étape 2 | Zone multi-upload | ✅ |
| WIZ-18 | Upload icône | 1. Sélectionner image 512x512 | Aperçu affiché | ⚠️ |
| WIZ-19 | Validation format icône | 1. Upload fichier non-image | Message d'erreur | ⚠️ |
| WIZ-20 | Upload screenshots | 1. Sélectionner 3+ images | Aperçus affichés | ⚠️ |

> ⚠️ Note: L'upload nécessite la configuration du bucket Supabase Storage

### 6.4 Étape 3 : Compatibilité

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| WIZ-21 | Chargement OEMs | 1. Accéder étape 3 | Liste OEMs affichée | ✅ |
| WIZ-22 | Sélection OEM | 1. Cocher un OEM | OEM sélectionné, compteur mis à jour | ✅ |
| WIZ-23 | Multi-sélection OEMs | 1. Cocher plusieurs | Tous sélectionnés | ✅ |
| WIZ-24 | Validation min 1 OEM | 1. Aucun sélectionné | Erreur affichée | ✅ |
| WIZ-25 | Version firmware optionnelle | 1. Champ firmware vide | Pas d'erreur | ✅ |

### 6.5 Étape 4 : Permissions

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| WIZ-26 | Liste permissions | 1. Étape 4 | Toutes permissions affichées | ✅ |
| WIZ-27 | Badge risque | 1. Observer permissions | Badges low/medium/high | ✅ |
| WIZ-28 | Sélection permission | 1. Cocher une permission | Champ justification apparaît | ✅ |
| WIZ-29 | Justification obligatoire | 1. Sélectionner sans justifier | Erreur affichée | ✅ |
| WIZ-30 | Section Data Usage | 1. Cocher "Collecte données" | Champs additionnels affichés | ✅ |
| WIZ-31 | Endpoints réseau | 1. Cocher "Accès réseau" | Champ endpoints affiché | ✅ |

### 6.6 Étape 5 : Package

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| WIZ-32 | Champ version | 1. Étape 5 | Input version semver | ✅ |
| WIZ-33 | Validation version | 1. Format invalide | Erreur affichée | ✅ |
| WIZ-34 | Niveau de risque | 1. Select risk level | Options low/medium/high/critical | ✅ |
| WIZ-35 | Release notes | 1. Remplir notes | Minimum 10 caractères | ✅ |
| WIZ-36 | Upload package | 1. Sélectionner .zip | Fichier accepté | ⚠️ |
| WIZ-37 | Manifest JSON | 1. Entrer JSON valide | Validation réussie | ✅ |
| WIZ-38 | Manifest invalide | 1. JSON malformé | Erreur de syntaxe | ✅ |

### 6.7 Étape 6 : Validation

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| WIZ-39 | Récapitulatif | 1. Étape 6 | Toutes les données résumées | ✅ |
| WIZ-40 | Bouton soumission | 1. Tout valide | Bouton "Soumettre" actif | ✅ |
| WIZ-41 | Soumission réussie | 1. Cliquer soumettre | Toast succès, redirection `/dev/submissions` | ⚠️ |

### 6.8 Contraintes Niveau Critical

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| WIZ-42 | Risk critical + justif < 100 chars | 1. Sélectionner `emergency` 2. Risk = `critical` 3. Justif 50 chars 4. Suivant | Erreur "Justification minimum 100 caractères" | 🔄 |
| WIZ-43 | Permission emergency sans critical | 1. Sélectionner `emergency` 2. Risk = `high` | Avertissement "La permission emergency requiert le niveau critical" | 🔄 |

---

## 7. Module Pages Statiques

### 7.1 Navigation Générale

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| NAV-01 | Page d'accueil | 1. Accéder à `/` | Hero, features, CTA | ✅ |
| NAV-02 | Header navigation | 1. Observer header | Logo, Store, Catégorie, Populaire | ✅ |
| NAV-03 | Footer liens | 1. Observer footer | Liens produit, développeur, entreprise | ✅ |
| NAV-04 | Responsive mobile | 1. Viewport < 768px | Menu hamburger | ✅ |
| NAV-05 | Page 404 | 1. URL inexistante | Page 404 avec liens retour | ✅ |

---

## 8. Tests de Sécurité

### 8.1 RLS (Row Level Security)

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| SEC-01 | Lecture robots autrui | 1. Requête API robots autre user | Données non retournées | ✅ |
| SEC-02 | Modification skill autrui | 1. Update skill autre développeur | Erreur permission | ✅ |
| SEC-03 | Création licence directe | 1. INSERT developer_licenses via API | Refusé par RLS | ✅ |
| SEC-04 | Accès skills non publiés | 1. Requête skills status != published | Seuls les siens visibles | ✅ |

### 8.2 Autorisation

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| SEC-05 | Route dev sans auth | 1. Déconnecté 2. `/dev` | Redirection login | ✅ |
| SEC-06 | Route dev sans licence | 1. User normal 2. `/dev` | Redirection activation | ✅ |
| SEC-07 | Server action sans auth | 1. Appel createSkill déconnecté | Erreur "Non authentifié" | ✅ |
| SEC-08 | Server action sans licence | 1. User normal 2. createSkill | Erreur "Licence requise" | ✅ |

---

## 9. Tests de Performance

### 9.1 Chargement

| ID | Cas de test | Critère | Résultat attendu | Statut |
|----|-------------|---------|------------------|--------|
| PERF-01 | Page d'accueil | First Load | < 3s | ✅ |
| PERF-02 | Store avec skills | Affichage liste | < 2s | ✅ |
| PERF-03 | Détail skill | Chargement page | < 2s | ✅ |
| PERF-04 | Dashboard | Chargement données | < 2s | ✅ |
| PERF-05 | Wizard step change | Navigation | < 500ms | ✅ |

---

## 10. Module Pipeline de Soumission

### 10.1 Création Submission Targets

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| SUB-01 | Soumission crée targets | 1. Wizard complet 2. Sélectionner 2 OEMs 3. Soumettre | 2 submission_targets créés | 🔄 |
| SUB-02 | Statut initial targets | 1. Après soumission 2. Vérifier status en BDD | Tous en `pending` | 🔄 |
| SUB-03 | Multi-OEM : 3 OEMs | 1. Sélectionner 3 OEMs 2. Soumettre | 3 targets créés (vérifier count) | 🔄 |

### 10.2 Pré-check Automatique

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| SUB-04 | Precheck PASS | 1. Soumission valide 2. Attendre precheck | Transition `platform_review` → `oem_review` | 🔄 |
| SUB-05 | Precheck FAIL | 1. Soumission avec incohérence 2. Attendre precheck | Transition vers `changes_requested` | 🔄 |
| SUB-06 | Rapport precheck affiché | 1. Après precheck 2. Page soumission | Notes de precheck visibles | 🔄 |

### 10.3 Cohérence Permission/Risque

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| SUB-07 | Permission high + risk low | 1. Sélectionner `manipulation` 2. Risk = `low` 3. Soumettre | Precheck FAIL avec erreur explicite | 🔄 |
| SUB-08 | Network sans endpoints | 1. Permission `network` 2. Endpoints vide 3. Soumettre | Precheck FAIL "Endpoints requis" | 🔄 |
| SUB-09 | Risk critical + justif courte | 1. Risk = `critical` 2. Justif < 100 chars | Precheck FAIL "Justification insuffisante" | 🔄 |

### 10.4 Visibilité OEM

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| SUB-10 | Données visibles côté OEM | 1. Connexion OEM 2. Query submission_targets | Targets pour cet OEM visibles | 🔄 |

---

## 11. Module Pairing Robot

### 11.1 Création Demande Pairing

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| PAIR-01 | Création pairing request | 1. Ajouter robot 2. Entrer numéro série 3. Valider | Request créée, statut `pending`, code généré | 🔄 |
| PAIR-02 | Format code challenge | 1. Après création request 2. Observer code | 6 chiffres numériques (000000-999999) | 🔄 |

### 11.2 Validation Pairing

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| PAIR-03 | Confirmation pairing | 1. Request existante 2. Cliquer "Confirmer" | Statut → `confirmed` | 🔄 |
| PAIR-04 | Robot actif après pairing | 1. Après confirmation 2. Page mes robots | Robot visible dans la liste | 🔄 |

### 11.3 Cas d'Erreur

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| PAIR-05 | Pairing expiré | 1. Request > 24h 2. Tenter confirmation | Erreur "Demande expirée" ou statut `expired` | 🔄 |
| PAIR-06 | Code invalide | 1. Entrer mauvais code (simulation) | Erreur "Code incorrect" | 🔄 |

---

## 12. Module Package & Intégrité

### 12.1 Checksum

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| PKG-01 | Checksum calculé | 1. Upload package .zip 2. Vérifier BDD | SHA256 stocké dans skill_versions | 🔄 |
| PKG-02 | Checksum mismatch | 1. Upload package 2. Modifier après checksum | Upload rejeté si vérification active | 🔄 |

### 12.2 Validation Upload

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| PKG-03 | Package trop gros | 1. Upload fichier > 50MB | Erreur "Taille maximale dépassée" | 🔄 |
| PKG-04 | Type MIME invalide | 1. Upload fichier non-zip (.txt, .jpg) | Erreur "Format non supporté" | 🔄 |

### 12.3 URLs Signées

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| PKG-05 | URL signée valide | 1. Générer URL signée 2. Télécharger | Téléchargement réussi | 🔄 |
| PKG-06 | URL signée expirée | 1. URL avec expiration passée 2. Télécharger | Erreur 403 Forbidden | 🔄 |

---

## 13. Module Achat Skills

### 13.1 Processus d'Achat

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| PUR-01 | Bouton Acheter skill payant | 1. Page détail skill payant | Bouton "Acheter X €" visible | 🔄 |
| PUR-02 | Modal confirmation achat | 1. Cliquer "Acheter" | Modal avec prix et confirmation | 🔄 |
| PUR-03 | Simulation achat | 1. Confirmer achat | Toast "Achat simulé", enregistrement en BDD | 🔄 |

### 13.2 Post-Achat

| ID | Cas de test | Étapes | Résultat attendu | Statut |
|----|-------------|--------|------------------|--------|
| PUR-04 | Skill déjà acheté | 1. Retourner sur page skill acheté | Bouton "Installer" au lieu de "Acheter" | 🔄 |

---

## 14. Récapitulatif par Module

| Module | Tests Total | ✅ Passés | ⚠️ Partiels | 🔄 Non testés | ❌ Échecs |
|--------|-------------|-----------|-------------|---------------|-----------|
| Authentification | 17 | 6 | 0 | 11 | 0 |
| Store Public | 15 | 15 | 0 | 0 | 0 |
| Dashboard | 13 | 13 | 0 | 0 | 0 |
| Programme Développeur | 10 | 10 | 0 | 0 | 0 |
| Wizard Création | 43 | 35 | 6 | 2 | 0 |
| Navigation | 5 | 5 | 0 | 0 | 0 |
| Sécurité | 8 | 8 | 0 | 0 | 0 |
| Performance | 5 | 5 | 0 | 0 | 0 |
| **Pipeline Soumission** | **10** | **0** | **0** | **10** | **0** |
| **Pairing Robot** | **6** | **0** | **0** | **6** | **0** |
| **Package & Intégrité** | **6** | **0** | **0** | **6** | **0** |
| **Achat Skills** | **4** | **0** | **0** | **4** | **0** |
| **TOTAL** | **142** | **97** | **6** | **39** | **0** |

> **Note** : Les 39 tests marqués 🔄 correspondent aux nouvelles fonctionnalités documentées (Multi-OEM, Pairing, Package, Purchase, Precheck avancé). Ces tests sont à implémenter dans les phases suivantes du projet.

---

## 15. Anomalies Connues

### 15.1 Limitations Techniques

| ID | Description | Impact | Contournement |
|----|-------------|--------|---------------|
| BUG-01 | Upload fichiers nécessite bucket Storage | Étapes médias/package | Créer buckets manuellement |
| BUG-02 | Confirmation email requise en prod | Inscription bloquante | Désactiver en dev |

### 15.2 Améliorations Suggérées

| ID | Description | Priorité |
|----|-------------|----------|
| IMP-01 | Validation asynchrone du slug (unicité) | Moyenne |
| IMP-02 | Preview markdown en temps réel | Basse |
| IMP-03 | Drag & drop pour réordonner screenshots | Basse |
| IMP-04 | Sauvegarde automatique brouillon | Haute |

---

## 16. Procédure de Test E2E Complète

### 16.1 Prérequis

1. Serveur local démarré (`npm run dev`)
2. Supabase configuré avec `.env.local`
3. Migrations exécutées
4. Bucket Storage créés

### 16.2 Scénario Principal

```
1. Accéder à http://localhost:3000
2. Créer un compte via email/mot de passe
3. Explorer le store et consulter un skill
4. Ajouter un robot via le dashboard
5. Vérifier la compatibilité dans le store
6. Activer le programme développeur
7. Créer un nouveau skill via le wizard
8. Vérifier la soumission dans la liste
```

### 12.3 Données de Test

**Compte test :**
- Email: `e2etest@robotstore.com`
- Mot de passe: `Test123456`

**Skill test :**
- Nom: `Test Skill E2E`
- Catégorie: `navigation`
- Éditeur: `Test Publisher`

---

## 17. Validation Finale

| Critère | Statut |
|---------|--------|
| Toutes les pages accessibles sans erreur 500 | ✅ |
| Navigation fluide entre les modules | ✅ |
| Formulaires avec validation côté client | ✅ |
| Messages d'erreur explicites | ✅ |
| Toasts de confirmation des actions | ✅ |
| Responsive design (mobile/desktop) | ✅ |
| Protection des routes sensibles | ✅ |
| Données utilisateur isolées (RLS) | ✅ |

**Conclusion : POC fonctionnel et prêt pour démonstration**
