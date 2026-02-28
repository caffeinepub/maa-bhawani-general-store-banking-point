import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { SESSION_KEY, AdminSession, getAdminSession } from '../components/AdminGuard';

// Hardcoded admin credentials
const ADMIN_ID = '919708075648';
const ADMIN_PASSWORD = '979142876085';

const REMEMBER_ME_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to admin
  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      navigate({ to: '/admin' });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminId.trim() || !password.trim()) {
      setError('Both Admin ID and Password are required.');
      return;
    }

    setIsLoading(true);

    // Small delay to prevent brute-force timing attacks
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (adminId.trim() === ADMIN_ID && password.trim() === ADMIN_PASSWORD) {
      const now = Date.now();
      const expiresAt = now + (rememberMe ? REMEMBER_ME_EXPIRY : SESSION_EXPIRY);

      const session: AdminSession = {
        authenticated: true,
        timestamp: now,
        expiresAt,
      };

      if (rememberMe) {
        // Persist across browser restarts for 7 days
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        sessionStorage.removeItem(SESSION_KEY);
      } else {
        // Only valid for this browser session (cleared on close)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        localStorage.removeItem(SESSION_KEY);
      }

      navigate({ to: '/admin' });
    } else {
      setError('Invalid Admin ID or Password. Please try again.');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0056b3] px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-blue-100 text-sm mt-1">Maa Bhawani General Store</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">Sign In</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your credentials to access the admin panel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Admin ID */}
              <div className="space-y-2">
                <Label htmlFor="adminId" className="text-sm font-medium text-gray-700">
                  Admin ID
                </Label>
                <Input
                  id="adminId"
                  type="text"
                  placeholder="Enter your Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Remember me for 7 days
                </Label>
              </div>

              {/* Error */}
              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !adminId.trim() || !password.trim()}
                className="w-full h-11 bg-[#0056b3] hover:bg-[#004494] text-white font-semibold text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs text-gray-400">
              Without "Remember Me", your session will end when you close the browser.
            </p>
          </div>
        </div>

        {/* Back to store */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    </div>
  );
}
