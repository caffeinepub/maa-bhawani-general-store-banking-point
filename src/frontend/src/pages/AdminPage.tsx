import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminGuard from '../components/AdminGuard';
import AdminProductForm from '../components/AdminProductForm';
import AdminProductList from '../components/AdminProductList';
import BillHistoryTable from '../components/BillHistoryTable';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  useGetAllOrders, 
  useGetAllRechargeOrders, 
  useGetAllBills, 
  useGetAllProducts,
  useConfirmOrder,
  useMarkAsPacked,
  useMarkAsOutForDelivery,
  useMarkAsCompleted
} from '../hooks/useQueries';
import { Package, Smartphone, Receipt, Settings, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { Order, OrderStatus, PaymentMethod } from '../backend';

export default function AdminPage() {
  const { data: orders = [], error: ordersError } = useGetAllOrders();
  const { data: rechargeOrders = [], error: rechargeError } = useGetAllRechargeOrders();
  const { data: bills = [], error: billsError } = useGetAllBills();
  const { data: products = [], error: productsError } = useGetAllProducts();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processingOrderId, setProcessingOrderId] = useState<bigint | null>(null);

  const confirmOrder = useConfirmOrder();
  const markAsPacked = useMarkAsPacked();
  const markAsOutForDelivery = useMarkAsOutForDelivery();
  const markAsCompleted = useMarkAsCompleted();

  // Log any errors for debugging
  if (ordersError) console.error('[AdminPage] Orders error:', ordersError);
  if (rechargeError) console.error('[AdminPage] Recharge orders error:', rechargeError);
  if (billsError) console.error('[AdminPage] Bills error:', billsError);
  if (productsError) console.error('[AdminPage] Products error:', productsError);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
  const billRevenue = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

  const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'confirmed':
        return 'secondary';
      case 'packed':
        return 'default';
      case 'out_for_delivery':
        return 'default';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'packed':
        return 'Packed';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'upi':
        return 'UPI';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return 'Unknown';
    }
  };

  const handleStatusUpdate = async (orderId: bigint, currentStatus: OrderStatus) => {
    setProcessingOrderId(orderId);
    try {
      switch (currentStatus) {
        case 'pending':
          await confirmOrder.mutateAsync(orderId);
          toast.success('Order confirmed successfully');
          break;
        case 'confirmed':
          await markAsPacked.mutateAsync(orderId);
          toast.success('Order marked as packed');
          break;
        case 'packed':
          await markAsOutForDelivery.mutateAsync(orderId);
          toast.success('Order marked as out for delivery');
          break;
        case 'out_for_delivery':
          await markAsCompleted.mutateAsync(orderId);
          toast.success('Order completed successfully');
          break;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  return (
    <ErrorBoundary>
      <AdminGuard>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage your store products, orders, and billing</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate({ to: '/admin/billing' })} className="gap-2">
                <Receipt className="h-4 w-4" />
                Generate Bill
              </Button>
              <Button onClick={() => navigate({ to: '/admin/settings' })} variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bills.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <span className="text-2xl">₹</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue + billRevenue}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="recharge">Recharge Orders</TabsTrigger>
              <TabsTrigger value="bills">Bill History</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              <AdminProductForm />
              <AdminProductList />
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Order Management</CardTitle>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="packed">Packed</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order) => {
                            const isProcessing = processingOrderId === order.id;
                            return (
                              <TableRow key={Number(order.id)}>
                                <TableCell className="font-medium">#{Number(order.id)}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>{order.phoneNumber}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{order.deliveryAddress}</TableCell>
                                <TableCell>{order.products.length} item(s)</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getPaymentMethodLabel(order.paymentMethod)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-bold">₹{Number(order.totalPrice)}</TableCell>
                                <TableCell>
                                  <Badge variant={getStatusBadgeVariant(order.status)}>
                                    {getStatusLabel(order.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {order.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(order.id, order.status)}
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        'Confirm Order'
                                      )}
                                    </Button>
                                  )}
                                  {order.status === 'confirmed' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(order.id, order.status)}
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        'Packed'
                                      )}
                                    </Button>
                                  )}
                                  {order.status === 'packed' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(order.id, order.status)}
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        'Out for Delivery'
                                      )}
                                    </Button>
                                  )}
                                  {order.status === 'out_for_delivery' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(order.id, order.status)}
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        'Success'
                                      )}
                                    </Button>
                                  )}
                                  {order.status === 'completed' && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span className="text-sm">Completed</span>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recharge">
              <Card>
                <CardHeader>
                  <CardTitle>Recharge Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {rechargeOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No recharge orders yet</p>
                  ) : (
                    <div className="space-y-4">
                      {rechargeOrders.map((order) => (
                        <div key={Number(order.id)} className="border rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <p className="font-semibold">Order #{Number(order.id)}</p>
                            <p className="text-sm text-muted-foreground">{order.mobileNumber}</p>
                            <p className="text-sm text-muted-foreground">{order.operator}</p>
                          </div>
                          <p className="font-bold text-lg">₹{Number(order.rechargeAmount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bills">
              <BillHistoryTable />
            </TabsContent>
          </Tabs>
        </div>
      </AdminGuard>
    </ErrorBoundary>
  );
}
