/* --- data.js --- */

// ==========================================
// 1. ILLUSTRATIONS VECTORIELLES (SVG AUTONOMES)
// ==========================================
const SCENE_SVGS = {
    // --- TENNIS ---
    tennis_air: `<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-tennis-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#dbeafe"/>
                <stop offset="100%" stop-color="#f8fafc"/>
            </linearGradient>
        </defs>
        <rect width="320" height="220" fill="url(#grad-tennis-sky)"/>
        <!-- Trajectoire de la balle -->
        <path d="M35,112 Q65,84 85,78" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,4"/>
        <!-- Raquette (sans contact avec la balle) -->
        <g transform="translate(222, 84) rotate(18)">
            <ellipse cx="0" cy="0" rx="28" ry="38" fill="rgba(255,255,255,0.45)" stroke="#334155" stroke-width="5"/>
            <path d="M-21,-22 L21,-22 M-26,-10 L26,-10 M-27,2 L27,2 M-25,14 L25,14 M-20,25 L20,25 M-14,-33 L-14,33 M0,-37 L0,37 M14,-33 L14,33" stroke="#94a3b8" stroke-width="1.2"/>
            <path d="M-11,36 L-3,60 L3,60 L11,36" fill="none" stroke="#334155" stroke-width="4" stroke-linejoin="round"/>
            <rect x="-4.5" y="59" width="9" height="36" fill="#b45309" stroke="#78350f" stroke-width="1.5" rx="2"/>
        </g>
        <!-- Balle de tennis -->
        <g transform="translate(102, 74)">
            <circle cx="0" cy="0" r="20" fill="#bef264" stroke="#65a30d" stroke-width="2.5"/>
            <path d="M-14,-14 Q-2,0 -14,14 M14,-14 Q2,0 14,14" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round"/>
        </g>
        <text x="160" y="206" text-anchor="middle" fill="#334155" font-size="12" font-weight="bold">Balle en l'air (avant la frappe)</text>
    </svg>`,

    tennis_impact: `<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="220" fill="#1e293b"/>
        <!-- Lignes de vitesse de la frappe vers la gauche -->
        <path d="M232,76 L278,76 M240,100 L290,100 M232,124 L274,124" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="8,5" stroke-linecap="round" opacity="0.75"/>
        <!-- Profil du tamis de la raquette + cordage déformé -->
        <g transform="translate(196, 100)">
            <!-- Cadre profil -->
            <rect x="-5" y="-56" width="10" height="112" rx="5" fill="#d97706" stroke="#f59e0b" stroke-width="2"/>
            <!-- Cordage tendu et légèrement enfoncé au contact -->
            <path d="M-5,-48 L-5,-22 Q4,0 -5,22 L-5,48" fill="none" stroke="#e2e8f0" stroke-width="2.5"/>
            <path d="M-4,-34 L4,-34 M-2,-16 L4,-16 M2,0 L4,0 M-2,16 L4,16 M-4,34 L4,34" stroke="#cbd5e1" stroke-width="1.4"/>
            <!-- Manche -->
            <rect x="-4" y="56" width="8" height="28" rx="2" fill="#b45309" stroke="#f59e0b" stroke-width="1.5"/>
        </g>
        <!-- Balle légèrement écrasée au contact du cordage -->
        <g transform="translate(169, 100)">
            <ellipse cx="0" cy="0" rx="22" ry="25" fill="#bef264" stroke="#65a30d" stroke-width="2.5"/>
            <path d="M-13,-18 Q-1,0 -13,18 M12,-18 Q1,0 12,18" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </g>
        <!-- Éclats d'impact -->
        <path d="M188,68 L178,56 M188,132 L178,144" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
        <text x="160" y="206" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="bold">Impact : la raquette frappe la balle vers la gauche</text>
    </svg>`,

    tennis_sol: `<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="145" fill="#fef3c7"/>
        <rect y="145" width="320" height="75" fill="#c2410c"/>
        <line x1="0" y1="145" x2="320" y2="145" stroke="#9a3412" stroke-width="2"/>
        <line x1="0" y1="168" x2="320" y2="156" stroke="white" stroke-width="5" opacity="0.85"/>
        <ellipse cx="160" cy="147" rx="22" ry="5.5" fill="rgba(0,0,0,0.32)"/>
        <g transform="translate(160, 125)">
            <circle cx="0" cy="0" r="21" fill="#bef264" stroke="#65a30d" stroke-width="2.5"/>
            <path d="M-14,-14 Q-2,0 -14,14 M14,-14 Q2,0 14,14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </g>
        <text x="160" y="206" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Balle immobile posée sur la terre battue</text>
    </svg>`,

    // --- HANDBALL ---
    hand_passe: `<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="220" fill="#eff6ff"/>
        <!-- Maillot / épaule + avant-bras -->
        <path d="M20,175 L78,132 L134,102" fill="none" stroke="#1d4ed8" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M78,132 L138,100" fill="none" stroke="#fdba74" stroke-width="18" stroke-linecap="round"/>
        <!-- Main et doigts en contact avec le ballon -->
        <path d="M132,90 C142,78 158,74 166,80 M138,98 C148,92 158,92 164,96 M136,108 C146,108 156,112 162,116" fill="none" stroke="#ea580c" stroke-width="5.5" stroke-linecap="round"/>
        <circle cx="140" cy="100" r="11" fill="#fdba74"/>
        <!-- Ballon de handball -->
        <g transform="translate(182, 98)">
            <circle cx="0" cy="0" r="25" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5"/>
            <polygon points="0,-10 9,-3 6,8 -6,8 -9,-3" fill="#1d4ed8" opacity="0.55"/>
            <path d="M0,-25 L0,-10 M22,-10 L9,-3 M15,20 L6,8 M-15,20 L-6,8 M-22,-10 L-9,-3" stroke="#93c5fd" stroke-width="2"/>
        </g>
        <!-- Flèche discrète de poussée -->
        <path d="M216,90 L250,82 M220,104 L258,98" stroke="#60a5fa" stroke-width="2.5" stroke-dasharray="5,4" stroke-linecap="round"/>
        <text x="160" y="206" text-anchor="middle" fill="#1e3a8a" font-size="11.5" font-weight="bold">Nikola Karabatic pousse le ballon pour faire sa passe</text>
    </svg>`,

    hand_air: `<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="172" fill="#eff6ff"/>
        <rect y="172" width="320" height="48" fill="#fde68a"/>
        <line x1="0" y1="172" x2="320" y2="172" stroke="#d97706" stroke-width="2"/>
        <path d="M72,82 L134,82 M58,98 L128,98 M78,114 L134,114" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6,4" stroke-linecap="round"/>
        <g transform="translate(178, 96)">
            <circle cx="0" cy="0" r="25" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5"/>
            <polygon points="0,-10 9,-3 6,8 -6,8 -9,-3" fill="#1d4ed8" opacity="0.55"/>
            <path d="M0,-25 L0,-10 M22,-10 L9,-3 M15,20 L6,8 M-15,20 L-6,8 M-22,-10 L-9,-3" stroke="#93c5fd" stroke-width="2"/>
        </g>
        <text x="160" y="204" text-anchor="middle" fill="#78350f" font-size="11.5" font-weight="bold">Le ballon vole dans les airs (entre les deux joueurs)</text>
    </svg>`,

    hand_sol: `<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="150" fill="#eff6ff"/>
        <rect y="150" width="320" height="70" fill="#fcd34d"/>
        <line x1="0" y1="150" x2="320" y2="150" stroke="#b45309" stroke-width="3"/>
        <ellipse cx="160" cy="152" rx="24" ry="5" fill="rgba(0,0,0,0.25)"/>
        <g transform="translate(160, 125)">
            <circle cx="0" cy="0" r="25" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5"/>
            <polygon points="0,-10 9,-3 6,8 -6,8 -9,-3" fill="#1d4ed8" opacity="0.55"/>
            <path d="M0,-25 L0,-10 M22,-10 L9,-3 M15,20 L6,8 M-15,20 L-6,8 M-22,-10 L-9,-3" stroke="#93c5fd" stroke-width="2"/>
        </g>
        <text x="160" y="204" text-anchor="middle" fill="#78350f" font-size="11.5" font-weight="bold">Le ballon est posé sur le parquet du gymnase</text>
    </svg>`,

    // --- NIVEAU VERT (6 CARTES) ---
    vert_orbite: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="grad-sun" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fef08a"/>
                <stop offset="65%" stop-color="#f59e0b"/>
                <stop offset="100%" stop-color="#ea580c"/>
            </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#0f172a"/>
        <!-- Étoiles -->
        <circle cx="32" cy="28" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="115" cy="22" r="1.2" fill="white" opacity="0.6"/>
        <circle cx="165" cy="175" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="290" cy="160" r="1.2" fill="white" opacity="0.8"/>
        <circle cx="48" cy="172" r="1" fill="white" opacity="0.5"/>
        <!-- Orbite passant par la Terre -->
        <ellipse cx="215" cy="95" rx="145" ry="72" fill="none" stroke="#475569" stroke-dasharray="5,5" stroke-width="1.8"/>
        <!-- Soleil -->
        <circle cx="235" cy="78" r="36" fill="url(#grad-sun)" stroke="#fde047" stroke-width="2.5"/>
        <!-- Terre -->
        <g transform="translate(88, 128)">
            <circle cx="0" cy="0" r="18" fill="#2563eb" stroke="#93c5fd" stroke-width="2"/>
            <path d="M-8,-10 Q2,-4 -4,6 Q-10,4 -8,-10 Z M5,-4 Q12,0 9,10 Q2,8 5,-4 Z" fill="#22c55e"/>
        </g>
        <text x="88" y="164" text-anchor="middle" fill="#93c5fd" font-size="12" font-weight="bold">Terre</text>
        <text x="235" y="132" text-anchor="middle" fill="#fde047" font-size="12" font-weight="bold">Soleil</text>
    </svg>`,

    vert_plume: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#e0f2fe"/>
        <!-- Main tenant le bâton à droite -->
        <path d="M250,48 L305,48" stroke="#fdba74" stroke-width="18" stroke-linecap="round"/>
        <circle cx="252" cy="48" r="11" fill="#fdba74" stroke="#ea580c" stroke-width="1.5"/>
        <!-- Bâton électrisé -->
        <rect x="115" y="38" width="138" height="20" rx="5" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
        <text x="180" y="52" text-anchor="middle" fill="#dc2626" font-size="12" font-weight="bold">+   +   +   +</text>
        <!-- Petits traits d'attraction à distance -->
        <path d="M140,64 L132,80 M158,64 L152,78" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,3"/>
        <!-- Plume -->
        <g transform="translate(120, 114) rotate(-32)">
            <path d="M-40,0 Q-10,-16 36,0 Q-10,16 -40,0 Z" fill="white" stroke="#475569" stroke-width="1.6"/>
            <line x1="-48" y1="0" x2="36" y2="0" stroke="#64748b" stroke-width="1.8"/>
            <path d="M-18,-6 L-12,0 M-4,-8 L2,0 M12,-6 L18,0 M-18,6 L-12,0 M-4,8 L2,0 M12,6 L18,0" stroke="#cbd5e1" stroke-width="1.2"/>
        </g>
        <text x="160" y="185" text-anchor="middle" fill="#1e293b" font-size="11.5" font-weight="bold">Plume attirée sans contact par un bâton électrisé</text>
    </svg>`,

    vert_kite: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="142" fill="#bae6fd"/>
        <rect y="142" width="320" height="58" fill="#0284c7"/>
        <!-- Vagues / écume -->
        <path d="M0,142 Q25,137 50,142 T100,142 T150,142 T200,142 T250,142 T300,142 T320,142" fill="none" stroke="#e0f2fe" stroke-width="2.5"/>
        <!-- Aile de kitesurf -->
        <path d="M218,32 Q265,12 292,52 Q268,46 254,64 Q244,44 218,32 Z" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <!-- Lignes vers le manche (barre) -->
        <line x1="168" y1="90" x2="225" y2="38" stroke="#475569" stroke-width="1.3"/>
        <line x1="168" y1="90" x2="255" y2="62" stroke="#475569" stroke-width="1.3"/>
        <!-- Manche / barre -->
        <line x1="162" y1="82" x2="174" y2="98" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
        <!-- Planche -->
        <path d="M88,139 Q122,144 158,136 L154,145 Q120,151 86,145 Z" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
        <!-- Kitesurfeuse -->
        <circle cx="122" cy="74" r="9" fill="#1e293b"/>
        <path d="M122,84 L118,112 L106,138 M118,112 L138,137 M121,92 L166,90" fill="none" stroke="#15803d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="160" y="186" text-anchor="middle" fill="white" font-size="11.5" font-weight="bold">Kitesurfeuse sur sa planche tirée par sa voile</text>
    </svg>`,

    vert_trombone: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#f1f5f9"/>
        <!-- Potence / support -->
        <rect x="28" y="25" width="8" height="135" fill="#475569" rx="2"/>
        <rect x="18" y="156" width="42" height="8" fill="#475569" rx="2"/>
        <!-- Aimant droit (S + N) -->
        <rect x="36" y="80" width="32" height="24" fill="#2563eb" stroke="#1e3a8a" stroke-width="2"/>
        <rect x="68" y="80" width="32" height="24" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
        <text x="52" y="96" text-anchor="middle" fill="white" font-size="11" font-weight="bold">S</text>
        <text x="84" y="96" text-anchor="middle" fill="white" font-size="11" font-weight="bold">N</text>
        <!-- Traits d'attraction magnétique -->
        <path d="M105,86 L120,86 M105,98 L120,98" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,3"/>
        <!-- Trombone réaliste -->
        <path d="M126,90 L156,90 A5,5 0 0,1 156,100 L132,100 A3.5,3.5 0 0,1 132,93 L150,93" fill="none" stroke="#475569" stroke-width="2.6" stroke-linecap="round"/>
        <!-- Élastique tendu -->
        <path d="M161,95 L242,84 M161,95 L242,106" fill="none" stroke="#ea580c" stroke-width="2.5"/>
        <!-- Main à droite tenant l'élastique -->
        <path d="M244,95 L302,95" stroke="#fdba74" stroke-width="20" stroke-linecap="round"/>
        <circle cx="246" cy="95" r="12" fill="#fdba74" stroke="#ea580c" stroke-width="1.5"/>
        <text x="160" y="185" text-anchor="middle" fill="#334155" font-size="11" font-weight="bold">Trombone attiré par l'aimant, retenu par un élastique</text>
    </svg>`,

    vert_iceberg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="92" fill="#bae6fd"/>
        <rect y="92" width="320" height="108" fill="#0369a1"/>
        <!-- Partie émergée -->
        <polygon points="106,92 132,40 162,60 186,34 214,92" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <polygon points="162,60 186,34 214,92 174,92" fill="#e2e8f0"/>
        <!-- Partie immergée -->
        <polygon points="106,92 92,140 144,168 198,154 214,92" fill="#7dd3fc" opacity="0.65" stroke="#38bdf8" stroke-width="1.5"/>
        <!-- Ligne de flottaison -->
        <path d="M0,92 Q40,88 80,92 T160,92 T240,92 T320,92" fill="none" stroke="#e0f2fe" stroke-width="2.5"/>
        <text x="160" y="188" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Un iceberg flottant sur l'océan</text>
    </svg>`,

    vert_balancoire: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#e0f2fe"/>
        <!-- Cordes -->
        <line x1="122" y1="8" x2="122" y2="132" stroke="#78350f" stroke-width="3"/>
        <line x1="198" y1="8" x2="198" y2="132" stroke="#78350f" stroke-width="3"/>
        <!-- Planche -->
        <rect x="112" y="132" width="96" height="10" rx="3" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
        <!-- Personnage assis -->
        <circle cx="160" cy="64" r="13" fill="#334155"/>
        <!-- Torse -->
        <line x1="160" y1="78" x2="160" y2="126" stroke="#1d4ed8" stroke-width="14" stroke-linecap="round"/>
        <!-- Bras tenant les cordes -->
        <path d="M153,90 L122,102 M167,90 L198,102" stroke="#1d4ed8" stroke-width="6.5" stroke-linecap="round" fill="none"/>
        <!-- Jambes devant la planche -->
        <path d="M152,130 L146,162 M168,130 L174,162" stroke="#1e293b" stroke-width="7.5" stroke-linecap="round" fill="none"/>
        <text x="160" y="188" text-anchor="middle" fill="#1e293b" font-size="12" font-weight="bold">Jeune homme assis sur une balançoire</text>
    </svg>`,

    // --- 6 SCHÉMAS CLASSIQUES (JAUNE & ORANGE) ---
    schema_1_lampe: `<svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">
        <line x1="105" y1="35" x2="255" y2="35" stroke="#1e293b" stroke-width="3"/>
        <path d="M115,35 L125,20 M140,35 L150,20 M165,35 L175,20 M190,35 L200,20 M215,35 L225,20 M240,35 L250,20" stroke="#64748b" stroke-width="2"/>
        <text x="262" y="39" fill="#475569" font-size="13">plafond</text>
        <line x1="180" y1="35" x2="180" y2="110" stroke="#1e293b" stroke-width="2.5"/>
        <text x="192" y="78" fill="#475569" font-size="13">fil</text>
        <!-- Douille + abat-jour + ampoule -->
        <rect x="172" y="108" width="16" height="10" rx="2" fill="#475569"/>
        <circle cx="180" cy="158" r="11" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
        <path d="M126,158 A54,42 0 0,1 234,158 Z" fill="#fef08a" stroke="#1e293b" stroke-width="2.5"/>
        <text x="246" y="152" fill="#1e293b" font-size="14" font-weight="bold">lampe</text>
        <text x="180" y="236" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : la lampe</text>
    </svg>`,

    schema_2_livre_table: `<svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">
        <!-- Table -->
        <rect x="65" y="138" width="215" height="13" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="92" y="151" width="12" height="62" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="240" y="151" width="12" height="62" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
        <text x="288" y="149" fill="#475569" font-size="13">table</text>
        <!-- Livre -->
        <rect x="122" y="98" width="102" height="40" rx="2" fill="#94a3b8" stroke="#1e293b" stroke-width="2.5"/>
        <rect x="126" y="103" width="94" height="30" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <line x1="126" y1="113" x2="220" y2="113" stroke="#cbd5e1" stroke-width="1.2"/>
        <line x1="126" y1="123" x2="220" y2="123" stroke="#cbd5e1" stroke-width="1.2"/>
        <rect x="122" y="98" width="12" height="40" fill="#475569" stroke="#1e293b" stroke-width="2"/>
        <text x="173" y="86" text-anchor="middle" fill="#1e293b" font-size="14" font-weight="bold">livre</text>
        <text x="180" y="240" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : le livre</text>
    </svg>`,

    schema_3_pomme: `<svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">
        <path d="M135,40 L135,68 M165,30 L165,58 M195,40 L195,68" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <g transform="translate(165, 132)">
            <path d="M0,-35 C-25,-50 -45,-25 -40,5 C-35,35 -15,45 0,35 C15,45 35,35 40,5 C45,-25 25,-50 0,-35 Z" fill="#fca5a5" stroke="#1e293b" stroke-width="2.5"/>
            <path d="M0,-35 L5,-55" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
            <path d="M3,-48 Q20,-58 25,-45 Q12,-38 3,-48 Z" fill="#86efac" stroke="#1e293b" stroke-width="1.5"/>
        </g>
        <text x="224" y="124" fill="#1e293b" font-size="13">pomme en</text>
        <text x="224" y="142" fill="#1e293b" font-size="13">chute libre</text>
        <text x="180" y="236" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : la pomme</text>
    </svg>`,

    schema_4_clou: `<svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">
        <line x1="50" y1="38" x2="135" y2="38" stroke="#1e293b" stroke-width="3"/>
        <path d="M60,38 L70,23 M85,38 L95,23 M110,38 L120,23" stroke="#64748b" stroke-width="2"/>
        <!-- Fil incliné -->
        <line x1="90" y1="38" x2="156" y2="100" stroke="#1e293b" stroke-width="2.5"/>
        <text x="134" y="66" fill="#475569" font-size="13">fil</text>
        <!-- Clou bien visible -->
        <line x1="147" y1="110" x2="165" y2="90" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
        <polygon points="154,103 158,97 204,138 197,140" fill="#64748b" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
        <text x="185" y="92" fill="#1e293b" font-size="14" font-weight="bold">clou</text>
        <!-- Aimant N/S -->
        <rect x="234" y="114" width="38" height="26" fill="#ef4444" stroke="#1e293b" stroke-width="2"/>
        <rect x="272" y="114" width="38" height="26" fill="#3b82f6" stroke="#1e293b" stroke-width="2"/>
        <text x="253" y="131" text-anchor="middle" fill="white" font-size="11" font-weight="bold">N</text>
        <text x="291" y="131" text-anchor="middle" fill="white" font-size="11" font-weight="bold">S</text>
        <text x="272" y="106" text-anchor="middle" fill="#1e293b" font-size="14" font-weight="bold">aimant</text>
        <text x="180" y="236" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : le clou</text>
    </svg>`,

    schema_5_ressort: `<svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">
        <line x1="130" y1="30" x2="230" y2="30" stroke="#1e293b" stroke-width="3"/>
        <path d="M145,30 L155,15 M175,30 L185,15 M205,30 L215,15" stroke="#64748b" stroke-width="2"/>
        <polyline points="180,30 180,45 165,53 195,65 165,77 195,89 165,101 195,113 180,121 180,135" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>
        <text x="210" y="87" fill="#475569" font-size="13">ressort</text>
        <circle cx="180" cy="157" r="22" fill="#cbd5e1" stroke="#1e293b" stroke-width="2.5"/>
        <text x="214" y="162" fill="#1e293b" font-size="14" font-weight="bold">solide</text>
        <text x="180" y="236" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : le solide</text>
    </svg>`,

    schema_6_livre_air: `<svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">
        <path d="M105,165 L105,195 M135,175 L135,205 M165,165 L165,195" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <g transform="translate(135, 110) rotate(-30)">
            <rect x="-40" y="-25" width="80" height="50" rx="2" fill="#94a3b8" stroke="#1e293b" stroke-width="2.5"/>
            <rect x="-32" y="-21" width="68" height="42" fill="#f8fafc"/>
            <rect x="-40" y="-25" width="10" height="50" fill="#475569" stroke="#1e293b" stroke-width="2"/>
        </g>
        <text x="206" y="88" fill="#1e293b" font-size="12.5">livre lancé en l'air</text>
        <text x="206" y="106" fill="#1e293b" font-size="12.5">par un élève excédé</text>
        <text x="206" y="126" fill="#dc2626" font-size="12.5" font-weight="bold">(en train de monter ↑)</text>
        <text x="180" y="236" text-anchor="middle" fill="#0f172a" font-size="14" font-weight="bold">Système : le livre</text>
    </svg>`,

    // --- NIVEAU ROUGE (SKIEUR & CERF-VOLANT) ---
    rouge_skieur: `<svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="230" fill="#e0f2fe"/>
        <!-- Pente enneigée -->
        <polygon points="0,230 0,212 360,72 360,230" fill="#ffffff"/>
        <line x1="0" y1="212" x2="360" y2="72" stroke="#64748b" stroke-width="3"/>
        <!-- Câble aérien du tire-fesse (parallèle à la pente) -->
        <line x1="0" y1="112" x2="360" y2="-28" stroke="#475569" stroke-width="2.5" stroke-dasharray="6,3"/>
        <!-- Perche du tire-fesse reliée au câble et au skieur -->
        <line x1="258" y1="12" x2="188" y2="108" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="258" cy="12" r="4" fill="#dc2626"/>
        <text x="270" y="28" fill="#dc2626" font-size="12" font-weight="bold">Tire-fesse</text>
        <!-- Skieur aligné sur la pente (-21.25°) -->
        <g transform="translate(178, 142) rotate(-21.25)">
            <!-- Skis posés sur la neige -->
            <line x1="-42" y1="-2" x2="48" y2="-2" stroke="#2563eb" stroke-width="5.5" stroke-linecap="round"/>
            <path d="M48,-2 Q56,-4 58,-10" fill="none" stroke="#2563eb" stroke-width="4.5" stroke-linecap="round"/>
            <!-- Jambes et buste -->
            <polyline points="-6,-4 6,-26 -6,-48 2,-74" fill="none" stroke="#1e293b" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Bras tenant la perche -->
            <line x1="1" y1="-64" x2="26" y2="-40" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>
            <!-- Tête -->
            <circle cx="4" cy="-88" r="10.5" fill="#1e293b"/>
        </g>
        <text x="250" y="212" text-anchor="middle" fill="#475569" font-size="11.5" font-weight="bold">Pente enneigée (sans frottements)</text>
    </svg>`,

    rouge_cerfvolant: `<svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="195" fill="#e0f2fe"/>
        <rect y="195" width="360" height="35" fill="#86efac"/>
        <line x1="0" y1="195" x2="360" y2="195" stroke="#16a34a" stroke-width="2"/>
        <!-- Lignes de vent -->
        <path d="M24,52 Q52,44 82,52 M36,74 Q64,66 94,74 M20,96 Q48,88 78,96" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>
        <text x="56" y="38" text-anchor="middle" fill="#0284c7" font-size="11.5" font-weight="bold">Vent →</text>
        <!-- Enfant au sol tenant le fil -->
        <circle cx="82" cy="134" r="11" fill="#fdba74" stroke="#1e293b" stroke-width="1.8"/>
        <path d="M82,146 L82,174 L70,196 M82,174 L94,196 M82,154 L112,142" stroke="#be185d" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Fil tendu -->
        <path d="M112,142 Q178,116 238,68" fill="none" stroke="#334155" stroke-width="2"/>
        <!-- Cerf-volant -->
        <g transform="translate(238, 68) rotate(12)">
            <polygon points="0,-34 28,0 0,38 -28,0" fill="#3b82f6" stroke="#1e293b" stroke-width="2"/>
            <polygon points="0,-34 28,0 0,0" fill="#ef4444"/>
            <polygon points="0,38 -28,0 0,0" fill="#ef4444"/>
            <line x1="0" y1="-34" x2="0" y2="38" stroke="#1e293b" stroke-width="1.5"/>
            <line x1="-28" y1="0" x2="28" y2="0" stroke="#1e293b" stroke-width="1.5"/>
            <!-- Queue flottant dans le vent vers la droite -->
            <path d="M0,38 Q22,52 44,44 Q64,36 82,50" fill="none" stroke="#ef4444" stroke-width="2.8" stroke-linecap="round"/>
            <polygon points="28,48 34,43 34,53" fill="#fde047"/>
            <polygon points="56,42 62,37 62,47" fill="#fde047"/>
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
        title: "Niveau Bleu — Balle de tennis avant la frappe",
        svg: "tennis_air",
        receveur: "la balle",
        airNeglected: true,
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Raquette", label: "🎾 La raquette", valid: false, prep: "de la raquette", trapMsg: "Observe bien l'image : la balle touche-t-elle déjà le cordage de la raquette ?" },
            { id: "Nadal", label: "🏃 Rafael Nadal", valid: false, prep: "de Rafael Nadal", trapMsg: "Nadal tient sa raquette, mais il ne touche pas la balle !" },
            { id: "Sol", label: "🟫 Le sol", valid: false, prep: "du sol", trapMsg: "La balle est en l'air, elle ne touche pas le sol." }
        ]
    },
    {
        id: "b_2",
        title: "Niveau Bleu — Balle de tennis au moment de l'impact",
        svg: "tennis_impact",
        receveur: "la balle",
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Raquette", label: "🎾 La raquette", valid: true, type: "contact", prep: "de la raquette" },
            { id: "Sol", label: "🟫 Le sol", valid: false, prep: "du sol", trapMsg: "La balle est dans le tamis de la raquette, pas sur le sol." }
        ]
    },
    {
        id: "b_3",
        title: "Niveau Bleu — Balle de tennis immobile sur le court",
        svg: "tennis_sol",
        receveur: "la balle",
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Sol", label: "🟫 Le sol", valid: true, type: "contact", prep: "du sol" },
            { id: "Raquette", label: "🎾 La raquette", valid: false, prep: "de la raquette", trapMsg: "La raquette n'est plus en contact avec la balle." }
        ]
    },
    {
        id: "b_4",
        title: "Niveau Bleu — Nikola Karabatic touche le ballon pour faire une passe",
        svg: "hand_passe",
        receveur: "le ballon",
        evalMode: true,
        candidates: [
            { id: "Main", label: "✋ La main (Nikola)", valid: true, type: "contact", prep: "de Nikola" },
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Sol", label: "🟫 Le sol", valid: false, prep: "du sol", trapMsg: "Le ballon est en hauteur dans la main du joueur, il ne touche pas le sol." }
        ]
    },
    {
        id: "b_5",
        title: "Niveau Bleu — Le ballon vole dans les airs pendant la passe",
        svg: "hand_air",
        receveur: "le ballon",
        evalMode: true,
        airNeglected: true,
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Main", label: "✋ La main (Nikola)", valid: false, prep: "de Nikola", trapMsg: "Piège classique ! Une fois que le ballon a quitté la main, la main n'agit plus sur lui." },
            { id: "Sol", label: "🟫 Le sol", valid: false, prep: "du sol", trapMsg: "Le ballon est en plein vol." }
        ]
    },
    {
        id: "b_6",
        title: "Niveau Bleu — Le ballon de handball est posé au sol",
        svg: "hand_sol",
        receveur: "le ballon",
        evalMode: true,
        paperNotice: "📝 Une fois validé à l'écran, recopie cette situation sur ta fiche papier (Trace écrite Niveau Bleu) !",
        candidates: [
            { id: "Terre", label: "🌍 La Terre", valid: true, type: "distance", prep: "de la Terre" },
            { id: "Sol", label: "🟫 Le sol", valid: true, type: "contact", prep: "du sol" },
            { id: "Main", label: "✋ La main (Nikola)", valid: false, prep: "de Nikola", trapMsg: "Personne ne touche le ballon ici." }
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
            { id: "Comete", label: "☄️ Une comète très lointaine", expected: "none" }
        ]
    },
    {
        id: "v_2",
        title: "2. Plume et bâton électrisé",
        svg: "vert_plume",
        receveur: "La plume",
        airNeglected: true,
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
        airNeglected: true,
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
        title: "Niveau Jaune — Nikola touche le ballon pour faire sa passe",
        svg: "hand_passe",
        systeme: "Ballon",
        pool: ["Main (Nikola)", "Terre", "Sol", "Panneau de but"],
        expected: { "Main (Nikola)": "contact", "Terre": "distance" }
    },
    {
        id: "j_2",
        title: "Niveau Jaune — Le ballon est en vol pendant la passe",
        svg: "hand_air",
        systeme: "Ballon",
        airNeglected: true,
        pool: ["Terre", "Main (Nikola)", "Sol"],
        expected: { "Terre": "distance" }
    },
    {
        id: "j_3",
        title: "Niveau Jaune — Le ballon est posé au sol",
        svg: "hand_sol",
        systeme: "Ballon",
        pool: ["Terre", "Sol", "Main (Nikola)"],
        expected: { "Terre": "distance", "Sol": "contact" }
    },
    {
        id: "j_4",
        title: "Niveau Jaune — 1°/ Lampe suspendue au plafond par un fil",
        svg: "schema_1_lampe",
        systeme: "Lampe",
        pool: ["Fil", "Terre", "Plafond", "Interrupteur"],
        expected: { "Fil": "contact", "Terre": "distance" },
        trapHint: "Attention : le plafond touche le fil, mais ne touche pas directement la lampe !"
    },
    {
        id: "j_5",
        title: "Niveau Jaune — 2°/ Livre posé sur une table",
        svg: "schema_2_livre_table",
        systeme: "Livre",
        pool: ["Table", "Terre", "Sol"],
        expected: { "Table": "contact", "Terre": "distance" },
        trapHint: "Le sol soutient la table, mais ne touche pas le livre."
    },
    {
        id: "j_6",
        title: "Niveau Jaune — 3°/ Pomme qui tombe de l'arbre (chute libre)",
        svg: "schema_3_pomme",
        systeme: "Pomme",
        airNeglected: true,
        pool: ["Terre", "Branche de l'arbre", "Herbe"],
        expected: { "Terre": "distance" },
        trapHint: "La pomme s'est déjà détachée de la branche et n'a pas encore touché l'herbe."
    },
    {
        id: "j_7",
        title: "Niveau Jaune — 4°/ Clou suspendu à un fil et dévié par un aimant",
        svg: "schema_4_clou",
        systeme: "Clou",
        pool: ["Fil", "Terre", "Aimant", "Plafond"],
        expected: { "Fil": "contact", "Terre": "distance", "Aimant": "distance" },
        paperNotice: "📝 Reproduis aussi ce D.O.I (4°/ Le clou) sur ta fiche papier d'accompagnement !"
    },
    {
        id: "j_8",
        title: "Niveau Jaune — 5°/ Solide suspendu à un ressort",
        svg: "schema_5_ressort",
        systeme: "Solide",
        pool: ["Ressort", "Terre", "Plafond"],
        expected: { "Ressort": "contact", "Terre": "distance" }
    },
    {
        id: "j_9",
        title: "Niveau Jaune — 6°/ Livre de physique lancé en l'air (en train de monter)",
        svg: "schema_6_livre_air",
        systeme: "Livre",
        airNeglected: true,
        pool: ["Terre", "Élève excédé (main)", "Sol"],
        expected: { "Terre": "distance" },
        trapHint: "Piège classique ! Dès que le livre a quitté la main de l'élève, la main n'exerce plus aucune action sur lui."
    }
];

// --- NIVEAU ORANGE (6 situations unifiées) ---
const ORANGE_DATA = [
    {
        id: "o_1",
        title: "Niveau Orange — Balle de tennis en l'air",
        subtitle: "Valeur donnée : P = 0,56 N. Complétez les caractéristiques et tracez le vecteur force.",
        airNeglected: true,
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
                svgSymbol: "P",
                svgSub: "",
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
        title: "Niveau Orange — Balle frappée par la raquette",
        subtitle: "Valeurs : P = 0,56 N et F<sub>raquette/balle</sub> = 10 N (sans souci d'échelle exacte : la flèche bleue doit être nettement plus longue que la rouge).",
        airNeglected: true,
        anchors: [
            { id: "G", label: "Centre de gravité de la balle", x: 170, y: 130 },
            { id: "ContactDroit", label: "Point de contact avec la raquette", x: 215, y: 130 },
            { id: "Gauche", label: "Bord gauche de la balle", x: 125, y: 130 }
        ],
        modelShape: `<line x1="215" y1="40" x2="215" y2="220" stroke="#d97706" stroke-width="6" stroke-dasharray="8,4"/>
                     <text x="225" y="60" fill="#b45309" font-size="12" font-weight="bold">Cordage</text>
                     <circle cx="170" cy="130" r="45" fill="#bef264" stroke="#65a30d" stroke-width="3"/>
                     <path d="M138,98 Q170,130 138,162 M202,98 Q170,130 202,162" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>`,
        forces: [
            {
                id: "P",
                svgSymbol: "P",
                svgSub: "",
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
                svgSymbol: "F",
                svgSub: "raq/balle",
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
        title: "Niveau Orange — Balle immobile sur le sol",
        subtitle: "La balle est immobile au sol : P = 0,56 N. Déduisez la valeur de F<sub>sol/balle</sub> et tracez deux flèches de même longueur.",
        equalLengthPair: ["P", "Fsol"],
        anchors: [
            { id: "G", label: "Centre de gravité de la balle", x: 180, y: 125 },
            { id: "ContactSol", label: "Point de contact avec le sol", x: 180, y: 170 },
            { id: "Haut", label: "Sommet de la balle", x: 180, y: 80 }
        ],
        modelShape: `<rect x="40" y="170" width="280" height="25" fill="#c2410c"/>
                     <line x1="40" y1="170" x2="320" y2="170" stroke="#7c2d12" stroke-width="3"/>
                     <circle cx="180" cy="125" r="45" fill="#bef264" stroke="#65a30d" stroke-width="3"/>
                     <path d="M148,93 Q180,125 148,157 M212,93 Q180,125 212,157" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>`,
        forces: [
            {
                id: "P",
                svgSymbol: "P",
                svgSub: "",
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
                svgSymbol: "F",
                svgSub: "sol/balle",
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
        title: "Niveau Orange — 1°/ Système : la lampe suspendue",
        subtitle: "La lampe est immobile (en équilibre) : déterminez les caractéristiques des 2 forces et tracez-les avec la même longueur.",
        equalLengthPair: ["P", "Ffil"],
        anchors: [
            { id: "ContactFil", label: "Point de contact avec le fil", x: 180, y: 115 },
            { id: "G", label: "Centre de gravité de la lampe", x: 180, y: 140 },
            { id: "Plafond", label: "Attache au plafond", x: 180, y: 35 }
        ],
        modelShape: `<line x1="110" y1="35" x2="250" y2="35" stroke="#1e293b" stroke-width="3"/>
                     <path d="M120,35 L130,22 M145,35 L155,22 M170,35 L180,22 M195,35 L205,22 M220,35 L230,22" stroke="#64748b" stroke-width="2"/>
                     <line x1="180" y1="35" x2="180" y2="115" stroke="#1e293b" stroke-width="2.5"/>
                     <circle cx="180" cy="155" r="10" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
                     <path d="M125,155 A55,40 0 0,1 235,155 Z" fill="#fef08a" stroke="#1e293b" stroke-width="2.5"/>`,
        forces: [
            {
                id: "P",
                svgSymbol: "P",
                svgSub: "",
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
                svgSymbol: "F",
                svgSub: "fil/lampe",
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
        title: "Niveau Orange — 2°/ Système : le livre sur la table",
        subtitle: "Le livre est immobile (en équilibre) : déterminez les caractéristiques des 2 forces et tracez-les avec la même longueur.",
        equalLengthPair: ["P", "Ftable"],
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
                svgSymbol: "P",
                svgSub: "",
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
                svgSymbol: "F",
                svgSub: "table/livre",
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
        title: "Niveau Orange — 4°/ Système : le clou attiré par l'aimant",
        subtitle: "Cas à 3 forces ! Tracez <span class='vec-arrow'>P</span>, <span class='vec-arrow'>F</span><sub>fil/clou</sub> et <span class='vec-arrow'>F</span><sub>aimant/clou</sub> (par convention, les actions à distance s'appliquent en G), puis reportez-les sur votre fiche papier !",
        paperNotice: "📝 Reproduis les caractéristiques et le tracé des 3 forces du clou (4°/) sur ta fiche papier !",
        anchors: [
            { id: "ContactFil", label: "Point de contact avec le fil", x: 160, y: 102 },
            { id: "G", label: "Centre de gravité du clou", x: 184, y: 123 },
            { id: "Aimant", label: "Centre de l'aimant", x: 282, y: 123 }
        ],
        modelShape: `<line x1="50" y1="35" x2="130" y2="35" stroke="#1e293b" stroke-width="3"/>
                     <path d="M60,35 L70,22 M85,35 L95,22 M110,35 L120,22" stroke="#64748b" stroke-width="2"/>
                     <line x1="85" y1="35" x2="160" y2="102" stroke="#1e293b" stroke-width="2.5"/>
                     <line x1="150" y1="114" x2="170" y2="90" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
                     <polygon points="158,105 162,99 211,143 204,146" fill="#64748b" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
                     <rect x="245" y="111" width="38" height="24" fill="#ef4444" stroke="#1e293b" stroke-width="2"/>
                     <rect x="283" y="111" width="37" height="24" fill="#3b82f6" stroke="#1e293b" stroke-width="2"/>
                     <text x="264" y="127" text-anchor="middle" fill="white" font-size="11" font-weight="bold">N</text>
                     <text x="301" y="127" text-anchor="middle" fill="white" font-size="11" font-weight="bold">S</text>`,
        forces: [
            {
                id: "P",
                svgSymbol: "P",
                svgSub: "",
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
                svgSymbol: "F",
                svgSub: "fil/clou",
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
                svgSymbol: "F",
                svgSub: "aimant/clou",
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
    },
    {
        id: "o_7",
        title: "Niveau Orange — 6°/ Système : le livre lancé en l'air (en train de monter)",
        subtitle: "Piège classique ! Le livre a quitté la main et est en train de monter. Caractérisez et tracez la force qui s'exerce sur lui.",
        airNeglected: true,
        reverseSensHint: "Attention au piège : même si le livre est en train de monter, la Terre l'attire toujours vers le bas !",
        anchors: [
            { id: "G", label: "Centre de gravité du livre", x: 175, y: 115 },
            { id: "Dessous", label: "Dessous du livre", x: 175, y: 155 },
            { id: "Dessus", label: "Dessus du livre", x: 175, y: 75 }
        ],
        modelShape: `<path d="M145,175 L145,205 M175,182 L175,212 M205,175 L205,205" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
                     <g transform="translate(175, 115) rotate(-25)">
                         <rect x="-42" y="-26" width="84" height="52" rx="2" fill="#94a3b8" stroke="#1e293b" stroke-width="2.5"/>
                         <rect x="-32" y="-22" width="70" height="44" fill="#f8fafc"/>
                         <rect x="-42" y="-26" width="11" height="52" fill="#475569" stroke="#1e293b" stroke-width="2"/>
                     </g>
                     <text x="285" y="95" text-anchor="middle" fill="#dc2626" font-size="12" font-weight="bold">Mouvement</text>
                     <text x="285" y="112" text-anchor="middle" fill="#dc2626" font-size="12" font-weight="bold">vers le haut ↑</text>`,
        forces: [
            {
                id: "P",
                svgSymbol: "P",
                svgSub: "",
                htmlLabel: `<span class="force-btn-label"><span class="vec-arrow">P</span> (<span class="vec-arrow">F</span><sub>Terre/livre</sub>)</span>`,
                color: "#dc2626",
                pointOptions: ["Centre de gravité du livre", "Dessous du livre", "Point de contact avec la main"],
                expectedPoint: "Centre de gravité du livre",
                expectedDirection: "verticale",
                expectedSens: "vers le bas",
                expectedAnchor: "G",
                expectedAngle: 90
            }
        ]
    }
];
