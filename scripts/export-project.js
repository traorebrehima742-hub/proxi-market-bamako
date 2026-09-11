import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const rootDir = process.cwd();
const zip = new AdmZip();

const excludeList = [
  'node_modules',
  'dist',
  'dev-dist',
  '.git',
  '.vite',
  'bun.lock',
  'proxi-market-sources.zip'
];

function addDirToZip(currentDir, zipPath = '') {
  const items = fs.readdirSync(currentDir);
  for (const item of items) {
    if (excludeList.includes(item)) continue;
    if (item.endsWith('.zip')) continue;

    const fullPath = path.join(currentDir, item);
    const relZipPath = zipPath ? `${zipPath}/${item}` : item;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      addDirToZip(fullPath, relZipPath);
    } else if (stat.isFile()) {
      zip.addLocalFile(fullPath, zipPath);
    }
  }
}

// Add files
addDirToZip(rootDir, '');

// Ensure public dir exists
const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'proxi-market-sources.zip');
zip.writeZip(outputPath);

console.log(`Successfully created source zip at: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
