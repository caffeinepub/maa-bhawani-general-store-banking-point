import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import CoreOrder "mo:core/Order";

import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  // Include components
  include MixinStorage();

  // Product definitions
  public type Product = {
    id : Nat;
    name : Text;
    category : Text;
    priceInRupees : Nat;
    image : Storage.ExternalBlob;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : CoreOrder.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  let products = Map.empty<Nat, Product>();
  var nextProductId = 0;

  // Order definitions
  public type Order = {
    id : Nat;
    customerName : Text;
    deliveryAddress : Text;
    phoneNumber : Text;
    products : [Product];
    totalPrice : Nat;
  };

  module OrderComparison {
    public func compareByTotalPrice(order1 : Order, order2 : Order) : CoreOrder.Order {
      Nat.compare(order1.totalPrice, order2.totalPrice);
    };
  };

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 0;

  // Mobile Recharge definitions
  public type RechargeOrder = {
    id : Nat;
    mobileNumber : Text;
    operator : Text;
    rechargeAmount : Nat;
  };

  let rechargeOrders = Map.empty<Nat, RechargeOrder>();
  var nextRechargeOrderId = 0;

  // Cart definitions
  public type CartItem = {
    product : Product;
    quantity : Nat;
  };

  let carts = Map.empty<Principal, List.List<CartItem>>();

  // Pricing Constants
  let deliveryFeePerKm = 20; // Fixed fee per km beyond 1km

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Product Management (Admin only)
  public shared ({ caller }) func addProduct(name : Text, category : Text, priceInRupees : Nat, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let product : Product = {
      id = nextProductId;
      name;
      category;
      priceInRupees;
      image;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
  };

  public shared ({ caller }) func removeProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };

    products.remove(productId);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  // Cart Management (User only)
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity <= 0) {
      Runtime.trap("Quantity must be greater than 0");
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

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    carts.remove(caller);
  };

  public shared ({ caller }) func calculateTotalPrice(distanceInKm : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate total price");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?c) { c };
    };

    var totalPrice = 0;
    for (item in cart.values()) {
      totalPrice += item.product.priceInRupees * item.quantity;
    };

    if (distanceInKm > 1) {
      let additionalDistance = distanceInKm - 1;
      totalPrice += (additionalDistance * deliveryFeePerKm);
    };

    totalPrice;
  };

  // Order Placement (User only)
  public shared ({ caller }) func placeOrder(customerName : Text, deliveryAddress : Text, phoneNumber : Text, distanceInKm : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?c) { c };
    };

    if (cart.isEmpty()) {
      Runtime.trap("Cart is empty");
    };

    let cartArray = cart.toArray();
    let productsArray = cartArray.map(
      func(item) { item.product }
    );

    let totalPrice = await calculateTotalPrice(distanceInKm);

    let order : Order = {
      id = nextOrderId;
      customerName;
      deliveryAddress;
      phoneNumber;
      products = productsArray;
      totalPrice;
    };
    orders.add(nextOrderId, order);

    carts.remove(caller);
    let currentOrderId = nextOrderId;
    nextOrderId += 1;
    currentOrderId;
  };

  // Mobile Recharge (User only)
  public shared ({ caller }) func placeRechargeOrder(mobileNumber : Text, operator : Text, rechargeAmount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place recharge orders");
    };

    if (rechargeAmount <= 0) {
      Runtime.trap("Recharge amount must be greater than 0");
    };

    let rechargeOrder : RechargeOrder = {
      id = nextRechargeOrderId;
      mobileNumber;
      operator;
      rechargeAmount;
    };
    rechargeOrders.add(nextRechargeOrderId, rechargeOrder);

    let currentRechargeOrderId = nextRechargeOrderId;
    nextRechargeOrderId += 1;
    currentRechargeOrderId;
  };

  // Query all orders (Admin only)
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    orders.values().toArray().sort(OrderComparison.compareByTotalPrice);
  };

  // Query all recharge orders (Admin only)
  public query ({ caller }) func getAllRechargeOrders() : async [RechargeOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view recharge orders");
    };
    rechargeOrders.values().toArray();
  };
};
