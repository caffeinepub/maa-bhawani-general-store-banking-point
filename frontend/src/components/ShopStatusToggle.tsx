import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useGetShopOpenStatus, useSetShopOpenStatus } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ShopStatusToggle() {
  const { data: isShopOpen, isLoading } = useGetShopOpenStatus();
  const setShopStatus = useSetShopOpenStatus();

  const handleToggle = async () => {
    // Use the current known value; default to true if undefined
    const currentStatus = isShopOpen ?? true;
    const newStatus = !currentStatus;
    try {
      await setShopStatus.mutateAsync(newStatus);
      toast.success(newStatus ? 'Shop is now Open' : 'Shop is now Closed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update shop status');
    }
  };

  if (isLoading && isShopOpen === undefined) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading shop status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine the effective status: use optimistic value during mutation, else use fetched value
  const effectiveStatus = isShopOpen ?? true;

  return (
    <Card className="bg-white shadow-sm border-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="shop-status" className="text-lg font-semibold">
              Shop Status
            </Label>
            <p className="text-sm text-muted-foreground">
              {effectiveStatus
                ? 'Shop is currently accepting orders'
                : 'Shop is currently closed for orders'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {setShopStatus.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${effectiveStatus ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
              />
              <span className={`font-semibold ${effectiveStatus ? 'text-green-600' : 'text-red-600'}`}>
                {effectiveStatus ? 'Open' : 'Closed'}
              </span>
            </div>
            <Switch
              id="shop-status"
              checked={effectiveStatus}
              onCheckedChange={handleToggle}
              disabled={setShopStatus.isPending}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
