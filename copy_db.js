import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function copy() {
  const sourceCode = "LOVE-2026";
  const targetCode = "20240831";
  
  const sourceSnap = await getDoc(doc(db, "couples", sourceCode));
  if (sourceSnap.exists()) {
    const data = sourceSnap.data();
    data.profile.coupleCode = targetCode;
    
    if (data.buckets) data.buckets.forEach(b => b.coupleCode = targetCode);
    if (data.memos) data.memos.forEach(m => m.coupleCode = targetCode);
    if (data.challenges) data.challenges.forEach(c => c.coupleCode = targetCode);
    
    await setDoc(doc(db, "couples", targetCode), data);
    console.log(`Copied from ${sourceCode} to ${targetCode}. Buckets: ${data.buckets?.length}`);
  } else {
    console.log("Source not found.");
  }
}
copy().catch(e => { console.error(e); process.exit(1); });
