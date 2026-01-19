import { z } from 'zod'

// ============================================
// SKILL METADATA (Step 1: Identity)
// ============================================

export const skillIdentitySchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  slug: z
    .string()
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .max(50, 'Le slug ne peut pas dépasser 50 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  category: z.enum([
    'navigation',
    'manipulation',
    'perception',
    'communication',
    'entertainment',
    'productivity',
    'education',
    'healthcare',
    'industrial',
    'other',
  ]),
  publisherName: z
    .string()
    .min(2, 'Le nom de l\'éditeur doit contenir au moins 2 caractères')
    .max(100, 'Le nom de l\'éditeur ne peut pas dépasser 100 caractères'),
  shortDescription: z
    .string()
    .min(10, 'La description courte doit contenir au moins 10 caractères')
    .max(140, 'La description courte ne peut pas dépasser 140 caractères'),
  descriptionMd: z
    .string()
    .min(50, 'La description longue doit contenir au moins 50 caractères')
    .max(10000, 'La description longue ne peut pas dépasser 10000 caractères'),
  supportUrl: z.string().url('URL de support invalide').optional().or(z.literal('')),
  privacyUrl: z.string().url('URL de confidentialité invalide').optional().or(z.literal('')),
  termsUrl: z.string().url('URL des conditions invalide').optional().or(z.literal('')),
})

export type SkillIdentityInput = z.infer<typeof skillIdentitySchema>

// ============================================
// SKILL ASSETS (Step 2: Media)
// ============================================

export const skillAssetsSchema = z.object({
  iconPath: z.string().min(1, 'L\'icône est obligatoire'),
  screenshots: z
    .array(z.string())
    .min(3, 'Au moins 3 screenshots sont requis')
    .max(10, 'Maximum 10 screenshots autorisés'),
  bannerPath: z.string().optional(),
  videoUrl: z.string().url('URL vidéo invalide').optional().or(z.literal('')),
})

export type SkillAssetsInput = z.infer<typeof skillAssetsSchema>

// ============================================
// COMPATIBILITY (Step 3: OEM & Models)
// ============================================

export const skillCompatibilitySchema = z.object({
  targetOemId: z.string().uuid(), // Premier OEM (pour compatibilité submission)
  targetOemIds: z.array(z.string().uuid()).min(1, 'Sélectionnez au moins un constructeur').optional(),
  targetModels: z.array(z.string().uuid()).optional(),
  minFirmwareVersion: z.string().optional(),
  capabilities: z.record(z.string(), z.unknown()).optional(),
})

export type SkillCompatibilityInput = z.infer<typeof skillCompatibilitySchema> & {
  targetOemIds?: string[]
}

// ============================================
// PERMISSIONS & DATA (Step 4)
// ============================================

export const permissionSchema = z.object({
  name: z.string(),
  justification: z.string().min(10, 'Justification requise (min 10 caractères)'),
})

export const dataUsageSchema = z.object({
  collectsData: z.boolean(),
  dataTypes: z.array(z.string()).optional(),
  retentionDays: z.number().int().positive().optional().nullable(),
  sharesWithThirdParties: z.boolean(),
  endpoints: z.array(z.string()).optional(),
})

export const skillPermissionsSchema = z.object({
  permissions: z.array(permissionSchema).min(0),
  dataUsage: dataUsageSchema,
})

export type SkillPermissionsInput = z.infer<typeof skillPermissionsSchema>

// ============================================
// PACKAGE & MANIFEST (Step 5)
// ============================================

export const manifestSchema = z.object({
  name: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version doit être au format semver (ex: 1.0.0)'),
  permissions: z.array(z.string()).optional(),
  minFirmware: z.string().optional(),
  entryPoint: z.string().optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
})

