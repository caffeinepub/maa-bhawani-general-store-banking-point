import React, { useState } from 'react';
import { useGetAllOrders, useGetAllRechargeOrders, useConfirmOrder, useMarkAsPacked, useMarkAsOutForDelivery, useMarkAsCompleted, useShopStatus } from '../hooks/useQueries';
import { Order, OrderStatus } from '../backend';
import AdminProductList from '../components/AdminProductList';
import AdminProductForm from '../components/AdminProductForm';
import BillHistoryTable from '../components/BillHistoryTable';
import ShopStatusToggle from '../components/ShopStatusToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Package, ShoppingBag, Users, Store, RefreshCw } from 'lucide-react';

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.pending: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case OrderStatus.confirmed: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case OrderStatus.packed: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case OrderStatus.out_for_delivery: return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case OrderStatus.completed: return 'bg-green-500/20 text-green-300 border-green-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.pending: return 'Pending';
    case OrderStatus.confirmed: return 'Confirmed';
    case OrderStatus.packed: return 'Packed';
    case OrderStatus.out_for_delivery: return 'Out for Delivery';
    case OrderStatus.completed: return 'Completed';
    default: return 'Unknown';
  }
}

interface OrderRowProps {
  order: Order;
}

function OrderRow({ order }: OrderRowProps) {
  const confirmMutation = useConfirmOrder();
  const packMutation = useMarkAsPacked();
  const deliveryMutation = useMarkAsOutForDelivery();
  const completeMutation = useMarkAsCompleted();

  const [rowError, setRowError] = useState<string | null>(null);

  const isAnyPending =
    confirmMutation.isPending ||
    packMutation.isPending ||
    deliveryMutation.isPending ||
    completeMutation.isPending;

  const handleAction = async (action: () => Promise<void>) => {
    setRowError(null);
    try {
      await action();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status';
      setRowError(msg);
    }
  };

  const timestamp = new Date(Number(order.timestamp) / 1_000_000);

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold">Order #{order.id.toString()}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
              {order.paymentMethod === 'upi' ? '💳 UPI' : '💵 COD'}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">{order.customerName} · {order.phoneNumber}</p>
          <p className="text-slate-500 text-xs">{order.deliveryAddress}</p>
          <p className="text-slate-500 text-xs">{timestamp.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-lg">₹{order.totalPrice.toString()}</p>
          <p className="text-slate-400 text-xs">{order.products.length} item(s)</p>
        </div>
      </div>

      {rowError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Failed to update order status: {rowError}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        {order.status === OrderStatus.pending && (
          <Button
            size="sm"
            onClick={() => handleAction(() => confirmMutation.mutateAsync(order.id))}
            disabled={isAnyPending}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
          >
            {confirmMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Confirm Order
          </Button>
        )}
        {order.status === OrderStatus.confirmed && (
          <Button
            size="sm"
            onClick={() => handleAction(() => packMutation.mutateAsync(order.id))}
            disabled={isAnyPending}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7"
          >
            {packMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Mark as Packed
          </Button>
        )}
        {order.status === OrderStatus.packed && (
          <Button
            size="sm"
            onClick={() => handleAction(() => deliveryMutation.mutateAsync(order.id))}
            disabled={isAnyPending}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-7"
          >
            {deliveryMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Out for Delivery
          </Button>
        )}
        {order.status === OrderStatus.out_for_delivery && (
          <Button
            size="sm"
            onClick={() => handleAction(() => completeMutation.mutateAsync(order.id))}
            disabled={isAnyPending}
            className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
          >
            {completeMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Mark as Completed
          </Button>
        )}
        {order.status === OrderStatus.completed && (
          <span className="text-green-400 text-xs font-medium">✓ Order Completed</span>
        )}
      </div>

      {order.products.length > 0 && (
        <div className="text-xs text-slate-400 border-t border-slate-700 pt-2">
          <span className="font-medium text-slate-300">Items: </span>
          {order.products.map((p) => p.name).join(', ')}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useGetAllOrders();
  const { data: rechargeOrders, isLoading: rechargeLoading } = useGetAllRechargeOrders();
  const shopStatusQuery = useShopStatus();

  const totalOrders = orders?.length ?? 0;
  const activeOrders = orders?.filter(
    (o) => o.status !== OrderStatus.completed
  ).length ?? 0;
  const isShopOpen = shopStatusQuery.data ?? true;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Maa Bhawani General Store</p>
          </div>
          <button
            onClick={() => refetchOrders()}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Total Orders</p>
                <p className="text-white font-bold text-xl">{totalOrders}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Active Orders</p>
                <p className="text-white font-bold text-xl">{activeOrders}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isShopOpen ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <Store className={`h-5 w-5 ${isShopOpen ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Shop Status</p>
                <p className={`font-bold text-lg ${isShopOpen ? 'text-green-400' : 'text-red-400'}`}>
                  {isShopOpen ? 'Open' : 'Closed'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
              Orders {activeOrders > 0 && <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5">{activeOrders}</span>}
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
              Products
            </TabsTrigger>
            <TabsTrigger value="recharge" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
              Recharge
            </TabsTrigger>
            <TabsTrigger value="bills" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
              Bills
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-xs sm:text-sm">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-400" />
                  All Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full bg-slate-800 rounded-lg" />)}
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...orders].reverse().map((order) => (
                      <OrderRow key={order.id.toString()} order={order} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminProductForm />
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Product Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminProductList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recharge Tab */}
          <TabsContent value="recharge">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Recharge Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {rechargeLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full bg-slate-800 rounded-lg" />)}
                  </div>
                ) : !rechargeOrders || rechargeOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="font-medium">No recharge orders yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="px-4 py-3 text-left">ID</th>
                          <th className="px-4 py-3 text-left">Mobile</th>
                          <th className="px-4 py-3 text-left">Operator</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {[...rechargeOrders].reverse().map((ro) => (
                          <tr key={ro.id.toString()} className="bg-slate-900 hover:bg-slate-800/50">
                            <td className="px-4 py-3 text-slate-300">#{ro.id.toString()}</td>
                            <td className="px-4 py-3 text-white font-medium">{ro.mobileNumber}</td>
                            <td className="px-4 py-3 text-slate-300">{ro.operator}</td>
                            <td className="px-4 py-3 text-green-400 font-bold">₹{ro.rechargeAmount.toString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills">
            <BillHistoryTable />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Store className="h-5 w-5 text-blue-400" />
                  Shop Status Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">
                  Toggle the shop open or closed. When closed, customers cannot place new orders.
                  Changes are saved immediately to the database.
                </p>
                <ShopStatusToggle />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
