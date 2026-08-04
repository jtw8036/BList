import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

async function main() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);
  try {
    await setDoc(doc(db, 'couples', 'TEST'), { a: 1 });
    console.log('success');
  } catch (e) {
    console.error('error:', e);
  }
  process.exit(0);
}
main();
