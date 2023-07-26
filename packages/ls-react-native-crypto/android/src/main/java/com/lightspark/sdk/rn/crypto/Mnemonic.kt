package com.lightspark.sdk.rn.crypto

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class Mnemonic(
    @Field
    val phrase: String = ""
) : Record