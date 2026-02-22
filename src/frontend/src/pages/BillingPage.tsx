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
            <Card>
              <CardHeader>
                <CardTitle>Scan Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handleStartCamera}
                    variant={scanMode === 'camera' ? 'default' : 'outline'}
                    className="flex-1"
                    disabled={isScannerOpen}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Camera Scan
                  </Button>
                  <Button
                    onClick={() => setScanMode('manual')}
                    variant={scanMode === 'manual' ? 'default' : 'outline'}
                    className="flex-1"
                  >
                    <Keyboard className="h-4 w-4 mr-2" />
                    Manual Entry
                  </Button>
                </div>

                {scanMode === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Enter Barcode</Label>
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
                      <Button onClick={handleManualBarcodeSubmit}>Add</Button>
                    </div>
                  </div>
                )}

                {scanMode === 'camera' && isScannerOpen && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Camera is active. Scan barcodes to add products.
                    </p>
                    <Button onClick={handleStopCamera} variant="destructive">
                      Stop Camera
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bill Items */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Bill Items</CardTitle>
              </CardHeader>
              <CardContent>
                {billItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No items added yet. Scan or enter barcodes to add products.
                  </p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billItems.map((item) => (
                          <TableRow key={item.product.id.toString()}>
                            <TableCell className="font-medium">
                              {item.product.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.id, -1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.id, 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{Number(item.product.priceInRupees)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₹{Number(item.product.priceInRupees) * item.quantity}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeItem(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>₹{calculateTotal()}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateBill}
                      className="w-full mt-4"
                      size="lg"
                      disabled={generateBill.isPending}
                    >
                      {generateBill.isPending ? 'Generating...' : 'Generate Bill'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Barcode Scanner Modal */}
        <BarcodeScanner
          isOpen={isScannerOpen}
          onScan={handleBarcodeScanned}
          onClose={handleStopCamera}
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
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This product is not in the system. Please add it to the inventory first.
              </p>
              <Button onClick={() => setShowNotFoundDialog(false)} className="w-full">
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
              <DialogDescription>
                Bill #{generatedBill?.billNumber} has been created successfully.
              </DialogDescription>
            </DialogHeader>
            <div ref={printRef} className="print-area">
              {generatedBill && <BillTemplate bill={generatedBill} />}
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Bill
              </Button>
              <Button onClick={handleCloseBillPreview} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}
