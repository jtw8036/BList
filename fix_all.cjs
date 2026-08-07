const fs = require('fs');
const files = ['src/App.tsx', 'server.ts', 'src/data/initialData.ts'];
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/LOVE-2026/g, '20240831');
  fs.writeFileSync(f, content);
}
console.log("Replaced LOVE-2026 with 20240831 in " + files.join(", "));
