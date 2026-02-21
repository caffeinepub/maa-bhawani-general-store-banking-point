import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface RechargeOrder {
    id: bigint;
    rechargeAmount: bigint;
    operator: string;
    mobileNumber: string;
}
export interface CartItem {
    quantity: bigint;
    product: Product;
}
export interface Order {
    id: bigint;
    customerName: string;
    deliveryAddress: string;
    phoneNumber: string;
    products: Array<Product>;
    totalPrice: bigint;
}
export interface Product {
    id: bigint;
    name: string;
    category: string;
    image: ExternalBlob;
    priceInRupees: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, category: string, priceInRupees: bigint, image: ExternalBlob): Promise<void>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateTotalPrice(distanceInKm: bigint): Promise<bigint>;
    clearCart(): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllRechargeOrders(): Promise<Array<RechargeOrder>>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, deliveryAddress: string, phoneNumber: string, distanceInKm: bigint): Promise<bigint>;
    placeRechargeOrder(mobileNumber: string, operator: string, rechargeAmount: bigint): Promise<bigint>;
    removeProduct(productId: bigint): Promise<void>;
}
