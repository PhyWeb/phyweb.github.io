/* --- data.js --- */

// ==========================================
// 1. ILLUSTRATIONS VECTORIELLES (SVG AUTONOMES)
// ==========================================
const SCENE_SVGS = {
    // --- TENNIS ---
    tennis_air: `<svg viewBox="0 0 320 220">
        <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="100%" stop-color="#f0f9ff"/></linearGradient></defs>
        <rect width="320" height="220" fill="url(#sky)"/>
        <g transform="translate(210, 85) rotate(15)">
            <ellipse cx="0" cy="0" rx="28" ry="38" fill="none" stroke="#334155" stroke-width="5"/>
            <path d="M-20,-25 L20,-25 M-26,-10 L26,-10 M-27,5 L27,5 M-24,20 L24,20 M-12,-35 L-12,35 M0,-38 L0,38 M12,-35 L12,35" stroke="#94a3b8" stroke-width="1.2"/>
            <path d="M-10,36 L0,60 L10,36" fill="none" stroke="#334155" stroke-width="4"/>
            <rect x="-4" y="60" width="8" height="35" fill="#d97706" rx="2"/>
        </g>
        <g transform="translate(95, 70)">
            <circle cx="0" cy="0" r="20" fill="#bef264" stroke="#65a30d" stroke-width="2.5"/>
            <path d="M-14,-14 Q0,0 -14,14 M14,-14 Q0,0 14,14" fill="none" stroke="white" stroke-width="2.5"/>
        </g>
        <text x="160" y="205" text-anchor="middle" fill="#475569" font-size="12" font-weight="bold">Balle en l'air (avant la frappe)</text>
    </svg>`,

    tennis_impact: `<svg viewBox="0 0 320 220">
        <rect width="320" height="220" fill="#1e293b"/>
        <g transform="translate(175, 105)">
            <ellipse cx="0" cy="0" rx="45" ry="62" fill="none" stroke="#d97706" stroke-width="7"/>
            <path d="M-38,-35 L38,-35 M-43,-15 L43,-15 M-45,5 Q-15,5 -15,5 L45,5 M-42,25 L42,25 M-34,45 L34,45" stroke="#cbd5e1" stroke-width="1.5" fill="none"/>
            <path d="M-20,-55 L-20,55 M0,-62 Q12,0 0,62 M20,-55 L20,55" stroke="#cbd5e1" stroke-width="1.5" fill="none"/>
            <rect x="-6" y="62" width="12" height="45" fill="#b45309"/>
        </g>
        <g transform="translate(152, 105)">
            <ellipse cx="0" cy="0" rx="19" ry="23" fill="#bef264" stroke="#65a30d" stroke-width="2.5"/>
            <path d="M-12,-16 Q0,0 -12,16 M10,-16 Q0,0 10,16" fill="none" stroke="white" stroke-width="2.5"/>
        </g>
        <text x="160" y="208" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="bold">Impact : la raquette frappe la balle vers la gauche</text>
    </svg>`,

    tennis_sol: `<svg viewBox="0 0 320 220">
        <rect width="320" height="145" fill="#fef3c7"/>
        <rect y="145" width="320" height="75" fill="#c2410c"/>
        <line x1="0" y1="165" x2="320" y2="152" stroke="white" stroke-width="5" opacity="0.85"/>
        <ellipse cx="160" cy="147" rx="22" ry="6" fill="rgba(0,0,0,0.35)"/>
        <g transform="translate(160, 125)">
            <circle cx="0" cy="0" r="21" fill="#bef264" stroke="#65a30d" stroke-width="2.5"/>
            <path d="M-14,-14 Q0,0 -14,14 M14,-14 Q0,0 14,14" fill="none" stroke="white" stroke-width="2.5"/>
        </g>
        <text x="160" y="205" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Balle immobile posée sur la terre battue</text>
    </svg>`,

    // --- HANDBALL ---
    hand_passe: `<svg viewBox="0 0 320 220">
        <rect width="320" height="220" fill="#eff6ff"/>
        <path d="M40,150 L115,95 L138,80" fill="none" stroke="#fdba74" stroke-width="18" stroke-linecap="round"/>
        <circle cx="142" cy="82" r="12" fill="#fdba74"/>
        <g transform="translate(168, 82)">
            <circle cx="0" cy="0" r="24" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5"/>
            <path d="M-16,-16 L0,-5 L16,-16 M-22,4 L0,-5 L0,23 M22,4 L0,-5" fill="none" stroke="#93c5fd" stroke-width="2"/>
        </g>
        <text x="160" y="205" text-anchor="middle" fill="#1e3a8a" font-size="12" font-weight="bold">Nikola Karabatic pousse le ballon pour faire sa passe</text>
    </svg>`,

    hand_air: `<svg viewBox="0 0 320 220">
        <rect width="320" height="175" fill="#eff6ff"/>
        <rect y="175" width="320" height="45" fill="#fde68a"/>
        <path d="M70,85 L125,85 M60,100 L115,100 M80,115 L125,115" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6,4"/>
        <g transform="translate(175, 95)">
            <circle cx="0" cy="0" r="24" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5"/>
            <path d="M-16,-16 L0,-5 L16,-16 M-22,4 L0,-5 L0,23 M22,4 L0,-5" fill="none" stroke="#93c5fd" stroke-width="2"/>
        </g>
        <text x="160" y="205" text-anchor="middle" fill="#78350f" font-size="12" font-weight="bold">Le ballon vole dans les airs (entre les deux joueurs)</text>
    </svg>`,

    hand_sol: `<svg viewBox="0 0 320 220">
        <rect width="320" height="150" fill="#eff6ff"/>
        <rect y="150" width="320" height="70" fill="#fcd34d"/>
        <line x1="0" y1="150" x2="320" y2="150" stroke="#b45309" stroke-width="3"/>
        <ellipse cx="160" cy="152" rx="24" ry="5" fill="rgba(0,0,0,0.25)"/>
        <g transform="translate(160, 126)">
            <circle cx="0" cy="0" r="24" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5"/>
            <path d="M-16,-16 L0,-5 L16,-16 M-22,4 L0,-5 L0,23 M22,4 L0,-5" fill="none" stroke="#93c5fd" stroke-width="2"/>
        </g>
        <text x="160" y="205" text-anchor="middle" fill="#78350f" font-size="12" font-weight="bold">Le ballon est posé sur le parquet du gymnase</text>
    </svg>`,

    // --- NIVEAU VERT (6 CARTES) ---
    vert_orbite: `<svg viewBox="0 0 320 200">
        <rect width="320" height="200" fill="#0f172a"/>
        <ellipse cx="230" cy="70" rx="180" ry="95" fill="none" stroke="#334155" stroke-dasharray="5,5" stroke-width="2"/>
        <circle cx="245" cy="55" r="42" fill="#f59e0b" stroke="#fde047" stroke-width="4"/>
        <circle cx="85" cy="125" r="18" fill="#2563eb" stroke="#93c5fd" stroke-width="2"/>
        <path d="M78,115 Q88,125 80,135" stroke="#22c55e" stroke-width="5" fill="none"/>
        <text x="85" y="160" text-anchor="middle" fill="#93c5fd" font-size="12" font-weight="bold">Terre</text>
        <text x="245" y="115" text-anchor="middle" fill="#fde047" font-size="12" font-weight="bold">Soleil</text>
    </svg>`,

    vert_plume: `<svg viewBox="0 0 320 200">
        <rect width="320" height="200" fill="#e0f2fe"/>
        <rect x="120" y="35" width="140" height="18" rx="4" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <text x="190" y="48" text-anchor="middle" fill="#dc2626" font-size="12" font-weight="bold">+   +   +   +</text>
        <path d="M90,125 Q115,90 145,82 Q130,110 105,125 Z" fill="white" stroke="#475569" stroke-width="1.5"/>
        <path d="M82,132 L145,82" stroke="#475569" stroke-width="2"/>
        <text x="160" y="182" text-anchor="middle" fill="#1e293b" font-size="12" font-weight="bold">Plume attirée (sans contact) par un bâton électrisé</text>
    </svg>`,

    vert_kite: `<svg viewBox="0 0 320 200">
        <rect width="320" height="145" fill="#bae6fd"/>
        <rect y="145" width="320" height="55" fill="#0284c7"/>
        <path d="M245,25 Q285,40 270,75 Q255,55 245,25 Z" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <line x1="165" y1="88" x2="258" y2="52" stroke="#475569" stroke-width="1.5"/>
        <line x1="158" y1="78" x2="172" y2="98" stroke="#1e293b" stroke-width="4"/>
        <rect x="95" y="138" width="65" height="8" rx="4" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
        <circle cx="132" cy="82" r="9" fill="#334155"/>
        <path d="M132,91 L125,118 L112,138 M125,118 L140,138 M130,98 L164,88" fill="none" stroke="#16a34a" stroke-width="5" stroke-linecap="round"/>
    </svg>`,

    vert_trombone: `<svg viewBox="0 0 320 200">
        <rect width="320" height="200" fill="#f1f5f9"/>
        <line x1="65" y1="20" x2="65" y2="180" stroke="#475569" stroke-width="6"/>
        <rect x="65" y="80" width="35" height="24" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
        <text x="82" y="96" text-anchor="middle" fill="white" font-size="11" font-weight="bold">N</text>
        <rect x="122" y="86" width="36" height="12" rx="6" fill="none" stroke="#64748b" stroke-width="3"/>
        <path d="M155,92 L225,78 L225,106 Z" fill="none" stroke="#ea580c" stroke-width="2.5"/>
        <circle cx="245" cy="92" r="22" fill="#fdba74"/>
        <text x="160" y="182" text-anchor="middle" fill="#334155" font-size="12" font-weight="bold">Trombone attiré à distance par l'aimant, retenu par un élastique</text>
    </svg>`,

    vert_iceberg: `<svg viewBox="0 0 320 200">
        <rect width="320" height="95" fill="#bae6fd"/>
        <rect y="95" width="320" height="105" fill="#0369a1"/>
        <polygon points="110,95 135,45 165,65 185,40 210,95" fill="white" stroke="#cbd5e1" stroke-width="2"/>
        <polygon points="110,95 95,145 145,175 195,160 210,95" fill="#7dd3fc" opacity="0.65"/>
        <line x1="0" y1="95" x2="320" y2="95" stroke="#e0f2fe" stroke-width="2.5"/>
        <text x="160" y="190" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Un iceberg flottant sur l'océan</text>
    </svg>`,

    vert_balancoire: `<svg viewBox="0 0 320 200">
        <rect width="320" height="200" fill="#e0f2fe"/>
        <line x1="125" y1="10" x2="125" y2="135" stroke="#78350f" stroke-width="3"/>
        <line x1="195" y1="10" x2="195" y2="135" stroke="#78350f" stroke-width="3"/>
        <rect x="115" y="135" width="90" height="10" rx="3" fill="#92400e"/>
        <circle cx="160" cy="75" r="14" fill="#334155"/>
        <path d="M160,90 L160,135 M160,105 L125,115 M160,105 L195,115 M150,135 L145,165 M170,135 L175,165" stroke="#1e40af" stroke-width="7" stroke-linecap="round" fill="none"/>
        <text x="160" y="190" text-anchor="middle" fill="#1e293b" font-size="12" font-weight="bold">Jeune homme assis sur une balançoire</text>
    </svg>`,

    // --- 6 SCHÉMAS CLASSIQUES (JAUNE & ORANGE) ---
    schema_1_lampe: `<svg viewBox="0 0 360 260">
        <line x1="110" y1="35" x2="250" y2="35" stroke="#1e293b" stroke-width="3"/>
        <path d="M120,35 L130,20 M145,35 L155,20 M170,35 L180,20 M195,35 L205,20 M220,35 L230,20" stroke="#64748b" stroke-width="2"/>
        <text x="260" y="38" fill="#475569" font-size="13">plafond</text>
        <line x1="180" y1="35" x2="180" y2="115" stroke="#1e293b" stroke-width="2.5"/>
        <text x="192" y="80" fill="#475569" font-size="13">fil</text>
        <path d="M125,155 A55,40 0 0,1 235,155 Z" fill="#fef08a" stroke="#1e293b" stroke-width="2.5"/>
        <text x="248" y="150" fill="#1e293b" font-size="14" font-weight="bold">lampe</text>
        <text x="180" y="235" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : la lampe</text>
    </svg>`,

    schema_2_livre_table: `<svg viewBox="0 0 360 260">
        <rect x="70" y="135" width="220" height="12" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="100" y="147" width="12" height="68" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="248" y="147" width="12" height="68" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
        <text x="300" y="140" fill="#475569" font-size="13">table</text>
        <rect x="130" y="95" width="100" height="40" fill="#94a3b8" stroke="#1e293b" stroke-width="2.5"/>
        <text x="180" y="85" text-anchor="middle" fill="#1e293b" font-size="14" font-weight="bold">livre</text>
        <text x="180" y="240" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : le livre</text>
    </svg>`,

    schema_3_pomme: `<svg viewBox="0 0 360 260">
        <path d="M150,45 L150,70 M180,35 L180,60 M210,45 L210,70" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <path d="M180,95 C155,80 135,105 140,135 C145,165 165,175 180,165 C195,175 215,165 220,135 C225,105 205,80 180,95 Z" fill="#fca5a5" stroke="#1e293b" stroke-width="2.5"/>
        <path d="M180,95 L185,75" stroke="#78350f" stroke-width="3"/>
        <path d="M183,82 Q200,72 205,85 Q192,92 183,82 Z" fill="#86efac" stroke="#1e293b" stroke-width="1.5"/>
        <text x="235" y="125" fill="#1e293b" font-size="13">pomme en</text>
        <text x="235" y="142" fill="#1e293b" font-size="13">chute libre</text>
        <text x="180" y="235" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : la pomme</text>
    </svg>`,

    schema_4_clou: `<svg viewBox="0 0 360 260">
        <line x1="60" y1="45" x2="140" y2="45" stroke="#1e293b" stroke-width="3"/>
        <path d="M70,45 L80,30 M95,45 L105,30 M120,45 L130,30" stroke="#64748b" stroke-width="2"/>
        <line x1="100" y1="45" x2="172" y2="109" stroke="#1e293b" stroke-width="2.5"/>
        <text x="140" y="70" fill="#475569" font-size="13">fil</text>
        <line x1="166" y1="117" x2="178" y2="101" stroke="#1e293b" stroke-width="3.5"/>
        <line x1="172" y1="109" x2="190" y2="123" stroke="#1e293b" stroke-width="3"/>
        <text x="180" y="97" fill="#1e293b" font-size="14" font-weight="bold">clou</text>
        <rect x="225" y="103" width="75" height="24" fill="#fca5a5" stroke="#1e293b" stroke-width="2.5"/>
        <text x="262" y="95" text-anchor="middle" fill="#1e293b" font-size="14" font-weight="bold">aimant</text>
        <text x="180" y="235" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : le clou</text>
    </svg>`,

    schema_5_ressort: `<svg viewBox="0 0 360 260">
        <line x1="130" y1="30" x2="230" y2="30" stroke="#1e293b" stroke-width="3"/>
        <path d="M145,30 L155,15 M175,30 L185,15 M205,30 L215,15" stroke="#64748b" stroke-width="2"/>
        <polyline points="180,30 180,45 165,53 195,65 165,77 195,89 165,101 195,113 180,121 180,135" fill="none" stroke="#1e293b" stroke-width="2.5"/>
        <text x="210" y="87" fill="#475569" font-size="13">ressort</text>
        <circle cx="180" cy="157" r="22" fill="#cbd5e1" stroke="#1e293b" stroke-width="2.5"/>
        <text x="215" y="162" fill="#1e293b" font-size="14" font-weight="bold">solide</text>
        <text x="180" y="235" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : le solide</text>
    </svg>`,

    schema_6_livre_air: `<svg viewBox="0 0 360 260">
        <path d="M135,165 L135,195 M165,175 L165,205 M195,165 L195,195" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <g transform="translate(165, 105) rotate(-35)">
            <rect x="-40" y="-25" width="80" height="50" fill="#cbd5e1" stroke="#1e293b" stroke-width="2.5"/>
            <line x1="-35" y1="-25" x2="-35" y2="25" stroke="#1e293b" stroke-width="2"/>
        </g>
        <text x="235" y="85" fill="#1e293b" font-size="12">livre lancé en l'air</text>
        <text x="235" y="102" fill="#1e293b" font-size="12">par un élève excédé</text>
        <text x="235" y="119" fill="#dc2626" font-size="12" font-weight="bold">(en train de monter)</text>
        <text x="180" y="235" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : le livre</text>
    </svg>`,

    // --- NIVEAU ROUGE (SKIEUR & CERF-VOLANT) ---
    rouge_skieur: `<svg viewBox="0 0 360 230">
        <rect width="360" height="230" fill="#f8fafc"/>
        <line x1="30" y1="205" x2="330" y2="85" stroke="#0f172a" stroke-width="4"/>
        <g transform="translate(175, 145) rotate(-22)">
            <line x1="-45" y1="0" x2="55" y2="0" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>
            <polyline points="-10,0 5,-25 -15,-45 -5,-75" fill="none" stroke="#1e293b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="-5" cy="-92" r="12" fill="#1e293b"/>
            <line x1="-5" y1="-65" x2="25" y2="-55" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>
        </g>
        <line x1="175" y1="112" x2="265" y2="15" stroke="#dc2626" stroke-width="3.5"/>
        <text x="275" y="40" fill="#dc2626" font-size="12" font-weight="bold">Tire-fesse</text>
    </svg>`,

    rouge_cerfvolant: `<svg viewBox="0 0 360 230">
        <rect width="360" height="230" fill="#e0f2fe"/>
        <circle cx="85" cy="155" r="14" fill="#fdba74" stroke="#1e293b" stroke-width="2"/>
        <path d="M85,170 L80,200 L60,220 M80,200 L105,220 M85,180 L120,165" stroke="#be185d" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M120,165 Q180,125 235,65" fill="none" stroke="#1e293b" stroke-width="2"/>
        <g transform="translate(235, 65)">
            <polygon points="0,-35 30,0 0,40 -30,0" fill="#3b82f6" stroke="#1e293b" stroke-width="2"/>
            <polygon points="0,-35 30,0 0,0" fill="#ef4444"/>
            <polygon points="0,40 -30,0 0,0" fill="#ef4444"/>
            <line x1="0" y1="-35" x2="0" y2="40" stroke="#1e293b" stroke-width="1.5"/>
            <line x1="-30" y1="0" x2="30" y2="0" stroke="#1e293b" stroke-width="1.5"/>
            <path d="M0,40 Q25,65 45,50 Q60,35 40,75" fill="none" stroke="#ef4444" stroke-width="3"/>
        </g>
    </svg>`
};

