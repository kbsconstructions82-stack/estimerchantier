import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Tu es un métreur-vérificateur et un économiste du bâtiment expert, avec 20 ans d'expérience dans l'estimation de chantiers de construction et de rénovation.

Ton objectif est de fournir une estimation financière et technique de travaux la plus précise, réaliste et détaillée possible, afin d'offrir au client une vision extrêmement proche du coût final.

### ⚙️ RÈGLES ET CONTRAINTES DE CALCUL :
1. **PRIX DU MARCHÉ ACTUEL :** Base tes calculs sur les tarifs réels du secteur du bâtiment français actuel (matériaux, taux horaires moyens de main-d'œuvre selon le corps d'état).
2. **DÉCOMPOSITION OBLIGATOIRE :** Ne donne jamais un prix global brut sans justification. Sépare systématiquement :
   - Coût des fournitures et matériaux
   - Coût de la main-d'œuvre (nombre d'heures ou jours x taux horaire)
   - Frais annexes (évacuation des déchets, location de matériel, protection de chantier)
3. **IMPRÉVUS ET COMPLEXITÉ :** 
   - Ajoute une marge pour imprévus/aléas de chantier (entre 5 % et 15 % selon l'ancienneté du bâtiment et la complexité).
   - Prends en compte les contraintes logistiques (accès au chantier, étage, stationnement).

### 📊 FORMAT DE RÉPONSE REQUIS (JSON strict) :
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après. Structure exacte :

{
  "synthese": {
    "resume": "string — résumé succinct des travaux pris en compte",
    "hypotheses": ["string", "string"],
    "contraintes": ["string", "string"]
  },
  "postes": [
    {
      "phase": "string — nom de la phase/poste",
      "description": "string — description détaillée des prestations",
      "quantite": "string — ex: 6 m² ou 1 forfait ou 8h",
      "coutMateriaux": number,
      "coutMainOeuvre": number,
      "totalHT": number
    }
  ],
  "fraisAnnexes": [
    {
      "poste": "string",
      "montantHT": number,
      "detail": "string"
    }
  ],
  "recapitulatif": {
    "sousTotalHT": number,
    "margeImprenus": {
      "pourcentage": number,
      "montantHT": number,
      "justification": "string"
    },
    "tva": {
      "taux": number,
      "montant": number,
      "justification": "string"
    },
    "totalTTCBas": number,
    "totalTTCHaut": number
  },
  "recommandations": [
    {
      "titre": "string",
      "detail": "string"
    }
  ],
  "delaiEstime": "string — ex: 5 à 7 jours ouvrés",
  "questionsComplementaires": ["string", "string"]
}`

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      description,
      type,
      surface,
      finition,
      postal,
      ville,
      etat,
      etage,
      ascenseur,
      accesContrainte,
    } = body

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description du projet trop courte (minimum 10 caractères).' },
        { status: 400 }
      )
    }

    // ── Construire le prompt utilisateur ──
    const contexteSupp = [
      type && `Type de travaux : ${type}`,
      surface && `Surface : ${surface} m²`,
      finition && `Niveau de finition : ${finition}`,
      (postal || ville) && `Localisation : ${[postal, ville].filter(Boolean).join(' — ')}`,
      etat && `État initial : ${etat}`,
      etage != null && etage !== '' && `Étage : ${etage}`,
      ascenseur != null && `Ascenseur disponible : ${ascenseur ? 'oui' : 'non'}`,
      accesContrainte && `Contraintes d'accès : ${accesContrainte}`,
    ]
      .filter(Boolean)
      .join('\n')

    const userPrompt = `### 📥 DESCRIPTION DU PROJET :
${description.trim()}

${contexteSupp ? `### 📋 INFORMATIONS COMPLÉMENTAIRES :\n${contexteSupp}` : ''}

