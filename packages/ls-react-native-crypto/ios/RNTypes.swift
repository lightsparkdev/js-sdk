import ExpoModulesCore

internal struct RNMnemonic: Record {
  @Field
  var phrase: String
}

internal struct RNSeed: Record {
  @Field
  var seedBytes: String
}
