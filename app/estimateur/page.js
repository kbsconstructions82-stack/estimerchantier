'use client'
import { useState, useEffect, useCallback } from 'react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  TreePine, Home, Grid, Layers, Wrench, Sofa,
  MapPin, ArrowRight, ArrowLeft, CheckCircle, Upload,
  FileText, Calculator, Award, Clock, AlertTriangle,
  Sparkles, ChevronDown, ChevronUp, Copy, Printer,
  RefreshCw, TrendingUp, Zap, HardHat, Lock, Star, CreditCard, X,
} from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

/* ─────────────────── CONSTANTES ─────────────────── */
const STEPS = [
  { id: 1, label: 'Type de travaux' },
  { id: 2, label: 'Dimensions' },
  { id: 3, label: 'Localisation' },
  { id: 4, label: 'État & accès' },
  { id: 5, label: 'Bâtiment & projet' },
  { id: 6, label: 'Détails spécifiques' },
  { id: 7, label: 'Description' },
  { id: 8, label: 'Vos coordonnées' },
]

const ANCIENNETES = [
  { id: 'recent', label: '< 5 ans', desc: 'Construction récente', marge: 5 },
  { id: 'moderne', label: '5 – 20 ans', desc: 'Bâtiment moderne', marge: 8 },
  { id: 'ancien', label: '20 – 50 ans', desc: 'Travaux de rénovation standard', marge: 10 },
  { id: 'tresancien', label: '> 50 ans', desc: 'Risques amiante/plomb à prévoir', marge: 15 },
]

const REALISATIONS = [
  { id: 'artisan', label: 'Tout artisan', desc: 'Fourni et posé par un professionnel' },
  { id: 'mixte', label: 'Mixte DIY + artisan', desc: 'Gros œuvre artisan, finitions en autonomie' },
  { id: 'diy', label: 'Autoconstruction', desc: 'Réalisation personnelle, achat direct matériaux' },
]

const DETAILS_PAR_TYPE = {
  terrasse: [
    { key: 'typeTerrasse', label: 'Type de terrasse', options: ['Sur plots réglables', 'Sur dalle béton existante', 'Posée au sol (sans plots)', 'Terrasse sur pilotis'] },
    { key: 'materiau', label: 'Matériau souhaité', options: ['Bois exotique (Ipé, Teck)', 'Bois traité autoclave', 'Composite (lame)', 'Dalle carrelage extérieur', 'Dalle béton finition'] },
    { key: 'gardeCorps', label: 'Garde-corps nécessaire ?', options: ['Oui', 'Non', 'À étudier selon réglementation'] },
  ],
  extension: [
    { key: 'nbNiveaux', label: `Nombre de niveaux de l'extension`, options: ['1 niveau (plain-pied)', '2 niveaux', 'Combles aménagés'] },
    { key: 'ouverture', label: 'Ouverture dans mur existant ?', options: ['Oui — création de baie', 'Non — liaison extérieure simple', 'À étudier'] },
    { key: 'couverture', label: 'Type de couverture prévue', options: ['Toiture plate végétalisée', 'Toiture inclinée tuiles', 'Zinc / Bac acier', 'Polycarbonate / Verrière'] },
  ],
  bardage: [
    { key: 'facadeActuelle', label: 'Type de façade actuelle', options: ['Enduit (crépi)', 'Brique apparente', 'Béton brut', 'Parpaing nu', 'Autre bardage à remplacer'] },
    { key: 'isolationIncluse', label: `Isolation thermique par l'extérieur (ITE) ?`, options: ['Oui — avec isolation incluse', 'Non — bardage seul', 'À étudier'] },
    { key: 'materiauBardage', label: 'Matériau de bardage souhaité', options: ['Bois (Red cedar, mélèze)', 'Composite', 'Fibre-ciment', 'Zinc / Acier laqué', 'Pierre reconstituée'] },
  ],
  toiture: [
    { key: 'typeToitureActuel', label: 'Type de toiture actuelle', options: ['Tuiles terre cuite', 'Tuiles béton', 'Ardoises naturelles', 'Ardoises fibrociment', 'Zinc', 'Bac acier', 'Toiture plate'] },
    { key: 'isolationCombles', label: `Isolation des combles ?`, options: ['Oui — à inclure', 'Non — toiture seule', 'Combles déjà isolés'] },
    { key: 'charpente', label: 'État de la charpente', options: ['Bon état — aucun remplacement', 'Partiellement dégradée', 'Très dégradée — remplacement total'] },
  ],
  maconnerie: [
    { key: 'typeMaçonnerie', label: 'Type de travaux de maçonnerie', options: ['Fondations / semelles béton', 'Mur porteur / refend', 'Dalle béton', 'Escalier béton', 'Muret / clôture', 'Reprise en sous-œuvre'] },
    { key: 'typeMateriauMaçon', label: 'Matériau prévu', options: ['Béton armé coulé', 'Parpaing', 'Brique creuse', 'Pierre naturelle', 'Béton préfabriqué'] },
    { key: 'terrainDifficile', label: 'Terrain ou accès difficile ?', options: ['Non', 'Oui — terrain en pente', 'Oui — terrain argileux / humide', 'Oui — espace très contraint'] },
  ],
  amenagement: [
    { key: 'pieceConcernee', label: 'Pièce(s) concernée(s)', options: ['Salle de bain / Douche', 'Cuisine', 'Salon / Séjour', 'Chambre(s)', 'Couloir / Entrée', 'WC', 'Cave / Sous-sol'] },
    { key: 'plomberieElec', label: 'Travaux de plomberie ou électricité ?', options: ['Plomberie à modifier/créer', 'Électricité à modifier/créer', 'Les deux', 'Aucun — second œuvre uniquement'] },
    { key: 'revêtementSol', label: 'Revêtement de sol souhaité', options: ['Carrelage', 'Parquet massif', 'Parquet contrecollé', 'Stratifié / Vinyle', 'Béton ciré', 'Moquette'] },
  ],
}

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

