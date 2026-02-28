import React from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Search, ShoppingBag, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Search', icon: Search, path: '/search' },
  { label: 'Orders', icon: ShoppingBag, path: '/my-orders' },
  { label: 'Wallet', icon: Wallet, path: '/wallet' },
];

export default function BottomNavBar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-pb">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const isActive = currentPath === path;
          return (
            <button
              key={path}
              onClick={() => navigate({ to: path })}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-green-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
