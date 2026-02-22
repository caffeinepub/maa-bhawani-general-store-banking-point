import { type ReactNode } from 'react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, isInitializing: identityInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: adminCheckLoading, error: adminCheckError, refetch } = useIsCallerAdmin();

  // Log current state for debugging
  console.log('[AdminGuard] State:', {
    hasIdentity: !!identity,
    identityPrincipal: identity?.getPrincipal().toString(),
    identityInitializing,
    hasActor: !!actor,
    actorFetching,
    isAdmin,
    adminCheckLoading,
    adminCheckError,
  });

  // Check if user is not authenticated
  if (!identity && !identityInitializing) {
    console.log('[AdminGuard] User not authenticated');
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to access the admin panel. Click the "Login" button in the header to authenticate.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state while initializing or checking admin status
  const isLoading = identityInitializing || actorFetching || adminCheckLoading;
  
  if (isLoading) {
    console.log('[AdminGuard] Loading state - identityInitializing:', identityInitializing, 'actorFetching:', actorFetching, 'adminCheckLoading:', adminCheckLoading);
    return (
      <div className="container mx-auto px-4 py-12 space-y-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Verifying admin access...</p>
        </div>
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Handle errors during admin check
  if (adminCheckError) {
    console.error('[AdminGuard] Admin check error:', adminCheckError);
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error Checking Admin Status</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>There was an error verifying your admin privileges. This could be due to a network issue or backend error.</p>
            <p className="text-sm font-mono bg-destructive/10 p-2 rounded">
              {adminCheckError.message || 'Unknown error'}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is not an admin
  if (isAdmin === false) {
    console.log('[AdminGuard] User is not an admin');
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>You do not have admin privileges to access this panel.</p>
            <p className="text-sm">
              If you believe you should have access, please contact the store owner at{' '}
              <a href="tel:9142876085" className="font-semibold underline">
                9142876085
              </a>{' '}
              to request admin access.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Your Principal ID: {identity?.getPrincipal().toString()}
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User is authenticated and is an admin
  console.log('[AdminGuard] Access granted - rendering admin content');
  return <>{children}</>;
}
