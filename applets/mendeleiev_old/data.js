/* --- data.js --- */

const elementsData = [
    // --- Éléments existants ---
    { 
        id: "Al", nom: "ALUMINIUM", masse: "27,0", famille: "3", pos: 18,
        formule: "Al", 
        composes: "AlCl<sub>3</sub>&nbsp;&nbsp;&nbsp;&nbsp;Al<sub>2</sub>O<sub>3</sub>", 
        propPhy: "* Métal blanc<br/>* Bon conducteur de la chaleur et de l'électricité", 
        propChi: "* S'oxyde à l'air<br/>* Réagit avec le dichlore" 
    },
    { 
        id: "As", nom: "ARSENIC", masse: "74,9", famille: "5", pos: 28,
        formule: "As", 
        composes: "AsH<sub>3</sub>&nbsp;&nbsp;&nbsp;&nbsp;As<sub>2</sub>O<sub>5</sub>", 
        propPhy: "* Solide gris à l'éclat métallique, tendre et cassant", 
        propChi: "* Réagit avec le dichlore<br/>* Tous ses composés sont des poisons violents" 
    },
    { 
        id: "B",  nom: "BORE", masse: "10,8", famille: "3", pos: 10,
        formule: "B", 
        composes: "BCl<sub>3</sub>&nbsp;&nbsp;&nbsp;&nbsp;B<sub>2</sub>O<sub>3</sub>", 
        propPhy: "* Solide noir, léger et très dur<br/>* Mauvais conducteur chaleur<br/>* Semi-conducteur élec.", 
        propChi: "* Brûle dans l'air à haute température<br/>* Réagit avec le dichlore à chaud" 
    },
    { 
        id: "Be", nom: "BERYLLIUM", masse: "9,0", famille: "2", pos: 9,
        formule: "Be", 
        composes: "BeO&nbsp;&nbsp;&nbsp;&nbsp;BeCl<sub>2</sub>", 
        propPhy: "* Métal blanc brillant<br/>* Peu dense", 
        propChi: "* Brûle dans l'air avec un phénomène lumineux intense" 
    },
    { 
        id: "Br", nom: "BROME", masse: "79,9", famille: "7", pos: 30,
        formule: "Br<sub>2</sub>", 
        composes: "NaBr&nbsp;&nbsp;&nbsp;&nbsp;HBr", 
        propPhy: "* Liquide volatil de couleur rouge sombre", 
        propChi: "* Réagit avec le dihydrogène<br/>* Réagit vivement avec Na, Ca, Al..." 
    },
    { 
        id: "C",  nom: "CARBONE", masse: "12,0", famille: "4", pos: 11,
        formule: "C", 
        composes: "CO<sub>2</sub>&nbsp;&nbsp;&nbsp;&nbsp;CH<sub>4</sub>", 
        propPhy: "* Graphite (noir friable)<br/>* Diamant (transparent dur)", 
        propChi: "* Brûle dans l'air pour donner monoxyde de carbone et / ou dioxyde de carbone" 
    },
    { 
        id: "Ca", nom: "CALCIUM", masse: "40,1", famille: "2", pos: 25,
        formule: "Ca", 
        composes: "CaO&nbsp;&nbsp;&nbsp;&nbsp;CaCl<sub>2</sub>", 
        propPhy: "* Métal blanc brillant<br/>* Peu dense", 
        propChi: "* A chaud, s'enflamme dans le dioxygène<br/>* Réagit avec le dichlore" 
    },
    { 
        id: "Cl", nom: "CHLORE", masse: "35,5", famille: "7", pos: 22,
        formule: "Cl<sub>2</sub>", 
        composes: "NaCl&nbsp;&nbsp;&nbsp;&nbsp;HCl", 
        propPhy: "* Gaz verdâtre, peu soluble dans l'eau", 
        propChi: "* Réagit violemment avec le dihydrogène<br/>* Réagit vivement avec les métaux Na, Ca, Al..." 
    },
    { 
        id: "F",  nom: "FLUOR", masse: "19,0", famille: "7", pos: 14,
        formule: "F<sub>2</sub>", 
        composes: "NaF&nbsp;&nbsp;&nbsp;&nbsp;HF", 
        propPhy: "* Gaz jaune moins dense que l'air", 
        propChi: "* Réagit avec le dihydrogène<br/>* Réagit avec tous les métaux sauf l'or et le platine" 
    },
    { 
        id: "H",  nom: "HYDROGENE", masse: "1,0", famille: "1", pos: 0,
        formule: "H<sub>2</sub>", 
        composes: "HCl&nbsp;&nbsp;&nbsp;&nbsp;H<sub>2</sub>O", 
        propPhy: "* Le plus léger des gaz, incolore et inodore", 
        propChi: "* Peut réagir de façon explosive avec le dioxygène<br/>* Réagit avec le dichlore, le soufre, le carbone..." 
    },
    { 
        id: "K",  nom: "POTASSIUM", masse: "39,1", famille: "1", pos: 24,
        formule: "K", 
        composes: "KCl&nbsp;&nbsp;&nbsp;&nbsp;K<sub>2</sub>O", 
        propPhy: "* Métal argenté mou comme la cire à température ambiante<br/>* Peu dense", 
        propChi: "* S'oxyde rapidement à l'air<br/>* Réagit violemment avec l'eau" 
    },
    { 
        id: "Li", nom: "LITHIUM", masse: "6,9", famille: "1", pos: 8,
        formule: "Li", 
        composes: "LiCl&nbsp;&nbsp;&nbsp;&nbsp;Li<sub>2</sub>O", 
        propPhy: "* Métal blanc argenté mou comme le beurre<br/>* Peu dense", 
        propChi: "* Réagit violemment avec l'eau<br/>* Réagit avec le dichlore" 
    },
    { 
        id: "Mg", nom: "MAGNESIUM", masse: "24,3", famille: "2", pos: 17,
        formule: "Mg", 
        composes: "MgO&nbsp;&nbsp;&nbsp;&nbsp;MgCl<sub>2</sub>", 
        propPhy: "* Métal blanc argenté, malléable et ductile", 
        propChi: "* Brûle dans le dioxygène avec un vif éclat<br/>* Réagit avec le dichlore" 
    },
    { 
        id: "N",  nom: "AZOTE", masse: "14,0", famille: "5", pos: 12,
        formule: "N<sub>2</sub>", 
        composes: "NH<sub>3</sub>&nbsp;&nbsp;&nbsp;&nbsp;NO<sub>2</sub>", 
        propPhy: "* Gaz incolore et inodore très peu soluble dans l'eau<br/>* Moins dense que l'air", 
        propChi: "* A haute température ou en présence d'arc électrique, il peut se combiner avec O<sub>2</sub>" 
    },
    { 
        id: "Na", nom: "SODIUM", masse: "23,0", famille: "1", pos: 16,
        formule: "Na", 
        composes: "NaCl&nbsp;&nbsp;&nbsp;&nbsp;Na<sub>2</sub>O", 
        propPhy: "* Métal blanc argenté, mou <br/>* Peu dense", 
        propChi: "* S'oxyde rapidement à l'air<br/>* Réagit violemment avec l'eau<br/>* Réagit avec le dichlore" 
    },
    { 
        id: "O",  nom: "OXYGENE", masse: "16,0", famille: "6", pos: 13,
        formule: "O<sub>2</sub>", 
        composes: "H<sub>2</sub>O&nbsp;&nbsp;&nbsp;&nbsp;CaO", 
        propPhy: "* Gaz incolore et inodore<br/>* Peu soluble dans l'eau<br/>* Plus dense que l'air", 
        propChi: "* Se combine avec la plupart des corps simples pour former les \"oxydes\"" 
    },
    { 
        id: "P",  nom: "PHOSPHORE", masse: "31,0", famille: "5", pos: 20,
        formule: "P", 
        composes: "PH<sub>3</sub>&nbsp;&nbsp;&nbsp;&nbsp;P<sub>2</sub>O<sub>5</sub>", 
        propPhy: "* Plusieurs variétés (blanc, rouge...)", 
        propChi: "* La variété blanche s'enflamme spontanément à l'air dès 40°C<br/>* Réagit vivement avec le dichlore " 
    },
    { 
        id: "S",  nom: "SOUFRE", masse: "32,1", famille: "6", pos: 21,
        formule: "S<sub>8</sub>", 
        composes: "H<sub>2</sub>S&nbsp;&nbsp;&nbsp;&nbsp;SO<sub>2</sub>", 
        propPhy: "* Solide jaune, isolant électrique", 
        propChi: "* S'enflamme dans le dihydrogène (odeur d'oeuf pourri)<br/>* Brûle dans le dioxygène (gaz d'odeur piquante)" 
    },
    { 
        id: "Si", nom: "SILICIUM", masse: "28,1", famille: "4", pos: 19,
        formule: "Si", 
        composes: "SiO<sub>2</sub>&nbsp;&nbsp;&nbsp;&nbsp;SiH<sub>4</sub>", 
        propPhy: "* Solide bleu acier, semi-conducteur", 
        propChi: "* Chauffé à blanc il brûle avec incandescence<br/>* Se combine à chaud avec le carbone" 
    },
    
    // --- NOUVEAUX ÉLÉMENTS AJOUTÉS (Transition & Autres) ---
    {
        id: "Ti", nom: "TITANE", masse: "47,9", formule: "Ti",
        propPhy: "* Métal dur, brillant<br/>* Masse volumique faible",
        propChi: "* Métal peu corrodable<br/>",
        composes: "TiO<sub>2</sub>&nbsp;&nbsp;&nbsp;&nbsp;TiH<sub>2</sub>&nbsp;&nbsp;&nbsp;&nbsp;TiCl<sub>3</sub>"
    },
    {
        id: "Cu", nom: "CUIVRE", masse: "63,5", formule: "Cu",
        propPhy: "* Métal de couleur caractéristique (rouge)<br/>* Malléable, ductile<br/>* Point de fusion peu élevé",
        propChi: "* Nombreux composés d'intérêt ",
        composes: "CuO&nbsp;&nbsp;&nbsp;&nbsp;CuS&nbsp;&nbsp;&nbsp;&nbsp;CuSO<sub>4</sub>"
    },
    {
        id: "Zn", nom: "ZINC", masse: "65,4", formule: "Zn",
        propPhy: "* Métal gris<br/>* Nombreux alliages intéressants",
        propChi: "* Nombreux composés d'intérêt ",
        composes: "ZnO&nbsp;&nbsp;&nbsp;&nbsp;ZnS&nbsp;&nbsp;&nbsp;&nbsp;ZnCO<sub>3</sub>"
    },
    {
        id: "Se", nom: "SELENIUM", masse: "79,0", formule: "Se",
        propPhy: "* Photoconducteur (rendu conducteur sous un éclairage)",
        propChi: "* Dérivés très toxiques",
        composes: "H<sub>2</sub>Se&nbsp;&nbsp;&nbsp;&nbsp;SeO<sub>2</sub>"
    },

    // --- ÉLÉMENTS PRÉDITS (Eka) ---
    {
        id: "El", nom: "EKA-ALUMINIUM", masse: "~70", formule: "El", 
        propPhy: "* Métal gris ?<br/>* Bas point de fusion ?", 
        propChi: " ", 
        composes: "ElCl<sub>3</sub> ?&nbsp;&nbsp;&nbsp;El<sub>2</sub>O<sub>3</sub> ?&nbsp;&nbsp;&nbsp;ElH<sub>3</sub> ?"
    },
    {
        id: "Es", nom: "EKA-SILICIUM", masse: "~72", formule: "Es", 
        propPhy: "* Aspect métallique ?<br/>* Point de fusion ~1000°C ?", 
        propChi: " ", 
        composes: "EsO<sub>2</sub> ?&nbsp;&nbsp;&nbsp;EsH<sub>4</sub> ?&nbsp;&nbsp;&nbsp;EsCl<sub>4</sub> ?"
    }
];

// Configuration des familles (utilisé page 04)
const FAMILLES = {
    "1": ["Li", "Na", "K"], 
    "2": ["Be", "Mg", "Ca"], 
    "3": ["B", "Al"],
    "4": ["C", "Si"], 
    "5": ["N", "P", "As"], 
    "6": ["O", "S"], 
    "7": ["F", "Cl", "Br"]
};

// Ordre correct pour la masse atomique (utilisé page 03)
const ORDRE_MASSE = ["H", "Li", "Be", "B", "C", "N", "O", "F", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "K", "Ca", "As", "Br"];