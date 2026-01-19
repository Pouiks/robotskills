import { getTranslations, getLocale } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('cookiesPage')
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function CookiesPage() {
  const t = await getTranslations('cookiesPage')
  const locale = await getLocale()

  const essentialCookiesList = t.raw('essentialCookiesList') as string[]
  const performanceCookiesList = t.raw('performanceCookiesList') as string[]
  const functionalCookiesList = t.raw('functionalCookiesList') as string[]
  const manageCookiesList = t.raw('manageCookiesList') as string[]
  const refusalConsequencesList = t.raw('refusalConsequencesList') as string[]

  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('lastUpdated')} :{' '}
          {new Date('2026-01-01').toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <h2>1. {t('whatIsCookie')}</h2>
          <p>{t('whatIsCookieText')}</p>

          <h2>2. {t('typesOfCookies')}</h2>

          <h3>2.1 {t('essentialCookies')}</h3>
          <p>{t('essentialCookiesText')}</p>
          <ul>
            {essentialCookiesList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p>
            <strong>{t('duration')} :</strong>{' '}
            {locale === 'en' ? 'Session or up to 30 days' : 'Session ou jusqu\'à 30 jours'}
            <br />
            <strong>{t('legalBasis')} :</strong> {t('legitimateInterest')}
          </p>

          <h3>2.2 {t('performanceCookies')}</h3>
          <p>{t('performanceCookiesText')}</p>
          <ul>
            {performanceCookiesList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p>
            <strong>{t('duration')} :</strong>{' '}
            {locale === 'en' ? 'Up to 2 years' : 'Jusqu\'à 2 ans'}
            <br />
            <strong>{t('legalBasis')} :</strong> {t('consent')}
          </p>

          <h3>2.3 {t('functionalCookies')}</h3>
          <p>{t('functionalCookiesText')}</p>
          <ul>
            {functionalCookiesList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p>
            <strong>{t('duration')} :</strong> {locale === 'en' ? 'Up to 1 year' : 'Jusqu\'à 1 an'}
            <br />
            <strong>{t('legalBasis')} :</strong> {t('consent')}
          </p>

          <h2>3. {t('thirdPartyCookies')}</h2>
          <p>{t('thirdPartyCookiesText')}</p>
          <table>
            <thead>
              <tr>
                <th>{t('service')}</th>
                <th>{t('purpose')}</th>
                <th>{t('policy')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase</td>
                <td>{t('authentication')}</td>
                <td>
                  <a href="https://supabase.com/privacy">{t('see')}</a>
                </td>
              </tr>
              <tr>
                <td>Vercel Analytics</td>
                <td>{t('analytics')}</td>
                <td>
                  <a href="https://vercel.com/legal/privacy-policy">{t('see')}</a>
                </td>
              </tr>
            </tbody>
          </table>

          <h2>4. {t('manageCookies')}</h2>
          <p>{t('manageCookiesText')}</p>
          <ul>
            {manageCookiesList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3>{t('disableInBrowser')}</h3>
          <ul>
            <li>
              <strong>Chrome :</strong>{' '}
              {locale === 'en'
                ? 'Settings → Privacy and security → Cookies'
                : 'Paramètres → Confidentialité et sécurité → Cookies'}
            </li>
            <li>
              <strong>Firefox :</strong>{' '}
              {locale === 'en'
                ? 'Options → Privacy & Security → Cookies'
                : 'Options → Vie privée et sécurité → Cookies'}
            </li>
            <li>
              <strong>Safari :</strong>{' '}
              {locale === 'en'
                ? 'Preferences → Privacy → Cookies'
                : 'Préférences → Confidentialité → Cookies'}
            </li>
            <li>
              <strong>Edge :</strong>{' '}
              {locale === 'en'
                ? 'Settings → Cookies and site permissions'
                : 'Paramètres → Cookies et autorisations de site'}
            </li>
          </ul>

          <h2>5. {t('refusalConsequences')}</h2>
          <p>{t('refusalConsequencesText')}</p>
          <ul>
            {refusalConsequencesList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2>6. {t('modifications')}</h2>
          <p>{t('modificationsText')}</p>

          <h2>7. {t('contact')}</h2>
          <p>{t('contactText')}</p>
        </div>
      </div>
    </div>
  )
}
