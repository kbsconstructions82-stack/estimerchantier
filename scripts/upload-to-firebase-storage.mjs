/**
 * Script d'upload des PDFs vers Firebase Storage
 * Usage : node scripts/upload-to-firebase-storage.mjs
 *
 * Ce script uploade TOUS les PDFs du dossier base/ local vers
 * Firebase Storage avec la même arborescence (base/<cat>/<fichier.pdf>)
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BASE_DIR = join(ROOT, 'base')

// ── Charger le service account depuis le fichier JSON ───────────────────────
const serviceAccountPath = join(ROOT, 'estimer-chantier-firebase-adminsdk-fbsvc-29d5af5e4d.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

// ── Init Firebase Admin ──────────────────────────────────────────────────────
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'estimer-chantier.firebasestorage.app',
})

const bucket = getStorage().bucket()

// ── Fonction récursive pour lister tous les PDFs ─────────────────────────────
function listPdfs(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      results.push(...listPdfs(fullPath))
    } else if (entry.toLowerCase().endsWith('.pdf')) {
      results.push(fullPath)
    }
  }
  return results
}

// ── Upload ───────────────────────────────────────────────────────────────────
async function main() {
  const pdfs = listPdfs(BASE_DIR)
  console.log(`\n📦 ${pdfs.length} PDFs trouvés dans base/\n`)

  let success = 0
  let errors = 0

  for (const localPath of pdfs) {
    // Chemin relatif depuis la racine du projet : base/<cat>/<fichier.pdf>
    const relativePath = relative(ROOT, localPath).replace(/\\/g, '/')
    const destination = relativePath // ex: base/Charpente, couverture, étanchéité/Memo-...pdf

    try {
      process.stdout.write(`  ⬆  ${destination} ... `)
      await bucket.upload(localPath, {
        destination,
        metadata: {
          contentType: 'application/pdf',
          cacheControl: 'public, max-age=86400',
        },
      })
      console.log('✅')
      success++
    } catch (err) {
      console.log(`❌ ${err.message}`)
      errors++
    }
  }

  console.log(`\n────────────────────────────────────`)
  console.log(`✅ ${success} uploadés avec succès`)
  if (errors > 0) console.log(`❌ ${errors} erreurs`)
  console.log(`────────────────────────────────────\n`)
}

main().catch(err => {
  console.error('Erreur fatale :', err)
  process.exit(1)
})
