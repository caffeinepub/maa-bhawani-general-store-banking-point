import { useQueryClient } from '@tanstack/react-query';
import { useGetShopStatus, useSetShopStatus } from '../hooks/useQueries';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

export default function ShopStatusToggle() {
  const queryClient = useQueryClient();
  const { data: isOpen, isLoading: statusLoading } = useGetShopStatus();
  const setShopStatus = useSetShopStatus();

  const handleToggle = async (newValue: boolean) => {
    // Optimistic update — immediately reflect in UI
    queryClient.setQueryData(['shopStatus'], newValue);

    try {
      await setShopStatus.mutateAsync(newValue);
    } catch (err) {
      // Revert on error
      queryClient.setQueryData(['shopStatus'], !newValue);
      console.error('Failed to update shop status:', err);
    }
  };

  if (statusLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading status…</span>
      </div>
    );
  }

  const open = isOpen ?? true;

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={open}
        onCheckedChange={handleToggle}
        disabled={setShopStatus.isPending}
        className={open ? 'data-[state=checked]:bg-emerald-500' : 'data-[state=unchecked]:bg-red-500'}
      />
      <div className="flex flex-col">
        <span className={`text-sm font-bold ${open ? 'text-emerald-400' : 'text-red-400'}`}>
          {setShopStatus.isPending ? (
            <span className="flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              Updating…
            </span>
          ) : open ? (
            '🟢 Store is OPEN'
          ) : (
            '🔴 Store is CLOSED'
          )}
        </span>
        <span className="text-xs text-slate-400">
          {open ? 'Customers can place orders' : 'Orders are disabled'}
        </span>
      </div>
    </div>
  );
}
