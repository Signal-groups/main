const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = path.resolve(__dirname, '..');
const adRoot = path.join(repoRoot, 'ad');
const assetRoot = path.join(adRoot, 'assets', 'embedded');
const dryRun = process.argv.includes('--dry-run');
const minimumBytes = 32 * 1024;
const supportedFiles = new Set(['.html', '.css', '.js']);
const extensionByMime = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg'
};

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    return supportedFiles.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

const manifest = [];
let replacements = 0;
let decodedBytes = 0;
const uniqueAssets = new Set();

for (const filePath of listFiles(adRoot)) {
  const original = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  const updated = original.replace(/data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\r\n]+)/g, (whole, mime, base64) => {
    const extension = extensionByMime[mime.toLowerCase()];
    if (!extension) return whole;
    let buffer;
    try {
      buffer = Buffer.from(base64.replace(/\s/g, ''), 'base64');
    } catch (_) {
      return whole;
    }
    if (buffer.length < minimumBytes) return whole;

    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    const assetName = `${hash}.${extension}`;
    const assetPath = path.join(assetRoot, assetName);
    const relativeAsset = path.relative(path.dirname(filePath), assetPath).split(path.sep).join('/');

    if (!dryRun) {
      fs.mkdirSync(assetRoot, { recursive: true });
      if (!fs.existsSync(assetPath)) fs.writeFileSync(assetPath, buffer);
    }

    manifest.push({
      page: path.relative(adRoot, filePath).split(path.sep).join('/'),
      asset: `assets/embedded/${assetName}`,
      bytes: buffer.length
    });
    uniqueAssets.add(assetName);
    replacements += 1;
    decodedBytes += buffer.length;
    changed = true;
    return relativeAsset;
  });

  if (changed && !dryRun) fs.writeFileSync(filePath, updated, 'utf8');
}

if (!dryRun && manifest.length) {
  fs.writeFileSync(
    path.join(assetRoot, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), items: manifest }, null, 2) + '\n',
    'utf8'
  );
}

process.stdout.write(JSON.stringify({
  dryRun,
  replacements,
  uniqueAssets: uniqueAssets.size,
  decodedMB: Number((decodedBytes / 1024 / 1024).toFixed(2))
}, null, 2) + '\n');
