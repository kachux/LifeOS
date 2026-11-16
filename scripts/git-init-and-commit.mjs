import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

async function main() {
  const dir = process.cwd();
  console.log('Project directory:', dir);

  // 1. Initialize git repo if not exists
  const gitDir = path.join(dir, '.git');
  if (!fs.existsSync(gitDir)) {
    console.log('Initializing git repository...');
    await git.init({ fs, dir, defaultBranch: 'main' });
    console.log('Initialized git repository with default branch main.');
  } else {
    console.log('.git already exists.');
  }

  // 2. Set remote origin
  const remoteUrl = 'https://github.com/kasimraheeskzr/LifeOS.git';
  try {
    const remotes = await git.listRemotes({ fs, dir });
    const hasOrigin = remotes.some(r => r.remote === 'origin');
    if (hasOrigin) {
      await git.deleteRemote({ fs, dir, remote: 'origin' });
    }
    await git.addRemote({ fs, dir, remote: 'origin', url: remoteUrl });
    console.log('Remote origin set to:', remoteUrl);
  } catch (err) {
    console.error('Error setting remote:', err.message);
  }

  // 3. Scan files using statusMatrix
  console.log('Scanning files with statusMatrix...');
  const matrix = await git.statusMatrix({ fs, dir });
  console.log(`Found ${matrix.length} file entries.`);

  let stagedCount = 0;
  for (const [filepath, head, workdir, stage] of matrix) {
    // If file exists in workdir and differs from stage, stage it
    if (workdir === 2 && stage !== 2) {
      await git.add({ fs, dir, filepath });
      stagedCount++;
    }
  }
  console.log(`Staged ${stagedCount} files.`);

  // 4. Commit
  try {
    const sha = await git.commit({
      fs,
      dir,
      message: 'feat: LifeOS - Personal Life Operating System with Google Gemini AI\n\n- White, Red & Yellow modern designer aesthetic\n- 5 Core modules: Money Balance, Event Countdowns, Tasks & Deadlines, Habit Streaks, and AI Assistant\n- Integrated Google Gemini AI chat\n- Clean local-first architecture with Next.js 14, Tailwind CSS, and SQLite',
      author: {
        name: 'kasimraheeskzr',
        email: 'kasimraheeskzr@users.noreply.github.com'
      }
    });
    console.log('Committed successfully with SHA:', sha);
  } catch (err) {
    console.log('Commit note:', err.message);
  }

  // 5. Inspect current branch and log
  const currentBranch = await git.currentBranch({ fs, dir, fullname: false });
  console.log('Current branch:', currentBranch);

  const commits = await git.log({ fs, dir, depth: 3 });
  console.log('Recent commits:', commits.map(c => ({ sha: c.oid.slice(0, 7), message: c.commit.message.split('\n')[0] })));
}

main().catch(console.error);
