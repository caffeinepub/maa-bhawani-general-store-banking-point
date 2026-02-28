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
import { useSetShopStatus, useGetShopSlogan, useSetShopSlogan, useGetUpiId, useSetUpiId } from '../hooks/useQueries';

const DEFAULT_UPI_ID = '9708075648-1@okbizaxis';

export default function AdminSettingsPage() {
  const [slogan, setSlogan] = useState('');
  const [upiInput, setUpiInput] = useState('');
  const [showUpi, setShowUpi] = useState(false);

  const { data: currentSlogan } = useGetShopSlogan();
  const { data: currentUpiId, isLoading: upiLoading } = useGetUpiId();
  const setShopSloganMutation = useSetShopSlogan();
  const setUpiIdMutation = useSetUpiId();
  // useSetShopStatus accepts a boolean (true = open, false = closed)
  const setShopStatusMutation = useSetShopStatus();

  useEffect(() => {
    if (currentSlogan) setSlogan(currentSlogan);
  }, [currentSlogan]);

  useEffect(() => {
    if (currentUpiId) setUpiInput(currentUpiId);
  }, [currentUpiId]);

  const handleSaveSlogan = async () => {
    try {
      await setShopSloganMutation.mutateAsync(slogan);
      toast.success('Slogan updated successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update slogan');
    }
  };

  const handleSaveUpi = async () => {
    const trimmed = upiInput.trim();
    if (!trimmed) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    if (!trimmed.includes('@')) {
      toast.error('UPI ID must contain "@" — e.g., 9708075648-1@okbizaxis');
      return;
    }
    try {
      await setUpiIdMutation.mutateAsync(trimmed);
      toast.success('UPI ID saved successfully! Bills will now show the updated QR code.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save UPI ID');
    }
  };

  const handleEmergencyClose = async () => {
    try {
      await setShopStatusMutation.mutateAsync(false);
      toast.success('Shop has been closed successfully.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to close shop');
    }
  };

  const displayUpi = upiInput || DEFAULT_UPI_ID;
  const maskedUpi = displayUpi.replace(/(.{3}).*(@.*)/, '$1***$2');

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Store Settings
        </h2>
        <p className="text-muted-foreground mt-1">Manage your store configuration and preferences.</p>
      </div>

      {/* UPI Payment Settings */}
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
                  placeholder={`e.g., ${DEFAULT_UPI_ID}`}
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  disabled={upiLoading || setUpiIdMutation.isPending}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowUpi(!showUpi)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showUpi ? 'Hide UPI ID' : 'Show UPI ID'}
                >
                  {showUpi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                onClick={handleSaveUpi}
                disabled={setUpiIdMutation.isPending || upiLoading}
                className="shrink-0"
              >
                {setUpiIdMutation.isPending ? (
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
              Format: <code className="bg-muted px-1 rounded">mobilenumber@bankcode</code> — default: <code className="bg-muted px-1 rounded">{DEFAULT_UPI_ID}</code>
            </p>
          </div>

          {upiLoading ? (
            <div className="p-3 bg-muted/40 border border-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Loading UPI configuration...</p>
            </div>
          ) : displayUpi && displayUpi.includes('@') ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-medium">✅ UPI ID configured</p>
              <p className="text-xs text-green-600 mt-0.5">
                Bills will generate QR codes linked to:{' '}
                <strong>{showUpi ? displayUpi : maskedUpi}</strong>
              </p>
            </div>
          ) : null}
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
