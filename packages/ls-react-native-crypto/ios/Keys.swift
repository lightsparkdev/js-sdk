//
//  Keys.swift
//  LightsparkWallet
//
//  Created by Zhen Lu on 4/20/23.
//  Copyright © 2023 Lightspark Group, Inc. All rights reserved.
//

import Foundation

public enum Keys {}

extension Keys {
  public enum KeysError: Error {
    case tagParsingError
    case generateKeyFailure
    case publicKeyNotCopiableError
    case keyAlreadyExistError
    case keyNotFoundError
  }
}

extension Keys {
  public static func getRSAPrivateKey(tag: String) -> SecKey? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassKey,
      kSecAttrApplicationTag as String: tag,
      kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
      kSecReturnRef as String: true,
    ]

    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    guard status == errSecSuccess else {
      return nil
    }
    let key = item as! SecKey
    return key
  }

  public static func removeRSAPrivateKey(tag: String) throws {
    let query: [String: Any] = [
      kSecClass as String: kSecClassKey,
      kSecAttrApplicationTag as String: tag,
      kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
      kSecReturnRef as String: true,
    ]
    let status = SecItemDelete(query as CFDictionary)
    guard status == errSecSuccess else {
      throw KeysError.keyNotFoundError
    }
  }

  public static func importPrivateSigningKey(privateKey: String) throws -> String {
    let keyData = Data(base64Encoded: privateKey)!
    let tag = UUID().uuidString
    let attributes: [String: Any] = [
      kSecAttrApplicationTag as String: tag,
      kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
      kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
      kSecAttrKeySizeInBits as String: 2048,
      kSecReturnRef as String: true,
    ]
    var error: Unmanaged<CFError>?
    guard let secKey = SecKeyCreateWithData(keyData as CFData, attributes as CFDictionary, &error)
    else {
      if let error = error {
        throw error.takeRetainedValue() as Error
      } else {
        throw KeysError.generateKeyFailure
      }
    }
    let addQuery: [String: Any] = [
      kSecClass as String: kSecClassKey,
      kSecAttrApplicationTag as String: tag,
      kSecValueRef as String: secKey,
    ]
    let status = SecItemAdd(addQuery as CFDictionary, nil)
    if status != errSecSuccess {
      throw KeysError.generateKeyFailure
    }
    return tag
  }

  public static func generateNewRSASigningKeyPair(
    tag: String? = nil,
    permanent: Bool = false
  ) throws -> (SecKey, SecKey) {
    let attributes: [String: Any]
    if permanent {
      guard let tag = tag else {
        throw KeysError.tagParsingError
      }
      guard Keys.getRSAPrivateKey(tag: tag) == nil else {
        throw KeysError.keyAlreadyExistError
      }
      guard let tag = tag.data(using: .utf8) else {
        throw KeysError.tagParsingError
      }
      attributes = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeySizeInBits as String: 2048,
        kSecPrivateKeyAttrs as String: [
          kSecAttrIsPermanent as String: permanent,
          kSecAttrApplicationTag as String: tag,
        ] as [String: Any?],
      ]
    } else {
      attributes = [
        kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
        kSecAttrKeySizeInBits as String: 2048,
        kSecPrivateKeyAttrs as String: [
          kSecAttrIsPermanent as String: permanent
        ] as [String: Any?],
      ]
    }

    var error: Unmanaged<CFError>?
    guard let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error) else {
      if let error = error {
        throw error.takeRetainedValue() as Error
      } else {
        throw KeysError.generateKeyFailure
      }
    }

    guard let publicKey = SecKeyCopyPublicKey(privateKey) else {
      throw KeysError.publicKeyNotCopiableError
    }
    return (privateKey, publicKey)
  }

  public static func base64StringRepresentationForKey(key: SecKey) throws -> String {
    var error: Unmanaged<CFError>?
    guard let keyData = SecKeyCopyExternalRepresentation(key, &error) as? Data else {
      if let error = error {
        throw error.takeRetainedValue() as Error
      } else {
        throw KeysError.publicKeyNotCopiableError
      }
    }
    return keyData.base64EncodedString()
  }
}