// ==========================================
// 2. DONNÉES PÉDAGOGIQUES UNIFIÉES PAR CEINTURE
// ==========================================

// --- NIVEAU BLEU (6 situations unifiées) ---
const BLEU_DATA = [
    {
        id: "b_1",
        title: "Niveau Bleu (1/6) : Balle de tennis avant la frappe",
        svg: "tennis_air",
        receveur: "la balle",
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Raquette", label: "🎾 La raquette", valid: false, trapMsg: "Observe bien l'image : la balle touche-t-elle déjà le cordage de la raquette ?" },
            { id: "Nadal", label: "🏃 Rafael Nadal", valid: false, trapMsg: "Nadal tient sa raquette, mais il ne touche pas la balle !" },
            { id: "Sol", label: "🟫 Le sol", valid: false, trapMsg: "La balle est en l'air, elle ne touche pas le sol." }
        ]
    },
    {
        id: "b_2",
        title: "Niveau Bleu (2/6) : Balle de tennis au moment de l'impact",
        svg: "tennis_impact",
        receveur: "la balle",
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Raquette", label: "🎾 La raquette", valid: true, type: "contact", prep: "de la raquette" },
            { id: "Sol", label: "🟫 Le sol", valid: false, trapMsg: "La balle est dans le tamis de la raquette, pas sur le sol." }
        ]
    },
    {
        id: "b_3",
        title: "Niveau Bleu (3/6) : Balle de tennis immobile sur le court",
        svg: "tennis_sol",
        receveur: "la balle",
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Sol", label: "🟫 Le sol", valid: true, type: "contact", prep: "du sol" },
            { id: "Raquette", label: "🎾 La raquette", valid: false, trapMsg: "La raquette n'est plus en contact avec la balle." }
        ]
    },
    {
        id: "b_4",
        title: "Niveau Bleu (4/6) : Nikola Karabatic touche le ballon pour faire une passe",
        svg: "hand_passe",
        receveur: "le ballon",
        evalMode: true,
        candidates: [
            { id: "Main", label: "✋ La main (Nikola)", valid: true, type: "contact", prep: "de Nikola" },
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Sol", label: "🟫 Le sol", valid: false, trapMsg: "Le ballon est en hauteur dans la main du joueur, il ne touche pas le sol." }
        ]
    },
    {
        id: "b_5",
        title: "Niveau Bleu (5/6) : Le ballon vole dans les airs pendant la passe",
        svg: "hand_air",
        receveur: "le ballon",
        evalMode: true,
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Main", label: "✋ La main (Nikola)", valid: false, trapMsg: "Piège classique ! Une fois que le ballon a quitté la main, la main n'agit plus sur lui." },
            { id: "Sol", label: "🟫 Le sol", valid: false, trapMsg: "Le ballon est en plein vol." }
        ]
    },
    {
        id: "b_6",
        title: "Niveau Bleu (6/6) : Le ballon de handball est posé au sol",
        svg: "hand_sol",
        receveur: "le ballon",
        evalMode: true,
        paperNotice: "📝 Une fois validé à l'écran, recopie cette situation sur ta fiche papier (Trace écrite Niveau Bleu) !",
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Sol", label: "🟫 Le sol", valid: true, type: "contact", prep: "du sol" },
            { id: "Main", label: "✋ La main (Nikola)", valid: false, trapMsg: "Personne ne touche le ballon ici." }
        ]
    }
];

