import { Home, ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('errors.notFound')
  const tCommon = await getTranslations('common')

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
        <h2 className="text-2xl font-semibold mb-2 -mt-4">{t('title')}</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{t('description')}</p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon('back')}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              {t('backHome')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
