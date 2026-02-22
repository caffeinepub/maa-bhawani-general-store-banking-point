import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminGuard from '../components/AdminGuard';
import AdminProductForm from '../components/AdminProductForm';
import AdminProductList from '../components/AdminProductList';
import BillHistoryTable from '../components/BillHistoryTable';
import ErrorBoundary from '../components/ErrorBoundary';
import { useGetAllOrders, useGetAllRechargeOrders, useGetAllBills, useGetAllProducts } from '../hooks/useQueries';
import { Package, Smartphone, Receipt, Settings, FileText } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function AdminPage() {
  const { data: orders = [], error: ordersError } = useGetAllOrders();
  const { data: rechargeOrders = [], error: rechargeError } = useGetAllRechargeOrders();
  const { data: bills = [], error: billsError } = useGetAllBills();
  const { data: products = [], error: productsError } = useGetAllProducts();
  const navigate = useNavigate();

  // Log any errors for debugging
  if (ordersError) console.error('[AdminPage] Orders error:', ordersError);
  if (rechargeError) console.error('[AdminPage] Recharge orders error:', rechargeError);
  if (billsError) console.error('[AdminPage] Bills error:', billsError);
  if (productsError) console.error('[AdminPage] Products error:', productsError);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
  const billRevenue = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

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
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={Number(order.id)} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">Order #{Number(order.id)}</p>
                              <p className="text-sm text-muted-foreground">{order.customerName}</p>
                              <p className="text-sm text-muted-foreground">{order.phoneNumber}</p>
                            </div>
                            <p className="font-bold text-lg">₹{Number(order.totalPrice)}</p>
                          </div>
                          <p className="text-sm">{order.deliveryAddress}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.products.length} item(s)
                          </p>
                        </div>
                      ))}
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
