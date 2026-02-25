import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DeliveryFeeInfo() {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>Delivery Policy:</strong> Free delivery within 1km. Delivery charges of ₹20 per km apply for distances beyond 1km.
      </AlertDescription>
    </Alert>
  );
}
