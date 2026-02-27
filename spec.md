# Specification

## Summary
**Goal:** Fix a critical white-on-white button visibility bug across the entire app by enforcing solid blue (#0056b3) backgrounds with white text on all primary action buttons.

**Planned changes:**
- Update global CSS custom properties (`--primary` → `#0056b3`, `--primary-foreground` → `#ffffff`) in `index.css` and `tailwind.config.js` so no button inherits a white-on-white style from theme tokens
- Force all primary action buttons (Sign In, Add to Cart, Place Order, Place Recharge Order, Checkout, etc.) to use `#0056b3` background with bold white text across all pages and components
- Fix the Header so that the Logout and Cart (with badge) buttons are clearly visible against the header background using sufficient color contrast
- Fix the Sign-In page login button to display `#0056b3` with white text and be visually prominent
- Fix CategoryFilter buttons so active/selected ones use `#0056b3` with white text and unselected ones use a visible light gray with dark text

**User-visible outcome:** All buttons throughout the app are clearly visible and clickable — no button blends into the background, and users can easily identify and interact with all call-to-action elements.
