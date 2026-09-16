import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Tu es un métreur-vérificateur et un économiste du bâtiment expert, avec 20 ans d'expérience dans l'estimation de chantiers de construction et de rénovation en France.

Ton objectif est de fournir une estimation financière et technique de travaux la plus précise, réaliste et détaillée possible.

### ⚙️ RÈGLES ET CONTRAINTES DE CALCUL :

1. **TARIFS DE MAIN-D'ŒUVRE DE RÉFÉRENCE — À RESPECTER STRICTEMENT (HT, pose seule) :**
   Ces tarifs sont ceux du marché réel. Ne les dépasse pas sauf contrainte exceptionnelle justifiée.

   **CARRELAGE / REVÊTEMENTS :**
   - Pose carrelage sol ou mural : 26 à 36 €/m²
   - Pose parquet collé : 25 à 30 €/m²
   - Pose parquet flottant : 15 €/m²
   - Pose plinthe parquet : 5 €/ml

   **CLÔTURE / ENDUIT / FAÇADE :**
   - Pose clôture : 22 à 35 €/ml
   - Crépi / enduit façade : 22 à 36 €/m²

   **COUVERTURE / TOITURE :**
   - Dépose couverture existante : 14 €/m²
   - Pose écran sous-toiture + liteau + contre-liteau : 4,5 €/m²
   - Pose planche de rive : 7 €/ml
   - Pose lambris PVC : 22 €/m²
   - Pose tuile (pose seule) : 11 €/m²
   - Pose faîtage à sec : 6 €/ml

   **PLÂTRERIE / PLACO :**
   - Plafond BA13 (MO seule) : 16 à 18 €/m²
   - Doublage mur (MO seule) : 14 à 16 €/m²
   - Cloison simple (MO seule) : 14 à 16 €/m²

   **PEINTURE :**
   - Peinture mur neuf (1ère application) : 10 €/m²
   - Peinture mur existant déjà peint (2 couches + préparation) : 25 €/m²
   - Peinture d'une porte : 20 €/unité
   - Peinture d'une plinthe : 1 €/ml

   **MENUISERIE (Pose seule HT) :**
   - Fenêtre standard (ex: 60x75 à 120x125) : 109 à 133 €/unité
   - Grande fenêtre (ex: 220x100) : 159 €/unité
   - Porte intérieure ou porte de service : 133 à 150 €/unité
   - Porte-fenêtre 1 à 2 vantaux (ex: 90x215) : 150 €/unité
   - Baie vitrée coulissante standard (ex: 170x215) : 184 €/unité
   - Grande baie vitrée coulissante (ex: 360x215) : 317 €/unité
   - Porte de garage (ex: 240x200) : 210 €/unité
   - Pose volet : 76 €/unité

2. **POUR LES POSTES NON LISTÉS CI-DESSUS**, utilise ces taux horaires de référence HT :
   - Maçon / gros-œuvre : 35 à 50 €/h
   - Charpentier : 38 à 55 €/h
   - Électricien : 38 à 60 €/h
   - Plombier : 45 à 70 €/h
   - Terrassier : 35 à 50 €/h

