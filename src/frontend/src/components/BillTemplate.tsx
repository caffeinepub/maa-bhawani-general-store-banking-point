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
      hour12: true,
    });
  };

  return (
    <div className="bill-template bg-white text-black p-6 max-w-[80mm] mx-auto font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-4 border-b-2 border-dashed border-black pb-4">
        <h1 className="text-xl font-bold mb-1">GROCERY STORE</h1>
        <p className="text-xs leading-relaxed">
          Bardiha Turki - Tarvadih<br />
          (Patepur-Vaishali 843110), Bihar
        </p>
        <p className="text-xs mt-2 italic">{slogan}</p>
      </div>

      {/* Bill Info */}
      <div className="mb-4 text-xs space-y-1">
        <div className="flex justify-between">
          <span>Bill No:</span>
          <span className="font-bold">{bill.billNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDate(bill.timestamp)}</span>
        </div>
        {bill.customerName && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{bill.customerName}</span>
          </div>
        )}
        {bill.customerPhone && (
          <div className="flex justify-between">
            <span>Phone:</span>
            <span>{bill.customerPhone}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="border-t-2 border-b-2 border-dashed border-black py-2 mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">Item</th>
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Rate</th>
              <th className="text-right py-1">Amt</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="py-1 pr-2">{item.productName}</td>
                <td className="text-center py-1">{Number(item.quantity)}</td>
                <td className="text-right py-1">₹{Number(item.pricePerUnit)}</td>
                <td className="text-right py-1 font-semibold">₹{Number(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="mb-4">
        <div className="flex justify-between text-base font-bold">
          <span>TOTAL:</span>
          <span>₹{Number(bill.totalAmount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs border-t-2 border-dashed border-black pt-4">
        <p className="mb-2">Thank you for shopping with us!</p>
        <p className="text-[10px]">Visit again soon</p>
      </div>
    </div>
  );
}
