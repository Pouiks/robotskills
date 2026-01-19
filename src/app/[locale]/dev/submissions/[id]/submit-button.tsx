'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { submitForReview } from '@/server/submissions'

interface SubmitButtonProps {
  submissionId: string
  action: 'submit' | 'resubmit'
}

export function SubmitButton({ submissionId, action }: SubmitButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit() {
    setIsLoading(true)
    
    const result = await submitForReview(submissionId)
    
    setIsLoading(false)
    
    if (!result.success) {
      toast.error(result.error || 'Erreur lors de la soumission')
      return
    }

    toast.success(action === 'resubmit' 
      ? 'Re-soumission envoyée !' 
      : 'Soumission envoyée !'
    )
    
    router.refresh()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              En cours...
            </>
          ) : action === 'resubmit' ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-soumettre
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Soumettre
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === 'resubmit' ? 'Re-soumettre pour validation ?' : 'Soumettre pour validation ?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action === 'resubmit' 
              ? 'Votre soumission sera à nouveau validée automatiquement. Assurez-vous d\'avoir corrigé les erreurs identifiées.'
              : 'Votre skill passera par une validation automatique, puis sera envoyé à l\'OEM pour review. Cette action est irréversible.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            {action === 'resubmit' ? 'Re-soumettre' : 'Soumettre'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
