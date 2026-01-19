export const metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et protection des données de RobotSkills',
}

export default function PrivacyPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Politique de confidentialité</h1>
        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : 1er janvier 2026
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Chez RobotSkills, nous prenons la protection de vos données personnelles très au sérieux. 
            Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
          </p>

          <h2>2. Données collectées</h2>
          <p>Nous collectons les types de données suivants :</p>
          
          <h3>2.1 Données d'identification</h3>
          <ul>
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Photo de profil (optionnelle)</li>
          </ul>

          <h3>2.2 Données d'utilisation</h3>
          <ul>
            <li>Skills téléchargés et installés</li>
            <li>Robots enregistrés</li>
            <li>Historique des actions sur la Plateforme</li>
          </ul>

          <h3>2.3 Données techniques</h3>
          <ul>
            <li>Adresse IP</li>
            <li>Type de navigateur</li>
            <li>Données de connexion</li>
          </ul>

          <h2>3. Utilisation des données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>Fournir et améliorer nos services</li>
            <li>Personnaliser votre expérience</li>
            <li>Assurer la sécurité de la Plateforme</li>
            <li>Communiquer avec vous (notifications, support)</li>
            <li>Analyser l'utilisation de la Plateforme</li>
          </ul>

          <h2>4. Partage des données</h2>
          <p>
            Nous ne vendons jamais vos données personnelles. Nous pouvons partager certaines 
            informations avec :
          </p>
          <ul>
            <li>Les développeurs de skills (données anonymisées d'utilisation)</li>
            <li>Nos prestataires techniques (hébergement, analytics)</li>
            <li>Les autorités si requis par la loi</li>
          </ul>

          <h2>5. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
            pour protéger vos données :
          </p>
          <ul>
            <li>Chiffrement des données en transit et au repos</li>
            <li>Accès restreint aux données personnelles</li>
            <li>Audits de sécurité réguliers</li>
            <li>Formation de notre personnel</li>
          </ul>

          <h2>6. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Rectification</strong> : corriger vos données inexactes</li>
            <li><strong>Effacement</strong> : demander la suppression de vos données</li>
            <li><strong>Portabilité</strong> : recevoir vos données dans un format structuré</li>
            <li><strong>Opposition</strong> : vous opposer au traitement de vos données</li>
            <li><strong>Limitation</strong> : limiter le traitement de vos données</li>
          </ul>

          <h2>7. Conservation des données</h2>
          <p>
            Nous conservons vos données personnelles aussi longtemps que votre compte est actif. 
            Après suppression de votre compte, certaines données peuvent être conservées pour 
            des raisons légales (facturation, litiges) pendant une durée maximale de 5 ans.
          </p>

          <h2>8. Cookies</h2>
          <p>
            Nous utilisons des cookies pour améliorer votre expérience. Consultez notre 
            <a href="/cookies"> Politique de cookies</a> pour plus d'informations.
          </p>

          <h2>9. Transferts internationaux</h2>
          <p>
            Vos données peuvent être transférées vers des serveurs situés dans l'Union Européenne. 
            Nous nous assurons que ces transferts respectent les standards de protection adéquats.
          </p>

          <h2>10. Modifications</h2>
          <p>
            Cette politique peut être mise à jour. Nous vous informerons de tout changement 
            significatif par email ou notification sur la Plateforme.
          </p>

          <h2>11. Contact</h2>
          <p>
            Pour exercer vos droits ou pour toute question, contactez notre DPO à 
            privacy@robotskills.io.
          </p>
        </div>
      </div>
    </div>
  )
}
