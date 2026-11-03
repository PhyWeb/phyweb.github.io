/* --- data.js : Catalogue des situations et schémas SVG --- */

const SVG_SCENES = {
    // --- TENNIS (NIVEAU BLEU & ORANGE) ---
    tennis_air: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="150" fill="#eef7ff"/>
        <rect y="130" width="240" height="20" fill="#d97742"/>
        <!-- Joueur (Nadal) stylisé -->
        <circle cx="75" cy="85" r="14" fill="#f1c27d"/>
        <path d="M61 80 Q75 72 89 80" stroke="#111" stroke-width="4" fill="none"/>
        <path d="M55 130 L65 100 L85 100 L95 130 Z" fill="#e11d48"/>
        <!-- Raquette éloignée -->
        <ellipse cx="145" cy="95" rx="14" ry="22" transform="rotate(20 145 95)" fill="none" stroke="#334155" stroke-width="3"/>
        <line x1="135" y1="114" x2="115" y2="128" stroke="#334155" stroke-width="4"/>
        <!-- Balle en l'air -->
        <circle cx="105" cy="35" r="11" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
        <path d="M98 28 Q105 35 98 42 M112 28 Q105 35 112 42" stroke="#fff" fill="none" stroke-width="1.5"/>
        <text x="122" y="38" font-size="11" fill="#475569" font-weight="bold">Balle en l'air</text>
    </svg>`,

    tennis_choc: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="150" fill="#1e293b"/>
        <!-- Tamis de raquette déformé au contact -->
        <ellipse cx="135" cy="75" rx="32" ry="58" fill="none" stroke="#d97706" stroke-width="6"/>
        <line x1="115" y1="30" x2="115" y2="120" stroke="#94a3b8" stroke-width="1"/>
        <line x1="128" y1="20" x2="128" y2="130" stroke="#94a3b8" stroke-width="1"/>
        <line x1="142" y1="20" x2="142" y2="130" stroke="#94a3b8" stroke-width="1"/>
        <line x1="105" y1="60" x2="165" y2="60" stroke="#94a3b8" stroke-width="1"/>
        <line x1="103" y1="75" x2="167" y2="75" stroke="#94a3b8" stroke-width="1"/>
        <line x1="105" y1="90" x2="165" y2="90" stroke="#94a3b8" stroke-width="1"/>
        <!-- Balle écrasée contre les cordes -->
        <ellipse cx="112" cy="75" rx="14" ry="16" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
        <text x="15" y="25" font-size="11" fill="#f8fafc" font-weight="bold">Impact sur la raquette</text>
    </svg>`,

    tennis_sol: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="105" fill="#f1f5f9"/>
        <rect y="105" width="240" height="45" fill="#c2593f"/>
        <line x1="0" y1="125" x2="240" y2="112" stroke="#fff" stroke-width="4"/>
        <ellipse cx="130" cy="106" rx="16" ry="4" fill="rgba(0,0,0,0.25)"/>
        <circle cx="130" cy="91" r="15" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
        <path d="M120 82 Q130 91 120 100 M140 82 Q130 91 140 100" stroke="#fff" fill="none" stroke-width="1.5"/>
        <text x="15" y="25" font-size="11" fill="#334155" font-weight="bold">Balle posée sur le sol</text>
    </svg>`,

    // --- HANDBALL (TEST BLEU & JAUNE) ---
    hand_passe: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="150" fill="#f0f9ff"/>
        <!-- Joueur Karabatic -->
        <circle cx="70" cy="65" r="14" fill="#f1c27d"/>
        <path d="M50 140 L60 85 L85 85 L95 140 Z" fill="#1d4ed8"/>
        <!-- Bras + Main qui pousse le ballon -->
        <path d="M82 90 L125 65" stroke="#f1c27d" stroke-width="8" stroke-linecap="round"/>
        <circle cx="142" cy="60" r="16" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <text x="12" y="22" font-size="11" fill="#1e3a8a" font-weight="bold">1. Nikola touche le ballon</text>
    </svg>`,

    hand_air: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="150" fill="#f0f9ff"/>
        <rect y="130" width="240" height="20" fill="#fed7aa"/>
        <path d="M35 85 Q95 35 155 55" stroke="#94a3b8" stroke-dasharray="4,4" fill="none" stroke-width="2"/>
        <circle cx="155" cy="55" r="16" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <text x="12" y="22" font-size="11" fill="#1e3a8a" font-weight="bold">2. Ballon en vol dans l'air</text>
    </svg>`,

    hand_sol: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="110" fill="#f8fafc"/>
        <rect y="110" width="240" height="40" fill="#fdba74"/>
        <ellipse cx="120" cy="111" rx="17" ry="4" fill="rgba(0,0,0,0.2)"/>
        <circle cx="120" cy="94" r="16" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <text x="12" y="22" font-size="11" fill="#1e3a8a" font-weight="bold">3. Ballon posé sur le terrain</text>
    </svg>`,

    // --- NIVEAU VERT (REMÉDIATION) ---
    vert_orbite: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="150" fill="#0f172a"/>
        <ellipse cx="170" cy="75" rx="125" ry="55" fill="none" stroke="#475569" stroke-dasharray="4,4"/>
        <circle cx="185" cy="75" r="32" fill="#f59e0b"/>
        <circle cx="55" cy="95" r="12" fill="#3b82f6"/>
        <path d="M50 90 Q58 95 52 102" stroke="#22c55e" stroke-width="3" fill="none"/>
        <text x="12" y="22" font-size="11" fill="#f8fafc">Terre en orbite autour du Soleil</text>
    </svg>`,

    vert_plume: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="150" fill="#e0f2fe"/>
        <!-- Bâton électrisé -->
        <rect x="65" y="20" width="14" height="95" rx="3" fill="#fff" stroke="#0284c7" stroke-width="2"/>
        <text x="68" y="55" font-size="10" fill="#0284c7" font-weight="bold">+ +</text>
        <!-- Plume attirée à distance -->
        <path d="M125 95 Q105 70 98 55 Q118 65 125 95 Z" fill="#fff" stroke="#64748b" stroke-width="1.5"/>
        <line x1="128" y1="102" x2="100" y2="58" stroke="#64748b" stroke-width="1.5"/>
        <text x="12" y="140" font-size="11" fill="#0369a1" font-weight="bold">Plume attirée par un bâton électrisé</text>
    </svg>`,

    vert_kite: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="115" fill="#bae6fd"/>
        <rect y="115" width="240" height="35" fill="#0284c7"/>
        <!-- Planche -->
        <ellipse cx="95" cy="115" rx="30" ry="5" fill="#facc15" stroke="#ca8a04"/>
        <!-- Kitesurfeuse -->
        <circle cx="85" cy="65" r="9" fill="#f1c27d"/>
        <line x1="85" y1="74" x2="90" y2="98" stroke="#16a34a" stroke-width="6"/>
        <line x1="90" y1="98" x2="85" y2="113" stroke="#1e293b" stroke-width="4"/>
        <line x1="90" y1="98" x2="102" y2="113" stroke="#1e293b" stroke-width="4"/>
        <!-- Bras + barre/manche + fils vers voile -->
        <line x1="87" y1="80" x2="115" y2="72" stroke="#f1c27d" stroke-width="4"/>
        <line x1="115" y1="62" x2="115" y2="82" stroke="#111" stroke-width="3"/>
        <line x1="115" y1="66" x2="195" y2="30" stroke="#475569" stroke-width="1"/>
        <path d="M185 15 Q215 25 200 50" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
    </svg>`,

    vert_trombone: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="150" fill="#dbeafe"/>
        <!-- Potence + Aimant -->
        <line x1="45" y1="10" x2="45" y2="140" stroke="#475569" stroke-width="5"/>
        <rect x="45" y="55" width="24" height="22" fill="#dc2626" stroke="#1e293b" stroke-width="1.5"/>
        <!-- Trombone à distance -->
        <rect x="82" y="61" width="32" height="10" rx="5" fill="none" stroke="#64748b" stroke-width="2.5"/>
        <!-- Élastique tenu par la main -->
        <path d="M112 64 L165 75 L112 69" fill="none" stroke="#ea580c" stroke-width="2"/>
        <circle cx="180" cy="80" r="18" fill="#f1c27d"/>
        <text x="12" y="138" font-size="11" fill="#1e3a8a" font-weight="bold">Trombone retenu par un élastique</text>
    </svg>`,

    vert_iceberg: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="65" fill="#bae6fd"/>
        <rect y="65" width="240" height="85" fill="#0369a1"/>
        <polygon points="75,65 95,22 135,32 155,65" fill="#ffffff" stroke="#cbd5e1"/>
        <polygon points="75,65 65,125 125,138 160,95 155,65" fill="#7dd3fc" opacity="0.75"/>
        <line x1="0" y1="65" x2="240" y2="65" stroke="#fff" stroke-width="2"/>
    </svg>`,

    vert_balancoire: `<svg viewBox="0 0 240 150" width="100%" height="100%">
        <rect width="240" height="150" fill="#e0f2fe"/>
        <!-- Cordes et planche de la balançoire -->
        <line x1="95" y1="0" x2="95" y2="95" stroke="#78350f" stroke-width="2.5"/>
        <line x1="145" y1="0" x2="145" y2="95" stroke="#78350f" stroke-width="2.5"/>
        <rect x="85" y="95" width="70" height="7" rx="2" fill="#92400e"/>
        <!-- Jeune homme assis -->
        <circle cx="120" cy="52" r="10" fill="#f1c27d"/>
        <rect x="108" y="64" width="24" height="31" rx="4" fill="#3b82f6"/>
    </svg>`
};

// ============================================================================
// DONNÉES DES NIVEAUX BLEU ET VERT
// ============================================================================
const DATA_BLEU_VERT = {
    bleu_entrainement: [
        {
            id: "b_e1",
            title: "1. La balle est en l'air (après le lancer)",
            receveur: "La balle",
            svg: SVG_SCENES.tennis_air,
            actorsPool: ["La Terre", "La raquette", "Le sol", "Rafael Nadal"],
            expected: [
                { donneur: "La Terre", type: "distance" }
            ],
            hints: {
                "La raquette": "Regarde bien l'image : la raquette touche-t-elle la balle à cet instant précis ?",
                "Rafael Nadal": "Nadal a lâché la balle : il n'est plus en contact avec elle !",
                "Le sol": "La balle est en l'air, elle ne touche pas le sol.",
                "missing_Terre": "Pourquoi la balle finit-elle par retomber ? N'oublie pas l'astre qui attire tous les objets à distance !"
            }
        },
        {
            id: "b_e2",
            title: "2. La balle est frappée par le tamis de la raquette",
            receveur: "La balle",
            svg: SVG_SCENES.tennis_choc,
            actorsPool: ["La Terre", "La raquette", "Le sol"],
            expected: [
                { donneur: "La Terre", type: "distance" },
                { donneur: "La raquette", type: "contact" }
            ],
            hints: {
                "Le sol": "La balle est dans les cordes de la raquette, pas sur le sol.",
                "missing_Terre": "Même pendant le choc avec la raquette, la Terre continue d'attirer la balle à distance !"
            }
        },
        {
            id: "b_e3",
            title: "3. La balle repose immobile sur la terre battue",
            receveur: "La balle",
            svg: SVG_SCENES.tennis_sol,
            actorsPool: ["La Terre", "La raquette", "Le sol"],
            expected: [
                { donneur: "La Terre", type: "distance" },
                { donneur: "Le sol", type: "contact" }
            ],
            hints: {
                "La raquette": "La raquette ne touche plus du tout la balle.",
                "missing_Terre": "La Terre attire toujours la balle vers le bas (c'est le sol qui l'empêche de s'enfoncer)."
            }
        }
    ],
    bleu_test: [
        {
            id: "b_t1",
            title: "1. Nikola Karabatic pousse le ballon de la main pour faire une passe",
            receveur: "Le ballon",
            svg: SVG_SCENES.hand_passe,
            actorsPool: ["La Terre", "La main (Nikola)", "Le sol"],
            expected: [
                { donneur: "La Terre", type: "distance" },
                { donneur: "La main (Nikola)", type: "contact" }
            ],
            hints: {
                "Le sol": "Le ballon est dans la main de Nikola, il ne touche pas le sol.",
                "missing_Terre": "N'oublie jamais l'attraction gravitationnelle de la Terre !"
            }
        },
        {
            id: "b_t2",
            title: "2. Le ballon voyage en l'air pendant la passe",
            receveur: "Le ballon",
            svg: SVG_SCENES.hand_air,
            actorsPool: ["La Terre", "La main (Nikola)", "Le sol"],
            expected: [
                { donneur: "La Terre", type: "distance" }
            ],
            hints: {
                "La main (Nikola)": "Piège classique ! Une fois que le ballon a quitté la main, la main n'agit plus dessus.",
                "Le sol": "Le ballon est en plein vol, il ne touche pas le sol."
            }
        },
        {
            id: "b_t3",
            title: "3. Le ballon est posé sur le parquet du gymnase",
            receveur: "Le ballon",
            svg: SVG_SCENES.hand_sol,
            actorsPool: ["La Terre", "La main (Nikola)", "Le sol"],
            expected: [
                { donneur: "La Terre", type: "distance" },
                { donneur: "Le sol", type: "contact" }
            ],
            hints: {}
        }
    ],
    vert_entrainement: [
        {
            id: "v_e1",
            title: "1. La Terre en orbite autour du Soleil",
            receveur: "La Terre",
            svg: SVG_SCENES.vert_orbite,
            actorsPool: ["Le Soleil", "La Lune / étoiles", "L'air"],
            expected: [
                { donneur: "Le Soleil", type: "distance" }
            ],
            hints: {
                "L'air": "Dans l'espace interplanétaire, c'est le vide !"
            }
        },
        {
            id: "v_e2",
            title: "2. Une plume attirée par un bâton électrisé",
            receveur: "La plume",
            svg: SVG_SCENES.vert_plume,
            actorsPool: ["Le bâton électrisé", "La Terre", "La main"],
            expected: [
                { donneur: "Le bâton électrisé", type: "distance" },
                { donneur: "La Terre", type: "distance" }
            ],
            hints: {
                "La main": "La main tient le bâton, mais elle ne touche pas la plume !"
            }
        },
        {
            id: "v_e3",
            title: "3. Une kitesurfeuse glissant sur l'eau",
            receveur: "La kitesurfeuse",
            svg: SVG_SCENES.vert_kite,
            actorsPool: ["La planche", "Le manche de la voile", "La Terre", "L'eau"],
            expected: [
                { donneur: "La planche", type: "contact" },
                { donneur: "Le manche de la voile", type: "contact" },
                { donneur: "La Terre", type: "distance" }
            ],
            hints: {
                "L'eau": "Regarde bien ses pieds : l'eau porte la planche, mais c'est la planche qui touche directement la kitesurfeuse !"
            }
        }
    ],
    vert_test: [
        {
            id: "v_t1",
            title: "1. Un trombone retenu par un élastique et attiré par un aimant",
            receveur: "Le trombone",
            svg: SVG_SCENES.vert_trombone,
            actorsPool: ["L'aimant", "L'élastique", "La Terre", "La main"],
            expected: [
                { donneur: "L'aimant", type: "distance" },
                { donneur: "L'élastique", type: "contact" },
                { donneur: "La Terre", type: "distance" }
            ],
            hints: {
                "La main": "La main tire sur l'élastique, mais seul l'élastique touche le trombone."
            }
        },
        {
            id: "v_t2",
            title: "2. Un iceberg flottant sur la mer",
            receveur: "L'iceberg",
            svg: SVG_SCENES.vert_iceberg,
            actorsPool: ["L'eau", "La Terre", "Les nuages"],
            expected: [
                { donneur: "L'eau", type: "contact" },
                { donneur: "La Terre", type: "distance" }
            ],
            hints: {}
        },
        {
            id: "v_t3",
            title: "3. Un jeune homme assis sur une balançoire",
            receveur: "Le jeune homme",
            svg: SVG_SCENES.vert_balancoire,
            actorsPool: ["La balançoire", "La Terre", "L'arbre"],
            expected: [
                { donneur: "La balançoire", type: "contact" },
                { donneur: "La Terre", type: "distance" }
            ],
            hints: {
                "L'arbre": "L'arbre soutient les cordes de la balançoire, mais ne touche pas directement le jeune homme."
            }
        }
    ]
};

// ============================================================================
// SCHÉMAS DES 6 SITUATIONS CLASSIQUES (JAUNE & ORANGE)
// ============================================================================
const SIX_SCHEMAS_SVG = {
    s1_lampe: `<svg viewBox="0 0 300 260" width="100%" height="100%">
        <!-- Plafond hachuré -->
        <line x1="90" y1="35" x2="210" y2="35" stroke="#1e293b" stroke-width="3"/>
        <path d="M100 35 L110 20 M120 35 L130 20 M140 35 L150 20 M160 35 L170 20 M180 35 L190 20 M200 35 L210 20" stroke="#64748b" stroke-width="2"/>
        <text x="218" y="35" font-size="13" fill="#475569">plafond</text>
        <!-- Fil -->
        <line x1="150" y1="35" x2="150" y2="115" stroke="#1e293b" stroke-width="2.5"/>
        <text x="160" y="80" font-size="13" fill="#475569">fil</text>
        <!-- Abat-jour Lampe -->
        <path d="M105 155 A45 40 0 0 1 195 155 Z" fill="#fef08a" stroke="#1e293b" stroke-width="2.5"/>
        <text x="205" y="150" font-size="14" font-weight="bold" fill="#1e293b">lampe</text>
    </svg>`,

    s2_livre: `<svg viewBox="0 0 300 260" width="100%" height="100%">
        <!-- Table -->
        <rect x="45" y="140" width="210" height="12" fill="#e2e8f0" stroke="#1e293b" stroke-width="2"/>
        <rect x="75" y="152" width="12" height="80" fill="#e2e8f0" stroke="#1e293b" stroke-width="2"/>
        <rect x="213" y="152" width="12" height="80" fill="#e2e8f0" stroke="#1e293b" stroke-width="2"/>
        <text x="245" y="132" font-size="13" fill="#475569">table</text>
        <!-- Livre -->
        <rect x="105" y="100" width="90" height="40" fill="#94a3b8" stroke="#1e293b" stroke-width="2.5"/>
        <text x="135" y="90" font-size="14" font-weight="bold" fill="#1e293b">livre</text>
    </svg>`,

    s3_pomme: `<svg viewBox="0 0 300 260" width="100%" height="100%">
        <!-- Traits de vitesse / chute -->
        <line x1="120" y1="45" x2="120" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="150" y1="35" x2="150" y2="65" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="180" y1="45" x2="180" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <!-- Pomme -->
        <path d="M150 105 C130 90 105 110 112 140 C118 165 138 175 150 165 C162 175 182 165 188 140 C195 110 170 90 150 105 Z" fill="#fca5a5" stroke="#1e293b" stroke-width="2.5"/>
        <path d="M150 105 L155 82" stroke="#78350f" stroke-width="3" fill="none"/>
        <path d="M155 88 Q175 78 170 95 Q160 98 155 88 Z" fill="#86efac" stroke="#1e293b" stroke-width="1.5"/>
        <text x="200" y="125" font-size="13" fill="#1e293b">pomme en</text>
        <text x="200" y="142" font-size="13" fill="#1e293b">chute libre</text>
    </svg>`,

    s4_clou: `<svg viewBox="0 0 300 260" width="100%" height="100%">
        <!-- Plafond -->
        <line x1="35" y1="45" x2="105" y2="45" stroke="#1e293b" stroke-width="3"/>
        <path d="M45 45 L55 30 M65 45 L75 30 M85 45 L95 30" stroke="#64748b" stroke-width="2"/>
        <!-- Fil incliné (de 70,45 à 142,117 -> angle -45°/135°) -->
        <line x1="70" y1="45" x2="142" y2="117" stroke="#1e293b" stroke-width="2.5"/>
        <text x="102" y="70" font-size="13" fill="#475569">fil</text>
        <!-- Clou incliné (centre en 150, 125) -->
        <line x1="142" y1="117" x2="158" y2="133" stroke="#334155" stroke-width="4"/>
        <line x1="163" y1="125" x2="151" y2="139" stroke="#334155" stroke-width="4"/>
        <text x="135" y="102" font-size="14" font-weight="bold" fill="#1e293b">clou</text>
        <!-- Aimant à droite -->
        <rect x="195" y="113" width="65" height="24" fill="#fca5a5" stroke="#1e293b" stroke-width="2.5"/>
        <text x="206" y="105" font-size="13" fill="#1e293b">aimant</text>
    </svg>`,

    s5_ressort: `<svg viewBox="0 0 300 260" width="100%" height="100%">
        <!-- Plafond -->
        <line x1="110" y1="30" x2="190" y2="30" stroke="#1e293b" stroke-width="3"/>
        <path d="M120 30 L130 15 M140 30 L150 15 M160 30 L170 15 M180 30 L190 15" stroke="#64748b" stroke-width="2"/>
        <!-- Ressort -->
        <polyline points="150,30 150,45 136,52 164,64 136,76 164,88 136,100 164,112 150,120 150,135" fill="none" stroke="#1e293b" stroke-width="2.5"/>
        <text x="175" y="85" font-size="13" fill="#475569">ressort</text>
        <!-- Solide rond (haut=135, centre=155) -->
        <circle cx="150" cy="155" r="20" fill="#cbd5e1" stroke="#1e293b" stroke-width="2.5"/>
        <text x="180" y="160" font-size="14" font-weight="bold" fill="#1e293b">solide</text>
    </svg>`,

    s6_livre_air: `<svg viewBox="0 0 300 260" width="100%" height="100%">
        <!-- Livre incliné qui monte -->
        <g transform="translate(135,115) rotate(-35)">
            <rect x="-40" y="-25" width="80" height="50" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
            <line x1="-35" y1="25" x2="35" y2="25" stroke="#475569" stroke-width="2"/>
        </g>
        <!-- Traits de mouvement dessous -->
        <line x1="105" y1="175" x2="105" y2="205" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="135" y1="165" x2="135" y2="200" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="165" y1="175" x2="165" y2="205" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="190" y="95" font-size="12" fill="#1e293b">livre lancé en l'air</text>
        <text x="190" y="112" font-size="12" fill="#1e293b">(en train de monter)</text>
    </svg>`
};

// ============================================================================
// DONNÉES DU NIVEAU JAUNE (D.O.I.)
// ============================================================================
const DATA_JAUNE = {
    entrainement: [
        {
            id: "j_e1",
            title: "Situation 1 : Nikola touche le ballon pour faire une passe",
            system: "Ballon",
            svg: SVG_SCENES.hand_passe,
            nodes: [
                { id: "Main (Nikola)", label: "Main (Nikola)", x: 65, y: 75 },
                { id: "Terre", label: "Terre", x: 235, y: 75 },
                { id: "Sol", label: "Sol (Intrus)", x: 150, y: 245 }
            ],
            expected: {
                "Main (Nikola)": "contact",
                "Terre": "distance",
                "Sol": "none"
            }
        },
        {
            id: "j_e2",
            title: "Situation 2 : Le ballon est en l'air pendant la passe",
            system: "Ballon",
            svg: SVG_SCENES.hand_air,
            nodes: [
                { id: "Main (Nikola)", label: "Main (Nikola)", x: 65, y: 75 },
                { id: "Terre", label: "Terre", x: 235, y: 75 },
                { id: "Sol", label: "Sol", x: 150, y: 245 }
            ],
            expected: {
                "Main (Nikola)": "none",
                "Terre": "distance",
                "Sol": "none"
            }
        },
        {
            id: "j_e3",
            title: "Situation 3 : Le ballon est immobile sur le sol",
            system: "Ballon",
            svg: SVG_SCENES.hand_sol,
            nodes: [
                { id: "Main (Nikola)", label: "Main (Nikola)", x: 65, y: 75 },
                { id: "Terre", label: "Terre", x: 235, y: 75 },
                { id: "Sol", label: "Sol", x: 150, y: 245 }
            ],
            expected: {
                "Main (Nikola)": "none",
                "Terre": "distance",
                "Sol": "contact"
            }
        }
    ],
    test: [
        {
            id: "j_t1",
            title: "1°/ Système : la lampe suspendue",
            system: "Lampe",
            svg: SIX_SCHEMAS_SVG.s1_lampe,
            nodes: [
                { id: "Fil", label: "Fil", x: 65, y: 75 },
                { id: "Terre", label: "Terre", x: 235, y: 75 },
                { id: "Plafond", label: "Plafond", x: 150, y: 245 }
            ],
            expected: { "Fil": "contact", "Terre": "distance", "Plafond": "none" },
            hint: "Attention : le plafond touche le fil, mais ne touche pas directement la lampe !"
        },
        {
            id: "j_t2",
            title: "2°/ Système : le livre posé sur la table",
            system: "Livre",
            svg: SIX_SCHEMAS_SVG.s2_livre,
            nodes: [
                { id: "Table", label: "Table", x: 65, y: 75 },
                { id: "Terre", label: "Terre", x: 235, y: 75 },
                { id: "Sol", label: "Sol", x: 150, y: 245 }
            ],
            expected: { "Table": "contact", "Terre": "distance", "Sol": "none" }
        },
        {
            id: "j_t3",
            title: "3°/ Système : la pomme qui tombe de l'arbre",
            system: "Pomme",
            svg: SIX_SCHEMAS_SVG.s3_pomme,
            nodes: [
                { id: "Terre", label: "Terre", x: 235, y: 75 },
                { id: "Arbre", label: "Arbre", x: 65, y: 75 }
            ],
            expected: { "Terre": "distance", "Arbre": "none" },
            hint: "La pomme s'est décrochée : l'arbre ne la touche plus."
        },
        {
            id: "j_t4",
            title: "4°/ Système : le clou dévié par un aimant",
            system: "Clou",
            svg: SIX_SCHEMAS_SVG.s4_clou,
            nodes: [
                { id: "Fil", label: "Fil", x: 65, y: 70 },
                { id: "Terre", label: "Terre", x: 235, y: 70 },
                { id: "Aimant", label: "Aimant", x: 150, y: 245 }
            ],
            expected: { "Fil": "contact", "Terre": "distance", "Aimant": "distance" },
            hint: "L'aimant attire le clou sans le toucher : c'est une interaction à distance (pointillés)."
        },
        {
            id: "j_t5",
            title: "5°/ Système : le solide suspendu au ressort",
            system: "Solide",
            svg: SIX_SCHEMAS_SVG.s5_ressort,
            nodes: [
                { id: "Ressort", label: "Ressort", x: 65, y: 75 },
                { id: "Terre", label: "Terre", x: 235, y: 75 },
                { id: "Plafond", label: "Plafond", x: 150, y: 245 }
            ],
            expected: { "Ressort": "contact", "Terre": "distance", "Plafond": "none" }
        },
        {
            id: "j_t6",
            title: "6°/ Système : livre lancé en l'air par un élève excédé (en montée)",
            system: "Livre",
            svg: SIX_SCHEMAS_SVG.s6_livre_air,
            nodes: [
                { id: "Terre", label: "Terre", x: 235, y: 75 },
                { id: "Élève", label: "Main de l'élève", x: 65, y: 75 }
            ],
            expected: { "Terre": "distance", "Élève": "none" },
            hint: "Piège classique ! Le livre a déjà quitté la main de l'élève : même s'il monte encore sur son élan, seule la Terre agit sur lui."
        }
    ]
};

// ============================================================================
// DONNÉES DU NIVEAU ORANGE (MODÉLISATION VECTORIELLE)
// Angles SVG : 0° = Droite, 90° = Bas (Vertical vers le bas), -90° = Haut, 180° = Gauche
// ============================================================================
const DATA_ORANGE = {
    entrainement: [
        {
            id: "o_e1",
            title: "1. Balle de tennis en l'air (P = 0,56 N)",
            subtitle: "Tracez la force s'exerçant sur la balle en partant du bon point d'application.",
            svgBg: `<svg viewBox="0 0 300 260" width="100%" height="100%">
                <circle cx="150" cy="130" r="42" fill="#eab308" stroke="#ca8a04" stroke-width="3"/>
                <path d="M122 100 Q150 130 122 160 M178 100 Q150 130 178 160" stroke="#fff" fill="none" stroke-width="3"/>
            </svg>`,
            anchors: [
                { id: "G", label: "Centre de gravité G", x: 150, y: 130 },
                { id: "bas", label: "Bas de la balle", x: 150, y: 172 }
            ],
            availableForces: [
                { id: "P", label: "P (ou F_Terre/balle)", color: "#dc2626" }
            ],
            expectedVectors: [
                { id: "P", anchor: "G", angle: 90, tol: 15, hintAnchor: "Le poids est une action à distance : il s'applique au centre de gravité G de la balle !", hintDir: "Le poids est toujours vertical et dirigé vers le bas." }
            ]
        },
        {
            id: "o_e2",
            title: "2. Balle frappée par la raquette (vers la gauche)",
            subtitle: "Tracez le poids P ainsi que la force exercée par la raquette sur la balle.",
            svgBg: `<svg viewBox="0 0 300 260" width="100%" height="100%">
                <!-- Raquette à droite de la balle -->
                <rect x="192" y="45" width="10" height="170" rx="4" fill="#475569"/>
                <line x1="192" y1="60" x2="192" y2="200" stroke="#facc15" stroke-width="3" stroke-dasharray="6,6"/>
                <circle cx="150" cy="130" r="42" fill="#eab308" stroke="#ca8a04" stroke-width="3"/>
                <path d="M122 100 Q150 130 122 160 M178 100 Q150 130 178 160" stroke="#fff" fill="none" stroke-width="3"/>
            </svg>`,
            anchors: [
                { id: "G", label: "Centre G", x: 150, y: 130 },
                { id: "contact_raq", label: "Point de contact raquette", x: 192, y: 130 }
            ],
            availableForces: [
                { id: "P", label: "P (Terre/balle)", color: "#dc2626" },
                { id: "F_raq", label: "F_raquette/balle", color: "#2563eb" }
            ],
            expectedVectors: [
                { id: "P", anchor: "G", angle: 90, tol: 15, hintAnchor: "Le poids P part du centre de gravité G.", hintDir: "Le poids P est vertical vers le bas." },
                { id: "F_raq", anchor: "contact_raq", angle: 180, tol: 20, hintAnchor: "L'action de la raquette est une action de contact : elle part du point de contact avec le tamis !", hintDir: "La raquette pousse la balle horizontalement vers la gauche." }
            ]
        },
        {
            id: "o_e3",
            title: "3. Balle posée immobile sur le sol",
            subtitle: "Tracez le poids P (0,56 N) et la force du sol sur la balle (0,56 N).",
            svgBg: `<svg viewBox="0 0 300 260" width="100%" height="100%">
                <rect x="30" y="172" width="240" height="25" fill="#c2593f"/>
                <line x1="30" y1="172" x2="270" y2="172" stroke="#78350f" stroke-width="3"/>
                <circle cx="150" cy="130" r="42" fill="#eab308" stroke="#ca8a04" stroke-width="3"/>
            </svg>`,
            anchors: [
                { id: "G", label: "Centre G", x: 150, y: 130 },
                { id: "contact_sol", label: "Point de contact sol", x: 150, y: 172 }
            ],
            availableForces: [
                { id: "P", label: "P (Terre/balle)", color: "#dc2626" },
                { id: "F_sol", label: "F_sol/balle", color: "#16a34a" }
            ],
            expectedVectors: [
                { id: "P", anchor: "G", angle: 90, tol: 15, hintAnchor: "Le poids part du centre G.", hintDir: "Le poids est vertical vers le bas." },
                { id: "F_sol", anchor: "contact_sol", angle: -90, tol: 15, hintAnchor: "La force du sol est une action de contact : elle part du point de contact entre le sol et la balle.", hintDir: "Le sol soutient la balle vers le haut (vertical vers le haut)." }
            ]
        }
    ],
    test: [
        {
            id: "o_t1",
            title: "1°/ Système : la lampe suspendue au fil",
            subtitle: "Représentez les forces qui s'exercent sur la lampe.",
            svgBg: SIX_SCHEMAS_SVG.s1_lampe,
            anchors: [
                { id: "contact_fil", label: "Point d'attache du fil", x: 150, y: 115 },
                { id: "G", label: "Centre de gravité G", x: 150, y: 142 }
            ],
            availableForces: [
                { id: "P", label: "P (Terre/lampe)", color: "#dc2626" },
                { id: "F_fil", label: "F_fil/lampe", color: "#16a34a" }
            ],
            expectedVectors: [
                { id: "P", anchor: "G", angle: 90, tol: 15, hintAnchor: "Le poids P part du centre de gravité G de la lampe.", hintDir: "Le poids est vertical vers le bas." },
                { id: "F_fil", anchor: "contact_fil", angle: -90, tol: 15, hintAnchor: "Le fil agit au point de contact en haut de la lampe.", hintDir: "Le fil retient la lampe verticalement vers le haut." }
            ]
        },
        {
            id: "o_t2",
            title: "2°/ Système : le livre sur la table",
            subtitle: "Représentez les forces qui s'exercent sur le livre.",
            svgBg: SIX_SCHEMAS_SVG.s2_livre,
            anchors: [
                { id: "G", label: "Centre de gravité G", x: 150, y: 120 },
                { id: "contact_table", label: "Centre de contact table", x: 150, y: 140 }
            ],
            availableForces: [
                { id: "P", label: "P (Terre/livre)", color: "#dc2626" },
                { id: "F_table", label: "F_table/livre", color: "#16a34a" }
            ],
            expectedVectors: [
                { id: "P", anchor: "G", angle: 90, tol: 15, hintAnchor: "Le poids s'applique au centre de gravité G du livre.", hintDir: "Le poids est vertical vers le bas." },
                { id: "F_table", anchor: "contact_table", angle: -90, tol: 15, hintAnchor: "La table agit à la surface de contact avec le livre (en bas du livre).", hintDir: "La table pousse le livre vers le haut pour l'empêcher de tomber." }
            ]
        },
        {
            id: "o_t3",
            title: "4°/ Système : le clou attiré par l'aimant",
            subtitle: "Attention aux 3 forces qui s'exercent sur le clou !",
            svgBg: SIX_SCHEMAS_SVG.s4_clou,
            anchors: [
                { id: "contact_fil", label: "Attache du fil", x: 142, y: 117 },
                { id: "G", label: "Centre du clou G", x: 153, y: 128 }
            ],
            availableForces: [
                { id: "P", label: "P (Terre/clou)", color: "#dc2626" },
                { id: "F_fil", label: "F_fil/clou", color: "#16a34a" },
                { id: "F_aimant", label: "F_aimant/clou", color: "#2563eb" }
            ],
            expectedVectors: [
                { id: "P", anchor: "G", angle: 90, tol: 15, hintAnchor: "Le poids part du centre G du clou.", hintDir: "Le poids est vertical vers le bas." },
                { id: "F_fil", anchor: "contact_fil", angle: -135, tol: 22, hintAnchor: "La force du fil part du point d'attache du fil sur le clou.", hintDir: "La force d'un fil tendu suit toujours la direction du fil (en oblique vers le haut à gauche) !" },
                { id: "F_aimant", anchor: "G", angle: 0, tol: 18, hintAnchor: "L'aimant agit à distance : sa force part du centre du clou G.", hintDir: "L'aimant attire le clou horizontalement vers la droite (vers l'aimant)." }
            ]
        },
        {
            id: "o_t4",
            title: "5°/ Système : le solide suspendu au ressort",
            subtitle: "Représentez les forces qui s'exercent sur le solide.",
            svgBg: SIX_SCHEMAS_SVG.s5_ressort,
            anchors: [
                { id: "contact_ressort", label: "Attache du ressort", x: 150, y: 135 },
                { id: "G", label: "Centre du solide G", x: 150, y: 155 }
            ],
            availableForces: [
                { id: "P", label: "P (Terre/solide)", color: "#dc2626" },
                { id: "F_ressort", label: "F_ressort/solide", color: "#16a34a" }
            ],
            expectedVectors: [
                { id: "P", anchor: "G", angle: 90, tol: 15, hintAnchor: "Le poids part du centre de gravité G du solide.", hintDir: "Le poids est vertical vers le bas." },
                { id: "F_ressort", anchor: "contact_ressort", angle: -90, tol: 15, hintAnchor: "Le ressort agit au point de contact en haut du solide.", hintDir: "Le ressort tire le solide verticalement vers le haut." }
            ]
        }
    ]
};

// ============================================================================
// DONNÉES DU NIVEAU ROUGE (SYNTHÈSE SKIEUR & CERF-VOLANT)
// ============================================================================
const DATA_ROUGE = {
    entrainement: {
        id: "r_skieur",
        title: "Entraînement Rouge : Le skieur sur un tire-fesse",
        enonce: `Un skieur de masse <strong>m = 60,0 kg</strong> utilise un tire-fesse pour remonter une piste inclinée. On suppose qu'il glisse sans frottement sur la neige.<br>Données : intensité de la pesanteur <strong>g = 9,81 N/kg</strong> et <strong>P = m × g</strong>.`,
        calcQuestion: "1. Calculez la valeur du poids P du skieur (en N, arrondi à l'unité) :",
        expectedP: 589,
        tolP: 2,
        massRawError: 60,
        vectorConfig: {
            id: "vec_skieur",
            title: "2. Représentez les 3 forces appliquées au système {Skieur}",
            subtitle: "Attention à l'inclinaison de la piste : le poids est-il penché ou vertical ? Et la réaction de la neige ?",
            svgBg: `<svg viewBox="0 0 300 260" width="100%" height="100%">
                <!-- Piste enneigée inclinée (-25°) -->
                <line x1="25" y1="237" x2="275" y2="120" stroke="#1e293b" stroke-width="4"/>
                <!-- Skis parallèles à la pente -->
                <line x1="95" y1="198" x2="195" y2="151" stroke="#0284c7" stroke-width="5" stroke-linecap="round"/>
                <!-- Corps du skieur -->
                <line x1="145" y1="175" x2="135" y2="140" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>
                <line x1="135" y1="140" x2="120" y2="95" stroke="#e11d48" stroke-width="9" stroke-linecap="round"/>
                <circle cx="115" cy="75" r="12" fill="#f1c27d" stroke="#1e293b" stroke-width="2"/>
                <!-- Bras + Perche du tire-fesse (angle -55°) -->
                <line x1="125" y1="105" x2="160" y2="100" stroke="#e11d48" stroke-width="5" stroke-linecap="round"/>
                <line x1="142" y1="125" x2="215" y2="20" stroke="#475569" stroke-width="3"/>
            </svg>`,
            anchors: [
                { id: "G", label: "Centre de gravité G", x: 130, y: 122 },
                { id: "contact_neige", label: "Contact neige/skis", x: 145, y: 181 },
                { id: "contact_perche", label: "Contact tire-fesse", x: 155, y: 106 }
            ],
            availableForces: [
                { id: "P", label: "P (Terre/skieur)", color: "#dc2626" },
                { id: "F_neige", label: "F_neige/skieur", color: "#16a34a" },
                { id: "F_tf", label: "F_tire-fesse/skieur", color: "#2563eb" }
            ],
            expectedVectors: [
                {
                    id: "P", anchor: "G", angle: 90, tol: 14,
                    hintAnchor: "Le poids P s'applique au centre de gravité G du skieur.",
                    hintDir: "Piège classique ! Même sur une piste inclinée, le poids P est TOUJOURS parfaitement vertical vers le bas (vers le centre de la Terre) !"
                },
                {
                    id: "F_neige", anchor: "contact_neige", angle: -115, tol: 20,
                    hintAnchor: "La neige agit au centre de la zone de contact sous les skis.",
                    hintDir: "Sans frottements, la force de la neige est perpendiculaire à la piste (inclinée vers le haut et la gauche) !"
                },
                {
                    id: "F_tf", anchor: "contact_perche", angle: -55, tol: 20,
                    hintAnchor: "Le tire-fesse agit au point de contact avec le skieur.",
                    hintDir: "La force exercée par la perche du tire-fesse a la même direction que la perche (vers le haut à droite)."
                }
            ]
        }
    },
    test: {
        id: "r_cerfvolant",
        title: "Test Rouge : Le cerf-volant dans le vent",
        enonce: `Un enfant joue avec un cerf-volant de masse <strong>m = 200 g</strong>.<br>Données : intensité de la pesanteur <strong>g = 9,81 N/kg</strong> et <strong>P = m × g</strong>.`,
        calcQuestion: "1. Calculez la valeur du poids P du cerf-volant (en N, avec 2 chiffres après la virgule) :",
        expectedP: 1.96,
        tolP: 0.05,
        unitTrapVal: 1962,
        vectorConfig: {
            id: "vec_cv",
            title: "2. Représentez les 3 forces appliquées au système {Cerf-volant}",
            subtitle: "Tracez le poids P, la force du fil et la poussée du vent.",
            svgBg: `<svg viewBox="0 0 300 260" width="100%" height="100%">
                <rect width="300" height="260" fill="#f8fafc"/>
                <!-- Fil tendu (du bas-gauche (45,230) vers l'attache (165,125) -> angle vers le bas-gauche = 139°) -->
                <line x1="45" y1="230" x2="165" y2="125" stroke="#334155" stroke-width="2.5"/>
                <text x="75" y="185" font-size="13" fill="#475569">fil tendu</text>
                <!-- Cerf-volant losange (Centre G en 180, 105) -->
                <polygon points="180,45 225,95 180,165 135,95" fill="#3b82f6" stroke="#1e293b" stroke-width="2.5"/>
                <polygon points="180,45 225,95 180,105" fill="#ef4444"/>
                <polygon points="180,165 135,95 180,105" fill="#ef4444"/>
                <line x1="180" y1="45" x2="180" y2="165" stroke="#1e293b" stroke-width="2"/>
                <line x1="135" y1="95" x2="225" y2="95" stroke="#1e293b" stroke-width="2"/>
                <!-- Ruban flottant -->
                <path d="M180 165 Q215 195 245 170 Q265 150 250 210" fill="none" stroke="#ef4444" stroke-width="4"/>
            </svg>`,
            anchors: [
                { id: "G", label: "Centre G du cerf-volant", x: 180, y: 105 },
                { id: "contact_fil", label: "Point d'attache du fil", x: 165, y: 125 }
            ],
            availableForces: [
                { id: "P", label: "P (Terre/CV)", color: "#dc2626" },
                { id: "F_fil", label: "F_fil/CV", color: "#16a34a" },
                { id: "F_vent", label: "F_vent/CV", color: "#2563eb" }
            ],
            expectedVectors: [
                {
                    id: "P", anchor: "G", angle: 90, tol: 15,
                    hintAnchor: "Le poids s'applique au centre de gravité G du cerf-volant.",
                    hintDir: "Le poids P est vertical vers le bas."
                },
                {
                    id: "F_fil", anchor: "contact_fil", angle: 139, tol: 22,
                    hintAnchor: "Le fil agit à son point d'attache sur le cerf-volant.",
                    hintDir: "Le fil tire le cerf-volant le long du fil, vers le bas et la gauche (vers la main de l'enfant) !"
                },
                {
                    id: "F_vent", anchor: "G", angle: -45, tol: 35,
                    hintAnchor: "La force pressante du vent s'applique au centre de la surface du cerf-volant (confondu ici avec G).",
                    hintDir: "Le vent pousse le cerf-volant vers le haut et la droite pour le maintenir en vol !"
                }
            ]
        }
    }
};
