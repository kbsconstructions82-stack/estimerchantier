'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Calculator, ArrowRight, TreePine, Home, Grid, Layers, Wrench, ChevronRight, Star, Users, FileText, Zap } from 'lucide-react'

const workTypes = [
  { id: 'terrasse', label: 'Terrasse bois', icon: <TreePine size={22} />, range: '150–400 €/m²' },
  { id: 'extension', label: 'Extension bois', icon: <Home size={22} />, range: '800–1800 €/m²' },
  { id: 'bardage', label: 'Bardage façade', icon: <Grid size={22} />, range: '60–180 €/m²' },
  { id: 'toiture', label: 'Rénovation toiture', icon: <Layers size={22} />, range: '80–250 €/m²' },
  { id: 'maconnerie', label: 'Maçonnerie', icon: <Wrench size={22} />, range: '200–600 €/m²' },
]

export default function EstimatorWidget() {
  const [selected, setSelected] = useState('terrasse')
  const [surface, setSurface] = useState(25)

  const prices = {
    terrasse: { min: 150, max: 400 },
    extension: { min: 800, max: 1800 },
    bardage: { min: 60, max: 180 },
    toiture: { min: 80, max: 250 },
    maconnerie: { min: 200, max: 600 },
  }

  const current = prices[selected]
  const budgetMin = (current.min * surface).toLocaleString('fr-FR')
  const budgetMax = (current.max * surface).toLocaleString('fr-FR')
  const budgetMid = Math.round(((current.min + current.max) / 2) * surface)

  return (
    <div style={{
      background: 'white',
      borderRadius: '1.5rem',
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: '0 24px 60px -12px rgba(11,19,43,0.16)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0B132B 0%, #1E293B 100%)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', background: '#10B981',
            boxShadow: '0 0 0 3px rgba(16,185,129,0.3)',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
            ESTIMATEUR RAPIDE v2.0
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {['#FF5F57', '#FFBD2E', '#27C840'].map((c, i) => (
            <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
          ))}
        </div>
      </div>

      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        {/* Work type selection */}
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Type de travaux
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {workTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                borderRadius: '0.5rem',
                border: selected === type.id ? '2px solid #F97316' : '2px solid #E2E8F0',
                background: selected === type.id ? 'rgba(249,115,22,0.06)' : 'white',
                color: selected === type.id ? '#EA580C' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>

        {/* Surface slider */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Surface
            </p>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700, fontSize: '1.1rem', color: '#0B132B',
            }}>
              {surface} m²
            </span>
          </div>
          <input
            type="range"
            min="5" max="200" value={surface}
            onChange={e => setSurface(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>5 m²</span>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>200 m²</span>
          </div>
        </div>

        {/* Budget result */}
        <div style={{
          background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: '1px solid #E2E8F0',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>Fourchette estimée</span>
            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              Mise à jour instantanée
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800, fontSize: '1.75rem', color: '#0B132B',
            }}>
              {budgetMin} €
            </span>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>—</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800, fontSize: '1.75rem', color: '#F97316',
            }}>
              {budgetMax} €
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
              <span style={{ color: '#10B981', fontWeight: 700 }}>Éco. autoconstruction : </span>
              ~{Math.round(budgetMid * 0.35).toLocaleString('fr-FR')} €
            </div>
          </div>
          {/* Simple bar */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '3px', height: '6px' }}>
            <div style={{ flex: 2, background: '#10B981', borderRadius: '3px 0 0 3px' }} />
            <div style={{ flex: 3, background: '#F97316' }} />
            <div style={{ flex: 1.5, background: '#E2E8F0', borderRadius: '0 3px 3px 0' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>■ Matériaux</span>
            <span style={{ fontSize: '0.65rem', color: '#F97316', fontWeight: 600 }}>■ Main d'œuvre</span>
            <span style={{ fontSize: '0.65rem', color: '#CBD5E1', fontWeight: 600 }}>■ Économies</span>
          </div>
        </div>

        {/* Admin alert */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '0.75rem',
          padding: '0.875rem',
          marginBottom: '1.25rem',
        }}>
          <FileText size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B45309', marginBottom: '0.2rem' }}>
              {surface > 20 ? '⚠ Déclaration Préalable requise' : '✓ Aucune démarche requise'}
            </p>
            <p style={{ fontSize: '0.72rem', color: '#92400E' }}>
              {surface > 40
                ? 'Surface > 40m² → Permis de Construire obligatoire'
                : surface > 20
                ? `Surface > 20m² → Déclaration Préalable (DP) — CERFA n°13703`
                : 'Surface ≤ 20m² en zone non-ABF — travaux libres'}
            </p>
          </div>
        </div>

        <Link href="/estimateur" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
          <Calculator size={16} />
          Obtenir l'estimation complète gratuite
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