// --- NIVEAU VERT (6 situations en 2 étapes de 3 cartes) ---
const VERT_DATA = [
    {
        id: "v_1",
        title: "1. La Terre en orbite",
        svg: "vert_orbite",
        receveur: "La Terre",
        options: [
            { id: "Soleil", label: "☀️ Le Soleil", expected: "distance" },
            { id: "Espace", label: "🌌 Le vide spatial", expected: "none" },
            { id: "Atmosphere", label: "☁️ Les nuages", expected: "none" }
        ]
    },
    {
        id: "v_2",
        title: "2. Plume et bâton électrisé",
        svg: "vert_plume",
        receveur: "La plume",
        options: [
            { id: "Baton", label: "⚡ Le bâton électrisé", expected: "distance" },
            { id: "Terre", label: "🌍 La Terre", expected: "distance" },
            { id: "Main", label: "✋ La main (tient le bâton)", expected: "none" }
        ]
    },
    {
        id: "v_3",
        title: "3. Une kitesurfeuse",
        svg: "vert_kite",
        receveur: "La kitesurfeuse",
        options: [
            { id: "Planche", label: "🏄 La planche", expected: "contact" },
            { id: "Manche", label: "🕹️ Le manche de la voile", expected: "contact" },
            { id: "Terre", label: "🌍 La Terre", expected: "distance" },
            { id: "Eau", label: "🌊 L'eau (touche la planche)", expected: "none" }
        ]
    },
    {
        id: "v_4",
        title: "4. Trombone et aimant",
        svg: "vert_trombone",
        receveur: "Le trombone",
        options: [
            { id: "Aimant", label: "🧲 L'aimant", expected: "distance" },
            { id: "Elastique", label: "➰ L'élastique", expected: "contact" },
            { id: "Terre", label: "🌍 La Terre", expected: "distance" },
            { id: "Main", label: "✋ La main (tient l'élastique)", expected: "none" }
        ]
    },
    {
        id: "v_5",
        title: "5. Un iceberg flottant",
        svg: "vert_iceberg",
        receveur: "L'iceberg",
        options: [
            { id: "Eau", label: "🌊 L'eau", expected: "contact" },
            { id: "Terre", label: "🌍 La Terre", expected: "distance" },
            { id: "Nuages", label: "☁️ Les nuages", expected: "none" }
        ]
    },
    {
        id: "v_6",
        title: "6. Sur une balançoire",
        svg: "vert_balancoire",
        receveur: "Le jeune homme",
        options: [
            { id: "Balancoire", label: "🪑 La balançoire", expected: "contact" },
            { id: "Terre", label: "🌍 La Terre", expected: "distance" },
            { id: "Arbre", label: "🌳 La branche d'arbre", expected: "none" }
        ]
    }
];

