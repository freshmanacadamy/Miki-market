import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "tutorial-8b436.firebasestorage.app"
});

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
