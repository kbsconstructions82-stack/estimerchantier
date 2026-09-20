import { NextResponse } from 'next/server'
import { BUNDLES } from '@/lib/resources'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export async function POST(request) {
  try {
    const { bundleId, idToken } = await request.json()

    // Trouver le bundle
    const bundle = BUNDLES.find(b => b.id === bundleId)
    if (!bundle) {
      return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 })
    }

    // Vérifier l'authentification Firebase
    if (!idToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { getAdminApp } = await import('@/lib/firebase-admin')
    await getAdminApp()
    const { getAuth } = await import('firebase-admin/auth')
    const { getApps } = await import('firebase-admin/app')
    const apps = getApps()

    let uid
    try {
      const decoded = await getAuth(apps[0]).verifyIdToken(idToken)
      uid = decoded.uid
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Pack ${bundle.label}`,
                description: `${bundle.count} document${bundle.count > 1 ? 's' : ''} — ${bundle.desc.slice(0, 100)}`,
              },
              unit_amount: Math.round(bundle.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/guides-techniques?bundle_session={CHECKOUT_SESSION_ID}&bundle_id=${bundle.id}`,
        cancel_url: `${baseUrl}/guides-techniques`,
        metadata: {
          type: 'bundle',
          bundleId: bundle.id,
          uid,
        },
      })

      return NextResponse.json({ url: session.url })
    } else {
      // Mode simulation
      console.log('Mode simulation bundle — STRIPE_SECRET_KEY manquant.')
      const { getAdminDb } = await import('@/lib/firebase-admin')
      const db = await getAdminDb()
      const tokenId = `sim_bundle_${Date.now()}_${uid}`
      await db.collection('bundleTokens').doc(tokenId).set({
        uid, bundleId: bundle.id, usedAt: null,
        createdAt: new Date().toISOString(), simulated: true,
      })
      return NextResponse.json({
        url: `${baseUrl}/guides-techniques?bundle_session=${tokenId}&bundle_id=${bundle.id}&simulated=1`,
      })
    }
  } catch (error) {
    console.error('Erreur checkout-bundle:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}
