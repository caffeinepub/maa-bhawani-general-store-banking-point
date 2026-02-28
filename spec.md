# Specification

## Summary
**Goal:** Restore UPI Payment Settings in the Admin Panel, ensure all admin settings (UPI ID, Store Logo, Store Name/Slogan) persist across canister upgrades via stable variables, and make the bill QR code dynamically reflect the saved UPI ID.

**Planned changes:**
- Restore the "UPI Payment Settings" card in AdminSettingsPage.tsx with a UPI ID text input and a "Save UPI" button that persists the value to the backend
- Pre-populate the UPI input field with the currently saved UPI ID on page load
- Show a success or error toast/message after saving the UPI ID
- In main.mo, store the UPI ID in a `stable var` with default value `9708075648-1@okbizaxis`; ensure `getUpiId` and `setUpiId` (admin-only) methods are present
- Verify Store Logo URL and Store Name/Slogan are also stored in `stable var` declarations in main.mo so none of these settings reset on canister upgrades
- In BillTemplate, dynamically fetch the UPI ID from the backend via `getUpiId` and use it to generate the QR code URL, falling back to `9708075648-1@okbizaxis` if empty

**User-visible outcome:** Admins can enter and save a UPI ID from the Admin Settings page, and every generated bill will display a QR code reflecting the currently saved UPI ID. All saved settings (UPI, logo, store name) survive app updates.
