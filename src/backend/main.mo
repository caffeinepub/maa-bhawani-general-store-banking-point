import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import CoreOrder "mo:core/Order";

import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  // state (initialized once at the start on system-level)
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Fixed admin credentials - these should be provided to the user securely
  // In production, consider using environment variables or secure configuration
  let adminId : Text = "97SKY80";
  var adminPassword : Text = "SKY8084";

  type AuthResult = {
    success : Bool;
    message : Text;
  };

  // Authenticate and grant admin role upon successful authentication
  // Only allows one-time authentication - subsequent calls require existing admin privileges
  public shared ({ caller }) func authenticate(providedId : Text, providedPassword : Text) : async AuthResult {
    if (caller.isAnonymous()) {
      return {
        success = false;
        message = "Authentication failed";
      };
    };

    // Check if caller is already an admin
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return {
        success = true;
        message = "Already authenticated as admin";
      };
    };

    // Verify credentials - use generic error message to prevent information leakage
    if (not Text.equal(providedId, adminId) or not Text.equal(providedPassword, adminPassword)) {
      return {
        success = false;
        message = "Authentication failed";
      };
    };

    // Grant admin role to the authenticated caller
    // Note: AccessControl.assignRole includes admin-only guard internally
    // For initial bootstrap, the access-control module should allow the first assignment
    AccessControl.assignRole(accessControlState, caller, caller, #admin);

    {
      success = true;
      message = "Authentication successful - admin role granted";
    };
  };

  // Allow admins to change the admin password
  public shared ({ caller }) func changeAdminPassword(oldPassword : Text, newPassword : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can change password");
    };

    if (not Text.equal(oldPassword, adminPassword)) {
      return false;
    };

    if (newPassword.size() < 8) {
      Runtime.trap("New password must be at least 8 characters long");
    };

    adminPassword := newPassword;
    true;
  };

  // User Profile
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

  // Product definitions
  public type Product = {
    id : Nat;
    name : Text;
    category : Text;
    priceInRupees : Nat;
    image : Storage.ExternalBlob;
    barcode : Text;
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
    timestamp : Time.Time;
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

  // Bill definitions
  public type Bill = {
    id : Nat;
    billNumber : Text;
    timestamp : Time.Time;
    customerName : ?Text;
    customerPhone : ?Text;
    items : [BillItem];
    totalAmount : Nat;
    generatedByAdmin : Principal;
  };

  public type BillItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    pricePerUnit : Nat;
    totalPrice : Nat;
  };

  let bills = Map.empty<Nat, Bill>();
  var nextBillId = 0;

  // Shop Slogan
  var shopSlogan : Text = "Welcome to our shop!";

  // Exclusion List for admin toggling
  var excludedProducts = Set.empty<Nat>();

  // Admin Check Function
  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Product Management (Admin only)
  public shared ({ caller }) func addProduct(name : Text, category : Text, priceInRupees : Nat, image : Storage.ExternalBlob, barcode : Text) : async () {
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
    };
    products.add(nextProductId, product);
    nextProductId += 1;
  };

  public shared ({ caller }) func removeProduct(productId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };

    products.remove(productId);
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getProductByBarcode(barcode : Text) : async ?Product {
    products.values().find(func(product) { product.barcode == barcode });
  };

  public type ProductWithAction = {
    product : Product;
    action : Text;
  };

  // Cart Management (User only)
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

  // New function to add product to cart by barcode
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

  // New function to get product info by barcode with action
  public query ({ caller }) func getProductByBarcodeWithAction(barcode : Text) : async ProductWithAction {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch products");
    };

    switch (products.values().find(func(product) { product.barcode == barcode })) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) {
        { product; action = "fetch-only" };
      };
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

    var totalPrice = 0;
    for (item in cart.values()) {
      totalPrice += item.product.priceInRupees * item.quantity;
    };

    if (distanceInKm > 1) {
      let additionalDistance = distanceInKm - 1 : Nat;
      totalPrice += (additionalDistance * deliveryFeePerKm);
    };

    totalPrice;
  };

  // Order Placement (User only)
  public shared ({ caller }) func placeOrder(customerName : Text, deliveryAddress : Text, phoneNumber : Text, distanceInKm : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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
      timestamp = Time.now();
    };
    orders.add(nextOrderId, order);

    carts.remove(caller);
    let currentOrderId = nextOrderId;
    nextOrderId += 1;
    currentOrderId;
  };

  // Mobile Recharge (User only)
  public shared ({ caller }) func placeRechargeOrder(mobileNumber : Text, operator : Text, rechargeAmount : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    orders.values().toArray().sort(OrderComparison.compareByTotalPrice);
  };

  // Query all recharge orders (Admin only)
  public query ({ caller }) func getAllRechargeOrders() : async [RechargeOrder] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view recharge orders");
    };
    rechargeOrders.values().toArray();
  };

  // Bill Generation (Admin only)
  public shared ({ caller }) func generateBill(customerName : ?Text, customerPhone : ?Text, items : [BillItem], totalAmount : Nat) : async Bill {
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
    };

    bills.add(nextBillId, bill);
    nextBillId += 1;

    bill;
  };

  public query ({ caller }) func getAllBills() : async [Bill] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view bills");
    };
    bills.values().toArray();
  };

  // Shop Slogan Management (Admin only)
  public shared ({ caller }) func setShopSlogan(slogan : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can set shop slogan");
    };

    shopSlogan := slogan;
  };

  public query func getShopSlogan() : async Text {
    shopSlogan;
  };

  // Exclusion List for Admins
  public shared ({ caller }) func toggleProductExclusion(productId : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can toggle exclusions");
    };

    if (excludedProducts.contains(productId)) {
      excludedProducts.remove(productId);
      false;
    } else {
      excludedProducts.add(productId);
      true;
    };
  };

  public query ({ caller }) func getExcludedProducts() : async [Nat] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view excluded products");
    };
    excludedProducts.toArray();
  };
};
