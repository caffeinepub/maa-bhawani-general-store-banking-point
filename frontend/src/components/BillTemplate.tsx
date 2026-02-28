import React from 'react';
import { Printer, MessageCircle, Store, Phone, MapPin, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bill, BillItem } from '../backend';
import { useGetUpiId } from '../hooks/useQueries';

interface BillTemplateProps {
  bill: Bill;
  onClose?: () => void;
  onPrint?: () => void;
}

const STORE_NAME = 'Maa Bhawani General Store';
const STORE_ADDRESS = 'Main Market, Your City';
const STORE_PHONE = '+91 9708075648';
const DELIVERY_CHARGE = 5;
const FREE_DELIVERY_THRESHOLD = 51;
// Default/fallback UPI ID — NEVER remove this constant
const DEFAULT_UPI_ID = '9708075648-1@okbizaxis';

function generateUPIQR(upiId: string, amount: number): string {
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${amount.toFixed(2)}&cu=INR&tn=Bill+Payment`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiString)}`;
}

export default function BillTemplate({ bill, onClose, onPrint }: BillTemplateProps) {
  // Fetch UPI ID from backend via React Query; fallback to default if empty/unavailable
  const { data: fetchedUpiId, isLoading: upiLoading } = useGetUpiId();
  const upiId = (fetchedUpiId && fetchedUpiId.trim() !== '') ? fetchedUpiId : DEFAULT_UPI_ID;

  const subtotal = bill.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
  const deliveryCharge = subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_CHARGE : 0;
  const total = subtotal + deliveryCharge;

  const billDate = new Date(Number(bill.timestamp) / 1_000_000);
  const formattedDate = billDate.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const formattedTime = billDate.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const handleWhatsApp = () => {
    const lines: string[] = [];
    lines.push(`🛒 *${STORE_NAME}*`);
    lines.push(`📞 ${STORE_PHONE}`);
    lines.push(`📅 ${formattedDate} ${formattedTime}`);
    lines.push(`🧾 Bill No: #${bill.billNumber}`);
    lines.push('');
    lines.push('*Order Summary:*');
    lines.push('─────────────────────');
    bill.items.forEach((item) => {
      lines.push(`• ${item.productName}`);
      lines.push(`  Qty: ${Number(item.quantity)} × ₹${Number(item.pricePerUnit)} = ₹${Number(item.totalPrice)}`);
    });
    lines.push('─────────────────────');
    lines.push(`Subtotal: ₹${subtotal}`);
    if (deliveryCharge > 0) {
      lines.push(`Delivery: ₹${deliveryCharge}`);
    } else {
      lines.push(`Delivery: FREE 🎉`);
    }
    lines.push(`*Total: ₹${total}*`);
    if (bill.customerName) {
      lines.push('');
      lines.push(`Customer: ${bill.customerName}`);
    }
    if (bill.customerPhone) lines.push(`Phone: ${bill.customerPhone}`);
    lines.push('');
    lines.push('Thank you for shopping with us! 🙏');

    const message = lines.join('\n');
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="bill-print-area font-sans">
      {/* Action Buttons - hidden on print */}
      <div className="no-print flex gap-2 mb-4 justify-end flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Printer className="w-4 h-4" />
          Print Bill
        </Button>
        <Button
          size="sm"
          onClick={handleWhatsApp}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
        >
          <MessageCircle className="w-4 h-4" />
          Send Bill to WhatsApp
        </Button>
        {onClose && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            ✕ Close
          </Button>
        )}
      </div>

      {/* Bill Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Store className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-wide">{STORE_NAME}</h1>
          </div>
          <p className="text-sm opacity-90 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" /> {STORE_ADDRESS}
          </p>
          <p className="text-sm opacity-90 flex items-center justify-center gap-1 mt-1">
            <Phone className="w-3 h-3" /> {STORE_PHONE}
          </p>
        </div>

        {/* Bill Meta */}
        <div className="bg-gray-50 px-6 py-3 flex flex-wrap justify-between items-center gap-2 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="w-4 h-4 text-primary" />
            <span className="font-semibold text-gray-800">Bill #{bill.billNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formattedDate} · {formattedTime}</span>
          </div>
        </div>

        {/* Customer Info */}
        {(bill.customerName || bill.customerPhone) && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Customer</p>
            <div className="flex flex-wrap gap-4">
              {bill.customerName && (
                <span className="text-sm font-medium text-gray-800">{bill.customerName}</span>
              )}
              {bill.customerPhone && (
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {bill.customerPhone}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 text-gray-600 font-semibold">#</th>
                <th className="text-left py-2 text-gray-600 font-semibold">Item</th>
                <th className="text-center py-2 text-gray-600 font-semibold">Qty</th>
                <th className="text-right py-2 text-gray-600 font-semibold">Rate</th>
                <th className="text-right py-2 text-gray-600 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item: BillItem, index: number) => (
                <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="py-2.5 text-gray-400 text-xs">{index + 1}</td>
                  <td className="py-2.5 font-medium text-gray-800">{item.productName}</td>
                  <td className="py-2.5 text-center text-gray-600">{Number(item.quantity)}</td>
                  <td className="py-2.5 text-right text-gray-600">₹{Number(item.pricePerUnit)}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-800">₹{Number(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-6 pb-4">
          <div className="ml-auto max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Charge</span>
              {deliveryCharge > 0 ? (
                <span className="text-orange-600 font-medium">₹{deliveryCharge}</span>
              ) : (
                <span className="text-green-600 font-semibold">FREE</span>
              )}
            </div>
            {deliveryCharge === 0 && (
              <p className="text-xs text-green-600 text-right">🎉 Free delivery on orders ₹51+</p>
            )}
            <Separator />
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total Amount</span>
              <span className="text-primary text-lg">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* QR Code — always shown using live UPI ID or fallback */}
            <div className="flex flex-col items-center gap-2">
              {upiLoading ? (
                <div className="w-36 h-36 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                  <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <img
                    src={generateUPIQR(upiId, total)}
                    alt="UPI QR Code"
                    className="w-36 h-36 border-2 border-primary/20 rounded-lg p-1 bg-white"
                  />
                  <p className="text-xs text-gray-500 text-center">Scan to pay ₹{total}</p>
                  <p className="text-xs font-medium text-primary">{upiId}</p>
                </>
              )}
            </div>

            {/* Payment Instructions */}
            <div className="flex-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-800 mb-2">Payment Instructions</p>
              <ol className="space-y-1 list-decimal list-inside text-xs">
                <li>Open any UPI app (GPay, PhonePe, Paytm)</li>
                <li>Scan the QR code on the left</li>
                <li>Verify amount: <strong>₹{total}</strong></li>
                <li>Complete the payment</li>
                <li>Share screenshot for confirmation</li>
              </ol>
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                💡 Also accepts Cash on Delivery
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-primary/5 border-t border-primary/10 px-6 py-3 text-center">
          <p className="text-xs text-gray-500">Thank you for shopping at <strong>{STORE_NAME}</strong>!</p>
          <p className="text-xs text-gray-400 mt-0.5">This is a computer-generated bill. No signature required.</p>
        </div>
      </div>
    </div>
  );
}
