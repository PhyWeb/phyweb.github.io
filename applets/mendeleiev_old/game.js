/* --- game.js --- */

// Carte des numéros atomiques (Globale pour être accessible partout)
const zMap = {
    "H": 1, "He": 2, 
    "Li": 3, "Be": 4, "B": 5, "C": 6, "N": 7, "O": 8, "F": 9, "Ne": 10,
    "Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 15, "S": 16, "Cl": 17, "Ar": 18,
    "K": 19, "Ca": 20, "Sc": 21, "Ti": 22, "V": 23, "Cr": 24, "Mn": 25, "Fe": 26, "Co": 27, "Ni": 28, "Cu": 29, "Zn": 30,
    "Ga": 31, "Ge": 32, "As": 33, "Se": 34, "Br": 35, "Kr": 36
};

// --- 1. GESTION DU PANNEAU D'INFORMATION ---

function showInfo(id) {
    const data = elementsData.find(e => e.id === id);
    if (!data) return;

    const setText = (elemId, text) => {
        const el = document.getElementById(elemId);
        if (el) el.textContent = text;
    };
    const setHTML = (elemId, html) => {
        const el = document.getElementById(elemId);
        if (el) el.innerHTML = html;
    };

    setText('info-nom', data.nom);
    setText('info-symbole', data.id);
    setText('info-masse', data.masse);
    setHTML('info-formule', data.formule);
    setHTML('info-propPhy', data.propPhy);
    setHTML('info-propChi', data.propChi);
    setHTML('info-composes', data.composes);
}

function clearInfo() { }

// --- 2. GESTION DU DRAG & DROP ---

function commonAllowDrop(ev) { ev.preventDefault(); }

