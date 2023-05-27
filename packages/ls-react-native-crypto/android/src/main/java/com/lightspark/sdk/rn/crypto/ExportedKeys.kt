package com.lightspark.sdk.rn.crypto

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.Enumerable

class ExportedKey(
    @Field
    val keyBytes: String = "",
    @Field
    val format: KeyFormat = KeyFormat.PKCS8,
) : Record {
    enum class KeyFormat(val value: String) : Enumerable {
        PKCS8("pkcs8"),
        SPKI("spki"),
        PKS1("pks1"),
        ;
    }
}

class ExportedKeys(
    @Field
    val publicKey: ExportedKey = ExportedKey(),
    @Field
    val privateKey: ExportedKey = ExportedKey(),
    @Field
    val alias: String = "",
) : Record