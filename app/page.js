'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EstimatorWidget from '@/components/EstimatorWidget'
import {
  ArrowRight, Calculator, BookOpen, HardHat, Shield, CheckCircle,
  Star, FileText, Clock, Zap, ChevronRight, TrendingUp, Lock, Award
} from 'lucide-react'
import Image from 'next/image'

const guides = [
  {
    id: 1, title: 'Terrasse bois sur plots réglables', category: 'Bois & Charpente',
    price: 49, difficulty: 'Débutant', diffColor: '#10B981', image: '/guide-terrasse.jpg',
    surface: '10–80 m²', time: '2–5 jours', rating: 4.9, reviews: 127,
    tags: ['Plans PDF cotés', 'Liste matériaux', 'Calcul de charge'],
  },
  {
    id: 2, title: 'Extension ossature bois — De A à Z', category: 'Bois & Charpente',
    price: 89, difficulty: 'Intermédiaire', diffColor: '#F97316', image: '/guide-extension.jpg',
    surface: '15–60 m²', time: '3–8 semaines', rating: 4.8, reviews: 84,
    tags: ['Plans cotés A2', 'Calepinage', 'Formulaires CERFA'],
  },
  {
    id: 3, title: 'Bardage extérieur bois & composite', category: 'Façades & Bardages',
    price: 39, difficulty: 'Débutant', diffColor: '#10B981', image: '/guide-bardage.jpg',
    surface: '20–200 m²', time: '2–7 jours', rating: 4.7, reviews: 62,
    tags: ['Plans façades', 'Calepinage', 'DTU 41.2'],
  },
  {
    id: 4, title: 'Rénovation toiture — Zinguerie & isolation', category: 'Toiture & Couverture',
    price: 69, difficulty: 'Artisan confirmé', diffColor: '#8B5CF6', image: '/guide-toiture.jpg',
    surface: '40–300 m²', time: '1–3 semaines', rating: 4.9, reviews: 43,
    tags: ['Plans charpente', 'DTU 40.11', 'RE2020'],
  },
]

const stats = [
  { value: '2 400+', label: 'Estimations réalisées', icon: <Calculator size={20} /> },
  { value: '98%', label: 'Clients satisfaits', icon: <Star size={20} /> },
  { value: '48h', label: 'Délai métrés pro', icon: <Clock size={20} /> },
  { value: '100%', label: 'Conforme DTU', icon: <Shield size={20} /> },
]

const features = [
  { icon: <Calculator size={24} />, title: 'Estimateur intelligent', desc: 'Budget précis en 2 min. Matériaux + main d\'œuvre. Économies autoconstruction.', color: '#F97316', href: '/estimateur' },
  { icon: <BookOpen size={24} />, title: 'Guides techniques PDF', desc: 'Plans cotés, calepinages, listes fournitures. Conformes DTU & Eurocodes.', color: '#10B981', href: '/guides-techniques' },
  { icon: <HardHat size={24} />, title: 'Métrés & devis pros', desc: 'Envoyez vos plans, recevez votre quantitatif complet sous 48h.', color: '#8B5CF6', href: '/espace-artisans' },
  { icon: <FileText size={24} />, title: 'Démarches administratives', desc: 'Diagnostic DP vs PC, zones ABF, PLU. Formulaires CERFA inclus.', color: '#0B132B', href: '/estimateur' },
]

