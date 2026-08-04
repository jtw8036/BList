const fs = require('fs');
let code = fs.readFileSync('src/data/initialData.ts', 'utf8');
code = code.replace(/20240831/g, "LOVE-2026");
fs.writeFileSync('src/data/initialData.ts', code);
