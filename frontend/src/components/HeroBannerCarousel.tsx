import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    image: '/assets/generated/grocery-banner-rice-oil.dim_1200x400.png',
    title: 'Premium Rice & Pure Oils',
    subtitle: 'Best quality grains & cooking oils at unbeatable prices',
    badge: 'FREE Delivery above ₹51',
    bgColor: 'from-amber-900 to-amber-700',
  },
  {
    id: 2,
    image: '/assets/generated/grocery-banner-biscuits-snacks.dim_1200x400.png',
    title: 'Biscuits, Snacks & More',
    subtitle: 'Your favourite munchies delivered in 10 minutes',
    badge: 'Delivery in 10 Mins',
    bgColor: 'from-orange-900 to-orange-700',
  },
  {
    id: 3,
    image: '/assets/generated/hero-banner.dim_1200x400.png',
    title: 'Daily Grocery Essentials',
    subtitle: 'Sugar, Spices, Atta & everything you need',
    badge: 'Shop Now',
    bgColor: 'from-green-900 to-green-700',
  },
];

export default function HeroBannerCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  const banner = banners[current];

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ height: '160px' }}>
      {/* Background gradient fallback */}
      <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor} transition-all duration-500`} />

      {/* Banner image */}
      <img
        src={banner.image}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = '0';
        }}
      />

      {/* Overlay text */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4">
        <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full mb-1 w-fit">
          {banner.badge}
        </span>
        <h2 className="text-white font-bold text-base leading-tight">{banner.title}</h2>
        <p className="text-white/80 text-xs mt-0.5">{banner.subtitle}</p>
      </div>

      {/* Prev/Next arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
        aria-label="Previous banner"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
        aria-label="Next banner"
      >
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/50'}`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
