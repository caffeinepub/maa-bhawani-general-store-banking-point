# Specification

## Summary
**Goal:** Redesign the Admin Dashboard layout to professional standards and fix two bugs in the Add Product form (stuck button and broken barcode field).

**Planned changes:**
- Redesign `AdminPage.tsx` to use a professional two-column or sidebar-main layout with card-based panels, clear section headings, consistent spacing, and responsive design
- Redesign `AdminProductForm.tsx` "Add New Product" section as a clean card with grid/flex aligned fields grouped by category (basic info, pricing, media)
- Fix the Barcode field in `AdminProductForm.tsx` so manual text entry and camera-based barcode scanning both correctly populate and bind the form state
- Fix the "Add Product" button so it exits the "Adding Product…" loading state on both success and error, re-enables properly, and shows success/error feedback to the user

**User-visible outcome:** Admins see a polished, professional dashboard layout with a well-structured Add Product form, a working barcode input, and an "Add Product" button that completes normally instead of hanging.
