import React from 'react';
import { useShopStatus } from '../hooks/useQueries';
import { AlertTriangle } from 'lucide-react';

export default function ShopClosedBanner() {
  const shopStatusQuery = useShopStatus();

  // Only show when we have confirmed data and shop is closed
  if (!shopStatusQuery.isFetched || shopStatusQuery.data !== false) {
    return null;
  }

  return (
    <div className="w-full bg-red-600 text-white py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium shadow-md">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>
        🔴 Shop is currently <strong>CLOSED</strong>. We will reopen soon. Thank you for your patience!
      </span>
    </div>
  );
}
