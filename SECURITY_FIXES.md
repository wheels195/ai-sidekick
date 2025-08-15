# Supabase Security Warnings Resolution

## Fixed by Migration (20250815000000_fix_security_warnings.sql)

### ✅ Function Search Path Mutable Warnings
Fixed all three function search_path warnings by adding:
- `SECURITY DEFINER` - Ensures functions run with creator privileges
- `SET search_path = public` - Explicitly sets secure search path

**Functions Fixed:**
1. `update_updated_at_column` - Timestamp update function
2. `cleanup_old_places_cache` - Places cache cleanup function  
3. `cleanup_old_web_search_cache` - Web search cache cleanup function

## Manual Dashboard Configuration Required

### ⚠️ Extension in Public Schema
**Warning:** Extension `vector` is installed in the public schema

**Action:** This typically requires superuser privileges that Supabase manages. Contact Supabase support if needed, or check if they've moved it automatically in newer instances.

### ⚠️ Auth OTP Long Expiry  
**Warning:** OTP expiry exceeds recommended threshold (currently > 1 hour)

**Action:** In Supabase Dashboard:
1. Go to Authentication → Settings
2. Find "Email OTP expiry" setting
3. Change from current value to **900 seconds (15 minutes)** or **600 seconds (10 minutes)**

### ⚠️ Leaked Password Protection Disabled
**Warning:** Leaked password protection is currently disabled

**Action:** In Supabase Dashboard:
1. Go to Authentication → Settings
2. Find "Password Protection" section
3. Enable "Check against HaveIBeenPwned database"

## Security Impact

**High Priority (Dashboard fixes needed):**
- OTP expiry: Reduces attack window for email verification
- Leaked password protection: Prevents compromised passwords

**Medium Priority (Migration fixes):**
- Function search paths: Prevents potential privilege escalation

**Low Priority (Extension location):**
- Vector extension: Organizational security best practice

## Next Steps

1. ✅ Run the migration: `20250815000000_fix_security_warnings.sql`
2. ⚠️ Configure OTP expiry in dashboard (15 minutes recommended)
3. ⚠️ Enable leaked password protection in dashboard
4. 📞 Contact Supabase about vector extension if needed

After these changes, all security warnings should be resolved for production deployment.