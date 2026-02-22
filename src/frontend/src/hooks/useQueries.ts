import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Product, CartItem, Order, RechargeOrder, Bill, BillItem } from '../backend';
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
    }: {
      customerName: string;
      deliveryAddress: string;
      phoneNumber: string;
      distanceInKm: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.placeOrder(customerName, deliveryAddress, phoneNumber, distanceInKm);
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
        return [];
      }
    },
    enabled: !!actor && !isFetching,
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
    }: {
      name: string;
      category: string;
      priceInRupees: bigint;
      image: ExternalBlob;
      barcode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addProduct(name, category, priceInRupees, image, barcode);
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
        const result = await actor.isCallerAdmin();
        console.log('[useIsCallerAdmin] Admin check result:', result);
        return result;
      } catch (error) {
        console.error('[useIsCallerAdmin] Error checking admin status:', error);
        return false;
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
      return await actor.getShopSlogan();
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
