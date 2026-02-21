import { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import CallUsButton from './CallUsButton';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
      <CallUsButton />
    </div>
  );
}
