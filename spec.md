# Specification

## Summary
**Goal:** Fix admin-to-website sync issues by ensuring all admin write operations await backend confirmation, adding real error feedback, and keeping the customer-facing shop status fresh via polling.

**Planned changes:**
- Fix the shop status toggle so it awaits backend confirmation before updating the UI, and invalidates/refetches the shop status query on both admin and website after a successful toggle
- Ensure all admin mutations (stock updates, order status changes, recharge submissions) await backend confirmation before showing success, removing any fire-and-forget or optimistic-only patterns
- Replace silent/fake loading states with visible error messages (toast or inline) for all admin write failures; revert UI state and dismiss spinners when an error occurs
- Add a 30-second polling interval and refetch-on-window-focus to the shop status query on the customer-facing website so open/closed state stays current

**User-visible outcome:** Admin toggles and writes reliably persist to the backend with clear success or error feedback, and customers always see the current shop open/closed status within 30 seconds of an admin change.
