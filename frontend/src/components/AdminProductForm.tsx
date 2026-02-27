import React, { useState } from 'react';
import { useAddProduct } from '../hooks/useQueries';
import { ExternalBlob, UnitType } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, Plus } from 'lucide-react';

const CATEGORIES = ['Grains & Flour', 'Oils & Ghee', 'Spices', 'Snacks', 'Beverages', 'Personal Care', 'Dairy', 'Recharge', 'Other'];

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: UnitType.kg, label: 'Kg' },
  { value: UnitType.gram, label: 'Gram' },
  { value: UnitType.piece, label: 'Piece' },
  { value: UnitType.packet, label: 'Packet' },
];

const DEFAULT_FORM = {
  name: '',
  category: '',
  priceInRupees: '',
  barcode: '',
  unitType: UnitType.piece as UnitType,
  stock: '',
  imageUrl: '',
};

export default function AdminProductForm() {
  const addProductMutation = useAddProduct();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const stockLabel = `Stock (${UNIT_TYPES.find((u) => u.value === form.unitType)?.label ?? 'Units'})`;

  const handleChange = (field: keyof typeof DEFAULT_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError(null);
    if (addProductMutation.isError) addProductMutation.reset();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) { setFormError('Product name is required.'); return; }
    if (!form.category) { setFormError('Category is required.'); return; }
    const price = parseInt(form.priceInRupees, 10);
    if (isNaN(price) || price <= 0) { setFormError('Price must be a positive number.'); return; }
    const stock = parseInt(form.stock, 10);
    if (isNaN(stock) || stock < 0) { setFormError('Stock must be a non-negative number.'); return; }

    let image: ExternalBlob;
    if (imageFile) {
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      image = ExternalBlob.fromBytes(bytes);
    } else if (form.imageUrl.trim()) {
      image = ExternalBlob.fromURL(form.imageUrl.trim());
    } else {
      image = ExternalBlob.fromURL('/assets/generated/product-aata.dim_300x300.png');
    }

    try {
      await addProductMutation.mutateAsync({
        name: form.name.trim(),
        category: form.category,
        priceInRupees: BigInt(price),
        image,
        barcode: form.barcode.trim(),
        unitType: form.unitType,
        stock: BigInt(stock),
      });
      setForm(DEFAULT_FORM);
      setImageFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add product';
      setFormError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(formError || addProductMutation.isError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {formError ?? (addProductMutation.error?.message ?? 'Failed to add product')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="product-name" className="text-slate-300 text-sm">Product Name *</Label>
          <Input
            id="product-name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Basmati Rice"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            disabled={addProductMutation.isPending}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="product-category" className="text-slate-300 text-sm">Category *</Label>
          <Select
            value={form.category}
            onValueChange={(v) => handleChange('category', v)}
            disabled={addProductMutation.isPending}
          >
            <SelectTrigger id="product-category" className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-white hover:bg-slate-700">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="product-price" className="text-slate-300 text-sm">Price (₹) *</Label>
          <Input
            id="product-price"
            type="number"
            value={form.priceInRupees}
            onChange={(e) => handleChange('priceInRupees', e.target.value)}
            placeholder="e.g. 120"
            min="1"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            disabled={addProductMutation.isPending}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="product-barcode" className="text-slate-300 text-sm">Barcode</Label>
          <Input
            id="product-barcode"
            value={form.barcode}
            onChange={(e) => handleChange('barcode', e.target.value)}
            placeholder="e.g. 8901234567890"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            disabled={addProductMutation.isPending}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="product-unit" className="text-slate-300 text-sm">Unit Type *</Label>
          <Select
            value={form.unitType}
            onValueChange={(v) => handleChange('unitType', v as UnitType)}
            disabled={addProductMutation.isPending}
          >
            <SelectTrigger id="product-unit" className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {UNIT_TYPES.map((u) => (
                <SelectItem key={u.value} value={u.value} className="text-white hover:bg-slate-700">
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="product-stock" className="text-slate-300 text-sm">{stockLabel} *</Label>
          <Input
            id="product-stock"
            type="number"
            value={form.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            placeholder="e.g. 50"
            min="0"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            disabled={addProductMutation.isPending}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="product-image-url" className="text-slate-300 text-sm">Image URL (optional)</Label>
        <Input
          id="product-image-url"
          value={form.imageUrl}
          onChange={(e) => handleChange('imageUrl', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          disabled={addProductMutation.isPending}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="product-image-file" className="text-slate-300 text-sm">Or Upload Image</Label>
        <Input
          id="product-image-file"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="bg-slate-700 border-slate-600 text-white file:text-slate-300 file:bg-slate-600 file:border-0 file:rounded file:px-2 file:py-1"
          disabled={addProductMutation.isPending}
        />
      </div>

      <Button
        type="submit"
        disabled={addProductMutation.isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
      >
        {addProductMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Adding Product...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </>
        )}
      </Button>

      {addProductMutation.isSuccess && (
        <p className="text-green-400 text-sm text-center">✓ Product added successfully!</p>
      )}
    </form>
  );
}
