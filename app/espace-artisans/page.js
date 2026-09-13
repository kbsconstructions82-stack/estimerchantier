'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  HardHat, Upload, FileText, Clock, Award, CheckCircle,
  ArrowRight, Zap, Shield, Users, Star, Check, ChevronDown, ChevronUp
} from 'lucide-react'

const PACKS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    unit: 'par chantier',
    desc: 'Pour tester notre service',
    features: [
      '1 dossier de métré complet',
      'Livraison sous 48h ouvrées',
      'Quantitatif + projet devis Word',
      'Format Excel éditable',
      '1 révision incluse',
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    unit: '/mois',
    desc: '5 dossiers par mois',
    features: [
      '5 dossiers de métrés / mois',
      'Livraison sous 24h',
      'Quantitatif + devis Word/Excel',
      'Plans CAD si besoin',
      'Révisions illimitées',
      'Accès espace client prioritaire',
    ],
    highlight: true,
    badge: 'Le plus populaire',
  },
  {
    id: 'expert',
    name: 'Expert',
    price: 499,
    unit: '/mois',
    desc: '20 dossiers par mois',
    features: [
      '20 dossiers de métrés / mois',
      'Livraison sous 12h',
      'Ingénieur dédié',
      'Intégration logiciel devis',
      'Révisions illimitées',
      'Support téléphonique prioritaire',
      'Rapport de conformité DTU',
    ],
    highlight: false,
  },
]

const HOW_IT_WORKS = [
  {
    step: '01', title: 'Déposez vos plans',
    desc: 'Téléversez vos plans (PDF, DWG, photos de croquis cotés). Notre système accepte tous les formats.',
    icon: <Upload size={24} />, color: '#F97316',
  },
  {
    step: '02', title: 'Analyse par un ingénieur',
    desc: 'Un ingénieur BTP certifié analyse vos plans et réalise le quantitatif complet selon les normes DTU.',
    icon: <Users size={24} />, color: '#0B132B',
  },
  {
    step: '03', title: 'Réception sous 48h',
    desc: 'Vous recevez le quantitatif + projet de devis modifiable Word/Excel. Prêt à envoyer à votre client.',
    icon: <FileText size={24} />, color: '#10B981',
  },
]

const FAQS = [
  {
    q: 'Quels formats de plans acceptez-vous ?',
    a: 'Nous acceptons les formats PDF, DWG (AutoCAD), DXF, JPG, PNG et photos de croquis cotés. Même un plan réalisé à la main est traitable.',
  },
  {
    q: 'Que contient le dossier de métré livré ?',
    a: 'Votre dossier comprend : le quantitatif détaillé par lot, un projet de devis modifiable Word, un fichier Excel avec les calculs de métrés, et un récapitulatif PDF.',
  },
  {
    q: 'Les métrés sont-ils conformes aux DTU ?',
    a: 'Oui, tous nos métrés sont réalisés en conformité avec les Documents Techniques Unifiés (DTU) et les Eurocodes en vigueur en France.',
  },
  {
    q: 'Puis-je annuler mon abonnement ?',
    a: 'Oui, sans frais ni préavis. Votre abonnement peut être annulé à tout moment depuis votre espace client.',
  },
  {
    q: 'Combien de révisions sont incluses ?',
    a: 'Les offres Pro et Expert incluent des révisions illimitées. L\'offre Starter inclut 1 révision gratuite.',
  },
]

