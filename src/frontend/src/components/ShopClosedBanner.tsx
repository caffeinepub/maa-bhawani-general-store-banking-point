import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useGetShopOpenStatus } from '../hooks/useQueries';

export default function ShopClosedBanner() {
  const { data: isShopOpen, isLoading } = useGetShopOpenStatus();

  // Don't show banner while loading or if shop is open
  if (isLoading || isShopOpen) {
    return null;
  }

  return (
    <Alert className="bg-orange-50 border-orange-200 mb-6">
      <AlertCircle className="h-5 w-5 text-orange-600" />
      <AlertDescription className="text-orange-900 font-medium ml-2">
        <span className="font-semibold">Namaste!</span> MBG Store is currently <span className="font-semibold">Closed</span>. 
        We are not accepting orders right now. We will open again at <span className="font-semibold">8:00 AM</span>. 
        Thank you for your patience!
      </AlertDescription>
    </Alert>
  );
}
