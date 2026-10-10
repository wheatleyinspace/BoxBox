const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outZip = path.resolve(rootDir, '../../The-Jackbox-Megapicker-Source.zip');
const resZip = path.resolve(rootDir, '../The-Jackbox-Megapicker-Source.zip');

const script = `
import os, zipfile, shutil

zip_path = r'${resZip.replace(/\\/g, '\\\\')}'
root_dir = r'${rootDir.replace(/\\/g, '\\\\')}'

include_files = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'vite.config.ts',
    'steam_appid.txt',
    '.env',
    '.env.example',
    '.gitignore',
    'README.md'
]

include_dirs = [
    'src',
    'scripts',
    os.path.join('.vite', 'build'),
    os.path.join('.vite', 'renderer', 'main_window')
]

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
    for f in include_files:
        full_path = os.path.join(root_dir, f)
        if os.path.exists(full_path):
            zipf.write(full_path, arcname=f)

    for d in include_dirs:
        base_dir = os.path.join(root_dir, d)
        for foldername, _, filenames in os.walk(base_dir):
            for filename in filenames:
                if filename.endswith(('.py', '.bak', '.tmp')):
                    continue
                filepath = os.path.join(foldername, filename)
                arcname = os.path.relpath(filepath, root_dir)
                zipf.write(filepath, arcname=arcname)

shutil.copyfile(zip_path, r'${outZip.replace(/\\/g, '\\\\')}')
size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f'Archive created: {zip_path} ({size_mb:.2f} MB)')
`;

os = require('os');
const tmpFile = path.join(os.tmpdir(), 'make_boxbox_zip.py');
fs.writeFileSync(tmpFile, script);
try {
  execSync(`python "${tmpFile}"`, { cwd: rootDir, stdio: 'inherit' });
} finally {
  if (fs.existsSync(tmpFile)) {
    fs.unlinkSync(tmpFile);
  }
}
