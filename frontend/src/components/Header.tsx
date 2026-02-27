import { ShoppingCart, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCart, useIsCallerAdmin, useGetShopOpenStatus } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { useNavigate, useLocation } from '@tanstack/react-router';

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
                src="/assets/generated/store-logo.dim_200x200.png"
                alt="Maa Bhawani General Store"
                className="h-10 w-10 rounded-full"
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground">Maa Bhawani General Store</h1>
                  {/* Shop Status Indicator */}
                  {isShopOpen !== undefined && (
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${isShopOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
                      title={isShopOpen ? 'Shop Open' : 'Shop Closed'}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">& Banking Point</p>
              </div>
            </button>

            <nav className="flex items-center gap-2">
              {isAuthenticated && isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/admin' })}
                  className="gap-2 hover:text-primary hover:bg-primary/5"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}

              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCartOpen(true)}
                  className="relative gap-2 hover:text-primary hover:bg-primary/5"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white text-xs">
                      {cartItemCount}
                    </Badge>
                  )}
                  <span className="hidden sm:inline">Cart</span>
                </Button>
              )}

              <Button
                onClick={handleAuth}
                disabled={disabled}
                size="sm"
                variant={isAuthenticated ? 'outline' : 'default'}
                className={`gap-2 min-w-[100px] ${
                  isAuthenticated
                    ? 'hover:bg-gray-100'
                    : 'bg-primary hover:bg-primary/90 text-white'
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
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Fixed: prop renamed from isOpen to open to match CartDrawerProps */}
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
