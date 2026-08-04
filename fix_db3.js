import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function fix() {
  const code = "20240831";
  const snap = await getDoc(doc(db, "couples", code));
  let data = null;
  if (snap.exists()) {
    data = snap.data();
    console.log(`Found data in ${code}. Buckets: ${data.buckets?.length}`);
  }
}
fix().catch(e => { console.error(e); process.exit(1); });
