import { defineCollection, z } from 'astro:content';

const logs = defineCollection({
	type: 'content',
	schema: z.object({
		type: z.literal('log').default('log'),
		log_number: z.number(),
		date: z.date(),
		tags: z.array(z.string()).optional(),
		published: z.boolean().default(true),
		project: z.string().optional(),
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
		series: z.object({
			name: z.string(),
			part: z.number(),
		}).optional(),
	}),
});

const projects = defineCollection({
	type: 'data',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		status: z.enum(['active', 'paused', 'complete']),
		tags: z.array(z.string()).optional(),
	}),
});

export const collections = { logs, articles, projects };
