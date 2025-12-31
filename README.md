# CMS Feedback - Markdown-First Blogging System

A personal blogging system built with Astro, designed for raw logs, polished essays, and long-running projects.

## Tech Stack
- **Framework**: Astro 4.0
- **Content**: Markdown + Frontmatter
- **Styling**: Tailwind CSS + Typography
- **Deployment**: Vercel (recommended)
- **Comments**: Giscus (GitHub Discussions)

## Content Management

### Logs
Located in `src/content/logs/`.
Frontmatter:
```yaml
type: log
log_number: 1
date: 2024-01-01T12:00:00Z
tags: [tag1, tag2]
published: true
project: optional-project-id
```

### Articles (Essays)
Located in `src/content/articles/`.
Frontmatter:
```yaml
type: article
title: "My Blog Post"
description: "Description for SEO"
date: 2024-01-01
tags: [tag1, tag2]
published: true
project: optional-project-id
```

### Projects
Located in `src/content/projects/[id].json`.
Format:
```json
{
  "title": "Project Name",
  "description": "Description...",
  "status": "active",
  "tags": ["tag1"]
}
```

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Configuration

### Comments (Giscus)
To enable comments on logs and articles:
1.  Navigate to [giscus.app](https://giscus.app).
2.  Enter your repository details (it must be public).
3.  Scroll to the "Enable giscus" section to generate the script.
4.  Copy the `data-repo`, `data-repo-id`, and `data-category-id`.
5.  Open `src/components/Giscus.astro` and replace the placeholders with your values.

### Deployments

To enable deployments, push the repository to GitHub and import it into Vercel.

### Site URL
Update `site` in `astro.config.mjs` with your production URL to ensure Sitemap/RSS work correctly.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Log in to Vercel and "Add New Project".
3. Select this repository.
4. Vercel will auto-detect Astro.
5. Click **Deploy**.

## License
MIT
