import { Home, Search, ShoppingBag, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from '@tanstack/react-router';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Search', icon: Search, path: '/search' },
  { label: 'My Orders', icon: ShoppingBag, path: '/my-orders' },
  { label: 'Wallet', icon: Wallet, path: '/wallet' },
];

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] safe-area-bottom">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate({ to: path })}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-green-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
