import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Product, CartItem, Order, RechargeOrder, Bill, BillItem, PaymentMethod, UnitType } from '../backend';
import { ExternalBlob } from '../backend';

// Products
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductByBarcode(barcode: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', barcode],
    queryFn: async () => {
      if (!actor || !barcode) return null;
      return actor.getProductByBarcode(barcode);
    },
    enabled: !!actor && !isFetching && !!barcode,
  });
}

// Cart
export function useGetCart() {
  const { actor, isFetching } = useActor();

  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCart();
      } catch (error) {
        // User not authenticated or no cart
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useCalculateTotalPrice() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (distanceInKm: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.calculateTotalPrice(distanceInKm);
    },
  });
}

// Orders
export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerName,
      deliveryAddress,
      phoneNumber,
      distanceInKm,
      paymentMethod,
    }: {
      customerName: string;
      deliveryAddress: string;
      phoneNumber: string;
      distanceInKm: bigint;
      paymentMethod: PaymentMethod;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.placeOrder(customerName, deliveryAddress, phoneNumber, distanceInKm, paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllOrders();
      } catch (error) {
        console.error('[useGetAllOrders] Error fetching orders:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Order Status Updates
export function useConfirmOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.confirmOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useMarkAsPacked() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markAsPacked(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useMarkAsOutForDelivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markAsOutForDelivery(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Refresh products so stock deductions are reflected
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useMarkAsCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markAsCompleted(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Refresh products so stock deductions are reflected
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Recharge Orders
export function usePlaceRechargeOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mobileNumber,
      operator,
      rechargeAmount,
    }: {
      mobileNumber: string;
      operator: string;
      rechargeAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.placeRechargeOrder(mobileNumber, operator, rechargeAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rechargeOrders'] });
    },
  });
}

export function useGetAllRechargeOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<RechargeOrder[]>({
    queryKey: ['rechargeOrders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllRechargeOrders();
      } catch (error) {
        console.error('[useGetAllRechargeOrders] Error fetching recharge orders:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin - Products
export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      category,
      priceInRupees,
      image,
      barcode,
      unitType,
      stock,
    }: {
      name: string;
      category: string;
      priceInRupees: bigint;
      image: ExternalBlob;
      barcode: string;
      unitType: UnitType;
      stock: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const productId = await actor.addProduct(name, category, priceInRupees, image, barcode, unitType, stock);
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useRemoveProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, newStock }: { productId: bigint; newStock: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProductStock(productId, newStock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Admin Check
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) {
        console.log('[useIsCallerAdmin] Actor not available');
        return false;
      }
      if (!identity) {
        console.log('[useIsCallerAdmin] Identity not available');
        return false;
      }
      
      console.log('[useIsCallerAdmin] Checking admin status for principal:', identity.getPrincipal().toString());
      
      try {
        const result = await actor.isAdmin();
        console.log('[useIsCallerAdmin] Admin check result:', result);
        return result;
      } catch (error) {
        console.error('[useIsCallerAdmin] Error checking admin status:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !isInitializing,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    ...query,
    // Ensure loading state reflects all dependencies
    isLoading: actorFetching || isInitializing || query.isLoading,
  };
}

// Bills
export function useGenerateBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerName,
      customerPhone,
      items,
      totalAmount,
    }: {
      customerName: string | null;
      customerPhone: string | null;
      items: BillItem[];
      totalAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.generateBill(customerName, customerPhone, items, totalAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useGetAllBills() {
  const { actor, isFetching } = useActor();

  return useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBills();
      } catch (error) {
        console.error('[useGetAllBills] Error fetching bills:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Shop Slogan
export function useGetShopSlogan() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['shopSlogan'],
    queryFn: async () => {
      if (!actor) return 'Welcome to our shop!';
      return actor.getShopSlogan();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetShopSlogan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slogan: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setShopSlogan(slogan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopSlogan'] });
    },
  });
}

// Excluded Products
export function useGetExcludedProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['excludedProducts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getExcludedProducts();
      } catch (error) {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useToggleProductExclusion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.toggleProductExclusion(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['excludedProducts'] });
    },
  });
}

// Shop Open/Close Status with localStorage caching
const SHOP_STATUS_CACHE_KEY = 'mbg-shop-status';

interface ShopStatusCache {
  isOpen: boolean;
  timestamp: number;
}

function getCachedShopStatus(): boolean | null {
  try {
    const cached = localStorage.getItem(SHOP_STATUS_CACHE_KEY);
    if (!cached) return null;
    
    const data: ShopStatusCache = JSON.parse(cached);
    return data.isOpen;
  } catch (error) {
    console.error('[getCachedShopStatus] Error reading cache:', error);
    return null;
  }
}

function setCachedShopStatus(isOpen: boolean): void {
  try {
    const data: ShopStatusCache = {
      isOpen,
      timestamp: Date.now(),
    };
    localStorage.setItem(SHOP_STATUS_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[setCachedShopStatus] Error writing cache:', error);
  }
}

export function useGetShopOpenStatus() {
  const { actor, isFetching } = useActor();
  const cachedStatus = getCachedShopStatus();

  return useQuery<boolean>({
    queryKey: ['shopStatus'],
    queryFn: async () => {
      if (!actor) {
        // Return cached value if available, otherwise default to true
        return cachedStatus !== null ? cachedStatus : true;
      }
      const status = await actor.getShopOpenStatus();
      // Update cache after successful fetch
      setCachedShopStatus(status);
      return status;
    },
    enabled: !!actor && !isFetching,
    // Use cached value as initial data to prevent flashing
    initialData: cachedStatus !== null ? cachedStatus : undefined,
    // Keep data fresh
    staleTime: 5000,
    refetchInterval: 10000, // Refetch every 10 seconds to keep status updated
  });
}

export function useSetShopOpenStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.setShopOpenStatus(status);
    },
    onSuccess: (newStatus) => {
      // Update cache immediately
      setCachedShopStatus(newStatus);
      queryClient.invalidateQueries({ queryKey: ['shopStatus'] });
    },
  });
}
