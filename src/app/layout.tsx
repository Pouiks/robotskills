import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { OrganizationSchema } from '@/components/seo/OrganizationSchema'
import { getMe } from '@/server/auth'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotskills.io'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'RobotSkills - Marketplace de Skills Robotiques',
    template: '%s | RobotSkills',
  },
  description:
    'La marketplace de référence pour les skills et addons robotiques. Étendez les capacités de vos robots en toute sécurité.',
  keywords: [
    'robot', 
    'skills', 
    'addons', 
    'marketplace', 
    'robotique', 
    'automatisation',
    'robot domestique',
    'domotique',
    'intelligence artificielle',
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
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
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
    locale: 'fr_FR',
    url: BASE_URL,
    siteName: 'RobotSkills',
    title: 'RobotSkills - Marketplace de Skills Robotiques',
    description: 'La marketplace de référence pour les skills et addons robotiques. Plateforme de distribution sécurisée.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RobotSkills - Marketplace de Skills Robotiques',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RobotSkills - Marketplace de Skills Robotiques',
    description: 'La marketplace de référence pour les skills et addons robotiques.',
    images: ['/og-image.png'],
    creator: '@robotskills',
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    // À remplir avec les vrais codes
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getMe()

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col`}>
        <OrganizationSchema />
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
