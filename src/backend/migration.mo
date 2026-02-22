import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldBill = {
    id : Nat;
    billNumber : Text;
    timestamp : Int;
    customerName : ?Text;
    customerPhone : ?Text;
    items : [OldBillItem];
    totalAmount : Nat;
    generatedByAdmin : Principal;
  };

  type OldBillItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    pricePerUnit : Nat;
    totalPrice : Nat;
  };

  type OldActor = {
    bills : Map.Map<Nat, OldBill>;
  };

  // Payment status type introduced in the new version of Bill
  type PaymentStatus = {
    #pending;
    #completed;
    #failed;
    #refunded;
  };

  // New bill type with additional payment fields
  type NewBill = {
    id : Nat;
    billNumber : Text;
    timestamp : Int;
    customerName : ?Text;
    customerPhone : ?Text;
    items : [OldBillItem];
    totalAmount : Nat;
    generatedByAdmin : Principal;
    paymentStatus : PaymentStatus;
    paymentReference : ?Text;
    paymentGatewayId : ?Text;
  };

  type NewActor = {
    bills : Map.Map<Nat, NewBill>;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    let newBills = old.bills.map<Nat, OldBill, NewBill>(
      func(_id, oldBill) {
        {
          oldBill with
          paymentStatus = #pending;
          paymentReference = null;
          paymentGatewayId = null;
        };
      }
    );
    { bills = newBills };
  };
};
