// Initialisation paresseuse — firebase-admin n'est importé qu'à l'exécution
// jamais pendant la phase de build statique de Next.js

let _app = null
let _db = null
let _storage = null

async function getAdminApp() {
  if (_app) return _app
  const { initializeApp, getApps, cert } = await import('firebase-admin/app')
  
  const apps = getApps()
  if (apps.length > 0) {
    _app = apps[0]
  } else {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_PRIVATE_KEY
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n')
    }
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

    _app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket,
    })
  }
  return _app
}

export async function getAdminDb() {
  if (_db) return _db
  const app = await getAdminApp()
  const { getFirestore } = await import('firebase-admin/firestore')
  _db = getFirestore(app)
  return _db
}

export async function getAdminStorage() {
  if (_storage) return _storage
  const app = await getAdminApp()
  const { getStorage } = await import('firebase-admin/storage')
  _storage = getStorage(app).bucket()
  return _storage
}

