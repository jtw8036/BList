import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  const targetCode = "LOVE-2026";
  const snap = await getDoc(doc(db, "couples", targetCode));
  if (snap.exists()) {
    console.log("DB Buckets:", snap.data().buckets.length);
  }
}
test().catch(console.error);
