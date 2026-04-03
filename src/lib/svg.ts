// ─── Interfaces ─────────────────────────────────────────────────────────────

import { THEMES } from "./theme";

interface Language {
  name: string;
  percent: number;
  color: string;
}

interface UserStats {
  login: string;
  publicRepos: number;
  stars: number;
  followers: number;
  following: number;
}

interface StreakData {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  firstContrib: string;
  lastContrib: string;
}
// ─── Theme Collection ───────────────────────────────────────

const FONT = `font-family="'Segoe UI',system-ui,sans-serif"`;

// ─── Helpers ────────────────────────────────────────────────────────────────

function escXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fmtNum(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function shell(w: number, h: number, children: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ${FONT}>
    <rect width="${w}" height="${h}" rx="12" fill="${THEME.bg}" stroke="${THEME.border}" stroke-width="1"/>
    ${children}
  </svg>`;
}

// ─── Components ─────────────────────────────────────────────────────────────

/**
 * Merender grafik bahasa pemrograman yang paling sering digunakan.
 */
export function buildTopLangsSVG(langs: Language[]): string {
  const W = 350;
  const PX = 20;
  const barW = W - PX * 2;
  const rowH = 22;
  const H = 30 + 14 + 20 + rowH + langs.length * rowH + PX;

  let barX = PX;
  const segments = langs.map((l) => {
    const w = Math.max((l.percent / 100) * barW, 0);
    const seg = `<rect x="${barX.toFixed(2)}" y="60" width="${w.toFixed(2)}" height="8" fill="${l.color}"/>`;
    barX += w;
    return seg;
  }).join('');

  const firstCol = langs[0]?.color || THEME.border;
  const lastCol = langs[langs.length - 1]?.color || THEME.border;

  const caps = `
    <rect x="${PX}" y="60" width="6" height="8" rx="4" fill="${firstCol}"/>
    <rect x="${(PX + barW - 6).toFixed(2)}" y="60" width="6" height="8" rx="4" fill="${lastCol}"/>
  `;

  const rows = langs.map((l, i) => {
    const y = 110 + i * rowH;
    return `
      <circle cx="${PX + 6}" cy="${y - 4}" r="5" fill="${l.color}"/>
      <text x="${PX + 18}" y="${y}" font-size="12" fill="${THEME.text}">${escXml(l.name)}</text>
      <text x="${W - PX}" y="${y}" font-size="12" fill="${THEME.muted}" text-anchor="end">${l.percent}%</text>
    `;
  }).join('');

  return shell(W, H, `
    <text x="${PX}" y="34" font-size="14" font-weight="600" fill="${THEME.title}">Most Used Languages</text>
    ${segments}${caps}
    <rect x="${PX}" y="60" width="${barW}" height="8" rx="4" fill="none" stroke="${THEME.border}" stroke-width="0.5"/>
    ${rows}
  `);
}

/**
 * Merender statistik streak (komitmen harian).
 */
export function buildStreakSVG(data: StreakData): string {
  const W = 350;
  const H = 130;
  const PX = 175; // Center point

  const cols = [
    { x: 58,  val: data.totalContributions, label: 'Total Contributions', sub: `${fmtDate(data.firstContrib)} - Present`, color: THEME.title },
    { x: 175, val: data.currentStreak,      label: 'Current Streak',      sub: data.currentStreak > 0 ? '🔥 Meditation in progress' : 'Time to focus', color: THEME.fire },
    { x: 292, val: data.longestStreak,      label: 'Longest Streak',      sub: `${data.longestStreak} days`, color: THEME.title }
  ];

  const content = cols.map(c => `
    <text x="${c.x}" y="48" font-size="26" font-weight="700" fill="${c.color}" text-anchor="middle">${fmtNum(c.val)}</text>
    <text x="${c.x}" y="68" font-size="10" font-weight="600" fill="${THEME.text}" text-anchor="middle">${c.label}</text>
    <text x="${c.x}" y="88" font-size="9" fill="${THEME.muted}" text-anchor="middle">${escXml(c.sub)}</text>
  `).join('');

  const dividers = `
    <line x1="117" y1="30" x2="117" y2="100" stroke="${THEME.border}" stroke-width="1"/>
    <line x1="233" y1="30" x2="233" y2="100" stroke="${THEME.border}" stroke-width="1"/>
  `;

  return shell(W, H, dividers + content);
}

/**
 * Merender kartu statistik utama GitHub (Stats Card).
 * Didesain dengan gaya minimalis untuk project "Meditation".
 */
export function buildCardSVG(stats: UserStats): string {
  const W = 350;
  const H = 160; // Sedikit lebih tinggi untuk ruang bernapas (padding)
  const PX = 25; // Padding Horizontal

  // Data items yang akan ditampilkan di grid
  const items = [
    { label: 'Public Repos', value: fmtNum(stats.publicRepos), icon: '📦' },
    { label: 'Stars Earned', value: fmtNum(stats.stars),       icon: '⭐' },
    { label: 'Followers',    value: fmtNum(stats.followers),   icon: '👥' },
    { label: 'Following',    value: fmtNum(stats.following),   icon: '✨' },
  ];

  // Generate Grid: 2 Kolom x 2 Baris
  const grid = items.map((item, i) => {
    const isRightCol = i % 2 !== 0;
    const isBottomRow = i >= 2;
    
    const x = isRightCol ? 190 : PX;
    const y = isBottomRow ? 115 : 75;

    return `
      <g transform="translate(${x}, ${y})">
        <text font-size="11" fill="${THEME.muted}" ${FONT}>
          ${item.icon} ${escXml(item.label)}
        </text>
        <text y="20" font-size="18" font-weight="700" fill="${THEME.text}" ${FONT}>
          ${item.value}
        </text>
      </g>
    `;
  }).join('');

  // Garis pemisah tengah (Vertical Divider)
  const divider = `
    <line x1="175" y1="65" x2="175" y2="${H - 25}" 
          stroke="${THEME.border}" stroke-width="1" stroke-dasharray="2"/>
  `;

  return shell(W, H, `
    <g transform="translate(${PX}, 35)">
      <text font-size="16" font-weight="700" fill="${THEME.title}" ${FONT}>
        GitHub Stats
      </text>
      <text y="18" font-size="12" fill="${THEME.muted}" ${FONT}>
        @${escXml(stats.login)} — Reflecting Progress
      </text>
    </g>

    ${divider}
    ${grid}
    
    <circle cx="${W - 20}" cy="20" r="3" fill="${THEME.green}" opacity="0.6"/>
  `);
}