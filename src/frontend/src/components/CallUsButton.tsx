import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CallUsButton() {
  return (
    <a
      href="tel:9142876085"
      className="fixed bottom-6 right-6 z-40"
    >
      <Button
        size="lg"
        className="rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        <Phone className="h-6 w-6" />
      </Button>
    </a>
  );
}
