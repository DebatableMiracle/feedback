import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const articles = await getCollection('articles');
    const logs = await getCollection('logs');

    const publishedArticles = articles.filter(post => post.data.published);
    const publishedLogs = logs.filter(post => post.data.published);

    const allPosts = [
        ...publishedArticles.map(p => ({ ...p, type: 'article' })),
        ...publishedLogs.map(p => ({ ...p, type: 'log' }))
    ].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

    return rss({
        stylesheet: '/rss-styles.xsl',
        title: 'Feedback',
        description: 'A public loop of raw logs and refined articles.',
        site: context.site,
        items: allPosts.map((post) => ({
            title: post.type === 'log' ? `Log #${post.data.log_number}` : post.data.title,
            pubDate: post.data.date,
            description: post.type === 'log' ? `Log entry #${post.data.log_number}` : post.data.description,
            link: post.type === 'log' ? `/logs/${post.slug}/` : `/articles/${post.slug}/`,
        })),
    });
}
