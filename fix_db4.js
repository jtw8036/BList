import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);
import { getDefaultCoupleData } from "./src/data/initialData.ts";

async function fix() {
  const code = "LOVE-2026";
  const snap = await getDoc(doc(db, "couples", code));
  let data = null;
  if (snap.exists()) {
    data = snap.data();
    if (!data.buckets || data.buckets.length === 0) {
        console.log("No buckets, attempting to restore from default data");
        const defaultData = getDefaultCoupleData(code);
        data.buckets = defaultData.buckets;
        data.memos = defaultData.memos;
        data.challenges = defaultData.challenges;
        await setDoc(doc(db, "couples", code), data);
        console.log("Restored", data.buckets.length, "buckets");
    } else {
        console.log("Buckets exist:", data.buckets.length);
    }
  }
}
fix().catch(e => { console.error(e); process.exit(1); });