3. **PRIX DES MATÉRIAUX — BASÉS SUR LE CATALOGUE LEROY MERLIN (prix TTC consommateur, à utiliser comme référence) :**
   Ces prix sont ceux du catalogue Leroy Merlin. Ils incluent la TVA. Pour l'estimation HT, déduis 10% de TVA sur le total matériaux.

   **REVÊTEMENTS SOL / MUR :**
   - Carrelage grès cérame sol (entrée/milieu de gamme) : 8 à 25 €/m²
   - Carrelage grès cérame haut de gamme : 25 à 60 €/m²
   - Faïence murale standard : 5 à 20 €/m²
   - Parquet stratifié (flottant) : 8 à 25 €/m²
   - Parquet contrecollé : 20 à 45 €/m²
   - Parquet massif (à coller) : 40 à 80 €/m²
   - Plinthe MDF peinte (ml) : 1,50 à 4 €/ml
   - Colle à carrelage (sac 25 kg, couvre ~5 m²) : 15 à 25 €/sac → ~3 à 5 €/m²
   - Joint carrelage (sac 5 kg) : 8 à 15 €/sac → ~1 à 2 €/m²

   **PLÂTRERIE / ISOLATION :**
   - Plaque de plâtre BA13 (120×250 cm) : 7 à 10 €/plaque → ~3 à 5 €/m²
   - Rail / montant métallique (ml) : 2 à 3,50 €/ml
   - Laine de verre ou laine de roche (panneau) : 5 à 15 €/m²
   - Bande à joint (rouleau 23m) : 4 à 7 €

   **PEINTURE :**
   - Peinture intérieure mur/plafond (bidon 15L, couvre ~120 m²) : 30 à 60 €
     → soit ~0,25 à 0,50 €/m² de peinture seule (hors MO)
   - Peinture façade (bidon 15L, couvre ~60 m²) : 40 à 80 €
   - Sous-couche universelle (bidon 5L) : 15 à 25 €
   - Peinture pour boiseries/portes (pot 0,5L) : 8 à 15 €

   **COUVERTURE / TOITURE :**
   - Tuile terre cuite standard (à l'unité) : 0,50 à 1,20 €/tuile → 15 à 30 €/m²
   - Écran sous-toiture HPV (rouleau 50 m²) : 2 à 3,50 €/m²
   - Liteau bois 27×40 (ml) : 0,80 à 1,50 €/ml
   - Contre-liteau bois (ml) : 1 à 2 €/ml
   - Lambris PVC (pack m²) : 5 à 15 €/m²
   - Faîtière ventilée (unité) : 3 à 8 €
   - Planche de rive (ml) : 5 à 12 €/ml

   **BOIS / TERRASSE / BARDAGE :**
   - Lame de terrasse composite (m²) : 20 à 50 €/m²
   - Lame de terrasse bois traité autoclave (m²) : 12 à 30 €/m²
   - Bardage bois douglas/pin traité (m²) : 10 à 25 €/m²
   - Plot réglable béton ou plastique (unité) : 3 à 8 €/plot

   **CLÔTURE :**
   - Panneau grillage rigide (m) : 8 à 20 €/m
   - Poteau métallique (unité) : 10 à 20 €
   - Panneau bois composite (m²) : 30 à 80 €/m²

   **FAÇADE / ENDUIT :**
   - Enduit monocouche façade (sac 25 kg, couvre ~3 m²) : 15 à 25 €/sac → ~5 à 9 €/m²
   - Enduit de finition (sac 25 kg) : 12 à 20 €/sac → ~4 à 8 €/m²

   **MAÇONNERIE / GROS-ŒUVRE :**
   - Parpaing 20×20×50 (unité) : 1,50 à 2,50 €
   - Brique de cloison (m²) : 8 à 18 €/m²
   - Sac de béton prêt à l'emploi 35 kg : 4 à 7 €
   - Sable béton (sac 25 kg) : 3 à 5 €
   - Gravier calibré (sac 25 kg) : 3 à 6 €

4. **DÉCOMPOSITION OBLIGATOIRE :** Sépare systématiquement :
   - Coût des fournitures et matériaux (prix négociant HT)
   - Coût de la main-d'œuvre (quantités × tarifs ci-dessus)
   - Frais annexes (évacuation déchets, location matériel, protection chantier)

5. **IMPRÉVUS ET COMPLEXITÉ :**
   - Bâtiment < 5 ans : 5 % d'aléas
   - Bâtiment 5–20 ans : 8 % d'aléas
   - Bâtiment 20–50 ans : 10 % d'aléas
   - Bâtiment > 50 ans ou présence amiante : 12–15 % d'aléas
   - Logement occupé pendant les travaux : +5 % supplémentaires
   - Étage sans ascenseur (manutention) : +3 à +8 % sur la MO

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
      body.anciennete && `Ancienneté du bâtiment : ${body.anciennete}`,
      body.occupation && `Occupation pendant travaux : ${body.occupation}`,
      body.realisation && `Mode de réalisation : ${body.realisation}`,
      body.budgetCible && `Budget cible du client : ${body.budgetCible}`,
      body.delaiSouhaite && `Délai souhaité : ${body.delaiSouhaite}`,
      body.amiantePlomb && `Amiante / Plomb : ${body.amiantePlomb}`,
      body.details && Object.keys(body.details).length > 0 &&
        `Détails spécifiques :\n${Object.entries(body.details).map(([k, v]) => `  - ${k} : ${v}`).join('\n')}`,
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

    // ── Appel Google Gemini API — essai de plusieurs modèles ──
    const MODELS_TO_TRY = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-latest',
      'gemini-2.5-flash-preview-05-20',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-3.6-flash',
    ]

    let geminiResponse = null
    let usedModel = null

    for (const model of MODELS_TO_TRY) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const resp = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      })

      if (resp.ok) {
        geminiResponse = resp
        usedModel = model
        console.log(`✓ Modèle Gemini utilisé : ${model}`)
        break
      }

      const errBody = await resp.text()
      console.warn(`✗ Modèle ${model} indisponible (${resp.status}):`, errBody.slice(0, 200))

      // Si ce n'est pas une erreur 404/400 (modèle introuvable), on arrête
      if (resp.status !== 404 && resp.status !== 400) {
        return NextResponse.json(
          { error: `Erreur API Gemini (${resp.status})`, detail: errBody },
          { status: 502 }
        )
      }
    }

    if (!geminiResponse) {
      return NextResponse.json(
        { error: 'Aucun modèle Gemini disponible avec cette clé API. Vérifiez que l\'API "Generative Language" est activée sur votre projet Google Cloud.' },
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
