const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('statusMessage: string;', 'statusMessage?: string;');

const ensureTrashStr = `
const ensureTrash = (code: string) => {
  if (!memoryStore[code].trash) {
    memoryStore[code].trash = { buckets: [], memos: [], challenges: [] };
  }
};
`;

if (!code.includes('const ensureTrash =')) {
  // inject before createDefaultRoom
  code = code.replace('const createDefaultRoom =', ensureTrashStr + '\nconst createDefaultRoom =');
}

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts typings and ensureTrash");
