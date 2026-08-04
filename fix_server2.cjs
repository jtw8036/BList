const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace createDefaultRoom entirely
const startIndex = code.indexOf('const createDefaultRoom');
const endIndex = code.indexOf('// Ensure default room exists');
if (startIndex !== -1 && endIndex !== -1) {
  const newFunc = `const createDefaultRoom = (code: string): CoupleRoom => {
  const defaultData = getDefaultCoupleData(code);
  return {
    ...defaultData,
    challenges: defaultData.challenges || [],
    trash: defaultData.trash || { buckets: [], memos: [], challenges: [] }
  };
};
`;
  code = code.substring(0, startIndex) + newFunc + code.substring(endIndex);
  fs.writeFileSync('server.ts', code);
  console.log("Replaced createDefaultRoom");
} else {
  console.log("Could not find bounds");
}
