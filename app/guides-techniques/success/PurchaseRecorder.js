'use client'
import { useEffect } from 'react'

export default function PurchaseRecorder({ purchaseData }) {
  useEffect(() => {
    if (!purchaseData) return

    fetch('/api/record-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseData),
    }).catch(err => console.error('Erreur enregistrement achat:', err))
  }, [purchaseData])

  return null // Composant invisible
}
