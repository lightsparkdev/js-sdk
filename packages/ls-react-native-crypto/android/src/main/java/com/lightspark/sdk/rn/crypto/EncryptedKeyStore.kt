package com.lightspark.sdk.rn.crypto

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

private const val KEY_PREFS_FILE = "ls_encrypted_keystore"

/**
 * Used to store encrypted keys in the file system, encrypted by a master key that's stored securely in the
 * AndroidKeyStore. This adds the ability to export the keys for storage elsewhere if needed by the user.
 */
class EncryptedKeyStore(appContext: Context) {
    private val masterKey = MasterKey(appContext, requestStrongBoxBacked = true)
    private val sharedPrefs = EncryptedSharedPreferences(
        appContext,
        KEY_PREFS_FILE,
        masterKey
    )

    fun addKey(alias: String, privateKey: String, publicKey: String) {
        sharedPrefs.edit().apply {
            putString(alias, privateKey)
            putString(alias + "_pub", publicKey)
            apply()
        }
    }

    fun removeKey(alias: String) {
        sharedPrefs.edit().apply {
            remove(alias)
            remove(alias + "_pub")
            apply()
        }
    }

    fun getEncodedKeyPair(alias: String): Pair<String, String>? {
        val privateKey = sharedPrefs.getString(alias, null)
        val publicKey = sharedPrefs.getString(alias + "_pub", null)
        return if (privateKey != null && publicKey != null) {
            Pair(privateKey, publicKey)
        } else {
            null
        }
    }

    fun contains(alias: String): Boolean {
        return sharedPrefs.contains(alias)
    }
}