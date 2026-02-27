import { useState } from 'react';
import { usePlaceOrder, useGetCart, useGetShopStatus } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { PaymentMethod } from '../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Truck, MapPin, Loader2 } from 'lucide-react';

const FREE_DELIVERY_THRESHOLD = 51;
const DELIVERY_FEE = 5;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartItems = [] } = useGetCart();
  const { data: isOpen } = useGetShopStatus();
  const placeOrder = usePlaceOrder();

  const [form, setForm] = useState({
    customerName: '',
    deliveryAddress: '',
    phoneNumber: '',
    paymentMethod: 'cod' as 'upi' | 'cod',
  });

  const isShopClosed = isOpen === false;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.priceInRupees) * Number(item.quantity),
    0
  );
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isShopClosed) return;

    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch {
      // GPS denied or unavailable — proceed without coordinates
    }

    const distanceInKm = 1n;

    try {
      const orderId = await placeOrder.mutateAsync({
        customerName: form.customerName,
        deliveryAddress: form.deliveryAddress,
        phoneNumber: form.phoneNumber,
        distanceInKm,
        paymentMethod: form.paymentMethod === 'upi' ? PaymentMethod.upi : PaymentMethod.cod,
        latitude,
        longitude,
      });
      navigate({ to: `/order-confirmation/${orderId}` });
    } catch (err) {
      console.error('Failed to place order:', err);
    }
  };

  if (isShopClosed) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Shop is Closed</h2>
        <p className="text-gray-500 mb-6">
          We're currently closed. Please come back during our opening hours: 6:30 AM – 10:00 PM
        </p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="px-6 py-2.5 bg-[#0056b3] text-white font-bold rounded-lg hover:bg-[#004494] transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Delivery Details</h2>
          <div className="space-y-1">
            <Label htmlFor="customerName">Full Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              type="tel"
              pattern="[0-9]{10}"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Input
              id="deliveryAddress"
              name="deliveryAddress"
              value={form.deliveryAddress}
              onChange={handleChange}
              placeholder="House no., Street, Area"
              required
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Payment Method</h2>
          <div className="flex gap-3">
            {(['cod', 'upi'] as const).map((method) => (
              <label
                key={method}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                  form.paymentMethod === method
                    ? 'border-[#0056b3] bg-blue-50 text-[#0056b3]'
                    : 'border-gray-200 text-gray-500 hover:border-[#0056b3]/50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={form.paymentMethod === method}
                  onChange={handleChange}
                  className="sr-only"
                />
                {method === 'cod' ? '💵 Cash on Delivery' : '📱 UPI Payment'}
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {cartItems.map((item, i) => (
              <div key={i} className="flex justify-between text-gray-500">
                <span>
                  {item.product.name} × {item.quantity.toString()}
                </span>
                <span>
                  ₹{(Number(item.product.priceInRupees) * Number(item.quantity)).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span className="flex items-center gap-1">
                <Truck size={13} />
                Delivery Fee
              </span>
              {deliveryFee === 0 ? (
                <span className="text-emerald-600 font-semibold">FREE</span>
              ) : (
                <span>₹{deliveryFee}</span>
              )}
            </div>
            {subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                Add ₹{FREE_DELIVERY_THRESHOLD - subtotal} more for FREE delivery!
              </p>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-[#0056b3]">₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* GPS note */}
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <MapPin size={12} />
          We'll request your location to calculate accurate delivery distance.
        </p>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#0056b3] text-white font-bold text-base hover:bg-[#004494] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={placeOrder.isPending || cartItems.length === 0}
        >
          {placeOrder.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Placing Order…
            </>
          ) : (
            `Place Order — ₹${total.toFixed(0)}`
          )}
        </button>

        {placeOrder.isError && (
          <p className="text-sm text-red-600 text-center">
            Failed to place order. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}
