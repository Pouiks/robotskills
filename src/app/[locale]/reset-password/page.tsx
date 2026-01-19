'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Bot, Mail, Loader2, AlertTriangle, KeyRound, ArrowLeft, CheckCircle, Eye, EyeOff, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

// Validation du mot de passe
const passwordRequirements = [
  { id: 'length', label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: '1 majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'digit', label: '1 chiffre', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: '1 caractère spécial (!@#$%...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
]

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Check if we have an access token (password update mode)
  const isUpdateMode = searchParams.get('type') === 'recovery'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false)

  const supabaseConfigured = isSupabaseConfigured()
  const supabase = supabaseConfigured ? createClient() : null

  // Validation en temps réel du mot de passe
  const passwordValidation = useMemo(() => {
    return passwordRequirements.map(req => ({
      ...req,
      valid: req.test(password)
    }))
  }, [password])

  const isPasswordValid = useMemo(() => {
    return passwordValidation.every(req => req.valid)
  }, [passwordValidation])

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  // Handle sending reset email
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      toast.error('Authentification non configurée')
      return
    }
    if (!email) {
      toast.error('Veuillez entrer votre email')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?type=recovery`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        setIsEmailSent(true)
        toast.success('Email de réinitialisation envoyé !')
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle updating password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      toast.error('Authentification non configurée')
      return
    }
    if (!password || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    if (!isPasswordValid) {
      toast.error('Le mot de passe ne respecte pas les critères de sécurité')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        setIsPasswordUpdated(true)
        toast.success('Mot de passe mis à jour avec succès !')
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  // Afficher un message si Supabase n'est pas configuré
  if (!supabaseConfigured) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Configuration requise</CardTitle>
            <CardDescription>
              L&apos;authentification Supabase n&apos;est pas configurée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Password successfully updated
  if (isPasswordUpdated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Mot de passe mis à jour</CardTitle>
            <CardDescription>
              Votre mot de passe a été modifié avec succès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Vous allez être redirigé vers votre tableau de bord...
            </p>
            <Button className="w-full" asChild>
              <Link href="/dashboard">Accéder au tableau de bord</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Update password form (after clicking email link)
  if (isUpdateMode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <KeyRound className="h-7 w-7" />
              </div>
            </div>
            <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
            <CardDescription>
              Choisissez un nouveau mot de passe sécurisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Indicateurs de validation */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordValidation.map((req) => (
                      <div
                        key={req.id}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          req.valid ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                        }`}
                      >
                        {req.valid ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                  }`}>
                    {passwordsMatch ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span>{passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}</span>
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isPasswordValid || !passwordsMatch}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Mettre à jour le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Email sent confirmation
  if (isEmailSent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Vérifiez votre email</CardTitle>
            <CardDescription>
              Un lien de réinitialisation a été envoyé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Nous avons envoyé un email à <strong>{email}</strong> avec un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Le lien expire dans 1 heure. Si vous ne recevez pas l&apos;email, vérifiez votre dossier spam.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsEmailSent(false)}
              >
                Utiliser une autre adresse email
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la connexion
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Request reset form
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Bot className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl">Mot de passe oublié ?</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Envoyer le lien de réinitialisation
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