// --- NIVEAU JAUNE (9 situations unifiées) ---
const JAUNE_DATA = [
    {
        id: "j_1",
        title: "Niveau Jaune (1/9) : Nikola touche le ballon pour faire sa passe",
        svg: "hand_passe",
        systeme: "Ballon",
        pool: ["Main (Nikola)", "Terre", "Sol", "Panneau de but"],
        expected: { "Main (Nikola)": "contact", "Terre": "distance" }
    },
    {
        id: "j_2",
        title: "Niveau Jaune (2/9) : Le ballon est en vol pendant la passe",
        svg: "hand_air",
        systeme: "Ballon",
        pool: ["Terre", "Main (Nikola)", "Sol"],
        expected: { "Terre": "distance" }
    },
    {
        id: "j_3",
        title: "Niveau Jaune (3/9) : Le ballon est posé au sol",
        svg: "hand_sol",
        systeme: "Ballon",
        pool: ["Terre", "Sol", "Main (Nikola)"],
        expected: { "Terre": "distance", "Sol": "contact" }
    },
    {
        id: "j_4",
        title: "Niveau Jaune (4/9) : 1°/ Lampe suspendue au plafond par un fil",
        svg: "schema_1_lampe",
        systeme: "Lampe",
        pool: ["Fil", "Terre", "Plafond", "Interrupteur"],
        expected: { "Fil": "contact", "Terre": "distance" },
        trapHint: "Attention : le plafond touche le fil, mais ne touche pas directement la lampe !"
    },
    {
        id: "j_5",
        title: "Niveau Jaune (5/9) : 2°/ Livre posé sur une table",
        svg: "schema_2_livre_table",
        systeme: "Livre",
        pool: ["Table", "Terre", "Sol"],
        expected: { "Table": "contact", "Terre": "distance" },
        trapHint: "Le sol soutient la table, mais ne touche pas le livre."
    },
    {
        id: "j_6",
        title: "Niveau Jaune (6/9) : 3°/ Pomme qui tombe de l'arbre (chute libre)",
        svg: "schema_3_pomme",
        systeme: "Pomme",
        pool: ["Terre", "Branche de l'arbre", "Herbe"],
        expected: { "Terre": "distance" },
        trapHint: "La pomme s'est déjà détachée de la branche et n'a pas encore touché l'herbe."
    },
    {
        id: "j_7",
        title: "Niveau Jaune (7/9) : 4°/ Clou suspendu à un fil et dévié par un aimant",
        svg: "schema_4_clou",
        systeme: "Clou",
        pool: ["Fil", "Terre", "Aimant", "Plafond"],
        expected: { "Fil": "contact", "Terre": "distance", "Aimant": "distance" },
        paperNotice: "📝 Reproduis aussi ce D.O.I (4°/ Le clou) sur ta fiche papier d'accompagnement !"
    },
    {
        id: "j_8",
        title: "Niveau Jaune (8/9) : 5°/ Solide suspendu à un ressort",
        svg: "schema_5_ressort",
        systeme: "Solide",
        pool: ["Ressort", "Terre", "Plafond"],
        expected: { "Ressort": "contact", "Terre": "distance" }
    },
    {
        id: "j_9",
        title: "Niveau Jaune (9/9) : 6°/ Livre de physique lancé en l'air (en train de monter)",
        svg: "schema_6_livre_air",
        systeme: "Livre",
        pool: ["Terre", "Élève excédé (main)", "Sol"],
        expected: { "Terre": "distance" },
        trapHint: "Piège classique ! Dès que le livre a quitté la main de l'élève, la main n'exerce plus aucune action sur lui."
    }
];

