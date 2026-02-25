import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AdminGuard from '../components/AdminGuard';
import AdminProductForm from '../components/AdminProductForm';
import AdminProductList from '../components/AdminProductList';
import BillHistoryTable from '../components/BillHistoryTable';
import ShopStatusToggle from '../components/ShopStatusToggle';
import { useGetAllOrders, useGetAllRechargeOrders, useConfirmOrder, useMarkAsPacked, useMarkAsOutForDelivery, useMarkAsCompleted } from '../hooks/useQueries';
import { OrderStatus, PaymentMethod } from '../backend';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings,
  Package,
  ShoppingBag,
  Receipt,
  Smartphone,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

type TabKey = 'products' | 'orders' | 'recharge' | 'bills';

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'products', label: 'Products', icon: Package, description: 'Manage inventory' },
  { key: 'orders', label: 'Orders', icon: ShoppingBag, description: 'Track customer orders' },
  { key: 'recharge', label: 'Recharge', icon: Smartphone, description: 'Mobile recharge requests' },
  { key: 'bills', label: 'Bills', icon: Receipt, description: 'Bill history & records' },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('products');
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
      case OrderStatus.pending: return 'secondary';
      case OrderStatus.confirmed: return 'default';
      case OrderStatus.packed: return 'default';
      case OrderStatus.out_for_delivery: return 'default';
      case OrderStatus.completed: return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending: return 'Pending';
      case OrderStatus.confirmed: return 'Confirmed';
      case OrderStatus.packed: return 'Packed';
      case OrderStatus.out_for_delivery: return 'Out for Delivery';
      case OrderStatus.completed: return 'Completed';
      default: return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending: return 'bg-amber-100 text-amber-800 border-amber-200';
      case OrderStatus.confirmed: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.packed: return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.out_for_delivery: return 'bg-orange-100 text-orange-800 border-orange-200';
      case OrderStatus.completed: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextActionButton = (order: any) => {
    const isProcessing = confirmOrder.isPending || markAsPacked.isPending ||
      markAsOutForDelivery.isPending || markAsCompleted.isPending;

    switch (order.status) {
      case OrderStatus.pending:
        return (
          <Button size="sm" onClick={() => handleStatusChange(order.id, order.status)} disabled={isProcessing}
            className="bg-primary hover:bg-primary/90 text-white text-xs">
            Confirm
          </Button>
        );
      case OrderStatus.confirmed:
        return (
          <Button size="sm" onClick={() => handleStatusChange(order.id, order.status)} disabled={isProcessing}
            className="bg-primary hover:bg-primary/90 text-white text-xs">
            Pack
          </Button>
        );
      case OrderStatus.packed:
        return (
          <Button size="sm" onClick={() => handleStatusChange(order.id, order.status)} disabled={isProcessing}
            className="bg-primary hover:bg-primary/90 text-white text-xs">
            Dispatch
          </Button>
        );
      case OrderStatus.out_for_delivery:
        return (
          <Button size="sm" onClick={() => handleStatusChange(order.id, order.status)} disabled={isProcessing}
            className="bg-success hover:bg-success/90 text-white text-xs">
            Complete
          </Button>
        );
      case OrderStatus.completed:
        return <span className="text-xs font-medium text-success">✓ Done</span>;
      default:
        return null;
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  const pendingOrdersCount = orders.filter(o => o.status === OrderStatus.pending).length;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50/50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Manage your store</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/admin/settings' })}
              className="gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary text-sm"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Shop Status Card */}
          <div className="mb-6">
            <ShopStatusToggle />
          </div>

          {/* Dashboard Layout: Sidebar + Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <aside className="lg:w-56 shrink-0">
              <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
                <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {NAV_ITEMS.map(({ key, label, icon: Icon, description }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group ${
                          activeTab === key
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${activeTab === key ? 'text-white' : 'text-gray-500 group-hover:text-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium leading-none ${activeTab === key ? 'text-white' : ''}`}>
                            {label}
                            {key === 'orders' && pendingOrdersCount > 0 && (
                              <span className={`ml-2 inline-flex items-center justify-center w-4 h-4 text-xs rounded-full ${
                                activeTab === key ? 'bg-white text-primary' : 'bg-primary text-white'
                              }`}>
                                {pendingOrdersCount}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs mt-0.5 ${activeTab === key ? 'text-white/70' : 'text-gray-400'}`}>
                            {description}
                          </div>
                        </div>
                        <ChevronRight className={`h-3 w-3 shrink-0 ${activeTab === key ? 'text-white/70' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white shadow-sm border border-gray-200 mt-4">
                <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-gray-50">
                    <span className="text-xs text-gray-600">Total Orders</span>
                    <span className="text-sm font-bold text-gray-900">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-amber-50">
                    <span className="text-xs text-amber-700">Pending</span>
                    <span className="text-sm font-bold text-amber-700">{pendingOrdersCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-green-50">
                    <span className="text-xs text-green-700">Completed</span>
                    <span className="text-sm font-bold text-green-700">
                      {orders.filter(o => o.status === OrderStatus.completed).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-blue-50">
                    <span className="text-xs text-blue-700">Recharge Req.</span>
                    <span className="text-sm font-bold text-blue-700">{rechargeOrders.length}</span>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {/* Mobile Tab Bar */}
              <div className="lg:hidden flex gap-1 mb-4 bg-white border border-gray-200 rounded-xl p-1 shadow-sm overflow-x-auto">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      activeTab === key
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                    {key === 'orders' && pendingOrdersCount > 0 && (
                      <span className={`inline-flex items-center justify-center w-4 h-4 text-xs rounded-full ${
                        activeTab === key ? 'bg-white text-primary' : 'bg-primary text-white'
                      }`}>
                        {pendingOrdersCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab: Products */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <AdminProductForm />
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <div>
                          <CardTitle className="text-base font-semibold text-gray-900">Product Inventory</CardTitle>
                          <CardDescription className="text-xs mt-0.5">Manage your product catalog</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <AdminProductList />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tab: Orders */}
              {activeTab === 'orders' && (
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <div>
                          <CardTitle className="text-base font-semibold text-gray-900">Customer Orders</CardTitle>
                          <CardDescription className="text-xs mt-0.5">Manage and track customer orders</CardDescription>
                        </div>
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
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
                  <CardContent className="p-0">
                    {ordersLoading ? (
                      <div className="p-6 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-14 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">No orders found</p>
                        <p className="text-xs text-gray-400 mt-1">Orders will appear here once placed</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-gray-600 py-3 pl-6">Order</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3">Customer</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3 hidden md:table-cell">Phone</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3 hidden lg:table-cell">Address</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3">Total</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3 hidden sm:table-cell">Payment</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3">Status</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3 pr-6">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredOrders.map((order) => (
                              <TableRow key={Number(order.id)} className="hover:bg-gray-50/60 border-b border-gray-100">
                                <TableCell className="py-3 pl-6">
                                  <span className="text-xs font-bold text-gray-900">#{Number(order.id)}</span>
                                </TableCell>
                                <TableCell className="py-3">
                                  <span className="text-xs font-medium text-gray-800">{order.customerName}</span>
                                </TableCell>
                                <TableCell className="py-3 hidden md:table-cell">
                                  <span className="text-xs text-gray-600">{order.phoneNumber}</span>
                                </TableCell>
                                <TableCell className="py-3 hidden lg:table-cell max-w-[160px]">
                                  <span className="text-xs text-gray-600 truncate block">{order.deliveryAddress}</span>
                                </TableCell>
                                <TableCell className="py-3">
                                  <span className="text-xs font-bold text-primary">₹{Number(order.totalPrice)}</span>
                                </TableCell>
                                <TableCell className="py-3 hidden sm:table-cell">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                    order.paymentMethod === PaymentMethod.upi
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}>
                                    {order.paymentMethod === PaymentMethod.upi ? 'UPI' : 'COD'}
                                  </span>
                                </TableCell>
                                <TableCell className="py-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                  </span>
                                </TableCell>
                                <TableCell className="py-3 pr-6">{getNextActionButton(order)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tab: Recharge */}
              {activeTab === 'recharge' && (
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-900">Mobile Recharge Orders</CardTitle>
                        <CardDescription className="text-xs mt-0.5">View and manage mobile recharge requests</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {rechargeLoading ? (
                      <div className="p-6 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-14 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : rechargeOrders.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Smartphone className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">No recharge orders</p>
                        <p className="text-xs text-gray-400 mt-1">Recharge requests will appear here</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-gray-600 py-3 pl-6">Order ID</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3">Mobile Number</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3">Operator</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-600 py-3 pr-6">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rechargeOrders.map((order) => (
                              <TableRow key={Number(order.id)} className="hover:bg-gray-50/60 border-b border-gray-100">
                                <TableCell className="py-3 pl-6">
                                  <span className="text-xs font-bold text-gray-900">#{Number(order.id)}</span>
                                </TableCell>
                                <TableCell className="py-3">
                                  <span className="text-xs font-medium text-gray-800">{order.mobileNumber}</span>
                                </TableCell>
                                <TableCell className="py-3">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                    {order.operator}
                                  </span>
                                </TableCell>
                                <TableCell className="py-3 pr-6">
                                  <span className="text-xs font-bold text-primary">₹{Number(order.rechargeAmount)}</span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tab: Bills */}
              {activeTab === 'bills' && (
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-900">Bill History</CardTitle>
                        <CardDescription className="text-xs mt-0.5">View and manage generated bills</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <BillHistoryTable />
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
