import { describe, it, expect } from 'vitest'
import {
  skillIdentitySchema,
  skillAssetsSchema,
  skillCompatibilitySchema,
  skillPermissionsSchema,
  skillPackageSchema,
  manifestSchema,
  canTransition,
  type SubmissionStatus,
} from '../submission'

describe('skillIdentitySchema', () => {
  it('validates a correct identity', () => {
    const validIdentity = {
      name: 'Test Skill',
      slug: 'test-skill',
      category: 'navigation', // Valid category from enum
      publisherName: 'Test Publisher',
      shortDescription: 'A short description for testing purposes',
      descriptionMd: '# Description\n\nThis is a much longer description in markdown format that contains at least 50 characters as required by the schema validation.',
    }

    const result = skillIdentitySchema.safeParse(validIdentity)
    expect(result.success).toBe(true)
  })

  it('requires name', () => {
    const invalid = {
      slug: 'test-skill',
      category: 'automation',
      publisherName: 'Test',
      shortDescription: 'Short',
      descriptionMd: 'Long',
    }

    const result = skillIdentitySchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('validates slug format', () => {
    const invalidSlug = {
      name: 'Test',
      slug: 'Test Skill With Spaces', // Invalid - contains spaces
      category: 'automation',
      publisherName: 'Test',
      shortDescription: 'Short description',
      descriptionMd: 'Description',
    }

    const result = skillIdentitySchema.safeParse(invalidSlug)
    expect(result.success).toBe(false)
  })

  it('validates category enum', () => {
    const invalidCategory = {
      name: 'Test',
      slug: 'test',
      category: 'invalid-category',
      publisherName: 'Test',
      shortDescription: 'Short',
      descriptionMd: 'Long',
    }

    const result = skillIdentitySchema.safeParse(invalidCategory)
    expect(result.success).toBe(false)
  })
})

describe('skillAssetsSchema', () => {
  it('validates correct assets', () => {
    const validAssets = {
      iconPath: 'https://example.com/icon.png',
      screenshots: [
        'https://example.com/screen1.png',
        'https://example.com/screen2.png',
        'https://example.com/screen3.png',
      ],
    }

    const result = skillAssetsSchema.safeParse(validAssets)
    expect(result.success).toBe(true)
  })

  it('requires at least 3 screenshots', () => {
    const tooFewScreenshots = {
      iconPath: 'https://example.com/icon.png',
      screenshots: [
        'https://example.com/screen1.png',
        'https://example.com/screen2.png',
      ],
    }

    const result = skillAssetsSchema.safeParse(tooFewScreenshots)
    expect(result.success).toBe(false)
  })

  it('limits screenshots to 10', () => {
    const tooManyScreenshots = {
      iconPath: 'https://example.com/icon.png',
      screenshots: Array.from({ length: 11 }, (_, i) => `https://example.com/screen${i}.png`),
    }

    const result = skillAssetsSchema.safeParse(tooManyScreenshots)
    expect(result.success).toBe(false)
  })
})

describe('skillPermissionsSchema', () => {
  it('validates permissions with justifications', () => {
    const valid = {
      permissions: [
        { name: 'navigation', justification: 'Required for robot movement' },
        { name: 'sensors', justification: 'Required for obstacle detection' },
      ],
      dataUsage: {
        collectsData: false,
        dataTypes: [],
        retentionDays: null,
        sharesWithThirdParties: false,
        endpoints: [],
      },
    }

    const result = skillPermissionsSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('requires justification for each permission', () => {
    const missingJustification = {
      permissions: [
        { name: 'navigation', justification: '' }, // Empty justification
      ],
      dataUsage: {
        collectsData: false,
        dataTypes: [],
        retentionDays: null,
        sharesWithThirdParties: false,
        endpoints: [],
      },
    }

    const result = skillPermissionsSchema.safeParse(missingJustification)
    expect(result.success).toBe(false)
  })
})

describe('skillPackageSchema', () => {
  it('validates a complete package', () => {
    const valid = {
      version: '1.0.0',
      releaseNotes: 'Initial release',
      riskLevel: 'low' as const,
      manifest: {
        name: 'test-skill',
        version: '1.0.0',
        permissions: [],
      },
      packagePath: '/packages/test.zip',
      packageSize: 1024000,
      packageChecksum: 'abc123def456',
    }

    const result = skillPackageSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('validates semver version format', () => {
    const invalidVersion = {
      version: 'not-semver',
      releaseNotes: 'Test',
      riskLevel: 'low' as const,
      manifest: { name: 'test', version: '1.0.0', permissions: [] },
      packagePath: '/test.zip',
      packageSize: 1024,
      packageChecksum: 'abc',
    }

    const result = skillPackageSchema.safeParse(invalidVersion)
    expect(result.success).toBe(false)
  })
})

describe('manifestSchema', () => {
  it('validates a correct manifest', () => {
    const valid = {
      name: 'test-skill',
      version: '1.0.0',
      permissions: ['navigation', 'sensors'],
    }

    const result = manifestSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('requires name', () => {
    const invalid = {
      version: '1.0.0',
      permissions: [],
    }

    const result = manifestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('validates semver version', () => {
    const invalid = {
      name: 'test',
      version: 'invalid',
      permissions: [],
    }

    const result = manifestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('canTransition', () => {
  it('allows draft -> submitted', () => {
    expect(canTransition('draft', 'submitted')).toBe(true)
  })

  it('allows submitted -> platform_review', () => {
    expect(canTransition('submitted', 'platform_review')).toBe(true)
  })

  it('allows platform_review -> oem_review', () => {
    expect(canTransition('platform_review', 'oem_review')).toBe(true)
  })

  it('allows platform_review -> changes_requested', () => {
    expect(canTransition('platform_review', 'changes_requested')).toBe(true)
  })

  it('allows oem_review -> approved', () => {
    expect(canTransition('oem_review', 'approved')).toBe(true)
  })

  it('allows oem_review -> rejected', () => {
    expect(canTransition('oem_review', 'rejected')).toBe(true)
  })

  it('allows changes_requested -> submitted', () => {
    expect(canTransition('changes_requested', 'submitted')).toBe(true)
  })

  it('disallows invalid transitions', () => {
    expect(canTransition('draft', 'approved')).toBe(false)
    expect(canTransition('approved', 'draft')).toBe(false)
    expect(canTransition('rejected', 'submitted')).toBe(false)
  })
})
