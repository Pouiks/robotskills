export * from './database'

// Types utilitaires pour l'application

export interface CurrentUser {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  isDeveloper: boolean
  isAdmin: boolean
  organizations: UserOrganization[]
}

export interface UserOrganization {
  orgId: string
  orgName: string
  orgSlug: string
  orgType: 'oem' | 'studio'
  role: 'owner' | 'admin' | 'reviewer' | 'member'
}

// Types pour les skills enrichis (avec assets et versions)
export interface SkillWithDetails {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  descriptionMd: string | null
  category: string | null
  iconPath: string | null
  status: 'draft' | 'published' | 'suspended'
  createdAt: string
  ownerName: string | null
  priceCents: number
  isFree: boolean
  assets: {
    id: string
    type: 'screenshot' | 'video' | 'banner'
    path: string
    sortOrder: number
  }[]
  latestVersion: {
    id: string
    version: string
    releaseNotes: string | null
    riskLevel: 'low' | 'medium' | 'high'
    manifest: Record<string, unknown> | null
  } | null
  downloadCount: number
  // OEMs compatibles (via submissions approuvées)
  compatibleOems?: {
    id: string
    brandName: string
  }[]
}

// Types pour les robots enrichis
export interface RobotWithDetails {
  id: string
  robotIdentifier: string
  status: 'unpaired' | 'pending' | 'paired' | 'revoked'
  pairedAt: string | null
  oem: {
    id: string
    brandName: string
  }
  model: {
    id: string
    modelName: string
  }
  installationsCount: number
}

// Types pour les submissions
export interface SubmissionWithDetails {
  id: string
  status: string
  createdAt: string
  updatedAt: string
  platformReviewNotes: string | null
  skillVersion: {
    id: string
    version: string
    skill: {
      id: string
      name: string
      slug: string
      iconPath: string | null
    }
  }
  submitter: {
    id: string
    displayName: string | null
  }
  targetOem: {
    id: string
    brandName: string
  } | null
}

// Categories de skills
export const SKILL_CATEGORIES = [
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
] as const

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]
