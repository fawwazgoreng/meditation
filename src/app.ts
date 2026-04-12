import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cacheGet, cacheSet } from "./lib/cache.js";
import { fetchTopLanguages, fetchUserStats, fetchStreak } from "./lib/github.js";
import { buildTopLangsSVG, buildStreakSVG, buildCardSVG, buildErrorSVG } from "./lib/svg.js";
import { chooseTheme } from "./lib/theme.js";

const app = new Hono();

// ─── Types ───────────────────────────────────────────────────────────────────

type AppContext = { user: string; themeName: string | null };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract and validate query params */
function getParams(c: any): AppContext | null {
    const user = c.req.query("user")?.trim();
    if (!user) return null;
    return { user, themeName: c.req.query("theme") ?? null };
}

/** SVG response with caching headers */
function svgResponse(c: any, svg: string) {
    return c.body(svg, 200, {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600, s-maxage=3600 , stale-while-revalidate=1200",
        "X-Content-Type-Options": "nosniff",
    });
}

/** Shared: cache lookup → fetch → build SVG → respond */
async function handleRequest(
    c: any,
    type: "stats" | "streak" | "card",
    fetcher: (user: string) => Promise<any>,
    builder: (data: any, theme: any) => string,
) {
    const params = getParams(c);
    if (!params) return c.text("Error: query param 'user' is required.", 400);

    const cacheKey = `${type}:${params.user}:${params.themeName ?? "default"}`;

    try {
        const hit = cacheGet(cacheKey);
        if (hit) return svgResponse(c, hit);

        const theme = chooseTheme(params.themeName);
        const data = await fetcher(params.user);
        if (!data) throw new Error(`User not found: ${params.user}`);

        const svg = builder(data, theme);
        cacheSet(cacheKey, svg);
        return svgResponse(c, svg);
    } catch (err : any) {
        console.error(`[ERROR ${type}]`, err.message);
        
            let status = 500;
            let errorMsg = "Internal Server Error";
        
            if (err.message.includes("not found")) {
              status = 404;
              errorMsg = `User '${params.user}' not found`;
            } else if (err.message.includes("rate limit")) {
              status = 429;
              errorMsg = "GitHub Rate Limit Reached";
            } else if (err.message.includes("timeout") || err.message.includes("fetch")) {
              status = 504;
              errorMsg = "GitHub API is slow/down";
            }
        
            return c.body(buildErrorSVG(errorMsg, params.themeName), status, {
              "Content-Type": "image/svg+xml",
              "Cache-Control": "no-cache, no-store, must-revalidate",
            });
    }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use("*", prettyJSON());

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get("/stats",  (c) => handleRequest(c, "stats",  fetchTopLanguages, buildTopLangsSVG));
app.get("/streak", (c) => handleRequest(c, "streak", fetchStreak,       buildStreakSVG));
app.get("/card",   (c) => handleRequest(c, "card",   fetchUserStats,    buildCardSVG));

app.get("/", (c) => c.json({
    status: "active",
    endpoints: ["/stats", "/streak", "/card"],
}));

// ─── Error handler ────────────────────────────────────────────────────────────

app.onError((err, c) => {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[ERROR]", msg);
    return c.text(`Error: ${msg}`, 502);
});

export default app;