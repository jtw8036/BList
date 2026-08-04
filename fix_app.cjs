const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("return localStorage.getItem('couple_code') || '20240831';", "return localStorage.getItem('couple_code') || 'LOVE-2026';");
code = code.replace(/getDefaultCoupleData\('20240831'\)/g, "getDefaultCoupleData('LOVE-2026')");
fs.writeFileSync('src/App.tsx', code);
