import NonceValidator from "../NonceValidator.js";

/**
 * A simple in-memory nonce validator which caches seen nonce values and rejects any which have been seen before
 * or which are older than a specified limit timestamp.
 */
export default class InMemoryNonceValidator implements NonceValidator {
    constructor(
        private oldestValidTimestampMs: number,
    ) {}

    private seenNoncesTimestamps = new Map<string, number>();

    async checkAndSaveNonce(nonce: string, timestampSec: number) {
        if (timestampSec * 1000 < this.oldestValidTimestampMs) {
            return false;
        }

        if (this.seenNoncesTimestamps.has(nonce)) {
            return false;
        }
        this.seenNoncesTimestamps.set(nonce, timestampSec);
        return true;
    }

    /**
     * Note - this isn't used in practice, but is provided as an example of how you might purge old nonces
     * from the cache after some amount of time has elapsed.
     *
     * @param timestamp A timestamp value in ms before which all nonces should be purged.
     */
    async purgeNoncesOlderThan(timestampMs: number) {
        this.seenNoncesTimestamps.forEach((ts, nonce) => {
            if (ts * 1000 < timestampMs) {
                this.seenNoncesTimestamps.delete(nonce);
            }
        });
        this.oldestValidTimestampMs = timestampMs;
    }
}