# Specification

## Summary
**Goal:** Add a shop management system that allows admins to manually open/close the store and prevents customer orders when closed.

**Planned changes:**
- Add a shop status toggle switch at the top of the Admin Dashboard for opening/closing the store
- Store and manage shop open/closed status in the backend with admin-only access
- Prevent new orders from being placed when the shop is closed
- Display a full-width notice banner on the home screen when closed with the message "Namaste! MBG Store is currently Closed. We are not accepting orders right now. We will open again at 8:00 AM. Thank you for your patience!"
- Disable all "Add to Cart" and "Checkout" buttons when the shop is closed
- Add a colored dot indicator (green when open, red when closed) next to the store name in the header
- Show a popup notification during checkout if the shop closes while a customer has items in their cart

**User-visible outcome:** Admins can control store availability with a toggle switch. Customers see clear visual indicators of shop status throughout the app, cannot place orders when closed, and receive appropriate messages explaining the closure.
