'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  TreePine, Home, Grid, Layers, Wrench, Sofa,
  MapPin, ArrowRight, ArrowLeft, CheckCircle, Upload,
  FileText, Calculator, Award, Clock, AlertTriangle
} from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Type de travaux' },
  { id: 2, label: 'Dimensions' },
  { id: 3, label: 'Localisation' },
  { id: 4, label: 'État du chantier' },
  { id: 5, label: 'Documents' },
  { id: 6, label: 'Vos coordonnées' },
]

const WORK_TYPES = [
  { id: 'terrasse', label: 'Terrasse sur plots', icon: <TreePine size={26} />, desc: 'Terrasse bois, composite ou dalle' },
  { id: 'extension', label: 'Extension ossature bois', icon: <Home size={26} />, desc: 'Agrandissement ossature bois' },
  { id: 'bardage', label: 'Bardage extérieur', icon: <Grid size={26} />, desc: 'Pose bardage bois ou composite' },
  { id: 'toiture', label: 'Rénovation toiture', icon: <Layers size={26} />, desc: 'Couverture, zinguerie, isolation' },
  { id: 'maconnerie', label: 'Maçonnerie gros-œuvre', icon: <Wrench size={26} />, desc: 'Mur, fondation, dalle béton' },
  { id: 'amenagement', label: 'Aménagement intérieur', icon: <Sofa size={26} />, desc: 'Cloisons, plaquisterie, sol' },
]

const FINITIONS = [
  { id: 'eco', label: 'Économique', desc: 'Matériaux standard, DIY privilégié', coeff: 0.75 },
  { id: 'standard', label: 'Standard', desc: 'Rapport qualité/prix optimal', coeff: 1 },
  { id: 'prestige', label: 'Haut de gamme', desc: 'Matériaux premium, finitions soignées', coeff: 1.5 },
]

const ETATS = [
  { id: 'nu', label: 'Terrain nu', desc: 'Construction depuis zéro' },
  { id: 'renovation', label: 'Rénovation sur existant', desc: 'Travaux sur structure en place' },
  { id: 'demolition', label: 'Démolition préalable', desc: 'Déconstruction nécessaire' },
]

const BUDGETS = {
  terrasse: { mat: 150, artisan: 350 },
  extension: { mat: 650, artisan: 1500 },
  bardage: { mat: 45, artisan: 140 },
  toiture: { mat: 60, artisan: 200 },
  maconnerie: { mat: 120, artisan: 400 },
  amenagement: { mat: 80, artisan: 250 },
}

function calculateBudget(type, surface, finition) {
  const base = BUDGETS[type] || BUDGETS.terrasse
  const coeff = { eco: 0.75, standard: 1, prestige: 1.5 }[finition] || 1
  return {
    matMin: Math.round(base.mat * surface * coeff * 0.85),
    matMax: Math.round(base.mat * surface * coeff * 1.15),
    artisanMin: Math.round(base.artisan * surface * coeff * 0.85),
    artisanMax: Math.round(base.artisan * surface * coeff * 1.15),
    saving: Math.round((base.artisan - base.mat) * surface * coeff),
  }
}

function getAdminStatus(type, surface) {
  if (surface > 40) return {
    status: 'PC',
    label: 'Permis de Construire requis',
    color: '#DC2626',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    cerfa: 'CERFA n°13406',
    detail: 'Surface > 40 m² → Permis de Construire obligatoire. Délai instruction : 2 à 3 mois.',
  }
  if (surface > 20) return {
    status: 'DP',
    label: 'Déclaration Préalable requise',
    color: '#D97706',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    cerfa: 'CERFA n°13703',
    detail: 'Surface entre 20 et 40 m² → Déclaration Préalable. Délai instruction : 1 mois.',
  }
  return {
    status: 'LIBRE',
    label: 'Travaux libres (pas de démarche)',
    color: '#059669',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    cerfa: null,
    detail: 'Surface ≤ 20 m² hors zone ABF → aucun formulaire requis.',
  }
}

