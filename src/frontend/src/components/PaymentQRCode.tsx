import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PaymentQRCodeProps {
  amount: number;
}

export default function PaymentQRCode({ amount }: PaymentQRCodeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
          <p className="text-3xl font-bold text-primary">₹{amount}</p>
        </div>

        <Separator />

        <div className="flex justify-center">
          <img
            src="/assets/generated/payment-qr.dim_300x300.png"
            alt="Payment QR Code"
            className="w-64 h-64 border-4 border-border rounded-lg"
          />
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Payment Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
            <li>Scan the QR code above</li>
            <li>Enter the amount: ₹{amount}</li>
            <li>Complete the payment</li>
            <li>Contact us at 9142876085 after payment</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
