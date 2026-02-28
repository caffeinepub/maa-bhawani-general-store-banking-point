import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Save, Store, CreditCard, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import ShopStatusToggle from '../components/ShopStatusToggle';
import { useGetUpiId, useSetUpiId, useGetShopSlogan, useSetShopSlogan } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: currentUpiId, isLoading: upiLoading } = useGetUpiId();
  const { data: currentSlogan, isLoading: sloganLoading } = useGetShopSlogan();

  const setUpiMutation = useSetUpiId();
  const setSloganMutation = useSetShopSlogan();

  const [upiId, setUpiId] = useState('');
  const [slogan, setSlogan] = useState('');

  useEffect(() => {
    if (currentUpiId !== undefined) setUpiId(currentUpiId);
  }, [currentUpiId]);

  useEffect(() => {
    if (currentSlogan !== undefined) setSlogan(currentSlogan);
  }, [currentSlogan]);

  const handleSaveUpi = async () => {
    if (!upiId.trim()) {
      toast.error('UPI ID cannot be empty');
      return;
    }
    if (!isAuthenticated) {
      toast.error('You must be logged in via Internet Identity to save settings. Please log in from the header.');
      return;
    }
    try {
      await setUpiMutation.mutateAsync(upiId.trim());
      toast.success('UPI ID saved successfully!');
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('Unauthorized')) {
        toast.error('Unauthorized: Please log in via Internet Identity (the Login button in the header) to save settings.');
      } else {
        toast.error(`Failed to save UPI ID: ${msg}`);
      }
    }
  };

  const handleSaveSlogan = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in via Internet Identity to save settings. Please log in from the header.');
      return;
    }
    try {
      await setSloganMutation.mutateAsync(slogan.trim());
      toast.success('Slogan saved successfully!');
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('Unauthorized')) {
        toast.error('Unauthorized: Please log in via Internet Identity (the Login button in the header) to save settings.');
      } else {
        toast.error(`Failed to save slogan: ${msg}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Settings</h1>
            <p className="text-xs text-gray-500">Manage store configuration</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Auth Notice */}
        {!isAuthenticated && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <strong>Note:</strong> To save settings to the database, you must also log in via Internet Identity using the <strong>Login</strong> button in the header. The admin password only unlocks this panel's UI.
            </AlertDescription>
          </Alert>
        )}

        {/* UPI Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              UPI Payment Settings
            </CardTitle>
            <CardDescription>
              Set the UPI ID used for payment QR codes on bills and checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="upiId">UPI ID</Label>
              <div className="flex gap-2">
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okbizaxis"
                  disabled={upiLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveUpi}
                  disabled={setUpiMutation.isPending || upiLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {setUpiMutation.isPending ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Save className="w-4 h-4" />
                      Save
                    </span>
                  )}
                </Button>
              </div>
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Login via Internet Identity in the header to enable saving.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Shop Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              Shop Status
            </CardTitle>
            <CardDescription>
              Open or close the shop. When closed, customers cannot place new orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShopStatusToggle />
            {!isAuthenticated && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-3">
                <AlertTriangle className="w-3 h-3" />
                Login via Internet Identity in the header to enable saving.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Store Slogan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              Store Slogan
            </CardTitle>
            <CardDescription>
              The slogan displayed on the storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="slogan">Slogan</Label>
              <div className="flex gap-2">
                <Input
                  id="slogan"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="e.g. Welcome to our shop!"
                  disabled={sloganLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveSlogan}
                  disabled={setSloganMutation.isPending || sloganLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {setSloganMutation.isPending ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Save className="w-4 h-4" />
                      Save
                    </span>
                  )}
                </Button>
              </div>
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Login via Internet Identity in the header to enable saving.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
