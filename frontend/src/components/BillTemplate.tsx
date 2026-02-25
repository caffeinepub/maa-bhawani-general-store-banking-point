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
    <div className="bill-template bg-white text-black p-4 max-w-[80mm] mx-auto font-mono text-xs">
      {/* Header */}
      <div className="text-center mb-3 pb-3 border-b-2 border-black">
        <h1 className="text-lg font-extrabold tracking-tight leading-tight uppercase">
          Maa Bhawani General Store
        </h1>
        <p className="text-[10px] mt-1 leading-snug text-gray-700">
          Bardiha Turki - Tarvadih<br />
          (Patepur-Vaishali 843110), Bihar
        </p>
        {slogan && slogan !== 'Welcome to our shop!' && (
          <p className="text-[10px] mt-1 italic text-gray-500">{slogan}</p>
        )}
      </div>

      {/* Bill Info */}
      <div className="mb-3 text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span className="text-gray-600">Bill No:</span>
          <span className="font-bold">#{bill.billNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span>{formatDate(bill.timestamp)}</span>
        </div>
        {bill.customerName && (
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{bill.customerName}</span>
          </div>
        )}
        {bill.customerPhone && (
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span>{bill.customerPhone}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="mb-3">
        <table className="w-full text-[11px] border-collapse border border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-1 py-1 text-left font-bold">Item</th>
              <th className="border border-black px-1 py-1 text-center font-bold w-8">Qty</th>
              <th className="border border-black px-1 py-1 text-right font-bold w-14">Rate</th>
              <th className="border border-black px-1 py-1 text-right font-bold w-14">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-black px-1 py-1 leading-tight">{item.productName}</td>
                <td className="border border-black px-1 py-1 text-center">{Number(item.quantity)}</td>
                <td className="border border-black px-1 py-1 text-right">₹{Number(item.pricePerUnit)}</td>
                <td className="border border-black px-1 py-1 text-right font-semibold">₹{Number(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Section */}
      <div className="mb-4">
        <table className="w-full text-[11px] border-collapse border border-black">
          <tbody>
            <tr className="bg-gray-200">
              <td className="border border-black px-2 py-1.5 font-bold text-sm uppercase tracking-wide">
                TOTAL AMOUNT
              </td>
              <td className="border border-black px-2 py-1.5 text-right font-bold text-sm">
                ₹{Number(bill.totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-center border-t-2 border-dashed border-black pt-3">
        <p className="text-[11px] font-semibold mb-3">🙏 Thank you for shopping with us!</p>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-1">
          <img
            src="/assets/generated/upi-qr-code.dim_200x200.png"
            alt="UPI / WhatsApp QR Code"
            className="w-24 h-24 object-contain mx-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <p className="text-[9px] text-gray-500 mt-1">Scan to Pay / Contact Us</p>
        </div>

        <p className="text-[9px] text-gray-400 mt-2">Visit again soon!</p>
      </div>
    </div>
  );
}
