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

// ─── Top languages ───────────────────────────────────────────────────────────

var GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// ─── Headers ─────────────────────────────────────────────────────────────────

function ghHeaders(): Record<string, string> {
  var headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = 'Bearer ' + GITHUB_TOKEN;
  }
  return headers;
}

// ─── Helper Fetch (Simulasi asinkronus ES3 menggunakan Callback/Promise) ──────

// Catatan: ES3 murni tidak punya Promise, tapi TS biasanya ditranspile ke 
// fungsi yang mendukungnya. Kita gunakan sintaks fungsi biasa.

export async function fetchTopLanguages(username: string): Promise<Language[]> {
  var query = 'query($login: String!) { ' +
    'user(login: $login) { ' +
      'repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) { ' +
        'nodes { ' +
          'languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { ' +
            'edges { size node { name color } } ' +
          '} ' +
        '} ' +
      '} ' +
    '} ' +
  '}';

  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ query: query, variables: { login: username } })
  })
  .then(function(res) { return res.json(); })
  .then(function(result: any) {
    var data = result.data;
    var langs: Record<string, { size: number; color: string }> = {};
    var nodes = data.user.repositories.nodes;
    var total = 0;

    for (var i = 0; i < nodes.length; i++) {
      var edges = nodes[i].languages.edges;
      for (var j = 0; j < edges.length; j++) {
        var edge = edges[j];
        var name = edge.node.name;
        if (!langs[name]) {
          langs[name] = { size: 0, color: edge.node.color || '#858585' };
        }
        langs[name].size += edge.size;
        total += edge.size;
      }
    }

    var resultList: Language[] = [];
    var keys = Object.keys(langs);
    
    // Sort manual gaya ES3
    keys.sort(function(a, b) {
      return langs[b].size - langs[a].size;
    });

    var limit = keys.length > 8 ? 8 : keys.length;
    for (var k = 0; k < limit; k++) {
      var key = keys[k];
      resultList.push({
        name: key,
        color: langs[key].color,
        percent: parseFloat(((langs[key].size / total) * 100).toFixed(1))
      });
    }
    return resultList;
  });
}

// ─── Streak Logic (ES3 Friendly) ─────────────────────────────────────────────

export async function fetchStreak(username: string): Promise<StreakData> {
  return fetch('https://github.com/users/' + username + '/contributions')
    .then(function(res) { return res.text(); })
    .then(function(html) {
      var dayRe = /data-count="(\d+)" data-date="(\d{4}-\d{2}-\d{2})"/g;
      var days: Array<{ date: string; count: number }> = [];
      var m;

      while ((m = dayRe.exec(html)) !== null) {
        days.push({ date: m[2], count: parseInt(m[1], 10) });
      }

      days.sort(function(a, b) { 
        return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); 
      });

      var today = new Date().toISOString().slice(0, 10);
      var totalContributions = 0;
      var longestStreak = 0;
      var currentStreak = 0;
      var run = 0;

      for (var i = days.length - 1; i >= 0; i--) {
        var d = days[i];
        totalContributions += d.count;

        if (d.count > 0) {
          run++;
          if (run > longestStreak) longestStreak = run;
          if (currentStreak === run - 1) currentStreak = run;
        } else {
          if (d.date < today) run = 0;
        }
      }

      // Pengganti .findLast (ES3 tidak punya)
      var firstContrib = today;
      var lastContrib = today;

      for (var n = 0; n < days.length; n++) {
        if (days[n].count > 0) {
          firstContrib = days[n].date;
          break;
        }
      }
      for (var x = days.length - 1; x >= 0; x--) {
        if (days[x].count > 0) {
          lastContrib = days[x].date;
          break;
        }
      }

      return {
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        totalContributions: totalContributions,
        firstContrib: firstContrib,
        lastContrib: lastContrib
      };
    });
}

/**
 * Mengambil statistik profil user dan total stars.
 * Menggunakan sintaks ES3-compatible dengan Type Annotations TypeScript.
 */
export async function fetchUserStats(username: string): Promise<UserStats> {
  // Query GraphQL dalam bentuk string biasa (ES3 tidak mendukung backticks)
  var query = 'query($login: String!) { ' +
    'user(login: $login) { ' +
      'name ' +
      'login ' +
      'followers { totalCount } ' +
      'following  { totalCount } ' +
      'repositories(first: 100, ownerAffiliations: OWNER, isFork: false) { ' +
        'totalCount ' +
        'nodes { stargazerCount } ' +
      '} ' +
    '} ' +
  '}';

  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: ghHeaders(), // Memanggil fungsi helper headers yang sudah dibuat sebelumnya
    body: JSON.stringify({ 
      query: query, 
      variables: { login: username } 
    })
  })
  .then(function(res) {
    if (!res.ok) {
      throw new Error('GitHub GraphQL ' + res.status);
    }
    return res.json();
  })
  .then(function(result: any) {
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    var u = result.data.user;
    var nodes = u.repositories.nodes;
    var totalStars = 0;

    // Menggunakan for-loop tradisional (ES3) menggantikan .reduce()
    for (var i = 0; i < nodes.length; i++) {
      totalStars += nodes[i].stargazerCount;
    }

    // Mengembalikan objek sesuai interface UserStats
    return {
      name: u.name || u.login,
      login: u.login,
      followers: u.followers.totalCount,
      following: u.following.totalCount,
      publicRepos: u.repositories.totalCount,
      stars: totalStars
    };
  });
}