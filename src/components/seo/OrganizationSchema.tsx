import Script from 'next/script'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotskills.io'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RobotSkills',
  url: BASE_URL,
  logo: `${BASE_URL}/logors.png`,
  description: 'La marketplace de référence pour les skills et addons robotiques. Plateforme de distribution sécurisée pour les développeurs et constructeurs de robots domestiques.',
  foundingDate: '2025',
  sameAs: [
    // Ajouter les liens vers les réseaux sociaux quand disponibles
    // 'https://twitter.com/robotskills',
    // 'https://linkedin.com/company/robotskills',
    // 'https://github.com/robotskills',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['French', 'English'],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RobotSkills',
  url: BASE_URL,
  description: 'Marketplace de skills et addons pour robots domestiques',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/store?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export function OrganizationSchema() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  )
}
