const fs = require('fs');
const path = require('path');

const adRoot = path.resolve(__dirname, '..', 'ad');

function listHtml(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listHtml(fullPath);
    return entry.name.toLowerCase().endsWith('.html') ? [fullPath] : [];
  });
}

const failures = [];
let inlineScripts = 0;

for (const filePath of listHtml(adRoot)) {
  const html = fs.readFileSync(filePath, 'utf8');
  const scriptPattern = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let index = 0;
  while ((match = scriptPattern.exec(html))) {
    index += 1;
    const attributes = match[1] || '';
    const source = match[2] || '';
    const typeMatch = attributes.match(/\btype=["']([^"']+)["']/i);
    if (typeMatch && !/(?:javascript|module|ecmascript)/i.test(typeMatch[1])) continue;
    if (!source.trim()) continue;
    inlineScripts += 1;
    try {
      new Function(source);
    } catch (error) {
      failures.push({
        page: path.relative(adRoot, filePath).split(path.sep).join('/'),
        script: index,
        error: error.message
      });
    }
  }
}

process.stdout.write(JSON.stringify({ htmlFiles: listHtml(adRoot).length, inlineScripts, failures }, null, 2) + '\n');
if (failures.length) process.exitCode = 1;
