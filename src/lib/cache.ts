const store = new Map<string, { value: string; expiresAt: number }>()

const TTL_MS = 60 * 60 * 1000 // 1 hour

export function cacheGet(key: string): string | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value
}

export function cacheSet(key: string, value: string, ttl = TTL_MS): void {
  store.set(key, { value, expiresAt: Date.now() + ttl })
}