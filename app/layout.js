import './globals.css'

export const metadata = {
  title: 'EstimerChantier — Estimez votre chantier en 2 minutes | Guides BTP & Métrés pros',
  description: 'Calculez gratuitement le budget de votre chantier (terrasse, extension, bardage, toiture). Guides techniques PDF pour autoconstructeurs. Service métrés & devis sous 48h pour artisans.',
  keywords: 'estimer chantier, calcul devis travaux, prix pose bardage, estimation extension bois, permis de construire, guides techniques BTP',
  authors: [{ name: 'EstimerChantier' }],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'EstimerChantier — L\'ingénierie de chantier simplifiée',
    description: 'Estimez votre budget travaux en 2 minutes. Guides techniques d\'autoconstruction. Métrés pros sous 48h.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'EstimerChantier',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EstimerChantier — Estimez votre chantier',
    description: 'Calculez votre budget travaux gratuitement en 2 minutes.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "EstimerChantier",
            "url": "https://estimerchantier.fr",
            "description": "Plateforme d'estimation budgétaire et de guides techniques pour le BTP",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://estimerchantier.fr/estimateur?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }} />
      </head>
      <body className="bg-grid">
        {children}
      </body>
    </html>
  )
}
