import { useState } from 'react';
import HeroBannerCarousel from '../components/HeroBannerCarousel';
import ShopClosedBanner from '../components/ShopClosedBanner';
import ProductGrid from '../components/ProductGrid';
import CategoryFilter from '../components/CategoryFilter';
import MobileRechargeSection from '../components/MobileRechargeSection';
import { useGetAllProducts } from '../hooks/useQueries';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: products = [] } = useGetAllProducts();

  // Build category list from fetched products
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="px-3 py-3 space-y-4 pb-24">
      {/* Hero Banner Carousel */}
      <HeroBannerCarousel />

      {/* Shop Closed Banner — shown prominently above products */}
      <ShopClosedBanner />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Product Grid */}
      <ProductGrid selectedCategory={selectedCategory} />

      {/* Mobile Recharge Section at bottom */}
      <MobileRechargeSection />
    </div>
  );
}
