import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  // State
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type UnitType = {
    #piece;
    #packet;
    #kg;
    #gram;
  };

  public type Product = {
    id : Nat;
    name : Text;
    category : Text;
    priceInRupees : Nat;
    image : Storage.ExternalBlob;
    barcode : Text;
    unitType : UnitType;
  };

  let products = Map.empty<Nat, Product>();
  var nextProductId = 0;

  public type PaymentMethod = {
    #upi;
    #cod;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #packed;
    #out_for_delivery;
    #completed;
  };

  public type Order = {
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

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 0;

  public type RechargeOrder = {
    id : Nat;
    mobileNumber : Text;
    operator : Text;
    rechargeAmount : Nat;
  };

  let rechargeOrders = Map.empty<Nat, RechargeOrder>();
  var nextRechargeOrderId = 0;

  public type CartItem = {
    product : Product;
    quantity : Nat;
  };

  let carts = Map.empty<Principal, List.List<CartItem>>();

  let deliveryFeePerKm = 20;

  public type Bill = {
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

  public type BillItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    pricePerUnit : Nat;
    totalPrice : Nat;
  };

  public type PaymentStatus = {
    #pending;
    #completed;
    #failed;
    #refunded;
  };

  let bills = Map.empty<Nat, Bill>();
  var nextBillId = 0;

  var shopSlogan : Text = "Welcome to our shop!";
  var excludedProducts = Set.empty<Nat>();

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func addProduct(
    name : Text,
    category : Text,
    priceInRupees : Nat,
    image : Storage.ExternalBlob,
    barcode : Text,
    unitType : UnitType,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let product : Product = {
      id = nextProductId;
      name;
      category;
      priceInRupees;
      image;
      barcode;
      unitType;
    };
    products.add(nextProductId, product);
    let addedProductId = nextProductId;
    nextProductId += 1;
    addedProductId;
  };

  public shared ({ caller }) func removeProduct(productId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };

    products.remove(productId);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductByBarcode(barcode : Text) : async ?Product {
    products.values().find(func(product) { product.barcode == barcode });
  };

  public type ProductWithAction = {
    product : Product;
    action : Text;
  };

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity <= 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    if (excludedProducts.contains(productId)) {
      Runtime.trap("This product is currently not available for purchase");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?c) { c };
    };

    let existingItemIndex = cart.findIndex(
      func(item) { item.product.id == productId }
    );

    switch (existingItemIndex) {
      case (null) {
        let newItem : CartItem = {
          product;
          quantity;
        };
        cart.add(newItem);
      };
      case (?index) {
        let itemsIter = cart.values();
        let itemsArray = itemsIter.toArray();
        if (index < itemsArray.size()) {
          let updatedItem : CartItem = {
            product;
            quantity = itemsArray[index].quantity + quantity;
          };
          let newItemsArray = Array.tabulate(
            itemsArray.size(),
            func(i) {
              if (i == index) { updatedItem } else { itemsArray[i] };
            },
          );
          cart.clear();
          cart.addAll(newItemsArray.values());
        } else {
          Runtime.trap("Invalid cart item index");
        };
      };
    };

    carts.add(caller, cart);
  };

  public shared ({ caller }) func addProductByBarcode(barcode : Text, quantity : Nat) : async ProductWithAction {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add products to cart");
    };

    if (quantity <= 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let product = switch (products.values().find(func(product) { product.barcode == barcode })) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    if (excludedProducts.contains(product.id)) {
      Runtime.trap("This product is currently not available for purchase");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?c) { c };
    };

    let existingItemIndex = cart.findIndex(
      func(item) { item.product.id == product.id }
    );

    switch (existingItemIndex) {
      case (null) {
        let newItem : CartItem = {
          product;
          quantity;
        };
        cart.add(newItem);
      };
      case (?index) {
        let itemsIter = cart.values();
        let itemsArray = itemsIter.toArray();
        if (index < itemsArray.size()) {
          let updatedItem : CartItem = {
            product;
            quantity = itemsArray[index].quantity + quantity;
          };
          let newItemsArray = Array.tabulate(
            itemsArray.size(),
            func(i) {
              if (i == index) { updatedItem } else { itemsArray[i] };
            },
          );
          cart.clear();
          cart.addAll(newItemsArray.values());
        } else {
          Runtime.trap("Invalid cart item index");
        };
      };
    };

    carts.add(caller, cart);

    {
      product;
      action = "added-to-cart";
    };
  };

  public query ({ caller }) func getProductByBarcodeWithAction(barcode : Text) : async ProductWithAction {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch products");
    };

    switch (products.values().find(func(product) { product.barcode == barcode })) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { { product; action = "fetch-only" } };
    };
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  public shared ({ caller }) func calculateTotalPrice(distanceInKm : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can calculate total price");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?c) { c };
    };

    let totalPrice = cart.toArray().foldLeft(0, func(acc, item) { acc + (item.product.priceInRupees * item.quantity) });
    if (distanceInKm > 1) {
      totalPrice + ((distanceInKm - 1) * deliveryFeePerKm);
    } else {
      totalPrice;
    };
  };

  public shared ({ caller }) func placeOrder(
    customerName : Text,
    deliveryAddress : Text,
    phoneNumber : Text,
    distanceInKm : Nat,
    paymentMethod : PaymentMethod,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?c) { c };
    };

    if (cart.isEmpty()) { Runtime.trap("Cart is empty") };

    let productsArray = cart.toArray().map(func(item) { item.product });
    let totalPrice = await calculateTotalPrice(distanceInKm);

    let order : Order = {
      id = nextOrderId;
      customerName;
      deliveryAddress;
      phoneNumber;
      products = productsArray;
      totalPrice;
      timestamp = Time.now();
      status = #pending;
      paymentMethod;
    };

    orders.add(nextOrderId, order);
    carts.remove(caller);

    nextOrderId += 1;
    nextOrderId - 1;
  };

  public shared ({ caller }) func placeRechargeOrder(mobileNumber : Text, operator : Text, rechargeAmount : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can place recharge orders");
    };

    if (rechargeAmount <= 0) { Runtime.trap("Recharge amount must be greater than 0") };

    let rechargeOrder : RechargeOrder = {
      id = nextRechargeOrderId;
      mobileNumber;
      operator;
      rechargeAmount;
    };
    rechargeOrders.add(nextRechargeOrderId, rechargeOrder);

    nextRechargeOrderId += 1;
    nextRechargeOrderId - 1;
  };

  public shared ({ caller }) func confirmOrder(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can confirm orders");
    };
    updateOrderStatus(caller, orderId, #confirmed);
  };

  public shared ({ caller }) func markAsPacked(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can mark orders as packed");
    };
    updateOrderStatus(caller, orderId, #packed);
  };

  public shared ({ caller }) func markAsOutForDelivery(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can mark orders as out for delivery");
    };
    updateOrderStatus(caller, orderId, #out_for_delivery);
  };

  public shared ({ caller }) func markAsCompleted(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can mark orders as completed");
    };
    updateOrderStatus(caller, orderId, #completed);
  };

  func updateOrderStatus(_caller : Principal, orderId : Nat, newStatus : OrderStatus) {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    let updatedOrder : Order = {
      order with
      status = newStatus;
    };
    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func generateBill(
    customerName : ?Text,
    customerPhone : ?Text,
    items : [BillItem],
    totalAmount : Nat,
  ) : async Bill {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can generate bills");
    };

    let billNumber = nextBillId.toText();

    let bill : Bill = {
      id = nextBillId;
      billNumber;
      timestamp = Time.now();
      customerName;
      customerPhone;
      items;
      totalAmount;
      generatedByAdmin = caller;
      paymentStatus = #pending;
      paymentReference = null;
      paymentGatewayId = null;
    };

    bills.add(nextBillId, bill);
    nextBillId += 1;
    bill;
  };

  public shared ({ caller }) func updateBillPaymentStatus(
    billId : Nat,
    paymentStatus : PaymentStatus,
    paymentReference : ?Text,
    paymentGatewayId : ?Text,
  ) : async Bill {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update bill payment status");
    };

    let oldBill = switch (bills.get(billId)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?bill) { bill };
    };

    let updatedBill : Bill = {
      oldBill with
      paymentStatus;
      paymentReference;
      paymentGatewayId;
    };
    bills.add(billId, updatedBill);

    updatedBill;
  };

  public shared ({ caller }) func setShopSlogan(slogan : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can set shop slogan");
    };
    shopSlogan := slogan;
  };

  public shared ({ caller }) func toggleProductExclusion(productId : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can toggle product exclusion");
    };

    if (excludedProducts.contains(productId)) {
      excludedProducts.remove(productId);
      false;
    } else {
      excludedProducts.add(productId);
      true;
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getAllRechargeOrders() : async [RechargeOrder] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all recharge orders");
    };
    rechargeOrders.values().toArray();
  };

  public query ({ caller }) func getAllBills() : async [Bill] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all bills");
    };
    bills.values().toArray();
  };

  public query func getShopSlogan() : async Text {
    shopSlogan;
  };

  public query ({ caller }) func getExcludedProducts() : async [Nat] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view excluded products");
    };
    excludedProducts.toArray();
  };
};
