import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const snapshot = await getDocs(collection(db, "couples"));
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", JSON.stringify(doc.data()).substring(0, 200));
  });
}
check().catch(console.error);
