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
      setBillItems(billItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success(`Increased ${product.name} quantity`);
    } else {
      setBillItems([...billItems, { product, quantity: 1 }]);
      toast.success(`Added ${product.name} to bill`);
    }
  };

  const updateQuantity = (productId: bigint, delta: number) => {
    setBillItems(billItems.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (productId: bigint) => {
    setBillItems(billItems.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return billItems.reduce((sum, item) => sum + Number(item.product.priceInRupees) * item.quantity, 0);
  };

  const handleGenerateBill = async () => {
    if (billItems.length === 0) {
      toast.error('Please add at least one item to the bill');
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
      
      // Close scanner if open
      if (isScannerOpen) {
        setIsScannerOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate bill');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewBill = () => {
    setGeneratedBill(null);
    setBillItems([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  if (generatedBill) {
    return (
      <AdminGuard>
        <div className="space-y-6">
          <div className="flex justify-between items-center no-print">
            <h1 className="text-3xl font-bold">Bill Generated</h1>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Bill
              </Button>
              <Button onClick={handleNewBill} variant="outline">
                New Bill
              </Button>
            </div>
          </div>

          <div ref={printRef}>
            <BillTemplate bill={generatedBill} />
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Generate Bill</h1>
          <p className="text-muted-foreground">Scan product barcodes to create professional bills</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={scanMode === 'camera' ? handleStopCamera : handleStartCamera}
                    variant={scanMode === 'camera' ? 'default' : 'outline'}
                    className="gap-2 flex-1"
                  >
                    <Camera className="h-4 w-4" />
                    {scanMode === 'camera' ? 'Stop Scanner' : 'Barcode Scanner'}
                  </Button>
                  <Button
                    onClick={() => {
                      if (scanMode === 'camera') handleStopCamera();
                      setScanMode('manual');
                    }}
                    variant={scanMode === 'manual' ? 'default' : 'outline'}
                    className="gap-2 flex-1"
                  >
                    <Keyboard className="h-4 w-4" />
                    Manual Entry
                  </Button>
                </div>

                {scanMode === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Enter Barcode</Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        placeholder="Scan or type barcode"
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleManualBarcodeSubmit();
                          }
                        }}
                        autoFocus
                      />
                      <Button onClick={handleManualBarcodeSubmit}>Add</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Details (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    placeholder="Enter phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bill Items</CardTitle>
            </CardHeader>
            <CardContent>
              {billItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No items added yet</p>
              ) : (
                <div className="space-y-4">
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
                        <TableRow key={Number(item.product.id)}>
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">₹{Number(item.product.priceInRupees)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{Number(item.product.priceInRupees) * item.quantity}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateBill}
                    disabled={generateBill.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {generateBill.isPending ? 'Generating...' : 'Generate Bill'}
                  </Button>
                </div>
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
              Would you like to add this product manually to the inventory?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowNotFoundDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowNotFoundDialog(false);
                  toast.info('Please add the product from the Products tab');
                }}
              >
                Add Manually
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}
