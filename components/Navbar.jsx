'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Calculator, BookOpen, HardHat, Play, Shield } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Estimateur', href: '/estimateur', Icon: Calculator },
    { label: 'Guides techniques', href: '/guides-techniques', Icon: BookOpen },
    { label: 'Tutoriels Vidéo', href: '/guides-techniques?cat=videos', Icon: Play, highlight: true, iconProps: { fill: 'currentColor' } },
    { label: 'Espace client', href: '/compte', Icon: Shield },
  ]

  return (
    <>
      <header style={{
        position: 'fixed',
        top: '0.75rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: scrolled ? '94%' : '97%',
        maxWidth: '1100px',
        transition: 'all 0.3s ease',
      }}>
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          borderRadius: '1rem',
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(226,232,240,0.8)',
          boxShadow: scrolled ? '0 4px 30px rgba(11,19,43,0.10)' : '0 2px 16px rgba(11,19,43,0.06)',
          transition: 'all 0.3s ease',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Image
              src="/logo.png"
              alt="EstimerChantier — Calculateur & Estimation BTP"
              width={140}
              height={52}
              style={{ objectFit: 'contain', height: '42px', width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop links — masqués sur mobile */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '0.625rem',
                  fontSize: '0.875rem', fontWeight: 600,
                  color: link.highlight ? 'white' : '#475569',
                  textDecoration: 'none',
                  background: link.highlight ? '#f498b7' : '#F1F5F9',
                  border: 'none',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = link.highlight ? '#e88aad' : '#E2E8F0'
                  e.currentTarget.style.color = link.highlight ? 'white' : '#0B132B'
                  e.currentTarget.style.boxShadow = link.highlight ? '0 4px 12px rgba(244, 152, 183, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = link.highlight ? '#f498b7' : '#F1F5F9'
                  e.currentTarget.style.color = link.highlight ? 'white' : '#475569'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <link.Icon size={15} {...(link.iconProps || {})} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: CTA desktop + burger mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* CTA desktop uniquement */}
            <Link href="/estimateur" className="btn-primary desktop-cta"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <Calculator size={14} />
              Estimer mon chantier
            </Link>

            {/* Burger mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-burger"
              style={{
                display: 'none',
                alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px',
                border: '1.5px solid #E2E8F0', borderRadius: '0.625rem',
                background: 'white', cursor: 'pointer', color: '#0B132B',
                flexShrink: 0,
              }}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div style={{
            marginTop: '0.5rem',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(226,232,240,0.8)',
            borderRadius: '1rem',
            padding: '0.75rem',
            boxShadow: '0 8px 30px rgba(11,19,43,0.12)',
            animation: 'fadeIn 0.2s ease-out',
          }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.625rem',
                  fontSize: '0.95rem', fontWeight: 600,
                  color: '#0B132B', textDecoration: 'none',
                  marginBottom: '0.25rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: link.highlight ? '#f498b7' : '#F97316' }}><link.Icon size={15} {...(link.iconProps || {})} /></span>
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
              <Link href="/estimateur" className="btn-primary"
                onClick={() => setMobileOpen(false)}
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                <Calculator size={16} />
                Estimer mon chantier gratuitement
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer sous la navbar fixe */}
      <div style={{ height: '5rem' }} />

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-cta { display: none !important; }
          .mobile-burger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-burger { display: none !important; }
          .desktop-nav { display: flex !important; }
          .desktop-cta { display: inline-flex !important; }
        }
      `}</style>
    </>
  )
}
