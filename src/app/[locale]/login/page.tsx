'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Bot, Loader2, AlertTriangle, Eye, EyeOff, Check, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Link } from '@/i18n/navigation'

export default function LoginPage() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode)

  const supabaseConfigured = isSupabaseConfigured()
  const supabase = supabaseConfigured ? createClient() : null

  // Password validation requirements
  const passwordRequirements = useMemo(
    () => [
      { id: 'length', label: t('passwordRequirements.length'), test: (p: string) => p.length >= 8 },
      {
        id: 'uppercase',
        label: t('passwordRequirements.uppercase'),
        test: (p: string) => /[A-Z]/.test(p),
      },
      { id: 'digit', label: t('passwordRequirements.digit'), test: (p: string) => /[0-9]/.test(p) },
      {
        id: 'special',
        label: t('passwordRequirements.special'),
        test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
      },
    ],
    [t]
  )

  // Validation en temps réel du mot de passe
  const passwordValidation = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      valid: req.test(password),
    }))
  }, [password, passwordRequirements])

  const isPasswordValid = useMemo(() => {
    return passwordValidation.every((req) => req.valid)
  }, [passwordValidation])

  // Vérification que les mots de passe correspondent
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    if (!supabase) {
      toast.error(t('errors.notConfigured'))
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      })
      if (error) {
        toast.error(error.message)
      }
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      toast.error(t('errors.notConfigured'))
      return
    }
    if (!email || !password) {
      toast.error(t('errors.fillAllFields'))
      return
    }

    // Validation stricte en mode signup
    if (authMode === 'signup') {
      if (!isPasswordValid) {
        toast.error(t('errors.passwordInvalid'))
        return
      }
      if (!passwordsMatch) {
        toast.error(t('errors.passwordsNoMatch'))
        return
      }
    }

    setIsLoading(true)
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
          },
        })
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error(t('errors.emailExists'))
          } else {
            toast.error(error.message)
          }
        } else {
          toast.success(t('success.accountCreated'))
          setAuthMode('login')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error(t('errors.invalidCredentials'))
          } else {
            toast.error(error.message)
          }
        } else {
          toast.success(t('success.loginSuccess'))
          router.push(redirect)
          router.refresh()
        }
      }
    } catch {
      toast.error(t('errors.generic'))
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
            <CardTitle className="text-2xl">{t('configRequired')}</CardTitle>
            <CardDescription>{t('configMessage')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">{t('configInstructions')}</p>
            <div className="bg-muted p-4 rounded-lg text-sm font-mono">
              <p>NEXT_PUBLIC_SUPABASE_URL=...</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">{t('backToHome')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Bot className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {authMode === 'signup' ? t('signupTitle') : t('loginTitle')}
          </CardTitle>
          <CardDescription>
            {authMode === 'signup' ? t('signupSubtitle') : t('loginSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t('continueWithGoogle')}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {t('continueWithGithub')}
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              {t('or')}
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                {authMode === 'login' && (
                  <Link
                    href="/reset-password"
                    className="text-xs text-muted-foreground hover:text-primary underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                )}
              </div>
              <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Indicateurs de validation (mode inscription uniquement) */}
              {authMode === 'signup' && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordValidation.map((req) => (
                    <div
                      key={req.id}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        req.valid ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`}
                    >
                      {req.valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmation mot de passe (mode inscription uniquement) */}
            {authMode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                    autoComplete="new-password"
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
                {/* Indicateur de correspondance */}
                {confirmPassword.length > 0 && (
                  <div
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                    }`}
                  >
                    {passwordsMatch ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>{t('passwordsMatch')}</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" />
                        <span>{t('passwordsNoMatch')}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (authMode === 'signup' && (!isPasswordValid || !passwordsMatch))}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {authMode === 'signup' ? t('signupButton') : t('loginButton')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {authMode === 'login' ? (
                <>
                  {t('noAccount')}{' '}
                  <button
                    type="button"
                    className="text-primary underline hover:no-underline"
                    onClick={() => {
                      setAuthMode('signup')
                      setConfirmPassword('')
                    }}
                  >
                    {t('createAccount')}
                  </button>
                </>
              ) : (
                <>
                  {t('hasAccount')}{' '}
                  <button
                    type="button"
                    className="text-primary underline hover:no-underline"
                    onClick={() => {
                      setAuthMode('login')
                      setConfirmPassword('')
                    }}
                  >
                    {t('loginButton')}
                  </button>
                </>
              )}
            </p>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {t('termsNotice')}{' '}
            <Link href="/terms" className="underline hover:text-foreground">
              {t('termsLink')}
            </Link>{' '}
            {t('and')}{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              {t('privacyLink')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
