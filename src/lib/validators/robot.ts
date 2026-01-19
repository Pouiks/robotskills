import { z } from 'zod'

export const createRobotSchema = z.object({
  oemId: z.string().uuid('OEM invalide'),
  robotModelId: z.string().uuid('Modèle invalide'),
  robotIdentifier: z
    .string()
    .min(3, "L'identifiant du robot doit contenir au moins 3 caractères")
    .max(100, "L'identifiant ne peut pas dépasser 100 caractères"),
})

export const startPairingSchema = z.object({
  robotId: z.string().uuid('Robot invalide'),
})

export const confirmPairingSchema = z.object({
  robotIdentifier: z.string().min(1, 'Identifiant robot requis'),
  challenge: z.string().min(1, 'Challenge requis'),
  code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
})

export type CreateRobotInput = z.infer<typeof createRobotSchema>
export type StartPairingInput = z.infer<typeof startPairingSchema>
export type ConfirmPairingInput = z.infer<typeof confirmPairingSchema>
