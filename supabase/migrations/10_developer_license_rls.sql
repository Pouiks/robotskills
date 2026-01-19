-- ============================================
-- Robot Skills Store - Developer License RLS Enhancement
-- 10_developer_license_rls.sql - Allow users to create their own license
-- ============================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view own license" ON developer_licenses;
DROP POLICY IF EXISTS "Admins can manage licenses" ON developer_licenses;

-- ============================================
-- NEW POLICIES FOR developer_licenses
-- ============================================

-- Policy: Users can read their own license
CREATE POLICY "Users can view own developer license"
  ON developer_licenses FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Policy: Users can create their own license (only if they don't have one)
-- The uniqueness constraint on user_id ensures only one license per user
CREATE POLICY "Users can create own developer license"
  ON developer_licenses FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM developer_licenses dl
      WHERE dl.user_id = auth.uid()
    )
  );

-- Policy: Only admins can update licenses (revoke, etc.)
CREATE POLICY "Admins can update developer licenses"
  ON developer_licenses FOR UPDATE
  USING (is_admin());

-- Policy: Only admins can delete licenses
CREATE POLICY "Admins can delete developer licenses"
  ON developer_licenses FOR DELETE
  USING (is_admin());

-- ============================================
-- USER ROLES POLICIES UPDATE
-- Allow users to upsert their own roles (for developer flag)
-- ============================================

-- Drop existing policy that might conflict
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- Users can view their own roles
CREATE POLICY "Users can view own user roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Users can insert their own roles row (for new users)
CREATE POLICY "Users can insert own user roles"
  ON user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their is_developer flag (but not is_admin)
-- This is controlled via trigger to prevent abuse
CREATE POLICY "Users can update own developer status"
  ON user_roles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    -- Only allow setting is_developer to true if user has a valid license
    (
      is_developer = FALSE OR
      EXISTS (
        SELECT 1 FROM developer_licenses dl
        WHERE dl.user_id = auth.uid()
        AND dl.revoked_at IS NULL
        AND dl.lifetime = TRUE
      )
    ) AND
    -- Never allow setting is_admin via this policy (admin must be set by another admin)
    (is_admin = FALSE OR is_admin = (SELECT is_admin FROM user_roles WHERE user_id = auth.uid()))
  );

-- Admins can manage all roles
CREATE POLICY "Admins can manage all user roles"
  ON user_roles FOR ALL
  USING (is_admin());

-- ============================================
-- AUDIT EVENTS - Allow users to insert their own audit events
-- ============================================

-- Allow authenticated users to insert audit events for their own actions
CREATE POLICY "Users can create own audit events"
  ON audit_events FOR INSERT
  WITH CHECK (actor_user_id = auth.uid());

-- ============================================
-- END OF MIGRATION
-- ============================================
