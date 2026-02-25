import { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import CallUsButton from './CallUsButton';
import { useGetShopOpenStatus } from '../hooks/useQueries';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Prefetch shop status at the top level to prevent banner flashing
  useGetShopOpenStatus();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
      <Footer />
      <CallUsButton />
    </div>
  );
}
