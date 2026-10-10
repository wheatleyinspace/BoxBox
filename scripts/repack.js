const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const stagingDir = path.resolve(rootDir, 'scratch/staging_asar');
const outputAsar = path.resolve(rootDir, '../app.asar');

// 1. Build renderer
console.log('Building renderer...');
execSync('npm run build:renderer', { cwd: rootDir, stdio: 'inherit' });

// 2. Prepare staging directory
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}

fs.mkdirSync(path.join(stagingDir, '.vite/build'), { recursive: true });
fs.mkdirSync(path.join(stagingDir, '.vite/renderer'), { recursive: true });

fs.cpSync(path.join(rootDir, '.vite/build'), path.join(stagingDir, '.vite/build'), { recursive: true });
fs.cpSync(path.join(rootDir, '.vite/renderer/main_window'), path.join(stagingDir, '.vite/renderer/main_window'), { recursive: true });

for (const file of ['package.json', '.env', 'steam_appid.txt']) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(stagingDir, file));
  }
}

// 3. Pack asar
console.log('Packaging app.asar...');
const packCmd = `npx @electron/asar pack "${stagingDir}" "${outputAsar}" --unpack-dir "**/.vite/build/node_modules/steamworks.js"`;
execSync(packCmd, { cwd: rootDir, stdio: 'inherit' });

// 4. Cleanup staging
fs.rmSync(stagingDir, { recursive: true, force: true });

const sizeMb = (fs.statSync(outputAsar).size / (1024 * 1024)).toFixed(2);
console.log(`Repack complete: ${outputAsar} (${sizeMb} MB)`);
