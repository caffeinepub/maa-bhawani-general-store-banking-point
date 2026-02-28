import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Gift, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MOCK_TRANSACTIONS: Array<{
  id: number;
  type: 'credit' | 'debit';
  label: string;
  amount: number;
  date: string;
}> = [];

export default function WalletPage() {
  const balance = 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            My Wallet
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Cashback & rewards</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium mb-1">Available Balance</p>
          <p className="text-4xl font-bold">
            ₹{balance.toFixed(2)}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge className="bg-blue-500 text-white border-0 text-xs">
              <Gift className="w-3 h-3 mr-1" />
              Cashback Wallet
            </Badge>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">How it works</p>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Earn cashback on every order. Your wallet balance can be used to pay for future orders at Maa Bhawani General Store.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {MOCK_TRANSACTIONS.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Wallet className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium text-sm">No transactions yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Your cashback and rewards will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {MOCK_TRANSACTIONS.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {tx.type === 'credit'
                          ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          : <ArrowUpRight className="w-4 h-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{tx.label}</p>
                        <p className="text-xs text-gray-400">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`font-semibold text-sm ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
