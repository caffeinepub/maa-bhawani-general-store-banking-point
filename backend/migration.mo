module {
  public type OldActor = {
    upiId : ?Text;
    // ... keep the other unchanged variables here as-is!
  };

  public type NewActor = {
    upiId : Text;
    // ... keep the other unchanged variables here as-is!
  };

  public func run(old : OldActor) : NewActor {
    let newUpi = switch (old.upiId) {
      case (?existing) { existing };
      case (null) { "9708075648-1@okbizaxis" };
    };
    { old with upiId = newUpi };
  };
};
