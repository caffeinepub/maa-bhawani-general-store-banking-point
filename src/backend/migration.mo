module {
  public type OldActor = {
    adminId : Text;
    adminPassword : Text;
  };

  public type NewActor = {};

  public func run(old : OldActor) : NewActor {
    {};
  };
};
