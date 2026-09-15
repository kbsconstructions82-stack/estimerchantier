import { NextResponse } from 'next/server'
import * as jose from 'jose'
import { getAdminStorage } from '@/lib/firebase-admin'

// Next.js 16 : params doit être awaité
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-temporaire-pour-dev-a-changer-en-prod')

export async function GET(request, context) {
  try {
    const params = await context.params
    const segments = params?.path
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!segments || segments.length === 0) {
      return new NextResponse('Chemin manquant', { status: 400 })
    }

    if (!token) {
      return new NextResponse('Accès refusé. Veuillez acheter le document pour le télécharger.', { status: 401 })
    }

    try {
      await jose.jwtVerify(token, JWT_SECRET)
    } catch {
      return new NextResponse('Lien de téléchargement expiré ou invalide.', { status: 403 })
    }

    // Reconstruire le chemin Firebase Storage : base/<cat>/<fichier.pdf>
    // Les segments sont décodés automatiquement par Next.js
    const storagePath = ['base', ...segments].join('/')

    try {
      const bucket = await getAdminStorage()
      const file = bucket.file(storagePath)

      // Générer un Signed URL temporaire (1 heure)
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 heure
      })

      // Rediriger le client directement vers Firebase Storage
      return NextResponse.redirect(signedUrl, { status: 302 })
    } catch (storageError) {
      console.error(`[API docs] Fichier introuvable sur Firebase Storage : ${storagePath}`, storageError)
      return new NextResponse('Fichier introuvable', { status: 404 })
    }
  } catch (error) {
    console.error('[API docs] Erreur serveur:', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}

