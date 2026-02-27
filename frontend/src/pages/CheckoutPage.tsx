import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PaymentMethod } from '../backend';
import { useGetCart, usePlaceOrder, useGetShopOpenStatus } from '../hooks/useQueries';
import ShopClosedCheckoutDialog from '../components/ShopClosedCheckoutDialog';

const DELIVERY_CHARGE = 5;
const FREE_DELIVERY_THRESHOLD = 51;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartItems = [] } = useGetCart();
  const { data: shopStatus } = useGetShopOpenStatus();
  const placeOrderMutation = usePlaceOrder();

  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('cod');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showShopClosedDialog, setShowShopClosedDialog] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.priceInRupees) * Number(item.quantity),
    0
  );
  const deliveryCharge = subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_CHARGE : 0;
  const total = subtotal + deliveryCharge;
  const amountNeededForFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal;

  useEffect(() => {
    if (shopStatus === false) {
      setShowShopClosedDialog(true);
    }
  }, [shopStatus]);

  const requestGPS = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      setGpsStatus('requesting');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const c = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCoords(c);
          setGpsStatus('granted');
          resolve(c);
        },
        () => {
          setGpsStatus('denied');
          resolve(null);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !deliveryAddress.trim() || !phoneNumber.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (phoneNumber.replace(/\D/g, '').length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Request GPS coordinates (non-blocking — order proceeds regardless)
    const gpsCoords = await requestGPS();

    try {
      const orderId = await placeOrderMutation.mutateAsync({
        customerName: customerName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        phoneNumber: phoneNumber.trim(),
        distanceInKm: BigInt(1),
        paymentMethod: paymentMethod === 'upi' ? PaymentMethod.upi : PaymentMethod.cod,
        latitude: gpsCoords?.lat ?? null,
        longitude: gpsCoords?.lng ?? null,
      });

      toast.success('Order placed successfully!');
      navigate({ to: `/order-confirmation/${orderId}` });
    } catch (error: any) {
      if (error?.message?.includes('closed')) {
        setShowShopClosedDialog(true);
      } else {
        toast.error(error?.message || 'Failed to place order. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <ShopClosedCheckoutDialog
        open={showShopClosedDialog}
        onClose={() => setShowShopClosedDialog(false)}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground text-sm mt-1">Complete your order details below</p>
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.map((item) => (
              <div key={Number(item.product.id)} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.product.name} × {Number(item.quantity)}
                </span>
                <span className="font-medium">
                  ₹{Number(item.product.priceInRupees) * Number(item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                {deliveryCharge > 0 ? (
                  <span className="text-orange-600 font-medium">₹{deliveryCharge}</span>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">FREE</Badge>
                )}
              </div>
              {deliveryCharge > 0 && amountNeededForFreeDelivery > 0 && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Add ₹{amountNeededForFreeDelivery} more for FREE delivery!
                </p>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span>
                <span className="text-primary">₹{total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address *</Label>
                <Input
                  id="address"
                  placeholder="House no., Street, Area, Landmark"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>

              {/* GPS Status */}
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-sm">
                  {gpsStatus === 'idle' && (
                    <>
                      <Navigation className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">GPS location will be captured on order placement for faster delivery</span>
                    </>
                  )}
                  {gpsStatus === 'requesting' && (
                    <>
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-primary text-xs">Requesting your location...</span>
                    </>
                  )}
                  {gpsStatus === 'granted' && coords && (
                    <>
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium text-xs">Location captured ✓</span>
                    </>
                  )}
                  {gpsStatus === 'denied' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-600 text-xs">Location access denied — order will proceed without GPS</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as 'upi' | 'cod')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 cursor-pointer">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="cursor-pointer flex-1">
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 cursor-pointer">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="cursor-pointer flex-1">
                    <span className="font-medium">UPI Payment</span>
                    <p className="text-xs text-muted-foreground">Pay via GPay, PhonePe, Paytm</p>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={placeOrderMutation.isPending || gpsStatus === 'requesting'}
          >
            {placeOrderMutation.isPending || gpsStatus === 'requesting' ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {gpsStatus === 'requesting' ? 'Getting location...' : 'Placing Order...'}
              </span>
            ) : (
              `Place Order · ₹${total}`
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
