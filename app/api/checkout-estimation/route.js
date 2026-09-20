import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export async function POST(request) {
  try {
    const { userId, idToken } = await request.json()

    // Vérifier que l'utilisateur est authentifié côté serveur
    if (!idToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier le token Firebase Admin
    const { getAdminApp } = await import('@/lib/firebase-admin')
    await getAdminApp()
    const { getAuth } = await import('firebase-admin/auth')
    const { initializeApp, getApps } = await import('firebase-admin/app')
    const apps = getApps()
    const adminAuth = getAuth(apps[0])
    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken)
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    const uid = decodedToken.uid

    const PRICE_CENTS = 899 // 8,99 €
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Estimation Expert Complète',
                description: 'Rapport d\'estimation expert — métrés, postes détaillés, recommandations.',
              },
              unit_amount: PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/estimateur?estimation_session={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/estimateur`,
        metadata: {
          type: 'estimation',
          uid,
        },
      })

      return NextResponse.json({ url: session.url })
    } else {
      // Mode simulation (pas de Stripe configuré)
      console.log('Mode simulation — pas de clé Stripe, redirection directe.')
      const { getAdminDb } = await import('@/lib/firebase-admin')
      const db = await getAdminDb()
      const tokenId = `sim_${Date.now()}_${uid}`
      await db.collection('estimationTokens').doc(tokenId).set({
        uid,
        usedAt: null,
        createdAt: new Date().toISOString(),
        simulated: true,
      })
      return NextResponse.json({
        url: `${baseUrl}/estimateur?estimation_session=${tokenId}&simulated=1`,
      })
    }
  } catch (error) {
    console.error('Erreur checkout-estimation:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}
