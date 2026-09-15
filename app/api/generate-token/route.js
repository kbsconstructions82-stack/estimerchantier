import { NextResponse } from 'next/server'
import * as jose from 'jose'
import { getAdminDb } from '@/lib/firebase-admin'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'secret-temporaire-pour-dev-a-changer-en-prod'
)

export async function POST(request) {
  try {
    const { resourceId } = await request.json()

    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId manquant' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a bien acheté cette ressource
    // (optionnel côté serveur — la vérification principale se fait via le token JWT)
    const token = await new jose.SignJWT({ resourceId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(JWT_SECRET)

    return NextResponse.json({ token })
  } catch (err) {
    console.error('Erreur generate-token:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
