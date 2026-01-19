'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, Camera, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { updateProfile, uploadAvatar } from '@/server/auth'
import type { CurrentUser } from '@/types'

interface ProfileFormProps {
  user: CurrentUser
}

function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '')
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateProfile({ displayName })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profil mis à jour')
        router.refresh()
      }
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadAvatar(formData)

    if (result.error) {
      toast.error(result.error)
    } else if (result.url) {
      setAvatarUrl(result.url)
      toast.success('Avatar mis à jour')
      router.refresh()
    }

    setIsUploading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={isUploading}
          />
        </div>
        <div>
          <p className="text-sm font-medium">Photo de profil</p>
          <p className="text-sm text-muted-foreground">
            PNG, JPEG ou WebP. Max 2MB.
          </p>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Nom d&apos;affichage</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Votre nom"
        />
        <p className="text-sm text-muted-foreground">
          Ce nom sera visible par les autres utilisateurs.
        </p>
      </div>

      {/* Email (readonly) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user.email || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          L&apos;email ne peut pas être modifié.
        </p>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Enregistrer les modifications
          </>
        )}
      </Button>
    </form>
  )
}

interface ProfilePageClientProps {
  user: CurrentUser
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Mettez à jour votre photo et vos informations de profil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          {/* Roles Card */}
          <Card>
            <CardHeader>
              <CardTitle>Rôles et permissions</CardTitle>
              <CardDescription>
                Vos rôles sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Utilisateur</span>
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Actif
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Développeur</span>
                  <span className={`text-sm font-medium ${user.isDeveloper ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {user.isDeveloper ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Actif
                      </span>
                    ) : (
                      'Non activé'
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Administrateur</span>
                  <span className={`text-sm font-medium ${user.isAdmin ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {user.isAdmin ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Actif
                      </span>
                    ) : (
                      'Non activé'
                    )}
                  </span>
                </div>
              </div>

              {user.organizations.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Organisations</h4>
                  <div className="space-y-2">
                    {user.organizations.map((org) => (
                      <div
                        key={org.orgId}
                        className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg"
                      >
                        <span className="text-sm font-medium">{org.orgName}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {org.role} • {org.orgType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
