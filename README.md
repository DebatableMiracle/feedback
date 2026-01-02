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
Located in `src/content/projects/[slug].md`.
Format:
```markdown
---
title: "Project Name"
status: "active"
tags: ["tag1"]
match_tags: ["tag1"]
---
Description goes here...
```

## Workflow & Syncing

This project is designed to work with **Obsidian** for content editing and **Syncthing** for syncing content across devices.

### Obsidian Integration
- The `src/content` directory is structured to be opened as an Obsidian vault.
- **Wikilinks**: Supported by the system (e.g., `[[My Link]]` maps to `/articles/my-link/`).
- **Frontmatter**: Standard Obsidian YAML frontmatter is used.
- **Ignored Files**: Obsidian config files (`.obsidian`, `.stfolder`, etc.) are ignored by Git but synced via Syncthing.

### Syncthing Setup
- Sync the `src/content` folder across your devices using Syncthing.
- This allows you to write on mobile/tablet using Obsidian and have changes appear in this repo automatically.

### Git Auto-Sync
To keep the repository in sync with your Obsidian edits without manual commits, use the included auto-sync scripts:

1. **Setup**:
   ```bash
   ./scripts/setup-service.sh
   ```
   This installs a systemd service that monitors file changes.

2. **Manual Start/Stop**:
   ```bash
   ./scripts/start-sync.sh
   ./scripts/stop-sync.sh
   ```

The watcher (`scripts/git-watcher.js`) will:
- Monitor key directories (`logs`, `articles`, `projects`).
- Auto-commit changes with a descriptive message.
- Auto-push to the remote repository.

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