// --- NIVEAU ORANGE (6 situations unifiées) ---
const ORANGE_DATA = [
    {
        id: "o_1",
        title: "Niveau Orange (1/6) : Balle de tennis en l'air",
        subtitle: "Valeur donnée : P = 0,56 N. Complétez les caractéristiques et tracez la force.",
        anchors: [
            { id: "G", label: "Centre de gravité de la balle", x: 180, y: 130 },
            { id: "Haut", label: "Haut de la balle", x: 180, y: 85 },
            { id: "Bas", label: "Bas de la balle", x: 180, y: 175 }
        ],
        modelShape: `<circle cx="180" cy="130" r="45" fill="#bef264" stroke="#65a30d" stroke-width="3"/>
                     <path d="M148,98 Q180,130 148,162 M212,98 Q180,130 212,162" fill="none" stroke="white" stroke-width="4"/>`,
        forces: [
            {
                id: "P",
                svgText: "P",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">P</span> (ou <span class="vec-arrow">F</span><sub>Terre/balle</sub>)</span>`,
                color: "#dc2626",
                givenValue: "0,56 N",
                pointOptions: ["Centre de gravité de la balle", "Point de contact avec la raquette", "Point de contact avec le sol"],
                expectedPoint: "Centre de gravité de la balle",
                expectedDirection: "verticale",
                expectedSens: "vers le bas",
                expectedAnchor: "G",
                expectedAngle: 90
            }
        ]
    },
    {
        id: "o_2",
        title: "Niveau Orange (2/6) : Balle frappée par la raquette",
        subtitle: "Valeurs : P = 0,56 N et F(raquette/balle) = 10 N (beaucoup plus intense !).",
        anchors: [
            { id: "G", label: "Centre de gravité de la balle", x: 170, y: 130 },
            { id: "ContactDroit", label: "Point de contact avec la raquette", x: 215, y: 130 },
            { id: "Gauche", label: "Bord gauche de la balle", x: 125, y: 130 }
        ],
        modelShape: `<line x1="215" y1="40" x2="215" y2="220" stroke="#d97706" stroke-width="6" stroke-dasharray="8,4"/>
                     <text x="225" y="60" fill="#b45309" font-size="12" font-weight="bold">Cordage</text>
                     <circle cx="170" cy="130" r="45" fill="#bef264" stroke="#65a30d" stroke-width="3"/>`,
        forces: [
            {
                id: "P",
                svgText: "P",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">P</span></span>`,
                color: "#dc2626",
                givenValue: "0,56 N",
                pointOptions: ["Centre de gravité de la balle", "Point de contact avec la raquette"],
                expectedPoint: "Centre de gravité de la balle",
                expectedDirection: "verticale",
                expectedSens: "vers le bas",
                expectedAnchor: "G",
                expectedAngle: 90
            },
            {
                id: "Fraq",
                svgText: "F(raq/balle)",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">F</span><sub>raquette/balle</sub></span>`,
                color: "#2563eb",
                givenValue: "10 N",
                pointOptions: ["Centre de gravité de la balle", "Point de contact avec la raquette"],
                expectedPoint: "Point de contact avec la raquette",
                expectedDirection: "horizontale",
                expectedSens: "vers la gauche",
                expectedAnchor: "ContactDroit",
                expectedAngle: 180
            }
        ],
        compareLengthRule: "Fraq_gt_P"
    },
    {
        id: "o_3",
        title: "Niveau Orange (3/6) : Balle immobile sur le sol",
        subtitle: "La balle est immobile au sol : P = 0,56 N. Déduisez aussi la valeur de F(sol/balle) !",
        anchors: [
            { id: "G", label: "Centre de gravité de la balle", x: 180, y: 125 },
            { id: "ContactSol", label: "Point de contact avec le sol", x: 180, y: 170 },
            { id: "Haut", label: "Sommet de la balle", x: 180, y: 80 }
        ],
        modelShape: `<rect x="40" y="170" width="280" height="25" fill="#c2410c"/>
                     <line x1="40" y1="170" x2="320" y2="170" stroke="#7c2d12" stroke-width="3"/>
                     <circle cx="180" cy="125" r="45" fill="#bef264" stroke="#65a30d" stroke-width="3"/>`,
        forces: [
            {
                id: "P",
                svgText: "P",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">P</span></span>`,
                color: "#dc2626",
                givenValue: "0,56 N",
                pointOptions: ["Centre de gravité de la balle", "Point de contact avec le sol"],
                expectedPoint: "Centre de gravité de la balle",
                expectedDirection: "verticale",
                expectedSens: "vers le bas",
                expectedAnchor: "G",
                expectedAngle: 90
            },
            {
                id: "Fsol",
                svgText: "F(sol/balle)",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">F</span><sub>sol/balle</sub></span>`,
                color: "#16a34a",
                askValue: true,
                expectedValue: 0.56,
                pointOptions: ["Centre de gravité de la balle", "Point de contact avec le sol"],
                expectedPoint: "Point de contact avec le sol",
                expectedDirection: "verticale",
                expectedSens: "vers le haut",
                expectedAnchor: "ContactSol",
                expectedAngle: -90
            }
        ]
    },
    {
        id: "o_4",
        title: "Niveau Orange (4/6) : 1°/ Système : la lampe suspendue",
        subtitle: "Déterminez les caractéristiques des 2 forces et tracez-les sur le schéma.",
        anchors: [
            { id: "ContactFil", label: "Point de contact avec le fil", x: 180, y: 115 },
            { id: "G", label: "Centre de gravité de la lampe", x: 180, y: 140 },
            { id: "Plafond", label: "Attache au plafond", x: 180, y: 35 }
        ],
        modelShape: `<line x1="110" y1="35" x2="250" y2="35" stroke="#1e293b" stroke-width="3"/>
                     <line x1="180" y1="35" x2="180" y2="115" stroke="#1e293b" stroke-width="2.5"/>
                     <path d="M125,155 A55,40 0 0,1 235,155 Z" fill="#fef08a" stroke="#1e293b" stroke-width="2.5"/>`,
        forces: [
            {
                id: "P",
                svgText: "P",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">P</span> (<span class="vec-arrow">F</span><sub>Terre/lampe</sub>)</span>`,
                color: "#dc2626",
                pointOptions: ["Centre de gravité de la lampe", "Point de contact avec le fil", "Point d'attache au plafond"],
                expectedPoint: "Centre de gravité de la lampe",
                expectedDirection: "verticale",
                expectedSens: "vers le bas",
                expectedAnchor: "G",
                expectedAngle: 90
            },
            {
                id: "Ffil",
                svgText: "F(fil/lampe)",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">F</span><sub>fil/lampe</sub></span>`,
                color: "#16a34a",
                pointOptions: ["Centre de gravité de la lampe", "Point de contact avec le fil", "Point d'attache au plafond"],
                expectedPoint: "Point de contact avec le fil",
                expectedDirection: "verticale",
                expectedSens: "vers le haut",
                expectedAnchor: "ContactFil",
                expectedAngle: -90
            }
        ]
    },
    {
        id: "o_5",
        title: "Niveau Orange (5/6) : 2°/ Système : le livre sur la table",
        subtitle: "Déterminez les caractéristiques des 2 forces et tracez-les sur le schéma.",
        anchors: [
            { id: "G", label: "Centre de gravité du livre", x: 180, y: 115 },
            { id: "ContactTable", label: "Point de contact avec la table", x: 180, y: 135 },
            { id: "HautLivre", label: "Dessus du livre", x: 180, y: 95 }
        ],
        modelShape: `<rect x="70" y="135" width="220" height="12" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
                     <rect x="100" y="147" width="12" height="70" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
                     <rect x="248" y="147" width="12" height="70" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
                     <rect x="130" y="95" width="100" height="40" fill="#94a3b8" stroke="#1e293b" stroke-width="2.5"/>`,
        forces: [
            {
                id: "P",
                svgText: "P",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">P</span> (<span class="vec-arrow">F</span><sub>Terre/livre</sub>)</span>`,
                color: "#dc2626",
                pointOptions: ["Centre de gravité du livre", "Point de contact avec la table"],
                expectedPoint: "Centre de gravité du livre",
                expectedDirection: "verticale",
                expectedSens: "vers le bas",
                expectedAnchor: "G",
                expectedAngle: 90
            },
            {
                id: "Ftable",
                svgText: "F(table/livre)",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">F</span><sub>table/livre</sub></span>`,
                color: "#16a34a",
                pointOptions: ["Centre de gravité du livre", "Point de contact avec la table"],
                expectedPoint: "Point de contact avec la table",
                expectedDirection: "verticale",
                expectedSens: "vers le haut",
                expectedAnchor: "ContactTable",
                expectedAngle: -90
            }
        ]
    },
    {
        id: "o_6",
        title: "Niveau Orange (6/6) : 4°/ Système : le clou attiré par l'aimant",
        subtitle: "Cas à 3 forces ! Tracez P, F(fil/clou) et F(aimant/clou), puis reportez-les sur votre fiche papier !",
        paperNotice: "📝 Reproduis les caractéristiques et le tracé des 3 forces du clou (4°/) sur ta fiche papier !",
        anchors: [
            { id: "ContactFil", label: "Point de contact avec le fil", x: 170, y: 107 },
            { id: "G", label: "Centre de gravité du clou", x: 180, y: 115 },
            { id: "Aimant", label: "Centre de l'aimant", x: 250, y: 115 }
        ],
        modelShape: `<line x1="60" y1="40" x2="140" y2="40" stroke="#1e293b" stroke-width="3"/>
                     <line x1="95" y1="40" x2="170" y2="107" stroke="#1e293b" stroke-width="2.5"/>
                     <line x1="163" y1="115" x2="177" y2="99" stroke="#1e293b" stroke-width="4"/>
                     <line x1="170" y1="107" x2="192" y2="125" stroke="#1e293b" stroke-width="3.5"/>
                     <rect x="230" y="103" width="75" height="24" fill="#fca5a5" stroke="#1e293b" stroke-width="2.5"/>
                     <text x="267" y="120" text-anchor="middle" fill="#7f1d1d" font-size="12" font-weight="bold">Aimant</text>`,
        forces: [
            {
                id: "P",
                svgText: "P",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">P</span> (<span class="vec-arrow">F</span><sub>Terre/clou</sub>)</span>`,
                color: "#dc2626",
                pointOptions: ["Centre de gravité du clou", "Point de contact avec le fil", "Centre de l'aimant"],
                expectedPoint: "Centre de gravité du clou",
                expectedDirection: "verticale",
                expectedSens: "vers le bas",
                expectedAnchor: "G",
                expectedAngle: 90
            },
            {
                id: "Ffil",
                svgText: "F(fil/clou)",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">F</span><sub>fil/clou</sub></span>`,
                color: "#16a34a",
                pointOptions: ["Centre de gravité du clou", "Point de contact avec le fil", "Centre de l'aimant"],
                expectedPoint: "Point de contact avec le fil",
                expectedDirection: "selon le fil (oblique)",
                expectedSens: "vers le haut / vers le fil",
                expectedAnchor: "ContactFil",
                expectedAngle: -138,
                angleTolerance: 22
            },
            {
                id: "Faimant",
                svgText: "F(aimant/clou)",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">F</span><sub>aimant/clou</sub></span>`,
                color: "#2563eb",
                pointOptions: ["Centre de gravité du clou", "Point de contact avec le fil", "Centre de l'aimant"],
                expectedPoint: "Centre de gravité du clou",
                expectedDirection: "horizontale",
                expectedSens: "vers la droite (vers l'aimant)",
                expectedAnchor: "G",
                expectedAngle: 0
            }
        ]
    }
];
