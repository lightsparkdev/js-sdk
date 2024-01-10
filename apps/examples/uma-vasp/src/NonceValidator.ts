/**
 * Interface for a class which can validate nonces to ensure that the same nonce isn't re-used between requests.
 */
export default interface NonceValidator {
    /**
     * Checks if the nonce has been used before and saves it if it has not.
     *
     * @param nonce The nonce to check.
     * @param timestamp The timestamp of the message which was included in the signed payload with the nonce.
     *    This can be used to clear out old nonces if desired.
     * @returns true if the nonce was valid and has not been used before, false otherwise.
     */
    checkAndSaveNonce(nonce: string, timestamp: number): Promise<boolean>;
}