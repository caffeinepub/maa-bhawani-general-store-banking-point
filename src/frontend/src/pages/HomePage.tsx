import ProductGrid from '../components/ProductGrid';
import MobileRechargeSection from '../components/MobileRechargeSection';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="relative rounded-2xl overflow-hidden shadow-lg">
        <img
          src="/assets/IMG_20251019_102908.png"
          alt="Maa Bhawani General Store - Kirana Store with Aadhar Enabled Payment System and Stationery"
          className="w-full h-auto object-contain"
        />
      </section>

      <MobileRechargeSection />

      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Shop Our Products</h2>
          <p className="text-muted-foreground">Browse our wide selection of quality groceries</p>
        </div>
        <ProductGrid />
      </section>
    </div>
  );
}
