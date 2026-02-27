import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePlaceRechargeOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Smartphone, ChevronRight, Loader2 } from 'lucide-react';

const OPERATORS = [
  { name: 'Airtel', color: 'bg-red-500', letter: 'A' },
  { name: 'Jio', color: 'bg-blue-600', letter: 'J' },
  { name: 'Vi', color: 'bg-purple-600', letter: 'V' },
  { name: 'BSNL', color: 'bg-green-600', letter: 'B' },
  { name: 'MTNL', color: 'bg-orange-500', letter: 'M' },
];

const OPERATOR_NAMES = ['Airtel', 'Jio', 'Vi (Vodafone Idea)', 'BSNL', 'MTNL'];

export default function MobileRechargeSection() {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place recharge order');
    }
  };

  return (
    <div className="mt-6 mb-2">
      {/* Compact Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-white" />
            <span className="text-white font-semibold text-sm">Mobile Recharge</span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-full transition-colors"
          >
            Recharge Now <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Operator Icons Row */}
        <div className="flex items-center gap-2">
          {OPERATORS.map((op) => (
            <button
              key={op.name}
              onClick={() => {
                setOperator(op.name === 'Vi' ? 'Vi (Vodafone Idea)' : op.name);
                setIsOpen(true);
              }}
              className="flex flex-col items-center gap-0.5 group"
            >
              <div className={`w-8 h-8 rounded-full ${op.color} flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                {op.letter}
              </div>
              <span className="text-white/80 text-[10px]">{op.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recharge Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Mobile Recharge
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
                  {OPERATOR_NAMES.map((op) => (
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

            <button
              type="submit"
              disabled={placeRecharge.isPending}
              className="w-full py-3 rounded-lg bg-[#0056b3] text-white font-bold text-sm hover:bg-[#004494] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {placeRecharge.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Place Recharge Order'
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
