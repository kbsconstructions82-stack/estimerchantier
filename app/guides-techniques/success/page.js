// Forcer le rendu dynamique — cette page dépend de searchParams et de Stripe
export const dynamic = 'force-dynamic'

import { RESOURCES } from '@/lib/resources'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Download, CheckCircle } from 'lucide-react'
import Stripe from 'stripe'
import * as jose from 'jose'
import PurchaseRecorder from './PurchaseRecorder'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-temporaire-pour-dev-a-changer-en-prod')

export default async function SuccessPage({ searchParams }) {
  const { session_id, resource_id, simulated, token: queryToken, user_id } = await searchParams

  const resource = RESOURCES.find(r => r.id === resource_id)

  let validToken = null
  let errorMsg = null
  let purchaseData = null

  if (!resource) {
    errorMsg = "Ressource introuvable."
  } else if (simulated && queryToken) {
    validToken = queryToken
    if (user_id) {
      purchaseData = { userId: user_id, resourceId: resource.id, title: resource.title, price: resource.price || 0 }
    }
  } else if (session_id && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      if (session.payment_status === 'paid') {
        const alg = 'HS256'
        validToken = await new jose.SignJWT({ resourceId: resource.id })
          .setProtectedHeader({ alg })
          .setIssuedAt()
          .setExpirationTime('24h')
          .sign(JWT_SECRET)

        const userId = session.metadata?.userId
        if (userId) {
          purchaseData = {
            userId,
            resourceId: resource.id,
            title: resource.title,
            price: resource.price || 0,
            stripeSessionId: session.id
          }
        }
      } else {
        errorMsg = "Le paiement n'a pas été validé."
      }
    } catch (err) {
      errorMsg = "Erreur lors de la vérification du paiement."
    }
  } else {
    errorMsg = "Paramètres invalides."
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {/* Enregistrement silencieux de l'achat côté client via API route */}
      {purchaseData && <PurchaseRecorder purchaseData={purchaseData} />}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '2rem' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>

          {errorMsg ? (
            <div>
              <h1 style={{ color: '#EF4444', fontSize: '1.5rem', marginBottom: '1rem' }}>Erreur</h1>
              <p style={{ color: '#64748B' }}>{errorMsg}</p>
              <a href="/guides-techniques" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem' }}>Retour aux guides</a>
            </div>
          ) : (
            <div>
              <CheckCircle size={64} style={{ color: '#10B981', margin: '0 auto 1.5rem' }} />
              <h1 style={{ color: '#0B132B', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Merci pour votre achat !</h1>
              <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                Votre paiement a été confirmé. Vous pouvez dès à présent télécharger votre document <strong>{resource.title}</strong>. Ce lien est valable pendant 24 heures.
              </p>
              <a
                href={`${resource.url}?token=${validToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', padding: '0.75rem 2rem' }}
              >
                <Download size={18} />
                Télécharger mon PDF
              </a>
              <div style={{ marginTop: '2rem' }}>
                <a href="/guides-techniques" style={{ color: '#94A3B8', textDecoration: 'underline', fontSize: '0.9rem' }}>Retour aux guides techniques</a>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  )
}
