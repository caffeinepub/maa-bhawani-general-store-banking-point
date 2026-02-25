import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useGetShopOpenStatus } from '../hooks/useQueries';

export default function ShopClosedBanner() {
  const { data: isShopOpen, isLoading, isFetched } = useGetShopOpenStatus();

  // Only show banner when:
  // 1. Data has been successfully fetched (isFetched is true)
  // 2. Not currently loading
  // 3. Shop is confirmed closed (isShopOpen is false)
  if (!isFetched || isLoading || isShopOpen !== false) {
    return null;
  }

  return (
    <Alert className="bg-orange-50 border-orange-200 mb-6">
      <AlertCircle className="h-5 w-5 text-orange-600" />
      <AlertDescription className="text-orange-900 font-medium ml-2">
        <span className="font-semibold">Namaste!</span> MBG Store is currently <span className="font-semibold">Closed</span>. 
        We are not accepting orders right now. We will open again at <span className="font-semibold">6:30 AM - 7:00 AM</span>. 
        Thank you for your patience!
      </AlertDescription>
    </Alert>
  );
}
