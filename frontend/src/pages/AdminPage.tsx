import { useState } from 'react';
import { useGetAllOrders, useGetShopStatus, useGetAllProducts } from '../hooks/useQueries';
import AdminProductList from '../components/AdminProductList';
import AdminProductForm from '../components/AdminProductForm';
import ShopStatusToggle from '../components/ShopStatusToggle';
import BillHistoryTable from '../components/BillHistoryTable';
import AdminSettingsPage from './AdminSettingsPage';
import {
  ShoppingBag,
  Users,
  Store,
  Package,
  ClipboardList,
  Settings,
  Receipt,
  MapPin,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type AdminTab = 'orders' | 'products' | 'settings' | 'bills';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  packed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  out_for_delivery: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className={`bg-slate-800 rounded-xl p-4 border ${accent} flex items-center gap-4`}>
      <div className={`p-2 rounded-lg ${accent.replace('border-', 'bg-').replace('/30', '/20')}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white text-xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'batch'>('all');

  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: isOpen } = useGetShopStatus();
  const { data: products = [] } = useGetAllProducts();

  const activeOrders = orders.filter(
    (o) => o.status !== 'completed'
  );

  // Unique customers (by phone number)
  const uniqueCustomers = new Set(orders.map((o) => o.phoneNumber)).size;

  // Batch routing: group active orders by delivery address
  const batchGroups = activeOrders.reduce<Record<string, typeof activeOrders>>((acc, order) => {
    const key = order.deliveryAddress.trim().toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'orders', label: 'Orders', icon: <ClipboardList size={16} /> },
    { id: 'products', label: 'Products', icon: <Package size={16} /> },
    { id: 'bills', label: 'Bills', icon: <Receipt size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  const displayedOrders =
    orderFilter === 'all' ? orders : orderFilter === 'active' ? activeOrders : activeOrders;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={22} className="text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">Manage your store</p>
            </div>
          </div>
          <ShopStatusToggle />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<ShoppingBag size={20} className="text-blue-400" />}
            label="Total Orders"
            value={ordersLoading ? '…' : orders.length}
            accent="border-blue-500/30"
          />
          <StatCard
            icon={<Users size={20} className="text-purple-400" />}
            label="Active Users"
            value={ordersLoading ? '…' : uniqueCustomers}
            accent="border-purple-500/30"
          />
          <StatCard
            icon={<Store size={20} className={isOpen ? 'text-emerald-400' : 'text-red-400'} />}
            label="Shop Status"
            value={
              <span className={isOpen ? 'text-emerald-400' : 'text-red-400'}>
                {isOpen === undefined ? '…' : isOpen ? 'Open' : 'Closed'}
              </span>
            }
            accent={isOpen ? 'border-emerald-500/30' : 'border-red-500/30'}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order sub-tabs */}
              <div className="flex gap-2">
                {(['all', 'active', 'batch'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      orderFilter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {f === 'batch' ? 'Batch Routing' : f === 'all' ? 'All Orders' : 'Active'}
                  </button>
                ))}
              </div>

              {ordersLoading ? (
                <div className="text-slate-400 text-sm py-8 text-center">Loading orders…</div>
              ) : orderFilter === 'batch' ? (
                /* Batch Routing View */
                <div className="space-y-3">
                  {Object.entries(batchGroups).length === 0 ? (
                    <div className="text-slate-400 text-sm py-8 text-center">
                      No active orders to batch.
                    </div>
                  ) : (
                    <Accordion type="multiple" className="space-y-2">
                      {Object.entries(batchGroups).map(([address, groupOrders]) => (
                        <AccordionItem
                          key={address}
                          value={address}
                          className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 text-sm font-medium text-white hover:no-underline hover:bg-slate-700">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-blue-400 shrink-0" />
                              <span className="text-left">{address}</span>
                              <span className="ml-auto mr-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {groupOrders.length} order{groupOrders.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 space-y-2">
                            {groupOrders.map((order) => (
                              <div
                                key={order.id.toString()}
                                className="bg-slate-700/50 rounded-lg p-3 text-sm"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-white">{order.customerName}</p>
                                    <p className="text-slate-400 text-xs">{order.phoneNumber}</p>
                                  </div>
                                  <span className="text-primary font-bold">
                                    ₹{order.totalPrice.toString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-3">
                  {displayedOrders.length === 0 ? (
                    <div className="text-slate-400 text-sm py-8 text-center">No orders found.</div>
                  ) : (
                    displayedOrders.map((order) => (
                      <div
                        key={order.id.toString()}
                        className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-white">
                              #{order.id.toString()} — {order.customerName}
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5">{order.phoneNumber}</p>
                            <p className="text-slate-400 text-xs">{order.deliveryAddress}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                ORDER_STATUS_COLORS[order.status] ?? 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {ORDER_STATUS_LABELS[order.status] ?? order.status}
                            </span>
                            <span className="text-primary font-bold text-sm">
                              ₹{order.totalPrice.toString()}
                            </span>
                          </div>
                        </div>

                        {/* Products */}
                        <div className="text-xs text-slate-400 space-y-0.5">
                          {order.products.map((p, i) => (
                            <span key={i} className="inline-block mr-2">
                              {p.name}
                            </span>
                          ))}
                        </div>

                        {/* GPS */}
                        {order.latitude != null && order.longitude != null && (
                          <a
                            href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <MapPin size={12} />
                            View on Maps
                          </a>
                        )}

                        {/* Payment */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Payment:</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium ${
                              order.paymentMethod === 'upi'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-slate-600 text-slate-300'
                            }`}
                          >
                            {order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Package size={16} className="text-blue-400" />
                  Add New Product
                </h2>
                <AdminProductForm />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <ClipboardList size={16} className="text-blue-400" />
                  Product Inventory
                </h2>
                <AdminProductList />
              </div>
            </div>
          )}

          {/* Bills Tab */}
          {activeTab === 'bills' && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Receipt size={16} className="text-blue-400" />
                Bill History
              </h2>
              <BillHistoryTable />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <AdminSettingsPage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
