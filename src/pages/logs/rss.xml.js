import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const logs = await getCollection('logs');
    const publishedLogs = logs.filter(log => log.data.published);

    return rss({
        title: 'My Digital Garden - Logs',
        description: 'Raw thoughts and daily logs.',
        site: context.site,
        items: publishedLogs.map((post) => ({
            title: `Log #${post.data.log_number}`,
            pubDate: post.data.date,
            description: post.body ? post.body.substring(0, 140) + '...' : '',
            link: `/logs/${post.slug}/`,
        })),
    });
}
