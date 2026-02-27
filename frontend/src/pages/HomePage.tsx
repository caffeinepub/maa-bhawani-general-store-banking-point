import { useGetShopStatus } from '../hooks/useQueries';
import ShopClosedBanner from '../components/ShopClosedBanner';
import ProductGrid from '../components/ProductGrid';
import MobileRechargeSection from '../components/MobileRechargeSection';
import HeroBannerCarousel from '../components/HeroBannerCarousel';

export default function HomePage() {
  // Force fresh shop status fetch on every HomePage load
  useGetShopStatus();

  return (
    <div className="pb-2">
      {/* Sliding Hero Banner */}
      <HeroBannerCarousel />

      {/* Shop Closed Banner — only shown when confirmed closed */}
      <ShopClosedBanner />

      {/* Product Grid (manages its own category filter and shop status internally) */}
      <ProductGrid />

      {/* Mobile Recharge Section — compact card at the bottom */}
      <MobileRechargeSection />
    </div>
  );
}
