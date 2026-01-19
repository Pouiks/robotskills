'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { StepIdentity } from './steps/step-identity'
import { StepAssets } from './steps/step-assets'
import { StepCompatibility } from './steps/step-compatibility'
import { StepPermissions } from './steps/step-permissions'
import { StepPackage } from './steps/step-package'
import { StepReview } from './steps/step-review'

import type {
  SkillIdentityInput,
  SkillAssetsInput,
  SkillCompatibilityInput,
  SkillPermissionsInput,
  SkillPackageInput,
} from '@/lib/validators/submission'

import {
  createSkill,
  updateSkillAssets,
  createVersionAndSubmit,
  submitForReview,
} from '@/server/submissions'
import { updateSkillCompatibility } from '@/server/skills'

const steps = [
  { id: 'identity', title: 'Identité', description: 'Informations de base' },
  { id: 'assets', title: 'Médias', description: 'Icône et screenshots' },
  { id: 'compatibility', title: 'Compatibilité', description: 'OEM et robots cibles' },
  { id: 'permissions', title: 'Permissions', description: 'Accès et données' },
  { id: 'package', title: 'Package', description: 'Version et fichiers' },
  { id: 'review', title: 'Validation', description: 'Récapitulatif' },
]

export interface WizardData {
  identity: SkillIdentityInput | null
  assets: SkillAssetsInput | null
  compatibility: SkillCompatibilityInput | null
  permissions: SkillPermissionsInput | null
  package: SkillPackageInput | null
  skillId: string | null
}

export function SkillWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<WizardData>({
    identity: null,
    assets: null,
    compatibility: null,
    permissions: null,
    package: null,
    skillId: null,
  })

  const updateData = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.identity !== null
      case 1:
        return data.assets !== null
      case 2:
        return data.compatibility !== null
      case 3:
        return data.permissions !== null
      case 4:
        return data.package !== null
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (currentStep === 0 && data.identity && !data.skillId) {
      // Create skill after identity step
      setIsSubmitting(true)
      const result = await createSkill(data.identity)
      setIsSubmitting(false)

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de la création')
        return
      }

      updateData('skillId', result.skillId!)
      toast.success('Skill créé !')
    }

    if (currentStep === 1 && data.assets && data.skillId) {
      // Update assets after media step
      setIsSubmitting(true)
      const result = await updateSkillAssets(data.skillId, data.assets)
      setIsSubmitting(false)

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de l\'upload')
        return
      }
    }

    if (currentStep === 2 && data.compatibility && data.skillId) {
      // Save OEM compatibility after compatibility step
      const oemIds = data.compatibility.targetOemIds || 
        (data.compatibility.targetOemId ? [data.compatibility.targetOemId] : [])
      
      if (oemIds.length > 0) {
        setIsSubmitting(true)
        const result = await updateSkillCompatibility(data.skillId, oemIds)
        setIsSubmitting(false)

        if (!result.success) {
          toast.error(result.error || 'Erreur lors de la sauvegarde de la compatibilité')
          return
        }
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!data.skillId || !data.package || !data.permissions || !data.compatibility) {
      toast.error('Données incomplètes')
      return
    }

    setIsSubmitting(true)

    // Create version and submission
    const result = await createVersionAndSubmit(
      data.skillId,
      data.package,
      data.permissions,
      data.compatibility
    )

    if (!result.success) {
      setIsSubmitting(false)
      toast.error(result.error || 'Erreur lors de la soumission')
      return
    }

    // Submit for review
    const submitResult = await submitForReview(result.submissionId!)
    setIsSubmitting(false)

    if (!submitResult.success) {
      toast.error(submitResult.error || 'Erreur lors de l\'envoi en review')
      return
    }

    toast.success('Skill soumis pour validation !')
    router.push('/dev/submissions')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepIdentity
            data={data.identity}
            onChange={(value) => updateData('identity', value)}
          />
        )
      case 1:
        return (
          <StepAssets
            data={data.assets}
            onChange={(value) => updateData('assets', value)}
            skillId={data.skillId}
          />
        )
      case 2:
        return (
          <StepCompatibility
            data={data.compatibility}
            onChange={(value) => updateData('compatibility', value)}
          />
        )
      case 3:
        return (
          <StepPermissions
            data={data.permissions}
            onChange={(value) => updateData('permissions', value)}
          />
        )
      case 4:
        return (
          <StepPackage
            data={data.package}
            onChange={(value) => updateData('package', value)}
            skillId={data.skillId}
          />
        )
      case 5:
        return <StepReview data={data} />
      default:
        return null
    }
  }

  return (
    <div>
      {/* Progress Steps */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                'relative',
                index !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''
              )}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors',
                    index < currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : index === currentStep
                        ? 'border-primary text-primary'
                        : 'border-muted text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      'hidden sm:block absolute top-5 left-10 w-full h-0.5',
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
              <div className="mt-2 hidden sm:block">
                <span
                  className={cn(
                    'text-sm font-medium',
                    index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Current Step Content */}
      <Card>
        <CardContent className="p-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Soumission...
              </>
            ) : (
              <>
                Soumettre pour validation
                <Check className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
