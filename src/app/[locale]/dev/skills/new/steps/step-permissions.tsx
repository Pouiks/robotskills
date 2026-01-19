'use client'

import { useEffect, useState, useRef } from 'react'
import { Shield, AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import type { SkillPermissionsInput } from '@/lib/validators/submission'
import { skillPermissionsSchema, availablePermissions } from '@/lib/validators/submission'

// Permissions à haut risque nécessitant une justification détaillée
const HIGH_RISK_PERMISSIONS = ['manipulation', 'emergency', 'camera', 'microphone']
const MEDIUM_RISK_PERMISSIONS = ['navigation', 'sensors', 'network']

interface StepPermissionsProps {
  data: SkillPermissionsInput | null
  onChange: (data: SkillPermissionsInput | null) => void
}

export function StepPermissions({ data, onChange }: StepPermissionsProps) {
  const [form, setForm] = useState<Partial<SkillPermissionsInput>>(
    data || {
      permissions: [],
      dataUsage: {
        collectsData: false,
        dataTypes: [],
        retentionDays: null,
        sharesWithThirdParties: false,
        endpoints: [],
      },
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Use ref to avoid infinite loop with onChange in useEffect
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const result = skillPermissionsSchema.safeParse(form)
    if (result.success) {
      onChangeRef.current(result.data)
      setErrors({})
    } else {
      onChangeRef.current(null)
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        newErrors[path] = issue.message
      })
      setErrors(newErrors)
    }
  }, [form])

  const togglePermission = (permId: string) => {
    const existing = form.permissions?.find((p) => p.name === permId)
    if (existing) {
      setForm((prev) => ({
        ...prev,
        permissions: prev.permissions?.filter((p) => p.name !== permId) || [],
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        permissions: [
          ...(prev.permissions || []),
          { name: permId, justification: '' },
        ],
      }))
    }
  }

  const updateJustification = (permId: string, justification: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions?.map((p) =>
        p.name === permId ? { ...p, justification } : p
      ) || [],
    }))
  }

  const updateDataUsage = (
    field: keyof NonNullable<typeof form.dataUsage>,
    value: unknown
  ) => {
    setForm((prev) => ({
      ...prev,
      dataUsage: {
        ...prev.dataUsage!,
        [field]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Permissions & Données</h2>
        <p className="text-sm text-muted-foreground">
          Déclarez les permissions requises et l&apos;usage des données utilisateur.
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Transparence requise</AlertTitle>
        <AlertDescription>
          Chaque permission doit être justifiée. Ces informations seront visibles
          par les utilisateurs et les OEM lors de la validation.
        </AlertDescription>
      </Alert>

      {/* Permissions */}
      <div className="space-y-4">
        <Label>Permissions demandées ({form.permissions?.length || 0})</Label>
        <div className="grid gap-4">
          {availablePermissions.map((perm) => {
            const selected = form.permissions?.find((p) => p.name === perm.id)
            const isHighRisk = HIGH_RISK_PERMISSIONS.includes(perm.id)
            const isMediumRisk = MEDIUM_RISK_PERMISSIONS.includes(perm.id)
            
            return (
              <div 
                key={perm.id} 
                className={`rounded-lg border p-4 transition-colors ${
                  selected 
                    ? isHighRisk 
                      ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                      : isMediumRisk
                        ? 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30'
                        : 'border-primary bg-primary/5'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={perm.id}
                    checked={!!selected}
                    onCheckedChange={() => togglePermission(perm.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <label
                        htmlFor={perm.id}
                        className="font-medium cursor-pointer"
                      >
                        {perm.name}
                      </label>
                      {isHighRisk && (
                        <Badge variant="destructive" className="text-xs">
                          Haut risque
                        </Badge>
                      )}
                      {isMediumRisk && (
                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-600 dark:text-orange-400">
                          Risque moyen
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {perm.description}
                    </p>
                    {selected && (
                      <div className="mt-3 space-y-3">
                        {isHighRisk && (
                          <Alert variant="destructive" className="py-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              Cette permission nécessite une justification détaillée et sera examinée attentivement par les OEMs.
                            </AlertDescription>
                          </Alert>
                        )}
                        <div>
                          <Label htmlFor={`just-${perm.id}`} className="text-sm">
                            Justification <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id={`just-${perm.id}`}
                            placeholder={isHighRisk 
                              ? "Expliquez en détail pourquoi cette permission sensible est nécessaire et comment elle sera utilisée de manière responsable..."
                              : "Expliquez pourquoi cette permission est nécessaire..."
                            }
                            value={selected.justification}
                            onChange={(e) =>
                              updateJustification(perm.id, e.target.value)
                            }
                            className="mt-1"
                            rows={isHighRisk ? 3 : 2}
                          />
                          {errors[`permissions.${form.permissions?.indexOf(selected)}.justification`] && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors[`permissions.${form.permissions?.indexOf(selected)}.justification`]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Network Endpoints - Show if network permission is selected */}
      {form.permissions?.some(p => p.name === 'network') && (
        <div className="space-y-4">
          <Label>Endpoints réseau <span className="text-red-500">*</span></Label>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              La permission réseau requiert de déclarer les endpoints utilisés.
              Cette information sera vérifiée lors de la validation.
            </AlertDescription>
          </Alert>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="endpoints">Domaines et URLs (un par ligne)</Label>
              <Textarea
                id="endpoints"
                placeholder="api.example.com&#10;cdn.example.com&#10;https://analytics.example.com/collect"
                value={form.dataUsage?.endpoints?.join('\n') || ''}
                onChange={(e) =>
                  updateDataUsage(
                    'endpoints',
                    e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                  )
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Listez tous les domaines et URLs que votre skill contactera.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Usage */}
      <div className="space-y-4">
        <Label>Utilisation des données</Label>
        
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="collectsData"
              checked={form.dataUsage?.collectsData}
              onCheckedChange={(checked) =>
                updateDataUsage('collectsData', !!checked)
              }
            />
            <label htmlFor="collectsData" className="cursor-pointer">
              Ce skill collecte des données utilisateur
            </label>
          </div>

          {form.dataUsage?.collectsData && (
            <>
              <div className="space-y-2 pl-6">
                <Label htmlFor="dataTypes">Types de données collectées</Label>
                <Input
                  id="dataTypes"
                  placeholder="Ex: localisation, préférences, historique d'usage"
                  value={form.dataUsage?.dataTypes?.join(', ') || ''}
                  onChange={(e) =>
                    updateDataUsage(
                      'dataTypes',
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                />
              </div>

              <div className="space-y-2 pl-6">
                <Label htmlFor="retentionDays">Durée de rétention (jours)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  placeholder="30"
                  value={form.dataUsage?.retentionDays || ''}
                  onChange={(e) =>
                    updateDataUsage(
                      'retentionDays',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                />
              </div>

              <div className="flex items-center gap-3 pl-6">
                <Checkbox
                  id="sharesData"
                  checked={form.dataUsage?.sharesWithThirdParties}
                  onCheckedChange={(checked) =>
                    updateDataUsage('sharesWithThirdParties', !!checked)
                  }
                />
                <label htmlFor="sharesData" className="cursor-pointer">
                  Les données sont partagées avec des tiers
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
