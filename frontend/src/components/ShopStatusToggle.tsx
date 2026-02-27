import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useShopStatus, useSetShopStatus } from '../hooks/useQueries';

export default function ShopStatusToggle() {
  const shopStatusQuery = useShopStatus();
  const setShopStatusMutation = useSetShopStatus();

  const isOpen = shopStatusQuery.data ?? true;
  const isLoading = shopStatusQuery.isLoading || setShopStatusMutation.isPending;

  const handleToggle = async (checked: boolean) => {
    if (setShopStatusMutation.isPending) return;
    try {
      await setShopStatusMutation.mutateAsync(checked);
    } catch {
      // Error is handled via mutation.isError
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Switch
          id="shop-status"
          checked={isOpen}
          onCheckedChange={handleToggle}
          disabled={isLoading}
          className={isOpen ? 'data-[state=checked]:bg-green-500' : ''}
        />
        <Label htmlFor="shop-status" className="flex items-center gap-2 cursor-pointer select-none">
          {isLoading ? (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </span>
          ) : (
            <span className={`text-sm font-semibold ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
              {isOpen ? '🟢 Shop is OPEN' : '🔴 Shop is CLOSED'}
            </span>
          )}
        </Label>
      </div>

      {setShopStatusMutation.isError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to update shop status: {setShopStatusMutation.error?.message ?? 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {shopStatusQuery.isError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to fetch shop status: {(shopStatusQuery.error as Error)?.message ?? 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
