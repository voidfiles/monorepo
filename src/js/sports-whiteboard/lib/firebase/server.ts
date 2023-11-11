import admin from "firebase-admin";

const cert = admin.credential.cert({
  projectId: process.env.WHITEBOARD_FIREBASE_PROJECT_ID,
  privateKey: process.env.WHITEBOARD_FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.WHITEBOARD_FIREBASE_CLIENT_EMAIL,
});

if (!admin.apps.length) {
  admin.initializeApp(
    {
      credential: cert,
    },
    "whiteboard"
  );
}

export default admin.app("whiteboard");
