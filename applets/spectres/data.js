// Bornes physiques du domaine visible (en nm) selon la convention lycée (400 à 800 nm)
// Définition unique du visible, utilisée pour la couleur, le thermique, le dégradé, la bande et le profil
export const LAMBDA_MIN_VISIBLE = 400;
export const LAMBDA_MAX_VISIBLE = 800;
export const ABS_MIN_NM = 350;
export const ABS_MAX_NM = 850;

// Bornes de température (K), identiques aux attributs min/max des champs HTML
export const TEMP_MIN_K = 1500;
export const TEMP_MAX_K = 12000;
export const TEMP_DEFAULT_K = 5800;

// Base de données vérifiée (NIST ASD / Fraunhofer / Spectrophotométrie UV-Vis / Spectres d'éclairage)
export const PRESETS_DB = {
    // =========================================================================
    // --- ATOMES & IONS ---
    // =========================================================================
    H: {
        category: "Atomes & Ions",
        label: "Hydrogène",
        tag: "H",
        desc: "Hydrogène",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 397.0, w: 1.6, intensity: 0.65, label: "Hε" },
            { lambda: 410.2, w: 1.8, intensity: 0.75, label: "Hδ" },
            { lambda: 434.0, w: 2.0, intensity: 0.85, label: "Hγ" },
            { lambda: 486.1, w: 2.2, intensity: 0.95, label: "Hβ" },
            { lambda: 656.3, w: 2.5, intensity: 1.00, label: "Hα" }
        ]
    },
    He: {
        category: "Atomes & Ions",
        label: "Hélium",
        tag: "He",
        desc: "Hélium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 402.6, w: 1.6, intensity: 0.65, label: "" },
            { lambda: 447.1, w: 1.8, intensity: 0.85, label: "" },
            { lambda: 471.3, w: 1.6, intensity: 0.70, label: "" },
            { lambda: 492.2, w: 1.6, intensity: 0.75, label: "" },
            { lambda: 501.6, w: 2.0, intensity: 0.90, label: "" },
            { lambda: 587.6, w: 2.5, intensity: 1.00, label: "D3" },
            { lambda: 667.8, w: 2.2, intensity: 0.90, label: "" },
            { lambda: 706.5, w: 1.8, intensity: 0.75, label: "" }
        ]
    },
    Na: {
        category: "Atomes & Ions",
        label: "Sodium",
        tag: "Na",
        desc: "Sodium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 589.0, w: 1.8, intensity: 1.00, label: "D2" },
            { lambda: 589.6, w: 1.8, intensity: 0.95, label: "D1" }
        ]
    },
    Hg: {
        category: "Atomes & Ions",
        label: "Mercure",
        tag: "Hg",
        desc: "Mercure",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 404.7, w: 1.8, intensity: 0.85, label: "" },
            { lambda: 435.8, w: 2.2, intensity: 0.95, label: "" },
            { lambda: 491.6, w: 1.5, intensity: 0.55, label: "" },
            { lambda: 546.1, w: 2.5, intensity: 1.00, label: "" },
            { lambda: 577.0, w: 1.8, intensity: 0.85, label: "" },
            { lambda: 579.1, w: 1.8, intensity: 0.85, label: "" }
        ]
    },
    Mg: {
        category: "Atomes & Ions",
        label: "Magnésium",
        tag: "Mg",
        desc: "Magnésium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 383.8, w: 2.2, intensity: 0.85, label: "" },
            { lambda: 457.1, w: 1.8, intensity: 0.60, label: "" },
            { lambda: 516.7, w: 2.0, intensity: 0.85, label: "b4" },
            { lambda: 517.3, w: 2.2, intensity: 0.95, label: "b2" },
            { lambda: 518.4, w: 2.4, intensity: 1.00, label: "b1" }
        ]
    },
    Ca: {
        category: "Atomes & Ions",
        label: "Calcium",
        tag: "Ca",
        desc: "Calcium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 393.4, w: 2.6, intensity: 1.00, label: "K" },
            { lambda: 396.8, w: 2.6, intensity: 1.00, label: "H" },
            { lambda: 422.7, w: 2.2, intensity: 0.95, label: "g" },
            { lambda: 612.2, w: 1.8, intensity: 0.75, label: "" },
            { lambda: 616.2, w: 1.8, intensity: 0.80, label: "" },
            { lambda: 643.9, w: 2.0, intensity: 0.85, label: "" }
        ]
    },
    Fe: {
        category: "Atomes & Ions",
        label: "Fer",
        tag: "Fe",
        desc: "Fer",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 404.6, w: 1.8, intensity: 0.85, label: "" },
            { lambda: 430.8, w: 2.0, intensity: 0.90, label: "G" },
            { lambda: 438.4, w: 2.0, intensity: 0.90, label: "e" },
            { lambda: 495.8, w: 1.8, intensity: 0.80, label: "c" },
            { lambda: 527.0, w: 2.0, intensity: 0.90, label: "E" }
        ]
    },
    Li: {
        category: "Atomes & Ions",
        label: "Lithium",
        tag: "Li",
        desc: "Lithium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 460.3, w: 1.8, intensity: 0.65, label: "" },
            { lambda: 610.4, w: 2.0, intensity: 0.85, label: "" },
            { lambda: 670.8, w: 2.6, intensity: 1.00, label: "" }
        ]
    },
    K: {
        category: "Atomes & Ions",
        label: "Potassium",
        tag: "K",
        desc: "Potassium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 404.4, w: 2.0, intensity: 0.90, label: "" },
            { lambda: 404.7, w: 2.0, intensity: 0.85, label: "" },
            { lambda: 766.5, w: 2.8, intensity: 1.00, label: "" },
            { lambda: 769.9, w: 2.8, intensity: 0.95, label: "" }
        ]
    },
    Rb: {
        category: "Atomes & Ions",
        label: "Rubidium",
        tag: "Rb",
        desc: "Rubidium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 420.2, w: 1.8, intensity: 0.80, label: "" },
            { lambda: 421.6, w: 1.8, intensity: 0.75, label: "" },
            { lambda: 780.0, w: 2.6, intensity: 1.00, label: "" },
            { lambda: 794.8, w: 2.6, intensity: 0.95, label: "" }
        ]
    },
    Cs: {
        category: "Atomes & Ions",
        label: "Césium",
        tag: "Cs",
        desc: "Césium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 455.5, w: 2.2, intensity: 1.00, label: "" },
            { lambda: 459.3, w: 2.0, intensity: 0.85, label: "" }
        ]
    },
    Cu: {
        category: "Atomes & Ions",
        label: "Cuivre",
        tag: "Cu",
        desc: "Cuivre",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 510.6, w: 2.2, intensity: 0.90, label: "" },
            { lambda: 515.3, w: 2.2, intensity: 0.85, label: "" },
            { lambda: 521.8, w: 2.5, intensity: 1.00, label: "" },
            { lambda: 570.0, w: 1.8, intensity: 0.70, label: "" },
            { lambda: 578.2, w: 2.0, intensity: 0.80, label: "" }
        ]
    },
    Sr: {
        category: "Atomes & Ions",
        label: "Strontium",
        tag: "Sr",
        desc: "Strontium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 407.8, w: 2.2, intensity: 0.90, label: "Sr II" },
            { lambda: 421.6, w: 2.0, intensity: 0.85, label: "Sr II" },
            { lambda: 460.7, w: 2.4, intensity: 1.00, label: "Sr I" },
            { lambda: 606.0, w: 8.0, intensity: 0.85, label: "SrOH" },
            { lambda: 671.0, w: 12.0, intensity: 0.90, label: "SrOH" }
        ]
    },
    Ba: {
        category: "Atomes & Ions",
        label: "Baryum",
        tag: "Ba",
        desc: "Baryum",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 455.4, w: 2.0, intensity: 0.80, label: "Ba II" },
            { lambda: 493.4, w: 2.0, intensity: 0.75, label: "Ba II" },
            { lambda: 553.5, w: 2.6, intensity: 1.00, label: "Ba I" },
            { lambda: 512.0, w: 8.0, intensity: 0.65, label: "BaCl" },
            { lambda: 524.0, w: 8.0, intensity: 0.70, label: "BaCl" }
        ]
    },
    Zn: {
        category: "Atomes & Ions",
        label: "Zinc",
        tag: "Zn",
        desc: "Zinc",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 468.0, w: 2.0, intensity: 0.85, label: "" },
            { lambda: 472.2, w: 2.2, intensity: 0.90, label: "" },
            { lambda: 481.1, w: 2.4, intensity: 0.95, label: "" },
            { lambda: 636.2, w: 2.5, intensity: 1.00, label: "" }
        ]
    },
    Ne: {
        category: "Atomes & Ions",
        label: "Néon",
        tag: "Ne",
        desc: "Néon",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 540.1, w: 1.6, intensity: 0.65, label: "" },
            { lambda: 585.2, w: 2.4, intensity: 0.95, label: "" },
            { lambda: 607.4, w: 1.8, intensity: 0.80, label: "" },
            { lambda: 614.3, w: 2.2, intensity: 0.90, label: "" },
            { lambda: 633.4, w: 2.2, intensity: 0.90, label: "" },
            { lambda: 640.2, w: 2.6, intensity: 1.00, label: "" },
            { lambda: 650.7, w: 2.0, intensity: 0.85, label: "" }
        ]
    },
    Ar: {
        category: "Atomes & Ions",
        label: "Argon",
        tag: "Ar",
        desc: "Argon",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 696.5, w: 2.2, intensity: 0.85, label: "" },
            { lambda: 706.7, w: 2.0, intensity: 0.80, label: "" },
            { lambda: 738.4, w: 2.2, intensity: 0.85, label: "" },
            { lambda: 750.4, w: 2.6, intensity: 1.00, label: "" },
            { lambda: 763.5, w: 2.8, intensity: 0.95, label: "" }
        ]
    },
    Cd: {
        category: "Atomes & Ions",
        label: "Cadmium",
        tag: "Cd",
        desc: "Cadmium",
        tagClass: "is-info is-light",
        lines: [
            { lambda: 467.8, w: 2.0, intensity: 0.85, label: "" },
            { lambda: 479.9, w: 2.2, intensity: 0.90, label: "" },
            { lambda: 508.6, w: 2.6, intensity: 1.00, label: "" },
            { lambda: 643.8, w: 2.6, intensity: 0.95, label: "" }
        ]
    },

    // =========================================================================
    // --- ÉTOILES ---
    // =========================================================================
    Star_Soleil: {
        category: "Étoiles",
        label: "Soleil (5800 K)",
        tag: "Soleil",
        desc: "5800 K",
        tagClass: "is-warning is-light",
        temp: 5800,
        lines: [
            { lambda: 393.4, w: 2.6, intensity: 0.95, label: "K" },
            { lambda: 396.8, w: 2.6, intensity: 0.95, label: "H" },
            { lambda: 430.8, w: 2.2, intensity: 0.85, label: "G" },
            { lambda: 486.1, w: 2.2, intensity: 0.90, label: "F" },
            { lambda: 517.3, w: 2.0, intensity: 0.80, label: "b" },
            { lambda: 527.0, w: 1.8, intensity: 0.75, label: "E" },
            { lambda: 589.3, w: 2.4, intensity: 0.95, label: "D" },
            { lambda: 656.3, w: 2.4, intensity: 0.90, label: "C" }
        ]
    },
    Star_Vega: {
        category: "Étoiles",
        label: "Véga / Sirius (9500 K)",
        tag: "Véga / Sirius",
        desc: "9500 K",
        tagClass: "is-warning is-light",
        temp: 9500,
        lines: [
            { lambda: 397.0, w: 3.5, intensity: 0.95, label: "Hε" },
            { lambda: 410.2, w: 3.8, intensity: 0.98, label: "Hδ" },
            { lambda: 434.0, w: 4.0, intensity: 1.00, label: "Hγ" },
            { lambda: 486.1, w: 4.2, intensity: 1.00, label: "Hβ" },
            { lambda: 656.3, w: 4.2, intensity: 1.00, label: "Hα" }
        ]
    },
    Star_Rigel: {
        category: "Étoiles",
        label: "Rigel (12000 K)",
        tag: "Rigel",
        desc: "12000 K",
        tagClass: "is-warning is-light",
        temp: 12000,
        lines: [
            { lambda: 402.6, w: 2.0, intensity: 0.80, label: "He" },
            { lambda: 410.2, w: 2.0, intensity: 0.80, label: "Hδ" },
            { lambda: 434.0, w: 2.2, intensity: 0.85, label: "Hγ" },
            { lambda: 447.1, w: 2.4, intensity: 0.95, label: "He" },
            { lambda: 486.1, w: 2.2, intensity: 0.85, label: "Hβ" },
            { lambda: 587.6, w: 2.4, intensity: 0.90, label: "He" },
            { lambda: 656.3, w: 2.2, intensity: 0.85, label: "Hα" }
        ]
    },
    Star_Arcturus: {
        category: "Étoiles",
        label: "Arcturus (4300 K)",
        tag: "Arcturus",
        desc: "4300 K",
        tagClass: "is-warning is-light",
        temp: 4300,
        lines: [
            { lambda: 393.4, w: 3.2, intensity: 1.00, label: "K" },
            { lambda: 396.8, w: 3.2, intensity: 1.00, label: "H" },
            { lambda: 422.7, w: 2.8, intensity: 0.95, label: "Ca" },
            { lambda: 430.8, w: 2.4, intensity: 0.90, label: "G" },
            { lambda: 517.3, w: 2.4, intensity: 0.85, label: "b" },
            { lambda: 527.0, w: 2.4, intensity: 0.85, label: "Fe" },
            { lambda: 589.3, w: 2.8, intensity: 0.95, label: "Na" },
            { lambda: 656.3, w: 2.0, intensity: 0.70, label: "Hα" }
        ]
    },
    Star_Betelgeuse: {
        category: "Étoiles",
        label: "Bételgeuse (3500 K)",
        tag: "Bételgeuse",
        desc: "3500 K",
        tagClass: "is-warning is-light",
        temp: 3500,
        lines: [
            { lambda: 422.7, w: 3.2, intensity: 0.95, label: "Ca" },
            { lambda: 476.1, w: 12.0, intensity: 0.80, label: "TiO" },
            { lambda: 495.4, w: 14.0, intensity: 0.85, label: "TiO" },
            { lambda: 516.7, w: 16.0, intensity: 0.90, label: "TiO" },
            { lambda: 544.8, w: 15.0, intensity: 0.85, label: "TiO" },
            { lambda: 589.3, w: 3.0, intensity: 0.95, label: "Na" },
            { lambda: 615.9, w: 18.0, intensity: 0.90, label: "TiO" },
            { lambda: 665.8, w: 16.0, intensity: 0.85, label: "TiO" },
            { lambda: 705.4, w: 22.0, intensity: 0.92, label: "TiO" }
        ]
    },

    // =========================================================================
    // --- MOLÉCULES & SOLUTIONS ---
    // =========================================================================
    Atm: {
        category: "Molécules & Solutions",
        label: "Atmosphère terrestre (O₂ / H₂O)",
        tag: "O₂ / H₂O",
        desc: "Atmosphère",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 627.7, w: 8.0, intensity: 0.65, label: "O₂" },
            { lambda: 686.7, w: 12.0, intensity: 0.85, label: "O₂" },
            { lambda: 720.0, w: 18.0, intensity: 0.75, label: "H₂O" },
            { lambda: 759.4, w: 14.0, intensity: 0.95, label: "O₂" }
        ]
    },
    CuSO4: {
        category: "Molécules & Solutions",
        label: "Sulfate de cuivre (Cu²⁺ aq)",
        tag: "Cu²⁺",
        desc: "Sulfate de cuivre",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 800.0, w: 130.0, intensity: 0.95, label: "Cu²⁺ aq" }
        ]
    },
    Diiode: {
        category: "Molécules & Solutions",
        label: "Diiode en solution aqueuse (I₂ / I₃⁻)",
        tag: "I₂",
        desc: "Diiode",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 460.0, w: 75.0, intensity: 0.92, label: "I₃⁻" }
        ]
    },
    KMnO4: {
        category: "Molécules & Solutions",
        label: "Permanganate de potassium (KMnO₄)",
        tag: "KMnO₄",
        desc: "Permanganate",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 526.0, w: 56.0, intensity: 0.96, label: "MnO₄⁻" }
        ]
    },
    BleuPatente: {
        category: "Molécules & Solutions",
        label: "Bleu patenté V (E131)",
        tag: "E131",
        desc: "Bleu patenté V",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 638.0, w: 52.0, intensity: 0.96, label: "E131" }
        ]
    },
    BleuBrillant: {
        category: "Molécules & Solutions",
        label: "Bleu brillant FCF (E133)",
        tag: "E133",
        desc: "Bleu brillant",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 630.0, w: 46.0, intensity: 0.95, label: "E133" }
        ]
    },
    Tartrazine: {
        category: "Molécules & Solutions",
        label: "Tartrazine (E102)",
        tag: "E102",
        desc: "Tartrazine",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 426.0, w: 55.0, intensity: 0.95, label: "E102" }
        ]
    },
    RougeAllura: {
        category: "Molécules & Solutions",
        label: "Rouge allura AC (E129)",
        tag: "E129",
        desc: "Rouge allura",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 504.0, w: 52.0, intensity: 0.94, label: "E129" }
        ]
    },
    ChloroA: {
        category: "Molécules & Solutions",
        label: "Chlorophylle a",
        tag: "Chl a",
        desc: "Chlorophylle a",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 430.0, w: 48.0, intensity: 0.96, label: "Soret" },
            { lambda: 662.0, w: 34.0, intensity: 0.92, label: "Bande Q" }
        ]
    },
    ChloroB: {
        category: "Molécules & Solutions",
        label: "Chlorophylle b",
        tag: "Chl b",
        desc: "Chlorophylle b",
        tagClass: "is-purple-light",
        lines: [
            { lambda: 455.0, w: 46.0, intensity: 0.94, label: "Soret" },
            { lambda: 645.0, w: 36.0, intensity: 0.90, label: "Bande Q" }
        ]
    },

    // =========================================================================
    // --- SOURCES D'ÉCLAIRAGE ---
    // =========================================================================
    Lamp_Fluo: {
        category: "Sources d'éclairage",
        label: "Lampe fluocompacte / Tube fluo",
        tag: "Fluo",
        desc: "Tube fluorescent",
        tagClass: "is-success is-light",
        lines: [
            { lambda: 404.7, w: 2.0, intensity: 0.40, label: "Hg" },
            { lambda: 435.8, w: 2.5, intensity: 0.85, label: "Hg" },
            { lambda: 487.0, w: 6.0, intensity: 0.45, label: "Tb³⁺" },
            { lambda: 542.4, w: 6.0, intensity: 0.80, label: "Tb³⁺" },
            { lambda: 546.1, w: 2.5, intensity: 1.00, label: "Hg" },
            { lambda: 587.0, w: 10.0, intensity: 0.50, label: "Eu³⁺" },
            { lambda: 611.5, w: 7.0, intensity: 0.95, label: "Eu³⁺" }
        ]
    },
    Lamp_LED_Blanche: {
        category: "Sources d'éclairage",
        label: "LED blanche (GaN + Phosphore YAG)",
        tag: "LED",
        desc: "LED blanche",
        tagClass: "is-success is-light",
        lines: [
            { lambda: 452.0, w: 22.0, intensity: 1.00, label: "GaN" },
            { lambda: 565.0, w: 110.0, intensity: 0.70, label: "YAG:Ce" }
        ]
    }
};

