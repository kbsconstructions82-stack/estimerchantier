'use client'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  BookOpen, Download, Play, Search, Filter, ArrowRight,
  FileText, Zap, Shield, Users, ChevronRight, ExternalLink,
  Layers, Home, Thermometer, Wind, Bolt, Flame, Grid,
} from 'lucide-react'
import { CATEGORIES, RESOURCES, TOTAL_DOCS, TOTAL_VIDEOS, getCountByCategory } from '@/lib/resources'

/* ─── Icônes de catégorie mappées à Lucide ─────────────────────────────── */
const CAT_ICON_MAP = {
  'toutes':               <Layers size={15} />,
  'charpente-couverture': <Home size={15} />,
  'facade':               <Grid size={15} />,
  'amenagement-exterieur':<Zap size={15} />,
  'chauffage':            <Flame size={15} />,
  'cloisons-menuiseries': <Shield size={15} />,
  'divers':               <BookOpen size={15} />,
  'electricite':          <Bolt size={15} />,
  'fondations':           <Layers size={15} />,
  'revetements-interieurs':<Grid size={15} />,
  'structure-gros-oeuvre':<Shield size={15} />,
  'ventilation':          <Wind size={15} />,
  'videos':               <Play size={15} />,
}

/* ─── Badge type de document ────────────────────────────────────────────── */
function TypeBadge({ type }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.55rem',
      borderRadius: '9999px',
      background: type.color + '18',
      color: type.color,
      border: `1px solid ${type.color}30`,
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.02em',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {type.label}
    </span>
  )
}

