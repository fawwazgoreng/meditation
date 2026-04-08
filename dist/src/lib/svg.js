// ─── Types ───────────────────────────────────────────────────────────────────
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Escape special characters for XML/SVG safety */
function escXml(str) {
    return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[m] || m));
}
/** Format ISO date to US human-readable format */
function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
/** Format large numbers with 'k' suffix */
function fmtNum(n) {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}
// ─── SVG Shell ───────────────────────────────────────────────────────────────
/** Wrap content in a styled SVG container with filters and gradients */
function shell(w, h, children, theme) {
    const glowId = `glow-${theme.name}`;
    const gradId = `grad-${theme.name}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <style>
      .font { font-family: 'Segoe UI', system-ui, sans-serif; }
      .bold { font-weight: 700; }
      .anim-fade { animation: fadeIn 0.8s ease-in-out; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    </style>
    <filter id="${glowId}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg}" />
      <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0.8" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="14" fill="url(#${gradId})" stroke="${theme.border}" stroke-width="1.5"/>
  <circle cx="${w}" cy="${h}" r="50" fill="${theme.accent}" opacity="0.05"/>
  <g class="font anim-fade">${children}</g>
</svg>`;
}
// ─── Builders ────────────────────────────────────────────────────────────────
/** Build SVG for top used languages with progress bar */
export function buildTopLangsSVG(langs, theme) {
    const W = 350, PX = 25, BAR_W = W - (PX * 2);
    const H = 100 + (langs.length * 25);
    let currentX = 0;
    const progressBars = langs.map(l => {
        const width = (l.percent / 100) * BAR_W;
        const res = `<rect x="${PX + currentX}" y="65" width="${width}" height="10" fill="${l.color}"/>`;
        currentX += width;
        return res;
    }).join('');
    const list = langs.map((l, i) => {
        const y = 105 + (i * 22);
        return `<circle cx="${PX + 5}" cy="${y - 4}" r="5" fill="${l.color}"/>
            <text x="${PX + 18}" y="${y}" font-size="12" fill="${theme.text}">${escXml(l.name)}</text>
            <text x="${W - PX}" y="${y}" font-size="12" fill="${theme.muted}" text-anchor="end">${l.percent}%</text>`;
    }).join('');
    return shell(W, H, `
    <text x="${PX}" y="35" font-size="16" class="bold" fill="${theme.title}">Top Languages</text>
    <rect x="${PX}" y="65" width="${BAR_W}" height="10" rx="5" fill="${theme.border}" opacity="0.3"/>
    <g rx="5" clip-path="inset(0% round 5px)">${progressBars}</g>
    ${list}
  `, theme);
}
/** Build SVG for contribution streaks with glowing accent */
export function buildStreakSVG(data, theme) {
    const W = 350, H = 140, glowId = `glow-${theme.name}`;
    const cells = [
        { x: 58, val: data.totalContributions, label: 'Total', sub: 'Contributions' },
        { x: 175, val: data.currentStreak, label: 'Current', sub: '🔥 Streak', highlight: true },
        { x: 292, val: data.longestStreak, label: 'Longest', sub: 'Best Day' }
    ].map(c => `
    <g transform="translate(${c.x}, 0)">
      <text y="55" font-size="28" class="bold" fill="${c.highlight ? theme.accent : theme.title}" 
            text-anchor="middle" ${c.highlight ? `filter="url(#${glowId})"` : ''}>${fmtNum(c.val)}</text>
      <text y="78" font-size="11" class="bold" fill="${theme.text}" text-anchor="middle">${c.label}</text>
      <text y="95" font-size="9" fill="${theme.muted}" text-anchor="middle">${c.sub}</text>
    </g>`).join('');
    const footer = `<line x1="20" y1="115" x2="${W - 20}" y2="115" stroke="${theme.border}" stroke-dasharray="4"/>
                  <text x="175" y="128" font-size="8" fill="${theme.muted}" text-anchor="middle" opacity="0.6">
                    ${fmtDate(data.firstContrib)} — Present
                  </text>`;
    return shell(W, H, cells + footer, theme);
}
/** Build SVG for general user statistics grid */
export function buildCardSVG(stats, theme, extra = []) {
    const W = 350, PX = 25, COLS = 2, ROW_H = 40;
    const items = [
        { label: 'Public Repos', value: stats.publicRepos, icon: '📦' },
        { label: 'Stars Earned', value: stats.stars, icon: '⭐' },
        { label: 'Followers', value: stats.followers, icon: '👥' },
        { label: 'Following', value: stats.following, icon: '✨' },
        ...extra
    ];
    const H = 80 + Math.ceil(items.length / COLS) * ROW_H;
    const grid = items.map((item, i) => {
        const x = (i % COLS) === 1 ? 190 : PX;
        const y = 75 + Math.floor(i / COLS) * ROW_H;
        return `<g transform="translate(${x},${y})">
              <text font-size="11" fill="${theme.muted}">${item.icon ?? ''} ${escXml(item.label)}</text>
              <text y="20" font-size="18" class="bold" fill="${theme.text}">${fmtNum(Number(item.value))}</text>
            </g>`;
    }).join('');
    return shell(W, H, `
    <g transform="translate(${PX},35)">
      <text font-size="16" class="bold" fill="${theme.title}">GitHub Stats</text>
      <text y="18" font-size="12" fill="${theme.muted}">@${escXml(stats.login)} — Progress Card</text>
    </g>
    <line x1="175" y1="65" x2="175" y2="${H - 20}" stroke="${theme.border}" stroke-width="1" stroke-dasharray="2"/>
    ${grid}
    <circle cx="${W - 20}" cy="20" r="3" fill="${theme.green ?? '#3FB950'}" opacity="0.6"/>
  `, theme);
}
