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
      console.error('[AdminGuard] Failed to copy principal:', err);
    }
  };

  const handleShowLogin = () => {
    console.log('[AdminGuard] Opening admin login dialog');
    setShowLoginDialog(true);
    setLoginError(null);
    setAdminId('');
    setAdminPassword('');
  };

  const handleSubmitLogin = async () => {
    console.log('[AdminGuard] ========== ADMIN LOGIN ATTEMPT ==========');
    console.log('[AdminGuard] Timestamp:', new Date().toISOString());
    
    if (!adminId.trim() || !adminPassword.trim()) {
      console.log('[AdminGuard] Validation failed: Empty credentials');
      setLoginError('Both Admin ID and Password are required');
      return;
    }

    if (!actor) {
      console.log('[AdminGuard] Actor not available');
      setLoginError('Backend connection not available. Please refresh the page.');
      return;
    }

    const trimmedId = adminId.trim();
    const trimmedPassword = adminPassword.trim();

    console.log('[AdminGuard] Credentials being sent:');
    console.log('  - Admin ID:', trimmedId);
    console.log('  - Password length:', trimmedPassword.length);
    console.log('  - Password first char:', trimmedPassword.charAt(0));
    console.log('  - Password last char:', trimmedPassword.charAt(trimmedPassword.length - 1));

    try {
      setLoginError(null);
      
      console.log('[AdminGuard] Calling authenticateMutation.mutateAsync...');
      const result = await authenticateMutation.mutateAsync({
        adminId: trimmedId,
        adminPassword: trimmedPassword,
      });
      
      console.log('[AdminGuard] ========== AUTHENTICATION RESULT ==========');
      console.log('[AdminGuard] Full result object:', JSON.stringify(result, null, 2));
      console.log('[AdminGuard] result.success:', result.success);
      console.log('[AdminGuard] result.message:', result.message);
      console.log('[AdminGuard] typeof result.success:', typeof result.success);
      
      if (result.success === true) {
        console.log('[AdminGuard] ✅ Authentication SUCCESSFUL');
        console.log('[AdminGuard] Closing dialog and refetching admin status...');
        setShowLoginDialog(false);
        setAdminId('');
        setAdminPassword('');
        
        // Wait a moment before refetching to ensure backend state is updated
        setTimeout(async () => {
          console.log('[AdminGuard] Refetching admin status...');
          await refetch();
          console.log('[AdminGuard] Admin status refetched');
        }, 500);
      } else {
        console.log('[AdminGuard] ❌ Authentication FAILED');
        console.error('[AdminGuard] Failure message:', result.message);
        setLoginError(result.message || 'Invalid Admin ID or Password');
      }
    } catch (error: any) {
      console.log('[AdminGuard] ========== AUTHENTICATION ERROR ==========');
      console.error('[AdminGuard] Exception caught:', error);
      console.error('[AdminGuard] Error type:', typeof error);
      console.error('[AdminGuard] Error message:', error?.message);
      console.error('[AdminGuard] Error stack:', error?.stack);
      
      // Parse error message
      let errorMessage = 'Failed to authenticate. Please check your credentials and try again.';
      if (error.message) {
        if (error.message.includes('Anonymous') || error.message.includes('anonymous')) {
          errorMessage = 'You must be logged in with Internet Identity first.';
        } else if (error.message.includes('Authentication failed')) {
          errorMessage = 'Invalid Admin ID or Password. Please check your credentials.';
        } else if (error.message.includes('Invalid') || error.message.includes('Unauthorized')) {
          errorMessage = 'Invalid Admin ID or Password.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.log('[AdminGuard] Setting error message:', errorMessage);
      setLoginError(errorMessage);
    }
    
    console.log('[AdminGuard] ========== LOGIN ATTEMPT COMPLETE ==========');
  };

  // Check if user is not authenticated
  if (!identity && !identityInitializing) {
    console.log('[AdminGuard] User not authenticated with Internet Identity');
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
            <div className="space-y-2">
              <p className="text-sm font-semibold">Error details:</p>
              <pre className="text-xs font-mono bg-destructive/10 p-2 rounded overflow-auto">
                {adminCheckError.message || 'Unknown error'}
              </pre>
            </div>
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
    console.log('[AdminGuard] User is not an admin, showing access denied screen');
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && adminId.trim() && adminPassword.trim()) {
                      handleSubmitLogin();
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && adminId.trim() && adminPassword.trim()) {
                      handleSubmitLogin();
                    }
                  }}
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
  console.log('[AdminGuard] ✅ User is authenticated as admin, rendering children');
  return <>{children}</>;
}
