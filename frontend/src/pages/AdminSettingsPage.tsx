import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertTriangle, Zap, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useActor } from '../hooks/useActor';
import { useSetShopStatus, useGetShopSlogan, useSetShopSlogan } from '../hooks/useQueries';

export default function AdminSettingsPage() {
  const { actor } = useActor();
  const [slogan, setSlogan] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiLoading, setUpiLoading] = useState(false);
  const [upiSaving, setUpiSaving] = useState(false);
  const [showUpi, setShowUpi] = useState(false);

  const { data: currentSlogan } = useGetShopSlogan();
  const setShopSloganMutation = useSetShopSlogan();
  // useSetShopStatus now accepts a boolean (true = open, false = closed)
  const setShopStatusMutation = useSetShopStatus();

  useEffect(() => {
    if (currentSlogan) setSlogan(currentSlogan);
  }, [currentSlogan]);

  useEffect(() => {
    if (!actor) return;
    setUpiLoading(true);
    actor.getStoreUpiId()
      .then((id) => { if (id) setUpiId(id); })
      .catch(() => {})
      .finally(() => setUpiLoading(false));
  }, [actor]);

  const handleSaveSlogan = async () => {
    try {
      await setShopSloganMutation.mutateAsync(slogan);
      toast.success('Slogan updated successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update slogan');
    }
  };

  const handleSaveUpi = async () => {
    if (!actor) return;
    if (!upiId.trim()) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    if (!upiId.includes('@')) {
      toast.error('UPI ID must be in format: number@bankname (e.g., 9708075648@okbizaxis)');
      return;
    }
    setUpiSaving(true);
    try {
      await actor.setStoreUpiId(upiId.trim());
      toast.success('UPI ID saved successfully! Bills will now show the updated QR code.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save UPI ID');
    } finally {
      setUpiSaving(false);
    }
  };

  const handleEmergencyClose = async () => {
    try {
      // Pass boolean false to close the shop — backend expects boolean
      await setShopStatusMutation.mutateAsync(false);
      toast.success('Shop has been closed successfully.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to close shop');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Store Settings
        </h2>
        <p className="text-muted-foreground mt-1">Manage your store configuration and preferences.</p>
      </div>

      {/* UPI ID Settings */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-5 h-5 text-primary" />
            UPI Payment Settings
          </CardTitle>
          <CardDescription>
            Set your UPI ID to generate dynamic QR codes on bills. Customers can scan to pay the exact bill amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="upiId"
                  type={showUpi ? 'text' : 'password'}
                  placeholder="e.g., 9708075648@okbizaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={upiLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowUpi(!showUpi)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showUpi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                onClick={handleSaveUpi}
                disabled={upiSaving || upiLoading}
                className="shrink-0"
              >
                {upiSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save UPI
                  </span>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: <code className="bg-muted px-1 rounded">mobilenumber@bankcode</code> — e.g., <code className="bg-muted px-1 rounded">9708075648@okbizaxis</code>
            </p>
          </div>
          {upiId && upiId.includes('@') && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-medium">✅ UPI ID configured</p>
              <p className="text-xs text-green-600 mt-0.5">Bills will generate QR codes linked to: <strong>{showUpi ? upiId : upiId.replace(/(.{3}).*(@.*)/, '$1***$2')}</strong></p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slogan Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-5 h-5 text-primary" />
            Store Slogan
          </CardTitle>
          <CardDescription>
            Update the store slogan displayed on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              placeholder="Enter store slogan..."
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
            />
          </div>
          <Button
            onClick={handleSaveSlogan}
            disabled={setShopSloganMutation.isPending}
          >
            {setShopSloganMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Slogan
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Emergency Controls */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Emergency Controls
          </CardTitle>
          <CardDescription>
            Use these controls only in emergency situations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                disabled={setShopStatusMutation.isPending}
              >
                {setShopStatusMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Closing...
                  </span>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Emergency Close Shop
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Close Shop Immediately?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately close the shop and prevent new orders from being placed. Are you sure?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEmergencyClose}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Yes, Close Shop
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
