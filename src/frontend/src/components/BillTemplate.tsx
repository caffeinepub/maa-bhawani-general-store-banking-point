import { useGetShopSlogan } from '../hooks/useQueries';
import type { Bill } from '../backend';

interface BillTemplateProps {
  bill: Bill;
}

export default function BillTemplate({ bill }: BillTemplateProps) {
  const { data: slogan = 'Welcome to our shop!' } = useGetShopSlogan();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bill-template bg-white text-black p-6 max-w-[80mm] mx-auto border border-gray-300 rounded-lg">
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-xl font-bold">Maa Bhawani General Store</h1>
        <h2 className="text-sm font-semibold">& Banking Point</h2>
        <p className="text-xs font-medium">
          Bardiha Turki - Tarvadih
          <br />
          (Patepur-Vaishali 843110), Bihar
        </p>
        <p className="text-xs font-semibold">Phone: 9142876085</p>
        <p className="text-xs italic border-t border-b border-gray-300 py-1 mt-2">{slogan}</p>
      </div>

      <div className="border-t border-b border-gray-300 py-2 mb-3 text-xs">
        <div className="flex justify-between">
          <span>Bill No: <strong>BILL-{bill.billNumber}</strong></span>
        </div>
        <div className="flex justify-between">
          <span>Date: {formatDate(bill.timestamp)}</span>
        </div>
        {bill.customerName && (
          <div className="flex justify-between">
            <span>Customer: {bill.customerName}</span>
          </div>
        )}
        {bill.customerPhone && (
          <div className="flex justify-between">
            <span>Phone: {bill.customerPhone}</span>
          </div>
        )}
      </div>

      <table className="w-full text-xs mb-3">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-1">Item</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">Price</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-1">{item.productName}</td>
              <td className="text-center py-1">{Number(item.quantity)}</td>
              <td className="text-right py-1">₹{Number(item.pricePerUnit)}</td>
              <td className="text-right py-1">₹{Number(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t-2 border-gray-300 pt-2 mb-4">
        <div className="flex justify-between text-sm font-bold">
          <span>Grand Total:</span>
          <span>₹{Number(bill.totalAmount)}</span>
        </div>
      </div>

      <div className="text-center text-xs space-y-1 border-t border-gray-300 pt-3">
        <p className="font-semibold">Thank you for shopping with us!</p>
        <p>Visit us again</p>
      </div>
    </div>
  );
}
