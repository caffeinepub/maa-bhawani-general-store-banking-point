import React from 'react';
import { ShoppingBag, Clock, CheckCircle, Package, Truck, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllOrders } from '../hooks/useQueries';
import { OrderStatus } from '../backend';

function statusConfig(status: OrderStatus) {
  switch (status) {
    case OrderStatus.pending:
      return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
    case OrderStatus.confirmed:
      return { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle };
    case OrderStatus.packed:
      return { label: 'Packed', color: 'bg-purple-100 text-purple-700', icon: Package };
    case OrderStatus.out_for_delivery:
      return { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700', icon: Truck };
    case OrderStatus.completed:
      return { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
  }
}

function formatDate(timestamp: bigint) {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyOrdersPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: allOrders, isLoading, isError } = useGetAllOrders();

  // Filter orders by current user's phone — we can't filter by principal on the backend
  // so we show all orders for authenticated admins, or prompt login for guests
  const orders = allOrders ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            My Orders
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your order history</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Not logged in */}
        {!isAuthenticated && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Sign in to view orders</h3>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              Please log in using the Login button in the header to view your order history.
            </p>
          </div>
        )}

        {/* Loading */}
        {isAuthenticated && isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {isAuthenticated && isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-gray-600 font-medium">Could not load orders</p>
            <p className="text-gray-400 text-sm mt-1">
              Order history requires admin access. Please contact the store.
            </p>
          </div>
        )}

        {/* Empty */}
        {isAuthenticated && !isLoading && !isError && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600">No orders yet</h3>
            <p className="text-gray-400 text-sm mt-1">
              Your orders will appear here once you place them.
            </p>
          </div>
        )}

        {/* Orders list */}
        {isAuthenticated && !isLoading && !isError && orders.length > 0 && (
          <>
            <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
            {[...orders].reverse().map((order) => {
              const { label, color, icon: Icon } = statusConfig(order.status);
              return (
                <Card key={order.id.toString()} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Order #{order.id.toString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(order.timestamp)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
                        <Icon className="w-3 h-3" />
                        {label}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3">
                      {order.products.slice(0, 3).map((p, i) => (
                        <p key={i} className="text-xs text-gray-600">
                          • {p.name} × 1
                        </p>
                      ))}
                      {order.products.length > 3 && (
                        <p className="text-xs text-gray-400">
                          +{order.products.length - 3} more items
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        {order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{order.totalPrice.toString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
