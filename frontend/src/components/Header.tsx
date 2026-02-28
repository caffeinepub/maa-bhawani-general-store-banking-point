import { ShoppingCart, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCart, useIsCallerAdmin, useGetShopOpenStatus } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { clearAdminSession } from './AdminGuard';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: cart = [] } = useGetCart();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { data: isShopOpen } = useGetShopOpenStatus();
  const queryClient = useQueryClient();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const cartItemCount = cart.length;

  const handleAuth = async () => {
    if (isAuthenticated) {
      // Always clear admin session on logout
      clearAdminSession();
      await clear();
      queryClient.clear();
      if (location.pathname.startsWith('/admin')) {
        navigate({ to: '/' });
      }
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/generated/store-logo.dim_512x512.png"
                alt="Maa Bhawani General Store"
                className="h-12 w-12 rounded-full object-contain"
                style={{ background: '#f5f0e8' }}
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">Maa Bhawani General Store</h1>
                  {isShopOpen !== undefined && (
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${isShopOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
                      title={isShopOpen ? 'Shop Open' : 'Shop Closed'}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500">& Banking Point</p>
              </div>
            </button>

            <nav className="flex items-center gap-2">
              {isAuthenticated && isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/admin' })}
                  className="gap-2 text-gray-700 hover:text-primary hover:bg-primary/10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {cartItemCount}
                    </span>
                  )}
                  <span className="hidden sm:inline">Cart</span>
                </button>
              )}

              <button
                onClick={handleAuth}
                disabled={disabled}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 ${
                  isAuthenticated
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    : 'bg-[#0056b3] hover:bg-[#004494] text-white'
                }`}
              >
                {isAuthenticated ? (
                  <>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {disabled ? 'Logging in...' : 'Login'}
                  </>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
