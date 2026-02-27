import { useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetShopOpenStatus } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';

interface ShopClosedCheckoutDialogProps {
  open?: boolean;
  onClose?: () => void;
}

export default function ShopClosedCheckoutDialog({ open: externalOpen, onClose }: ShopClosedCheckoutDialogProps) {
  const { data: isShopOpen } = useGetShopOpenStatus();
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const wasOpenRef = useRef<boolean | null>(null);

  // Watch for shop status changing from open → closed
  useEffect(() => {
    if (wasOpenRef.current === null && isShopOpen !== undefined) {
      wasOpenRef.current = isShopOpen;
      return;
    }
    if (wasOpenRef.current === true && isShopOpen === false) {
      setInternalOpen(true);
    }
    if (isShopOpen !== undefined) {
      wasOpenRef.current = isShopOpen;
    }
  }, [isShopOpen]);

  // If caller controls open state externally, use that; otherwise use internal
  const showDialog = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleClose = () => {
    setInternalOpen(false);
    if (onClose) {
      onClose();
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <AlertDialogTitle className="text-xl">Shop Closed</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Sorry, the store is currently closed. Please place your order when we reopen!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose} className="bg-primary hover:bg-primary/90">
            Go to Home
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
