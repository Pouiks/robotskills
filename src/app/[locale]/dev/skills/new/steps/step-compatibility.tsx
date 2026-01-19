'use client'

import { useEffect, useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Building2, Loader2 } from 'lucide-react'
import type { SkillCompatibilityInput } from '@/lib/validators/submission'
import { skillCompatibilitySchema } from '@/lib/validators/submission'
import { getAvailableOems } from '@/server/skills'

interface StepCompatibilityProps {
  data: SkillCompatibilityInput | null
  onChange: (data: SkillCompatibilityInput | null) => void
}

interface Oem {
  id: string
  brandName: string
}

export function StepCompatibility({ data, onChange }: StepCompatibilityProps) {
  const [oems, setOems] = useState<Oem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState<Partial<SkillCompatibilityInput>>(
    data || {
      targetOemId: '',
      targetOemIds: [],
      targetModels: [],
      minFirmwareVersion: '',
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Track if user has interacted with the OEM selection
  const [hasInteracted, setHasInteracted] = useState(false)
  
  // Use ref to avoid infinite loop with onChange in useEffect
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Charger les OEMs au montage
  useEffect(() => {
    async function loadOems() {
      try {
        const data = await getAvailableOems()
        setOems(data)
      } catch (error) {
        console.error('Error loading OEMs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadOems()
  }, [])

  useEffect(() => {
    // Utiliser le premier OEM sélectionné comme targetOemId pour la compatibilité avec le schéma existant
    const targetOemIds = form.targetOemIds || []
    const formToValidate = {
      ...form,
      targetOemId: targetOemIds[0] || form.targetOemId || '',
    }
    
    const result = skillCompatibilitySchema.safeParse(formToValidate)
    if (result.success) {
      onChangeRef.current({ ...result.data, targetOemIds })
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

  const toggleOem = (oemId: string) => {
    setHasInteracted(true)
    setForm((prev) => {
      const current = prev.targetOemIds || []
      const newIds = current.includes(oemId)
        ? current.filter((id) => id !== oemId)
        : [...current, oemId]
      return { 
        ...prev, 
        targetOemIds: newIds,
        targetOemId: newIds[0] || '', // Garder la compatibilité
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Compatibilité</h2>
        <p className="text-sm text-muted-foreground">
          Définissez quels robots peuvent utiliser votre skill.
        </p>
      </div>

      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertTitle>OEMs Compatibles</AlertTitle>
        <AlertDescription>
          Sélectionnez tous les constructeurs dont les robots sont compatibles avec votre skill.
          Les utilisateurs verront cette information dans le store.
        </AlertDescription>
      </Alert>

      {/* OEMs Selection */}
      <div className="space-y-3">
        <Label>
          Constructeurs compatibles <span className="text-red-500">*</span>
        </Label>
        
        {oems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun constructeur disponible</p>
        ) : (
          <div className="grid gap-3">
            {oems.map((oem) => {
              const isSelected = (form.targetOemIds || []).includes(oem.id)
              return (
                <label
                  key={oem.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleOem(oem.id)}
                  />
                  <div className="flex-1">
                    <span className="font-medium">{oem.brandName}</span>
                  </div>
                </label>
              )
            })}
          </div>
        )}
        
        {hasInteracted && (form.targetOemIds || []).length === 0 && (
          <p className="text-sm text-red-500">Sélectionnez au moins un constructeur</p>
        )}
        
        {(form.targetOemIds || []).length > 0 && (
          <p className="text-sm text-muted-foreground">
            {(form.targetOemIds || []).length} constructeur(s) sélectionné(s)
          </p>
        )}
      </div>

      {/* Min Firmware */}
      <div className="space-y-2">
        <Label htmlFor="minFirmwareVersion">
          Version minimum du firmware (optionnel)
        </Label>
        <Input
          id="minFirmwareVersion"
          placeholder="2.0.0"
          value={form.minFirmwareVersion || ''}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, minFirmwareVersion: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Laissez vide pour supporter toutes les versions
        </p>
      </div>

      {/* Info about models */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <h4 className="font-medium mb-2">Modèles compatibles</h4>
        <p className="text-sm text-muted-foreground">
          Dans cette version, votre skill sera compatible avec tous les modèles
          des constructeurs sélectionnés. La sélection de modèles spécifiques sera disponible
          dans une version future.
        </p>
      </div>
    </div>
  )
}
