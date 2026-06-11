// @ts-check
import { defineConfig } from 'astro/config';
import { visit } from 'unist-util-visit';

import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import tailwindcss from '@tailwindcss/vite';

// Resolves bare image filenames (e.g. "photo.png") written by Obsidian's
// shortest-path format to "../images/photo.png" so Astro can find them.
function remarkObsidianImages() {
  return (tree) => {
    visit(tree, 'image', (node) => {
      if (!node.url.includes('/') && !node.url.startsWith('http')) {
        node.url = `../images/${node.url}`;
      }
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://feedback-two-phi.vercel.app',
  integrations: [sitemap()],

  markdown: {
    remarkPlugins: [remarkMath, remarkObsidianImages],
    rehypePlugins: [rehypeKatex]
  },

  vite: {
    plugins: [tailwindcss()]
  }
});