import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminGuard from '../components/AdminGuard';
import AdminProductForm from '../components/AdminProductForm';
import AdminProductList from '../components/AdminProductList';
import { useGetAllOrders, useGetAllRechargeOrders } from '../hooks/useQueries';
import { Package, Smartphone } from 'lucide-react';

export default function AdminPage() {
  const { data: orders = [] } = useGetAllOrders();
  const { data: rechargeOrders = [] } = useGetAllRechargeOrders();

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your store products and view orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recharge Orders</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rechargeOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <span className="text-2xl">₹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{orders.reduce((sum, order) => sum + Number(order.totalPrice), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="recharge">Recharge Orders</TabsTrigger>
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
        </Tabs>
      </div>
    </AdminGuard>
  );
}
