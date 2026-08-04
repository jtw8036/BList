const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldStateInit = `const [coupleCode, setCoupleCode] = useState<string>(() => {
    return localStorage.getItem('couple_code') || 'LOVE-2026';
  });`;

const newStateInit = `const [coupleCode, setCoupleCode] = useState<string>(() => {
    let code = localStorage.getItem('couple_code');
    if (!code || code === '20240831') code = 'LOVE-2026';
    return code;
  });`;

code = code.replace(oldStateInit, newStateInit);

fs.writeFileSync('src/App.tsx', code);
