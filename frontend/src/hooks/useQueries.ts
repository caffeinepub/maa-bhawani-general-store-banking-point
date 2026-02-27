import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, Order, RechargeOrder, Bill, BillItem, CartItem, UnitType, PaymentMethod, PaymentStatus, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Admin Check ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Shop Status ─────────────────────────────────────────────────────────────

export function useShopStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['shopStatus'],
    queryFn: async () => {
      if (!actor) return true;
      return actor.getShopStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

// Legacy aliases — kept for backward compatibility with existing components
export const useGetShopStatus = useShopStatus;
export const useGetShopOpenStatus = useShopStatus;

export function useSetShopStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, boolean>({
    mutationFn: async (status: boolean) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.setShopStatus(status);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopStatus'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update shop status:', error.message);
      queryClient.invalidateQueries({ queryKey: ['shopStatus'] });
    },
  });
}

// Legacy alias for backward compatibility
export const useSetShopOpenStatus = useSetShopStatus;
export const useToggleShopStatus = useSetShopStatus;

// ─── Products ─────────────────────────────────────────────────────────────────

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
  return useMutation<bigint, Error, {
    name: string;
    category: string;
    priceInRupees: bigint;
    image: ExternalBlob;
    barcode: string;
    unitType: UnitType;
    stock: bigint;
  }>({
    mutationFn: async ({ name, category, priceInRupees, image, barcode, unitType, stock }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(name, category, priceInRupees, image, barcode, unitType, stock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      console.error('Failed to add product:', error.message);
    },
  });
}

export function useUpdateProductStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { productId: bigint; newStock: bigint }>({
    mutationFn: async ({ productId, newStock }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProductStock(productId, newStock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update product stock:', error.message);
    },
  });
}

export function useRemoveProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) => {
      console.error('Failed to remove product:', error.message);
    },
  });
}

export function useToggleProductExclusion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleProductExclusion(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['excludedProducts'] });
    },
    onError: (error: Error) => {
      console.error('Failed to toggle product exclusion:', error.message);
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

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function useGetCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { productId: bigint; quantity: bigint }>({
    mutationFn: async ({ productId, quantity }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      console.error('Failed to add to cart:', error.message);
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      console.error('Failed to clear cart:', error.message);
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
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, {
    customerName: string;
    deliveryAddress: string;
    phoneNumber: string;
    distanceInKm: bigint;
    paymentMethod: PaymentMethod;
    latitude: number | null;
    longitude: number | null;
  }>({
    mutationFn: async ({ customerName, deliveryAddress, phoneNumber, distanceInKm, paymentMethod, latitude, longitude }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(customerName, deliveryAddress, phoneNumber, distanceInKm, paymentMethod, latitude, longitude);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      console.error('Failed to place order:', error.message);
    },
  });
}

export function useConfirmOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.confirmOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      console.error('Failed to confirm order:', error.message);
    },
  });
}

export function useMarkAsPacked() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markAsPacked(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      console.error('Failed to mark as packed:', error.message);
    },
  });
}

export function useMarkAsOutForDelivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markAsOutForDelivery(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      console.error('Failed to mark as out for delivery:', error.message);
    },
  });
}

export function useMarkAsCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markAsCompleted(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      console.error('Failed to mark as completed:', error.message);
    },
  });
}

// ─── Recharge Orders ──────────────────────────────────────────────────────────

export function useGetAllRechargeOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<RechargeOrder[]>({
    queryKey: ['rechargeOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRechargeOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceRechargeOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, { mobileNumber: string; operator: string; rechargeAmount: bigint }>({
    mutationFn: async ({ mobileNumber, operator, rechargeAmount }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeRechargeOrder(mobileNumber, operator, rechargeAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rechargeOrders'] });
    },
    onError: (error: Error) => {
      console.error('Failed to place recharge order:', error.message);
    },
  });
}

// ─── Bills ────────────────────────────────────────────────────────────────────

export function useGetAllBills() {
  const { actor, isFetching } = useActor();
  return useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBills();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<Bill, Error, {
    customerName: string | null;
    customerPhone: string | null;
    items: BillItem[];
    totalAmount: bigint;
  }>({
    mutationFn: async ({ customerName, customerPhone, items, totalAmount }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateBill(customerName, customerPhone, items, totalAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
    onError: (error: Error) => {
      console.error('Failed to generate bill:', error.message);
    },
  });
}

export function useUpdateBillPaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<Bill, Error, {
    billId: bigint;
    paymentStatus: PaymentStatus;
    paymentReference: string | null;
    paymentGatewayId: string | null;
  }>({
    mutationFn: async ({ billId, paymentStatus, paymentReference, paymentGatewayId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBillPaymentStatus(billId, paymentStatus, paymentReference, paymentGatewayId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update bill payment status:', error.message);
    },
  });
}

// ─── Store Settings ───────────────────────────────────────────────────────────

export function useGetShopSlogan() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['shopSlogan'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getShopSlogan();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetShopSlogan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (slogan: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setShopSlogan(slogan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopSlogan'] });
    },
    onError: (error: Error) => {
      console.error('Failed to set shop slogan:', error.message);
    },
  });
}

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
  return useMutation<void, Error, string>({
    mutationFn: async (upiId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStoreUpiId(upiId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeUpiId'] });
    },
    onError: (error: Error) => {
      console.error('Failed to set store UPI ID:', error.message);
    },
  });
}

export function useCalculateTotalPrice() {
  const { actor } = useActor();
  return useMutation<bigint, Error, bigint>({
    mutationFn: async (distanceInKm: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.calculateTotalPrice(distanceInKm);
    },
    onError: (error: Error) => {
      console.error('Failed to calculate total price:', error.message);
    },
  });
}

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
    onError: (error: Error) => {
      console.error('Failed to add product by barcode:', error.message);
    },
  });
}