const ROADMAP = [
  { step: 1, label: 'Préparation & études', desc: 'Relevé de cotes, plan d\'exécution, commande matériaux' },
  { step: 2, label: 'Terrassement & fondations', desc: 'Implantation, fouilles, semelles ou plots béton' },
  { step: 3, label: 'Structure & gros-œuvre', desc: 'Montage ossature, charpente, levage' },
  { step: 4, label: 'Couverture & étanchéité', desc: 'Pose toiture, pare-pluie, menuiseries' },
  { step: 5, label: 'Second-œuvre & isolation', desc: 'Isolation, bardage, revêtements intérieurs' },
  { step: 6, label: 'Finitions & réception', desc: 'Peintures, menuiseries intérieures, nettoyage de chantier' },
]

export default function EstimateurPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    type: '',
    surface: 25,
    hauteur: 2.5,
    finition: 'standard',
    postal: '',
    ville: '',
    etat: 'nu',
    file: null,
    nom: '',
    email: '',
  })
  const [showResults, setShowResults] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  const goNext = () => {
    if (step === 6) { setShowResults(true); return }
    setStep(s => Math.min(s + 1, 6))
  }
  const goPrev = () => setStep(s => Math.max(s - 1, 1))

  const canNext = () => {
    if (step === 1) return !!form.type
    if (step === 2) return form.surface > 0
    if (step === 3) return form.postal.length >= 4
    return true
  }

  const budget = form.type ? calculateBudget(form.type, form.surface, form.finition) : null
  const admin = form.type ? getAdminStatus(form.type, form.surface) : null

  if (showResults && budget && admin) {
    return (
      <main>
        <Navbar />
        <section className="section" style={{ minHeight: '80vh' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            {/* Header résultats */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-green">
                  <CheckCircle size={14} />
                  Estimation générée avec succès
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: '#0B132B', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                Dashboard de votre chantier
              </h1>
              <p style={{ color: '#64748B', fontSize: '1rem' }}>
                {WORK_TYPES.find(w => w.id === form.type)?.label} · {form.surface} m² · {form.ville || form.postal}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }} className="results-grid">
              {/* Budget matériaux */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Coût matériaux (achat direct)
                  </span>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.75rem', fontWeight: 800, color: '#10B981', marginBottom: '0.375rem' }}>
                  {budget.matMin.toLocaleString('fr-FR')} €
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  jusqu'à {budget.matMax.toLocaleString('fr-FR')} €
                </div>
                <div className="gauge-bar" style={{ background: '#E2E8F0', marginBottom: '0.5rem' }}>
                  <div className="gauge-fill" style={{ width: '65%', background: 'linear-gradient(90deg, #10B981, #059669)' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Achat négociant · Hors main d'œuvre
                </span>
              </div>

              {/* Budget artisan */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F97316' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Coût avec artisan (fourni + posé)
                  </span>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.75rem', fontWeight: 800, color: '#F97316', marginBottom: '0.375rem' }}>
                  {budget.artisanMin.toLocaleString('fr-FR')} €
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  jusqu'à {budget.artisanMax.toLocaleString('fr-FR')} €
                </div>
                <div className="gauge-bar" style={{ background: '#E2E8F0', marginBottom: '0.5rem' }}>
                  <div className="gauge-fill" style={{ width: '85%', background: 'linear-gradient(90deg, #F97316, #EA580C)' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Main d'œuvre incluse · TVA 10%
                </span>
              </div>

              {/* Économie autoconstruction */}
              <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '1rem' }}>
                  💰 Économie en autoconstruction
                </span>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2rem', fontWeight: 900, color: '#059669', marginBottom: '0.375rem' }}>
                  ~{budget.saving.toLocaleString('fr-FR')} €
                </div>
                <p style={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 600 }}>
                  Économie estimée en réalisant les travaux vous-même
                </p>
              </div>

              {/* Admin status */}
              <div className="card" style={{
                padding: '1.75rem',
                background: admin.bg,
                border: `1px solid ${admin.border}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    📋 Démarche administrative
                  </span>
                  <span style={{
                    background: admin.color,
                    color: 'white',
                    padding: '0.2rem 0.625rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {admin.status}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: admin.color, marginBottom: '0.625rem' }}>
                  {admin.label}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                  {admin.detail}
                </p>
                {admin.cerfa && (
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem', fontWeight: 700,
                    color: admin.color,
                  }}>
                    → {admin.cerfa}
                  </span>
                )}
              </div>
            </div>

            {/* Roadmap */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0B132B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: '#F97316' }} />
                Feuille de route du chantier
              </h3>
              <div style={{ position: 'relative' }}>
                {ROADMAP.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                    paddingBottom: i < ROADMAP.length - 1 ? '1.5rem' : '0',
                    position: 'relative',
                  }}>
                    {i < ROADMAP.length - 1 && (
                      <div style={{
                        position: 'absolute', left: '15px', top: '32px',
                        width: '2px', height: 'calc(100% - 16px)',
                        background: 'linear-gradient(to bottom, #F97316, #E2E8F0)',
                      }} />
                    )}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #F97316, #EA580C)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: '0.8rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      position: 'relative', zIndex: 1,
                    }}>
                      {item.step}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B132B', marginBottom: '0.2rem' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #0B132B, #1E293B)',
              borderRadius: '1.25rem',
              padding: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
            }}>
              <div>
                <h4 style={{ fontWeight: 800, color: 'white', fontSize: '1.05rem', marginBottom: '0.375rem' }}>
                  Téléchargez les plans complets avec calepinage
                </h4>
                <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                  Guide PDF complet avec plans cotés, liste de matériaux et calepinage détaillé.
                </p>
              </div>
              <button className="btn-primary">
                <FileText size={16} />
                Voir le guide technique → {form.type === 'terrasse' ? '49 €' : form.type === 'extension' ? '89 €' : '39 €'}
              </button>
            </div>
          </div>
        </section>
        <Footer />
        <style jsx>{`
          @media (max-width: 640px) { .results-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      <section className="section" style={{ minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          {/* Progress */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Étape {step} / {STEPS.length}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8rem', fontWeight: 700, color: '#F97316',
              }}>
                {Math.round(progress)}% complété
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              {STEPS.map((s) => (
                <div key={s.id} style={{
                  fontSize: '0.7rem', color: step >= s.id ? '#F97316' : '#CBD5E1',
                  fontWeight: step === s.id ? 700 : 500,
                  textAlign: 'center', flex: 1,
                  display: step === s.id || step - 1 === s.id || step + 1 === s.id ? 'block' : 'none',
                }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* STEP 1 — Type de travaux */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  Quel type de travaux ?
                </h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                  Sélectionnez votre projet pour une estimation précise.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
                  {WORK_TYPES.map(type => (
                    <div
                      key={type.id}
                      className={`step-card ${form.type === type.id ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, type: type.id }))}
                    >
                      <div style={{ color: form.type === type.id ? '#F97316' : '#64748B', transition: 'color 0.2s' }}>
                        {type.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B132B', marginBottom: '0.25rem' }}>
                          {type.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{type.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 — Dimensions */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  Dimensions & finition
                </h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                  Ces données déterminent la précision de l'estimation budgétaire.
                </p>
                <div className="card" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem' }}>
                      Surface totale
                    </label>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '1.75rem', fontWeight: 900, color: '#F97316',
                    }}>
                      {form.surface} m²
                    </span>
                  </div>
                  <input
                    type="range" min="5" max="500" value={form.surface}
                    onChange={e => setForm(f => ({ ...f, surface: Number(e.target.value) }))}
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>5 m²</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>500 m²</span>
                  </div>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem', display: 'block', marginBottom: '1rem' }}>
                    Niveau de finition
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {FINITIONS.map(fin => (
                      <div
                        key={fin.id}
                        className={`step-card ${form.finition === fin.id ? 'selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, finition: fin.id }))}
                        style={{ padding: '1rem' }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B132B' }}>{fin.label}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{fin.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Localisation */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  Localisation du chantier
                </h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                  Permet d'adapter l'analyse PLU et les coûts locaux.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                      Code postal *
                    </label>
                    <input
                      type="text" className="input-tech" placeholder="75001"
                      value={form.postal}
                      onChange={e => setForm(f => ({ ...f, postal: e.target.value }))}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                      Commune
                    </label>
                    <input
                      type="text" className="input-tech" placeholder="Paris"
                      value={form.ville}
                      onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{
                  background: 'rgba(249,115,22,0.06)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: '0.75rem', padding: '1rem',
                  marginTop: '1.5rem',
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                }}>
                  <MapPin size={16} style={{ color: '#F97316', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.8rem', color: '#92400E', lineHeight: '1.6' }}>
                    La localisation permet de vérifier les règles PLU locales, la présence d'une zone ABF 
                    (Architectes des Bâtiments de France) et les coûts de main-d'œuvre régionaux.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4 — État */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  État initial du chantier
                </h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                  Influence directement le coût total du projet.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {ETATS.map(etat => (
                    <div
                      key={etat.id}
                      className={`step-card ${form.etat === etat.id ? 'selected' : ''}`}
                      style={{ flexDirection: 'row', justifyContent: 'flex-start', textAlign: 'left', padding: '1.25rem' }}
                      onClick={() => setForm(f => ({ ...f, etat: etat.id }))}
                    >
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                        border: form.etat === etat.id ? '6px solid #F97316' : '2px solid #CBD5E1',
                        background: 'white', transition: 'all 0.2s',
                      }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0B132B', marginBottom: '0.25rem' }}>
                          {etat.label}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{etat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5 — Upload */}
            {step === 5 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  Documents (optionnel)
                </h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                  Croquis coté, plan existant ou photo du site. Affine l'estimation.
                </p>
                <div
                  className={`drop-zone ${dragActive ? 'active' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={e => {
                    e.preventDefault(); setDragActive(false)
                    const file = e.dataTransfer.files[0]
                    if (file) setForm(f => ({ ...f, file }))
                  }}
                >
                  <Upload size={32} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
                  {form.file ? (
                    <div>
                      <p style={{ fontWeight: 700, color: '#10B981' }}>✓ {form.file.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
                        {(form.file.size / 1024).toFixed(0)} Ko
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontWeight: 600, color: '#0B132B', marginBottom: '0.375rem' }}>
                        Glissez-déposez votre fichier ici
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>
                        PDF, DWG, JPG, PNG — Max. 20 Mo
                      </p>
                      <label style={{
                        display: 'inline-flex', cursor: 'pointer',
                        padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
                        border: '1.5px solid #E2E8F0', background: 'white',
                        fontWeight: 600, fontSize: '0.85rem', color: '#0B132B',
                      }}>
                        Parcourir mes fichiers
                        <input
                          type="file" accept=".pdf,.dwg,.jpg,.jpeg,.png"
                          style={{ display: 'none' }}
                          onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.875rem', textAlign: 'center' }}>
                  Cette étape est optionnelle. Vous pouvez passer à l'étape suivante.
                </p>
              </div>
            )}

            {/* STEP 6 — Coordonnées */}
            {step === 6 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                  Dernière étape !
                </h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                  Renseignez vos coordonnées pour recevoir l'estimation complète.
                </p>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                      Votre prénom *
                    </label>
                    <input type="text" className="input-tech" placeholder="Pierre"
                      value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                      Adresse email *
                    </label>
                    <input type="email" className="input-tech" placeholder="vous@email.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div style={{
                  background: 'rgba(11,19,43,0.04)',
                  borderRadius: '0.75rem', padding: '1rem',
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                }}>
                  <Award size={16} style={{ color: '#F97316', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.6' }}>
                    Votre estimation est <strong>100% gratuite</strong>. Vous recevrez aussi 
                    les recommandations personnalisées par email.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={goPrev}
              disabled={step === 1}
              className="btn-secondary"
              style={{ opacity: step === 1 ? 0.4 : 1 }}
            >
              <ArrowLeft size={16} />
              Retour
            </button>
            <button
              onClick={goNext}
              disabled={!canNext()}
              className="btn-primary"
              style={{ opacity: canNext() ? 1 : 0.5 }}
            >
              {step === 6 ? (
                <>
                  <Calculator size={16} />
                  Générer mon estimation
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
