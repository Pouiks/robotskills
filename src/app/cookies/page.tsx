export const metadata = {
  title: 'Politique de cookies',
  description: 'Politique de cookies de RobotSkills',
}

export default function CookiesPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Politique de cookies</h1>
        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : 1er janvier 2026
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <h2>1. Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez 
            un site web. Les cookies permettent au site de mémoriser vos actions et préférences 
            (connexion, langue, taille de police, etc.) pendant une durée déterminée.
          </p>

          <h2>2. Types de cookies utilisés</h2>

          <h3>2.1 Cookies essentiels</h3>
          <p>
            Ces cookies sont nécessaires au fonctionnement de la Plateforme. Ils permettent :
          </p>
          <ul>
            <li>L'authentification et la gestion de session</li>
            <li>La sécurité de votre compte</li>
            <li>Le bon fonctionnement des fonctionnalités de base</li>
          </ul>
          <p>
            <strong>Durée :</strong> Session ou jusqu'à 30 jours<br />
            <strong>Base légale :</strong> Intérêt légitime
          </p>

          <h3>2.2 Cookies de performance</h3>
          <p>
            Ces cookies nous aident à comprendre comment vous utilisez la Plateforme :
          </p>
          <ul>
            <li>Pages visitées et temps passé</li>
            <li>Erreurs rencontrées</li>
            <li>Performance des fonctionnalités</li>
          </ul>
          <p>
            <strong>Durée :</strong> Jusqu'à 2 ans<br />
            <strong>Base légale :</strong> Consentement
          </p>

          <h3>2.3 Cookies de fonctionnalité</h3>
          <p>
            Ces cookies permettent d'améliorer votre expérience :
          </p>
          <ul>
            <li>Mémorisation de vos préférences</li>
            <li>Personnalisation de l'interface</li>
            <li>Historique de recherche</li>
          </ul>
          <p>
            <strong>Durée :</strong> Jusqu'à 1 an<br />
            <strong>Base légale :</strong> Consentement
          </p>

          <h2>3. Cookies tiers</h2>
          <p>Nous utilisons des services tiers qui peuvent déposer des cookies :</p>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Finalité</th>
                <th>Politique</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase</td>
                <td>Authentification</td>
                <td><a href="https://supabase.com/privacy">Voir</a></td>
              </tr>
              <tr>
                <td>Vercel Analytics</td>
                <td>Analytics</td>
                <td><a href="https://vercel.com/legal/privacy-policy">Voir</a></td>
              </tr>
            </tbody>
          </table>

          <h2>4. Gestion des cookies</h2>
          <p>
            Vous pouvez gérer vos préférences de cookies à tout moment :
          </p>
          <ul>
            <li>Via la bannière de consentement sur notre site</li>
            <li>Dans les paramètres de votre navigateur</li>
          </ul>

          <h3>Désactiver les cookies dans votre navigateur</h3>
          <ul>
            <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
            <li><strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies</li>
            <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
            <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
          </ul>

          <h2>5. Conséquences du refus</h2>
          <p>
            Si vous refusez certains cookies, certaines fonctionnalités de la Plateforme 
            peuvent ne pas fonctionner correctement :
          </p>
          <ul>
            <li>Vous devrez vous reconnecter à chaque visite</li>
            <li>Vos préférences ne seront pas mémorisées</li>
            <li>Certaines fonctionnalités personnalisées seront désactivées</li>
          </ul>

          <h2>6. Modifications</h2>
          <p>
            Cette politique peut être mise à jour pour refléter les changements dans notre 
            utilisation des cookies. La date de dernière mise à jour est indiquée en haut de page.
          </p>

          <h2>7. Contact</h2>
          <p>
            Pour toute question concernant notre utilisation des cookies, contactez-nous à 
            privacy@robotskills.io.
          </p>
        </div>
      </div>
    </div>
  )
}
