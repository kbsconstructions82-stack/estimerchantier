'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  LogOut, BookOpen, Download, ShieldCheck, FileText,
  User, Mail, Calendar, Package, TrendingUp, Star,
} from 'lucide-react'
import * as jose from 'jose'

function getInitials(email) {
  if (!email) return '?'
  return email.split('@')[0].slice(0, 2).toUpperCase()
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '1rem',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{
        background: color + '20',
        borderRadius: '0.75rem',
        padding: '0.75rem',
        color: color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0B132B' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: '#F1F5F9', animation: 'pulse 1.5s infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 16, background: '#F1F5F9', borderRadius: 4, marginBottom: 8, width: '60%' }} />
          <div style={{ height: 12, background: '#F1F5F9', borderRadius: 4, width: '40%' }} />
        </div>
        <div style={{ width: 100, height: 36, background: '#F1F5F9', borderRadius: '0.5rem' }} />
      </div>
    </div>
  )
}

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasesLoading, setPurchasesLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setLoading(false)
        // Charger les achats en tâche de fond (non bloquant)
        setPurchasesLoading(true)
        await fetchPurchases(currentUser.uid)
        setPurchasesLoading(false)
      } else {
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [router])

  const fetchPurchases = async (uid) => {
    try {
      // Sans orderBy pour éviter le besoin d'un index Firestore
      const snapshot = await getDocs(collection(db, 'users', uid, 'purchases'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Tri côté client
      data.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))
      setPurchases(data)
    } catch (err) {
      console.error('Erreur lors de la récupération des achats:', err)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  const generateDownloadLink = async (resourceId) => {
    try {
      const alg = 'HS256'
      const secret = new TextEncoder().encode('secret-temporaire-pour-dev-a-changer-en-prod')
      const token = await new jose.SignJWT({ resourceId })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret)
      window.open(`/api/docs/divers/${resourceId}?token=${token}`, '_blank')
    } catch(e) { console.error(e) }
  }

  // Écran de chargement ultra-rapide (juste pendant la connexion Firebase)
  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem 3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '4px solid #F1F5F9', borderTop: '4px solid #F97316',
              animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#94A3B8', fontWeight: 500 }}>Connexion en cours...</p>
          </div>
        </div>
      </main>
    )
  }

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : 'Récemment'

  const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0)

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, background: '#F8FAFC', paddingTop: '5rem', paddingBottom: '3rem' }}>
        <div className="container" style={{ maxWidth: '960px', padding: '0 1rem' }}>

          {/* ── Hero / Carte profil ─────────────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(135deg, #0B132B 0%, #1E3A5F 100%)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            color: 'white',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Motif décoratif */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(249,115,22,0.1)' }} />
            <div style={{ position: 'absolute', bottom: -60, right: 60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(244,152,183,0.08)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', position: 'relative' }}>
              {/* Avatar avec initiales */}
              <div style={{
                width: 80, height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F97316, #f498b7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 900, color: 'white',
                boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
                flexShrink: 0,
              }}>
                {getInitials(user?.email)}
              </div>

              {/* Infos utilisateur */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={16} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compte vérifié</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  {user?.displayName || user?.email?.split('@')[0]}
                </h1>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                    <Mail size={13} /> {user?.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                    <Calendar size={13} /> Membre depuis {memberSince}
                  </div>
                </div>
              </div>

              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '2rem',
                  color: 'white',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <LogOut size={15} />
                Déconnexion
              </button>
            </div>
          </div>

          {/* ── Statistiques ─────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard icon={<Package size={22} />} label="Documents achetés" value={purchases.length} color="#F97316" />
            <StatCard icon={<TrendingUp size={22} />} label="Total dépensé" value={`${totalSpent.toFixed(2)} €`} color="#f498b7" />
            <StatCard icon={<Star size={22} />} label="Niveau" value="Pro" color="#10B981" />
          </div>

          {/* ── Liste des documents ──────────────────────────────────────────── */}
          <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0B132B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} style={{ color: '#F97316' }} />
                Mes documents
              </h2>
              <span style={{ background: '#FEF3EC', color: '#F97316', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '2rem' }}>
                {purchases.length} achat{purchases.length !== 1 ? 's' : ''}
              </span>
            </div>

            {purchasesLoading ? (
              <div style={{ padding: '1rem' }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : purchases.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <BookOpen size={48} style={{ color: '#CBD5E1', margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Aucun document pour le moment
                </h3>
                <p style={{ color: '#94A3B8', marginBottom: '2rem', fontSize: '0.9rem' }}>
                  Achetez votre premier guide technique BTP pour le retrouver ici.
                </p>
                <a href="/guides-techniques" className="btn-primary" style={{ display: 'inline-flex' }}>
                  Parcourir le catalogue
                </a>
              </div>
            ) : (
              <div>
                {purchases.map((purchase, i) => (
                  <div key={purchase.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderBottom: i < purchases.length - 1 ? '1px solid #F8FAFC' : 'none',
                    flexWrap: 'wrap', gap: '1rem',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #FEF3EC, #FFF0F5)',
                        padding: '0.75rem', borderRadius: '0.75rem',
                        border: '1px solid rgba(249,115,22,0.15)',
                      }}>
                        <FileText size={20} style={{ color: '#F97316' }} />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                          {purchase.title}
                        </h3>
                        <p style={{ color: '#94A3B8', fontSize: '0.78rem' }}>
                          Acheté le {new Date(purchase.purchasedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;•&nbsp; {purchase.price?.toFixed(2)} €
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => generateDownloadLink(purchase.resourceId)}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                    >
                      <Download size={14} />
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
