import { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import CallUsButton from './CallUsButton';
import BottomNavBar from './BottomNavBar';
import WhatsAppHelpButton from './WhatsAppHelpButton';
import { useGetShopStatus } from '../hooks/useQueries';
import { useLocation } from '@tanstack/react-router';

interface LayoutProps {
  children: ReactNode;
}

const ADMIN_PATHS = ['/admin', '/billing'];

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p));
}

export default function Layout({ children }: LayoutProps) {
  // Prefetch shop status at the top level to prevent banner flashing
  useGetShopStatus();
  const location = useLocation();
  const showBottomNav = !isAdminPath(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className={`flex-1 container mx-auto px-3 py-3 max-w-2xl ${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      <Footer />
      <CallUsButton />
      {showBottomNav && (
        <>
          <BottomNavBar />
          <WhatsAppHelpButton />
        </>
      )}
    </div>
  );
}
