import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";

module {
  type UserProfile = {
    name : Text;
  };

  type UnitType = {
    #piece;
    #packet;
    #kg;
    #gram;
  };

  type Product = {
    id : Nat;
    name : Text;
    category : Text;
    priceInRupees : Nat;
    image : Storage.ExternalBlob;
    barcode : Text;
    unitType : UnitType;
  };

  type PaymentMethod = {
    #upi;
    #cod;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #packed;
    #out_for_delivery;
    #completed;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    deliveryAddress : Text;
    phoneNumber : Text;
    products : [Product];
    totalPrice : Nat;
    timestamp : Time.Time;
    status : OrderStatus;
    paymentMethod : PaymentMethod;
  };

  type RechargeOrder = {
    id : Nat;
    mobileNumber : Text;
    operator : Text;
    rechargeAmount : Nat;
  };

  type CartItem = {
    product : Product;
    quantity : Nat;
  };

  type Bill = {
    id : Nat;
    billNumber : Text;
    timestamp : Time.Time;
    customerName : ?Text;
    customerPhone : ?Text;
    items : [BillItem];
    totalAmount : Nat;
    generatedByAdmin : Principal;
    paymentStatus : PaymentStatus;
    paymentReference : ?Text;
    paymentGatewayId : ?Text;
  };

  type BillItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    pricePerUnit : Nat;
    totalPrice : Nat;
  };

  type PaymentStatus = {
    #pending;
    #completed;
    #failed;
    #refunded;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    rechargeOrders : Map.Map<Nat, RechargeOrder>;
    bills : Map.Map<Nat, Bill>;
    carts : Map.Map<Principal, List.List<CartItem>>;
    excludedProducts : Set.Set<Nat>;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextBillId : Nat;
    nextRechargeOrderId : Nat;
    deliveryFeePerKm : Nat;
    shopSlogan : Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    rechargeOrders : Map.Map<Nat, RechargeOrder>;
    bills : Map.Map<Nat, Bill>;
    carts : Map.Map<Principal, List.List<CartItem>>;
    excludedProducts : Set.Set<Nat>;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextBillId : Nat;
    nextRechargeOrderId : Nat;
    deliveryFeePerKm : Nat;
    shopSlogan : Text;
    isShopOpen : Bool;
  };

  public func run(old : OldActor) : NewActor {
    { old with isShopOpen = true };
  };
};
