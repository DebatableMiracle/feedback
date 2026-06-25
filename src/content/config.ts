import { defineCollection, z } from 'astro:content';
import { PAPER_TOPICS, PAPER_KEYWORDS } from '../data/papers-taxonomy';

const logs = defineCollection({
	type: 'content',
	schema: z.object({
		type: z.literal('log').default('log'),
		log_number: z.number(),
		date: z.date(),
		tags: z.array(z.string()).optional(),
		published: z.boolean().default(true),
		project: z.string().optional(),
		subtitle: z.string().optional(),
		mood: z.enum(['soul', 'system']).default('system'),
	}),
});

const articles = defineCollection({
	type: 'content',
	schema: z.object({
		type: z.literal('article').default('article'),
		title: z.string(),
		description: z.string(),
		date: z.date(),
		tags: z.array(z.string()).optional(),
		published: z.boolean().default(true),
		project: z.string().optional(),
		mood: z.enum(['soul', 'system']).default('system'),
		series: z.object({
			name: z.string(),
			part: z.number(),
		}).optional(),
	}),
});

const projects = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		// Description is now the body of the markdown file
		status: z.enum(['active', 'paused', 'complete']),
		tags: z.array(z.string()).optional(),
		match_tags: z.array(z.string()).optional(), // Tags that automatically link content to this project
	}),
});

const libraryNotes = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.date(),
		tags: z.array(z.string()).optional(),
		published: z.boolean().default(true),
	}),
});

const libraryResources = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.date(),
		tags: z.array(z.string()).optional(),
		published: z.boolean().default(true),
	}),
});

const pages = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		published: z.boolean().default(true),
	}),
});

const papers = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		authors: z.string(),         // "Mania et al."
		year: z.number(),
		topic: z.enum(PAPER_TOPICS),
		tags: z.array(z.enum(PAPER_KEYWORDS)).optional(),
		url: z.string().optional(),  // arxiv / paper link
		source: z.string().optional(), // where you found it
		tldr: z.string(),            // one-line why it matters
		read: z.boolean().default(false),
		published: z.boolean().default(true),
		date: z.date(),
	}),
});

export const collections = { logs, articles, projects, 'library-notes': libraryNotes, 'library-resources': libraryResources, papers, pages };
