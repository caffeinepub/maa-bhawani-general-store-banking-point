import { type ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

export const SESSION_KEY = 'adminSession';
export const SESSION_KEY_SS = 'adminSession'; // same key, different storage

export interface AdminSession {
  authenticated: boolean;
  timestamp: number;
  expiresAt: number;
}

export function getAdminSession(): AdminSession | null {
  try {
    // Check localStorage first (Remember Me sessions)
    const lsStored = localStorage.getItem(SESSION_KEY);
    if (lsStored) {
      const session: AdminSession = JSON.parse(lsStored);
      if (session.authenticated && Date.now() < session.expiresAt) {
        return session;
      }
      // Expired — clean up
      localStorage.removeItem(SESSION_KEY);
    }

    // Fall back to sessionStorage (non-Remember Me sessions)
    const ssStored = sessionStorage.getItem(SESSION_KEY_SS);
    if (ssStored) {
      const session: AdminSession = JSON.parse(ssStored);
      if (session.authenticated && Date.now() < session.expiresAt) {
        return session;
      }
      // Expired — clean up
      sessionStorage.removeItem(SESSION_KEY_SS);
    }

    return null;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY_SS);
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();

  // Synchronous session check — runs before paint
  const session = getAdminSession();

  useEffect(() => {
    if (!session) {
      navigate({ to: '/login' });
    }
  }, [session, navigate]);

  // If no valid session, show nothing (redirect is in flight)
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Checking authentication…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
