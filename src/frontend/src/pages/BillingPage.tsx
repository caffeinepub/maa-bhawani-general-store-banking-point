import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminGuard from '../components/AdminGuard';
import BillTemplate from '../components/BillTemplate';
import BarcodeScanner from '../components/BarcodeScanner';
import { useGetAllProducts, useGenerateBill } from '../hooks/useQueries';
import { Camera, Keyboard, Plus, Minus, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import type { BillItem, Product } from '../backend';

interface BillLineItem {
  product: Product;
  quantity: number;
}

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

export default function BillingPage() {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [billItems, setBillItems] = useState<BillLineItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [generatedBill, setGeneratedBill] = useState<any>(null);
  const [showNotFoundDialog, setShowNotFoundDialog] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const { data: products = [] } = useGetAllProducts();
  const generateBill = useGenerateBill();

  const handleStartCamera = () => {
    setScanMode('camera');
    setIsScannerOpen(true);
  };

  const handleStopCamera = () => {
    setIsScannerOpen(false);
    setScanMode('manual');
  };

  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    
    if (!product) {
      setNotFoundBarcode(barcode);
      setShowNotFoundDialog(true);
      toast.error('Product not found');
      return;
    }

    addProductToBill(product);
  };

  const handleManualBarcodeSubmit = () => {
    if (!manualBarcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }

    const product = products.find(p => p.barcode === manualBarcode.trim());
    if (!product) {
      setNotFoundBarcode(manualBarcode.trim());
      setShowNotFoundDialog(true);
      setManualBarcode('');
      return;
    }

    addProductToBill(product);
    setManualBarcode('');
  };

  const addProductToBill = (product: Product) => {
    const existingItem = billItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Auto-increment quantity for duplicate scans
      setBillItems(billItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success(`Increased ${product.name} quantity to ${existingItem.quantity + 1}`);
    } else {
      setBillItems([...billItems, { product, quantity: 1 }]);
      toast.success(`Added ${product.name} to bill`);
    }
  };

  const updateQuantity = (productId: bigint, delta: number) => {
    setBillItems(billItems.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (productId: bigint) => {
    setBillItems(billItems.filter(item => item.product.id !== productId));
    toast.success('Item removed from bill');
  };

  const calculateTotal = () => {
    return billItems.reduce((total, item) => {
      return total + Number(item.product.priceInRupees) * item.quantity;
    }, 0);
  };

  const handleGenerateBill = async () => {
    if (billItems.length === 0) {
      toast.error('Please add items to the bill');
      return;
    }

    const items: BillItem[] = billItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: BigInt(item.quantity),
      pricePerUnit: item.product.priceInRupees,
      totalPrice: BigInt(Number(item.product.priceInRupees) * item.quantity),
    }));

    const totalAmount = BigInt(calculateTotal());

    try {
      const bill = await generateBill.mutateAsync({
        customerName: customerName.trim() || null,
        customerPhone: customerPhone.trim() || null,
        items,
        totalAmount,
      });

      setGeneratedBill(bill);
      toast.success('Bill generated successfully!');
      
      // Clear the form
      setBillItems([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (error: any) {
      console.error('Error generating bill:', error);
      toast.error(error.message || 'Failed to generate bill');
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      window.print();
    }
  };

  const handleCloseBillPreview = () => {
    setGeneratedBill(null);
  };

  return (
    <AdminGuard>
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Billing</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Scanning & Input */}
          <div className="space-y-6">
            {/* Scan Mode Selection */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-xl">Scan Products</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-3">
                  <Button
                    onClick={handleStartCamera}
                    variant={scanMode === 'camera' ? 'default' : 'outline'}
                    className={`flex-1 gap-2 ${scanMode === 'camera' ? 'bg-primary hover:bg-primary/90 text-white' : 'hover:bg-primary/5 hover:text-primary hover:border-primary'}`}
                    disabled={isScannerOpen}
                  >
                    <Camera className="h-4 w-4" />
                    Camera Scan
                  </Button>
                  <Button
                    onClick={() => setScanMode('manual')}
                    variant={scanMode === 'manual' ? 'default' : 'outline'}
                    className={`flex-1 gap-2 ${scanMode === 'manual' ? 'bg-primary hover:bg-primary/90 text-white' : 'hover:bg-primary/5 hover:text-primary hover:border-primary'}`}
                  >
                    <Keyboard className="h-4 w-4" />
                    Manual Entry
                  </Button>
                </div>

                {scanMode === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="barcode" className="font-medium">Enter Barcode</Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleManualBarcodeSubmit();
                          }
                        }}
                        placeholder="Scan or type barcode"
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleManualBarcodeSubmit}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {scanMode === 'camera' && isScannerOpen && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Camera is active. Scan barcodes to add products.
                    </p>
                    <Button 
                      onClick={handleStopCamera} 
                      variant="destructive"
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Stop Camera
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-xl">Customer Details (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="font-medium">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="font-medium">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bill Items */}
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-xl">Bill Items ({billItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {billItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No items added yet. Scan products to add them to the bill.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Product</TableHead>
                            <TableHead className="text-center font-semibold">Qty</TableHead>
                            <TableHead className="text-right font-semibold">Price</TableHead>
                            <TableHead className="text-right font-semibold">Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billItems.map((item) => (
                            <TableRow key={Number(item.product.id)} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{item.product.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.product.id, -1)}
                                    disabled={item.quantity <= 1}
                                    className="h-8 w-8 p-0 hover:bg-primary/5 hover:border-primary"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="min-w-[60px] text-center text-sm">
                                    {formatQuantityWithUnit(item.quantity, item.product.unitType)}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.product.id, 1)}
                                    className="h-8 w-8 p-0 hover:bg-primary/5 hover:border-primary"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">₹{Number(item.product.priceInRupees)}</TableCell>
                              <TableCell className="text-right font-semibold text-primary">
                                ₹{Number(item.product.priceInRupees) * item.quantity}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItem(item.product.id)}
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold mb-4">
                        <span>Total:</span>
                        <span className="text-primary">₹{calculateTotal()}</span>
                      </div>
                      <Button
                        onClick={handleGenerateBill}
                        className="w-full bg-primary hover:bg-primary/90 text-white min-h-[48px]"
                        size="lg"
                        disabled={generateBill.isPending}
                      >
                        {generateBill.isPending ? 'Generating...' : 'Generate Bill'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Barcode Scanner */}
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={handleStopCamera}
          isOpen={isScannerOpen}
        />

        {/* Product Not Found Dialog */}
        <Dialog open={showNotFoundDialog} onOpenChange={setShowNotFoundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Product Not Found</DialogTitle>
              <DialogDescription>
                No product found with barcode: <strong>{notFoundBarcode}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNotFoundDialog(false)}
                className="hover:bg-primary/5 hover:text-primary hover:border-primary"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bill Preview Dialog */}
        <Dialog open={!!generatedBill} onOpenChange={handleCloseBillPreview}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bill Generated</DialogTitle>
            </DialogHeader>
            <div ref={printRef}>
              {generatedBill && <BillTemplate bill={generatedBill} />}
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={handleCloseBillPreview}
                className="hover:bg-primary/5 hover:text-primary hover:border-primary"
              >
                Close
              </Button>
              <Button 
                onClick={handlePrint} 
                className="gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                <Printer className="h-4 w-4" />
                Print Bill
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}
