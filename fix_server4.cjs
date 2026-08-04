const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('likes: number;', 'likes?: number;');

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts buckets likes typings");
