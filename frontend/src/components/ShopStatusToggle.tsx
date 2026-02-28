import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useShopStatus, useSetShopStatus } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ShopStatusToggle() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: shopOpen, isLoading } = useShopStatus();
  const setShopStatusMutation = useSetShopStatus();

  const handleToggle = async (checked: boolean) => {
    if (!isAuthenticated) {
      toast.error('Please log in via Internet Identity (Login button in header) to change shop status.');
      return;
    }
    try {
      await setShopStatusMutation.mutateAsync(checked);
      toast.success(`Shop is now ${checked ? 'OPEN' : 'CLOSED'}`);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('Unauthorized')) {
        toast.error('Unauthorized: Please log in via Internet Identity to change shop status.');
      } else {
        toast.error(`Failed to update shop status: ${msg}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-6 bg-gray-200 rounded-full animate-pulse" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Switch
          id="shopStatus"
          checked={shopOpen ?? true}
          onCheckedChange={handleToggle}
          disabled={setShopStatusMutation.isPending || !isAuthenticated}
        />
        <Label htmlFor="shopStatus" className="cursor-pointer">
          {setShopStatusMutation.isPending ? (
            <span className="flex items-center gap-1.5 text-gray-500">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Updating...
            </span>
          ) : (
            <span className={shopOpen ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              Shop is currently {shopOpen ? 'OPEN' : 'CLOSED'}
            </span>
          )}
        </Label>
      </div>

      {setShopStatusMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {(setShopStatusMutation.error as any)?.message?.includes('Unauthorized')
              ? 'Unauthorized: Please log in via Internet Identity to change shop status.'
              : `Error: ${(setShopStatusMutation.error as any)?.message || 'Unknown error'}`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
