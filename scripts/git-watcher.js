
import chokidar from 'chokidar';
import matter from 'gray-matter';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const REPO_ROOT = process.cwd();
const CONTENT_DIR = path.join(REPO_ROOT, 'src/content');
const git = simpleGit(REPO_ROOT);

// User Configuration
const SYNC_INTERVAL_MS = 1000 * 60 * 60; // 1 Hour (Default per request)
const DEBOUNCE_MS = 10000; // Increase to 10s to bundle changes better and save battery
const COMMIT_MSG_PREFIX = 'Auto-sync';

console.log(`Starting Git Watcher for ${CONTENT_DIR}...`);
console.log(`Battery Saver Mode: polling disabled, waiting ${DEBOUNCE_MS}ms after changes.`);

// Application state
let pendingFiles = new Set();
let timer = null;
let syncInterval = null;

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

// Main processing logic
async function processChanges() {
    const filesToProcess = Array.from(pendingFiles);
    pendingFiles.clear();
    timer = null;

    if (filesToProcess.length === 0) return;

    console.log(`Processing ${filesToProcess.length} file changes...`);

    try {
        const status = await git.status();
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
                const { data } = matter(fileContent);
                const isPublished = data.published === true;

                if (isPublished) {
                    console.log(`[PUBLISH] ${path.basename(filePath)} is valid for publish.`);
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
            // We only commit if we have changes.
            // If git rm --cached was run, it staged a deletion.
            // If git add was run, it staged a modification/addition.

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

// Queue system to debounce rapid syncthing writes
function onFileChange(filePath) {
    if (!filePath) return;
    console.log(`Detected change: ${filePath}`);
    pendingFiles.add(filePath);

    if (timer) clearTimeout(timer);
    timer = setTimeout(processChanges, DEBOUNCE_MS);
}

watcher
    .on('add', onFileChange)
    .on('change', onFileChange)
    .on('unlink', onFileChange);

console.log('Watcher is active. Press Ctrl+C to stop.');
