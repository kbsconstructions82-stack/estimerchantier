'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Calculator, BookOpen, HardHat, Phone, Mail, MapPin, ArrowRight, Shield, Award, FileCheck } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ background: '#0B132B', color: 'white', paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="container">
        {/* Main grid */}
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
              <Image
                src="/logo.png"
                alt="EstimerChantier"
                width={180}
                height={68}
                style={{ objectFit: 'contain', height: '56px', width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              Bureau d'études digital BTP. Estimations conformes aux normes DTU & Eurocodes. 
              Guides techniques professionnels pour autoconstructeurs.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {['DTU', 'PLU', 'RT2020'].map(badge => (
                <span key={badge} style={{
                  padding: '0.25rem 0.625rem',
                  background: 'rgba(249,115,22,0.15)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: '0.375rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#F97316',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'white', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Estimateur de chantier', href: '/estimateur', icon: <Calculator size={14} /> },
                { label: 'Guides techniques BTP', href: '/guides-techniques', icon: <BookOpen size={14} /> },
                { label: 'Métrés pour artisans', href: '/espace-artisans', icon: <HardHat size={14} /> },
                { label: 'Mon espace client', href: '/compte', icon: <Shield size={14} /> },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides populaires */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'white', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Guides populaires
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                'Terrasse bois sur plots',
                'Extension ossature bois',
                'Bardage extérieur',
                'Rénovation toiture',
                'Maçonnerie gros-œuvre',
                'Isolation extérieure ITE',
              ].map(guide => (
                <li key={guide}>
                  <Link href="/guides-techniques" style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F97316'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    <ArrowRight size={12} />
                    {guide}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'white', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { icon: <Mail size={15} />, text: 'contact@estimerchantier.fr' },
                { icon: <Phone size={15} />, text: '+33 1 23 45 67 89' },
                { icon: <MapPin size={15} />, text: 'Paris, Île-de-France' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#94A3B8', fontSize: '0.875rem' }}>
                  <span style={{ color: '#F97316', flexShrink: 0 }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
            <Link href="/estimateur" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.625rem 1.25rem' }}>
              <Calculator size={14} />
              Estimer gratuitement
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ color: '#64748B', fontSize: '0.8rem' }}>
            © {currentYear} EstimerChantier. Tous droits réservés. Conformité DTU & Eurocodes.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Mentions légales', 'CGV', 'Confidentialité', 'Sitemap'].map(link => (
              <Link key={link} href="#" style={{
                color: '#64748B', textDecoration: 'none', fontSize: '0.8rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
