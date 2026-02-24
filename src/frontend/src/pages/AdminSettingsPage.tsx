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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate({ to: '/admin' })}
            className="hover:bg-primary/5 hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Customize your store settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shop Slogan Form */}
          <Card className="shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-xl">Shop Slogan</CardTitle>
              <CardDescription>Customize the slogan that appears on bills</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slogan" className="font-medium">Slogan</Label>
                <Input
                  id="slogan"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Enter shop slogan"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={setShopSlogan.isPending}
                className="bg-primary hover:bg-primary/90 text-white min-h-[44px]"
              >
                {setShopSlogan.isPending ? 'Saving...' : 'Save Slogan'}
              </Button>
            </CardContent>
          </Card>

          {/* Bill Preview */}
          <Card className="shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-xl">Bill Preview</CardTitle>
              <CardDescription>Preview how your bill will look</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <BillTemplate bill={mockBill} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Store Information */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-xl">Store Information</CardTitle>
            <CardDescription>Your store details</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Store Name</h3>
                <p className="text-muted-foreground">Maa Bhawani General Store & Banking Point</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground">
                  Bardiha Turki - Tarvadih (Patepur-Vaishali 843110), Bihar
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-muted-foreground">9142876085</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}
