// ─── Types ───────────────────────────────────────────────────────────────────
// ─── Config ──────────────────────────────────────────────────────────────────
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
/** Generate standard headers for GitHub API requests */
const ghHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": GITHUB_TOKEN ? `Bearer ${GITHUB_TOKEN}` : "",
    "User-Agent": "Meditation-App",
});
/** Generic helper to execute GitHub GraphQL queries */
async function fetchGH(query, variables) {
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: ghHeaders(),
        body: JSON.stringify({ query, variables }),
    });
    const result = (await res.json());
    if (result.errors)
        throw new Error(result.errors[0].message);
    if (!result.data || !result.data.user)
        throw new Error("User not found");
    return result.data.user;
}
// ─── Functions ───────────────────────────────────────────────────────────────
/** Fetch and calculate top programming languages used by user */
export async function fetchTopLanguages(username) {
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
    const langs = {};
    let totalSize = 0;
    // Aggregate language sizes across all owned repositories
    for (const repo of user.repositories.nodes) {
        for (const edge of repo.languages.edges) {
            const { name, color } = edge.node;
            if (!langs[name])
                langs[name] = { size: 0, color: color || "#858585" };
            langs[name].size += edge.size;
            totalSize += edge.size;
        }
    }
    // Sort by size and return top 8 languages with percentages
    return Object.entries(langs)
        .sort(([, a], [, b]) => b.size - a.size)
        .slice(0, 8)
        .map(([name, { size, color }]) => ({
        name,
        color,
        percent: parseFloat(((size / totalSize) * 100).toFixed(1)),
    }));
}
/** Fetch general profile statistics including followers and star counts */
export async function fetchUserStats(username) {
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
    const stars = user.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);
    return {
        name: user.name || user.login,
        login: user.login,
        followers: user.followers.totalCount,
        following: user.following.totalCount,
        publicRepos: user.repositories.totalCount,
        stars,
    };
}
/** Fetch and calculate contribution streaks using calendar data */
export async function fetchStreak(username) {
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
    const days = calendar.weeks.flatMap((w) => w.contributionDays);
    const today = new Date().toISOString().split("T")[0];
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    // Calculate longest streak by iterating through historical days
    for (const day of days) {
        if (day.contributionCount > 0) {
            tempStreak++;
            if (tempStreak > longestStreak)
                longestStreak = tempStreak;
        }
        else {
            if (day.date < today)
                tempStreak = 0;
        }
    }
    // Calculate current streak backwards from today with 1-day tolerance
    for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].contributionCount > 0) {
            currentStreak++;
        }
        else {
            if (days[i].date === today)
                continue;
            break;
        }
    }
    return {
        currentStreak,
        longestStreak,
        totalContributions: calendar.totalContributions,
        firstContrib: days.find((d) => d.contributionCount > 0)?.date || today,
        lastContrib: [...days].reverse().find((d) => d.contributionCount > 0)?.date || today,
    };
}
