import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetCart, usePlaceOrder, useCalculateTotalPrice, useGetShopOpenStatus } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import DeliveryFeeInfo from '../components/DeliveryFeeInfo';
import ShopClosedCheckoutDialog from '../components/ShopClosedCheckoutDialog';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Banknote } from 'lucide-react';
import { PaymentMethod } from '../backend';

// Helper function to format quantity with unit type
function formatQuantityWithUnit(quantity: number, unitType: string): string {
  const isWeightBased = unitType === 'kg' || unitType === 'gram';
  
  if (isWeightBased) {
    if (unitType === 'kg') {
      if (quantity >= 1000) {
        return `${(quantity / 1000).toFixed(quantity % 1000 === 0 ? 0 : 2)} Kg`;
      }
      return `${quantity} g`;
    } else if (unitType === 'gram') {
      return `${quantity} Gram`;
    }
  }
  
  const unitDisplay = unitType.charAt(0).toUpperCase() + unitType.slice(1);
  return `${quantity} ${unitDisplay}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart = [] } = useGetCart();
  const { data: isShopOpen } = useGetShopOpenStatus();
  const placeOrder = usePlaceOrder();
  const calculateTotal = useCalculateTotalPrice();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');

  useEffect(() => {
    if (!identity) {
      toast.error('Please login to checkout');
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  useEffect(() => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate({ to: '/' });
    }
  }, [cart, navigate]);

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.product.priceInRupees) * Number(item.quantity),
    0
  );

  const handleDistanceChange = async (value: string) => {
    setDistance(value);
    const distanceNum = parseFloat(value);
    if (!isNaN(distanceNum) && distanceNum > 0) {
      try {
        const total = await calculateTotal.mutateAsync(BigInt(Math.ceil(distanceNum)));
        setTotalPrice(Number(total));
      } catch (error) {
        console.error('Failed to calculate total:', error);
      }
    } else {
      setTotalPrice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isShopOpen) {
      toast.error('Shop is currently closed. Cannot place order.');
      return;
    }

    if (!name.trim() || !phoneNumber.trim() || !address.trim() || !distance) {
      toast.error('Please fill all fields');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    const distanceNum = parseFloat(distance);
    if (isNaN(distanceNum) || distanceNum <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }

    try {
      const paymentMethodEnum: PaymentMethod = paymentMethod === 'upi' 
        ? PaymentMethod.upi 
        : PaymentMethod.cod;

      const orderId = await placeOrder.mutateAsync({
        customerName: name,
        deliveryAddress: address,
        phoneNumber,
        distanceInKm: BigInt(Math.ceil(distanceNum)),
        paymentMethod: paymentMethodEnum,
      });
      
      // Store order details for confirmation page
      if (totalPrice) {
        sessionStorage.setItem('lastOrderTotal', totalPrice.toString());
        sessionStorage.setItem('lastOrderPaymentMethod', paymentMethod);
      }
      
      toast.success('Order placed successfully!');
      navigate({ to: `/order-confirmation/${orderId}` });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  const deliveryFee = totalPrice !== null ? totalPrice - subtotal : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Shop Closed Dialog */}
      <ShopClosedCheckoutDialog />

      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Button>

      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={!isShopOpen}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    disabled={!isShopOpen}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter complete address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    disabled={!isShopOpen}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance">Distance from Store (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g., 1.5"
                    value={distance}
                    onChange={(e) => handleDistanceChange(e.target.value)}
                    required
                    disabled={!isShopOpen}
                  />
                </div>

                <DeliveryFeeInfo />

                <Separator />

                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(value) => setPaymentMethod(value as 'upi' | 'cod')}
                    disabled={!isShopOpen}
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent" onClick={() => isShopOpen && setPaymentMethod('upi')}>
                      <RadioGroupItem value="upi" id="upi" disabled={!isShopOpen} />
                      <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">UPI Payment</p>
                          <p className="text-sm text-muted-foreground">Pay online via UPI</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent" onClick={() => isShopOpen && setPaymentMethod('cod')}>
                      <RadioGroupItem value="cod" id="cod" disabled={!isShopOpen} />
                      <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Cash on Delivery (COD)</p>
                          <p className="text-sm text-muted-foreground">Pay with cash when delivered</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={placeOrder.isPending || !totalPrice || !isShopOpen}
                >
                  {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={Number(item.product.id)} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} x {formatQuantityWithUnit(Number(item.quantity), item.product.unitType)}
                    </span>
                    <span>₹{Number(item.product.priceInRupees) * Number(item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{totalPrice !== null ? totalPrice : subtotal}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
