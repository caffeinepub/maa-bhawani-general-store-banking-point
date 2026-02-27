import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Package, ShoppingBag, Settings, BarChart3, LogOut, Menu, X,
  MapPin, Clock, Phone, User, ChevronDown, ChevronRight, Route,
  AlertCircle, CheckCircle, Truck, PackageCheck, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  useGetAllOrders,
  useGetAllProducts,
  useGetShopOpenStatus,
  useConfirmOrder,
  useMarkAsPacked,
  useMarkAsOutForDelivery,
  useMarkAsCompleted,
} from '../hooks/useQueries';
import { Order, OrderStatus } from '../backend';
import AdminProductList from '../components/AdminProductList';
import AdminProductForm from '../components/AdminProductForm';
import ShopStatusToggle from '../components/ShopStatusToggle';
import BillHistoryTable from '../components/BillHistoryTable';
import AdminSettingsPage from './AdminSettingsPage';

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.pending: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case OrderStatus.confirmed: return 'bg-blue-100 text-blue-800 border-blue-200';
    case OrderStatus.packed: return 'bg-purple-100 text-purple-800 border-purple-200';
    case OrderStatus.out_for_delivery: return 'bg-orange-100 text-orange-800 border-orange-200';
    case OrderStatus.completed: return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

function OrderCard({ order }: { order: Order }) {
  const confirmOrder = useConfirmOrder();
  const markAsPacked = useMarkAsPacked();
  const markAsOutForDelivery = useMarkAsOutForDelivery();
  const markAsCompleted = useMarkAsCompleted();

  const hasGPS = order.latitude != null && order.longitude != null;

  const handleViewOnMaps = () => {
    if (hasGPS) {
      window.open(`https://maps.google.com/?q=${order.latitude},${order.longitude}`, '_blank');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      switch (order.status) {
        case OrderStatus.pending:
          await confirmOrder.mutateAsync(order.id);
          toast.success('Order confirmed!');
          break;
        case OrderStatus.confirmed:
          await markAsPacked.mutateAsync(order.id);
          toast.success('Order marked as packed!');
          break;
        case OrderStatus.packed:
          await markAsOutForDelivery.mutateAsync(order.id);
          toast.success('Order out for delivery!');
          break;
        case OrderStatus.out_for_delivery:
          await markAsCompleted.mutateAsync(order.id);
          toast.success('Order completed!');
          break;
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update order status');
    }
  };

  const getNextAction = () => {
    switch (order.status) {
      case OrderStatus.pending: return 'Confirm Order';
      case OrderStatus.confirmed: return 'Mark as Packed';
      case OrderStatus.packed: return 'Out for Delivery';
      case OrderStatus.out_for_delivery: return 'Mark Completed';
      default: return null;
    }
  };

  const nextAction = getNextAction();
  const isUpdating = confirmOrder.isPending || markAsPacked.isPending || markAsOutForDelivery.isPending || markAsCompleted.isPending;

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Order #{Number(order.id)}</span>
              <Badge className={`text-xs border ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(Number(order.timestamp) / 1_000_000).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {hasGPS && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewOnMaps}
                className="h-7 text-xs flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <MapPin className="w-3 h-3" />
                View on Maps
              </Button>
            )}
            {nextAction && (
              <Button
                size="sm"
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="h-7 text-xs"
              >
                {isUpdating ? (
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : nextAction}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{order.customerName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>{order.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-1 sm:col-span-2">
            <MapPin className="w-3 h-3" />
            <span>{order.deliveryAddress}</span>
          </div>
        </div>

        <div className="border-t pt-2">
          <p className="text-xs font-medium text-foreground mb-1">Items:</p>
          <div className="space-y-0.5">
            {order.products.map((product, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {product.name}</p>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              Payment: {order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
            </span>
            <span className="text-sm font-bold text-primary">₹{Number(order.totalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BatchRoutingView({ orders }: { orders: Order[] }) {
  const pendingOrders = orders.filter(o => o.status === OrderStatus.pending);

  // Group by delivery address
  const grouped = pendingOrders.reduce<Record<string, Order[]>>((acc, order) => {
    const area = order.deliveryAddress.trim() || 'Unknown Location';
    if (!acc[area]) acc[area] = [];
    acc[area].push(order);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped);

  if (pendingOrders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Route className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No pending orders</p>
        <p className="text-sm">All orders have been processed!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
          <Route className="w-4 h-4" />
          Batch Routing — {pendingOrders.length} pending order{pendingOrders.length !== 1 ? 's' : ''} across {groupEntries.length} location{groupEntries.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-blue-600 mt-1">Orders are grouped by delivery address to help you plan one trip per route.</p>
      </div>

      <Accordion type="multiple" defaultValue={groupEntries.map(([key]) => key)} className="space-y-2">
        {groupEntries.map(([area, areaOrders]) => (
          <AccordionItem key={area} value={area} className="border border-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{area}</p>
                  <p className="text-xs text-muted-foreground">{areaOrders.length} order{areaOrders.length !== 1 ? 's' : ''}</p>
                </div>
                <Badge className="ml-auto mr-2 bg-primary/10 text-primary border-0 text-xs">
                  ₹{areaOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0)} total
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                {areaOrders.map((order) => (
                  <div key={Number(order.id)} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Order #{Number(order.id)}</span>
                      <div className="flex items-center gap-2">
                        {order.latitude != null && order.longitude != null && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://maps.google.com/?q=${order.latitude},${order.longitude}`, '_blank')}
                            className="h-6 text-xs px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            Maps
                          </Button>
                        )}
                        <span className="text-sm font-bold text-primary">₹{Number(order.totalPrice)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="flex items-center gap-1"><User className="w-3 h-3" /> {order.customerName}</p>
                      <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phoneNumber}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-medium mb-1">Items:</p>
                      {order.products.map((p, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {p.name}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ordersTab, setOrdersTab] = useState('all');

  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: products = [] } = useGetAllProducts();

  // Force fresh shop status fetch
  useGetShopOpenStatus();

  const pendingOrders = orders.filter(o => o.status === OrderStatus.pending);
  const activeOrders = orders.filter(o => o.status !== OrderStatus.completed);

  const navItems = [
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrders.length },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'billing', label: 'Billing', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminAuthTime');
    navigate({ to: '/admin' });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Orders</h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {pendingOrders.length} pending
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {orders.length} total
                </Badge>
              </div>
            </div>

            <Tabs value={ordersTab} onValueChange={setOrdersTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="routing" className="flex items-center gap-1">
                  <Route className="w-3 h-3" />
                  Batch Routing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {ordersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...orders].reverse().map((order) => (
                      <OrderCard key={Number(order.id)} order={order} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="mt-4">
                {activeOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No active orders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeOrders.map((order) => (
                      <OrderCard key={Number(order.id)} order={order} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="routing" className="mt-4">
                <BatchRoutingView orders={orders} />
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Products</h2>
            <AdminProductForm />
            <AdminProductList />
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Billing</h2>
            <BillHistoryTable />
          </div>
        );

      case 'settings':
        return <AdminSettingsPage />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-card border-r border-border shrink-0">
        <div className="p-4 border-b border-border">
          <h1 className="font-bold text-foreground text-sm">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Maa Bhawani Store</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <Badge className="ml-auto text-xs h-5 min-w-5 flex items-center justify-center bg-destructive text-destructive-foreground">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <ShopStatusToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-sm">Admin Panel</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-14">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <Badge className="ml-auto text-xs bg-destructive text-destructive-foreground">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              <ShopStatusToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:p-6 p-4 pt-16 md:pt-6">
        {renderContent()}
      </main>
    </div>
  );
}
