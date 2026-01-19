import { z } from 'zod'

export const emailSchema = z.string().email('Adresse email invalide')

export const loginWithOtpSchema = z.object({
  email: emailSchema,
})

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .optional(),
  avatarUrl: z.string().url('URL invalide').optional().nullable(),
})

export type LoginWithOtpInput = z.infer<typeof loginWithOtpSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
