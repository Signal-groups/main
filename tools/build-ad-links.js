const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const adRoot = path.join(root, 'ad');
const configPath = path.join(adRoot, 'campaigns.js');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(configPath, 'utf8'), sandbox);
const campaigns = sandbox.window.SIGNAL_AD_CAMPAIGNS || [];

let generated = 0;
for (const item of campaigns) {
  if (!/^[a-z0-9-]+$/.test(item.id)) throw new Error(`Invalid campaign id: ${item.id}`);
  const target = path.join(adRoot, item.path.split('/').join(path.sep));
  if (!fs.existsSync(target)) throw new Error(`Missing campaign page: ${item.path}`);

  const aliasDirectory = path.join(adRoot, 'go', item.id);
  fs.mkdirSync(aliasDirectory, { recursive: true });
  const relativeTarget = path.relative(aliasDirectory, target).split(path.sep).join('/');
  const escapedTarget = relativeTarget.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${item.title}</title>
  <meta http-equiv="refresh" content="0;url=${escapedTarget}">
  <link rel="canonical" href="${escapedTarget}">
</head>
<body>
  <p><a href="${escapedTarget}">${item.title} 페이지로 이동</a></p>
  <script>location.replace(${JSON.stringify(relativeTarget)});<\/script>
</body>
</html>
`;
  fs.writeFileSync(path.join(aliasDirectory, 'index.html'), html, 'utf8');
  generated += 1;
}

process.stdout.write(JSON.stringify({ generated }, null, 2) + '\n');