Génère maintenant l'estimation complète selon la structure JSON requise.`

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      // ── Mode démo sans clé API ──
      return NextResponse.json(generateDemoEstimation(body), { status: 200 })
    }

    // ── Appel Google Gemini API ──
    const model = 'gemini-2.0-flash'
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text()
      console.error('Erreur Gemini API:', errText)
      return NextResponse.json(
        { error: `Erreur API Gemini (${geminiResponse.status})`, detail: errText },
        { status: 502 }
      )
    }

    const geminiData = await geminiResponse.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      return NextResponse.json(
        { error: 'Réponse vide de Gemini.' },
        { status: 502 }
      )
    }

    // Nettoyer et parser le JSON
    let parsed
    try {
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      console.error('Échec du parsing JSON Gemini:', rawText)
      return NextResponse.json(
        { error: 'La réponse de Gemini n\'est pas un JSON valide.', raw: rawText },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed, { status: 200 })
  } catch (error) {
    console.error('Erreur API estimate:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// ── Estimation de démonstration (sans clé API) ──
function generateDemoEstimation(form) {
  const surface = Number(form.surface) || 25
  const coeffFinition = { eco: 0.75, standard: 1, prestige: 1.5 }[form.finition] || 1
  const baseMatm2 = 150
  const baseMOm2 = 200

  const depose = { phase: 'Dépose et préparation', description: 'Dépose du revêtement existant, évacuation et nettoyage de la zone', quantite: `${surface} m²`, coutMateriaux: 0, coutMainOeuvre: Math.round(20 * surface * coeffFinition), totalHT: Math.round(20 * surface * coeffFinition) }
  const materiauxP = { phase: 'Fourniture des matériaux', description: 'Carrelage, joints, colle, accessoires de pose', quantite: `${surface} m²`, coutMateriaux: Math.round(baseMatm2 * surface * coeffFinition), coutMainOeuvre: 0, totalHT: Math.round(baseMatm2 * surface * coeffFinition) }
  const pose = { phase: 'Pose et finitions', description: 'Pose du carrelage sol et murs, réalisation des joints, finitions d\'angle', quantite: `${surface} m²`, coutMateriaux: Math.round(15 * surface * coeffFinition), coutMainOeuvre: Math.round(baseMOm2 * surface * coeffFinition), totalHT: Math.round((baseMOm2 + 15) * surface * coeffFinition) }

  const postes = [depose, materiauxP, pose]
  const sousTotalPostes = postes.reduce((s, p) => s + p.totalHT, 0)
  const fraisEvac = Math.round(120 + surface * 3)
  const fraisProtec = Math.round(80)
  const fraisAnnexes = [
    { poste: 'Évacuation des déchets', montantHT: fraisEvac, detail: 'Location benne ou forfait évacuation gravats' },
    { poste: 'Protection des surfaces', montantHT: fraisProtec, detail: 'Protection sol couloir, bâche, scotch de peintre' },
  ]
  const totalFraisAnnexes = fraisAnnexes.reduce((s, f) => s + f.montantHT, 0)
  const sousTotalHT = sousTotalPostes + totalFraisAnnexes
  const margePct = form.etat === 'demolition' ? 15 : 10
  const margeHT = Math.round(sousTotalHT * margePct / 100)
  const tvaTaux = 10
  const baseTVA = sousTotalHT + margeHT
  const tva = Math.round(baseTVA * tvaTaux / 100)
  const totalBas = Math.round(baseTVA * 0.9 + tva * 0.9)
  const totalHaut = Math.round(baseTVA * 1.1 + tva * 1.1)

  return {
    _demo: true,
    synthese: {
      resume: `Estimation pour ${form.type || 'travaux'} d'une surface de ${surface} m² avec un niveau de finition ${form.finition || 'standard'}${form.ville ? ` à ${form.ville}` : ''}.`,
      hypotheses: ['Prix basés sur les tarifs marché France 2024-2025', `Niveau de finition : ${form.finition || 'standard'}`, 'Travaux réalisés par un artisan qualifié RGE'],
      contraintes: form.etage ? [`Chantier au ${form.etage}ème étage — supplément manutention`, !form.ascenseur ? 'Sans ascenseur — port manuel à prévoir' : 'Ascenseur disponible'] : ['Accès standard au chantier'],
    },
    postes,
    fraisAnnexes,
    recapitulatif: {
      sousTotalHT,
      margeImprenus: { pourcentage: margePct, montantHT: margeHT, justification: `Marge de ${margePct}% appliquée selon la complexité du chantier et l'état initial.` },
      tva: { taux: tvaTaux, montant: tva, justification: 'TVA à taux réduit 10% applicable pour travaux de rénovation sur logement de plus de 2 ans.' },
      totalTTCBas: totalBas,
      totalTTCHaut: totalHaut,
    },
    recommandations: [
      { titre: 'Comparer 3 devis', detail: 'Demandez au minimum 3 devis d\'artisans locaux pour situer les prix et éviter les surprises.' },
      { titre: 'Vérifier la qualification RGE', detail: 'Pour certains travaux d\'isolation ou éco-rénovation, un artisan certifié RGE est requis pour les aides (MaPrimeRénov\').' },
      { titre: 'Anticiper les délais matériaux', detail: 'Commandez les matériaux avec 2 à 3 semaines d\'avance pour éviter les ruptures de stock.' },
      { titre: 'Prévoir un coordinateur de chantier', detail: 'Pour les projets multi-corps d\'état, désignez un interlocuteur unique pour éviter les conflits de planning.' },
    ],
    delaiEstime: `${Math.max(3, Math.round(surface / 8))} à ${Math.max(5, Math.round(surface / 5))} jours ouvrés`,
    questionsComplementaires: [
      'Quel est l\'état actuel du sol et des murs (carrelage existant, plâtre, etc.) ?',
      'Y a-t-il des modifications de plomberie ou d\'électricité prévues ?',
      'Le bâtiment est-il classé ou en zone ABF (Architectes des Bâtiments de France) ?',
    ],
  }
}
