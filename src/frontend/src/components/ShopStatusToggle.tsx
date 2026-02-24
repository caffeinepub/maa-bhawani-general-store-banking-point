import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useGetShopOpenStatus, useSetShopOpenStatus } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ShopStatusToggle() {
  const { data: isShopOpen, isLoading } = useGetShopOpenStatus();
  const setShopStatus = useSetShopOpenStatus();

  const handleToggle = async (checked: boolean) => {
    try {
      await setShopStatus.mutateAsync(checked);
      toast.success(checked ? 'Shop is now Open' : 'Shop is now Closed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update shop status');
    }
  };

  if (isLoading) {
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

  return (
    <Card className="bg-white shadow-sm border-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="shop-status" className="text-lg font-semibold">
              Shop Status
            </Label>
            <p className="text-sm text-muted-foreground">
              {isShopOpen ? 'Shop is currently accepting orders' : 'Shop is currently closed for orders'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isShopOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className={`font-semibold ${isShopOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isShopOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <Switch
              id="shop-status"
              checked={isShopOpen}
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
