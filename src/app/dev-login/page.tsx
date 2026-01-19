'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

// Page de développement - connexion automatique pour les tests E2E
export default function DevLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Connexion en cours...')

  useEffect(() => {
    async function autoLogin() {
      const supabase = createClient()
      if (!supabase) {
        setStatus('error')
        setMessage('Supabase non configuré')
        return
      }

      try {
        // Essayer de se connecter avec le compte test
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'e2etest@robotstore.com',
          password: 'Test123456',
        })

        if (error) {
          // Si l'utilisateur n'existe pas, le créer
          if (error.message.includes('Invalid login credentials')) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: 'e2etest@robotstore.com',
              password: 'Test123456',
            })

            if (signUpError) {
              setStatus('error')
              setMessage(`Erreur: ${signUpError.message}`)
              return
            }

            if (signUpData.session) {
              setStatus('success')
              setMessage('Compte créé et connecté !')
              setTimeout(() => router.push('/dashboard'), 1000)
              return
            }

            setStatus('error')
            setMessage('Compte créé mais vérification email requise')
            return
          }

          setStatus('error')
          setMessage(`Erreur: ${error.message}`)
          return
        }

        if (data.session) {
          setStatus('success')
          setMessage('Connecté avec succès !')
          setTimeout(() => router.push('/dashboard'), 1000)
        }
      } catch (err) {
        setStatus('error')
        setMessage('Erreur inattendue')
        console.error(err)
      }
    }

    autoLogin()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Connexion Test E2E</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">{message}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-sm text-muted-foreground">Redirection vers le dashboard...</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-600 font-medium">{message}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
