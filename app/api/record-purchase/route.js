import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function POST(request) {
  try {
    const { userId, resourceId, title, price, stripeSessionId } = await request.json()

    if (!userId || !resourceId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const db = await getAdminDb()
    await db.collection('users').doc(userId).collection('purchases').doc(resourceId).set({
      title,
      purchasedAt: new Date().toISOString(),
      resourceId,
      price: price || 0,
      ...(stripeSessionId && { stripeSessionId }),
    }, { merge: true })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur record-purchase:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
