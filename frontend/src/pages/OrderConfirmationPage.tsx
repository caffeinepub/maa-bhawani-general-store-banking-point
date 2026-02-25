import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Banknote } from 'lucide-react';
import PaymentQRCode from '../components/PaymentQRCode';
import { useGetCart } from '../hooks/useQueries';
import { useEffect, useState } from 'react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const navigate = useNavigate();
  const { data: cart = [] } = useGetCart();
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');

  useEffect(() => {
    // Retrieve order details from session storage
    const storedTotal = sessionStorage.getItem('lastOrderTotal');
    const storedPaymentMethod = sessionStorage.getItem('lastOrderPaymentMethod');
    
    if (storedTotal) {
      setOrderTotal(parseInt(storedTotal));
      sessionStorage.removeItem('lastOrderTotal');
    }
    
    if (storedPaymentMethod) {
      setPaymentMethod(storedPaymentMethod as 'upi' | 'cod');
      sessionStorage.removeItem('lastOrderPaymentMethod');
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
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">
              Payment Method: <span className="font-bold">{paymentMethod === 'upi' ? 'UPI Payment' : 'Cash on Delivery'}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {paymentMethod === 'upi' ? (
        <>
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
        </>
      ) : (
        <Alert className="border-2 border-primary/20">
          <Banknote className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg font-semibold">Payment on Delivery</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <p>Please keep exact cash ready for payment.</p>
            <p className="font-semibold text-foreground">Amount to Pay: ₹{orderTotal || 500}</p>
            <p className="text-sm">Payment will be collected when your order is delivered to your doorstep.</p>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Order Status Updates:</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Order Confirmed - We've received your order</p>
            <p>• Packed - Your order is being prepared</p>
            <p>• Out for Delivery - Your order is on the way</p>
            <p>• Delivered - Enjoy your groceries!</p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            For any queries, call us at <a href="tel:9142876085" className="font-semibold text-primary hover:underline">9142876085</a>
          </p>
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
