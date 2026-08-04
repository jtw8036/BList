const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// We want to remove the try/catch blocks that contain fetch(`/api/couple/
// But NOT the one in fetchCoupleData (line 69).

const lines = content.split('\n');
let newLines = [];
let insideTryFetch = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!insideTryFetch) {
    if (line.match(/try \{/) && i + 1 < lines.length && lines[i+1].match(/await fetch\(`\/api\/couple\/\$\{coupleCode\}/)) {
      insideTryFetch = true;
      braceCount = 1;
      continue;
    }
    if (line.match(/try \{/) && i + 1 < lines.length && lines[i+1].match(/const res = await fetch\(`\/api\/couple\/\$\{coupleCode\}/)) {
      insideTryFetch = true;
      braceCount = 1;
      continue;
    }
    newLines.push(line);
  } else {
    // Count braces
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;
    if (braceCount <= 0) {
      insideTryFetch = false;
    }
  }
}

fs.writeFileSync('src/App.tsx', newLines.join('\n'));
console.log("Fixed App.tsx fetch blocks");
