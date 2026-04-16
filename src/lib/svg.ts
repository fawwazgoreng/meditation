// ─── Types ───────────────────────────────────────────────────────────────────

export type Theme = {
    name: string;
    bg: string;
    border: string;
    text: string;
    muted: string;
    title: string;
    accent: string;
    fire?: string;
    green?: string;
};

export type Language   = { name: string; percent: number; color: string };
export type UserStats  = { login: string; publicRepos: number; stars: number; followers: number; following: number };
export type StreakData  = { totalContributions: number; currentStreak: number; longestStreak: number; firstContrib: string; lastContrib: string };
export type ActivityData = { login: string; totalContributions: number; days: { date: string; count: number }[] };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escXml(s: string): string {
    return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[m] || m);
}

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtNum(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── SVG Shell ───────────────────────────────────────────────────────────────

function shell(w: number, h: number, children: string, theme: Theme): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <style>
      .font { font-family: 'Segoe UI', system-ui, sans-serif; }
      .bold { font-weight: 700; }
      .anim-fade { animation: fadeIn 0.8s ease-in-out; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    </style>
    <filter id="glow-${theme.name}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="grad-${theme.name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="${theme.bg}"/>
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="14" fill="url(#grad-${theme.name})" stroke="${theme.border}" stroke-width="1.5"/>
  <circle cx="${w}" cy="${h}" r="50" fill="${theme.accent}" opacity="0.05"/>
  <g class="font anim-fade">${children}</g>
</svg>`;
}

// ─── Builders ────────────────────────────────────────────────────────────────

export function buildTopLangsSVG(langs: Language[], theme: Theme): string {
    const W = 350, PX = 25, BAR_W = W - PX * 2;
    const H = 100 + langs.length * 25;
    let cx = 0;

    const bars = langs.map((l) => {
        const w = (l.percent / 100) * BAR_W;
        const r = `<rect x="${PX + cx}" y="65" width="${w}" height="10" fill="${l.color}"/>`;
        cx += w;
        return r;
    }).join("");

    const list = langs.map((l, i) => {
        const y = 105 + i * 22;
        return `
        <circle cx="${PX + 5}" cy="${y - 4}" r="5" fill="${l.color}"/>
        <text x="${PX + 18}" y="${y}" font-size="12" fill="${theme.text}">${escXml(l.name)}</text>
        <text x="${W - PX}" y="${y}" font-size="12" fill="${theme.muted}" text-anchor="end">${l.percent}%</text>`;
    }).join("");

    return shell(W, H, `
        <text x="${PX}" y="35" font-size="16" class="bold" fill="${theme.title}">Top Languages</text>
        <rect x="${PX}" y="65" width="${BAR_W}" height="10" rx="5" fill="${theme.border}" opacity="0.3"/>
        ${bars}
        ${list}
    `, theme);
}

export function buildStreakSVG(data: StreakData, theme: Theme): string {
    const W = 350, H = 140;

    const cells = [
        { x: 58,  val: data.totalContributions, label: "Total",   sub: "Contributions"  },
        { x: 175, val: data.currentStreak,       label: "Current", sub: "🔥 Streak", hi: true },
        { x: 292, val: data.longestStreak,        label: "Longest", sub: "Best Day"       },
    ].map((c) => `
        <g transform="translate(${c.x},0)">
            <text y="55" font-size="28" class="bold" text-anchor="middle"
                  fill="${c.hi ? theme.accent : theme.title}"
                  ${c.hi ? `filter="url(#glow-${theme.name})"` : ""}>${fmtNum(c.val)}</text>
            <text y="78" font-size="11" class="bold" fill="${theme.text}" text-anchor="middle">${c.label}</text>
            <text y="95" font-size="9"               fill="${theme.muted}" text-anchor="middle">${c.sub}</text>
        </g>`
    ).join("");

    return shell(W, H, `
        ${cells}
        <line x1="20" y1="115" x2="${W - 20}" y2="115" stroke="${theme.border}" stroke-dasharray="4"/>
        <text x="175" y="128" font-size="8" fill="${theme.muted}" text-anchor="middle" opacity="0.6">
            ${fmtDate(data.firstContrib)} — Present
        </text>
    `, theme);
}

export function buildCardSVG(stats: UserStats, theme: Theme, extra: any[] = []): string {
    const W = 350, PX = 25, COLS = 2, ROW_H = 40;
    const items = [
        { label: "Public Repos", value: stats.publicRepos, icon: "📦" },
        { label: "Stars Earned", value: stats.stars,       icon: "⭐" },
        { label: "Followers",    value: stats.followers,   icon: "👥" },
        { label: "Following",    value: stats.following,   icon: "✨" },
        ...extra,
    ];
    const H = 80 + Math.ceil(items.length / COLS) * ROW_H;

    const grid = items.map((item, i) => {
        const x = i % COLS === 1 ? 190 : PX;
        const y = 75 + Math.floor(i / COLS) * ROW_H;
        return `
        <g transform="translate(${x},${y})">
            <text font-size="11" fill="${theme.muted}">${item.icon ?? ""} ${escXml(item.label)}</text>
            <text y="20" font-size="18" class="bold" fill="${theme.text}">${fmtNum(Number(item.value))}</text>
        </g>`;
    }).join("");

    return shell(W, H, `
        <g transform="translate(${PX},35)">
            <text font-size="16" class="bold" fill="${theme.title}">GitHub Stats</text>
            <text y="18" font-size="12" fill="${theme.muted}">@${escXml(stats.login)} — Progress Card</text>
        </g>
        <line x1="175" y1="65" x2="175" y2="${H - 20}" stroke="${theme.border}" stroke-width="1" stroke-dasharray="2"/>
        ${grid}
        <circle cx="${W - 20}" cy="20" r="3" fill="${theme.green ?? "#3FB950"}" opacity="0.6"/>
    `, theme);
}

export function buildActivityGraph(data: ActivityData, theme: Theme): string {
    const W       = 600;
    const PX      = 55;
    const PY      = 40;
    const CHART_W = W - PX - 30;
    const CHART_H = 120;
    const STATS_H = 42; // stat row height below chart
    const H       = PY + CHART_H + 32 + STATS_H + 12;

    const { days } = data;
    const maxCount  = Math.max(...days.map((d) => d.count), 1);

    // Map each day to SVG coordinates
    const points = days.map((day, i) => ({
        x: PX + (i / (days.length - 1)) * CHART_W,
        y: PY + CHART_H - (day.count / maxCount) * CHART_H,
        ...day,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L ${points.at(-1)!.x},${PY + CHART_H} L ${points[0].x},${PY + CHART_H} Z`;

    // Y-axis — 3 ticks (0, mid, max)
    const yGrid = [0, 0.5, 1].map((r) => {
        const val = Math.round(r * maxCount);
        const y   = PY + CHART_H - r * CHART_H;
        return `
        <line x1="${PX}" y1="${y}" x2="${PX + CHART_W}" y2="${y}"
              stroke="${theme.border}" stroke-width="0.4" stroke-dasharray="3 4"/>
        <text x="${PX - 8}" y="${y + 3.5}" font-size="8" fill="${theme.muted}" text-anchor="end">${val}</text>`;
    }).join("");

    // X-axis — month label only on month change
    let lastMonth = -1;
    const xLabels = points.map((p) => {
        const month = new Date(p.date).getMonth();
        if (month === lastMonth) return "";
        lastMonth = month;
        const label = new Date(p.date).toLocaleString("en-US", { month: "short" });
        return `<text x="${p.x.toFixed(1)}" y="${PY + CHART_H + 14}" font-size="8" fill="${theme.muted}" text-anchor="middle">${label}</text>`;
    }).join("");

    // Peak circles — local maxima above 50% of maxCount, with date label
    const peaks = points.filter((p, i) => {
        if (p.count < maxCount * 0.5) return false;
        return p.count >= (points[i - 1]?.count ?? 0) && p.count >= (points[i + 1]?.count ?? 0);
    });

    const peakCircles = peaks.map((p) => {
        const label  = new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const labelX = Math.min(Math.max(p.x, PX + 20), PX + CHART_W - 20);
        return `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3"
                fill="${theme.bg}" stroke="${theme.accent}" stroke-width="1.5"/>
        <text x="${labelX.toFixed(1)}" y="${(p.y - 10).toFixed(1)}"
              font-size="7" fill="${theme.muted}" text-anchor="middle">${label}</text>`;
    }).join("");

    // Stat row — 4 metrics below chart
    const totalActiveDays = days.filter((d) => d.count > 0).length;
    const avgPerDay       = (data.totalContributions / days.length).toFixed(1);
    const peakDay         = days.reduce((a, b) => (b.count > a.count ? b : a));
    const peakLabel       = new Date(peakDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const statsY  = PY + CHART_H + 32;
    const pillW   = CHART_W / 4;
    const metrics = [
        { label: "Total",       value: fmtNum(data.totalContributions) },
        { label: "Active days", value: String(totalActiveDays)         },
        { label: "Daily avg",   value: avgPerDay                       },
        { label: "Best day",    value: `${fmtNum(peakDay.count)} (${peakLabel})` },
    ];

    const statRow = metrics.map((m, i) => {
        const x = PX + i * pillW + pillW / 2;
        return `
        <text x="${x}" y="${statsY}"      font-size="7"  fill="${theme.muted}" text-anchor="middle">${m.label}</text>
        <text x="${x}" y="${statsY + 14}" font-size="11" fill="${theme.text}"  text-anchor="middle" class="bold">${m.value}</text>`;
    }).join("");

    const gradId = `ag-fill-${theme.name}`;

    return shell(W, H, `
        <text x="${PX}" y="22" font-size="13" class="bold" fill="${theme.title}">Activity Graph</text>
        <text x="${PX}" y="35" font-size="9" fill="${theme.muted}">@${escXml(data.login)}</text>

        <defs>
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stop-color="${theme.accent}" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
            </linearGradient>
        </defs>

        <line x1="${PX}" y1="${PY}" x2="${PX}" y2="${PY + CHART_H}" stroke="${theme.border}" stroke-width="0.8"/>
        <line x1="${PX}" y1="${PY + CHART_H}" x2="${PX + CHART_W}" y2="${PY + CHART_H}" stroke="${theme.border}" stroke-width="0.8"/>

        ${yGrid}
        ${xLabels}
        <path d="${areaPath}" fill="url(#${gradId})"/>
        <path d="${linePath}" fill="none" stroke="${theme.accent}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
        ${peakCircles}

        <line x1="${PX}" y1="${statsY - 10}" x2="${PX + CHART_W}" y2="${statsY - 10}"
              stroke="${theme.border}" stroke-width="0.4" stroke-dasharray="3 4" opacity="0.5"/>
        ${statRow}

        <text x="${PX + CHART_W}" y="${H - 6}" font-size="7" fill="${theme.muted}" text-anchor="end" opacity="0.5">
            ${days[0].date} — ${days.at(-1)!.date}
        </text>
    `, theme);
}

export function buildErrorSVG(message: string, theme: Theme): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="100">
        <rect width="350" height="100" rx="14" fill="${theme.bg}" stroke="#ff4444" stroke-width="2"/>
        <text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle"
              fill="#ff4444" font-family="sans-serif" font-weight="bold" font-size="13">
            Oops! Something went wrong
        </text>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle"
              fill="${theme.text}" font-family="sans-serif" font-size="11">
            ${escXml(message)}
        </text>
    </svg>`;
}