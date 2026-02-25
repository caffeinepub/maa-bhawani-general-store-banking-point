import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetShopOpenStatus, useSetShopOpenStatus } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ShopStatusToggle() {
  const { data: isShopOpen, isLoading } = useGetShopOpenStatus();
  const setShopStatus = useSetShopOpenStatus();

  const handleDirectUpdate = async (newStatus: boolean) => {
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

  const currentStatus = isShopOpen ?? true;
  const isPending = setShopStatus.isPending;

  return (
    <Card className="bg-white shadow-sm border-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold">Shop Status</p>
            <p className="text-sm text-muted-foreground">
              {currentStatus
                ? 'Shop is currently accepting orders'
                : 'Shop is currently closed for orders'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator — no animation */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${currentStatus ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span
                className={`font-semibold text-sm ${currentStatus ? 'text-green-600' : 'text-red-600'}`}
              >
                {currentStatus ? 'Open' : 'Closed'}
              </span>
            </div>

            {/* Direct update button */}
            <Button
              variant={currentStatus ? 'destructive' : 'default'}
              size="sm"
              disabled={isPending}
              onClick={() => handleDirectUpdate(!currentStatus)}
              className={
                currentStatus
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : currentStatus ? (
                'Close Shop'
              ) : (
                'Open Shop'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
