import { useEffect, useState, useRef } from 'react';
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

export default function ShopClosedCheckoutDialog() {
  const { data: isShopOpen } = useGetShopOpenStatus();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const wasOpenRef = useRef<boolean | null>(null);

  useEffect(() => {
    // Initialize the ref on first load
    if (wasOpenRef.current === null && isShopOpen !== undefined) {
      wasOpenRef.current = isShopOpen;
      return;
    }

    // Check if shop status changed from open to closed
    if (wasOpenRef.current === true && isShopOpen === false) {
      setShowDialog(true);
    }

    // Update the ref
    if (isShopOpen !== undefined) {
      wasOpenRef.current = isShopOpen;
    }
  }, [isShopOpen]);

  const handleClose = () => {
    setShowDialog(false);
    navigate({ to: '/' });
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <AlertDialogTitle className="text-xl">Shop Closed</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Sorry, the store just closed. Please place your order when we reopen!
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
