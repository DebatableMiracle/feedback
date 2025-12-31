import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const articles = await getCollection('articles');
    const publishedArticles = articles.filter(article => article.data.published);

    return rss({
        title: 'My Digital Garden - Essays',
        description: 'Essays on robotics, AI, and systems.',
        site: context.site,
        items: publishedArticles.map((post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: post.data.description,
            link: `/articles/${post.slug}/`,
        })),
    });
}
