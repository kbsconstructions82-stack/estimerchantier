import { NextResponse } from 'next/server'
import { RESOURCES } from '@/lib/resources'
import Stripe from 'stripe'
import * as jose from 'jose'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-temporaire-pour-dev-a-changer-en-prod')

export async function POST(request) {
  try {
    const { resourceId, userId } = await request.json()
    const resource = RESOURCES.find(r => r.id === resourceId)

    if (!resource) {
      return NextResponse.json({ error: 'Ressource introuvable' }, { status: 404 })
    }

    const price = resource.price || 4.99
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin

    // 1. Si Stripe est configuré
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: resource.title,
                description: resource.desc,
              },
              unit_amount: Math.round(price * 100), // en centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/guides-techniques/success?session_id={CHECKOUT_SESSION_ID}&resource_id=${resource.id}${userId ? `&user_id=${userId}` : ''}`,
        cancel_url: `${baseUrl}/guides-techniques`,
        metadata: {
          resourceId: resource.id,
          userId: userId || null
        }
      })

      return NextResponse.json({ url: session.url })
    } 
    // 2. Si Stripe n'est PAS configuré (Mode simulation / démo)
    else {
      console.log('Mode simulation: création d\'un faux paiement car STRIPE_SECRET_KEY est manquant.')
      
      const alg = 'HS256'
      const token = await new jose.SignJWT({ resourceId: resource.id })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('24h') // le lien expire dans 24h
        .sign(JWT_SECRET)
      
      const successUrl = `${baseUrl}/guides-techniques/success?simulated=1&token=${token}&resource_id=${resource.id}${userId ? `&user_id=${userId}` : ''}`
      return NextResponse.json({ url: successUrl })
    }

  } catch (error) {
    console.error('Erreur checkout:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