function commonDragStart(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

/**
 * Générateur de cartes universel
 * @param {Object} elementData - Données de l'élément (issue de data.js)
 * @param {boolean} isDraggable - Si la carte peut être déplacée
 * @param {Object} options - Configuration de l'affichage
 * @param {string} options.mode - 'normal' (défaut), 'inputSymbol' (saisie symbole), 'atomic' (affiche Z), 'inputAtomic' (saisie Z)
 * @param {string} options.inputId - ID de l'input si mode input
 */
function createCard(elementData, isDraggable = true, options = {}) {
    const mode = options.mode || 'normal';
    
    const div = document.createElement('div');
    div.className = 'element-card';
    div.id = elementData.id;

    // --- MODE 1 : SAISIE DU SYMBOLE (Partie 3) ---
    if (mode === 'inputSymbol') {
        div.classList.add('input-mode');
        const input = document.createElement('input');
        input.type = "text";
        input.id = options.inputId;
        input.className = "card-input";
        input.maxLength = 2;
        input.autocomplete = "off";
        div.appendChild(input);
    } 
    // --- MODE 2 : SAISIE DU NUMÉRO ATOMIQUE Z (Partie 4) ---
    else if (mode === 'inputAtomic') {
        div.classList.add('input-mode');
        
        // Symbole fixe
        const symSpan = document.createElement('div');
        symSpan.className = 'input-symbol';
        symSpan.textContent = elementData.id; // Ex: Ga
        div.appendChild(symSpan);

        // Input pour le Z
        const input = document.createElement('input');
        input.type = "text";
        input.id = options.inputId;
        input.className = "z-input"; // Classe CSS spécifique définie partie 4
        input.maxLength = 2;
        input.placeholder = "?";
        input.autocomplete = "off";
        div.appendChild(input);
    }
    // --- MODE 4 : Z FIXE + INPUT SYMBOLE (Partie 8) ---
    else if (mode === 'atomic_inputSymbol') {
        div.classList.add('input-mode');
        
        // 1. Le Z (fixe)
        const zSpan = document.createElement('span');
        zSpan.className = 'atomic-number';
        // On récupère Z via la map globale ou l'objet data
        zSpan.textContent = zMap[elementData.id] || elementData.z || "?";
        div.appendChild(zSpan);

        // 2. L'Input (pour le Symbole)
        const input = document.createElement('input');
        input.type = "text";
        input.id = options.inputId;
        input.className = "card-input"; // On réutilise la classe existante
        // Petit ajustement de style inline pour ce cas précis si besoin, 
        // ou géré par le CSS .card-input existant qui est déjà centré.
        input.style.marginTop = "10px"; // Espace pour le Z
        input.maxLength = 2;
        input.autocomplete = "off";
        div.appendChild(input);
    }
    // --- MODE 3 : AFFICHAGE STANDARD OU ATOMIQUE ---
    else {
        // Affichage du Z (Partie 4 cartes normales)
        if (mode === 'atomic') {
            const zSpan = document.createElement('span');
            zSpan.className = 'atomic-number';
            zSpan.textContent = zMap[elementData.id] || "?";
            div.appendChild(zSpan);
        }

        // Le Symbole
        const symboleSpan = document.createElement('span');
        symboleSpan.textContent = elementData.id;
        // Petit ajustement de style si on est en mode atomique pour ne pas chevaucher le Z
        if (mode === 'atomic') symboleSpan.className = 'symbol-text'; 
        div.appendChild(symboleSpan);

        // La Masse (Seulement si on n'est PAS en mode atomique)
        if (mode !== 'atomic') {
            const masseDiv = document.createElement('div');
            masseDiv.className = 'element-mass';
            masseDiv.textContent = `m = ${elementData.masse}`;
            div.appendChild(masseDiv);
        }
    }
    
    // Gestion du Drag & Drop (sauf si input)
    if (isDraggable && !mode.startsWith('input')) {
        div.draggable = true;
        div.addEventListener('dragstart', commonDragStart);
    }

    // Events Info
    div.addEventListener('mouseover', () => showInfo(elementData.id));
    div.addEventListener('mouseout', clearInfo);

    return div;
}

/**
 * Génère la grille de Mendeleiev
 * @param {HTMLElement} container 
 * @param {Object} config - { mode: 'hole' | 'input' | 'atomic_input' | 'final' }
 */
function renderMendeleevGrid(container, config = {}) {
    if (!container) return;
    container.innerHTML = "";

    // --- NOUVEAU : MODE FINAL (Conclusion Partie 9) ---
    // Affiche la grille complète 8 colonnes de H à Ar
    if (config.mode === 'final') {
        // On s'assure que le conteneur a la bonne classe CSS pour 8 colonnes
        // (La classe .grid-missing-col définie pour la partie 6 convient parfaitement)
        if (!container.className.includes('grid-missing-col')) {
            container.classList.add('grid-missing-col');
        }

        const addAtom = (id) => {
            const data = elementsData.find(e => e.id === id);
            if(data) container.appendChild(createCard(data, false, { mode: 'atomic' }));
        };

        // Ligne 1 : H ... (espace 6) ... He
        addAtom("H");
        const spacer = document.createElement('div');
        spacer.style.gridColumn = "span 6"; // Style inline pour éviter une nouvelle classe CSS
        container.appendChild(spacer);
        addAtom("He");

        // Lignes 2 et 3 complètes
        ["Li", "Be", "B", "C", "N", "O", "F", "Ne", 
         "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"].forEach(id => addAtom(id));
        
        return; // On s'arrête là pour ce mode
    }

    // --- ANCIEN CODE (Parties 2, 3, 4) ---
    // Structure historique (trous, transition...)
    
    const defaultCardMode = (config.mode === 'atomic_input') ? 'atomic' : 'normal';

    const appendEmpty = (count) => {
        for(let i=0; i<count; i++) container.appendChild(document.createElement('div'));
    };

    const addElement = (id) => {
        const data = elementsData.find(e => e.id === id);
        if(data) container.appendChild(createCard(data, false, { mode: defaultCardMode }));
    };

    // Ligne 1
    addElement("H");
    appendEmpty(7);

    // Ligne 2
    ["Li", "Be"].forEach(id => addElement(id));
    appendEmpty(1);
    ["B", "C", "N", "O", "F"].forEach(id => addElement(id));

    // Ligne 3
    ["Na", "Mg"].forEach(id => addElement(id));
    appendEmpty(1);
    ["Al", "Si", "P", "S", "Cl"].forEach(id => addElement(id));

    // Ligne 4
    ["K", "Ca"].forEach(id => addElement(id));

    // Bloc Transition
    const transDiv = document.createElement('div');
    transDiv.className = 'transition-container';
    transDiv.appendChild(createCard(elementsData.find(e => e.id === "Ti"), false, { mode: defaultCardMode }));
    
    const txt = document.createElement('div');
    txt.className = 'transition-text';
    txt.innerHTML = "...<br>6 éléments connus non représentés<br>...";
    transDiv.appendChild(txt);
    
    transDiv.appendChild(createCard(elementsData.find(e => e.id === "Cu"), false, { mode: defaultCardMode }));
    transDiv.appendChild(createCard(elementsData.find(e => e.id === "Zn"), false, { mode: defaultCardMode }));
    container.appendChild(transDiv);

    // Gestion des cas spéciaux (Trous / Inputs)
    if (config.mode === 'hole') {
        const hole = document.createElement('div');
        hole.className = 'hole-box';
        hole.innerHTML = "Deux places vacantes";
        container.appendChild(hole);
    } 
    else if (config.mode === 'input') {
        const dataGa = elementsData.find(e => e.id === "El"); 
        const dataGe = elementsData.find(e => e.id === "Es"); 
        container.appendChild(createCard(dataGa, false, { mode: 'inputSymbol', inputId: "input-ga" }));
        container.appendChild(createCard(dataGe, false, { mode: 'inputSymbol', inputId: "input-ge" }));
    }
    else if (config.mode === 'atomic_input') {
        const fakeGa = { id: "Ga", nom: "GALLIUM", masse: "69.7", formule: "Ga" };
        const fakeGe = { id: "Ge", nom: "GERMANIUM", masse: "72.6", formule: "Ge" };
        container.appendChild(createCard(fakeGa, false, { mode: 'inputAtomic', inputId: "rep1" }));
        container.appendChild(createCard(fakeGe, false, { mode: 'inputAtomic', inputId: "rep2" }));
    }

    ["As", "Se", "Br"].forEach(id => addElement(id));
}

// Helper pour le tri : Récupère la masse numérique
function getMass(cardId) {
    const data = elementsData.find(e => e.id === cardId);
    if (!data) return 999;
    // Nettoyage de la chaîne (ex: "~70" ou "27,0")
    return parseFloat(data.masse.replace(',', '.').replace('~', ''));
}

/**
 * Gère le dépôt d'une carte (Drop) avec Tri et Nettoyage de style
 */
function handleCardDrop(ev) {
    ev.preventDefault();
    if (ev.currentTarget.classList) ev.currentTarget.classList.remove('drag-over');

    const dataId = ev.dataTransfer.getData("text");
    const draggedCard = document.getElementById(dataId);
    if (!draggedCard) return;

    // Réinitialisation immédiate du style (enlève .correct / .incorrect)
    draggedCard.className = "element-card";

    // Identification de la zone cible
    // On accepte : .placeholder, .slot (grille) et .cards-pool, .card-pool, #pool (réserve)
    const targetZone = ev.target.closest('.placeholder, .slot, .cards-pool, .card-pool, #pool');
    
    if (!targetZone) return;

    // --- CAS 1 : RETOUR RÉSERVE (POOL) ---
    if (targetZone.id === 'pool' || targetZone.classList.contains('card-pool') || targetZone.classList.contains('cards-pool')) {
        // Logique d'insertion triée
        const cardMass = getMass(draggedCard.id);
        const children = Array.from(targetZone.children);
        
        // Cherche la première carte plus lourde
        const nextCard = children.find(c => getMass(c.id) > cardMass);

        if (nextCard) {
            targetZone.insertBefore(draggedCard, nextCard);
        } else {
            targetZone.appendChild(draggedCard);
        }
        return;
    }

    // --- CAS 2 : DANS UNE CASE (SLOT) ---
    if (targetZone.children.length > 0) {
        const existingCard = targetZone.children[0];
        if (existingCard === draggedCard) return; 

        // SWAP : On renvoie la carte existante vers le pool (avec tri !)
        const pool = document.getElementById('pool') || document.querySelector('.card-pool');
        if (pool) {
            existingCard.className = "element-card"; // Reset style
            // On réutilise la logique de tri via un append manuel ou récursif
            // Ici, on fait simple : insertion triée manuelle
            const existingMass = getMass(existingCard.id);
            const poolChildren = Array.from(pool.children);
            const nextInPool = poolChildren.find(c => getMass(c.id) > existingMass);
            if(nextInPool) pool.insertBefore(existingCard, nextInPool);
            else pool.appendChild(existingCard);
        }
    }

    // Placement final de la carte déplacée
    targetZone.appendChild(draggedCard);
}

/* Fonction utilitaire pour l'effet visuel au survol (optionnel mais sympa) */
function handleDragEnter(ev) {
    ev.preventDefault();
    const target = ev.target.closest('.placeholder, .cards-pool');
    if (target) target.classList.add('drag-over');
}

function handleDragLeave(ev) {
    const target = ev.target.closest('.placeholder, .cards-pool');
    if (target) target.classList.remove('drag-over');
}