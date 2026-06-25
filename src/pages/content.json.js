import { getCollection } from "astro:content";

export async function GET() {
	const articles = await getCollection("articles");
	const logs = await getCollection("logs");
	const projects = await getCollection("projects");
	const papers = await getCollection("papers");
	const resources = await getCollection("library-resources");
	const notes = await getCollection("library-notes");

	const content = [
		...articles
			.filter((a) => a.data.published)
			.map((a) => ({
				type: "article",
				title: a.data.title,
				description: a.data.description,
				url: `/articles/${a.slug}/`,
				date: a.data.date,
				tags: a.data.tags || [],
				mood: a.data.mood || "system",
			})),
		...logs
			.filter((l) => l.data.published)
			.map((l) => ({
				type: "log",
				title: `Log #${l.data.log_number}${l.data.subtitle ? ` - ${l.data.subtitle}` : ""}`,
				url: `/logs/${l.slug}/`,
				date: l.data.date,
				tags: l.data.tags || [],
				mood: l.data.mood || "system",
			})),
		...projects.map((p) => ({
			type: "project",
			title: p.data.title,
			status: p.data.status,
			url: `/projects/${p.slug}/`,
			tags: p.data.tags || [],
		})),
		...papers
			.filter((p) => p.data.published)
			.map((p) => ({
				type: "paper",
				title: p.data.title,
				authors: p.data.authors,
				year: p.data.year,
				tldr: p.data.tldr,
				url: `/library/papers/${p.slug}/`,
				date: p.data.date,
				tags: p.data.tags || [],
			})),
		...resources
			.filter((r) => r.data.published)
			.map((r) => ({
				type: "resource",
				title: r.data.title,
				description: r.data.description,
				url: `/library/resources/${r.slug}/`,
				date: r.data.date,
				tags: r.data.tags || [],
			})),
		...notes
			.filter((n) => n.data.published)
			.map((n) => ({
				type: "note",
				title: n.data.title,
				description: n.data.description,
				url: `/library/notes/${n.slug}/`,
				date: n.data.date,
				tags: n.data.tags || [],
			})),
	];

	// Sort chronologically by date where applicable
	content.sort((a, b) => {
		if (a.date && b.date) {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		}
		// Put items without dates (e.g. projects) at the end
		if (a.date) return -1;
		if (b.date) return 1;
		return 0;
	});

	return new Response(JSON.stringify(content, null, 2), {
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	});
}