export const skillPackageSchema = z.object({
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version doit être au format semver (ex: 1.0.0)'),
  releaseNotes: z
    .string()
    .min(10, 'Les notes de version doivent contenir au moins 10 caractères')
    .max(2000, 'Les notes de version ne peuvent pas dépasser 2000 caractères'),
  riskLevel: z.enum(['low', 'medium', 'high']),
  manifest: manifestSchema,
  packagePath: z.string().min(1, 'Le package est obligatoire'),
  packageSize: z.number().positive(),
  packageChecksum: z.string().min(1),
})

export type SkillPackageInput = z.infer<typeof skillPackageSchema>

// ============================================
// FULL SUBMISSION SCHEMA
// ============================================

export const fullSubmissionSchema = z.object({
  // Step 1
  identity: skillIdentitySchema,
  // Step 2
  assets: skillAssetsSchema,
  // Step 3
  compatibility: skillCompatibilitySchema,
  // Step 4
  permissions: skillPermissionsSchema,
  // Step 5
  package: skillPackageSchema,
})

export type FullSubmissionInput = z.infer<typeof fullSubmissionSchema>

// ============================================
// SUBMISSION STATUS TRANSITIONS
// ============================================

export const submissionStatuses = [
  'draft',
  'submitted',
  'platform_review',
  'oem_review',
  'approved',
  'rejected',
  'changes_requested',
] as const

export type SubmissionStatus = (typeof submissionStatuses)[number]

// Valid transitions map
export const validTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
  draft: ['submitted'],
  submitted: ['platform_review'],
  platform_review: ['oem_review', 'changes_requested'],
  oem_review: ['approved', 'rejected', 'changes_requested'],
  approved: [], // Terminal
  rejected: [], // Terminal
  changes_requested: ['submitted'],
}

export function canTransition(from: SubmissionStatus, to: SubmissionStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false
}

// ============================================
// OEM DECISION SCHEMA
// ============================================

export const oemDecisionSchemaSimple = z.discriminatedUnion('decision', [
  z.object({
    submissionId: z.string().uuid(),
    decision: z.literal('approved'),
    notes: z.string().optional(),
  }),
  z.object({
    submissionId: z.string().uuid(),
    decision: z.literal('rejected'),
    notes: z.string().min(10, 'Un commentaire est requis pour un rejet (min 10 caractères)'),
  }),
  z.object({
    submissionId: z.string().uuid(),
    decision: z.literal('changes_requested'),
    notes: z.string().min(10, 'Précisez les modifications demandées (min 10 caractères)'),
  }),
])

export type OemDecisionInput = z.infer<typeof oemDecisionSchemaSimple>

// ============================================
// PLATFORM REVIEW RESULT
// ============================================

export interface PlatformReviewResult {
  passed: boolean
  checks: {
    name: string
    passed: boolean
    message: string
  }[]
  timestamp: string
}

// ============================================
// AVAILABLE PERMISSIONS LIST
// ============================================

export const availablePermissions = [
  { id: 'navigation', name: 'Navigation', description: 'Contrôle des déplacements du robot' },
  { id: 'manipulation', name: 'Manipulation', description: 'Contrôle des bras/pinces du robot' },
  { id: 'camera', name: 'Caméra', description: 'Accès aux flux vidéo' },
  { id: 'microphone', name: 'Microphone', description: 'Accès à l\'audio entrant' },
  { id: 'speaker', name: 'Haut-parleur', description: 'Sortie audio' },
  { id: 'sensors', name: 'Capteurs', description: 'Accès aux capteurs (LIDAR, IMU, etc.)' },
  { id: 'network', name: 'Réseau', description: 'Accès Internet et réseau local' },
  { id: 'storage', name: 'Stockage', description: 'Lecture/écriture de fichiers locaux' },
  { id: 'lights', name: 'Éclairage', description: 'Contrôle des LEDs et lumières' },
  { id: 'emergency', name: 'Urgence', description: 'Déclenchement d\'alertes d\'urgence' },
] as const

export type PermissionId = (typeof availablePermissions)[number]['id']