export default function EspaceArtisansPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    projectTitle: '', desc: '', file: null,
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #0B132B 0%, #1a2744 60%, #0B132B 100%)',
        padding: '4.5rem 0 5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='white' fill-opacity='0.03'/%3E%3C/svg%3E")`,
        }} />
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3rem', alignItems: 'center' }} className="artisan-hero-grid">
            <div>
              <span className="badge" style={{ background: 'rgba(249,115,22,0.2)', color: '#F97316', border: '1px solid rgba(249,115,22,0.3)', marginBottom: '1.25rem', display: 'inline-flex' }}>
                <HardHat size={13} />
                Service B2B Artisans & Bureaux d'études
              </span>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                Vos métrés & devis<br />
                <span style={{ color: '#F97316' }}>livrés sous 48h.</span>
              </h1>
              <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '480px' }}>
                Envoyez vos plans de chantier. Recevez le quantitatif complet + devis modifiable 
                Word/Excel. Certifié par un ingénieur BTP conforme DTU.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { icon: <Clock size={16} />, label: 'Livraison 48h garantie' },
                  { icon: <Shield size={16} />, label: 'Conforme DTU & Eurocodes' },
                  { icon: <Award size={16} />, label: 'Certifié ingénieur BTP' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>
                    <span style={{ color: '#10B981' }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            {/* Quick stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }} className="artisan-stats">
              {[
                { value: '48h', label: 'Délai garanti' },
                { value: '500+', label: 'Artisans clients' },
                { value: '4.9/5', label: 'Note moyenne' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  padding: '1.25rem 2rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 900, fontSize: '1.75rem', color: '#F97316',
                    marginBottom: '0.25rem',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ background: '#F8FAFC' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-navy" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <Zap size={13} /> Comment ça marche
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.02em' }}>
              Simple, rapide, professionnel
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="card" style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '2.5rem', right: '-0.75rem',
                    color: '#E2E8F0', fontSize: '1.5rem', fontWeight: 900, zIndex: 1,
                    display: 'block',
                  }} className="arrow-connector">→</div>
                )}
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '2.5rem', fontWeight: 900,
                  color: `${item.color}20`,
                  marginBottom: '1rem', lineHeight: 1,
                }}>
                  {item.step}
                </div>
                <div style={{
                  width: '52px', height: '52px',
                  background: `${item.color}15`,
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color, margin: '0 auto 1.25rem',
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0B132B', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload form */}
      <section className="section">
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="upload-grid">
            <div>
              <span className="badge badge-orange" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                <Upload size={13} />
                Déposer un dossier
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
                Envoyez vos plans,<br />on fait le reste.
              </h2>

              {submitted ? (
                <div style={{
                  background: 'rgba(16,185,129,0.06)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '1rem', padding: '2rem', textAlign: 'center',
                }}>
                  <CheckCircle size={40} style={{ color: '#10B981', margin: '0 auto 1rem' }} />
                  <h3 style={{ fontWeight: 800, color: '#059669', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Dossier envoyé avec succès !
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    Notre équipe analysera vos plans et vous contactera sous 48h ouvrées avec votre métré complet.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <div>
                      <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Prénom *</label>
                      <input type="text" className="input-tech" placeholder="Pierre" required
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Société</label>
                      <input type="text" className="input-tech" placeholder="Dupont BTP"
                        value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Email professionnel *</label>
                    <input type="email" className="input-tech" placeholder="contact@dupont-btp.fr" required
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Intitulé du chantier *</label>
                    <input type="text" className="input-tech" placeholder="Extension maison individuelle - 35m²" required
                      value={form.projectTitle} onChange={e => setForm(f => ({ ...f, projectTitle: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Description (optionnel)</label>
                    <textarea className="input-tech" rows={3} placeholder="Précisez les lots à chiffrer, les matériaux souhaités..."
                      value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                      style={{ resize: 'vertical' }} />
                  </div>

                  {/* Upload zone */}
                  <div>
                    <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Plans & documents *</label>
                    <div
                      className={`drop-zone ${dragActive ? 'active' : ''}`}
                      style={{ padding: '2rem' }}
                      onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={e => {
                        e.preventDefault(); setDragActive(false)
                        setForm(f => ({ ...f, file: e.dataTransfer.files[0] }))
                      }}
                    >
                      {form.file ? (
                        <div style={{ color: '#10B981' }}>
                          <CheckCircle size={24} style={{ margin: '0 auto 0.5rem' }} />
                          <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{form.file.name}</p>
                          <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{(form.file.size / 1024).toFixed(0)} Ko</p>
                        </div>
                      ) : (
                        <div>
                          <Upload size={28} style={{ color: '#94A3B8', margin: '0 auto 0.75rem' }} />
                          <p style={{ fontWeight: 600, color: '#475569', marginBottom: '0.375rem', fontSize: '0.9rem' }}>
                            Glissez vos fichiers ici
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.875rem' }}>
                            PDF, DWG, DXF, JPG — Max. 50 Mo
                          </p>
                          <label style={{
                            display: 'inline-flex', cursor: 'pointer',
                            padding: '0.4rem 1rem', borderRadius: '0.5rem',
                            border: '1.5px solid #CBD5E1', background: 'white',
                            fontWeight: 600, fontSize: '0.8rem', color: '#0B132B',
                          }}>
                            Choisir un fichier
                            <input type="file" style={{ display: 'none' }} accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png"
                              onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))} />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}>
                    <HardHat size={17} />
                    Envoyer mon dossier — Devis sous 48h
                    <ArrowRight size={17} />
                  </button>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center' }}>
                    🔒 Fichiers chiffrés — Confidentialité garantie
                  </p>
                </form>
              )}
            </div>

            {/* Badge / guarantees */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                borderRadius: '1.25rem', padding: '1.75rem', color: 'white', textAlign: 'center',
              }}>
                <Clock size={32} style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                  48h
                </div>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Livraison garantie</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Remboursé si délai non respecté</div>
              </div>
              {[
                { icon: <FileText size={18} />, title: 'Quantitatif complet', desc: 'Détail par lot, par poste, avec métrés et ratios' },
                { icon: <Award size={18} />, title: 'Ingénieur certifié', desc: 'Chaque dossier validé par un ingénieur BTP diplômé' },
                { icon: <Shield size={18} />, title: 'Conformité DTU', desc: 'Respect des normes DTU, Eurocodes et règles de l\'art' },
              ].map((item, i) => (
                <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B132B', marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.5' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="section" style={{ background: '#F1F5F9' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-orange" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <Zap size={13} /> Tarification transparente
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.02em' }}>
              Formules adaptées à votre activité
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', maxWidth: '900px', margin: '0 auto' }}>
            {PACKS.map(pack => (
              <div key={pack.id} className="card" style={{
                padding: '2rem',
                border: pack.highlight ? '2px solid #F97316' : '1px solid rgba(226,232,240,0.8)',
                position: 'relative',
              }}>
                {pack.badge && (
                  <div style={{
                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #F97316, #EA580C)',
                    color: 'white', padding: '0.3rem 1rem',
                    borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    {pack.badge}
                  </div>
                )}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0B132B', marginBottom: '0.375rem' }}>{pack.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>{pack.desc}</p>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.25rem', fontWeight: 900, color: '#0B132B' }}>
                    {pack.price} €
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: '0.875rem', marginLeft: '0.375rem' }}>{pack.unit}</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
                  {pack.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                      <Check size={15} style={{ color: '#10B981', flexShrink: 0, marginTop: '1px' }} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className={pack.highlight ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'center' }}>
                  {pack.highlight ? 'Commencer maintenant' : 'Choisir cette formule'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: '680px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.02em' }}>
              Questions fréquentes
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '1.25rem 1.5rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0B132B', paddingRight: '1rem' }}>
                    {faq.q}
                  </span>
                  {openFaq === i
                    ? <ChevronUp size={18} style={{ color: '#F97316', flexShrink: 0 }} />
                    : <ChevronDown size={18} style={{ color: '#94A3B8', flexShrink: 0 }} />
                  }
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.5rem 1.25rem', borderTop: '1px solid #F1F5F9' }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.7', paddingTop: '0.875rem' }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @media (max-width: 768px) {
          .artisan-hero-grid { grid-template-columns: 1fr !important; }
          .artisan-stats { flex-direction: row !important; overflow-x: auto; }
          .upload-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
