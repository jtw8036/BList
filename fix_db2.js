import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function fix() {
  const code = "20240831";
  const snap = await getDoc(doc(db, "couples", code));
  if (snap.exists()) {
      const data = snap.data();
      console.log(`Found data in ${code}. Buckets: ${data.buckets?.length}`);
      
      const targetCode = "LOVE-2026";
      const targetSnap = await getDoc(doc(db, "couples", targetCode));
      if (targetSnap.exists()) {
         let targetData = targetSnap.data();
         if (data.buckets && data.buckets.length > 0) targetData.buckets = data.buckets;
         if (data.memos && data.memos.length > 0) targetData.memos = data.memos;
         if (data.challenges && data.challenges.length > 0) targetData.challenges = data.challenges;
         targetData.profile.coupleCode = targetCode;
         await setDoc(doc(db, "couples", targetCode), targetData);
         console.log("Restored data to LOVE-2026");
      }
  } else {
      console.log("No data found for 20240831 either.");
  }
}
fix().catch(e => { console.error(e); process.exit(1); });
