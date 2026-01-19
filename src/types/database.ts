// Types générés à partir du schéma Supabase
// Ces types seront remplacés par les types auto-générés via `supabase gen types typescript`

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          user_id: string
          is_developer: boolean
          is_admin: boolean
        }
        Insert: {
          user_id: string
          is_developer?: boolean
          is_admin?: boolean
        }
        Update: {
          user_id?: string
          is_developer?: boolean
          is_admin?: boolean
        }
      }
      organizations: {
        Row: {
          id: string
          type: 'oem' | 'studio'
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'oem' | 'studio'
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'oem' | 'studio'
          name?: string
          slug?: string
          created_at?: string
        }
      }
      organization_members: {
        Row: {
          org_id: string
          user_id: string
          role: 'owner' | 'admin' | 'reviewer' | 'member'
        }
        Insert: {
          org_id: string
          user_id: string
          role: 'owner' | 'admin' | 'reviewer' | 'member'
        }
        Update: {
          org_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'reviewer' | 'member'
        }
      }
      oems: {
        Row: {
          id: string
          brand_name: string
          website: string | null
          support_email: string | null
        }
        Insert: {
          id: string
          brand_name: string
          website?: string | null
          support_email?: string | null
        }
        Update: {
          id?: string
          brand_name?: string
          website?: string | null
          support_email?: string | null
        }
      }
      robot_models: {
        Row: {
          id: string
          oem_id: string
          model_name: string
          capabilities: Json | null
        }
        Insert: {
          id?: string
          oem_id: string
          model_name: string
          capabilities?: Json | null
        }
        Update: {
          id?: string
          oem_id?: string
          model_name?: string
          capabilities?: Json | null
        }
      }
      robots: {
        Row: {
          id: string
          user_id: string
          oem_id: string
          robot_model_id: string
          robot_identifier: string
          status: 'unpaired' | 'pending' | 'paired' | 'revoked'
          paired_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          oem_id: string
          robot_model_id: string
          robot_identifier: string
          status?: 'unpaired' | 'pending' | 'paired' | 'revoked'
          paired_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          oem_id?: string
          robot_model_id?: string
          robot_identifier?: string
          status?: 'unpaired' | 'pending' | 'paired' | 'revoked'
          paired_at?: string | null
        }
      }
      robot_pairing_requests: {
        Row: {
          id: string
          robot_id: string
          challenge: string
          code: string
          expires_at: string
          confirmed_at: string | null
          confirmed_by: string | null
        }
        Insert: {
          id?: string
          robot_id: string
          challenge: string
          code: string
          expires_at: string
          confirmed_at?: string | null
          confirmed_by?: string | null
        }
        Update: {
          id?: string
          robot_id?: string
          challenge?: string
          code?: string
          expires_at?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
        }
      }
      skills: {
        Row: {
          id: string
          owner_user_id: string | null
          owner_org_id: string | null
          name: string
          slug: string
          short_description: string | null
          description_md: string | null
          category: string | null
          icon_path: string | null
          status: 'draft' | 'published' | 'suspended'
          created_at: string
        }
        Insert: {
          id?: string
          owner_user_id?: string | null
          owner_org_id?: string | null
          name: string
          slug: string
          short_description?: string | null
          description_md?: string | null
          category?: string | null
          icon_path?: string | null
          status?: 'draft' | 'published' | 'suspended'
          created_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string | null
          owner_org_id?: string | null
          name?: string
          slug?: string
          short_description?: string | null
          description_md?: string | null
          category?: string | null
          icon_path?: string | null
          status?: 'draft' | 'published' | 'suspended'
          created_at?: string
        }
      }
      skill_assets: {
        Row: {
          id: string
          skill_id: string
          type: 'screenshot' | 'video' | 'banner'
          path: string
          sort_order: number
        }
        Insert: {
          id?: string
          skill_id: string
          type: 'screenshot' | 'video' | 'banner'
          path: string
          sort_order?: number
        }
        Update: {
          id?: string
          skill_id?: string
          type?: 'screenshot' | 'video' | 'banner'
          path?: string
          sort_order?: number
        }
      }
      skill_versions: {
        Row: {
          id: string
          skill_id: string
          version: string
          manifest: Json
          release_notes: string | null
          risk_level: 'low' | 'medium' | 'high'
          visibility: 'private' | 'beta' | 'public'
          created_at: string
        }
        Insert: {
          id?: string
          skill_id: string
          version: string
          manifest: Json
          release_notes?: string | null
          risk_level?: 'low' | 'medium' | 'high'
          visibility?: 'private' | 'beta' | 'public'
          created_at?: string
        }
        Update: {
          id?: string
          skill_id?: string
          version?: string
          manifest?: Json
          release_notes?: string | null
          risk_level?: 'low' | 'medium' | 'high'
          visibility?: 'private' | 'beta' | 'public'
          created_at?: string
        }
      }
      skill_packages: {
        Row: {
          id: string
          skill_version_id: string
          storage_path: string
          checksum_sha256: string
          signature: string | null
          size_bytes: number
          created_at: string
        }
        Insert: {
          id?: string
          skill_version_id: string
          storage_path: string
          checksum_sha256: string
          signature?: string | null
          size_bytes: number
          created_at?: string
        }
        Update: {
          id?: string
          skill_version_id?: string
          storage_path?: string
          checksum_sha256?: string
          signature?: string | null
          size_bytes?: number
          created_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          skill_version_id: string
          submitted_by: string
          target_oem_id: string | null
          status:
            | 'draft'
            | 'submitted'
            | 'platform_review'
            | 'oem_review'
            | 'approved'
            | 'rejected'
            | 'changes_requested'
          platform_review_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          skill_version_id: string
          submitted_by: string
          target_oem_id?: string | null
          status?: 'draft' | 'submitted' | 'platform_review' | 'oem_review' | 'approved' | 'rejected' | 'changes_requested'
          platform_review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          skill_version_id?: string
          submitted_by?: string
          target_oem_id?: string | null
          status?: 'draft' | 'submitted' | 'platform_review' | 'oem_review' | 'approved' | 'rejected' | 'changes_requested'
          platform_review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      oem_reviews: {
        Row: {
          id: string
          submission_id: string
          oem_org_id: string
          reviewer_user_id: string
          decision: 'approved' | 'rejected' | 'changes_requested'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          oem_org_id: string
          reviewer_user_id: string
          decision: 'approved' | 'rejected' | 'changes_requested'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          oem_org_id?: string
          reviewer_user_id?: string
          decision?: 'approved' | 'rejected' | 'changes_requested'
          notes?: string | null
          created_at?: string
        }
      }
      downloads: {
        Row: {
          id: string
          user_id: string
          skill_version_id: string
          downloaded_at: string
          source: string | null
        }
        Insert: {
          id?: string
          user_id: string
          skill_version_id: string
          downloaded_at?: string
          source?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          skill_version_id?: string
          downloaded_at?: string
          source?: string | null
        }
      }
      installations: {
        Row: {
          id: string
          robot_id: string
          skill_version_id: string
          status: 'installed' | 'removed' | 'disabled'
          installed_at: string
          removed_at: string | null
        }
        Insert: {
          id?: string
          robot_id: string
          skill_version_id: string
          status?: 'installed' | 'removed' | 'disabled'
          installed_at?: string
          removed_at?: string | null
        }
        Update: {
          id?: string
          robot_id?: string
          skill_version_id?: string
          status?: 'installed' | 'removed' | 'disabled'
          installed_at?: string
          removed_at?: string | null
        }
      }
      developer_licenses: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          issued_at: string
          revoked_at: string | null
          lifetime: boolean
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          issued_at?: string
          revoked_at?: string | null
          lifetime?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          issued_at?: string
          revoked_at?: string | null
          lifetime?: boolean
        }
      }
      audit_events: {
        Row: {
          id: string
          actor_user_id: string | null
          actor_org_id: string | null
          event_type: string
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_user_id?: string | null
          actor_org_id?: string | null
          event_type: string
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_user_id?: string | null
          actor_org_id?: string | null
          event_type?: string
          payload?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Alias pratiques
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserRoles = Database['public']['Tables']['user_roles']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
export type Oem = Database['public']['Tables']['oems']['Row']
export type RobotModel = Database['public']['Tables']['robot_models']['Row']
export type Robot = Database['public']['Tables']['robots']['Row']
export type RobotPairingRequest = Database['public']['Tables']['robot_pairing_requests']['Row']
export type Skill = Database['public']['Tables']['skills']['Row']
export type SkillAsset = Database['public']['Tables']['skill_assets']['Row']
export type SkillVersion = Database['public']['Tables']['skill_versions']['Row']
export type SkillPackage = Database['public']['Tables']['skill_packages']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type OemReview = Database['public']['Tables']['oem_reviews']['Row']
export type Download = Database['public']['Tables']['downloads']['Row']
export type Installation = Database['public']['Tables']['installations']['Row']
export type DeveloperLicense = Database['public']['Tables']['developer_licenses']['Row']
export type AuditEvent = Database['public']['Tables']['audit_events']['Row']
