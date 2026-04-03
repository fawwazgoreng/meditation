// ─── Types ────────────────────────────────────────────────
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

export interface Language {
  name: string;
  percent: number;
  color: string;
}

export interface UserStats {
  login: string;
  publicRepos: number;
  stars: number;
  followers: number;
  following: number;
}

export interface StreakData {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  firstContrib: string;
  lastContrib: string;
}

// ─── Helpers ───────────────────────────────────────────────
function escXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtNum(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

// ─── Theme Picker ─────────────────────────────────────────
export function getTheme(name: string, themes: Theme[]): Theme {
  for (var i = 0; i < themes.length; i++) {
    if (themes[i].name === name) return themes[i];
  }
  return themes[0];
}

// ─── SVG Shell ─────────────────────────────────────────────
var FONT = "font-family:'Segoe UI',system-ui,sans-serif";

function shell(
  w: number,
  h: number,
  children: string,
  theme: Theme
): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    w +
    '" height="' +
    h +
    '" ' +
    FONT +
    ">" +
    '<rect width="' +
    w +
    '" height="' +
    h +
    '" rx="12" fill="' +
    theme.bg +
    '" stroke="' +
    theme.border +
    '" stroke-width="1"/>' +
    children +
    "</svg>"
  );
}

// ─── Top Languages ─────────────────────────────────────────
export function buildTopLangsSVG(
  langs: Language[],
  theme: Theme
): string {
  var W = 350;
  var PX = 20;
  var BAR_W = W - PX * 2;
  var ROW_H = 22;

  var H = 30 + 14 + 20 + ROW_H + langs.length * ROW_H + PX;

  var barX = PX;
  var segments = "";

  for (var i = 0; i < langs.length; i++) {
    var l = langs[i];
    var width = Math.max((l.percent / 100) * BAR_W, 0);

    segments +=
      '<rect x="' +
      barX.toFixed(2) +
      '" y="60" width="' +
      width.toFixed(2) +
      '" height="8" fill="' +
      l.color +
      '"/>';

    barX += width;
  }

  var firstCol = langs.length ? langs[0].color : theme.border;
  var lastCol = langs.length
    ? langs[langs.length - 1].color
    : theme.border;

  var caps =
    '<rect x="' +
    PX +
    '" y="60" width="6" height="8" rx="4" fill="' +
    firstCol +
    '"/>' +
    '<rect x="' +
    (PX + BAR_W - 6).toFixed(2) +
    '" y="60" width="6" height="8" rx="4" fill="' +
    lastCol +
    '"/>';

  var rows = "";

  for (var j = 0; j < langs.length; j++) {
    var lang = langs[j];
    var y = 110 + j * ROW_H;

    rows +=
      '<circle cx="' +
      (PX + 6) +
      '" cy="' +
      (y - 4) +
      '" r="5" fill="' +
      lang.color +
      '"/>' +
      '<text x="' +
      (PX + 18) +
      '" y="' +
      y +
      '" font-size="12" fill="' +
      theme.text +
      '">' +
      escXml(lang.name) +
      "</text>" +
      '<text x="' +
      (W - PX) +
      '" y="' +
      y +
      '" font-size="12" fill="' +
      theme.muted +
      '" text-anchor="end">' +
      lang.percent +
      "%</text>";
  }

  var children =
    '<text x="' +
    PX +
    '" y="34" font-size="14" font-weight="600" fill="' +
    theme.title +
    '">Most Used Languages</text>' +
    segments +
    caps +
    '<rect x="' +
    PX +
    '" y="60" width="' +
    BAR_W +
    '" height="8" rx="4" fill="none" stroke="' +
    theme.border +
    '" stroke-width="0.5"/>' +
    rows;

  return shell(W, H, children, theme);
}

// ─── Streak ────────────────────────────────────────────────
export function buildStreakSVG(
  data: StreakData,
  theme: Theme
): string {
  var W = 350;
  var H = 130;

  var fireColor = theme.fire || "#FF6B35";

  var cols = [
    {
      x: 58,
      val: data.totalContributions,
      label: "Total Contributions",
      sub: fmtDate(data.firstContrib) + " - Present",
      color: theme.title,
    },
    {
      x: 175,
      val: data.currentStreak,
      label: "Current Streak",
      sub:
        data.currentStreak > 0
          ? "🔥 Meditation in progress"
          : "Time to focus",
      color: fireColor,
    },
    {
      x: 292,
      val: data.longestStreak,
      label: "Longest Streak",
      sub: data.longestStreak + " days",
      color: theme.title,
    },
  ];

  var content = "";

  for (var i = 0; i < cols.length; i++) {
    var c = cols[i];

    content +=
      '<text x="' +
      c.x +
      '" y="48" font-size="26" font-weight="700" fill="' +
      c.color +
      '" text-anchor="middle">' +
      fmtNum(c.val) +
      "</text>" +
      '<text x="' +
      c.x +
      '" y="68" font-size="10" font-weight="600" fill="' +
      theme.text +
      '" text-anchor="middle">' +
      c.label +
      "</text>" +
      '<text x="' +
      c.x +
      '" y="88" font-size="9" fill="' +
      theme.muted +
      '" text-anchor="middle">' +
      escXml(c.sub) +
      "</text>";
  }

  var dividers =
    '<line x1="117" y1="30" x2="117" y2="100" stroke="' +
    theme.border +
    '" stroke-width="1"/>' +
    '<line x1="233" y1="30" x2="233" y2="100" stroke="' +
    theme.border +
    '" stroke-width="1"/>';

  return shell(W, H, dividers + content, theme);
}

// ─── Card ─────────────────────────────────────────────────
export function buildCardSVG(
  stats: UserStats,
  theme: Theme
): string {
  var W = 350;
  var H = 160;
  var PX = 25;

  var greenColor = theme.green || "#3FB950";

  var items = [
    { label: "Public Repos", value: fmtNum(stats.publicRepos), icon: "📦" },
    { label: "Stars Earned", value: fmtNum(stats.stars), icon: "⭐" },
    { label: "Followers", value: fmtNum(stats.followers), icon: "👥" },
    { label: "Following", value: fmtNum(stats.following), icon: "✨" },
  ];

  var grid = "";

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var x = i % 2 ? 190 : PX;
    var y = i >= 2 ? 115 : 75;

    grid +=
      '<g transform="translate(' +
      x +
      "," +
      y +
      ')">' +
      '<text font-size="11" fill="' +
      theme.muted +
      '">' +
      item.icon +
      " " +
      escXml(item.label) +
      "</text>" +
      '<text y="20" font-size="18" font-weight="700" fill="' +
      theme.text +
      '">' +
      item.value +
      "</text></g>";
  }

  var divider =
    '<line x1="175" y1="65" x2="175" y2="' +
    (H - 25) +
    '" stroke="' +
    theme.border +
    '" stroke-width="1" stroke-dasharray="2"/>';

  var children =
    '<g transform="translate(' +
    PX +
    ',35)">' +
    '<text font-size="16" font-weight="700" fill="' +
    theme.title +
    '">GitHub Stats</text>' +
    '<text y="18" font-size="12" fill="' +
    theme.muted +
    '">@' +
    escXml(stats.login) +
    " — Reflecting Progress</text></g>" +
    divider +
    grid +
    '<circle cx="' +
    (W - 20) +
    '" cy="20" r="3" fill="' +
    greenColor +
    '" opacity="0.6"/>';

  return shell(W, H, children, theme);
}