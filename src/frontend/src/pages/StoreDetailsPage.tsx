import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Truck } from 'lucide-react';

export default function StoreDetailsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Store Details</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src="/assets/generated/store-logo.dim_200x200.png" alt="Store Logo" className="h-12 w-12 rounded-lg" />
            Maa Bhawani General Store & Banking Point
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Contact Number</p>
                  <a href="tel:9142876085" className="text-primary hover:underline">
                    9142876085
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Location</p>
                  <a
                    href="https://maps.app.goo.gl/i9v1ukJNWdsgT5gU7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Delivery Policy</p>
                  <p className="text-sm text-muted-foreground">
                    Free delivery within 1km
                    <br />
                    ₹20 per km for distances beyond 1km
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Store Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Open Daily: 8:00 AM - 9:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Our Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Fresh Groceries & Daily Essentials</li>
                <li>• Mobile Recharge Services</li>
                <li>• Banking Point Services</li>
                <li>• Home Delivery Available</li>
                <li>• Quality Products at Best Prices</li>
              </ul>
            </div>
          </div>

          <div className="pt-4">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977891741!2d-122.41941548468208!3d37.77492977975903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjciTiAxMjLCsDI1JzA0LjAiVw!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <a href="tel:9142876085">Call Us Now</a>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <a href="https://maps.app.goo.gl/i9v1ukJNWdsgT5gU7" target="_blank" rel="noopener noreferrer">
                Get Directions
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
