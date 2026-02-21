import { MapPin, Phone, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'maa-bhawani-store');

  return (
    <footer className="border-t border-border/40 bg-card mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 text-primary">Maa Bhawani General Store</h3>
            <p className="text-sm text-muted-foreground mb-2">& Banking Point</p>
            <p className="text-sm text-muted-foreground">Your trusted neighborhood grocery store</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact Us</h4>
            <div className="space-y-2 text-sm">
              <a href="tel:9142876085" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                9142876085
              </a>
              <a
                href="https://maps.app.goo.gl/i9v1ukJNWdsgT5gU7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-primary transition-colors"
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>View on Google Maps</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Delivery Info</h4>
            <p className="text-sm text-muted-foreground">
              Free delivery within 1km
              <br />
              Delivery charges apply beyond 1km
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1 flex-wrap">
            © {currentYear} Maa Bhawani General Store. Built with{' '}
            <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
