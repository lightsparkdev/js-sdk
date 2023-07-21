import ExpoModulesCore

internal struct ExportedKey: Record {
  @Field
  var format: Format = .pkcs8

  @Field
  var keyBytes: String

  internal enum Format: String {
    case pkcs8 = "pkcs8"
    case spki = "spki"
    case pkcs1 = "pkcs1"
  }
}

internal struct ExportedKeys: Record {
  @Field
  var privateKey: ExportedKey

  @Field
  var publicKey: ExportedKey

  @Field
  var alias: String
}
