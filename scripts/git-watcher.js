
import chokidar from 'chokidar';
import matter from 'gray-matter';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

const REPO_ROOT = process.cwd();
const CONTENT_DIR = path.join(REPO_ROOT, 'src/content');
const git = simpleGit(REPO_ROOT);

const DEBOUNCE_MS = 1000 * 60 * 5; // 5 min for draft edits
const PUBLISH_DEBOUNCE_MS = 1000 * 30; // 30s when publishing
const COMMIT_MSG_PREFIX = 'Auto-sync';

console.log(`Starting Git Watcher for ${CONTENT_DIR}...`);
console.log(`Debounce: ${PUBLISH_DEBOUNCE_MS / 1000}s on publish, ${DEBOUNCE_MS / 1000}s on drafts.`);

let pendingFiles = new Set();
let timer = null;

function toRepoPath(filePath) {
	return path.relative(REPO_ROOT, filePath);
}

function isPublished(data) {
	return data.published === true || data.published === 'true';
}

async function walkMdFiles(dir) {
	const results = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
			results.push(...await walkMdFiles(full));
		} else if (entry.name.endsWith('.md')) {
			results.push(full);
		}
	}
	return results;
}

async function isTracked(relPath) {
	try {
		await git.raw(['ls-files', '--error-unmatch', relPath]);
		return true;
	} catch {
		return false;
	}
}

async function fileNeedsSync(filePath) {
	const relPath = toRepoPath(filePath);
	let fileContent;
	try {
		fileContent = await fs.readFile(filePath, 'utf8');
	} catch (e) {
		return e.code === 'ENOENT' && (await isTracked(relPath));
	}

	const published = isPublished(matter(fileContent).data);
	const tracked = await isTracked(relPath);

	if (published && !tracked) return true;
	if (!published && tracked) return true;

	if (published && tracked) {
		const status = await git.status();
		return (
			status.modified.includes(relPath) ||
			status.not_added.includes(relPath) ||
			status.created.includes(relPath)
		);
	}

	return false;
}

function scheduleProcess(delay) {
	if (timer) clearTimeout(timer);
	timer = setTimeout(processChanges, delay);
	console.log(`Scheduled sync in ${delay / 1000}s`);
}

async function onFileChange(filePath) {
	if (!filePath) return;
	console.log(`Detected change: ${toRepoPath(filePath)}`);
	pendingFiles.add(filePath);

	let delay = DEBOUNCE_MS;
	try {
		const content = await fs.readFile(filePath, 'utf8');
		if (isPublished(matter(content).data)) delay = PUBLISH_DEBOUNCE_MS;
	} catch {}

	scheduleProcess(delay);
}

async function scanOnStartup() {
	console.log('Startup scan: checking for unsynced content...');
	const files = await walkMdFiles(CONTENT_DIR);
	let queued = 0;

	for (const file of files) {
		if (await fileNeedsSync(file)) {
			pendingFiles.add(file);
			queued++;
			console.log(`Startup scan: queued ${toRepoPath(file)}`);
		}
	}

	if (queued > 0) {
		scheduleProcess(PUBLISH_DEBOUNCE_MS);
	} else {
		console.log('Startup scan: everything in sync.');
	}
}

async function processChanges() {
	const filesToProcess = Array.from(pendingFiles);
	pendingFiles.clear();
	timer = null;

	if (filesToProcess.length === 0) return;

	console.log(`Processing ${filesToProcess.length} file(s)...`);

	try {
		const filesToCommit = [];

		for (const filePath of filesToProcess) {
			if (!filePath) continue;
			const relPath = toRepoPath(filePath);

			try {
				let fileContent;
				try {
					fileContent = await fs.readFile(filePath, 'utf8');
				} catch (e) {
					if (e.code === 'ENOENT') {
						console.log(`[DELETE] ${relPath}`);
						filesToCommit.push(relPath);
						continue;
					}
					throw e;
				}

				const parsed = matter(fileContent);
				const { data } = parsed;
				const published = isPublished(data);

				if (published) {
					let wasUnpublished = false;
					try {
						const prevContent = await git.show([`HEAD:${relPath}`]);
						const prevData = matter(prevContent).data;
						wasUnpublished = !isPublished(prevData);
					} catch {
						wasUnpublished = true;
					}

					if (wasUnpublished) {
						const now = new Date();
						const updated = matter.stringify(parsed.content, { ...data, date: now });
						await fs.writeFile(filePath, updated, 'utf8');
						console.log(`[PUBLISH] ${relPath} — date set to ${now.toISOString()}`);
					} else {
						console.log(`[PUBLISH] ${relPath}`);
					}
					filesToCommit.push(relPath);
				} else {
					if (await isTracked(relPath)) {
						console.log(`[UNPUBLISH] ${relPath} — removing from git index`);
						await git.rm(['--cached', '-f', relPath]);
					} else {
						console.log(`[IGNORE] ${relPath} is a draft`);
					}
				}
			} catch (err) {
				console.error(`Error processing ${relPath}:`, err);
			}
		}

		const filesToStage = filesToCommit.filter(Boolean);
		if (filesToStage.length > 0) {
			await git.add(filesToStage);
		}

		const finalStatus = await git.status();
		if (finalStatus.staged.length > 0) {
			const message = `${COMMIT_MSG_PREFIX}: Updated ${filesToStage.length} note(s) (${new Date().toLocaleString()})`;
			await git.commit(message);
			console.log('Committed changes.');
			await git.push();
			console.log('Pushed to remote.');
		} else {
			console.log('No changes to push.');
		}
	} catch (error) {
		console.error('Error processing changes:', error);
	}
}

const watcher = chokidar.watch(CONTENT_DIR, {
	ignored: /(^|[\/\\])(\.|\.stfolder|node_modules)/,
	persistent: true,
	ignoreInitial: true,
	usePolling: false,
	awaitWriteFinish: {
		stabilityThreshold: 2000,
		pollInterval: 100,
	},
});

watcher
	.on('add', onFileChange)
	.on('change', onFileChange)
	.on('unlink', onFileChange);

scanOnStartup();
console.log('Watcher is active. Press Ctrl+C to stop.');
