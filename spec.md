# Specification

## Summary
**Goal:** Fix admin lockout and login flow, repair broken Save buttons, and replace all "Coming Soon" placeholder pages with functional implementations.

**Planned changes:**
- Reset admin credentials to default (`admin` / `admin123`) and fix session creation so AdminGuard correctly recognizes a valid login session from localStorage/sessionStorage
- Rebuild the AdminLoginPage to always display a Username and Password form; ensure it is publicly accessible and never wrapped in AdminGuard
- Fix App.tsx routing so all `/admin` and `/admin/*` paths go through AdminGuard, redirecting unauthenticated users to the login page
- Fix "Actor not available" errors in useQueries.ts by ensuring mutations wait for the actor before executing and handle null/undefined gracefully
- Verify Motoko backend write functions (setUpiId, setShopStatus, setSlogan, etc.) do not reject frontend calls due to principal-based authorization conflicts
- Replace "Coming Soon" placeholder in SearchPage with a working search input that filters products by name/category and displays results using ProductCard components
- Replace "Coming Soon" placeholder in WalletPage with a wallet/cashback UI showing balance and transaction history (or zero-state)
- Replace "Coming Soon" placeholder in MyOrdersPage with order history fetched from the backend (or empty-state if no orders)
- Update BottomNavBar links for Search and Wallet to navigate to the now-functional pages

**User-visible outcome:** Admin can log in with default credentials without being locked out, Save buttons for UPI ID and Shop Status work without "Unauthorized" errors, and Search, Wallet, and My Orders pages are fully functional instead of showing "Coming Soon."
