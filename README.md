# Meditation — GitHub Stats API

> A serverless API that generates embeddable **SVG stat cards** for GitHub profiles.
> Built with **Hono** and deployed on **Vercel**.
> Inspired by manhwa titles and stoic philosophy.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun / Node.js |
| Framework | Hono |
| Deployment | Vercel (Serverless) |
| Data Source | GitHub GraphQL API |
| Cache | In-memory (1 hour TTL) |
| Language | TypeScript |

---

## ✨ Features

- Top programming languages card with progress bar
- Contribution streak card (current, longest, total)
- General profile stats card (repos, stars, followers)
- 19 built-in themes including manhwa-inspired palettes
- SVG responses with fade-in animation
- In-memory caching per user + theme combination
- Embeddable via `<img>` tag or Markdown

---

## 📁 Project Structure

```
.
├── api/
│   └── api.yaml        # OpenAPI 3.0 specification
├── docs/
│   └── index.ts        # Vercel serverless entry point
├── src/
│   ├── app.ts          # Hono app — routes, middleware, handlers
│   └── lib/
│       ├── cache.ts    # In-memory cache with TTL
│       ├── github.ts   # GitHub GraphQL API fetchers
│       ├── svg.ts      # SVG card builders
│       └── theme.ts    # Theme definitions and selector
├── vercel.json         # Vercel routing config
├── tsconfig.json
└── package.json
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

- **Node.js** v18+ or **Bun**
- **Vercel CLI** (for deployment)
- A **GitHub Personal Access Token** with `read:user` and `repo` scopes

---

## 🚀 Quick Embed

Paste these into any GitHub README:

```markdown
![Top Languages](https://meditation-cyan.vercel.app/stats?user=YOUR_USERNAME&theme=dark)
![Streak](https://meditation-cyan.vercel.app/streak?user=YOUR_USERNAME&theme=ocean)
![Stats Card](https://meditation-cyan.vercel.app/card?user=YOUR_USERNAME&theme=orv)
![Activity Graph](https://meditation-cyan.vercel.app/activity?user=YOUR_USERNAME&theme=orv)
```

---

## 🖥️ Local Development

### Setup

```bash
git clone https://github.com/fawwazgoreng/meditation.git
cd meditation
npm install
# or
bun install
```

### Environment Setup

```bash
cp .env.example .env
```

Example `.env`:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

> ⚠️ The GitHub GraphQL API requires a valid token. Without it, all requests will hang.

### Run Development Server

```bash
npx tsx src/app.ts
# or
bun src/app.ts
```

API will be available at:

```
http://localhost:3000
```

---

## 🔗 API Endpoints

Base URL:

```
https://meditation-cyan.vercel.app
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Service status and available endpoints |
| GET | `/stats` | Top programming languages SVG card |
| GET | `/streak` | Contribution streak SVG card |
| GET | `/card` | General profile statistics SVG card |
| GET | `/activity` | Contribution graph in one month |

### Query Parameters

| Parameter | Required | Description |
|---|---|---|
| `user` | ✅ Yes | GitHub username |
| `theme` | ❌ No | Visual theme name (default: `dark`) |

### Example Requests

```bash
# Top languages with ocean theme
curl "https://meditation-cyan.vercel.app/stats?user=fawwazgoreng&theme=ocean"

# Contribution streak with default theme
curl "https://meditation-cyan.vercel.app/streak?user=fawwazgoreng"

# Stats card with orv theme
curl "https://meditation-cyan.vercel.app/card?user=fawwazgoreng&theme=orv"

# Activity graph with stoic theme
curl "https://meditation-cyan.vercel.app/activity?user=fawwazgoreng&theme=stoic"

```

---

## 🎨 Available Themes

| Theme | Palette |
|---|---|
| `dark` | GitHub dark — cyan title, blue accent |
| `light` | GitHub light — blue title and accent |
| `orv` | Omniscient Reader — gold title, transcendence blue |
| `pickmeup` | Dark game UI — mana blue title, gacha red accent |
| `northernblade` | Pitch black — silent night purple |
| `galaxy` | Deep space — violet title, cyan accent |
| `moonlight` | Midnight slate — sky blue title |
| `desert` | Warm sand — golden title, terracotta accent |
| `autumn` | Burnt umber — ember orange tones |
| `winter` | Deep navy — ice blue tones |
| `forest` | Dark green — emerald title and accent |
| `volcano` | Dark crimson — red fire tones |
| `ocean` | Deep navy — sky blue title and accent |
| `sunset` | Dark rose — pink and red tones |
| `cyberpunk` | Dark slate — fuchsia title, cyan accent |
| `neon` | Pure black — neon green title, cyan accent |
| `coffee` | Dark espresso — tan title, brown accent |
| `stoic` | Pure black — white monochrome |
| `zen` | Cream white — charcoal monochrome |

---

## ☁️ Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Set Environment Variables

```bash
vercel env add GITHUB_TOKEN
```

Or via **Vercel Dashboard → Project → Settings → Environment Variables**.

> After adding environment variables, redeploy for changes to take effect.

---

## 📖 API Documentation

Full OpenAPI 3.0 specification is available in [`docs/api.yaml`](./docs/api.yaml).

Preview interactively:

```bash
npx @redocly/cli preview-docs docs/api.yaml
```

Or paste the contents into [editor.swagger.io](https://editor.swagger.io).

---

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch

```bash
git checkout -b feat/your-feature
```

3. Commit your changes

```bash
git commit -m "feat: add your feature"
```

4. Push to the branch

```bash
git push origin feat/your-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Made with ❤️ by
**Muhammad Fawwaz Almumtaz**

</div>
