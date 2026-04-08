// ─── Theme Type ──────────────────────────────────────────────────────────────
// ─── Theme Collection ────────────────────────────────────────────────────────
export const THEMES = [
    {
        name: "dark",
        bg: "#0D1117",
        border: "#30363D",
        text: "#C9D1D9",
        muted: "#8B949E",
        title: "#00D4FF",
        accent: "#58A6FF",
    },
    {
        name: "light",
        bg: "#FFFFFF",
        border: "#D0D7DE",
        text: "#24292F",
        muted: "#57606A",
        title: "#0969DA",
        accent: "#1F6FEB",
    },
    // ─── Manhwa Inspired Themes ───
    {
        name: "orv",
        bg: "#050B16", // Nebula void space
        border: "#1E293B",
        text: "#E2E8F0", // Starlight white
        muted: "#64748B",
        title: "#FACC15", // Gold [Fable] grade
        accent: "#38BDF8", // Transcendence blue
    },
    {
        name: "pickmeup",
        bg: "#0A0A0B", // Dark game UI
        border: "#27272A",
        text: "#FAFAFA",
        muted: "#71717A",
        title: "#0EA5E9", // Mana interface blue
        accent: "#EF4444", // Combat/Gacha red
    },
    {
        name: "northernblade",
        bg: "#050505", // Pitch black ink
        border: "#1F2937", // Blade steel grey
        text: "#F3F4F6", // Northern snow white
        muted: "#6B7280",
        title: "#8B5CF6", // Silent Night purple
        accent: "#6366F1", // Sharp indigo
    },
    // ─── Standard Themes ───
    {
        name: "galaxy",
        bg: "#0B0F1A",
        border: "#1F2A44",
        text: "#E6EDF3",
        muted: "#7D8590",
        title: "#8B5CF6",
        accent: "#22D3EE",
    },
    {
        name: "moonlight",
        bg: "#0F172A",
        border: "#334155",
        text: "#E2E8F0",
        muted: "#94A3B8",
        title: "#38BDF8",
        accent: "#F1F5F9",
    },
    {
        name: "desert",
        bg: "#2B2118",
        border: "#5A4634",
        text: "#F5E6CA",
        muted: "#C2A878",
        title: "#E9C46A",
        accent: "#F4A261",
    },
    {
        name: "autumn",
        bg: "#1C1917",
        border: "#78350F",
        text: "#FED7AA",
        muted: "#FB923C",
        title: "#F97316",
        accent: "#EA580C",
    },
    {
        name: "winter",
        bg: "#0B1220",
        border: "#1E3A8A",
        text: "#E0F2FE",
        muted: "#93C5FD",
        title: "#60A5FA",
        accent: "#38BDF8",
    },
    {
        name: "forest",
        bg: "#0B1F14",
        border: "#14532D",
        text: "#D1FAE5",
        muted: "#6EE7B7",
        title: "#22C55E",
        accent: "#4ADE80",
    },
    {
        name: "volcano",
        bg: "#1A0F0F",
        border: "#7F1D1D",
        text: "#FECACA",
        muted: "#F87171",
        title: "#EF4444",
        accent: "#DC2626",
    },
    {
        name: "ocean",
        bg: "#0A192F",
        border: "#1E3A8A",
        text: "#E0F2FE",
        muted: "#7DD3FC",
        title: "#38BDF8",
        accent: "#0EA5E9",
    },
    {
        name: "sunset",
        bg: "#1A0F1F",
        border: "#7C2D12",
        text: "#FFE4E6",
        muted: "#FDA4AF",
        title: "#FB7185",
        accent: "#F43F5E",
    },
    {
        name: "cyberpunk",
        bg: "#0A0F1C",
        border: "#1F2937",
        text: "#E5E7EB",
        muted: "#9CA3AF",
        title: "#F0ABFC",
        accent: "#22D3EE",
    },
    {
        name: "neon",
        bg: "#050505",
        border: "#222222",
        text: "#EDEDED",
        muted: "#AAAAAA",
        title: "#39FF14",
        accent: "#00FFFF",
    },
    {
        name: "coffee",
        bg: "#1C1410",
        border: "#6F4E37",
        text: "#F5EDE3",
        muted: "#C4A484",
        title: "#D4A373",
        accent: "#B08968",
    },
    {
        name: "stoic",
        bg: "#000000",
        border: "#222222",
        text: "#FFFFFF",
        muted: "#666666",
        title: "#FFFFFF",
        accent: "#FFFFFF",
    },
    {
        name: "zen",
        bg: "#FDFCF0",
        border: "#E2E2D0",
        text: "#2F2F2F",
        muted: "#717171",
        title: "#1A1A1A",
        accent: "#434343",
    },
];
/** Select theme by name or return default dark theme */
export const chooseTheme = (choice) => {
    const name = (choice || "dark").toLowerCase().trim();
    // Find matching theme or fallback to the first one (dark)
    return THEMES.find((t) => t.name === name) || THEMES[0];
};
