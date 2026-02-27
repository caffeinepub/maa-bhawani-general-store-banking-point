# Specification

## Summary
**Goal:** Redesign the Maa Bhawani Store homepage layout, update the product grid to 2 columns, add a sticky bottom navigation bar, and add a floating WhatsApp Help button.

**Planned changes:**
- Redesign the HomePage: compact auto-sliding banner carousel at the top (≈140–160px tall on mobile), product grid immediately below the banner, and Mobile Recharge section relocated to the bottom of the page as a compact icon-based grid/card above the footer.
- Redesign ProductGrid to use a strict 2-column layout; each ProductCard shows a clean product image, bold product name, green "Delivery in 10 Mins" badge, and a prominent green "+ ADD" button.
- Replace the empty product state (no products found) with a styled "Coming Soon" illustration/graphic instead of plain text.
- Add a sticky bottom navigation bar fixed to the viewport bottom with 4 tabs: Home, Search, My Orders, and Wallet (each with icon + label); active tab highlighted in green; not shown on admin pages.
- Add bottom padding to page layouts so content is not obscured by the sticky nav.
- Add a floating WhatsApp Help button (green circular FAB, bottom-right, above the sticky nav) that opens a WhatsApp chat link on tap.

**User-visible outcome:** Customers see a cleaner homepage with a compact banner, an instant 2-column product grid, a bottom nav bar for quick access to Home/Search/Orders/Wallet, and a WhatsApp help button for quick support. The Mobile Recharge section is still accessible but tucked away at the bottom.