const EXEMPLES_DESCRIPTION = [
  `Rénovation complète d'une salle de bain de 6m² au 3ème étage sans ascenseur à Paris, dépose de l'existant, pose de carrelage au sol et murs, remplacement douche par baignoire.`,
  `Construction d'une terrasse en bois de 30m² sur plots réglables dans le jardin, accès facile, maison de plain-pied en Bretagne.`,
  `Extension ossature bois de 20m² au rez-de-chaussée, maison des années 1980, terrain plat, accès chantier par portail large.`,
]

const LOADING_MESSAGES = [
  { icon: '📐', text: 'Analyse des métrés en cours...' },
  { icon: '💰', text: 'Application des taux de main-d\'œuvre régionaux...' },
  { icon: '🏗️', text: 'Chiffrage des fournitures aux prix marché...' },
  { icon: '⚖️', text: 'Calcul des marges d\'imprévus et aléas...' },
  { icon: '📊', text: 'Génération du rapport expert...' },
]

function getAdminStatus(surface) {
  if (surface > 40) return { status: 'PC', label: 'Permis de Construire requis', color: '#DC2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', cerfa: 'CERFA n°13406', detail: 'Surface > 40 m² → Permis de Construire obligatoire. Délai instruction : 2 à 3 mois.' }
  if (surface > 20) return { status: 'DP', label: 'Déclaration Préalable requise', color: '#D97706', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', cerfa: 'CERFA n°13703', detail: 'Surface entre 20 et 40 m² → Déclaration Préalable. Délai instruction : 1 mois.' }
  return { status: 'LIBRE', label: 'Travaux libres (pas de démarche)', color: '#059669', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', cerfa: null, detail: 'Surface ≤ 20 m² hors zone ABF → aucun formulaire requis.' }
}

/* ─────────────────── COMPOSANT RÉSULTATS ─────────────────── */
function ResultsView({ data, form, onReset }) {
  const [openReco, setOpenReco] = useState(null)
  const admin = getAdminStatus(Number(form.surface))
  const isDemo = data._demo

  const copyToClipboard = () => {
    const text = buildTextReport(data)
    navigator.clipboard.writeText(text)
    alert('Rapport copié dans le presse-papiers !')
  }

  return (
    <main>
      <Navbar />
      <section className="section" style={{ minHeight: '80vh', paddingTop: '3rem' }}>
        <div className="container" style={{ maxWidth: '960px' }}>

          {/* ── Header ── */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>

            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: '#0B132B', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Rapport d'Estimation Expert
            </h1>
            <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
              {data.synthese?.resume}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: '1.5px solid #E2E8F0', background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#0B132B' }}>
                <Printer size={15} /> Imprimer
              </button>
              <button onClick={copyToClipboard} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: '1.5px solid #E2E8F0', background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#0B132B' }}>
                <Copy size={15} /> Copier le rapport
              </button>
              <button onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: '1.5px solid #E2E8F0', background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>
                <RefreshCw size={15} /> Nouvelle estimation
              </button>
            </div>
          </div>

          {/* ── SECTION 1 : Synthèse & hypothèses ── */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <SectionTitle num="1" title="Synthèse du Projet" icon={<FileText size={18} />} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="synth-grid">
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Hypothèses de départ</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(data.synthese?.hypotheses || []).map((h, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.87rem', color: '#374151' }}>
                      <CheckCircle size={14} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Contraintes identifiées</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(data.synthese?.contraintes || []).map((c, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.87rem', color: '#374151' }}>
                      <AlertTriangle size={14} style={{ color: '#F97316', flexShrink: 0, marginTop: '2px' }} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Démarche admin */}
            <div style={{ marginTop: '1.25rem', background: admin.bg, border: `1px solid ${admin.border}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>📋 Démarche administrative</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: admin.color }}>{admin.label}</span>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>{admin.detail}</p>
              </div>
              <span style={{ background: admin.color, color: 'white', padding: '0.3rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>{admin.status}</span>
            </div>
          </div>

          {/* ── SECTION 2 : Tableau décomposé ── */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem', overflow: 'hidden' }}>
            <SectionTitle num="2" title="Décomposition Détaillée du Devis" icon={<Calculator size={18} />} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Poste / Phase', 'Description des prestations', 'Quantité', 'Matériaux HT (€)', 'Main-d\'œuvre HT (€)', 'Total HT (€)'].map((h) => (
                      <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '2px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.postes || []).map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                      <td style={{ padding: '0.875rem 0.75rem', fontWeight: 700, color: '#0B132B', fontSize: '0.85rem', minWidth: '160px' }}>{p.phase}</td>
                      <td style={{ padding: '0.875rem 0.75rem', color: '#475569', fontSize: '0.82rem', minWidth: '220px', lineHeight: '1.5' }}>{p.description}</td>
                      <td style={{ padding: '0.875rem 0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748B', fontSize: '0.82rem' }}>{p.quantite}</td>
                      <td style={{ padding: '0.875rem 0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#10B981', fontWeight: 700, textAlign: 'right' }}>{formatEur(p.coutMateriaux)}</td>
                      <td style={{ padding: '0.875rem 0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#F97316', fontWeight: 700, textAlign: 'right' }}>{formatEur(p.coutMainOeuvre)}</td>
                      <td style={{ padding: '0.875rem 0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#0B132B', fontWeight: 800, textAlign: 'right' }}>{formatEur(p.totalHT)}</td>
                    </tr>
                  ))}
                  {/* Totaux colonnes */}
                  <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0' }}>
                    <td colSpan={3} style={{ padding: '0.875rem 0.75rem', fontWeight: 800, color: '#0B132B', fontSize: '0.875rem' }}>SOUS-TOTAL POSTES</td>
                    <td style={{ padding: '0.875rem 0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#10B981', fontWeight: 800, textAlign: 'right' }}>{formatEur((data.postes || []).reduce((s, p) => s + (p.coutMateriaux || 0), 0))}</td>
                    <td style={{ padding: '0.875rem 0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#F97316', fontWeight: 800, textAlign: 'right' }}>{formatEur((data.postes || []).reduce((s, p) => s + (p.coutMainOeuvre || 0), 0))}</td>
                    <td style={{ padding: '0.875rem 0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#0B132B', fontWeight: 900, textAlign: 'right' }}>{formatEur((data.postes || []).reduce((s, p) => s + (p.totalHT || 0), 0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── SECTION 3 : Frais annexes ── */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <SectionTitle num="3" title="Frais Annexes & Logistique" icon={<HardHat size={18} />} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {(data.fraisAnnexes || []).map((f, i) => (
                <div key={i} style={{ background: '#F8FAFC', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B132B' }}>{f.poste}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#F97316', fontSize: '0.9rem', flexShrink: 0, marginLeft: '0.5rem' }}>{formatEur(f.montantHT)}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: '1.5' }}>{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 4 : Récapitulatif financier ── */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem', background: 'linear-gradient(135deg, #0B132B, #1E293B)', border: 'none' }}>
            <SectionTitle num="4" title="Estimation Financement Final" icon={<TrendingUp size={18} />} dark />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <RecapCard label="Sous-total HT" value={formatEur(data.recapitulatif?.sousTotalHT)} sub="Postes + Frais annexes" color="#94A3B8" />
              <RecapCard label={`Marge imprévus (${data.recapitulatif?.margeImprenus?.pourcentage || 10}%)`} value={formatEur(data.recapitulatif?.margeImprenus?.montantHT)} sub={data.recapitulatif?.margeImprenus?.justification} color="#F97316" />
              <RecapCard label={`TVA ${data.recapitulatif?.tva?.taux || 10}%`} value={formatEur(data.recapitulatif?.tva?.montant)} sub={data.recapitulatif?.tva?.justification} color="#60A5FA" />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <p style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>🏷️ FOURCHETTE D'ESTIMATION TOTALE TTC</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#10B981' }}>{formatEur(data.recapitulatif?.totalTTCBas)}</span>
                <span style={{ color: '#475569', fontSize: '1.25rem', fontWeight: 700 }}>—</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#F97316' }}>{formatEur(data.recapitulatif?.totalTTCHaut)}</span>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '0.75rem' }}>Fourchette haute / basse selon complexité et entreprise choisie</p>
            </div>
          </div>

          {/* ── SECTION 5 : Recommandations ── */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <SectionTitle num="5" title="Recommandations & Points de Vigilance" icon={<Award size={18} />} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '0.625rem', padding: '0.75rem 1rem' }}>
              <Clock size={16} style={{ color: '#F97316', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', color: '#92400E' }}>Délai estimé de réalisation : <strong>{data.delaiEstime || 'À préciser'}</strong></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
              {(data.recommandations || []).map((r, i) => (
                <div key={i} style={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenReco(openReco === i ? null : i)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: openReco === i ? '#FFF7ED' : 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0B132B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Zap size={14} style={{ color: '#F97316' }} />
                      {r.titre}
                    </span>
                    {openReco === i ? <ChevronUp size={16} style={{ color: '#94A3B8' }} /> : <ChevronDown size={16} style={{ color: '#94A3B8' }} />}
                  </button>
                  {openReco === i && (
                    <div style={{ padding: '0 1rem 1rem', fontSize: '0.84rem', color: '#475569', lineHeight: '1.6', background: '#FFF7ED', borderTop: '1px solid rgba(249,115,22,0.1)' }}>
                      {r.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {(data.questionsComplementaires?.length > 0) && (
              <div style={{ background: '#F8FAFC', borderRadius: '0.875rem', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0B132B', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={15} style={{ color: '#F97316' }} />
                  Informations manquantes pour affiner le prix
                </h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
                  {data.questionsComplementaires.map((q, i) => (
                    <li key={i} style={{ fontSize: '0.84rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ color: '#F97316', fontWeight: 700, flexShrink: 0 }}>?</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── CTA ── */}
          <div style={{ background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)', borderRadius: '1.25rem', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ fontWeight: 800, color: '#0B132B', fontSize: '1.05rem', marginBottom: '0.375rem' }}>Téléchargez les plans complets avec calepinage</h4>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Guide PDF complet avec plans cotés, liste de matériaux et calepinage détaillé.</p>
            </div>
            <Link href="/guides-techniques" className="btn-primary">
              <FileText size={16} />
              Voir les guides techniques
            </Link>
          </div>

        </div>
      </section>
      <Footer />
      <style jsx>{`
        @media (max-width: 640px) {
          .synth-grid { grid-template-columns: 1fr !important; }
        }
        @media print {
          .btn-primary, button { display: none !important; }
        }
      `}</style>
    </main>
  )
}

/* ─────────────────── HELPERS UI ─────────────────── */
function SectionTitle({ num, title, icon, dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
        {num}
      </div>
      <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: dark ? 'white' : '#0B132B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: dark ? '#94A3B8' : '#F97316' }}>{icon}</span>
        {title}
      </h3>
    </div>
  )
}

function RecapCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.875rem', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 900, fontSize: '1.5rem', color, marginBottom: '0.375rem' }}>{value}</p>
      {sub && <p style={{ fontSize: '0.72rem', color: '#475569', lineHeight: '1.4', margin: 0 }}>{sub}</p>}
    </div>
  )
}

function formatEur(n) {
  if (n == null || isNaN(n)) return '—'
  return Number(n).toLocaleString('fr-FR') + ' €'
}

function buildTextReport(data) {
  const lines = []
  lines.push('=== RAPPORT D\'ESTIMATION EXPERT ===\n')
  lines.push('## 1. SYNTHÈSE DU PROJET')
  lines.push(data.synthese?.resume || '')
  lines.push('\nHypothèses : ' + (data.synthese?.hypotheses || []).join(', '))
  lines.push('Contraintes : ' + (data.synthese?.contraintes || []).join(', '))
  lines.push('\n## 2. DÉCOMPOSITION DÉTAILLÉE')
  ;(data.postes || []).forEach(p => {
    lines.push(`  ${p.phase} | ${p.quantite} | Mat: ${p.coutMateriaux}€ | MO: ${p.coutMainOeuvre}€ | Total: ${p.totalHT}€`)
  })
  lines.push('\n## 3. FRAIS ANNEXES')
  ;(data.fraisAnnexes || []).forEach(f => lines.push(`  ${f.poste}: ${f.montantHT}€ — ${f.detail}`))
  lines.push('\n## 4. RÉCAPITULATIF')
  const r = data.recapitulatif || {}
  lines.push(`  Sous-total HT : ${r.sousTotalHT}€`)
  lines.push(`  Marge imprévus (${r.margeImprenus?.pourcentage}%) : ${r.margeImprenus?.montantHT}€`)
  lines.push(`  TVA ${r.tva?.taux}% : ${r.tva?.montant}€`)
  lines.push(`  FOURCHETTE TTC : ${r.totalTTCBas}€ — ${r.totalTTCHaut}€`)
  lines.push('\n## 5. RECOMMANDATIONS')
  ;(data.recommandations || []).forEach(r => lines.push(`  • ${r.titre} : ${r.detail}`))
  lines.push(`\nDélai estimé : ${data.delaiEstime || 'À préciser'}`)
  return lines.join('\n')
}

/* ─────────────────── PAGE PRINCIPALE ─────────────────── */
export default function EstimateurPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    type: '',
    surface: 25,
    finition: 'standard',
    postal: '',
    ville: '',
    etat: 'nu',
    etage: '',
    ascenseur: false,
    accesContrainte: '',
    // Step 5 — Bâtiment & projet
    anciennete: '',
    occupation: '',
    budgetCible: '',
    realisation: 'artisan',
    delaiSouhaite: '',
    amiantePlomb: '',
    // Step 6 — Détails spécifiques
    details: {},
    // Step 7 — Description
    description: '',
    // Step 8 — Coordonnées
    nom: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  // Auth & paywall
  const [user, setUser] = useState(undefined) // undefined = en cours de chargement
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallLoading, setPaywallLoading] = useState(false)
  const [pendingEstimationToken, setPendingEstimationToken] = useState(null)


  // Suivre l'état de connexion Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null))
    return () => unsub()
  }, [])

  // Après retour Stripe : vérifier la session et lancer l'estimation automatiquement
  const handlePostPayment = useCallback(async (sessionId, currentUser, savedForm) => {
    if (!currentUser) return
    try {
      const idToken = await currentUser.getIdToken()
      const res = await fetch('/api/verify-estimation-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, idToken }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        console.error('Session invalide:', data.error)
        return
      }
      // Lancer l'estimation avec le token validé
      setPendingEstimationToken(data.tokenId)
      // Appel direct sans passer par goNext
      submitEstimation(savedForm, currentUser, data.tokenId)
    } catch (e) {
      console.error('Erreur vérification session:', e)
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('estimation_session')
    if (sessionId && user) {
      // Nettoyer l'URL sans rechargement
      window.history.replaceState({}, '', '/estimateur')
      // Récupérer le formulaire sauvegardé en sessionStorage
      try {
        const savedRaw = sessionStorage.getItem('estimateur_form_pending')
        const savedForm = savedRaw ? JSON.parse(savedRaw) : form
        handlePostPayment(sessionId, user, savedForm)
      } catch {
        handlePostPayment(sessionId, user, form)
      }
    }
  }, [user]) // eslint-disable-line

  const progress = ((step - 1) / (STEPS.length - 1)) * 100
  const goNext = () => {
    if (step === STEPS.length) { handleSubmit(); return }
    setStep(s => Math.min(s + 1, STEPS.length))
  }
  const goPrev = () => setStep(s => Math.max(s - 1, 1))
  const canNext = () => {
    if (step === 1) return !!form.type
    if (step === 2) return form.surface > 0
    if (step === 3) return form.postal.length >= 4
    if (step === 7) return form.description.trim().length >= 20
    return true
  }

  // Fonction principale d'appel API (utilisable avec un token one-shot)
  const submitEstimation = async (formData, currentUser, estimationToken) => {
    setLoading(true)
    setError(null)
    setLoadingStep(0)

    const interval = setInterval(() => {
      setLoadingStep(s => {
        if (s >= LOADING_MESSAGES.length - 1) { clearInterval(interval); return s }
        return s + 1
      })
    }, 900)

    try {
      const headers = { 'Content-Type': 'application/json' }
      if (currentUser) {
        const idToken = await currentUser.getIdToken()
        headers['Authorization'] = `Bearer ${idToken}`
      }
      const body = estimationToken
        ? { ...formData, _estimationToken: estimationToken }
        : formData

      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      clearInterval(interval)

      if (!res.ok) {
        const err = await res.json()
        // Paywall
        if (err.error === 'PAYWALL') {
          setLoading(false)
          setShowPaywall(true)
          return
        }
        throw new Error(err.error || 'Erreur serveur')
      }
      const data = await res.json()
      // Nettoyer le form sauvegardé
      sessionStorage.removeItem('estimateur_form_pending')
      setResults(data)
    } catch (e) {
      clearInterval(interval)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Vérification auth
    if (!user) {
      setShowPaywall(true)
      return
    }
    submitEstimation(form, user, pendingEstimationToken)
  }

  // Lancer le paiement Stripe pour une estimation
  const handlePayEstimation = async () => {
    if (!user) {
      window.location.href = '/login?redirect=/estimateur'
      return
    }
    setPaywallLoading(true)
    try {
      // Sauvegarder le formulaire en sessionStorage avant de quitter la page
      sessionStorage.setItem('estimateur_form_pending', JSON.stringify(form))
      const idToken = await user.getIdToken()
      const res = await fetch('/api/checkout-estimation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, idToken }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erreur paiement')
      }
    } catch (e) {
      alert('Erreur lors du paiement : ' + e.message)
    } finally {
      setPaywallLoading(false)
    }
  }

  if (results) return <ResultsView data={results} form={form} onReset={() => { setResults(null); setStep(1); setPendingEstimationToken(null) }} />

  /* ── Paywall Modal ── */
  const PaywallModal = () => (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(11,19,43,0.72)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'white', borderRadius: '1.5rem',
        padding: '2.5rem 2rem', maxWidth: '440px', width: '100%',
        boxShadow: '0 32px 80px rgba(11,19,43,0.25)',
        position: 'relative', textAlign: 'center',
      }}>
        {/* Fermer */}
        <button
          onClick={() => setShowPaywall(false)}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0.25rem' }}
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '1rem', background: 'linear-gradient(135deg, #F97316, #EA580C)', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }}>
          <Sparkles size={28} style={{ color: 'white' }} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Estimation IA Complète
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {!user
            ? "Connectez-vous pour accéder à l'estimation IA expert."
            : "Obtenez un rapport d'expert complet généré par Google Gemini."}
        </p>

        {/* Prix */}
        {user && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #FEF3EC, #FFF7F0)', border: '2px solid rgba(249,115,22,0.2)', borderRadius: '1.25rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#F97316', lineHeight: 1, marginBottom: '0.25rem' }}>8,99 €</div>
              <div style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>paiement unique • achat sécurisé par Stripe</div>
            </div>

            <ul style={{ listStyle: 'none', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
              {[
                'Métrés détaillés par poste de travaux',
                "Prix matériaux + main-d'œuvre séparés",
                "Marge d'imprévus calculée selon ancienneté",
                'Recommandations expert & délai estimatif',
                'Rapport imprimable PDF',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: '#374151' }}>
                  <CheckCircle size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handlePayEstimation}
              disabled={paywallLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                color: 'white', border: 'none', borderRadius: '0.875rem',
                padding: '0.9rem 1.5rem', fontSize: '1rem', fontWeight: 800,
                cursor: paywallLoading ? 'wait' : 'pointer',
                boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                transition: 'opacity 0.2s', opacity: paywallLoading ? 0.7 : 1,
              }}
            >
              <CreditCard size={18} />
              {paywallLoading ? 'Redirection...' : "Payer 8,99 € — Lancer l'estimation"}
            </button>

            <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.875rem' }}>
              Vous avez un abonnement ?{' '}
              <Link href="/compte" style={{ color: '#F97316', fontWeight: 600 }}>Votre compte</Link>
            </p>
          </>
        )}

        {/* Non connecté */}
        {!user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              href="/login?redirect=/estimateur"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <Lock size={16} /> Se connecter
            </Link>
            <button onClick={() => setShowPaywall(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.875rem', cursor: 'pointer' }}>
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  )


  /* ── Loading screen ── */
  if (loading) {
    return (
      <main>
        <Navbar />
        <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #F97316, #EA580C)', marginBottom: '2rem', animation: 'spin 2s linear infinite' }}>
              <Sparkles size={28} style={{ color: 'white' }} />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#0B132B', marginBottom: '0.75rem' }}>Analyse en cours...</h2>
            <p style={{ color: '#64748B', marginBottom: '2.5rem', lineHeight: '1.6' }}>Notre expert IA analyse votre projet et génère un rapport détaillé.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {LOADING_MESSAGES.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', background: i === loadingStep ? 'rgba(249,115,22,0.08)' : i < loadingStep ? 'rgba(16,185,129,0.06)' : '#F8FAFC', border: `1px solid ${i === loadingStep ? 'rgba(249,115,22,0.3)' : i < loadingStep ? 'rgba(16,185,129,0.2)' : '#E2E8F0'}`, transition: 'all 0.3s ease' }}>
                  <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: i <= loadingStep ? 700 : 500, color: i === loadingStep ? '#EA580C' : i < loadingStep ? '#059669' : '#94A3B8' }}>{m.text}</span>
                  {i < loadingStep && <CheckCircle size={16} style={{ color: '#10B981', marginLeft: 'auto', flexShrink: 0 }} />}
                  {i === loadingStep && <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #F97316', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', marginLeft: 'auto', flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>
        </section>
        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
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
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 700, color: '#F97316' }}>
                {Math.round(progress)}% complété
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              {STEPS.map((s) => (
                <div key={s.id} style={{ fontSize: '0.7rem', color: step >= s.id ? '#F97316' : '#CBD5E1', fontWeight: step === s.id ? 700 : 500, textAlign: 'center', flex: 1, display: step === s.id || step - 1 === s.id || step + 1 === s.id ? 'block' : 'none' }}>
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
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Quel type de travaux ?</h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>Sélectionnez votre projet pour une estimation précise.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
                  {WORK_TYPES.map(type => (
                    <div
                      key={type.id}
                      className={`step-card ${form.type === type.id ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, type: type.id }))}
                    >
                      <div style={{ color: form.type === type.id ? '#F97316' : '#64748B', transition: 'color 0.2s' }}>{type.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B132B', marginBottom: '0.25rem' }}>{type.label}</div>
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
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Dimensions & finition</h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>Ces données déterminent la précision de l'estimation budgétaire.</p>
                <div className="card" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem' }}>Surface totale</label>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.75rem', fontWeight: 900, color: '#F97316' }}>{form.surface} m²</span>
                  </div>
                  <input type="range" min="5" max="500" value={form.surface} onChange={e => setForm(f => ({ ...f, surface: Number(e.target.value) }))} style={{ width: '100%', marginBottom: '0.5rem' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>5 m²</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>500 m²</span>
                  </div>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem', display: 'block', marginBottom: '1rem' }}>Niveau de finition</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {FINITIONS.map(fin => (
                      <div key={fin.id} className={`step-card ${form.finition === fin.id ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, finition: fin.id }))} style={{ padding: '1rem' }}>
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
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Localisation du chantier</h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>Permet d'adapter l'analyse PLU et les coûts locaux.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Code postal *</label>
                    <input type="text" className="input-tech" placeholder="75001" value={form.postal} onChange={e => setForm(f => ({ ...f, postal: e.target.value }))} maxLength={5} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Commune</label>
                    <input type="text" className="input-tech" placeholder="Paris" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
                  </div>
                </div>
                <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '0.75rem', padding: '1rem', marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={16} style={{ color: '#F97316', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.8rem', color: '#92400E', lineHeight: '1.6' }}>La localisation permet de vérifier les règles PLU locales, la présence d'une zone ABF (Architectes des Bâtiments de France) et les coûts de main-d'œuvre régionaux.</p>
                </div>
              </div>
            )}

            {/* STEP 4 — État & accès */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>État initial & accès chantier</h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>Ces informations influencent directement le coût total.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                  {ETATS.map(etat => (
                    <div key={etat.id} className={`step-card ${form.etat === etat.id ? 'selected' : ''}`} style={{ flexDirection: 'row', justifyContent: 'flex-start', textAlign: 'left', padding: '1.25rem' }} onClick={() => setForm(f => ({ ...f, etat: etat.id }))}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, border: form.etat === etat.id ? '6px solid #F97316' : '2px solid #CBD5E1', background: 'white', transition: 'all 0.2s' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0B132B', marginBottom: '0.25rem' }}>{etat.label}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{etat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Accès chantier */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Contraintes d'accès (optionnel)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Étage</label>
                      <select className="input-tech" value={form.etage} onChange={e => setForm(f => ({ ...f, etage: e.target.value }))} style={{ width: '100%' }}>
                        <option value="">Rez-de-chaussée / Extérieur</option>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}er{n === 1 ? '' : 'ème'} étage</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Ascenseur disponible</label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {[{ v: false, l: 'Non' }, { v: true, l: 'Oui' }].map(opt => (
                          <button key={String(opt.v)} onClick={() => setForm(f => ({ ...f, ascenseur: opt.v }))} style={{ flex: 1, padding: '0.625rem', borderRadius: '0.5rem', border: `2px solid ${form.ascenseur === opt.v ? '#F97316' : '#E2E8F0'}`, background: form.ascenseur === opt.v ? 'rgba(249,115,22,0.06)' : 'white', color: form.ascenseur === opt.v ? '#EA580C' : '#475569', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Autres contraintes d'accès</label>
                    <input type="text" className="input-tech" placeholder="Ex: stationnement difficile, ruelle étroite, code d'accès..." value={form.accesContrainte} onChange={e => setForm(f => ({ ...f, accesContrainte: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5 — Bâtiment & projet */}
            {step === 5 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Votre bâtiment & votre projet</h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>Ces informations permettent à l'IA d'affiner la marge d'aléas et les coûts réels.</p>

                {/* Ancienneté */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem', display: 'block', marginBottom: '1rem' }}>Ancienneté du bâtiment</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {ANCIENNETES.map(a => (
                      <div key={a.id} className={`step-card ${form.anciennete === a.id ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, anciennete: a.id }))} style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0B132B' }}>{a.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>{a.desc}</div>
                        <div style={{ fontSize: '0.72rem', color: '#F97316', fontWeight: 700, marginTop: '0.375rem' }}>Marge aléas : ~{a.marge}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Occupation */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem', display: 'block', marginBottom: '0.875rem' }}>Logement occupé pendant les travaux ?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                    {['Occupé (habitants présents)', 'Vide (logement libre)', 'Partiellement occupé'].map(opt => (
                      <button key={opt} onClick={() => setForm(f => ({ ...f, occupation: opt }))} style={{ padding: '0.75rem', borderRadius: '0.625rem', border: `2px solid ${form.occupation === opt ? '#F97316' : '#E2E8F0'}`, background: form.occupation === opt ? 'rgba(249,115,22,0.06)' : 'white', color: form.occupation === opt ? '#EA580C' : '#475569', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', lineHeight: '1.4' }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode de réalisation */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem', display: 'block', marginBottom: '1rem' }}>Mode de réalisation</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {REALISATIONS.map(r => (
                      <div key={r.id} className={`step-card ${form.realisation === r.id ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, realisation: r.id }))} style={{ flexDirection: 'row', padding: '1rem' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: form.realisation === r.id ? '5px solid #F97316' : '2px solid #CBD5E1', background: 'white', transition: 'all 0.2s', marginTop: '2px' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B132B' }}>{r.label}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{r.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget cible & délai */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Budget cible (optionnel)</label>
                      <input type="text" className="input-tech" placeholder="Ex: 15 000 €" value={form.budgetCible} onChange={e => setForm(f => ({ ...f, budgetCible: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Délai souhaité</label>
                      <select className="input-tech" value={form.delaiSouhaite} onChange={e => setForm(f => ({ ...f, delaiSouhaite: e.target.value }))} style={{ width: '100%' }}>
                        <option value="">Pas de contrainte</option>
                        <option value="urgent">Urgent — sous 1 mois</option>
                        <option value="3mois">Sous 3 mois</option>
                        <option value="6mois">Sous 6 mois</option>
                        <option value="flexible">Flexible — sans contrainte</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ fontWeight: 600, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Présence suspectée d'amiante ou plomb ?</label>
                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                      {['Non / Inconnu', 'Possible (bâtiment avant 1997)', 'Diagnostic réalisé — présence confirmée'].map(opt => (
                        <button key={opt} onClick={() => setForm(f => ({ ...f, amiantePlomb: opt }))} style={{ flex: 1, padding: '0.625rem 0.5rem', borderRadius: '0.5rem', border: `2px solid ${form.amiantePlomb === opt ? '#F97316' : '#E2E8F0'}`, background: form.amiantePlomb === opt ? 'rgba(249,115,22,0.06)' : 'white', color: form.amiantePlomb === opt ? '#EA580C' : '#475569', fontWeight: 600, fontSize: '0.73rem', cursor: 'pointer', lineHeight: '1.4' }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6 — Détails spécifiques au type */}
            {step === 6 && (() => {
              const details = DETAILS_PAR_TYPE[form.type] || []
              return (
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Détails spécifiques</h2>
                  <p style={{ color: '#64748B', marginBottom: '2rem' }}>Précisez les caractéristiques de votre projet pour un chiffrage encore plus précis.</p>
                  {details.length === 0 && (
                    <div style={{ background: '#F8FAFC', borderRadius: '1rem', padding: '2rem', textAlign: 'center', color: '#64748B' }}>Aucune question spécifique pour ce type. Vous pouvez passer à l'étape suivante.</div>
                  )}
                  {details.map(d => (
                    <div key={d.key} style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.95rem', display: 'block', marginBottom: '0.875rem' }}>{d.label}</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {d.options.map(opt => (
                          <button key={opt} onClick={() => setForm(f => ({ ...f, details: { ...f.details, [d.key]: opt } }))} style={{ textAlign: 'left', padding: '0.875rem 1rem', borderRadius: '0.625rem', border: `2px solid ${form.details[d.key] === opt ? '#F97316' : '#E2E8F0'}`, background: form.details[d.key] === opt ? 'rgba(249,115,22,0.06)' : 'white', color: form.details[d.key] === opt ? '#EA580C' : '#475569', fontWeight: form.details[d.key] === opt ? 700 : 500, fontSize: '0.87rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: form.details[d.key] === opt ? '4px solid #F97316' : '2px solid #CBD5E1', flexShrink: 0, transition: 'all 0.15s' }} />
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* STEP 7 — Description IA */}
            {step === 7 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.02em', margin: 0 }}>Décrivez votre projet</h2>
                  <span style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white', padding: '0.25rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                    <Sparkles size={11} /> IA
                  </span>
                </div>
                <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Plus votre description est détaillée, plus l'estimation sera précise et fiable. Décrivez les travaux, les matériaux souhaités, les contraintes spécifiques.</p>
                <textarea
                  className="input-tech"
                  rows={7}
                  placeholder="Exemple : Rénovation complète d'une salle de bain de 6m² au 3ème étage sans ascenseur à Paris, dépose de l'existant, pose de carrelage au sol et murs, remplacement douche par baignoire, mise aux normes électriques..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6', marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: form.description.length < 20 ? '#DC2626' : '#10B981', fontWeight: 600 }}>
                    {form.description.length} caractères {form.description.length < 20 ? '(minimum 20)' : '✓'}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Exemples de description :</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {EXEMPLES_DESCRIPTION.map((ex, i) => (
                      <button key={i} onClick={() => setForm(f => ({ ...f, description: ex }))} style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px dashed #CBD5E1', background: '#F8FAFC', fontSize: '0.8rem', color: '#475569', cursor: 'pointer', lineHeight: '1.5', transition: 'all 0.2s' }}>
                        <span style={{ fontWeight: 700, color: '#F97316' }}>↙ </span>{ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8 — Coordonnées */}
            {step === 8 && (
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Dernière étape !</h2>
                <p style={{ color: '#64748B', marginBottom: '2rem' }}>Renseignez vos coordonnées pour recevoir l'estimation complète.</p>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Votre prénom (optionnel)</label>
                    <input type="text" className="input-tech" placeholder="Pierre" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, color: '#0B132B', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Adresse email (optionnel)</label>
                    <input type="email" className="input-tech" placeholder="vous@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div style={{ background: 'rgba(11,19,43,0.04)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Award size={16} style={{ color: '#F97316', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.6' }}>
                    L’estimation est générée par <strong>Google Gemini</strong> en mode expert métreur-vérificateur.
                    {user ? (
                      <> <strong>Abonnement actif détecté — estimation incluse.</strong></>
                    ) : (
                      <> Au dernier étape, vous serez invité à payer <strong>8,99 €</strong> pour générer le rapport expert.
                        <Link href="/login?redirect=/estimateur" style={{ color: '#F97316', fontWeight: 700 }}> Déjà abonné ?</Link>
                      </>
                    )}
                  </p>
                </div>

                {error && (
                  <div style={{ marginTop: '1.25rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <AlertTriangle size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '0.82rem', color: '#B91C1C', lineHeight: '1.5', margin: 0 }}>
                      <strong>Erreur :</strong> {error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
            <button onClick={goPrev} disabled={step === 1} className="btn-secondary" style={{ opacity: step === 1 ? 0.4 : 1 }}>
              <ArrowLeft size={16} /> Retour
            </button>
            <button onClick={goNext} disabled={!canNext()} className="btn-primary" style={{ opacity: canNext() ? 1 : 0.5 }}>
              {step === STEPS.length ? (
                <><Sparkles size={16} /> Générer l'estimation IA</>
              ) : (
                <>Continuer <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </section>
      <Footer />
      {showPaywall && <PaywallModal />}
    </main>
  )
}
