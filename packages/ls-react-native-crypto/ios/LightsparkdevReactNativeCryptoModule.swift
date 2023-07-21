import ExpoModulesCore

public class LightsparkdevReactNativeCryptoModule: Module {
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('LightsparkdevReactNativeCrypto')` in JavaScript.
    Name("LightsparkdevReactNativeCrypto")

    AsyncFunction("generateSigningKeyPair") { () throws -> ExportedKeys in
      let randomTag = UUID().uuidString
      try Keys.generateNewRSASigningKeyPair(tag: randomTag, permanent: true)
      return try self.exportKey(forTag: randomTag)
    }

    AsyncFunction("serializeSigningKey") { (tag: String) throws -> ExportedKeys in
      return try self.exportKey(forTag: tag)
    }

    // NOTE: iOS can only import pkcs1 format private keys! Other formats will fail.
    AsyncFunction("importPrivateSigningKey") { (privateKey: String) throws -> String in
      return try Keys.importPrivateSigningKey(privateKey: privateKey)
    }

    AsyncFunction("sign") { (keyAlias: String, data: String) throws -> String in
      guard let key = Keys.getRSAPrivateKey(tag: keyAlias) else {
        throw Keys.KeysError.keyNotFoundError
      }
      let payload = Data(base64Encoded: data)!
      return try Signing.signPayload(key: key, payload: payload)
    }

    AsyncFunction("getNonce") { () -> UInt32 in
      return UInt32.random(in: UInt32.min...UInt32.max)
    }

    AsyncFunction("generateMnemonic") { () -> RNMnemonic in
      let mnemonic = Mnemonic()
      let record = RNMnemonic()
      record.mnemonic = mnemonic.asString()
      return record
    }

    AsyncFunction("getSeed") { (rnMnemonic: RNMnemonic) throws -> RNSeed in
      let mnemonic = try Mnemonic.fromPhrase(phrase: rnMnemonic.mnemonic)
      let seed = Seed.fromMnemonic(mnemonic: mnemonic)
      let record = RNSeed()
      record.seed = seed.asBytes()
      return record
    }

    AsyncFunction("derivePublicKey") { (rnSeed: RNSeed, derivationPath: String) throws -> String in
      let seed = Seed(seed: rnSeed.seed)
      let signer = LightsparkSigner()
      return try signer.derivePublicKey(seed: seed, derivationPath: derivationPath)
    }

    AsyncFunction("deriveKeyAndSign") { (rnSeed: RNSeed, 
                                         message: [UInt8], 
                                         derivationPath: String, 
                                         addTweak: [UInt8]?, 
                                         mulTweak: [UInt8]?) throws -> [UInt8] in
      let seed = Seed(seed: rnSeed.seed)
      let signer = LightsparkSigner()
      return try signer.deriveKeyAndSign(
        seed: seed, 
        message: message, 
        derivationPath: derivationPath,
        addTweak: addTweak,
        mulTweak: mulTweak
      )
    }

    AsyncFunction("ecdh") { (rnSeed: RNSeed, derivationPath: String, publicKey: String) throws -> [UInt8] in
      let seed = Seed(seed: rnSeed.seed)
      let signer = LightsparkSigner()
      return try signer.ecdh(seed: seed, derivationPath: derivationPath, publicKey: publicKey)
    }
  }

  private func exportKey(forTag tag: String) throws -> ExportedKeys {
    guard let key = Keys.getRSAPrivateKey(tag: tag) else {
      throw Keys.KeysError.keyNotFoundError
    }
    let privateKeyStr = try Keys.base64StringRepresentationForKey(key: key)

    guard let publicKey = SecKeyCopyPublicKey(key) else {
      throw Keys.KeysError.publicKeyNotCopiableError
    }

    let publicKeyStr = try Keys.base64StringRepresentationForKey(key: publicKey)
    let pubKeyRecord = ExportedKey()
    pubKeyRecord.format = .pkcs1
    pubKeyRecord.keyBytes = publicKeyStr
    let privKeyRecord = ExportedKey()
    privKeyRecord.format = .pkcs1
    privKeyRecord.keyBytes = privateKeyStr
    let record = ExportedKeys()
    record.privateKey = privKeyRecord
    record.publicKey = pubKeyRecord
    record.alias = tag
    return record
  }
}
