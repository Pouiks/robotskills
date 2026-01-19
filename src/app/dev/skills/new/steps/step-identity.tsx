'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SkillIdentityInput } from '@/lib/validators/submission'
import { skillIdentitySchema } from '@/lib/validators/submission'
import { SKILL_CATEGORIES } from '@/types'

interface StepIdentityProps {
  data: SkillIdentityInput | null
  onChange: (data: SkillIdentityInput | null) => void
}

export function StepIdentity({ data, onChange }: StepIdentityProps) {
  const [form, setForm] = useState<Partial<SkillIdentityInput>>(
    data || {
      name: '',
      slug: '',
      category: undefined,
      publisherName: '',
      shortDescription: '',
      descriptionMd: '',
      supportUrl: '',
      privacyUrl: '',
      termsUrl: '',
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Track which fields have been interacted with
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  // Use ref to avoid infinite loop with onChange in useEffect
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Auto-generate slug from name
  useEffect(() => {
    if (form.name && !data?.slug) {
      const slug = form.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setForm((prev) => ({ ...prev, slug }))
    }
  }, [form.name, data?.slug])

  // Validate and update parent
  useEffect(() => {
    const result = skillIdentitySchema.safeParse(form)
    if (result.success) {
      onChangeRef.current(result.data)
      setErrors({})
    } else {
      onChangeRef.current(null)
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as string] = issue.message
      })
      setErrors(newErrors)
    }
  }, [form])

  const updateField = <K extends keyof SkillIdentityInput>(
    field: K,
    value: SkillIdentityInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Mark field as touched when user types
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  // Mark field as touched on blur
  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  // Only show error if field has been touched
  const getError = useCallback((field: string) => {
    return touched[field] ? errors[field] : undefined
  }, [touched, errors])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Identité du Skill</h2>
        <p className="text-sm text-muted-foreground">
          Informations de base de votre skill, affichées dans le store.
        </p>
      </div>

      {/* Live Preview Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Aperçu dans le store</p>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Package className="h-8 w-8 text-primary/60" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">
                  {form.name || 'Nom du skill'}
                </h3>
                {form.category && (
                  <Badge variant="outline" className="capitalize text-xs">
                    {form.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {form.shortDescription || 'Description courte de votre skill...'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Par {form.publisherName || 'Éditeur'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nom du skill <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Mon Super Skill"
            value={form.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            onBlur={() => handleBlur('name')}
          />
          {getError('name') && (
            <p className="text-sm text-red-500">{getError('name')}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug (URL) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            placeholder="mon-super-skill"
            value={form.slug || ''}
            onChange={(e) => updateField('slug', e.target.value)}
            onBlur={() => handleBlur('slug')}
          />
          {getError('slug') && (
            <p className="text-sm text-red-500">{getError('slug')}</p>
          )}
          <p className="text-xs text-muted-foreground">
            URL: /skills/{form.slug || 'mon-super-skill'}
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Catégorie <span className="text-red-500">*</span>
          </Label>
          <Select
            value={form.category}
            onValueChange={(value) => updateField('category', value as SkillIdentityInput['category'])}
            onOpenChange={(open) => { if (!open) handleBlur('category') }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {SKILL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getError('category') && (
            <p className="text-sm text-red-500">{getError('category')}</p>
          )}
        </div>

        {/* Publisher Name */}
        <div className="space-y-2">
          <Label htmlFor="publisherName">
            Nom de l&apos;éditeur <span className="text-red-500">*</span>
          </Label>
          <Input
            id="publisherName"
            placeholder="MonEntreprise ou Votre nom"
            value={form.publisherName || ''}
            onChange={(e) => updateField('publisherName', e.target.value)}
            onBlur={() => handleBlur('publisherName')}
          />
          {getError('publisherName') && (
            <p className="text-sm text-red-500">{getError('publisherName')}</p>
          )}
        </div>
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label htmlFor="shortDescription">
          Description courte <span className="text-red-500">*</span>
        </Label>
        <Input
          id="shortDescription"
          placeholder="Une phrase résumant votre skill..."
          value={form.shortDescription || ''}
          onChange={(e) => updateField('shortDescription', e.target.value)}
          onBlur={() => handleBlur('shortDescription')}
          maxLength={140}
        />
        <div className="flex items-center justify-between text-xs">
          <span className={
            (form.shortDescription?.length || 0) >= 10
              ? 'text-green-600 dark:text-green-400'
              : touched['shortDescription'] 
                ? 'text-red-500' 
                : 'text-foreground'
          }>
            {(form.shortDescription?.length || 0) >= 10 ? '✓ ' : ''}min. 10 caractères
          </span>
          <span className={
            (form.shortDescription?.length || 0) > 130
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-muted-foreground'
          }>
            {form.shortDescription?.length || 0}/140
          </span>
        </div>
      </div>

      {/* Long Description */}
      <div className="space-y-2">
        <Label htmlFor="descriptionMd">
          Description complète (Markdown) <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="descriptionMd"
          placeholder="# Description&#10;&#10;Décrivez en détail les fonctionnalités de votre skill..."
          value={form.descriptionMd || ''}
          onChange={(e) => updateField('descriptionMd', e.target.value)}
          onBlur={() => handleBlur('descriptionMd')}
          rows={8}
        />
        <div className="text-xs">
          <span className={
            (form.descriptionMd?.length || 0) >= 50
              ? 'text-green-600 dark:text-green-400'
              : touched['descriptionMd'] 
                ? 'text-red-500' 
                : 'text-foreground'
          }>
            {(form.descriptionMd?.length || 0) >= 50 ? '✓ ' : ''}{form.descriptionMd?.length || 0} caractères (min. 50)
          </span>
        </div>
      </div>

      {/* URLs */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="supportUrl">URL de support</Label>
          <Input
            id="supportUrl"
            type="url"
            placeholder="https://support.example.com"
            value={form.supportUrl || ''}
            onChange={(e) => updateField('supportUrl', e.target.value)}
            onBlur={() => handleBlur('supportUrl')}
          />
          {getError('supportUrl') && (
            <p className="text-sm text-red-500">{getError('supportUrl')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="privacyUrl">Politique de confidentialité</Label>
          <Input
            id="privacyUrl"
            type="url"
            placeholder="https://example.com/privacy"
            value={form.privacyUrl || ''}
            onChange={(e) => updateField('privacyUrl', e.target.value)}
            onBlur={() => handleBlur('privacyUrl')}
          />
          {getError('privacyUrl') && (
            <p className="text-sm text-red-500">{getError('privacyUrl')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="termsUrl">Conditions d&apos;utilisation</Label>
          <Input
            id="termsUrl"
            type="url"
            placeholder="https://example.com/terms"
            value={form.termsUrl || ''}
            onChange={(e) => updateField('termsUrl', e.target.value)}
            onBlur={() => handleBlur('termsUrl')}
          />
          {getError('termsUrl') && (
            <p className="text-sm text-red-500">{getError('termsUrl')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
