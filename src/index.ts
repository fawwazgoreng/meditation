import { Hono } from 'hono'
import { cacheGet, cacheSet } from './lib/cache'
import { fetchTopLanguages, fetchUserStats, fetchStreak } from './lib/github'
import { buildTopLangsSVG, buildStreakSVG, buildCardSVG } from './lib/svg'

const app = new Hono()

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse ?user= and return 400 if missing */
function getUser(c: any): string | null {
  return c.req.query('user') ?? null
}

/** Return SVG response with caching headers */
function svgResponse(c: any, svg: string) {
  return c.body(svg, 200, {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  })
}

/** Wrap route handler with cache + error handling */
async function withCache(
  c: any,
  key: string,
  build: () => Promise<string>
) {
  const hit = cacheGet(key)
  if (hit) return svgResponse(c, hit)

  try {
    const svg = await build()
    cacheSet(key, svg)
    return svgResponse(c, svg)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[${key}]`, msg)
    return c.text(`Error: ${msg}`, 502)
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /stats?user=<username>
 * Returns a top languages bar card as SVG.
 *
 * Usage in README:
 *   ![Top Langs](https://your-app.vercel.app/stats?user=fawwazgoreng)
 */
app.get('/stats', async (c) => {
  const user = getUser(c)
  if (!user) return c.text('Missing ?user=', 400)

  return withCache(c, `stats:${user}`, async () => {
    const langs = await fetchTopLanguages(user)
    return buildTopLangsSVG(langs)
  })
})

/**
 * GET /streak?user=<username>
 * Returns a commit streak card as SVG.
 *
 * Usage in README:
 *   ![Streak](https://your-app.vercel.app/streak?user=fawwazgoreng)
 */
app.get('/streak', async (c) => {
  const user = getUser(c)
  if (!user) return c.text('Missing ?user=', 400)

  return withCache(c, `streak:${user}`, async () => {
    const data = await fetchStreak(user)
    return buildStreakSVG(data)
  })
})

/**
 * GET /card?user=<username>
 * Returns a summary stats card (repos, stars, followers) as SVG.
 *
 * Usage in README:
 *   ![Card](https://your-app.vercel.app/card?user=fawwazgoreng)
 */
app.get('/card', async (c) => {
  const user = getUser(c)
  if (!user) return c.text('Missing ?user=', 400)

  return withCache(c, `card:${user}`, async () => {
    const stats = await fetchUserStats(user)
    return buildCardSVG(stats)
  })
})

/**
 * GET /
 * Health check + available endpoints.
 */
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    endpoints: {
      '/stats?user=':  'Top languages bar card',
      '/streak?user=': 'Commit streak card',
      '/card?user=':   'Summary stats card',
    },
  })
})

export default app