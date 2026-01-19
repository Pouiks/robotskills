export const metadata = {
  title: 'Conditions d\'utilisation',
  description: 'Conditions générales d\'utilisation de RobotSkills',
}

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions d'utilisation</h1>
        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : 1er janvier 2026
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <h2>1. Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant RobotSkills ("la Plateforme"), vous acceptez d'être lié 
            par les présentes Conditions d'utilisation. Si vous n'acceptez pas ces conditions, 
            veuillez ne pas utiliser la Plateforme.
          </p>

          <h2>2. Description du service</h2>
          <p>
            RobotSkills est une marketplace permettant aux utilisateurs de découvrir, télécharger 
            et installer des skills (applications) sur leurs robots compatibles. La Plateforme 
            permet également aux développeurs de publier et distribuer leurs skills.
          </p>

          <h2>3. Inscription et compte</h2>
          <p>
            Pour accéder à certaines fonctionnalités de la Plateforme, vous devez créer un compte. 
            Vous vous engagez à :
          </p>
          <ul>
            <li>Fournir des informations exactes et à jour</li>
            <li>Protéger la confidentialité de vos identifiants</li>
            <li>Notifier immédiatement toute utilisation non autorisée de votre compte</li>
            <li>Ne pas créer de compte si vous avez moins de 18 ans</li>
          </ul>

          <h2>4. Utilisation acceptable</h2>
          <p>Vous vous engagez à ne pas :</p>
          <ul>
            <li>Violer les lois applicables ou les droits de tiers</li>
            <li>Publier du contenu illégal, offensant ou malveillant</li>
            <li>Tenter de contourner les mesures de sécurité</li>
            <li>Utiliser la Plateforme à des fins de spam ou de fraude</li>
            <li>Distribuer des malwares ou codes malveillants</li>
          </ul>

          <h2>5. Skills et contenu</h2>
          <p>
            Les skills disponibles sur la Plateforme sont fournis par des développeurs tiers. 
            RobotSkills :
          </p>
          <ul>
            <li>Vérifie la conformité des skills aux standards de sécurité</li>
            <li>Ne garantit pas le fonctionnement parfait de tous les skills</li>
            <li>Se réserve le droit de retirer tout skill non conforme</li>
          </ul>

          <h2>6. Propriété intellectuelle</h2>
          <p>
            La Plateforme et son contenu original sont protégés par les droits d'auteur. 
            Les développeurs conservent la propriété de leurs skills mais accordent à RobotSkills 
            une licence de distribution.
          </p>

          <h2>7. Limitation de responsabilité</h2>
          <p>
            RobotSkills ne saurait être tenu responsable des dommages directs ou indirects 
            résultant de l'utilisation de la Plateforme ou des skills téléchargés.
          </p>

          <h2>8. Modifications</h2>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout moment. 
            Les utilisateurs seront notifiés des changements significatifs.
          </p>

          <h2>9. Résiliation</h2>
          <p>
            Nous pouvons suspendre ou résilier votre accès à la Plateforme en cas de 
            violation de ces conditions, sans préavis.
          </p>

          <h2>10. Droit applicable</h2>
          <p>
            Ces conditions sont régies par le droit français. Tout litige sera soumis 
            aux tribunaux compétents de Paris.
          </p>

          <h2>11. Contact</h2>
          <p>
            Pour toute question concernant ces conditions, contactez-nous à 
            legal@robotskills.io.
          </p>
        </div>
      </div>
    </div>
  )
}
