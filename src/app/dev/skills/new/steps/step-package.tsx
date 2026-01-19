'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Package, FileCode, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SkillPackageInput } from '@/lib/validators/submission'
import { skillPackageSchema } from '@/lib/validators/submission'
import { uploadSkillPackage } from '@/server/storage'

interface StepPackageProps {
  data: SkillPackageInput | null
  onChange: (data: SkillPackageInput | null) => void
  skillId?: string | null
  versionId?: string | null
}

export function StepPackage({ data, onChange, skillId, versionId }: StepPackageProps) {
  const [form, setForm] = useState<Partial<SkillPackageInput>>(
    data || {
      version: '1.0.0',
      releaseNotes: '',
      riskLevel: 'low',
      manifest: {
        name: '',
        version: '1.0.0',
        permissions: [],
      },
      packagePath: '',
      packageSize: 0,
      packageChecksum: '',
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [manifestJson, setManifestJson] = useState(
    JSON.stringify(form.manifest, null, 2)
  )
  const [manifestError, setManifestError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Try to parse manifest JSON
    let manifest = form.manifest
    try {
      manifest = JSON.parse(manifestJson)
      setManifestError(null)
    } catch (e) {
      setManifestError('JSON invalide')
      // Keep existing manifest if JSON is invalid
    }

    const formWithManifest = { ...form, manifest }
    const result = skillPackageSchema.safeParse(formWithManifest)
    if (result.success) {
      onChange(result.data)
      setErrors({})
    } else {
      onChange(null)
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        newErrors[path] = issue.message
      })
      setErrors(newErrors)
    }
  }, [form, manifestJson, onChange])

  // Calculate SHA256 checksum client-side
  async function calculateChecksum(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Handle file upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      toast.error('Le package doit être un fichier ZIP')
      return
    }

    // Validate size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Le package est trop volumineux (max 100MB)')
      return
    }

    setIsUploading(true)

    try {
      // Calculate checksum
      const checksum = await calculateChecksum(file)

      // If we have skillId and versionId, upload to server
      if (skillId && versionId) {
        const formData = new FormData()
        formData.append('file', file)
        
        const result = await uploadSkillPackage(skillId, versionId, formData)
        
        if (!result.success) {
          toast.error(result.error || 'Erreur lors de l\'upload')
          setIsUploading(false)
          return
        }

        setForm((prev) => ({
          ...prev,
          packagePath: result.path || `/packages/${versionId}/package.zip`,
          packageSize: file.size,
          packageChecksum: result.checksum || checksum,
        }))
      } else {
        // For POC without server upload, just store locally
        setForm((prev) => ({
          ...prev,
          packagePath: `/packages/skill-${Date.now()}.zip`,
          packageSize: file.size,
          packageChecksum: checksum,
        }))
      }

      toast.success('Package prêt')
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Erreur lors du traitement du fichier')
    }

    setIsUploading(false)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Simulate upload for demo
  function simulatePackageUpload() {
    const fakeChecksum = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')

    setForm((prev) => ({
      ...prev,
      packagePath: `/packages/skill-${Date.now()}.zip`,
      packageSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
      packageChecksum: fakeChecksum,
    }))
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Package & Version</h2>
        <p className="text-sm text-muted-foreground">
          Uploadez votre package et définissez les métadonnées de la version.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Version */}
        <div className="space-y-2">
          <Label htmlFor="version">
            Version <span className="text-red-500">*</span>
          </Label>
          <Input
            id="version"
            placeholder="1.0.0"
            value={form.version || ''}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, version: e.target.value }))
              // Also update manifest version
              setManifestJson((prev) => {
                try {
                  const obj = JSON.parse(prev)
                  obj.version = e.target.value
                  return JSON.stringify(obj, null, 2)
                } catch {
                  return prev
                }
              })
            }}
          />
          <p className="text-xs text-muted-foreground">
            Format semver: X.Y.Z (ex: 1.0.0)
          </p>
          {errors.version && (
            <p className="text-sm text-red-500">{errors.version}</p>
          )}
        </div>

        {/* Risk Level */}
        <div className="space-y-2">
          <Label>
            Niveau de risque <span className="text-red-500">*</span>
          </Label>
          <Select
            value={form.riskLevel}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                riskLevel: value as 'low' | 'medium' | 'high',
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <span className="text-green-600">Faible</span> - Opérations sûres
              </SelectItem>
              <SelectItem value="medium">
                <span className="text-yellow-600">Moyen</span> - Accès limité
              </SelectItem>
              <SelectItem value="high">
                <span className="text-red-600">Élevé</span> - Opérations critiques
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Le niveau doit être cohérent avec les permissions demandées.
          </p>
        </div>
      </div>

      {/* Release Notes */}
      <div className="space-y-2">
        <Label htmlFor="releaseNotes">
          Notes de version <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="releaseNotes"
          placeholder="- Nouvelle fonctionnalité X&#10;- Correction du bug Y&#10;- Amélioration des performances"
          value={form.releaseNotes || ''}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, releaseNotes: e.target.value }))
          }
          rows={4}
        />
        {errors.releaseNotes && (
          <p className="text-sm text-red-500">{errors.releaseNotes}</p>
        )}
      </div>

      {/* Package Upload */}
      <div className="space-y-2">
        <Label>
          Package (ZIP) <span className="text-red-500">*</span>
        </Label>
        {form.packagePath ? (
          <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-green-800 dark:text-green-200">Package prêt</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Taille: {formatBytes(form.packageSize || 0)}
                </p>
                <p className="text-xs font-mono text-green-600 dark:text-green-400 truncate">
                  SHA256: {form.packageChecksum?.substring(0, 32)}...
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    packagePath: '',
                    packageSize: 0,
                    packageChecksum: '',
                  }))
                }
              >
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label
              className={`block rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                isUploading 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/50 hover:border-primary'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
                  <p className="font-medium">Upload en cours...</p>
                  <p className="text-sm text-muted-foreground">
                    Calcul du checksum et upload
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Cliquez pour sélectionner votre package</p>
                  <p className="text-sm text-muted-foreground">
                    ZIP, max 100MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
            <div className="text-center">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={simulatePackageUpload}
              >
                Simuler un upload (POC)
              </Button>
            </div>
          </div>
        )}
        {errors.packagePath && (
          <p className="text-sm text-red-500">{errors.packagePath}</p>
        )}
      </div>

      {/* Manifest */}
      <div className="space-y-2">
        <Label htmlFor="manifest">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Manifest (JSON) <span className="text-red-500">*</span>
          </div>
        </Label>
        <div className="relative">
          <Textarea
            id="manifest"
            value={manifestJson}
            onChange={(e) => setManifestJson(e.target.value)}
            rows={12}
            className={`font-mono text-sm ${manifestError ? 'border-red-500' : ''}`}
            placeholder='{"name": "my-skill", "version": "1.0.0", "permissions": []}'
          />
          {manifestError && (
            <div className="absolute top-2 right-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {manifestError && (
          <p className="text-sm text-red-500">{manifestError}</p>
        )}
        {Object.keys(errors).filter((k) => k.startsWith('manifest')).map((key) => (
          <p key={key} className="text-sm text-red-500">
            {key.replace('manifest.', '')}: {errors[key]}
          </p>
        ))}
        <Alert>
          <FileCode className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Le manifest doit inclure: <code>name</code>, <code>version</code> (semver), <code>permissions</code> (array).
            Optionnel: <code>minFirmware</code>, <code>entryPoint</code>, <code>dependencies</code>.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
