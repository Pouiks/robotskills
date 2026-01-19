'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { SkillAssetsInput } from '@/lib/validators/submission'
import { skillAssetsSchema } from '@/lib/validators/submission'
import { uploadSkillIcon, uploadScreenshot, deleteScreenshot, getSkillAssets } from '@/server/storage'

interface StepAssetsProps {
  data: SkillAssetsInput | null
  onChange: (data: SkillAssetsInput | null) => void
  skillId?: string | null
}

interface ScreenshotItem {
  id?: string
  url: string
  isUploading?: boolean
}

export function StepAssets({ data, onChange, skillId }: StepAssetsProps) {
  const [iconPath, setIconPath] = useState(data?.iconPath || '')
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>(
    (data?.screenshots || []).map(url => ({ url }))
  )
  const [videoUrl, setVideoUrl] = useState(data?.videoUrl || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  
  const iconInputRef = useRef<HTMLInputElement>(null)
  const screenshotInputRef = useRef<HTMLInputElement>(null)

  // Load existing assets when skillId becomes available
  useEffect(() => {
    if (skillId && !data?.iconPath) {
      loadExistingAssets()
    }
  }, [skillId])

  async function loadExistingAssets() {
    if (!skillId) return
    
    const assets = await getSkillAssets(skillId)
    if (assets.icon) {
      setIconPath(assets.icon)
    }
    if (assets.screenshots.length > 0) {
      setScreenshots(assets.screenshots.map(s => ({ id: s.id, url: s.url })))
    }
  }

  // Validate and propagate changes
  useEffect(() => {
    const form = {
      iconPath,
      screenshots: screenshots.filter(s => !s.isUploading).map(s => s.url),
      videoUrl: videoUrl || undefined,
    }

    const result = skillAssetsSchema.safeParse(form)
    if (result.success) {
      onChange(result.data)
      setErrors({})
    } else {
      onChange(null)
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as string] = issue.message
      })
      setErrors(newErrors)
    }
  }, [iconPath, screenshots, videoUrl, onChange])

  // Handle icon upload
  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!skillId) {
      toast.error('Veuillez d\'abord compléter l\'étape précédente')
      return
    }

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Format non supporté. Utilisez PNG, JPG ou WebP.')
      return
    }

    // Validate size (512KB)
    if (file.size > 512 * 1024) {
      toast.error('L\'icône doit faire moins de 512KB')
      return
    }

    setIsUploadingIcon(true)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const result = await uploadSkillIcon(skillId, formData)
    
    setIsUploadingIcon(false)
    
    if (!result.success) {
      toast.error(result.error || 'Erreur lors de l\'upload')
      return
    }

    if (result.url) {
      setIconPath(result.url)
      toast.success('Icône uploadée')
    }

    // Reset input
    if (iconInputRef.current) {
      iconInputRef.current.value = ''
    }
  }

  // Handle screenshot upload
  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (!skillId) {
      toast.error('Veuillez d\'abord compléter l\'étape précédente')
      return
    }

    const remaining = 10 - screenshots.length
    const filesToUpload = Array.from(files).slice(0, remaining)

    for (const file of filesToUpload) {
      // Validate file type
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name}: Format non supporté`)
        continue
      }

      // Validate size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: Fichier trop volumineux (max 10MB)`)
        continue
      }

      // Add placeholder while uploading
      const tempId = `temp-${Date.now()}-${Math.random()}`
      const tempUrl = URL.createObjectURL(file)
      
      setScreenshots(prev => [...prev, { url: tempUrl, isUploading: true }])

      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadScreenshot(skillId, formData, screenshots.length)

      if (result.success && result.url) {
        // Replace temp with real
        setScreenshots(prev => 
          prev.map(s => 
            s.url === tempUrl 
              ? { url: result.url!, isUploading: false } 
              : s
          )
        )
      } else {
        // Remove failed upload
        setScreenshots(prev => prev.filter(s => s.url !== tempUrl))
        toast.error(result.error || 'Erreur lors de l\'upload')
      }

      URL.revokeObjectURL(tempUrl)
    }

    // Reset input
    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = ''
    }
  }

  // Remove screenshot
  async function handleRemoveScreenshot(index: number) {
    const screenshot = screenshots[index]
    
    // If it has an ID, delete from server
    if (screenshot.id && skillId) {
      const result = await deleteScreenshot(skillId, screenshot.id)
      if (!result.success) {
        toast.error(result.error || 'Erreur lors de la suppression')
        return
      }
    }

    setScreenshots(prev => prev.filter((_, i) => i !== index))
  }

  // Demo mode for when skillId is not available
  function addDemoScreenshot() {
    const placeholders = [
      'https://placehold.co/800x600/1e293b/ffffff?text=Screenshot+1',
      'https://placehold.co/800x600/334155/ffffff?text=Screenshot+2',
      'https://placehold.co/800x600/475569/ffffff?text=Screenshot+3',
      'https://placehold.co/800x600/64748b/ffffff?text=Screenshot+4',
    ]
    const nextIndex = screenshots.length
    if (nextIndex < 10) {
      setScreenshots(prev => [...prev, { url: placeholders[nextIndex % placeholders.length] }])
    }
  }

  function setDemoIcon() {
    setIconPath('https://placehold.co/256x256/3b82f6/ffffff?text=Icon')
  }

  const hasSkillId = !!skillId

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Médias</h2>
        <p className="text-sm text-muted-foreground">
          Icône et captures d&apos;écran de votre skill. Minimum 3 screenshots requis.
        </p>
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <Label>
          Icône <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-4">
          {iconPath ? (
            <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-muted">
              <img
                src={iconPath}
                alt="Icon"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIconPath('')}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              className={`h-24 w-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                isUploadingIcon 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/50 hover:border-primary'
              }`}
            >
              {isUploadingIcon ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <input
                ref={iconInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleIconUpload}
                disabled={!hasSkillId || isUploadingIcon}
              />
            </label>
          )}
          <div className="text-sm text-muted-foreground">
            <p>256x256 pixels recommandé</p>
            <p>PNG, JPG ou WebP (max 512KB)</p>
            {!hasSkillId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setDemoIcon}
                className="mt-2"
              >
                Utiliser une icône démo
              </Button>
            )}
          </div>
        </div>
        {errors.iconPath && (
          <p className="text-sm text-red-500">{errors.iconPath}</p>
        )}
      </div>

      {/* Screenshots */}
      <div className="space-y-2">
        <Label>
          Screenshots <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className={
            screenshots.filter(s => !s.isUploading).length >= 3
              ? 'text-green-600 dark:text-green-400'
              : 'text-foreground'
          }>
            {screenshots.filter(s => !s.isUploading).length >= 3 ? '✓ ' : ''}min. 3 screenshots
          </span>
          <span className="text-muted-foreground">
            {screenshots.filter(s => !s.isUploading).length}/10
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {screenshots.map((item, index) => (
            <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              {item.isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  <img
                    src={item.url}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveScreenshot(index)}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ))}
          {screenshots.length < 10 && (
            <label
              className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {hasSkillId ? 'Ajouter' : 'Démo'}
              </span>
              {hasSkillId ? (
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleScreenshotUpload}
                />
              ) : (
                <input
                  type="button"
                  className="hidden"
                  onClick={addDemoScreenshot}
                />
              )}
            </label>
          )}
          {!hasSkillId && screenshots.length < 10 && (
            <div 
              onClick={addDemoScreenshot}
              className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Ajouter démo</span>
            </div>
          )}
        </div>
        {errors.screenshots && (
          <p className="text-sm text-red-500">{errors.screenshots}</p>
        )}
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <Label htmlFor="videoUrl">Vidéo de présentation (optionnel)</Label>
        <Input
          id="videoUrl"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        {errors.videoUrl && (
          <p className="text-sm text-red-500">{errors.videoUrl}</p>
        )}
      </div>
    </div>
  )
}
