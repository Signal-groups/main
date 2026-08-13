const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const endpoint = 'https://script.google.com/macros/s/AKfycbxSI6a82YhBdLoE3lekYihAt2B-MU0bwFUQM5qOb9Lwn8IquOjpa2sdn9SahPjkEics/exec';
const pages = [
  {
    file: 'ad/check06/index.html',
    sourceCode: 'BJW-IG-002',
    pageId: 'ad-bjw-ig-002',
    pageType: 'LANDING',
    platform: 'instagram',
    requestType: 'consult'
  },
  {
    file: 'ad/standard/index.html',
    sourceCode: 'COMMON-STANDARD-001',
    pageId: 'ad-common-standard-001',
    pageType: 'LANDING',
    platform: 'website',
    requestType: 'consult'
  }
];

for (const page of pages) {
  const filePath = path.join(root, ...page.file.split('/'));
  let wrapper = fs.readFileSync(filePath, 'utf8');
  const templatePattern = /(<script type="__bundler\/template">\s*)([\s\S]*?)(\s*<\/script>)/;
  const match = wrapper.match(templatePattern);
  if (!match) throw new Error(`Bundled template not found: ${page.file}`);
  let html = JSON.parse(match[2]);

  html = html.replace(
    /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/g,
    endpoint
  );

  if (!html.includes(`source_code: '${page.sourceCode}'`)) {
    const dataPattern = /(var data\s*=\s*\{)/;
    if (!dataPattern.test(html)) throw new Error(`Lead payload not found: ${page.file}`);
    const fields = [
      `$1`,
      `        source_code: '${page.sourceCode}',`,
      `        page_id: '${page.pageId}',`,
      `        page_type: '${page.pageType}',`,
      `        platform: '${page.platform}',`,
      `        request_type: '${page.requestType}',`,
      `        privacy_agreed: true,`,
      `        landing_page: location.pathname,`,
      `        landing_url: location.href,`
    ].join('\n');
    html = html.replace(dataPattern, fields);
  }

  wrapper = wrapper.replace(templatePattern, function (_, opening, _template, closing) {
    const serialized = JSON.stringify(html).replace(/<\/script/gi, '<\\/script');
    return opening + serialized + closing;
  });
  fs.writeFileSync(filePath, wrapper, 'utf8');
  process.stdout.write(`${page.file}: ${page.sourceCode}\n`);
}
