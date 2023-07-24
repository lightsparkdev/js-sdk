import ExpoModulesCore

internal struct RNMnemonic: Record {
  @Field
  var mnemonic: String
}

internal struct RNSeed: Record {
  @Field
  var seed: [UInt8]
}
