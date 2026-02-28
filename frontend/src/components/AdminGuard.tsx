import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const SESSION_KEY = 'admin_session';

export interface AdminSession {
  authenticated: boolean;
  createdAt: number;
  expiresAt: number;
}

export function getAdminSession(): AdminSession | null {
  try {
    // Check localStorage first (Remember Me)
    const lsRaw = localStorage.getItem(SESSION_KEY);
    if (lsRaw) {
      const session: AdminSession = JSON.parse(lsRaw);
      if (session.authenticated && session.expiresAt > Date.now()) {
        return session;
      }
      // Expired — clean up
      localStorage.removeItem(SESSION_KEY);
    }

    // Check sessionStorage (session-only)
    const ssRaw = sessionStorage.getItem(SESSION_KEY);
    if (ssRaw) {
      const session: AdminSession = JSON.parse(ssRaw);
      if (session.authenticated && session.expiresAt > Date.now()) {
        return session;
      }
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Corrupted data — clear it
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  return null;
}

export function clearAdminSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const session = getAdminSession();

  useEffect(() => {
    if (!session) {
      navigate({ to: '/login' });
    }
  }, [session, navigate]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
