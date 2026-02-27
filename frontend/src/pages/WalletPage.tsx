import { Wallet } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <Wallet className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Wallet</h1>
      <p className="text-muted-foreground max-w-xs">
        Wallet functionality is coming soon! Earn cashback and pay faster.
      </p>
    </div>
  );
}
