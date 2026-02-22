import { type ReactNode, useState } from 'react';
import { useIsCallerAdmin, useAuthenticateAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Loader2, RefreshCw, Copy, Check, LogIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, isInitializing: identityInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: adminCheckLoading, error: adminCheckError, refetch } = useIsCallerAdmin();
  const authenticateMutation = useAuthenticateAdmin();
  
  const [copied, setCopied] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleCopyPrincipal = async () => {
    if (!identity) return;
    
    const principal = identity.getPrincipal().toString();
    try {
      await navigator.clipboard.writeText(principal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy principal:', err);
    }
  };

  const handleShowLogin = () => {
    setShowLoginDialog(true);
    setLoginError(null);
    setAdminId('');
    setAdminPassword('');
  };

  const handleSubmitLogin = async () => {
    if (!adminId.trim() || !adminPassword.trim()) {
      setLoginError('Both Admin ID and Password are required');
      return;
    }

    try {
      setLoginError(null);
      const result = await authenticateMutation.mutateAsync({
        adminId: adminId.trim(),
        adminPassword: adminPassword.trim(),
      });
      
      if (result.success) {
        // Success - close dialog and refetch admin status
        setShowLoginDialog(false);
        await refetch();
      } else {
        setLoginError(result.message || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('[AdminGuard] Authentication error:', error);
      
      // Parse error message
      let errorMessage = 'Failed to authenticate. Please check your credentials and try again.';
      if (error.message) {
        if (error.message.includes('Anonymous')) {
          errorMessage = 'You must be logged in with Internet Identity first.';
        } else if (error.message.includes('Invalid')) {
          errorMessage = 'Invalid Admin ID or Password.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setLoginError(errorMessage);
    }
  };

  // Check if user is not authenticated
  if (!identity && !identityInitializing) {
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
    const principalId = identity?.getPrincipal().toString() || '';
    
    return (
      <>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied - Admin Privileges Required</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>You do not have administrator privileges to access this panel.</p>
              
              <div className="space-y-2">
                <p className="font-semibold text-sm">Your Internet Identity Principal:</p>
                <div className="flex items-center gap-2 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <code className="flex-1 text-xs break-all font-mono select-all">
                    {principalId}
                  </code>
                  <Button
                    onClick={handleCopyPrincipal}
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0"
                    title="Copy Principal ID"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-destructive/20">
                <p className="font-semibold text-sm">To gain admin access:</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Admin Login</p>
                  <p className="text-xs text-muted-foreground">
                    If you are the store owner, log in with your Admin ID and Password to access the admin panel.
                  </p>
                  <Button 
                    onClick={handleShowLogin}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Admin Login
                  </Button>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium">Need Access?</p>
                  <p className="text-sm">
                    Contact the store owner at{' '}
                    <a href="tel:9142876085" className="font-semibold underline">
                      9142876085
                    </a>
                    {' '}to request admin credentials.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Admin Login Dialog */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Admin Login</DialogTitle>
              <DialogDescription>
                Enter your Admin ID and Password to access the admin panel.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="adminId">Admin ID</Label>
                <Input
                  id="adminId"
                  type="text"
                  placeholder="Enter admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  disabled={authenticateMutation.isPending}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={authenticateMutation.isPending}
                  autoComplete="current-password"
                />
              </div>

              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription className="text-sm">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowLoginDialog(false)}
                disabled={authenticateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitLogin}
                disabled={authenticateMutation.isPending || !adminId.trim() || !adminPassword.trim()}
              >
                {authenticateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // User is authenticated and is an admin
  return <>{children}</>;
}
