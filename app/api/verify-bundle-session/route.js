import { NextResponse } from 'next/server'
import { BUNDLES } from '@/lib/resources'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

/**
 * POST /api/verify-bundle-session
 * Vérifie le paiement Stripe d'un pack et enregistre tous les achats dans Firestore.
 * Body: { sessionId, bundleId, idToken }
 */
export async function POST(request) {
  try {
    const { sessionId, bundleId, idToken } = await request.json()

    if (!sessionId || !bundleId || !idToken) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const bundle = BUNDLES.find(b => b.id === bundleId)
    if (!bundle) {
      return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 })
    }

    // Vérifier le token Firebase
    const { getAdminApp, getAdminDb } = await import('@/lib/firebase-admin')
    await getAdminApp()
    const { getAuth } = await import('firebase-admin/auth')
    const { getApps } = await import('firebase-admin/app')
    const apps = getApps()

    let uid
    try {
      const decoded = await getAuth(apps[0]).verifyIdToken(idToken)
      uid = decoded.uid
    } catch {
      return NextResponse.json({ error: 'Token Firebase invalide' }, { status: 401 })
    }

    const db = await getAdminDb()

    // Mode simulation
    if (sessionId.startsWith('sim_bundle_')) {
      const tokenDoc = await db.collection('bundleTokens').doc(sessionId).get()
      if (!tokenDoc.exists || tokenDoc.data().usedAt) {
        return NextResponse.json({ error: 'Session invalide ou déjà utilisée' }, { status: 409 })
      }
      if (tokenDoc.data().uid !== uid) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }
      await db.collection('bundleTokens').doc(sessionId).update({ usedAt: new Date().toISOString() })
      await recordBundlePurchases(db, uid, bundle)
      return NextResponse.json({ success: true, bundleId, count: bundle.resourceIds.length })
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
    if (session.metadata?.type !== 'bundle' || session.metadata?.bundleId !== bundleId) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 400 })
    }

    // Vérifier que la session n'a pas déjà été utilisée
    const existing = await db.collection('bundleTokens').doc(sessionId).get()
    if (existing.exists && existing.data().usedAt) {
      return NextResponse.json({ error: 'Session déjà utilisée' }, { status: 409 })
    }

    // Marquer comme utilisée
    await db.collection('bundleTokens').doc(sessionId).set({
      uid, bundleId, usedAt: new Date().toISOString(),
      stripeSessionId: sessionId, createdAt: new Date().toISOString(),
    }, { merge: true })

    // Enregistrer tous les achats du pack
    await recordBundlePurchases(db, uid, bundle)

    return NextResponse.json({ success: true, bundleId, count: bundle.resourceIds.length })
  } catch (error) {
    console.error('Erreur verify-bundle-session:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 })
  }
}

/**
 * Enregistre chaque ressource du pack dans users/{uid}/purchases
 * Même structure que les achats individuels
 */
async function recordBundlePurchases(db, uid, bundle) {
  const { RESOURCES } = await import('@/lib/resources')
  const batch = db.batch()
  const purchasedAt = new Date().toISOString()

  for (const resourceId of bundle.resourceIds) {
    const resource = RESOURCES.find(r => r.id === resourceId)
    if (!resource) continue
    const ref = db.collection('users').doc(uid).collection('purchases').doc(resourceId)
    batch.set(ref, {
      title: resource.title,
      purchasedAt,
      resourceId,
      price: resource.price || 0,
      bundleId: bundle.id,
      bundleTitle: bundle.label,
    }, { merge: true })
  }

  // Enregistrer aussi le pack lui-même
  const bundleRef = db.collection('users').doc(uid).collection('bundles').doc(bundle.id)
  batch.set(bundleRef, {
    bundleId: bundle.id,
    bundleTitle: bundle.label,
    purchasedAt,
    price: bundle.price,
    resourceCount: bundle.resourceIds.length,
  }, { merge: true })

  await batch.commit()
}
