import { type ReactNode, useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Loader2, RefreshCw, Copy, Check, LogIn, Info, Phone } from 'lucide-react';
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

// Hardcoded credentials
const ADMIN_ID = '919708075648';
const ADMIN_PASSWORD = '979142876085';
const SESSION_KEY = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface AdminSession {
  authenticated: boolean;
  timestamp: number;
}

function getAdminSession(): AdminSession | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    const session: AdminSession = JSON.parse(stored);
    const now = Date.now();
    
    // Check if session is still valid (within 24 hours)
    if (now - session.timestamp > SESSION_DURATION) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

function setAdminSession(): void {
  const session: AdminSession = {
    authenticated: true,
    timestamp: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearAdminSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const { identity, isInitializing: identityInitializing, clear: clearIdentity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: adminCheckLoading, error: adminCheckError, refetch } = useIsCallerAdmin();
  
  const [copied, setCopied] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);

  // Check for valid session on mount and periodically
  useEffect(() => {
    const checkSession = () => {
      const session = getAdminSession();
      setHasValidSession(!!session);
    };
    
    checkSession();
    const interval = setInterval(checkSession, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

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

    const trimmedId = adminId.trim();
    const trimmedPassword = adminPassword.trim();

    console.log('[AdminGuard] Checking credentials...');
    console.log('  - Admin ID:', trimmedId);
    console.log('  - Expected ID:', ADMIN_ID);
    console.log('  - Password length:', trimmedPassword.length);

    setIsAuthenticating(true);
    setLoginError(null);

    try {
      // Check hardcoded credentials
      if (trimmedId === ADMIN_ID && trimmedPassword === ADMIN_PASSWORD) {
        console.log('[AdminGuard] ✅ Credentials match! Authentication SUCCESSFUL');
        
        // Set session in localStorage
        setAdminSession();
        setHasValidSession(true);
        
        // Close dialog
        setShowLoginDialog(false);
        setAdminId('');
        setAdminPassword('');
        
        console.log('[AdminGuard] Session stored, redirecting to /admin/dashboard...');
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate({ to: '/admin/dashboard' });
        }, 100);
      } else {
        console.log('[AdminGuard] ❌ Credentials do not match');
        setLoginError('Invalid Admin ID or Password');
      }
    } catch (error: any) {
      console.error('[AdminGuard] Unexpected error during login:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
    
    console.log('[AdminGuard] ========== LOGIN ATTEMPT COMPLETE ==========');
  };

  const handleLogout = () => {
    clearAdminSession();
    setHasValidSession(false);
    clearIdentity();
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

  // Check if user has valid hardcoded admin session
  if (hasValidSession) {
    console.log('[AdminGuard] ✅ User has valid admin session, rendering children');
    return <>{children}</>;
  }

  // Check if user is backend admin (fallback)
  if (isAdmin === true) {
    console.log('[AdminGuard] ✅ User is authenticated as backend admin, rendering children');
    return <>{children}</>;
  }

  // User needs to authenticate with hardcoded credentials
  console.log('[AdminGuard] User needs to authenticate, showing access denied screen');
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
            {/* Credential Info Alert */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Admin Credentials Required</p>
                <p className="text-xs">Enter the exact Admin ID and Password provided by the store owner.</p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="adminId">Admin ID</Label>
              <Input
                id="adminId"
                type="text"
                placeholder="Enter admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                disabled={isAuthenticating}
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
                disabled={isAuthenticating}
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

            {/* Forgot Password Section */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Forgot Password?</p>
                  <p className="text-xs text-muted-foreground">
                    Contact the store owner for password reset assistance:
                  </p>
                  <a 
                    href="tel:919708075648" 
                    className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    +91 9708075648
                  </a>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              disabled={isAuthenticating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitLogin}
              disabled={isAuthenticating || !adminId.trim() || !adminPassword.trim()}
            >
              {isAuthenticating ? (
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
