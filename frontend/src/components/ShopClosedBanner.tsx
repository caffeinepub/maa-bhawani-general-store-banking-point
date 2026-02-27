import { useGetShopStatus } from '../hooks/useQueries';
import { AlertTriangle } from 'lucide-react';

export default function ShopClosedBanner() {
  const { data: isOpen, isFetched } = useGetShopStatus();

  // Only render when we have confirmed data and shop is closed
  if (!isFetched || isOpen !== false) return null;

  return (
    <div className="w-full bg-red-600 text-white px-4 py-3 flex items-center gap-3 rounded-lg shadow-md">
      <AlertTriangle size={20} className="shrink-0" />
      <div>
        <p className="font-bold text-sm">Shop is Currently Closed</p>
        <p className="text-xs text-red-100">
          We'll be back soon! Opening hours: 6:30 AM – 10:00 PM
        </p>
      </div>
    </div>
  );
}
