import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

/**
 * POST /api/verify-estimation-session
 * Vérifie le paiement Stripe et crée un token one-shot utilisable pour 1 estimation.
 * Body: { sessionId, idToken }
 */
export async function POST(request) {
  try {
    const { sessionId, idToken } = await request.json()

    if (!sessionId || !idToken) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Vérifier le token Firebase
    const { getAdminApp, getAdminDb } = await import('@/lib/firebase-admin')
    await getAdminApp()
    const { getAuth } = await import('firebase-admin/auth')
    const { getApps } = await import('firebase-admin/app')
    const apps = getApps()
    const adminAuth = getAuth(apps[0])

    let uid
    try {
      const decoded = await adminAuth.verifyIdToken(idToken)
      uid = decoded.uid
    } catch {
      return NextResponse.json({ error: 'Token Firebase invalide' }, { status: 401 })
    }

    const db = await getAdminDb()

    // Mode simulation
    if (sessionId.startsWith('sim_')) {
      const tokenDoc = await db.collection('estimationTokens').doc(sessionId).get()
      if (!tokenDoc.exists) {
        return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
      }
      const tokenData = tokenDoc.data()
      if (tokenData.usedAt) {
        return NextResponse.json({ error: 'Session déjà utilisée' }, { status: 409 })
      }
      if (tokenData.uid !== uid) {
        return NextResponse.json({ error: 'Session non autorisée' }, { status: 403 })
      }
      return NextResponse.json({ valid: true, tokenId: sessionId })
    }

    // Vérification Stripe réelle
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch {
      return NextResponse.json({ error: 'Session Stripe introuvable' }, { status: 404 })
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 402 })
    }

    if (session.metadata?.type !== 'estimation') {
      return NextResponse.json({ error: 'Type de session invalide' }, { status: 400 })
    }

    // Vérifier que cette session n'a pas déjà été consommée
    const existingToken = await db.collection('estimationTokens').doc(sessionId).get()
    if (existingToken.exists && existingToken.data().usedAt) {
      return NextResponse.json({ error: 'Session déjà utilisée' }, { status: 409 })
    }

    // Créer ou confirmer le token one-shot
    await db.collection('estimationTokens').doc(sessionId).set({
      uid,
      usedAt: null,
      createdAt: new Date().toISOString(),
      stripeSessionId: sessionId,
    }, { merge: true })

    return NextResponse.json({ valid: true, tokenId: sessionId })
  } catch (error) {
    console.error('Erreur verify-estimation-session:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}
