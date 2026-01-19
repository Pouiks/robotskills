import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { OrganizationSchema } from '@/components/seo/OrganizationSchema'
import { getMe } from '@/server/auth'
import { locales, type Locale } from '@/i18n/config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotskills.io'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<Locale, { default: string; template: string }> = {
    fr: {
      default: 'RobotSkills - Marketplace de Skills Robotiques',
      template: '%s | RobotSkills',
    },
    en: {
      default: 'RobotSkills - Robotic Skills Marketplace',
      template: '%s | RobotSkills',
    },
  }

  const descriptions: Record<Locale, string> = {
    fr: 'La marketplace de référence pour les skills et addons robotiques. Étendez les capacités de vos robots en toute sécurité.',
    en: 'The reference marketplace for robotic skills and addons. Extend your robots capabilities safely.',
  }

  const ogDescriptions: Record<Locale, string> = {
    fr: 'La marketplace de référence pour les skills et addons robotiques. Plateforme de distribution sécurisée.',
    en: 'The reference marketplace for robotic skills and addons. Secure distribution platform.',
  }

  const currentLocale = (locale as Locale) || 'fr'
  const ogLocale = currentLocale === 'fr' ? 'fr_FR' : 'en_US'

  return {
    metadataBase: new URL(BASE_URL),
    title: titles[currentLocale],
    description: descriptions[currentLocale],
    keywords: [
      'robot',
      'skills',
      'addons',
      'marketplace',
      currentLocale === 'fr' ? 'robotique' : 'robotics',
      currentLocale === 'fr' ? 'automatisation' : 'automation',
      currentLocale === 'fr' ? 'robot domestique' : 'domestic robot',
      currentLocale === 'fr' ? 'domotique' : 'home automation',
      currentLocale === 'fr' ? 'intelligence artificielle' : 'artificial intelligence',
      'IoT',
    ],
    authors: [{ name: 'RobotSkills' }],
    creator: 'RobotSkills',
    publisher: 'RobotSkills',
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [{ rel: 'manifest', url: '/site.webmanifest' }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url: `${BASE_URL}/${currentLocale}`,
      siteName: 'RobotSkills',
      title: titles[currentLocale].default,
      description: ogDescriptions[currentLocale],
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: titles[currentLocale].default,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[currentLocale].default,
      description: descriptions[currentLocale],
      images: ['/og-image.png'],
      creator: '@robotskills',
    },
    alternates: {
      canonical: `${BASE_URL}/${currentLocale}`,
      languages: {
        fr: `${BASE_URL}/fr`,
        en: `${BASE_URL}/en`,
        'x-default': `${BASE_URL}/fr`,
      },
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Providing all messages to the client side
  const messages = await getMessages()
  const user = await getMe()

  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <OrganizationSchema />
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </NextIntlClientProvider>
    </>
  )
}
