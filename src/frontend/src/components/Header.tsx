import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Store, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCart } from '../hooks/useQueries';
import CartDrawer from './CartDrawer';
import { useState } from 'react';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: cart = [] } = useGetCart();
  const [cartOpen, setCartOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const cartItemCount = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/assets/Gemini_Generated_Image_rjk9furjk9furjk9.png" 
              alt="Maa Bhawani General Store Logo" 
              className="h-12 w-12 rounded-full object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-primary">Maa Bhawani</span>
              <span className="text-xs text-muted-foreground">General Store & Banking Point</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors min-h-[44px] flex items-center">
              Shop
            </Link>
            <Link to="/store-details" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 min-h-[44px]">
              <Store className="h-4 w-4" />
              Store Info
            </Link>
            <a href="tel:9708075648" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 min-h-[44px]">
              <Phone className="h-4 w-4" />
              97080 75648
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative min-h-[44px] min-w-[44px]"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Button>

            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className="gap-2 min-h-[44px] px-4"
            >
              <User className="h-4 w-4" />
              {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </div>
        </div>
      </div>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
