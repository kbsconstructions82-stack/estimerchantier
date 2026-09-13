// Initialisation paresseuse — firebase-admin n'est importé qu'à l'exécution
// jamais pendant la phase de build statique de Next.js

let _db = null

export async function getAdminDb() {
  if (_db) return _db

  const { default: admin } = await import('firebase-admin')

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }

  _db = admin.firestore()
  return _db
}
