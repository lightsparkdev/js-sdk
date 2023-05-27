package com.lightspark.sdk.rn.crypto

import android.security.keystore.KeyProperties
import android.security.keystore.KeyProtection
import android.util.Base64
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.bouncycastle.asn1.x500.X500Name
import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo
import org.bouncycastle.cert.X509v3CertificateBuilder
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter
import org.bouncycastle.crypto.util.PrivateKeyFactory
import org.bouncycastle.jcajce.provider.symmetric.ARC4.Base
import org.bouncycastle.operator.DefaultDigestAlgorithmIdentifierFinder
import org.bouncycastle.operator.DefaultSignatureAlgorithmIdentifierFinder
import org.bouncycastle.operator.bc.BcRSAContentSignerBuilder
import java.math.BigInteger
import java.security.KeyFactory
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.NoSuchAlgorithmException
import java.security.PrivateKey
import java.security.PublicKey
import java.security.SecureRandom
import java.security.Signature
import java.security.cert.X509Certificate
import java.security.interfaces.RSAPrivateCrtKey
import java.security.spec.MGF1ParameterSpec
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.PSSParameterSpec
import java.security.spec.RSAKeyGenParameterSpec
import java.security.spec.RSAPublicKeySpec
import java.util.Calendar
import java.util.UUID


class LightsparkdevReactNativeCryptoModule : Module() {
    private val encryptedKeyStore by lazy {
        EncryptedKeyStore(requireNotNull(appContext.reactContext?.applicationContext) {
            "Application context is null when creating crypto module."
        })
    }

    override fun definition() = ModuleDefinition {
        Name("LightsparkdevReactNativeCrypto")

        AsyncFunction("generateSigningKeyPair") {
            val keyGen = KeyPairGenerator.getInstance("RSA")
            val spec = RSAKeyGenParameterSpec(2048, RSAKeyGenParameterSpec.F4)
            keyGen.initialize(spec)
            val keypair = keyGen.generateKeyPair()
            val encodedPubKey = Base64.encodeToString(keypair.public.encoded, Base64.NO_WRAP)
            val encodedPrivKey = Base64.encodeToString(keypair.private.encoded, Base64.NO_WRAP)
            val alias = importKey(keypair.private, keypair.public)
            encryptedKeyStore.addKey(alias, encodedPrivKey, encodedPubKey)
            ExportedKeys(
                privateKey = ExportedKey(encodedPrivKey, ExportedKey.KeyFormat.PKCS8),
                publicKey = ExportedKey(encodedPubKey, ExportedKey.KeyFormat.SPKI),
                alias = alias
            )
        }

        AsyncFunction("serializeSigningKey") { keyAlias: String ->
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)
            val (privateKey, publicKey) = encryptedKeyStore.getEncodedKeyPair(keyAlias)
                ?: throw Exception("Key alias does not exist")
            ExportedKeys(
                privateKey = ExportedKey(privateKey, ExportedKey.KeyFormat.PKCS8),
                publicKey = ExportedKey(publicKey, ExportedKey.KeyFormat.SPKI),
                alias = keyAlias
            )
        }

        AsyncFunction("importPrivateSigningKey") { privateKey: String ->
            val keyFactory = KeyFactory.getInstance("RSA")
            val keySpec = PKCS8EncodedKeySpec(Base64.decode(privateKey, Base64.NO_WRAP))
            val key = keyFactory.generatePrivate(keySpec)
            importKey(key)
        }

        AsyncFunction("sign") { keyAlias: String, data: String ->
            val androidKeyStore: KeyStore = KeyStore.getInstance("AndroidKeyStore").apply {
                load(null)
            }
            val entry = androidKeyStore.getEntry(keyAlias, null)
            if (entry !is KeyStore.PrivateKeyEntry) {
                Log.w("Lightspark", "Keystore entry is not an instance of a PrivateKeyEntry")
                throw Error("Missing key")
            }
            val signature = try {
                Signature.getInstance("SHA256withRSA/PSS")
            } catch (e: NoSuchAlgorithmException) {
                // Fallback to RSASSA-PSS if SHA256withRSA/PSS is not supported
                Signature.getInstance("RSASSA-PSS").apply {
                    setParameter(PSSParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, 32, 1))
                }
            }
            signature.initSign(entry.privateKey)
            val payload = Base64.decode(data, Base64.NO_WRAP)
            signature.update(payload)
            Base64.encodeToString(signature.sign(), Base64.NO_WRAP)
        }

        AsyncFunction("getNonce") {
            val bytes = ByteArray(4)
            SecureRandom().nextBytes(bytes)
            bytes.toUInt().toLong()
        }
    }

    private fun importKey(privateKey: PrivateKey, publicKey: PublicKey? = null): String {
        val randomKeyAlias = UUID.randomUUID().toString()
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        val keyFactory = KeyFactory.getInstance("RSA")
        val publicKeyObj = publicKey ?: run {
            privateKey as RSAPrivateCrtKey
            val publicKeySpec = RSAPublicKeySpec(privateKey.modulus, privateKey.publicExponent)
            keyFactory.generatePublic(publicKeySpec)
        }
        val cert = generateSelfSignedCertificate(publicKeyObj, privateKey)
        val privateKeyEntry = KeyStore.PrivateKeyEntry(privateKey, arrayOf(cert))

        val keyProtection = KeyProtection.Builder(KeyProperties.PURPOSE_SIGN)
            .setDigests(KeyProperties.DIGEST_SHA256)
            .setSignaturePaddings(KeyProperties.SIGNATURE_PADDING_RSA_PSS)
            .build()

        keyStore.setEntry(randomKeyAlias, privateKeyEntry, keyProtection)
        return randomKeyAlias
    }

    private fun generateSelfSignedCertificate(publicKey: PublicKey, privateKey: PrivateKey): X509Certificate {
        val sigAlgId = DefaultSignatureAlgorithmIdentifierFinder().find("SHA256withRSA")
        val digAlgId = DefaultDigestAlgorithmIdentifierFinder().find(sigAlgId)
        val keyParam = PrivateKeyFactory.createKey(privateKey.encoded)
        val spki = SubjectPublicKeyInfo.getInstance(publicKey.encoded)
        val signer = BcRSAContentSignerBuilder(sigAlgId, digAlgId).build(keyParam)
        val issuer = X500Name("CN=Lightspark Group Inc., ST=California, C=US")
        val subject = X500Name("CN=Lightspark Wallet, ST=California, C=US")
        val serial = BigInteger.valueOf(1)
        val notBefore = Calendar.getInstance()
        val notAfter = Calendar.getInstance()
        notAfter.add(Calendar.YEAR, 20) // This certificate is valid for 20 years.
        val v3CertGen = X509v3CertificateBuilder(issuer,
            serial,
            notBefore.time,
            notAfter.time,
            subject,
            spki)
        val certificateHolder = v3CertGen.build(signer)
        return JcaX509CertificateConverter().getCertificate(certificateHolder)
    }
}


fun ByteArray.toUInt() =
    ((this[0].toUInt() and 0xFFu) shl 24) or
            ((this[1].toUInt() and 0xFFu) shl 16) or
            ((this[2].toUInt() and 0xFFu) shl 8) or
            (this[3].toUInt() and 0xFFu)
