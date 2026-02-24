# Specification

## Summary
**Goal:** Implement hardcoded admin login with fixed credentials (ID: 919708075648, Password: 979142876085) and 24-hour session persistence, with automatic redirect to admin dashboard.

**Planned changes:**
- Rewrite admin login to accept only hardcoded credentials without database checks or OTP verification
- Grant full admin access immediately when credentials match
- Set admin session duration to 24 hours to prevent automatic logouts
- Redirect directly to /admin/dashboard after successful login
- Fix any 404 or Access Denied errors on admin dashboard routes

**User-visible outcome:** Admin can log in using the fixed credentials, stay logged in for 24 hours without interruption, and access the admin dashboard immediately without authentication errors.
