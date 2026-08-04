const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add import if not exists
if (!code.includes('import { getDefaultCoupleData }')) {
  code = code.replace(
    'import { getFirestore',
    'import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";\nimport { getDefaultCoupleData } from "./src/data/initialData";\n// removed getFirestore duplicate'
  );
  code = code.replace('import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";\nimport { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";\nimport { getDefaultCoupleData } from "./src/data/initialData";\n// removed getFirestore duplicate', 
  'import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";\nimport { getDefaultCoupleData } from "./src/data/initialData";');
}

// Update createDefaultRoom
const oldFunc = `const createDefaultRoom = (code: string): CoupleRoom => {
  const diskData = loadStore();
  const templateSource = diskData["LOVE-2026"] || memoryStore["LOVE-2026"];
  if (templateSource) {
    return {
      profile: {
        ...templateSource.profile,
        coupleCode: code,
      },
      buckets: templateSource.buckets.map((b) => ({ ...b, coupleCode: code })),
      memos: templateSource.memos.map((m) => ({ ...m, coupleCode: code })),
      challenges: (templateSource.challenges || []).map((c) => ({ ...c, coupleCode: code })),
      trash: { buckets: [], memos: [], challenges: [] },
    };
  }
  return {
    profile: {
      coupleCode: code,
      partner1Name: "지훈",
      partner2Name: "민지",
      anniversaryDate: "2025-05-20",
      statusMessage: "우리들의 소중한 기록",
    },
    buckets: [],
    memos: [],
    challenges: [],
    trash: { buckets: [], memos: [], challenges: [] },
  };
};`;

const newFunc = `const createDefaultRoom = (code: string): CoupleRoom => {
  const defaultData = getDefaultCoupleData(code);
  return {
    ...defaultData,
    challenges: defaultData.challenges || [],
    trash: defaultData.trash || { buckets: [], memos: [], challenges: [] }
  };
};`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('server.ts', code);
console.log("Updated server.ts");