export default function HomePage() {
  const [mode, setMode] = useState('particulier')

  return (
    <main>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(160deg, #F8FAFC 0%, #F1F5F9 50%, #F8FAFC 100%)',
        position: 'relative', overflow: 'hidden',
        paddingTop: '1.5rem', paddingBottom: '4rem',
      }}>
        {/* Blobs décoratifs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(11,19,43,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="container">
          <div className="hero-grid">
            {/* Texte gauche */}
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="badge badge-orange">
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  Version 2.0 · Conforme DTU & Eurocodes
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(1.75rem, 5vw, 3.25rem)',
                fontWeight: 900, color: '#0B132B',
                lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.25rem',
              }}>
                L'ingénierie de{' '}
                <span className="gradient-text">chantier simplifiée.</span>
                <br />Du budget aux plans d'exécution.
              </h1>

              <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#64748B', lineHeight: 1.7, marginBottom: '1.75rem', maxWidth: '480px' }}>
                Estimez votre chantier en 2 minutes. Téléchargez les plans techniques.
                Métrés professionnels sous 48h. Conforme PLU, DTU, Eurocodes.
              </p>

              {/* Toggle B2C / B2B */}
              <div style={{ marginBottom: '1.75rem', overflowX: 'auto' }}>
                <div className="toggle-container" style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
                  <button className={`toggle-option ${mode === 'particulier' ? 'active' : ''}`} onClick={() => setMode('particulier')}>
                    🏠 Particulier / Autoconstructeur
                  </button>
                  <button className={`toggle-option ${mode === 'artisan' ? 'active' : ''}`} onClick={() => setMode('artisan')}>
                    🔨 Artisan & Pro BTP
                  </button>
                </div>
              </div>

              {mode === 'particulier' ? (
                <div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <Link href="/estimateur" className="btn-primary">
                      <Calculator size={17} /> Estimer mon chantier <ArrowRight size={15} />
                    </Link>
                    <Link href="/guides-techniques" className="btn-secondary">
                      <BookOpen size={17} /> Voir les guides PDF
                    </Link>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {['Estimation gratuite', 'Résultats instantanés', 'Sans engagement'].map(t => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', color: '#64748B' }}>
                        <CheckCircle size={14} style={{ color: '#10B981' }} /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <Link href="/espace-artisans" className="btn-primary">
                      <HardHat size={17} /> Déposer mes plans <ArrowRight size={15} />
                    </Link>
                    <Link href="/espace-artisans#tarifs" className="btn-secondary">
                      <FileText size={17} /> Voir les tarifs
                    </Link>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {['Devis sous 48h', 'Métrés certifiés', 'Abonnements pros'].map(t => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', color: '#64748B' }}>
                        <CheckCircle size={14} style={{ color: '#10B981' }} /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Widget estimateur */}
            <div className="hero-widget-wrap">
              <EstimatorWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#0B132B', padding: '2.5rem 0' }}>
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: '#F97316', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', color: 'white', marginBottom: '0.25rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-navy" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <Zap size={13} /> Nos services
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Tout ce dont vous avez besoin pour votre chantier
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
              Une plateforme complète pour les particuliers, autoconstructeurs et professionnels du BTP.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feat, i) => (
              <Link key={i} href={feat.href} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1.75rem', height: '100%', cursor: 'pointer' }}>
                  <div style={{ width: '48px', height: '48px', background: `${feat.color}15`, border: `1px solid ${feat.color}25`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: feat.color, marginBottom: '1.25rem' }}>
                    {feat.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0B132B', marginBottom: '0.5rem' }}>{feat.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1rem' }}>{feat.desc}</p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.825rem', fontWeight: 600, color: feat.color }}>
                    En savoir plus <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUIDES ── */}
      <section className="section" style={{ background: '#F1F5F9' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-green" style={{ marginBottom: '0.875rem', display: 'inline-flex' }}>
                <BookOpen size={13} /> Guides populaires
              </span>
              <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 2.25rem)', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.02em' }}>
                Plans & guides techniques PDF
              </h2>
              <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                Conçus par des ingénieurs BTP. Conformes aux normes DTU en vigueur.
              </p>
            </div>
            <Link href="/guides-techniques" className="btn-secondary">
              Voir tous les guides <ArrowRight size={16} />
            </Link>
          </div>
          <div className="guides-grid">
            {guides.map(guide => (
              <div key={guide.id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#E2E8F0' }}>
                  <Image src={guide.image} alt={guide.title} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(11,19,43,0.85)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.65rem', fontWeight: 600 }}>{guide.category}</div>
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: guide.diffColor, color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.65rem', fontWeight: 700 }}>{guide.difficulty}</div>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B132B', marginBottom: '0.5rem', lineHeight: '1.4' }}>{guide.title}</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>📐 {guide.surface}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>⏱ {guide.time}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
                    {guide.tags.map(tag => (
                      <span key={tag} className="badge badge-navy" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Star size={12} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0B132B' }}>{guide.rating}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>({guide.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '1rem', color: '#0B132B' }}>{guide.price} €</span>
                      <button style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Lock size={11} /> Acheter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── B2B SECTION ── */}
      <section className="section">
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, #0B132B 0%, #1a2744 100%)', borderRadius: '1.5rem', padding: 'clamp(2rem, 5vw, 3.5rem)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='white' fill-opacity='0.04'/%3E%3C/svg%3E")`, borderRadius: '1.5rem' }} />
            <div style={{ position: 'relative', zIndex: 1 }} className="b2b-inner">
              <div>
                <span className="badge" style={{ background: 'rgba(249,115,22,0.2)', color: '#F97316', border: '1px solid rgba(249,115,22,0.3)', marginBottom: '1.25rem', display: 'inline-flex' }}>
                  <HardHat size={13} /> Espace Artisans & Pros
                </span>
                <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2.25rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                  Métrés & devis livrés<br /><span style={{ color: '#F97316' }}>sous 48h ouvrées</span>
                </h2>
                <p style={{ color: '#94A3B8', lineHeight: '1.7', marginBottom: '1.75rem', maxWidth: '480px', fontSize: '0.95rem' }}>
                  Envoyez vos plans (PDF, DWG, croquis cotés). Recevez le quantitatif complet + devis modifiable Excel/Word. Certifié ingénieur BTP.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                  {['Quantitatif complet', 'Devis modifiable', 'Certifié ingénieur', 'Fichier sécurisé'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 500 }}>
                      <span style={{ color: '#F97316' }}>✓</span> {item}
                    </div>
                  ))}
                </div>
                <Link href="/espace-artisans" className="btn-primary">
                  <HardHat size={16} /> Déposer mes plans <ArrowRight size={16} />
                </Link>
              </div>
              <div className="b2b-badge-wrap">
                <div style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '1.25rem', padding: '2rem 2.5rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '3rem', fontWeight: 900, color: '#F97316', lineHeight: 1, marginBottom: '0.5rem' }}>48h</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>Délai de livraison<br />garanti</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section style={{ background: '#F8FAFC', padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#64748B' }}>Conformité et rigueur technique garanties</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.875rem' }}>
            {['DTU', 'Eurocodes', 'PLU', 'RE 2020', 'CERFA', 'ABF'].map(item => (
              <div key={item} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '0.75rem 1.125rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '0.9rem', color: '#0B132B' }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Prêt à chiffrer votre chantier ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', marginBottom: '2rem' }}>
            Gratuit, instantané, conforme aux normes françaises. Aucune inscription requise.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/estimateur" style={{ background: 'white', color: '#F97316', padding: '0.875rem 2rem', borderRadius: '0.625rem', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              <Calculator size={18} /> Estimer gratuitement
            </Link>
            <Link href="/guides-techniques" style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.6)', color: 'white', padding: '0.875rem 2rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} /> Voir les guides
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        /* Hero grid */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }
        .hero-widget-wrap {
          animation: float 4s ease-in-out infinite;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        /* Guides */
        .guides-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        /* B2B */
        .b2b-inner {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 3rem;
          align-items: center;
        }
        .b2b-badge-wrap { display: block; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .hero-widget-wrap {
            animation: none !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
          }
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .guides-grid {
            grid-template-columns: 1fr !important;
          }
          .b2b-inner {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .b2b-badge-wrap {
            display: flex !important;
            justify-content: center !important;
          }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .guides-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </main>
  )
}
