import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAddProduct, useGetAllProducts } from '../hooks/useQueries';
import { ExternalBlob, UnitType } from '../backend';
import { toast } from 'sonner';
import { Camera, Package, Tag, DollarSign, ImageIcon, Barcode, Loader2, Plus, Warehouse } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

const CATEGORIES = [
  'Grains & Flour',
  'Rice',
  'Sugar & Sweeteners',
  'Spices',
  'Personal Care',
  'Cooking Oil',
  'Pulses & Lentils',
  'Other',
];

function getStockLabel(unitType: string): string {
  switch (unitType) {
    case 'kg': return 'Stock (Kg)';
    case 'gram': return 'Stock (Grams)';
    case 'packet': return 'Stock (Packets)';
    case 'piece': return 'Stock (Pcs)';
    default: return 'Stock Quantity';
  }
}

export default function AdminProductForm() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [unitType, setUnitType] = useState('');
  const [barcode, setBarcode] = useState('');
  const [stock, setStock] = useState('0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addProduct = useAddProduct();
  const { data: products = [] } = useGetAllProducts();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setPrice('');
    setUnitType('');
    setBarcode('');
    setStock('0');
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category || !price || !unitType || !imageFile) {
      toast.error('Please fill all required fields and select an image');
      return;
    }

    const priceInRupees = parseInt(price);
    if (isNaN(priceInRupees) || priceInRupees <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const stockQty = parseInt(stock);
    if (isNaN(stockQty) || stockQty < 0) {
      toast.error('Please enter a valid stock quantity (0 or more)');
      return;
    }

    // Check for duplicate barcode if provided
    if (barcode.trim()) {
      const existingProduct = products.find(p => p.barcode === barcode.trim());
      if (existingProduct) {
        toast.error(`Barcode already used by: ${existingProduct.name}`);
        return;
      }
    }

    // Map unitType string to UnitType enum
    let unitTypeEnum: UnitType;
    switch (unitType) {
      case 'kg': unitTypeEnum = UnitType.kg; break;
      case 'gram': unitTypeEnum = UnitType.gram; break;
      case 'packet': unitTypeEnum = UnitType.packet; break;
      case 'piece': unitTypeEnum = UnitType.piece; break;
      default:
        toast.error('Invalid unit type');
        return;
    }

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await addProduct.mutateAsync({
        name: name.trim(),
        category,
        priceInRupees: BigInt(priceInRupees),
        image: blob,
        barcode: barcode.trim(),
        unitType: unitTypeEnum,
        stock: BigInt(stockQty),
      });

      toast.success(`"${name.trim()}" added successfully!`);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleBarcodeScanned = (scannedBarcode: string) => {
    const existingProduct = products.find(p => p.barcode === scannedBarcode);
    if (existingProduct) {
      toast.error(`Barcode already used by: ${existingProduct.name}`);
      setIsScannerOpen(false);
      return;
    }
    setBarcode(scannedBarcode);
    toast.success('Barcode scanned: ' + scannedBarcode);
    setIsScannerOpen(false);
  };

  const isSubmitting = addProduct.isPending;

  return (
    <>
      <Card className="bg-white shadow-sm border border-gray-200">
        {/* Card Header */}
        <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Add New Product</CardTitle>
              <CardDescription className="text-xs mt-0.5">Fill in the details to add a product to your inventory</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} noValidate>
            {/* Section: Basic Info */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-name" className="text-xs font-medium text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="prod-name"
                    placeholder="e.g., Aashirvaad Atta 5kg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prod-category" className="text-xs font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                    <SelectTrigger id="prod-category" className="h-9 text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-sm">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Section: Pricing & Units */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing & Units</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-price" className="text-xs font-medium text-gray-700">
                    Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">₹</span>
                    <Input
                      id="prod-price"
                      type="number"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isSubmitting}
                      min="1"
                      className="h-9 text-sm pl-7"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prod-unit" className="text-xs font-medium text-gray-700">
                    Unit Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={unitType} onValueChange={setUnitType} disabled={isSubmitting}>
                    <SelectTrigger id="prod-unit" className="h-9 text-sm">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg" className="text-sm">Kilogram (kg)</SelectItem>
                      <SelectItem value="gram" className="text-sm">Gram (g)</SelectItem>
                      <SelectItem value="packet" className="text-sm">Packet</SelectItem>
                      <SelectItem value="piece" className="text-sm">Piece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Section: Inventory / Stock — Admin Only */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Warehouse className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory</span>
                <span className="text-xs text-gray-400">(Admin only — hidden from customers)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-stock" className="text-xs font-medium text-gray-700">
                    {unitType ? getStockLabel(unitType) : 'Stock Quantity'}
                  </Label>
                  <Input
                    id="prod-stock"
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    disabled={isSubmitting}
                    min="0"
                    step="1"
                    className="h-9 text-sm"
                  />
                  <p className="text-xs text-gray-400">
                    Enter the current stock quantity. A low-stock alert will appear when stock falls below 5.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Section: Barcode */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Barcode className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Barcode</span>
                <span className="text-xs text-gray-400">(Optional)</span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-barcode" className="text-xs font-medium text-gray-700">
                  Barcode Number
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="prod-barcode"
                    placeholder="Enter or scan barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-sm flex-1 font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsScannerOpen(true)}
                    disabled={isSubmitting}
                    className="h-9 px-3 shrink-0 hover:bg-primary/5 hover:text-primary hover:border-primary gap-1.5 text-xs"
                    title="Scan Barcode with Camera"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="hidden sm:inline">Scan</span>
                  </Button>
                </div>
                {barcode && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Barcode set: <span className="font-mono font-medium">{barcode}</span>
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Section: Product Image */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Image</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {imagePreview && (
                  <div className="shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-1.5 w-full">
                  <Label htmlFor="prod-image" className="text-xs font-medium text-gray-700">
                    Upload Image <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="prod-image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="h-9 text-sm cursor-pointer file:text-xs file:font-medium file:text-primary file:bg-primary/5 file:border-0 file:rounded file:px-2 file:py-1 file:mr-2"
                    required
                  />
                  <p className="text-xs text-gray-400">Supported: JPG, PNG, WebP. Max 5MB recommended.</p>
                </div>
              </div>

              {/* Upload Progress */}
              {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Uploading image...</span>
                    <span className="text-xs font-medium text-primary">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white h-9 px-6 text-sm font-medium gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Product
                  </>
                )}
              </Button>
              {!isSubmitting && (name || category || price || barcode || imageFile) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForm}
                  className="h-9 px-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Barcode Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={(open) => { if (!open) setIsScannerOpen(false); }}>
        <DialogContent className="p-0 max-w-full h-screen border-0 bg-black">
          <BarcodeScanner
            onScan={handleBarcodeScanned}
            onClose={() => setIsScannerOpen(false)}
            isOpen={isScannerOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
