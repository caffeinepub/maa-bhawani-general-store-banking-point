import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlaceRechargeOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Smartphone } from 'lucide-react';

const OPERATORS = ['Airtel', 'Jio', 'Vi (Vodafone Idea)', 'BSNL', 'MTNL'];

export default function MobileRechargeSection() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [amount, setAmount] = useState('');
  const placeRecharge = usePlaceRechargeOrder();
  const { identity } = useInternetIdentity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please login to place a recharge order');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!operator) {
      toast.error('Please select an operator');
      return;
    }

    const rechargeAmount = parseInt(amount);
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      toast.error('Please enter a valid recharge amount');
      return;
    }

    try {
      const orderId = await placeRecharge.mutateAsync({
        mobileNumber,
        operator,
        rechargeAmount: BigInt(rechargeAmount),
      });
      toast.success(`Recharge order placed! Order ID: ${orderId}`);
      setMobileNumber('');
      setOperator('');
      setAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place recharge order');
    }
  };

  return (
    <div className="my-12">
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img
          src="/assets/generated/recharge-banner.dim_800x300.png"
          alt="Mobile Recharge"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <Smartphone className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-3xl font-bold">Mobile Recharge</h2>
            <p className="text-lg">Quick & Easy Recharge Service</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recharge Your Mobile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="10-digit number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operator">Operator</Label>
                <Select value={operator} onValueChange={setOperator} required>
                  <SelectTrigger id="operator">
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op} value={op}>
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Recharge Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={placeRecharge.isPending}>
                  {placeRecharge.isPending ? 'Processing...' : 'Place Recharge Order'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
