import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card className="border-2 border-blue-100">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-500">
            Your order has been received and is being processed.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="text-2xl font-bold">#{orderId}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-sm font-medium">
              Payment Method:{' '}
              <span className="font-bold">
                {paymentMethod === 'upi' ? 'UPI Payment' : 'Cash on Delivery'}
              </span>
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
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-500">
                <li>Complete the payment using the QR code above</li>
                <li>Call us at 9142876085 to confirm your payment</li>
                <li>We'll prepare and deliver your order</li>
                <li>Enjoy your groceries!</li>
              </ol>
            </CardContent>
          </Card>
        </>
      ) : (
        <Alert className="border-2 border-blue-100">
          <Banknote className="h-5 w-5 text-[#0056b3]" />
          <AlertTitle className="text-lg font-semibold">Payment on Delivery</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <p>Please keep exact cash ready for payment.</p>
            <p className="font-semibold text-gray-800">Amount to Pay: ₹{orderTotal || 500}</p>
            <p className="text-sm">
              Payment will be collected when your order is delivered to your doorstep.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Order Status Updates:</h3>
          <div className="space-y-2 text-sm text-gray-500">
            <p>✓ Order Confirmed - We've received your order</p>
            <p>• Packed - Your order is being prepared</p>
            <p>• Out for Delivery - Your order is on the way</p>
            <p>• Delivered - Enjoy your groceries!</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            For any queries, call us at{' '}
            <a href="tel:9142876085" className="font-semibold text-[#0056b3] hover:underline">
              9142876085
            </a>
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex-1 py-3 rounded-xl bg-[#0056b3] text-white font-bold hover:bg-[#004494] transition-colors"
        >
          Continue Shopping
        </button>
        <a
          href="tel:9142876085"
          className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold text-center hover:bg-gray-50 transition-colors"
        >
          Call Store
        </a>
      </div>
    </div>
  );
}
