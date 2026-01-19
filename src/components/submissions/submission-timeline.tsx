'use client'

import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Send,
  Eye,
  Building2
} from 'lucide-react'

export interface TimelineStep {
  id: string
  label: string
  description?: string
  status: 'completed' | 'current' | 'pending' | 'error'
  timestamp?: string
}

interface SubmissionTimelineProps {
  currentStatus: string
  createdAt?: string
  submittedAt?: string
  platformReviewAt?: string
  oemReviewedAt?: string
}

const statusOrder = [
  'draft',
  'submitted',
  'platform_review',
  'oem_review',
  'approved',
  'rejected',
  'changes_requested',
]

export function SubmissionTimeline({
  currentStatus,
  createdAt,
  submittedAt,
  platformReviewAt,
  oemReviewedAt,
}: SubmissionTimelineProps) {
  // Build steps based on current status
  const steps: TimelineStep[] = []

  // Step 1: Draft
  steps.push({
    id: 'draft',
    label: 'Brouillon',
    description: 'Soumission créée',
    status: 'completed',
    timestamp: createdAt,
  })

  // Step 2: Submitted
  const isSubmitted = ['submitted', 'platform_review', 'oem_review', 'approved', 'rejected', 'changes_requested'].includes(currentStatus)
  steps.push({
    id: 'submitted',
    label: 'Soumis',
    description: 'En attente de validation',
    status: isSubmitted ? 'completed' : currentStatus === 'draft' ? 'pending' : 'pending',
    timestamp: submittedAt,
  })

  // Step 3: Platform Review
  const platformReviewed = ['oem_review', 'approved', 'rejected', 'changes_requested'].includes(currentStatus)
  const isPlatformReviewing = currentStatus === 'platform_review'
  steps.push({
    id: 'platform_review',
    label: 'Validation automatique',
    description: platformReviewed ? 'Vérification terminée' : 'Vérification du manifest et package',
    status: platformReviewed 
      ? (currentStatus === 'changes_requested' ? 'error' : 'completed')
      : isPlatformReviewing 
        ? 'current' 
        : 'pending',
    timestamp: platformReviewAt,
  })

  // If changes requested, show that instead of OEM review
  if (currentStatus === 'changes_requested') {
    steps.push({
      id: 'changes_requested',
      label: 'Modifications requises',
      description: 'Corrigez les erreurs et re-soumettez',
      status: 'error',
      timestamp: platformReviewAt,
    })
  } else {
    // Step 4: OEM Review
    const oemReviewed = ['approved', 'rejected'].includes(currentStatus)
    const isOemReviewing = currentStatus === 'oem_review'
    steps.push({
      id: 'oem_review',
      label: 'Review OEM',
      description: oemReviewed ? 'Examen terminé' : 'En attente de décision OEM',
      status: oemReviewed 
        ? (currentStatus === 'rejected' ? 'error' : 'completed')
        : isOemReviewing 
          ? 'current' 
          : 'pending',
      timestamp: oemReviewedAt,
    })

    // Step 5: Final status
    if (currentStatus === 'approved') {
      steps.push({
        id: 'approved',
        label: 'Approuvé',
        description: 'Publié dans le store',
        status: 'completed',
        timestamp: oemReviewedAt,
      })
    } else if (currentStatus === 'rejected') {
      steps.push({
        id: 'rejected',
        label: 'Rejeté',
        description: 'Non approuvé par l\'OEM',
        status: 'error',
        timestamp: oemReviewedAt,
      })
    }
  }

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        
        return (
          <div key={step.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  step.status === 'completed'
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : step.status === 'current'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 ring-4 ring-blue-100 dark:ring-blue-900/50'
                      : step.status === 'error'
                        ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}
              >
                {step.status === 'completed' && <CheckCircle className="h-5 w-5" />}
                {step.status === 'current' && <Clock className="h-5 w-5 animate-pulse" />}
                {step.status === 'error' && (
                  step.id === 'changes_requested' ? <AlertTriangle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />
                )}
                {step.status === 'pending' && <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-12 ${
                    step.status === 'completed' || step.status === 'error'
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-center gap-2">
                <h4
                  className={`font-medium ${
                    step.status === 'pending' ? 'text-muted-foreground' : ''
                  }`}
                >
                  {step.label}
                </h4>
                {step.status === 'current' && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    En cours
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {step.timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(step.timestamp).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
