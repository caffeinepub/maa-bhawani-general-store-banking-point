import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AdminGuard from '../components/AdminGuard';
import BillTemplate from '../components/BillTemplate';
import { useGetShopSlogan, useSetShopSlogan } from '../hooks/useQueries';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { PaymentStatus } from '../backend';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { data: currentSlogan = 'Welcome to our shop!' } = useGetShopSlogan();
  const setShopSlogan = useSetShopSlogan();
  const [slogan, setSlogan] = useState('');

  useEffect(() => {
    setSlogan(currentSlogan);
  }, [currentSlogan]);

  const handleSave = async () => {
    if (!slogan.trim()) {
      toast.error('Slogan cannot be empty');
      return;
    }

    try {
      await setShopSlogan.mutateAsync(slogan.trim());
      toast.success('Shop slogan updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update slogan');
    }
  };

  const mockBill = {
    id: BigInt(0),
    billNumber: '0001',
    timestamp: BigInt(Date.now() * 1000000),
    customerName: 'Sample Customer',
    customerPhone: '9876543210',
    items: [
      {
        productId: BigInt(1),
        productName: 'Sample Product 1',
        quantity: BigInt(2),
        pricePerUnit: BigInt(50),
        totalPrice: BigInt(100),
      },
      {
        productId: BigInt(2),
        productName: 'Sample Product 2',
        quantity: BigInt(1),
        pricePerUnit: BigInt(150),
        totalPrice: BigInt(150),
      },
    ],
    totalAmount: BigInt(250),
    generatedByAdmin: { toText: () => 'admin' } as any,
    paymentStatus: PaymentStatus.pending,
    paymentReference: undefined,
    paymentGatewayId: undefined,
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your shop details and billing preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shop Slogan</CardTitle>
                <CardDescription>
                  This slogan will appear on all generated bills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    placeholder="Enter your shop slogan"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {slogan.length}/100 characters
                  </p>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={setShopSlogan.isPending || slogan === currentSlogan}
                >
                  {setShopSlogan.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>
                  These details are fixed and appear on all bills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">Shop Name:</p>
                  <p className="text-muted-foreground">Maa Bhawani General Store & Banking Point</p>
                </div>
                <Separator />
                <div>
                  <p className="font-semibold">Address:</p>
                  <p className="text-muted-foreground">
                    Bardiha Turki - Tarvadih<br />
                    (Patepur-Vaishali 843110), Bihar
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-semibold">Phone:</p>
                  <p className="text-muted-foreground">9142876085</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bill Preview</CardTitle>
              <CardDescription>
                Preview how your slogan will appear on bills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <BillTemplate bill={mockBill} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
