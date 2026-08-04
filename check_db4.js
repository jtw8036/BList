import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const snapshot = await getDoc(doc(db, "couples", "LOVE-2026"));
  console.log(snapshot.exists() ? Object.keys(snapshot.data()) : "NOT FOUND 20240831");
  console.log("buckets count:", snapshot.data().buckets.length);
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
