import React, { useState } from 'react';
import { Bill } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Receipt, Search, Download, Eye, Printer } from 'lucide-react';
import BillTemplate from './BillTemplate';
import { useGetAllBills } from '../hooks/useQueries';

const formatDate = (timestamp: bigint) => {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTime = (timestamp: bigint) => {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const paymentStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed': return 'default';
    case 'pending': return 'secondary';
    case 'failed': return 'destructive';
    case 'refunded': return 'outline';
    default: return 'secondary';
  }
};

const BillHistoryTable: React.FC = () => {
  const { data: bills = [], isLoading } = useGetAllBills();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillDialog, setShowBillDialog] = useState(false);

  const filteredBills = bills.filter((bill) => {
    const q = searchQuery.toLowerCase();
    return (
      bill.billNumber.toLowerCase().includes(q) ||
      (bill.customerName?.toLowerCase().includes(q) ?? false) ||
      (bill.customerPhone?.includes(q) ?? false)
    );
  });

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowBillDialog(true);
  };

  const handlePrintBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowBillDialog(true);
    setTimeout(() => window.print(), 300);
  };

  const exportToCSV = () => {
    const headers = ['Bill No', 'Date', 'Time', 'Customer', 'Phone', 'Items', 'Total', 'Status'];
    const rows = filteredBills.map((bill) => [
      bill.billNumber,
      formatDate(bill.timestamp),
      formatTime(bill.timestamp),
      bill.customerName ?? '',
      bill.customerPhone ?? '',
      bill.items.length.toString(),
      Number(bill.totalAmount).toString(),
      bill.paymentStatus,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by bill no, customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} disabled={bills.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p>Loading bills...</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{searchQuery ? 'No bills match your search' : 'No bills generated yet'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bill No</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date &amp; Time</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Items</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill, index) => (
                <tr
                  key={bill.id.toString()}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-medium text-primary">
                    #{bill.billNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{formatDate(bill.timestamp)}</div>
                    <div className="text-xs text-gray-400">{formatTime(bill.timestamp)}</div>
                  </td>
                  <td className="px-4 py-3">
                    {bill.customerName ? (
                      <div>
                        <div className="font-medium text-gray-800">{bill.customerName}</div>
                        {bill.customerPhone && (
                          <div className="text-xs text-gray-400">{bill.customerPhone}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Walk-in</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {bill.items.length}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    ₹{Number(bill.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={paymentStatusVariant(bill.paymentStatus)}>
                      {bill.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBill(bill)}
                        className="h-8 w-8 p-0"
                        title="View Bill"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintBill(bill)}
                        className="h-8 w-8 p-0"
                        title="Print Bill"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bill Preview Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Bill #{selectedBill?.billNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <BillTemplate
              bill={selectedBill}
              onClose={() => setShowBillDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillHistoryTable;
