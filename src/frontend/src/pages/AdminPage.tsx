import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AdminGuard from '../components/AdminGuard';
import AdminProductForm from '../components/AdminProductForm';
import AdminProductList from '../components/AdminProductList';
import BillHistoryTable from '../components/BillHistoryTable';
import ShopStatusToggle from '../components/ShopStatusToggle';
import { useGetAllOrders, useGetAllRechargeOrders, useConfirmOrder, useMarkAsPacked, useMarkAsOutForDelivery, useMarkAsCompleted } from '../hooks/useQueries';
import { OrderStatus, PaymentMethod } from '../backend';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Package, ShoppingBag, Receipt, Smartphone } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function AdminPage() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: rechargeOrders = [], isLoading: rechargeLoading } = useGetAllRechargeOrders();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const confirmOrder = useConfirmOrder();
  const markAsPacked = useMarkAsPacked();
  const markAsOutForDelivery = useMarkAsOutForDelivery();
  const markAsCompleted = useMarkAsCompleted();

  const handleStatusChange = async (orderId: bigint, currentStatus: OrderStatus) => {
    try {
      switch (currentStatus) {
        case OrderStatus.pending:
          await confirmOrder.mutateAsync(orderId);
          toast.success('Order confirmed');
          break;
        case OrderStatus.confirmed:
          await markAsPacked.mutateAsync(orderId);
          toast.success('Order marked as packed');
          break;
        case OrderStatus.packed:
          await markAsOutForDelivery.mutateAsync(orderId);
          toast.success('Order marked as out for delivery');
          break;
        case OrderStatus.out_for_delivery:
          await markAsCompleted.mutateAsync(orderId);
          toast.success('Order completed');
          break;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return 'secondary';
      case OrderStatus.confirmed:
        return 'default';
      case OrderStatus.packed:
        return 'default';
      case OrderStatus.out_for_delivery:
        return 'default';
      case OrderStatus.completed:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.confirmed:
        return 'Confirmed';
      case OrderStatus.packed:
        return 'Packed';
      case OrderStatus.out_for_delivery:
        return 'Out for Delivery';
      case OrderStatus.completed:
        return 'Completed';
      default:
        return status;
    }
  };

  const getNextActionButton = (order: any) => {
    const isProcessing = confirmOrder.isPending || markAsPacked.isPending || 
                        markAsOutForDelivery.isPending || markAsCompleted.isPending;

    switch (order.status) {
      case OrderStatus.pending:
        return (
          <Button
            size="sm"
            onClick={() => handleStatusChange(order.id, order.status)}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Confirm Order
          </Button>
        );
      case OrderStatus.confirmed:
        return (
          <Button
            size="sm"
            onClick={() => handleStatusChange(order.id, order.status)}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Mark as Packed
          </Button>
        );
      case OrderStatus.packed:
        return (
          <Button
            size="sm"
            onClick={() => handleStatusChange(order.id, order.status)}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Out for Delivery
          </Button>
        );
      case OrderStatus.out_for_delivery:
        return (
          <Button
            size="sm"
            onClick={() => handleStatusChange(order.id, order.status)}
            disabled={isProcessing}
            className="bg-success hover:bg-success/90 text-white"
          >
            Mark as Completed
          </Button>
        );
      case OrderStatus.completed:
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Completed</Badge>;
      default:
        return null;
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your store inventory and orders</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/admin/settings' })}
            className="gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Shop Status Toggle */}
        <ShopStatusToggle />

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-white border shadow-sm">
            <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="recharge" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Recharge</span>
            </TabsTrigger>
            <TabsTrigger value="bills" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Bills</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Add products to your inventory</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminProductForm />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>Manage your product catalog</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminProductList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Customer Orders</CardTitle>
                    <CardDescription>Manage and track customer orders</CardDescription>
                  </div>
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
              <CardContent className="pt-6">
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold">Order ID</TableHead>
                          <TableHead className="font-semibold">Customer</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Address</TableHead>
                          <TableHead className="font-semibold">Total</TableHead>
                          <TableHead className="font-semibold">Payment</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={Number(order.id)} className="hover:bg-gray-50">
                            <TableCell className="font-medium">#{Number(order.id)}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.phoneNumber}</TableCell>
                            <TableCell className="max-w-xs truncate">{order.deliveryAddress}</TableCell>
                            <TableCell className="font-semibold text-primary">₹{Number(order.totalPrice)}</TableCell>
                            <TableCell>
                              <Badge variant={order.paymentMethod === PaymentMethod.upi ? 'default' : 'secondary'}>
                                {order.paymentMethod === PaymentMethod.upi ? 'UPI' : 'COD'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>{getNextActionButton(order)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recharge" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Mobile Recharge Orders</CardTitle>
                <CardDescription>View and manage mobile recharge requests</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {rechargeLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : rechargeOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recharge orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold">Order ID</TableHead>
                          <TableHead className="font-semibold">Mobile Number</TableHead>
                          <TableHead className="font-semibold">Operator</TableHead>
                          <TableHead className="font-semibold">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rechargeOrders.map((order) => (
                          <TableRow key={Number(order.id)} className="hover:bg-gray-50">
                            <TableCell className="font-medium">#{Number(order.id)}</TableCell>
                            <TableCell>{order.mobileNumber}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{order.operator}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-primary">₹{Number(order.rechargeAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Bill History</CardTitle>
                <CardDescription>View and manage generated bills</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <BillHistoryTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
