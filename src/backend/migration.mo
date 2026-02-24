import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
  type OldUserProfile = {
    name : Text;
  };

  type OldProduct = {
    id : Nat;
    name : Text;
    category : Text;
    priceInRupees : Nat;
    image : Storage.ExternalBlob;
    barcode : Text;
  };

  type OldPaymentMethod = {
    #upi;
    #cod;
  };

  type OldOrderStatus = {
    #pending;
    #confirmed;
    #packed;
    #out_for_delivery;
    #completed;
  };

  type OldOrder = {
    id : Nat;
    customerName : Text;
    deliveryAddress : Text;
    phoneNumber : Text;
    products : [OldProduct];
    totalPrice : Nat;
    timestamp : Time.Time;
    status : OldOrderStatus;
    paymentMethod : OldPaymentMethod;
  };

  type OldRechargeOrder = {
    id : Nat;
    mobileNumber : Text;
    operator : Text;
    rechargeAmount : Nat;
  };

  type OldCartItem = {
    product : OldProduct;
    quantity : Nat;
  };

  type OldBill = {
    id : Nat;
    billNumber : Text;
    timestamp : Time.Time;
    customerName : ?Text;
    customerPhone : ?Text;
    items : [OldBillItem];
    totalAmount : Nat;
    generatedByAdmin : Principal;
    paymentStatus : OldPaymentStatus;
    paymentReference : ?Text;
    paymentGatewayId : ?Text;
  };

  type OldBillItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    pricePerUnit : Nat;
    totalPrice : Nat;
  };

  type OldPaymentStatus = {
    #pending;
    #completed;
    #failed;
    #refunded;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    products : Map.Map<Nat, OldProduct>;
    nextProductId : Nat;
    orders : Map.Map<Nat, OldOrder>;
    nextOrderId : Nat;
    rechargeOrders : Map.Map<Nat, OldRechargeOrder>;
    nextRechargeOrderId : Nat;
    carts : Map.Map<Principal, List.List<OldCartItem>>;
    deliveryFeePerKm : Nat;
    bills : Map.Map<Nat, OldBill>;
    nextBillId : Nat;
    shopSlogan : Text;
    excludedProducts : Set.Set<Nat>;
  };

  type NewUnitType = {
    #piece;
    #packet;
    #kg;
    #gram;
  };

  type NewProduct = {
    id : Nat;
    name : Text;
    category : Text;
    priceInRupees : Nat;
    image : Storage.ExternalBlob;
    barcode : Text;
    unitType : NewUnitType;
  };

  type NewOrder = {
    id : Nat;
    customerName : Text;
    deliveryAddress : Text;
    phoneNumber : Text;
    products : [NewProduct];
    totalPrice : Nat;
    timestamp : Time.Time;
    status : OldOrderStatus;
    paymentMethod : OldPaymentMethod;
  };

  // Update CartItem to use new Product type.
  type NewCartItem = {
    product : NewProduct;
    quantity : Nat;
  };

  type NewBill = {
    id : Nat;
    billNumber : Text;
    timestamp : Time.Time;
    customerName : ?Text;
    customerPhone : ?Text;
    items : [OldBillItem];
    totalAmount : Nat;
    generatedByAdmin : Principal;
    paymentStatus : OldPaymentStatus;
    paymentReference : ?Text;
    paymentGatewayId : ?Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    products : Map.Map<Nat, NewProduct>;
    nextProductId : Nat;
    orders : Map.Map<Nat, NewOrder>;
    nextOrderId : Nat;
    rechargeOrders : Map.Map<Nat, OldRechargeOrder>;
    nextRechargeOrderId : Nat;
    carts : Map.Map<Principal, List.List<NewCartItem>>;
    deliveryFeePerKm : Nat;
    bills : Map.Map<Nat, NewBill>;
    nextBillId : Nat;
    shopSlogan : Text;
    excludedProducts : Set.Set<Nat>;
  };

  func convertProduct(product : OldProduct) : NewProduct {
    {
      product with
      unitType = #piece;
    };
  };

  func convertOrder(order : OldOrder) : NewOrder {
    {
      order with
      products = order.products.map(func(product) { convertProduct(product) });
    };
  };

  func convertCartItem(cartItem : OldCartItem) : NewCartItem {
    {
      cartItem with
      product = convertProduct(cartItem.product);
    };
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<Nat, OldProduct, NewProduct>(
      func(_id, product) { convertProduct(product) }
    );

    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, order) { convertOrder(order) }
    );

    let newCarts = old.carts.map<Principal, List.List<OldCartItem>, List.List<NewCartItem>>(
      func(_principal, cart) {
        let newCart = List.empty<NewCartItem>();
        cart.forEach(func(cartItem) { newCart.add(convertCartItem(cartItem)) });
        newCart;
      }
    );

    {
      old with
      products = newProducts;
      orders = newOrders;
      carts = newCarts;
    };
  };
};
