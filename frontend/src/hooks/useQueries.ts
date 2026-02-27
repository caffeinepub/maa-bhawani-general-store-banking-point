import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { CartItem, Product, BillItem, Bill, Order, RechargeOrder, PaymentMethod, PaymentStatus, UnitType } from '../backend';
import { ExternalBlob } from '../backend';

// ─── Products ────────────────────────────────────────────────────────────────

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

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      category: string;
      priceInRupees: bigint;
      image: ExternalBlob;
      barcode: string;
      unitType: UnitType;
      stock: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(
        params.name,
        params.category,
        params.priceInRupees,
        params.image,
        params.barcode,
        params.unitType,
        params.stock
      );
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
      return actor.removeProduct(productId);
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
      return actor.updateProductStock(productId, newStock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useToggleProductExclusion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleProductExclusion(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['excludedProducts'] });
    },
  });
}

export function useGetExcludedProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ['excludedProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExcludedProducts();
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

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function useGetCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCart();
      } catch {
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
      return actor.addToCart(productId, quantity);
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
      return actor.clearCart();
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
      return actor.calculateTotalPrice(distanceInKm);
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllOrders();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerName: string;
      deliveryAddress: string;
      phoneNumber: string;
      distanceInKm: bigint;
      paymentMethod: PaymentMethod;
      latitude: number | null;
      longitude: number | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(
        params.customerName,
        params.deliveryAddress,
        params.phoneNumber,
        params.distanceInKm,
        params.paymentMethod,
        params.latitude,
        params.longitude
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useConfirmOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmOrder(orderId);
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
      return actor.markAsPacked(orderId);
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
      return actor.markAsOutForDelivery(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useMarkAsCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAsCompleted(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ─── Recharge Orders ──────────────────────────────────────────────────────────

export function usePlaceRechargeOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      mobileNumber: string;
      operator: string;
      rechargeAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeRechargeOrder(
        params.mobileNumber,
        params.operator,
        params.rechargeAmount
      );
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
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Check ──────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      if (!identity) return false;
      try {
        return await actor.isAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !isInitializing,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || isInitializing || query.isLoading,
  };
}

// ─── Shop Status ──────────────────────────────────────────────────────────────

/**
 * Fetches the current shop open/closed status from the backend.
 * staleTime=0 ensures every mount triggers a fresh backend call — no stale cache.
 * The backend returns a plain boolean: true = open, false = closed.
 */
export function useGetShopStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['shopStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getShopStatus();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Keep legacy alias so existing components that import useGetShopOpenStatus still work
export const useGetShopOpenStatus = useGetShopStatus;

/**
 * Mutation to set shop open/closed status.
 * Accepts a boolean: true = open, false = closed.
 * NO optimistic update — UI only changes after server confirms.
 * On success: invalidates shopStatus query to trigger a fresh fetch.
 * On error: query cache is untouched, so UI stays at last server-confirmed state.
 */
export function useToggleShopStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (open: boolean): Promise<boolean> => {
      if (!actor) throw new Error('Actor not available');
      // setShopStatus returns the confirmed saved value from the backend
      const confirmed = await actor.setShopStatus(open);
      return confirmed;
    },
    onSuccess: () => {
      // Invalidate and refetch from backend — no optimistic cache write
      queryClient.invalidateQueries({ queryKey: ['shopStatus'] });
    },
    // No onMutate — no optimistic updates
  });
}

// Legacy aliases for backward compatibility with AdminSettingsPage and other components
export const useSetShopOpenStatus = useToggleShopStatus;

/**
 * Emergency close mutation — accepts a boolean directly.
 * Used by AdminSettingsPage emergency close button.
 */
export function useSetShopStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: boolean): Promise<boolean> => {
      if (!actor) throw new Error('Actor not available');
      return actor.setShopStatus(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopStatus'] });
    },
  });
}

// ─── Shop Slogan ──────────────────────────────────────────────────────────────

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
      return actor.setShopSlogan(slogan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopSlogan'] });
    },
  });
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export function useGetAllBills() {
  const { actor, isFetching } = useActor();
  return useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBills();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerName: string | null;
      customerPhone: string | null;
      items: BillItem[];
      totalAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateBill(
        params.customerName,
        params.customerPhone,
        params.items,
        params.totalAmount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useUpdateBillPaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      billId: bigint;
      paymentStatus: PaymentStatus;
      paymentReference: string | null;
      paymentGatewayId: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBillPaymentStatus(
        params.billId,
        params.paymentStatus,
        params.paymentReference,
        params.paymentGatewayId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

// ─── Store UPI ────────────────────────────────────────────────────────────────

export function useGetStoreUpiId() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ['storeUpiId'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStoreUpiId();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStoreUpiId() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (upiId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStoreUpiId(upiId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeUpiId'] });
    },
  });
}

// ─── Barcode helpers ──────────────────────────────────────────────────────────

export function useAddProductByBarcode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ barcode, quantity }: { barcode: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProductByBarcode(barcode, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
