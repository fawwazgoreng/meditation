import { Hono } from "hono";
import { cacheGet, cacheSet } from "./lib/cache.js";
import { fetchTopLanguages, fetchUserStats, fetchStreak } from "./lib/github.js";
import { buildTopLangsSVG, buildStreakSVG, buildCardSVG } from "./lib/svg.js";
import { chooseTheme } from "./lib/theme.js";
const app = new Hono();
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Extract query parameters from request */
function getParams(c) {
    const user = c.req.query("user");
    const themeName = c.req.query("theme");
    // Validate user presence and non-empty string
    if (!user || typeof user !== "string" || user.trim() === "")
        return null;
    return {
        user: user.trim(),
        themeName: themeName || null
    };
}
/** Return SVG body with optimized caching headers */
function svgResponse(c, svg) {
    return c.body(svg, 200, {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Content-Type-Options": "nosniff",
    });
}
/** Core abstraction for cache, fetch, and SVG generation */
async function handleRequest(c, type, fetcher, builder) {
    const params = getParams(c);
    // Return 400 if user parameter is missing
    if (!params) {
        return c.text("Error: Parameter 'user' is required.", 400);
    }
    const cacheKey = `${type}:${params.user}:${params.themeName || "default"}`;
    try {
        // Check if SVG is already stored in local cache
        const hit = cacheGet(cacheKey);
        if (hit)
            return svgResponse(c, hit);
        // Get theme object based on name or fallback to default
        const theme = chooseTheme(params.themeName);
        // Fetch data from GitHub API
        const data = await fetcher(params.user);
        if (!data)
            throw new Error(`User data not found for: ${params.user}`);
        // Generate SVG string using the specific builder
        const svg = builder(data, theme);
        // Save generated SVG to cache and return response
        cacheSet(cacheKey, svg);
        return svgResponse(c, svg);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error(`[${type.toUpperCase()} ERROR]`, msg);
        return c.text(`Meditation Error: ${msg}`, 502);
    }
}
// ─── Routes ──────────────────────────────────────────────────────────────────
/** Most used languages route */
app.get("/stats", (c) => handleRequest(c, "stats", fetchTopLanguages, buildTopLangsSVG));
/** GitHub contribution streak route */
app.get("/streak", (c) => handleRequest(c, "streak", fetchStreak, buildStreakSVG));
/** General user statistics card route */
app.get("/card", (c) => handleRequest(c, "card", fetchUserStats, buildCardSVG));
/** API Info and health check */
app.get("/", (c) => c.json({
    status: "active",
    project: "Meditation (Manhwa & Stoic Stats)",
    endpoints: ["/stats", "/streak", "/card"]
}));
export default app;
