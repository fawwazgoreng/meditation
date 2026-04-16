// ─── Types ───────────────────────────────────────────────────────────────────

export interface Language {
    name: string;
    color: string;
    percent: number;
}

export interface UserStats {
    name: string;
    login: string;
    followers: number;
    following: number;
    publicRepos: number;
    stars: number;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    totalContributions: number;
    firstContrib: string;
    lastContrib: string;
}

// ✅ New — dedicated type for activity graph
export interface ActivityDay {
    date: string;
    count: number;
}

export interface ActivityData {
    login: string;
    totalContributions: number;
    days: ActivityDay[];
}

// ─── Config ──────────────────────────────────────────────────────────────────

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

const ghHeaders = () => {
    if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN environment variable is not set");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "User-Agent": "Meditation-App",
    };
};

async function fetchGH(query: string, variables: object) {
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: ghHeaders(),
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(8000),
    });

    const result = (await res.json()) as any;
    if (result.errors) throw new Error(result.errors[0].message);
    if (!result.data || !result.data.user) throw new Error("User not found");

    return result.data.user;
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

export async function fetchTopLanguages(username: string): Promise<Language[]> {
    const query = `
        query($login: String!) {
            user(login: $login) {
                repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
                    nodes {
                        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
                            edges { size node { name color } }
                        }
                    }
                }
            }
        }
    `;

    const user = await fetchGH(query, { login: username });
    const langs: Record<string, { size: number; color: string }> = {};
    let totalSize = 0;

    for (const repo of user.repositories.nodes) {
        for (const edge of repo.languages.edges) {
            const { name, color } = edge.node;
            if (!langs[name]) langs[name] = { size: 0, color: color || "#858585" };
            langs[name].size += edge.size;
            totalSize += edge.size;
        }
    }

    return Object.entries(langs)
        .sort(([, a], [, b]) => b.size - a.size)
        .slice(0, 8)
        .map(([name, { size, color }]) => ({
            name,
            color,
            percent: parseFloat(((size / totalSize) * 100).toFixed(1)),
        }));
}

export async function fetchUserStats(username: string): Promise<UserStats> {
    const query = `
        query($login: String!) {
            user(login: $login) {
                name login
                followers { totalCount }
                following { totalCount }
                repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
                    totalCount
                    nodes { stargazerCount }
                }
            }
        }
    `;

    const user = await fetchGH(query, { login: username });
    const stars = user.repositories.nodes.reduce(
        (s: number, r: any) => s + r.stargazerCount, 0
    );

    return {
        name: user.name || user.login,
        login: user.login,
        followers: user.followers.totalCount,
        following: user.following.totalCount,
        publicRepos: user.repositories.totalCount,
        stars,
    };
}

export async function fetchStreak(username: string): Promise<StreakData> {
    const query = `
        query($login: String!) {
            user(login: $login) {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays { contributionCount date }
                        }
                    }
                }
            }
        }
    `;

    const user = await fetchGH(query, { login: username });
    const calendar = user.contributionsCollection.contributionCalendar;
    const days = calendar.weeks.flatMap((w: any) => w.contributionDays);
    const today = new Date().toISOString().split("T")[0];

    let currentStreak = 0, longestStreak = 0, tempStreak = 0;

    for (const day of days) {
        if (day.contributionCount > 0) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
            if (day.date < today) tempStreak = 0;
        }
    }

    for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].contributionCount > 0) {
            currentStreak++;
        } else {
            if (days[i].date === today) continue;
            break;
        }
    }

    return {
        currentStreak,
        longestStreak,
        totalContributions: calendar.totalContributions,
        firstContrib: days.find((d: any) => d.contributionCount > 0)?.date || today,
        lastContrib: [...days].reverse().find((d: any) => d.contributionCount > 0)?.date || today,
    };
}

// ✅ Dedicated fetcher for activity graph with login included
export async function fetchActivityGraph(username: string): Promise<ActivityData> {
    const query = `
        query($login: String!) {
            user(login: $login) {
                login
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays { contributionCount date }
                        }
                    }
                }
            }
        }
    `;

    const user = await fetchGH(query, { login: username });
    const calendar = user.contributionsCollection.contributionCalendar;
    const allDays = calendar.weeks.flatMap((w: any) => w.contributionDays);

    const lastTwoMonths = allDays.slice(-30);

    return {
        login: user.login,
        totalContributions: calendar.totalContributions,
        days: lastTwoMonths.map((d: any) => ({ 
            date: d.date, 
            count: d.contributionCount 
        })),
    };
}