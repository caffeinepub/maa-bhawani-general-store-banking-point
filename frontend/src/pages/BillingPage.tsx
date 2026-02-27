import React, { useState, useRef } from 'react';
import { useGetAllProducts, useGenerateBill } from '../hooks/useQueries';
import { BillItem, Product, UnitType } from '../backend';
import BillTemplate from '../components/BillTemplate';
import BarcodeScanner from '../components/BarcodeScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Search,
  Barcode,
  Receipt,
  User,
  Phone,
  X,
  Loader2,
} from 'lucide-react';
import { Bill } from '../backend';

interface CartEntry {
  product: Product;
  quantity: number;
}

const unitLabel = (unitType: UnitType): string => {
  switch (unitType) {
    case UnitType.kg: return 'kg';
    case UnitType.gram: return 'g';
    case UnitType.piece: return 'pc';
    case UnitType.packet: return 'pkt';
    default: return '';
  }
};

const BillingPage: React.FC = () => {
  const { data: products = [], isLoading: productsLoading } = useGetAllProducts();
  const generateBillMutation = useGenerateBill();

  const [cart, setCart] = useState<CartEntry[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
  );

  const addToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((e) => e.product.id === product.id);
      if (existing) {
        return prev.map((e) =>
          e.product.id === product.id ? { ...e, quantity: e.quantity + qty } : e
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: bigint) => {
    setCart((prev) => prev.filter((e) => e.product.id !== productId));
  };

  const updateQuantity = (productId: bigint, delta: number) => {
    setCart((prev) =>
      prev
        .map((e) =>
          e.product.id === productId ? { ...e, quantity: e.quantity + delta } : e
        )
        .filter((e) => e.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, e) => sum + Number(e.product.priceInRupees) * e.quantity,
    0
  );

  // BarcodeScanner uses onScan, onClose, isOpen props
  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setShowScanner(false);
    }
  };

  const handleScannerClose = () => {
    setShowScanner(false);
  };

  const handleBarcodeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      const product = products.find((p) => p.barcode === barcodeInput.trim());
      if (product) {
        addToCart(product);
      }
      setBarcodeInput('');
    }
  };

  const handleGenerateBill = async () => {
    if (cart.length === 0) return;

    const items: BillItem[] = cart.map((e) => ({
      productId: e.product.id,
      productName: e.product.name,
      quantity: BigInt(e.quantity),
      pricePerUnit: e.product.priceInRupees,
      totalPrice: BigInt(Number(e.product.priceInRupees) * e.quantity),
    }));

    try {
      const bill = await generateBillMutation.mutateAsync({
        customerName: customerName.trim() || null,
        customerPhone: customerPhone.trim() || null,
        items,
        totalAmount: BigInt(cartTotal),
      });
      setGeneratedBill(bill);
      setShowBillDialog(true);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (error) {
      console.error('Failed to generate bill:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            Billing Counter
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Scan or search products to create a bill
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Product Search & Scanner */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Barcode */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, category, or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Barcode Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      ref={barcodeInputRef}
                      placeholder="Scan or type barcode, press Enter..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={handleBarcodeInputKeyDown}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowScanner(!showScanner)}
                    className="shrink-0"
                  >
                    <Barcode className="w-4 h-4 mr-1" />
                    {showScanner ? 'Hide' : 'Camera'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Grid */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Products</span>
                  {productsLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-100 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    No products found
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id.toString()}
                        onClick={() => addToCart(product)}
                        className="text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                      >
                        <p className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-primary">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-primary">
                            ₹{Number(product.priceInRupees)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {unitLabel(product.unitType)}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Cart & Bill */}
          <div className="space-y-4">
            {/* Customer Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="customerName" className="text-xs text-gray-500">
                    Name
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-xs text-gray-500">
                    Phone
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <Input
                      id="customerPhone"
                      placeholder="Phone number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                  </span>
                  {cart.length > 0 && (
                    <Badge variant="secondary">{cart.length} items</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-center text-gray-400 py-6 text-sm">
                    No items added yet
                  </p>
                ) : (
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2 pr-2">
                      {cart.map((entry) => (
                        <div
                          key={entry.product.id.toString()}
                          className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {entry.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹{Number(entry.product.priceInRupees)} ×{' '}
                              {entry.quantity} ={' '}
                              <span className="font-semibold text-gray-700">
                                ₹{Number(entry.product.priceInRupees) * entry.quantity}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => updateQuantity(entry.product.id, -1)}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">
                              {entry.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(entry.product.id, 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(entry.product.id)}
                              className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center ml-1"
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {cart.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">₹{cartTotal}</span>
                    </div>
                    <Button
                      className="w-full mt-3"
                      onClick={handleGenerateBill}
                      disabled={generateBillMutation.isPending}
                    >
                      {generateBillMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Receipt className="w-4 h-4 mr-2" />
                          Generate Bill
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => setCart([])}
                      disabled={generateBillMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Cart
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Camera Scanner — uses correct BarcodeScanner props: onScan, onClose, isOpen */}
      <BarcodeScanner
        isOpen={showScanner}
        onScan={handleBarcodeScanned}
        onClose={handleScannerClose}
      />

      {/* Bill Preview Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Bill Generated Successfully
            </DialogTitle>
          </DialogHeader>
          {generatedBill && (
            <BillTemplate
              bill={generatedBill}
              onClose={() => setShowBillDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingPage;
