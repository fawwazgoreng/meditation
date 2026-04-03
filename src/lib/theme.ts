// ─── Theme Type ────────────────────────────────────────────
export type Theme = {
    name: string;
    bg: string;
    border: string;
    text: string;
    muted: string;
    title: string;
    accent: string;
};

// ─── Theme Collection (Array) ──────────────────────────────
export const THEMES: Theme[] = [
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

    // ─── ✨ Tambahan Theme Baru ──────────────────────────────
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
];

export const chooseTheme = (choice?: string) => {
    return (
        THEMES.find((t) => t.name === choice) ?? THEMES[0] // fallback ke default (dark)
    );
};
