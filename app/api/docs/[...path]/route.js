import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// Chemin absolu vers le répertoire base/
const BASE_DIR = path.join(process.cwd(), 'base')

// Next.js 16 : params doit être awaité
import * as jose from 'jose'

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

    let payload
    try {
      const { payload: jwtPayload } = await jose.jwtVerify(token, JWT_SECRET)
      payload = jwtPayload
    } catch (err) {
      return new NextResponse('Lien de téléchargement expiré ou invalide.', { status: 403 })
    }

    // Les segments sont déjà décodés par Next.js (décoding automatique des %XX)
    const filePath = path.join(BASE_DIR, ...segments)

    // Sécurité : s'assurer que le chemin reste dans BASE_DIR
    const resolvedPath = path.resolve(filePath)
    if (!resolvedPath.startsWith(path.resolve(BASE_DIR))) {
      return new NextResponse('Accès refusé', { status: 403 })
    }

    // Vérifier que le fichier existe
    if (!fs.existsSync(resolvedPath)) {
      console.error(`[API docs] Fichier introuvable : ${resolvedPath}`)
      return new NextResponse('Fichier introuvable', { status: 404 })
    }

    // Stream du fichier
    const fileBuffer = fs.readFileSync(resolvedPath)
    const fileName = path.basename(resolvedPath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('[API docs] Erreur serveur:', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
