# Specification

## Summary
**Goal:** Add a free delivery threshold (₹51), distance-based ₹5 delivery charge for orders below ₹51, and a "Delivery in 10 Mins" label on all product cards.

**Planned changes:**
- Backend: Apply a ₹5 delivery charge when order total is below ₹51 and delivery distance is ≤ 1km; no charge for orders ₹51 or above; return delivery charge in the order/checkout response.
- Frontend (Checkout): Show a "Delivery Charge: ₹5" line item when cart total < ₹51 and distance is ≤ 1km; show "Free Delivery" when cart total is ₹51 or above; include delivery charge in the displayed grand total; preserve existing delivery fee logic for distances beyond 1km.
- Frontend (ProductCard): Add a small green "Delivery in 10 Mins" label immediately below every product name on all product cards.

**User-visible outcome:** Customers see a "Delivery in 10 Mins" badge under each product name, and at checkout they see either a ₹5 delivery charge or "Free Delivery" based on their cart total, with the grand total updated accordingly.
