import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import fs from 'fs';

async function main() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);
  try {
    const snap = await getDoc(doc(db, 'couples', '20240831'));
    if (snap.exists()) {
      console.log(JSON.stringify(snap.data(), null, 2));
    }
  } catch (e) {
    console.error('error:', e);
  }
  process.exit(0);
}
main();
