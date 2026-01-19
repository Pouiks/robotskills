import { z } from 'zod'
import { SKILL_CATEGORIES } from '@/types'

export const createSkillSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  slug: z
    .string()
    .min(2, 'Le slug doit contenir au moins 2 caractères')
    .max(100, 'Le slug ne peut pas dépasser 100 caractères')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Le slug doit être en minuscules avec des tirets (ex: mon-skill)'
    ),
  shortDescription: z
    .string()
    .max(200, 'La description courte ne peut pas dépasser 200 caractères')
    .optional(),
  descriptionMd: z
    .string()
    .max(10000, 'La description ne peut pas dépasser 10000 caractères')
    .optional(),
  category: z.enum(SKILL_CATEGORIES).optional(),
})

export const updateSkillSchema = createSkillSchema.partial()

export const skillVersionSchema = z.object({
  skillId: z.string().uuid('Skill invalide'),
  version: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+$/,
      'La version doit être au format semver (ex: 1.0.0)'
    ),
  manifest: z.record(z.string(), z.unknown()),
  releaseNotes: z.string().max(5000).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).default('low'),
  visibility: z.enum(['private', 'beta', 'public']).default('private'),
})

export const skillManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().optional(),
  author: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  compatibleModels: z.array(z.string()).optional(),
  minFirmwareVersion: z.string().optional(),
  entryPoint: z.string().optional(),
})

export type CreateSkillInput = z.infer<typeof createSkillSchema>
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>
export type SkillVersionInput = z.infer<typeof skillVersionSchema>
export type SkillManifest = z.infer<typeof skillManifestSchema>