export const DEFAULT_STATE = {
    specWidth: 600,
    bandHeight: 60,
    viewMinNm: ABS_MIN_NM,
    viewMaxNm: ABS_MAX_NM,
    showAxis: true,
    showUVIR: true,
    showLineValues: false,
    showProfile: false,
    printMode: false,
    exaggerated: false,
    sharpness: 7,
    tracks: [
        {
            active: true,
            name: "Étoile",
            showName: true,
            mode: "thermal_abs",
            temp: PRESETS_DB.Star_Soleil.temp,
            showTempBadge: true,
            presetKey: "Star_Soleil",
            lines: JSON.parse(JSON.stringify(PRESETS_DB.Star_Soleil.lines))
        },
        {
            active: true,
            name: "Hydrogène",
            showName: true,
            mode: "emission_lines",
            temp: 5800,
            showTempBadge: false,
            presetKey: "H",
            lines: JSON.parse(JSON.stringify(PRESETS_DB.H.lines))
        },
        {
            active: false,
            name: "Corps chaud",
            showName: true,
            mode: "thermal",
            temp: 3500,
            showTempBadge: true,
            presetKey: null,
            lines: []
        },
        {
            active: false,
            name: "Sodium",
            showName: true,
            mode: "absorption_lines",
            temp: 6000,
            showTempBadge: false,
            presetKey: "Na",
            lines: JSON.parse(JSON.stringify(PRESETS_DB.Na.lines))
        }
    ]
};

// Noms automatiques : ceux des pistes par défaut et le nom court d'un preset (« Soleil (5800 K) » -> « Soleil »)
export const DEFAULT_TRACK_NAMES = DEFAULT_STATE.tracks.map(t => t.name);

export function getPresetShortName(preset) {
    return preset.label.split(' (')[0];
}
