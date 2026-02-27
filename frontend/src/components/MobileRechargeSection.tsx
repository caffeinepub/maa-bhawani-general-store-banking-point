import React, { useState } from 'react';
import { usePlaceRechargeOrder, useShopStatus } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, Smartphone } from 'lucide-react';

const OPERATORS = ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL', 'MTNL'];

const DEFAULT_FORM = {
  mobileNumber: '',
  operator: '',
  rechargeAmount: '',
};

export default function MobileRechargeSection() {
  const shopStatusQuery = useShopStatus();
  const placeRechargeOrderMutation = usePlaceRechargeOrder();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<bigint | null>(null);

  const isShopClosed = shopStatusQuery.data === false;

  const handleChange = (field: keyof typeof DEFAULT_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
    if (placeRechargeOrderMutation.isError) placeRechargeOrderMutation.reset();
  };

  const handleOpenDialog = () => {
    setForm(DEFAULT_FORM);
    setFormError(null);
    setSuccessOrderId(null);
    placeRechargeOrderMutation.reset();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (placeRechargeOrderMutation.isPending) return;
    setDialogOpen(false);
    setForm(DEFAULT_FORM);
    setFormError(null);
    setSuccessOrderId(null);
    placeRechargeOrderMutation.reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!/^\d{10}$/.test(form.mobileNumber)) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!form.operator) {
      setFormError('Please select an operator.');
      return;
    }
    const amount = parseInt(form.rechargeAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid recharge amount.');
      return;
    }

    try {
      const orderId = await placeRechargeOrderMutation.mutateAsync({
        mobileNumber: form.mobileNumber,
        operator: form.operator,
        rechargeAmount: BigInt(amount),
      });
      setSuccessOrderId(orderId);
      setForm(DEFAULT_FORM);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit recharge order';
      setFormError(msg);
    }
  };

  return (
    <section className="py-8 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Smartphone className="h-6 w-6 text-[#0056b3]" />
          <h2 className="text-xl font-bold text-gray-800">Mobile Recharge</h2>
        </div>
        <p className="text-gray-600 mb-4 text-sm">
          Recharge your mobile instantly. All major operators supported.
        </p>
        <img
          src="/assets/generated/recharge-banner.dim_800x300.png"
          alt="Mobile Recharge"
          className="w-full max-w-md mx-auto rounded-xl mb-4 object-cover"
          style={{ maxHeight: 150 }}
        />
        <Button
          onClick={handleOpenDialog}
          disabled={isShopClosed}
          className="bg-[#0056b3] hover:bg-[#004494] text-white font-bold px-8 py-3 rounded-full text-base disabled:opacity-60"
        >
          {isShopClosed ? 'Shop Closed' : 'Place Recharge Order'}
        </Button>
        {isShopClosed && (
          <p className="text-red-500 text-xs mt-2">Recharge orders are unavailable while the shop is closed.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#0056b3]" />
              Mobile Recharge Order
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to place your recharge order.
            </DialogDescription>
          </DialogHeader>

          {successOrderId !== null ? (
            <div className="py-6 text-center space-y-3">
              <div className="text-5xl">✅</div>
              <p className="text-green-600 font-semibold text-lg">Recharge Order Placed!</p>
              <p className="text-gray-600 text-sm">Order ID: #{successOrderId.toString()}</p>
              <p className="text-gray-500 text-xs">We will process your recharge shortly.</p>
              <Button onClick={handleCloseDialog} className="bg-[#0056b3] text-white font-bold w-full">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {(formError || placeRechargeOrderMutation.isError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formError ?? (placeRechargeOrderMutation.error?.message ?? 'Failed to submit recharge order')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <Label htmlFor="mobile-number">Mobile Number *</Label>
                <Input
                  id="mobile-number"
                  type="tel"
                  value={form.mobileNumber}
                  onChange={(e) => handleChange('mobileNumber', e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  disabled={placeRechargeOrderMutation.isPending}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="operator">Operator *</Label>
                <Select
                  value={form.operator}
                  onValueChange={(v) => handleChange('operator', v)}
                  disabled={placeRechargeOrderMutation.isPending}
                >
                  <SelectTrigger id="operator">
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="recharge-amount">Recharge Amount (₹) *</Label>
                <Input
                  id="recharge-amount"
                  type="number"
                  value={form.rechargeAmount}
                  onChange={(e) => handleChange('rechargeAmount', e.target.value)}
                  placeholder="e.g. 199"
                  min="1"
                  disabled={placeRechargeOrderMutation.isPending}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={placeRechargeOrderMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={placeRechargeOrderMutation.isPending}
                  className="bg-[#0056b3] hover:bg-[#004494] text-white font-bold"
                >
                  {placeRechargeOrderMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Place Recharge Order'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
