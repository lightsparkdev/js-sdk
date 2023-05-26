//
//  Signing.swift
//  LightsparkWallet
//
//  Created by Zhen Lu on 4/21/23.
//  Copyright © 2023 Lightspark Group, Inc. All rights reserved.
//

import Foundation

public enum Signing {}

extension Signing {
  public enum SigningError: Error {
    case keyNotSupported
    case jsonSerializationError
  }
}

extension Signing {
  public static func signPayload(key: SecKey, payload: Data) throws -> String {
    let algorithm: SecKeyAlgorithm = .rsaSignatureMessagePSSSHA256
    guard SecKeyIsAlgorithmSupported(key, .sign, algorithm) else {
      throw SigningError.keyNotSupported
    }
    var error: Unmanaged<CFError>?
    guard let signature = SecKeyCreateSignature(key, algorithm, payload as CFData, &error) as? Data
    else {
      throw error!.takeRetainedValue() as Error
    }
    return signature.base64EncodedString()
  }
}
