import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, Order, CartItem, Bill, BillItem, RechargeOrder } from '../backend';
import { PaymentMethod, PaymentStatus, UnitType } from '../backend';
import { ExternalBlob } from '../backend';

export { PaymentMethod, PaymentStatus, UnitType, ExternalBlob };

const DEFAULT_UPI_ID = '9708075648-1@okbizaxis';

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
        params.stock,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProductStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { productId: bigint; newStock: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProductStock(params.productId, params.newStock);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
  return useMutation({
    mutationFn: async (params: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(params.productId, params.quantity);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
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
        params.longitude,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
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
  return useMutation({
    mutationFn: async (params: {
      mobileNumber: string;
      operator: string;
      rechargeAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeRechargeOrder(params.mobileNumber, params.operator, params.rechargeAmount);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rechargeOrders'] }),
  });
}

// ─── Shop Status ──────────────────────────────────────────────────────────────

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
  });
}

// Legacy aliases used by existing components
export const useGetShopStatus = useShopStatus;
export const useGetShopOpenStatus = useShopStatus;

export function useSetShopStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: boolean) => {
      if (!actor) throw new Error('Actor not available. Please ensure you are logged in.');
      return actor.setShopStatus(status);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopStatus'] }),
  });
}

// ─── UPI ID ───────────────────────────────────────────────────────────────────

export function useGetUpiId() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['upiId'],
    queryFn: async () => {
      if (!actor) return DEFAULT_UPI_ID;
      try {
        return await actor.getUpiId();
      } catch {
        return DEFAULT_UPI_ID;
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEFAULT_UPI_ID,
  });
}

export function useSetUpiId() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (upi: string) => {
      if (!actor) throw new Error('Actor not available. Please ensure you are logged in.');
      return actor.setUpiId(upi);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiId'] });
      queryClient.invalidateQueries({ queryKey: ['storeUpiId'] });
    },
  });
}

export function useGetStoreUpiId() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['storeUpiId'],
    queryFn: async () => {
      if (!actor) return DEFAULT_UPI_ID;
      try {
        return await actor.getStoreUpiId();
      } catch {
        return DEFAULT_UPI_ID;
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEFAULT_UPI_ID,
  });
}

export function useSetStoreUpiId() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (upi: string) => {
      if (!actor) throw new Error('Actor not available. Please ensure you are logged in.');
      return actor.setStoreUpiId(upi);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeUpiId'] });
      queryClient.invalidateQueries({ queryKey: ['upiId'] });
    },
  });
}

// ─── Shop Slogan ──────────────────────────────────────────────────────────────

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
  return useMutation({
    mutationFn: async (slogan: string) => {
      if (!actor) throw new Error('Actor not available. Please ensure you are logged in.');
      return actor.setShopSlogan(slogan);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopSlogan'] }),
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
        params.totalAmount,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] }),
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
        params.paymentGatewayId,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] }),
  });
}

// ─── Calculate Total Price ────────────────────────────────────────────────────

export function useCalculateTotalPrice() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (distanceInKm: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.calculateTotalPrice(distanceInKm);
    },
  });
}

// ─── Product by Barcode ───────────────────────────────────────────────────────

export function useGetProductByBarcode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (barcode: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProductByBarcode(barcode);
    },
  });
}

export function useAddProductByBarcode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { barcode: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProductByBarcode(params.barcode, params.quantity);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery({
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
    mutationFn: async (profile: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] }),
  });
}

// ─── Admin Check ──────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Legacy alias used by Header
export const useIsCallerAdmin = useIsAdmin;
