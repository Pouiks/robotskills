import { ChevronLeft, Rocket, CheckCircle, ArrowRight, FileText, Upload, Building2, CreditCard } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export async function generateMetadata() {
  const t = await getTranslations('docsGettingStarted')
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function GettingStartedPage() {
  const t = await getTranslations('docsGettingStarted')

  const stepIcons = [CreditCard, FileText, Building2, Upload]

  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-4xl">
        {/* Back */}
        <Link
          href="/docs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('backToDocs')}
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">{t('title')}</h1>
          </div>
          <p className="text-xl text-muted-foreground">{t('publishIn4Steps')}</p>
        </div>

        {/* Important Note */}
        <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{t('note')} :</strong> {t('noteText')}
            </p>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((index) => {
            const StepIcon = stepIcons[index - 1]
            const stepKey = index.toString() as '1' | '2' | '3' | '4'
            const details = t.raw(`steps.${stepKey}.details`) as string[]

            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <StepIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('step')} {index}
                      </div>
                      <CardTitle>{t(`steps.${stepKey}.title`)}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{t(`steps.${stepKey}.description`)}</p>
                  <ul className="space-y-2">
                    {details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Success */}
        <Card className="mt-8 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  {t('afterValidation')}
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">{t('afterValidationText')}</p>
                <Button variant="outline" asChild>
                  <Link href="/dev/join">
                    {t('becomeDeveloper')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">{t('usefulResources')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="card-hover">
              <CardContent className="p-4">
                <Link href="/docs/submission-guidelines" className="flex items-center justify-between">
                  <span className="font-medium">{t('submissionGuidelines')}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <Link href="/docs/oem-resources" className="flex items-center justify-between">
                  <span className="font-medium">{t('oemResources')}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <Link href="/docs/faq" className="flex items-center justify-between">
                  <span className="font-medium">{t('developerFaq')}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <Link href="/dev" className="flex items-center justify-between">
                  <span className="font-medium">{t('developerSpace')}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
