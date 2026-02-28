# Specification

## Summary
**Goal:** Enforce proper password protection and session management for the admin panel so that no admin page is accessible without valid credentials.

**Planned changes:**
- Rewrite `AdminGuard` to synchronously check for a valid admin session (localStorage) on every page load, redirecting to `/login` immediately if no valid or unexpired session exists
- Add 24-hour timestamp-based session expiry; expired sessions are treated as no session
- Re-enable hardcoded password validation on the admin login page; wrong password shows an error and does not create a session
- Add a "Remember Me" checkbox: when checked, session persists in localStorage for 7 days; when unchecked, use sessionStorage so the session is cleared on browser close
- Wrap all admin routes (`/admin`, `/admin/settings`, `/admin/qr`, `/admin/billing`, and any other `/admin/*` sub-routes) with `AdminGuard` so none render content before the session check passes
- Ensure a logout button clears the session regardless of "Remember Me" setting

**User-visible outcome:** Accessing any admin page without logging in (or after a session expires/browser is closed without "Remember Me") immediately redirects to `/login`. Only users who enter the correct password can access the admin panel, and the session persists across refreshes only when "Remember Me" is checked.
