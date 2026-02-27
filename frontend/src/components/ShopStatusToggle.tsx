import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetShopStatus, useToggleShopStatus } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Store } from 'lucide-react';

export default function ShopStatusToggle() {
  // Derive state exclusively from React Query cache — no local optimistic state
  const { data: isShopOpen, isLoading } = useGetShopStatus();
  const toggleShopStatus = useToggleShopStatus();

  const isPending = toggleShopStatus.isPending;

  const handleToggle = async () => {
    // Current confirmed server state
    const currentStatus = isShopOpen ?? false;
    const newStatus = !currentStatus;

    try {
      // Wait for server confirmation before UI updates
      await toggleShopStatus.mutateAsync(newStatus);
      toast.success(newStatus ? '✅ Store is now OPEN' : '🔴 Store is now CLOSED');
    } catch (error: any) {
      // On error, query cache is untouched — UI stays at last server-confirmed state
      toast.error(error.message || 'Failed to update shop status');
    }
  };

  if (isLoading && isShopOpen === undefined) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display state is ONLY from server-confirmed React Query cache
  const displayStatus = isShopOpen ?? false;

  return (
    <Card className={`shadow-sm border-2 ${displayStatus ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Store className={`h-5 w-5 ${displayStatus ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <p className="text-sm font-bold">
                {isPending ? (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Updating...
                  </span>
                ) : displayStatus ? (
                  <span className="text-green-700">Store OPEN</span>
                ) : (
                  <span className="text-red-700">Store CLOSED</span>
                )}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleToggle}
            disabled={isPending || isLoading}
            className={`text-xs font-semibold min-w-[80px] ${
              displayStatus
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPending ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Wait...
              </span>
            ) : displayStatus ? (
              'Close Shop'
            ) : (
              'Open Shop'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
