# Specification

## Summary
**Goal:** Replace the fixed Price field with a Unit Type dropdown in the Add Product form, and implement dynamic quantity input controls based on unit type (custom weight input for Kg/Gram, +/- buttons for Packet/Piece).

**Planned changes:**
- Replace Price input field with Unit Type dropdown (Kg, Gram, Packet, Piece) in AdminProductForm
- Update Product type and backend functions to store unitType instead of fixed price
- Display custom weight input field (accepts formats like '100g', '0.5kg') for products with Kg or Gram unit type on shop page
- Display only +/- quantity buttons for whole numbers on products with Packet or Piece unit type
- Update cart data structure to support both quantity-based and weight-based items
- Modify all product display components to show unit type and calculate totals based on unit type and quantity/weight

**User-visible outcome:** Admin can set unit types when adding products. Customers see weight input fields for Kg/Gram products (allowing custom amounts like "250g" or "1.5kg") and quantity buttons for Packet/Piece products. Cart and checkout correctly handle both measurement types.
