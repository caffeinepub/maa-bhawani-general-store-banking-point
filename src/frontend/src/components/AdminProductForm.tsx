import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAddProduct, useGetAllProducts } from '../hooks/useQueries';
import { ExternalBlob, UnitType } from '../backend';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

const CATEGORIES = ['Grains & Flour', 'Rice', 'Sugar & Sweeteners', 'Spices', 'Personal Care', 'Cooking Oil', 'Pulses & Lentils', 'Other'];

export default function AdminProductForm() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [unitType, setUnitType] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const addProduct = useAddProduct();
  const { data: products = [] } = useGetAllProducts();

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

    // Check for duplicate barcode if provided
    if (barcode.trim()) {
      const existingProduct = products.find(p => p.barcode === barcode.trim());
      if (existingProduct) {
        toast.error('A product with this barcode already exists');
        return;
      }
    }

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Map unitType string to UnitType enum
      let unitTypeEnum: UnitType;
      switch (unitType) {
        case 'kg':
          unitTypeEnum = UnitType.kg;
          break;
        case 'gram':
          unitTypeEnum = UnitType.gram;
          break;
        case 'packet':
          unitTypeEnum = UnitType.packet;
          break;
        case 'piece':
          unitTypeEnum = UnitType.piece;
          break;
        default:
          toast.error('Invalid unit type');
          return;
      }

      const productId = await addProduct.mutateAsync({
        name,
        category,
        priceInRupees: BigInt(priceInRupees),
        image: blob,
        barcode: barcode.trim(),
        unitType: unitTypeEnum,
      });

      toast.success(`Product added successfully! (ID: ${productId})`);
      
      // Reset form
      setName('');
      setCategory('');
      setPrice('');
      setUnitType('');
      setBarcode('');
      setImageFile(null);
      setUploadProgress(0);
      
      // Reset file input
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleBarcodeScanned = (scannedBarcode: string) => {
    // Check for duplicate barcode
    const existingProduct = products.find(p => p.barcode === scannedBarcode);
    if (existingProduct) {
      toast.error(`This barcode already exists for product: ${existingProduct.name}`);
      setIsScannerOpen(false);
      return;
    }

    // Populate the barcode field
    setBarcode(scannedBarcode);
    toast.success('Barcode scanned successfully!');
    
    // Close the scanner
    setIsScannerOpen(false);
  };

  const isSubmitting = addProduct.isPending || (uploadProgress > 0 && uploadProgress < 100);

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-xl">Add New Product</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Aashirvaad Atta 5kg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-medium">Category *</Label>
                <Select value={category} onValueChange={setCategory} disabled={isSubmitting} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="font-medium">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isSubmitting}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitType" className="font-medium">Unit Type *</Label>
                <Select value={unitType} onValueChange={setUnitType} disabled={isSubmitting} required>
                  <SelectTrigger id="unitType">
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="gram">Gram</SelectItem>
                    <SelectItem value="packet">Packet</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode" className="font-medium">Barcode (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    placeholder="Enter barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsScannerOpen(true)}
                    disabled={isSubmitting}
                    className="min-w-[44px] min-h-[44px] shrink-0 hover:bg-primary/5 hover:text-primary hover:border-primary"
                    title="Scan Barcode"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image" className="font-medium">Product Image *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <Label className="font-medium">Upload Progress</Label>
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white min-h-[44px] px-6"
              >
                {addProduct.isPending ? 'Adding Product...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Barcode Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
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
