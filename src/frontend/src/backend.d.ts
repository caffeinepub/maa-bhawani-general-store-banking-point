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
export interface BillItem {
    productId: bigint;
    productName: string;
    pricePerUnit: bigint;
    quantity: bigint;
    totalPrice: bigint;
}
export type Time = bigint;
export interface ProductWithAction {
    action: string;
    product: Product;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: OrderStatus;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    timestamp: Time;
    phoneNumber: string;
    products: Array<Product>;
    totalPrice: bigint;
}
export interface Bill {
    id: bigint;
    customerName?: string;
    paymentStatus: PaymentStatus;
    customerPhone?: string;
    totalAmount: bigint;
    billNumber: string;
    timestamp: Time;
    generatedByAdmin: Principal;
    paymentReference?: string;
    items: Array<BillItem>;
    paymentGatewayId?: string;
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
export interface Product {
    id: bigint;
    unitType: UnitType;
    name: string;
    barcode: string;
    category: string;
    image: ExternalBlob;
    priceInRupees: bigint;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    pending = "pending",
    out_for_delivery = "out_for_delivery",
    completed = "completed",
    confirmed = "confirmed",
    packed = "packed"
}
export enum PaymentMethod {
    cod = "cod",
    upi = "upi"
}
export enum PaymentStatus {
    pending = "pending",
    completed = "completed",
    refunded = "refunded",
    failed = "failed"
}
export enum UnitType {
    kg = "kg",
    gram = "gram",
    piece = "piece",
    packet = "packet"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, category: string, priceInRupees: bigint, image: ExternalBlob, barcode: string, unitType: UnitType): Promise<bigint>;
    addProductByBarcode(barcode: string, quantity: bigint): Promise<ProductWithAction>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateTotalPrice(distanceInKm: bigint): Promise<bigint>;
    clearCart(): Promise<void>;
    confirmOrder(orderId: bigint): Promise<void>;
    generateBill(customerName: string | null, customerPhone: string | null, items: Array<BillItem>, totalAmount: bigint): Promise<Bill>;
    getAllBills(): Promise<Array<Bill>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllRechargeOrders(): Promise<Array<RechargeOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getExcludedProducts(): Promise<Array<bigint>>;
    getProductByBarcode(barcode: string): Promise<Product | null>;
    getProductByBarcodeWithAction(barcode: string): Promise<ProductWithAction>;
    getShopSlogan(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    markAsCompleted(orderId: bigint): Promise<void>;
    markAsOutForDelivery(orderId: bigint): Promise<void>;
    markAsPacked(orderId: bigint): Promise<void>;
    placeOrder(customerName: string, deliveryAddress: string, phoneNumber: string, distanceInKm: bigint, paymentMethod: PaymentMethod): Promise<bigint>;
    placeRechargeOrder(mobileNumber: string, operator: string, rechargeAmount: bigint): Promise<bigint>;
    removeProduct(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setShopSlogan(slogan: string): Promise<void>;
    toggleProductExclusion(productId: bigint): Promise<boolean>;
    updateBillPaymentStatus(billId: bigint, paymentStatus: PaymentStatus, paymentReference: string | null, paymentGatewayId: string | null): Promise<Bill>;
}
