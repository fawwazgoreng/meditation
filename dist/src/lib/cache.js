/** In-memory storage for SVG caching */
const store = new Map();
/** Default Time-To-Live: 1 hour in milliseconds */
const TTL_MS = 60 * 60 * 1000;
/** Retrieve value from cache and handle expiration */
export function cacheGet(key) {
    const entry = store.get(key);
    // Return null if key doesn't exist
    if (!entry)
        return null;
    // Delete entry and return null if expired
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.value;
}
/** Store value in cache with a specific or default TTL */
export function cacheSet(key, value, ttl = TTL_MS) {
    store.set(key, {
        value,
        expiresAt: Date.now() + ttl
    });
}
