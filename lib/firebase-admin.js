// Initialisation paresseuse — firebase-admin n'est importé qu'à l'exécution
// jamais pendant la phase de build statique de Next.js

let _admin = null
let _db = null
let _storage = null

async function getAdmin() {
  if (_admin) return _admin
  const { default: admin } = await import('firebase-admin')
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  }
  _admin = admin
  return _admin
}

export async function getAdminDb() {
  if (_db) return _db
  const admin = await getAdmin()
  _db = admin.firestore()
  return _db
}

export async function getAdminStorage() {
  if (_storage) return _storage
  const admin = await getAdmin()
  _storage = admin.storage().bucket()
  return _storage
}
