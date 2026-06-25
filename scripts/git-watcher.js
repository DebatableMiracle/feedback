
import chokidar from 'chokidar';
import matter from 'gray-matter';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const REPO_ROOT = process.cwd();
const CONTENT_DIR = path.join(REPO_ROOT, 'src/content');
const git = simpleGit(REPO_ROOT);

// Publish toggle (published flip) → fast. Content edits → slow.
const PUBLISH_DEBOUNCE_MS = 10_000;
const EDIT_DEBOUNCE_MS = 1000 * 60 * 5;
const COMMIT_MSG_PREFIX = 'Auto-sync';

console.log(`Starting Git Watcher for ${CONTENT_DIR}...`);
console.log(`Publish toggle: ${PUBLISH_DEBOUNCE_MS / 1000}s debounce. Edits: ${EDIT_DEBOUNCE_MS / 1000}s debounce.`);

// Application state
let pendingFiles = new Set();
let timer = null;
let scheduledDelay = EDIT_DEBOUNCE_MS;
const publishedCache = new Map(); // relPath -> boolean

const watcher = chokidar.watch(CONTENT_DIR, {
    ignored: /(^|[\/\\])(\.|\.stfolder|node_modules)/, // Ignore dotfiles, syncthing folders, node_modules
    persistent: true,
    ignoreInitial: true,
    usePolling: false, // CRITICAL for battery: relies on OS native events instead of CPU polling
    awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
    }
});

function isPublished(data) {
    return data.published === true || data.published === 'true';
}

function toRepoPath(filePath) {
    return path.relative(REPO_ROOT, filePath);
}

// True when published state changed vs git — the intentional publish/unpublish signal
async function isPublishSignal(filePath) {
    const rel = toRepoPath(filePath);

    try {
        const content = await fs.readFile(filePath, 'utf8');
        const published = isPublished(matter(content).data);

        // Check cache first to avoid launching Git subprocesses on every keypress/autosave
        let prevPublished;
        if (publishedCache.has(rel)) {
            prevPublished = publishedCache.get(rel);
        } else {
            try {
                const prev = await git.show([`HEAD:${rel}`]);
                prevPublished = isPublished(matter(prev).data);
            } catch {
                prevPublished = null; // not tracked in HEAD yet
            }
            publishedCache.set(rel, prevPublished);
        }

        const isSignal = prevPublished !== null ? (published !== prevPublished) : published;
        
        // Update cache for subsequent edits
        publishedCache.set(rel, published);
        return isSignal;
    } catch (e) {
        if (e.code === 'ENOENT') {
            publishedCache.delete(rel);
            try {
                await git.raw(['ls-files', '--error-unmatch', rel]);
                return true; // deleted a tracked file
            } catch {
                return false;
            }
        }
        throw e;
    }
}

// Main processing logic
async function processChanges() {
    const filesToProcess = Array.from(pendingFiles);
    pendingFiles.clear();
    timer = null;

    if (filesToProcess.length === 0) return;

    console.log(`Processing ${filesToProcess.length} file changes...`);

    try {
        const filesToCommit = [];

        for (const filePath of filesToProcess) {
            if (!filePath) continue;

            try {
                // Check if file still exists (handling deletions)
                let fileContent;
                try {
                    fileContent = await fs.readFile(filePath, 'utf8');
                } catch (e) {
                    if (e.code === 'ENOENT') {
                        console.log(`File deleted: ${filePath}`);
                        filesToCommit.push(filePath);
                        continue;
                    }
                    throw e;
                }

                // Parse Frontmatter
                const parsed = matter(fileContent);
                const { data } = parsed;
                const published = isPublished(data);

                if (published) {
                    // Check if this file was previously unpublished (first publish)
                    let wasUnpublished = false;
                    try {
                        const prevContent = await git.show([`HEAD:${path.relative(REPO_ROOT, filePath)}`]);
                        const prevData = matter(prevContent).data;
                        wasUnpublished = !isPublished(prevData);
                    } catch {
                        wasUnpublished = true; // file wasn't in git before
                    }

                    if (wasUnpublished) {
                        const now = new Date();
                        const updated = matter.stringify(parsed.content, { ...data, date: now });
                        await fs.writeFile(filePath, updated, 'utf8');
                        console.log(`[PUBLISH] ${path.basename(filePath)} — date set to ${now.toISOString()}`);
                    } else {
                        console.log(`[PUBLISH] ${path.basename(filePath)} is valid for publish.`);
                    }
                    filesToCommit.push(filePath);
                } else {
                    // If published: false
                    try {
                        // Check if currently tracked
                        await git.raw(['ls-files', '--error-unmatch', filePath]);

                        // If tracked, remove from git index
                        console.log(`[UNPUBLISH] ${path.basename(filePath)} switched to draft. Removing from git index...`);
                        await git.rmKeepLocal(filePath);

                    } catch (err) {
                        // Not tracked. Ignore.
                        console.log(`[IGNORE] ${path.basename(filePath)} is a draft.`);
                    }
                }
            } catch (err) {
                console.error(`Error processing file ${filePath}:`, err);
            }
        }

        // Check status after processing all files (including potential rm --cached operations)
        const filesToStage = filesToCommit.filter(f => f); // ensure no nulls
        if (filesToStage.length > 0) {
            await git.add(filesToStage);
        }

        // Final check for any staged changes
        const finalStatus = await git.status();
        const somethingToCommit = finalStatus.staged.length > 0;

        if (somethingToCommit) {
            const message = `${COMMIT_MSG_PREFIX}: Updated ${filesToCommit.length} notes (${new Date().toLocaleString()})`;
            await git.commit(message);
            console.log(`Commited changes.`);
            await git.push();
            console.log(`Pushed to remote.`);
        } else {
            console.log('No changes to push.');
        }

    } catch (error) {
        console.error('Error processing changes:', error);
    }
}

// Queue: publish toggle → 10s, content edit → 5min
async function onFileChange(filePath) {
    if (!filePath) return;
    const rel = toRepoPath(filePath);
    console.log(`Detected change: ${rel}`);
    pendingFiles.add(filePath);

    const delay = (await isPublishSignal(filePath)) ? PUBLISH_DEBOUNCE_MS : EDIT_DEBOUNCE_MS;
    scheduledDelay = Math.min(scheduledDelay, delay);

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        scheduledDelay = EDIT_DEBOUNCE_MS;
        processChanges();
    }, scheduledDelay);

    console.log(delay === PUBLISH_DEBOUNCE_MS ? `Publish signal — sync in ${scheduledDelay / 1000}s` : `Edit — sync in ${scheduledDelay / 1000}s`);
}

watcher
    .on('add', onFileChange)
    .on('change', onFileChange)
    .on('unlink', onFileChange);

console.log('Watcher is active. Press Ctrl+C to stop.');
