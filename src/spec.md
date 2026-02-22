# Specification

## Summary
**Goal:** Upgrade the barcode scanning system to professional-grade performance with zero-latency detection, enhanced decoding capabilities, and improve billing accuracy with corrected store address.

**Planned changes:**
- Replace Quagga2 scanner with high-performance zero-latency barcode scanner capable of reading blurred, tilted, or low-light barcodes
- Add professional scanning overlay UI (laser line or square box guide) to camera view
- Implement instant haptic feedback (vibration) and success beep sound on successful scan
- Enable auto-quantity increment when same barcode is scanned multiple times (no duplicate line items)
- Update hardcoded billing address to 'Bardiha Turki - Tarvadih (Patepur-Vaishali 843110), Bihar' at top of all bills/invoices
- Sync final bill total with payment gateway for seamless checkout
- Update camera permission description to explain professional barcode scanning functionality

**User-visible outcome:** Store admin experiences instant, professional-grade barcode scanning with visual guides, immediate feedback, and automatic quantity handling. All generated bills display the correct store address at the top, and checkout flows seamlessly with accurate payment amounts.
