# Specification

## Summary
**Goal:** Replace vegetable banners with grocery banners, fix the shop open/close toggle, redesign the admin panel with a dark/blue theme, and enforce delivery badge and fee logic.

**Planned changes:**
- Replace all vegetable/sabji-themed banners in the HeroBannerCarousel with new professional grocery banners featuring Rice, Oil, Biscuits, and Snacks; remove any vegetable imagery from the homepage
- Delete and rewrite the ShopStatusToggle component to directly call the backend mutation and optimistically update the UI; when closed, immediately show ShopClosedBanner, disable all Add to Cart buttons, and block checkout in CartDrawer; when open, lift all restrictions
- Redesign the AdminPage with a dark navy/slate background and blue accent colors, adding a stats row at the top with three metric cards: Total Orders, Active Users, and Shop Status (green/red indicator); restyle all admin tabs to match the new theme
- Ensure every ProductCard displays a "Delivery in 10 Mins" badge
- Enforce delivery fee logic in CartDrawer and CheckoutPage: ₹5 charge for orders below ₹51, free delivery for ₹51 and above, updating dynamically as cart changes

**User-visible outcome:** The homepage shows professional grocery banners with no vegetable imagery; the shop toggle reliably opens/closes the store in real time across all UI elements; the admin panel has a clean dark/blue dashboard with live stats; every product shows the delivery badge; and the correct delivery fee is always reflected in the cart and checkout.
