import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BillTemplate from './BillTemplate';
import { useGetAllBills } from '../hooks/useQueries';
import { Printer, Eye, Download } from 'lucide-react';
import type { Bill } from '../backend';

export default function BillHistoryTable() {
  const { data: bills = [] } = useGetAllBills();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredBills = bills.filter(bill =>
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.customerName && bill.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (bill.customerPhone && bill.customerPhone.includes(searchTerm))
  );

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setViewDialogOpen(true);
  };

  const handlePrintBill = (bill: Bill) => {
    setSelectedBill(bill);
    setViewDialogOpen(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportCSV = () => {
    const headers = ['Bill Number', 'Date', 'Customer Name', 'Customer Phone', 'Items Count', 'Total Amount'];
    const rows = bills.map(bill => [
      `BILL-${bill.billNumber}`,
      formatDate(bill.timestamp),
      bill.customerName || 'N/A',
      bill.customerPhone || 'N/A',
      bill.items.length,
      Number(bill.totalAmount),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bills-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Bill History</CardTitle>
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by bill number, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {filteredBills.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No bills found matching your search' : 'No bills generated yet'}
            </p>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={Number(bill.id)}>
                      <TableCell className="font-medium">BILL-{bill.billNumber}</TableCell>
                      <TableCell>{formatDate(bill.timestamp)}</TableCell>
                      <TableCell>{formatTime(bill.timestamp)}</TableCell>
                      <TableCell>
                        {bill.customerName || 'Walk-in'}
                        {bill.customerPhone && (
                          <div className="text-xs text-muted-foreground">{bill.customerPhone}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{bill.items.length}</TableCell>
                      <TableCell className="text-right font-semibold">₹{Number(bill.totalAmount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleViewBill(bill)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePrintBill(bill)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {selectedBill && <BillTemplate bill={selectedBill} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
