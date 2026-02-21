import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, CartItem, Order, RechargeOrder } from '../backend';
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
    }: {
      name: string;
      category: string;
      priceInRupees: bigint;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addProduct(name, category, priceInRupees, image);
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
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}
