import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function fix() {
  const code = "LOVE-2026";
  const snap = await getDoc(doc(db, "couples", code));
  let data = null;
  if (snap.exists()) {
    data = snap.data();
  }
  
  const localFile = JSON.parse(fs.readFileSync('data/couple_store.json', 'utf8'));
  
  if (localFile && localFile[code]) {
      const localData = localFile[code];
      
      // Merge
      if (!data) data = { buckets: [], memos: [], challenges: [], trash: { buckets: [], memos: [], challenges: [] } };
      
      if (localData.buckets && localData.buckets.length > 0) {
          data.buckets = localData.buckets;
      }
      if (localData.memos && localData.memos.length > 0) {
          data.memos = localData.memos;
      }
      if (localData.challenges && localData.challenges.length > 0) {
          data.challenges = localData.challenges;
      }
      
      await setDoc(doc(db, "couples", code), data);
      console.log(`Merged local data into DB for ${code}. Buckets: ${data.buckets.length}`);
  } else {
      console.log("No local data found for LOVE-2026");
  }
}
fix().catch(e => { console.error(e); process.exit(1); });