/* ─── Carte PDF ─────────────────────────────────────────────────────────── */
function DocCard({ resource }) {
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const catObj = CATEGORIES.find(c => c.slug === resource.category)

  const handleBuy = async () => {
    try {
      setLoading(true)
      const { auth } = await import('@/lib/firebase')
      const userId = auth.currentUser?.uid

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: resource.id, userId })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Erreur lors de la création de la session de paiement.")
      }
    } catch (err) {
      console.error(err)
      alert(err.message || "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.2s ease-out',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Bande colorée en haut */}
      <div style={{
        height: '4px',
        background: `linear-gradient(90deg, ${catObj?.color || '#F97316'}, ${catObj?.color || '#F97316'}80)`,
        borderRadius: '1rem 1rem 0 0',
        flexShrink: 0,
      }} />

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
        {/* Header : type + source */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <TypeBadge type={resource.type} />
          <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {resource.source}
          </span>
        </div>

        {/* Titre */}
        <h3 style={{
          fontWeight: 700, fontSize: '0.9rem', color: '#0B132B',
          lineHeight: '1.45', flex: 1,
        }}>
          {resource.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '0.78rem', color: '#64748B', lineHeight: '1.6',
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {resource.desc}
        </p>

        {/* Footer : icône PDF + bouton */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: '0.75rem',
          borderTop: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0B132B' }}>
              {resource.price ? `${resource.price.toFixed(2)} €` : 'Gratuit'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FileText size={11} style={{ color: '#94A3B8' }} />
                <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>{resource.pages ? `${resource.pages} p.` : 'PDF'}</span>
              </div>
              {resource.downloads && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Download size={11} style={{ color: '#94A3B8' }} />
                  <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 500 }}>{resource.downloads}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleBuy}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.45rem 1rem',
              borderRadius: '0.5rem',
              background: hovered
                ? `linear-gradient(135deg, ${catObj?.color || '#F97316'}, ${catObj?.color || '#F97316'}cc)`
                : '#F1F5F9',
              color: hovered ? 'white' : '#475569',
              fontSize: '0.78rem', fontWeight: 600,
              border: 'none', cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Download size={13} />
            {loading ? 'Redirection...' : 'Acheter'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Carte Vidéo ───────────────────────────────────────────────────────── */
function VideoCard({ resource }) {
  const [hovered, setHovered] = useState(false)
  const thumb = `https://img.youtube.com/vi/${resource.ytId}/mqdefault.jpg`

  return (
    <div
      className="card"
      style={{
        overflow: 'hidden', cursor: 'pointer',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s ease-out',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Miniature YouTube */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#0B132B', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt={resource.title}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.4s ease',
            opacity: hovered ? 0.85 : 0.75,
          }}
        />
        {/* Overlay play */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(to top, rgba(11,19,43,0.7) 0%, transparent 50%)',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: hovered ? '#EC4899' : 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: hovered ? '0 8px 32px rgba(236,72,153,0.4)' : '0 4px 16px rgba(0,0,0,0.3)',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}>
            <Play size={20} style={{ color: hovered ? 'white' : '#0B132B', marginLeft: '2px' }} fill={hovered ? 'white' : '#0B132B'} />
          </div>
        </div>
        {/* Partie de la série */}
        <div style={{
          position: 'absolute', top: '0.625rem', right: '0.625rem',
          background: 'rgba(236,72,153,0.9)', backdropFilter: 'blur(8px)',
          color: 'white', padding: '0.2rem 0.55rem',
          borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700,
        }}>
          {resource.part}/3
        </div>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* Série */}
        <span style={{ fontSize: '0.65rem', color: '#EC4899', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {resource.serie}
        </span>
        <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0B132B', lineHeight: '1.4', marginTop: '0.375rem', marginBottom: '0.5rem' }}>
          {resource.title}
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.55' }}>
          {resource.desc}
        </p>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            marginTop: '0.875rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            background: hovered ? '#e88aad' : '#f498b7',
            color: 'white',
            fontSize: '0.78rem', fontWeight: 700,
            textDecoration: 'none', transition: 'all 0.2s ease',
            boxShadow: hovered ? '0 4px 12px rgba(244, 152, 183, 0.4)' : 'none',
          }}
        >
          <Play size={13} fill="currentColor" />
          Regarder sur YouTube
        </a>
      </div>
    </div>
  )
}

/* ─── Page principale ───────────────────────────────────────────────────── */
export default function GuidesPage() {
  const [activeCategory, setActiveCategory] = useState('toutes')
  const [search, setSearch] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const cat = params.get('cat')
      if (cat) {
        setActiveCategory(cat)
      }
    }
  }, [])

  const scroll = useCallback((dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' })
    }
  }, [])

  const filtered = useMemo(() => {
    let list = RESOURCES
    if (activeCategory !== 'toutes') {
      list = list.filter(r => r.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.type.label.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, search])

  const pdfs = filtered.filter(r => r.category !== 'videos')
  const videos = filtered.filter(r => r.category === 'videos')
  const showingVideos = activeCategory === 'videos' || activeCategory === 'toutes'
  const showingDocs = activeCategory !== 'videos'

  return (
    <main>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #0B132B 0%, #1a2744 55%, #0f1f3d 100%)',
        padding: '4.5rem 0 5.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid SVG */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.4,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='white' fill-opacity='0.04'/%3E%3C/svg%3E")`,
        }} />
        {/* Glow orange */}
        <div style={{
          position: 'absolute', top: '-80px', right: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Glow bleu */}
        <div style={{
          position: 'absolute', bottom: '-60px', left: '5%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <span className="badge" style={{ background: 'rgba(249,115,22,0.18)', color: '#FB923C', border: '1px solid rgba(249,115,22,0.3)', marginBottom: '1.5rem', display: 'inline-flex' }}>
            <BookOpen size={13} />
            Bibliothèque Technique BTP — Ressources Gratuites
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '1.125rem', lineHeight: '1.15' }}>
            Guides, Fiches & Tutoriels<br />
            <span style={{ color: '#F97316' }}>pour vos chantiers</span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto 2.25rem', lineHeight: '1.75' }}>
            {TOTAL_DOCS} documents techniques classifiés (AQC, PACTE, ADEME, CSTB) + {TOTAL_VIDEOS} tutoriels vidéo REX BP. Téléchargement gratuit et immédiat.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              { icon: <FileText size={16} />, value: `${TOTAL_DOCS}+`, label: 'Documents PDF', color: '#F97316' },
              { icon: <Play size={16} />,     value: `${TOTAL_VIDEOS}`,   label: 'Vidéos REX BP',  color: '#EC4899' },
              { icon: <Layers size={16} />,   value: '11',                label: 'Catégories',     color: '#10B981' },
              { icon: <Users size={16} />,    value: '100%',              label: 'Gratuit',         color: '#3B82F6' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: s.color }}>
                  {s.icon}
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '1.5rem', color: 'white' }}>
                    {s.value}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Barre de recherche */}
          <div style={{
            maxWidth: '540px', margin: '0 auto',
            position: 'relative',
          }}>
            <Search size={17} style={{
              position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)',
              color: '#64748B', pointerEvents: 'none',
            }} />
            <input
              id="search-resources"
              type="text"
              placeholder="Rechercher un guide, une fiche, un sujet…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem 0.875rem 2.75rem',
                borderRadius: '0.875rem',
                border: '1.5px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(249,115,22,0.6)'; e.target.style.background = 'rgba(255,255,255,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
                  fontSize: '1.1rem', lineHeight: 1,
                }}
              >×</button>
            )}
          </div>
        </div>
      </section>

      {/* ── Filtres catégories ─────────────────────────────────────────────── */}
      <section style={{
        background: 'white', borderBottom: '1px solid #E2E8F0',
        position: 'sticky', top: '72px', zIndex: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0' }}>

            {/* Flèche gauche */}
            <button
              onClick={() => scroll(-1)}
              aria-label="Catégories précédentes"
              style={{
                flexShrink: 0, width: '34px', height: '34px',
                borderRadius: '50%',
                border: '1.5px solid #E2E8F0',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#475569',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                transition: 'all 0.15s ease',
                fontSize: '1rem', fontWeight: 700, lineHeight: 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
            >
              &#8249;
            </button>

            {/* Scroll container */}
            <div
              ref={scrollRef}
              style={{
                display: 'flex', gap: '0.4rem',
                overflowX: 'auto', flex: 1,
                scrollbarWidth: 'none', msOverflowStyle: 'none',
                alignItems: 'center',
              }}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              {CATEGORIES.map(cat => {
                const count = cat.slug === 'toutes'
                  ? RESOURCES.length
                  : getCountByCategory(cat.slug)
                const isActive = activeCategory === cat.slug
                return (
                  <button
                    key={cat.slug}
                    id={`filter-${cat.slug}`}
                    onClick={() => setActiveCategory(cat.slug)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '9999px',
                      border: isActive ? `1.5px solid ${cat.color}` : '1.5px solid #E2E8F0',
                      background: isActive ? `${cat.color}14` : 'white',
                      color: isActive ? cat.color : '#64748B',
                      fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.18s ease',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    {CAT_ICON_MAP[cat.slug]}
                    {cat.label}
                    <span style={{
                      background: isActive ? cat.color : '#E2E8F0',
                      color: isActive ? 'white' : '#94A3B8',
                      borderRadius: '9999px', padding: '0.05rem 0.4rem',
                      fontSize: '0.63rem', fontWeight: 700, minWidth: '18px', textAlign: 'center',
                      transition: 'all 0.18s ease',
                    }}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Flèche droite */}
            <button
              onClick={() => scroll(1)}
              aria-label="Catégories suivantes"
              style={{
                flexShrink: 0, width: '34px', height: '34px',
                borderRadius: '50%',
                border: '1.5px solid #E2E8F0',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#475569',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                transition: 'all 0.15s ease',
                fontSize: '1rem', fontWeight: 700, lineHeight: 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.color = '#F97316' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
            >
              &#8250;
            </button>

          </div>
        </div>
      </section>

      {/* ── Résultat de recherche ──────────────────────────────────────────── */}
      {search && (
        <div style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA', padding: '0.75rem 0' }}>
          <div className="container">
            <span style={{ fontSize: '0.85rem', color: '#C2410C', fontWeight: 500 }}>
              🔍 {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour « {search} »
              <button
                onClick={() => setSearch('')}
                style={{ marginLeft: '0.75rem', color: '#F97316', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Effacer
              </button>
            </span>
          </div>
        </div>
      )}

      {/* ── Section Documents PDF ──────────────────────────────────────────── */}
      {showingDocs && (
        <section className="section">
          <div className="container">
            {/* Titre de section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(249,115,22,0.2)',
              }}>
                <FileText size={18} style={{ color: '#F97316' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.02em' }}>
                  Documents techniques
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.1rem' }}>
                  {pdfs.length} document{pdfs.length > 1 ? 's' : ''} · PDF téléchargeables gratuitement
                </p>
              </div>
            </div>

            {pdfs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94A3B8' }}>
                <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>Aucun document trouvé pour cette recherche.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '1.25rem',
              }}>
                {pdfs.map(resource => (
                  <DocCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Séparateur si les deux sections sont visibles ─────────────────── */}
      {showingDocs && showingVideos && videos.length > 0 && (
        <div style={{ background: '#F8FAFC', padding: '0.25rem 0' }}>
          <div className="container">
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #E2E8F0, transparent)' }} />
          </div>
        </div>
      )}

      {/* ── Section Vidéos REX BP ──────────────────────────────────────────── */}
      {showingVideos && videos.length > 0 && (
        <section className="section" style={{ background: showingDocs ? '#F8FAFC' : 'white' }}>
          <div className="container">
            {/* Titre de section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(236,72,153,0.2)',
                }}>
                  <Play size={18} style={{ color: '#EC4899' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.02em' }}>
                    Tutoriels vidéo REX BP
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.1rem' }}>
                    {videos.length} vidéo{videos.length > 1 ? 's' : ''} · Retours d&apos;expérience AQC
                  </p>
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                background: 'rgba(236,72,153,0.08)',
                color: '#EC4899',
                border: '1px solid rgba(236,72,153,0.2)',
                fontSize: '0.75rem', fontWeight: 600,
              }}>
                <Shield size={12} />
                Source officielle AQC
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}>
              {videos.map(resource => (
                <VideoCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Aucun résultat global ──────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <section className="section">
          <div className="container" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0B132B', marginBottom: '0.5rem' }}>
              Aucun résultat
            </h3>
            <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
              Essayez un autre terme ou sélectionnez une autre catégorie.
            </p>
            <button
              className="btn-primary"
              onClick={() => { setSearch(''); setActiveCategory('toutes') }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        </section>
      )}

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0B132B 0%, #1E293B 100%)',
        padding: '4rem 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='white' fill-opacity='0.03'/%3E%3C/svg%3E")`,
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 800, color: 'white', marginBottom: '0.625rem', letterSpacing: '-0.02em' }}>
                Besoin d&apos;un métré ou d&apos;un devis précis ?
              </h3>
              <p style={{ color: '#94A3B8', maxWidth: '480px', lineHeight: '1.65', fontSize: '0.95rem' }}>
                Notre équipe d&apos;ingénieurs réalise des métrés professionnels et des devis détaillés pour votre chantier en moins de 48h.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/estimateur" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                <Zap size={16} />
                Estimer mon chantier
              </Link>
              <Link href="/espace-artisans" className="btn-secondary" style={{ whiteSpace: 'nowrap', color: 'white', borderColor: 'rgba(255,255,255,0.25)' }}>
                <ChevronRight size={16} />
                Espace artisans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
