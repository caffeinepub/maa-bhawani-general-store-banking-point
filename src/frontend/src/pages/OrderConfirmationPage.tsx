import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import PaymentQRCode from '../components/PaymentQRCode';
import { useGetCart } from '../hooks/useQueries';
import { useEffect, useState } from 'react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const navigate = useNavigate();
  const { data: cart = [] } = useGetCart();
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    // Since cart is cleared after order, we'll use a placeholder
    // In a real app, you'd fetch the order details from backend
    const storedTotal = sessionStorage.getItem('lastOrderTotal');
    if (storedTotal) {
      setOrderTotal(parseInt(storedTotal));
      sessionStorage.removeItem('lastOrderTotal');
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Your order has been received and is being processed.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="text-2xl font-bold">#{orderId}</p>
          </div>
        </CardContent>
      </Card>

      <PaymentQRCode amount={orderTotal || 500} />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Complete the payment using the QR code above</li>
            <li>Call us at 9142876085 to confirm your payment</li>
            <li>We'll prepare and deliver your order</li>
            <li>Enjoy your groceries!</li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => navigate({ to: '/' })} className="flex-1">
          Continue Shopping
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <a href="tel:9142876085">Call Store</a>
        </Button>
      </div>
    </div>
  );
}
