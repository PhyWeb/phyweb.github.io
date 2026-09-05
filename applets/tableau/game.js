/* --- game.js (Chevauchement horizontal + Hauteur compacte) --- */

const zMap = { "H": 1, "He": 2, "Li": 3, "Be": 4, "B": 5, "C": 6, "N": 7, "O": 8, "F": 9, "Ne": 10, "Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 15, "S": 16, "Cl": 17, "Ar": 18, "K": 19, "Ca": 20, "Sc": 21, "Ti": 22, "V": 23, "Cr": 24, "Mn": 25, "Fe": 26, "Co": 27, "Ni": 28, "Cu": 29, "Zn": 30, "Ga": 31, "Ge": 32, "As": 33, "Se": 34, "Br": 35, "Kr": 36 };

function showInfo(id) {
    const data = elementsData.find(e => e.id === id);
    if (!data) return;
    const setHTML = (elemId, html) => { const el = document.getElementById(elemId); if (el) el.innerHTML = html; };
    const setText = (elemId, txt) => { const el = document.getElementById(elemId); if (el) el.textContent = txt; };
    setText('info-nom', data.nom); setText('info-symbole', data.id); setText('info-masse', data.masse);
    
    // Affichage conditionnel de Z uniquement pour la partie 2
    const zContainer = document.getElementById('info-z-container');
    if (zContainer) {
        if (currentPart === "partie2") {
            zContainer.style.display = "block";
            setText('info-z', zMap[id] || "?");
        } else {
            zContainer.style.display = "none";
        }
    }
    
    setHTML('info-formule', data.formule); setHTML('info-propPhy', data.propPhy);
    setHTML('info-propChi', data.propChi); setHTML('info-composes', data.composes);
}

function commonAllowDrop(ev) { ev.preventDefault(); }
function commonDragStart(ev) { ev.dataTransfer.setData("text", ev.target.id); }

function createCard(elementData, isDraggable = true, options = {}) {
    const mode = options.mode || 'normal';
    const div = document.createElement('div');
    div.className = 'element-card'; div.id = elementData.id;

    if (mode === 'inputSymbol') {
        div.classList.add('input-mode');
        const input = document.createElement('input'); input.type = "text"; input.id = options.inputId; input.className = "card-input"; input.maxLength = 2; input.autocomplete = "off";
        div.appendChild(input);
    } else if (mode === 'inputAtomic') {
        div.classList.add('input-mode');
        const symSpan = document.createElement('div'); symSpan.className = 'input-symbol'; symSpan.textContent = elementData.id; div.appendChild(symSpan);
        const input = document.createElement('input'); input.type = "text"; input.id = options.inputId; input.className = "z-input"; input.maxLength = 2; input.placeholder = "?"; input.autocomplete = "off";
        div.appendChild(input);
    } else if (mode === 'atomic_inputSymbol') {
        div.classList.add('input-mode');
        const zSpan = document.createElement('span'); zSpan.className = 'atomic-number'; zSpan.textContent = zMap[elementData.id] || elementData.z || "?"; div.appendChild(zSpan);
        const input = document.createElement('input'); input.type = "text"; input.id = options.inputId; input.className = "card-input"; input.style.marginTop = "10px"; input.maxLength = 2; input.autocomplete = "off";
        div.appendChild(input);
    } else {
        if (mode === 'atomic') { const zSpan = document.createElement('span'); zSpan.className = 'atomic-number'; zSpan.textContent = zMap[elementData.id] || "?"; div.appendChild(zSpan); }
        const symboleSpan = document.createElement('span'); symboleSpan.textContent = elementData.id;
        if (mode === 'atomic') symboleSpan.className = 'symbol-text';
        div.appendChild(symboleSpan);
        if (mode !== 'atomic') { const masseDiv = document.createElement('div'); masseDiv.className = 'element-mass'; masseDiv.textContent = `m = ${elementData.masse}`; div.appendChild(masseDiv); }
    }
    if (isDraggable && !mode.startsWith('input')) { div.draggable = true; div.addEventListener('dragstart', commonDragStart); }
    div.addEventListener('mouseover', () => showInfo(elementData.id));
    return div;
}

function renderMendeleevGrid(container, config = {}) {
    if (!container) return; container.innerHTML = "";
    if (config.mode === 'final') {
        if (!container.className.includes('grid-missing-col')) container.classList.add('grid-missing-col');
        const addAtom = (id) => { const data = elementsData.find(e => e.id === id); if(data) container.appendChild(createCard(data, false, { mode: 'atomic' })); };
        addAtom("H"); const spacer = document.createElement('div'); spacer.style.gridColumn = "span 6"; container.appendChild(spacer); addAtom("He");
        ["Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"].forEach(id => addAtom(id));
        return;
    }
    const defaultCardMode = (config.mode === 'atomic_input') ? 'atomic' : 'normal';
    const appendEmpty = (count) => { for(let i=0; i<count; i++) container.appendChild(document.createElement('div')); };
    const addElement = (id) => { const data = elementsData.find(e => e.id === id); if(data) container.appendChild(createCard(data, false, { mode: defaultCardMode })); };
    
    addElement("H"); appendEmpty(7);
    ["Li", "Be"].forEach(id => addElement(id)); appendEmpty(1); ["B", "C", "N", "O", "F"].forEach(id => addElement(id));
    ["Na", "Mg"].forEach(id => addElement(id)); appendEmpty(1); ["Al", "Si", "P", "S", "Cl"].forEach(id => addElement(id));
    ["K", "Ca"].forEach(id => addElement(id));

    const transDiv = document.createElement('div'); transDiv.className = 'transition-container';
    transDiv.appendChild(createCard(elementsData.find(e => e.id === "Ti"), false, { mode: defaultCardMode }));
    const txt = document.createElement('div'); txt.className = 'transition-text has-text-grey is-size-7'; txt.innerHTML = "...<br>6 éléments connus non représentés<br>..."; transDiv.appendChild(txt);
    transDiv.appendChild(createCard(elementsData.find(e => e.id === "Cu"), false, { mode: defaultCardMode }));
    transDiv.appendChild(createCard(elementsData.find(e => e.id === "Zn"), false, { mode: defaultCardMode }));
    container.appendChild(transDiv);

    if (config.mode === 'hole') {
        const hole = document.createElement('div'); hole.className = 'hole-box'; hole.innerHTML = "Deux places vacantes"; container.appendChild(hole);
    } else if (config.mode === 'input') {
        container.appendChild(createCard(elementsData.find(e => e.id === "El"), false, { mode: 'inputSymbol', inputId: "input-ga" }));
        container.appendChild(createCard(elementsData.find(e => e.id === "Es"), false, { mode: 'inputSymbol', inputId: "input-ge" }));
    } else if (config.mode === 'atomic_input') {
        container.appendChild(createCard({ id: "Ga" }, false, { mode: 'inputAtomic', inputId: "rep1" }));
        container.appendChild(createCard({ id: "Ge" }, false, { mode: 'inputAtomic', inputId: "rep2" }));
    }
    ["As", "Se", "Br"].forEach(id => addElement(id));
}

function handleCardDrop(ev) {
    ev.preventDefault();
    const dataId = ev.dataTransfer.getData("text");
    const draggedCard = document.getElementById(dataId);
    if (!draggedCard || draggedCard.classList.contains('locked')) return;
    draggedCard.className = "element-card";
    const targetZone = ev.target.closest('.placeholder, .slot, .cards-pool, .card-pool, #pool, .test-zone');
    if (!targetZone) return;

    if (targetZone.id === 'pool' || targetZone.classList.contains('card-pool') || targetZone.id === 'test-box') { targetZone.appendChild(draggedCard); return; }
    if (targetZone.children.length > 0) {
        const existingCard = targetZone.children[0]; if (existingCard === draggedCard) return;
        const pool = document.getElementById('pool') || document.getElementById('card-pool');
        if (pool) pool.appendChild(existingCard);
    }
    targetZone.appendChild(draggedCard);
}

const infoPanelTemplate = `
    <div class="column is-narrow" style="width: 320px;">
        <aside class="info-panel box has-background-white-bis p-4" style="position: sticky; top: 20px;">
            <div class="info-header mb-3 pb-2" style="border-bottom: 2px solid #ddd;">
                <div id="info-symbole" class="title is-4 mb-0 has-text-link">--</div>
                <div id="info-nom" class="subtitle is-6 has-text-grey">Survolez un élément</div>
            </div>
            <div id="info-z-container" class="info-item mb-2" style="display: none;"><span class="has-text-weight-bold is-size-7 mr-2">Nb. protons (Numéro atomique) :</span><span id="info-z" class="is-size-6 has-text-danger has-text-weight-bold"></span></div>
            <div class="info-item mb-2"><span class="has-text-weight-bold is-size-7 mr-2">Masse atomique (H=1) :</span><span id="info-masse" class="is-size-7"></span></div>
            <div class="info-item mb-2"><span class="has-text-weight-bold is-size-7 mr-2">Formule corps simple :</span><span id="info-formule" class="has-text-info has-text-weight-bold is-size-7"></span></div>
            <div class="info-item mb-2"><span class="has-text-weight-bold is-size-7 is-block">Propriétés Physiques :</span><span id="info-propPhy" class="is-size-7 is-block pl-2"></span></div>
            <div class="info-item mb-2"><span class="has-text-weight-bold is-size-7 is-block">Propriétés Chimiques :</span><span id="info-propChi" class="is-size-7 is-block pl-2"></span></div>
            <div class="info-item"><span class="has-text-weight-bold is-size-7 is-block">Composés :</span><span id="info-composes" class="is-size-7 is-block pl-2"></span></div>
        </aside>
    </div>`;

let currentPart = ""; let currentStepIndex = 0;

const STRUCTURE_TP = {
    partie1: [
        {
            type: "text", title: "État des lieux des connaissances (1860)",
            html: `<div class="box content is-medium">
                <p>En 1860, on connaît <strong>63 éléments chimiques</strong> (environ 118 aujourd'hui).</p>
                <p>Les connaissances sur ces éléments sont assez détaillées et comprennent :</p>
                <ul>
                    <li><strong>Les propriétés physiques :</strong> aspects, températures de changement d'état, masses atomiques (comparées à celle de l'hydrogène, le plus léger des éléments pris pour référence)...</li>
                    <li><strong>Les propriétés chimiques :</strong> réactivité vis-à-vis des autres éléments, formules des corps composés qu'ils engendrent avec d'autres éléments...</li>
                </ul>
                <div class="notification is-warning is-light mt-4">
                    Par contre, la structure intime de la matière telle qu'on la décrit aujourd'hui n'est pas encore connue : l'idée d'atome n'est pas admise par tous et on est loin de connaître les particules qui le composent !
                </div>
            </div>`
        },
        {
            type: "text", title: "Les idées de Mendeleïev",
            html: `<div class="box content is-medium">
                <p>Face au foisonnement des propriétés physiques et chimiques diverses des 63 éléments connus à l'époque, Mendeleïev cherche un <strong>critère de classement</strong>.</p>
                <p>Sa <strong>première idée</strong>, toute simple, a été de les ranger par <span class="has-text-link has-text-weight-bold">masse atomique croissante</span>.</p>
                <p>Ce faisant, il est frappé par la régularité de l'évolution des propriétés chimiques et surtout par le fait qu'à intervalles fixes, des propriétés physiques et chimiques semblables se répètent (ressemblances physiques, chimiques et corps composés de même formulation).</p>
                <p>Ce constat lui amène <strong>une deuxième idée :</strong> celle d'ordonner les éléments sous forme d'un tableau. La première version de ce "tableau périodique" sera publiée en 1869.</p>
                <p class="has-text-centered has-text-weight-bold mt-5"><i class="fas fa-search has-text-info mr-2"></i> Vous allez maintenant partir sur les traces de Mendeleïev en reconstituant en partie sa démarche.</p>
            </div>`
        },
        {
            type: "game", title: "Premier classement",
            html: `<div class="box content consigne-box">
                <p>Vous disposez de 19 fiches semblables à celles qu'avait élaborées Mendeleiev (celles des principaux éléments les plus légers). </p>
                <p>Vous devez ici, dans un premier temps, classer ces fiches suivant <strong>le premier critère utilisé par Mendeleiev pour les ranger</strong>.</p>
            </div>
            <div class="columns">
                <div class="column">
                    <section class="game-area box has-background-light" style="height: 100%;">
                        <div class="card-pool cards-pool mb-4" id="pool"></div>
                        <h3 class="title is-5 mb-2 mt-2"><i class="fas fa-sort-numeric-down has-text-info"></i> Votre classement :</h3>
                        <div class="slots-container" id="slots-area"></div>
                    </section>
                </div>
                ${infoPanelTemplate}
            </div>`,
            onLoad: () => {
                const pool = document.getElementById('pool'); const slotsArea = document.getElementById('slots-area');
                elementsData.filter(el => el.famille).forEach(el => pool.appendChild(createCard(el, true)));
                for (let i = 1; i <= 19; i++) {
                    const slot = document.createElement('div'); slot.className = 'slot';
                    slot.addEventListener('dragover', commonAllowDrop); slot.addEventListener('drop', handleCardDrop);
                    slotsArea.appendChild(slot);
                }
                pool.addEventListener('dragover', commonAllowDrop); pool.addEventListener('drop', handleCardDrop);
            },
            validate: () => {
                const slots = document.querySelectorAll('.slot'); let empty = 0; let cards = [];
                slots.forEach((s, idx) => {
                    const c = s.querySelector('.element-card');
                    if (c) cards.push({ dom: c, id: c.id, m: parseFloat(elementsData.find(e=>e.id===c.id).masse.replace(',','.')) });
                    else { empty++; cards.push(null); }
                });
                if (empty > 0) return { success: false, msg: `Le classement n'est pas terminé. Il reste <strong>${empty} cases vides</strong>.` };
                for (let i = 0; i < cards.length - 1; i++) {
                    if (cards[i].m > cards[i+1].m) {
                        cards[i].dom.className = 'element-card incorrect'; cards[i+1].dom.className = 'element-card incorrect';
                        return { success: false, msg: `Erreur de logique : <strong>${cards[i].id}</strong> (${cards[i].m}) est plus lourd que <strong>${cards[i+1].id}</strong> (${cards[i+1].m}).<br>L'ordre doit être croissant.` };
                    }
                }
                let correctCount = 0;
                slots.forEach((s, idx) => {
                    const c = s.querySelector('.element-card');
                    if(c.id === ORDRE_MASSE[idx]) { c.className = 'element-card correct'; correctCount++; }
                    else c.className = 'element-card incorrect';
                });
                if(correctCount === 19) { document.querySelectorAll('.element-card').forEach(c => c.draggable = false); return { success: true, msg: "Bravo ! Votre classement est parfait.<br>Vous pouvez passer à l'étape suivante." }; }
                return { success: false, msg: "Les masses semblent croissantes, mais certains éléments ne sont pas à leur place exacte. Vérifiez les cases rouges." };
            }
        },
        {
            type: "game", title: "Recherche des familles",
            html: `<div class="box content consigne-box">
                <p>Vous devez maintenant étudier attentivement les fiches pour essayer de constituer des familles d'éléments à partir de leurs ressemblances :</p>
                <ul><li>Observez les propriétés physiques et chimiques.</li><li>Observez les formules des corps simples et composés.</li></ul>
            </div>
            <div class="columns">
                <div class="column">
                    <section class="game-area box has-background-light" style="height: 100%;">
                        <div class="card-pool mb-2" id="pool"></div>
                        <h3 class="title is-6 mb-2 mt-2 has-text-info"><i class="fas fa-flask"></i> Zone de test (glissez ici les éléments similaires) :</h3>
                        <div class="test-zone box" id="test-box" style="min-height: 120px; border: 2px dashed #ccc;"></div>
                        <div class="found-zone" id="found-zone"><h4 class="title is-6 has-text-grey mb-0">Familles identifiées :</h4></div>
                    </section>
                </div>
                ${infoPanelTemplate}
            </div>`,
            onLoad: () => {
                const pool = document.getElementById('pool'); const testBox = document.getElementById('test-box');
                ORDRE_MASSE.filter(id => id !== "H").forEach(id => pool.appendChild(createCard(elementsData.find(e=>e.id===id))));
                pool.addEventListener('dragover', commonAllowDrop); pool.addEventListener('drop', handleCardDrop);
                testBox.addEventListener('dragover', commonAllowDrop); testBox.addEventListener('drop', handleCardDrop);
                window.foundFamilies = new Set(); window.totalFamilies = Object.keys(FAMILLES).length;
            },
            actionLabel: "Vider la zone de test",
            onAction: () => {
                const pool = document.getElementById('pool'); const testBox = document.getElementById('test-box');
                Array.from(testBox.children).forEach(c => pool.appendChild(c));
                Array.from(pool.children).sort((a,b) => ORDRE_MASSE.indexOf(a.id) - ORDRE_MASSE.indexOf(b.id)).forEach(c => pool.appendChild(c));
            },
            validate: () => {
                const testBox = document.getElementById('test-box'); const children = Array.from(testBox.children);
                if (children.length < 2) return { success: false, msg: "Il faut au moins 2 éléments pour former une famille." };
                const currentIds = children.map(c => c.id); const targetFam = FAMILLES[elementsData.find(e=>e.id===currentIds[0]).famille];
                if (!currentIds.every(id => targetFam.includes(id))) { testBox.style.borderColor = "#f14668"; setTimeout(() => { testBox.style.borderColor = "#ccc"; }, 2000); return { success: false, msg: "Intrus détecté ! Ces éléments n'ont pas assez de points communs." }; }
                if (currentIds.length === targetFam.length) {
                    testBox.style.borderColor = "#48c774"; setTimeout(() => { testBox.style.borderColor = "#ccc"; }, 2000);
                    const fz = document.getElementById('found-zone'); const grp = document.createElement('div'); 
                    
                    // Modification ici : on utilise is-inline-flex
                    grp.className = 'found-group is-inline-flex mr-2';
                    
                    children.forEach(c => { c.draggable = false; c.classList.add('locked'); grp.appendChild(c); });
                    fz.appendChild(grp); window.foundFamilies.add(elementsData.find(e=>e.id===currentIds[0]).famille);
                    if(window.foundFamilies.size >= window.totalFamilies) return { success: true, msg: "Toutes les familles ont été trouvées ! Vous pouvez passer à la suite." };
                    return { success: false, msg: `Excellente déduction ! Famille complète archivée. (${window.foundFamilies.size}/${window.totalFamilies})` };
                }
                testBox.style.borderColor = "#ffdd57"; setTimeout(() => { testBox.style.borderColor = "#ccc"; }, 2000);
                return { success: false, msg: "C'est un bon début, mais la famille est incomplète. Cherchez les éléments manquants." };
            }
        },
        {
            type: "text", title: "La démarche de construction",
            html: `<div class="box content is-medium has-text-centered">
                <p>Pour rapprocher les uns des autres les éléments ayant des similitudes tout en respectant le premier critère des masses atomiques, Mendeleïev a placé ses éléments dans un tableau qu'il a dénommé <strong>"tableau périodique"</strong>.</p>
                <div class="notification is-link is-light my-5">
                    <p class="mb-2">Les familles se retrouvent alors en <strong>colonnes</strong> dans le tableau.</p>
                    <p class="is-size-5 has-text-weight-bold"><i class="fas fa-table mr-2"></i> Vous allez construire vous-même ce tableau.</p>
                </div>
            </div>`
        },
        {
            type: "game", title: "Construction du Tableau",
            html: `<div class="box content consigne-box">
                <p>A ce stade, vous devez constituer le tableau comme l'a fait Mendeleiev pour la première fois.</p>
                <p>Déplacez les vignettes vers les cases vides du tableau situé en bas de page pour respecter à la fois <strong>les masses (en ligne)</strong> et <strong>les familles (en colonne)</strong>.</p>
            </div>
            <div class="columns">
                <div class="column">
                    <section class="game-area box has-background-light" style="height: 100%;">
                        <div class="card-pool mb-4" id="pool"></div>
                        <div class="periodic-grid" id="grid"></div>
                    </section>
                </div>
                ${infoPanelTemplate}
            </div>`,
            onLoad: () => {
                const pool = document.getElementById('pool'); const grid = document.getElementById('grid');
                [...elementsData].sort((a,b) => parseFloat(a.masse.replace(',','.')) - parseFloat(b.masse.replace(',','.'))).forEach(el => { if(el.id !== "H" && el.famille) pool.appendChild(createCard(el)); });
                pool.addEventListener('dragover', commonAllowDrop); pool.addEventListener('drop', handleCardDrop);
                for(let i=8; i<32; i++) {
                    const slot = document.createElement('div'); slot.className = 'slot'; slot.setAttribute('data-index', i);
                    slot.addEventListener('dragover', commonAllowDrop); slot.addEventListener('drop', handleCardDrop); grid.appendChild(slot);
                }
            },
            validate: () => {
                let err = 0;
                document.querySelectorAll('.element-card').forEach(c => {
                    if(c.parentElement.classList.contains('slot')) {
                        if(parseInt(c.parentElement.getAttribute('data-index')) === elementsData.find(e=>e.id===c.id).pos) c.className = "element-card correct";
                        else { c.className = "element-card incorrect"; err++; }
                    } else err++;
                });
                return err === 0 ? { success: true, msg: "Bravo ! Tableau parfaitement reconstruit." } : { success: false, msg: "Le tableau est incomplet ou contient des erreurs (en rouge)." };
            }
        },
        {
            type: "game", title: "Où placer l'Hydrogène ?",
            html: `<div class="box content consigne-box">
                <p>L'Hydrogène est resté à part. Etudiez ses propriétés pour lui trouver une position qui soit en accord avec les principes établis jusqu'ici.</p>
            </div>
            <div class="columns">
                <div class="column">
                    <section class="game-area box has-background-light" style="height: 100%;">
                        <div class="card-pool mb-4" id="pool" style="min-height:80px;"></div>
                        <div class="periodic-grid" id="grid"></div>
                    </section>
                </div>
                ${infoPanelTemplate}
            </div>`,
            onLoad: () => {
                const pool = document.getElementById('pool'); const grid = document.getElementById('grid');
                pool.addEventListener('dragover', commonAllowDrop); pool.addEventListener('drop', handleCardDrop);
                for(let i=0; i<32; i++) {
                    const slot = document.createElement('div'); slot.className = 'slot'; slot.setAttribute('data-index', i);
                    slot.addEventListener('dragover', commonAllowDrop); slot.addEventListener('drop', handleCardDrop); grid.appendChild(slot);
                }
                elementsData.forEach(el => {
                    if (el.id === "H") { pool.appendChild(createCard(el, true)); showInfo("H"); }
                    else {
                        const card = createCard(el, false); card.style.backgroundColor = "#eee"; card.style.color = "#888"; card.style.cursor = "default"; card.style.boxShadow = "none";
                        const slot = grid.querySelector(`.slot[data-index='${el.pos}']`); if(slot) slot.appendChild(card);
                    }
                });
            },
            validate: () => {
                const h = document.getElementById("H"); if(!h || !h.parentElement.classList.contains('slot')) return { success:false, msg:"Placez l'Hydrogène dans la grille."};
                const idx = parseInt(h.parentElement.getAttribute('data-index'));
                if(idx === 0) { h.className = "element-card correct"; return { success: true, msg: "Bravo ! H est dans la colonne 1." }; }
                h.className = "element-card incorrect";
                if(idx === 6 || idx === 14) return { success: false, msg: "Pas bête (famille 7), mais Mendeleïev a privilégié la masse." };
                return { success: false, msg: "Vous n'avez pas su placer correctement l'élément H. Prenez en compte sa masse atomique et ses propriétés."};
            }
        }
    ],
    partie2: (function() {
        const renderModernSimplifiedGrid = (container, mode) => {
            container.innerHTML = ""; container.className = "periodic-grid";
            
            // Élargissement des cases pour le mode d'affichage des configurations complètes
            if (mode === 'all-configs') {
                container.style.gridTemplateColumns = "repeat(8, 140px)"; container.style.gap = "6px";
            } else {
                container.style.gridTemplateColumns = "repeat(8, 60px)"; container.style.gap = "8px";
            }
            container.style.justifyContent = "center";

            const r1 = ["H", null, null, null, null, null, null, "He"];
            const r2 = ["Li", "Be", "B", "C", "N", "O", "F", "Ne"];
            const r3 = ["Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar"];
            
            const toHideZ = ["B", "C", "N", "O", "F", "Al", "Si", "P", "S", "Cl"];
            
            // Configurations sur une seule ligne (suppression des <br>)
            const fullConfigs = {
                "H": "1s¹", "He": "1s²",
                "Li": "1s² 2s¹", "Be": "1s² 2s²", "B": "1s² 2s² 2p¹", "C": "1s² 2s² 2p²", "N": "1s² 2s² 2p³", "O": "1s² 2s² 2p⁴", "F": "1s² 2s² 2p⁵", "Ne": "1s² 2s² 2p⁶",
                "Na": "1s² 2s² 2p⁶ 3s¹", "Mg": "1s² 2s² 2p⁶ 3s²", "Al": "1s² 2s² 2p⁶ 3s² 3p¹", "Si": "1s² 2s² 2p⁶ 3s² 3p²", "P": "1s² 2s² 2p⁶ 3s² 3p³", "S": "1s² 2s² 2p⁶ 3s² 3p⁴", "Cl": "1s² 2s² 2p⁶ 3s² 3p⁵", "Ar": "1s² 2s² 2p⁶ 3s² 3p⁶"
            };

            [...r1, ...r2, ...r3].forEach(id => {
                if (!id) { container.appendChild(document.createElement('div')); return; }
                let elData = elementsData.find(e => e.id === id) || {id: id, masse: ""};
                let cardOptions = { mode: 'atomic' }; // Affiche par défaut le symbole et Z

                if (mode === 'z-input' && toHideZ.includes(id)) {
                    cardOptions = { mode: 'inputAtomic', inputId: 'z-' + id.toLowerCase() };
                }

                let card = createCard(elData, false, cardOptions);
                card.draggable = false;
                card.style.cursor = mode === 'z-input' ? "help" : "default";

                // Formatage spécifique avec white-space: nowrap pour forcer l'affichage sur une ligne
                if (mode === 'all-configs') {
                    card.style.width = "140px"; card.style.height = "auto"; card.style.padding = "6px 2px";
                    let confDiv = document.createElement('div');
                    confDiv.innerHTML = fullConfigs[id];
                    confDiv.style.fontSize = "0.75em"; confDiv.style.color = "#495057"; confDiv.style.marginTop = "4px"; 
                    confDiv.style.textAlign = "center"; confDiv.style.whiteSpace = "nowrap"; 
                    card.appendChild(confDiv);
                }

                if (mode === 'col1' && ["H", "Li", "Na"].includes(id)) { card.classList.add('correct'); card.style.backgroundColor="#e6fffa"; }
                if (mode === 'col14' && ["C", "Si"].includes(id)) { card.classList.add('correct'); card.style.backgroundColor="#e6fffa"; }
                if (mode === 'col17' && ["F", "Cl"].includes(id)) { card.classList.add('correct'); card.style.backgroundColor="#e6fffa"; }

                container.appendChild(card);
            });
        };

        return [
            {
                type: "text", title: "Constitution actuelle du tableau",
                html: `<div class="box content is-medium">
                    <p class="has-text-weight-bold is-size-5">Amélioration des connaissances de la structure de la matière...</p>
                    <p>Au début du XXème siècle, des découvertes sur les particules qui constituent l'atome et sur sa structure permettent de voir le tableau périodique sous un jour nouveau.</p>
                    <p>Les activités qui suivent vont vous permettre de découvrir et de comprendre suivant quels critères le tableau périodique est actuellement construit.</p>
                </div>`
            },
            {
                type: "game", title: "Les numéros atomiques",
                html: `<div class="box content consigne-box">
                    <p>Complétez le tableau ci-dessous en y ajoutant les <strong>numéros atomiques Z</strong> demandés (cases avec " ? ") puis validez.</p>
                    <p class="is-size-7 has-text-grey">Astuce : <strong>Survolez les cases du tableau</strong> pour consulter le panneau d'information à droite.</p>
                </div>
                <div class="columns">
                    <div class="column">
                        <section class="game-area box has-background-light" style="height: 100%;">
                            <h3 class="title is-6 has-text-centered mt-2">Tableau actuel (simplifié)</h3>
                            <div id="grid-container" class="mt-4 mx-auto"></div>
                        </section>
                    </div>
                    ${infoPanelTemplate}
                </div>`,
                onLoad: () => { renderModernSimplifiedGrid(document.getElementById('grid-container'), 'z-input'); },
                validate: () => {
                    const toCheck = ["B", "C", "N", "O", "F", "Al", "Si", "P", "S", "Cl"];
                    let err = 0;
                    toCheck.forEach(id => {
                        const input = document.getElementById('z-' + id.toLowerCase());
                        if (input && parseInt(input.value.trim()) === zMap[id]) {
                            input.style.backgroundColor = "#e6fffa"; input.style.borderColor = "#00AA55";
                        } else {
                            if(input) { input.style.backgroundColor = "#ffe6e6"; input.style.borderColor = "#AA0055"; err++; }
                        }
                    });
                    if(err === 0) {
                        toCheck.forEach(id => document.getElementById('z-' + id.toLowerCase()).disabled = true);
                        return { success: true, msg: "Votre report des numéros atomiques dans le tableau est parfaitement correct." };
                    }
                    return { success: false, msg: `Revoyez les numéros atomiques des éléments concernés (survolez les cases). Il y a ${err} erreur(s).` };
                }
            },
            {
                type: "game", title: "Le critère de rangement en ligne",
                html: `<div class="box content consigne-box">
                    <p>D'après les nouveaux renseignements ainsi collectés, quel est le <u>critère</u> qui se dégage, dans ce tableau, <strong>pour décrire le rangement des éléments chimiques le long des LIGNES</strong> ?</p>
                    <div class="control mt-4">
                        <label class="radio is-block mb-2"><input type="radio" name="q_ligne" value="alpha" class="mr-2"> Les éléments sont classés par ordre alphabétique</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_ligne" value="hasard" class="mr-2"> Les éléments sont placés sans ordre particulier</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_ligne" value="z_decroissant" class="mr-2"> Les éléments sont rangés par numéro atomique décroissant</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_ligne" value="z_croissant" class="mr-2"> Les éléments sont rangés par numéro atomique croissant</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_ligne" value="annee" class="mr-2"> Les éléments sont classés suivant leur année de découverte</label>
                    </div>
                </div>
                <div class="box has-background-light">
                    <div id="grid-container" class="mx-auto" style="overflow-x: auto;"></div>
                </div>`,
                onLoad: () => { renderModernSimplifiedGrid(document.getElementById('grid-container'), 'show-z'); },
                validate: () => {
                    const r = document.querySelector('input[name="q_ligne"]:checked');
                    if(!r) return { success: false, msg: "Veuillez sélectionner une réponse." };
                    if(r.value === 'z_croissant') { 
                        document.querySelectorAll('input[name="q_ligne"]').forEach(i=>i.disabled=true); 
                        return { success: true, msg: "Effectivement, les éléments chimiques sont classés par numéro atomique croissant (et l'évolution est parfaitement régulière)." }; 
                    }
                    return { success: false, msg: "Observez la progression des numéros de gauche à droite dans la grille ci-dessous !"};
                }
            },
            {
                type: "game", title: "Structures électroniques (Colonne 1)",
                html: `<section class="game-area box has-background-light" style="height: 100%;">
                        <div class="box content consigne-box">
                            <p>Étudiez les <strong>structures électroniques</strong> en commençant par les éléments de la <strong>première colonne</strong> (en surbrillance).</p>
                            <p class="is-size-7 has-text-grey">Format attendu : <code>1s2 2s1</code> (espaces et exposants tolérés).</p>
                        </div>
                        <div id="grid-container" class="mt-4 mx-auto" style="margin-bottom: 30px;"></div>
                        
                        <div class="box mx-auto" style="max-width: 400px;">
                            <div class="field is-horizontal mb-2">
                                <div class="field-label is-normal"><label class="label" style="font-size: 1.3rem;"><sub>1</sub>H</label></div>
                                <div class="field-body"><div class="control"><input class="input has-text-weight-bold" type="text" id="conf-h" placeholder="ex: 1s1"></div></div>
                            </div>
                            <div class="field is-horizontal mb-2">
                                <div class="field-label is-normal"><label class="label" style="font-size: 1.3rem;"><sub>3</sub>Li</label></div>
                                <div class="field-body"><div class="control"><input class="input has-text-weight-bold" type="text" id="conf-li"></div></div>
                            </div>
                            <div class="field is-horizontal">
                                <div class="field-label is-normal"><label class="label" style="font-size: 1.3rem;"><sub>11</sub>Na</label></div>
                                <div class="field-body"><div class="control"><input class="input has-text-weight-bold" type="text" id="conf-na"></div></div>
                            </div>
                        </div>
                    </section>`,
                onLoad: () => { renderModernSimplifiedGrid(document.getElementById('grid-container'), 'col1'); },
                validate: () => {
                    const clean = (val) => val.replace(/\s+/g, '').replace(/²/g, '2').replace(/⁶/g, '6').replace(/¹/g, '1').toLowerCase();
                    let err = 0;
                    const check = (id, expected) => {
                        const el = document.getElementById(id);
                        if(clean(el.value) === expected) { el.classList.add('is-success'); el.classList.remove('is-danger'); }
                        else { el.classList.add('is-danger'); el.classList.remove('is-success'); err++; }
                    };
                    check('conf-h', '1s1'); check('conf-li', '1s22s1'); check('conf-na', '1s22s22p63s1');
                    if (err === 0) {
                        ['conf-h','conf-li','conf-na'].forEach(id => document.getElementById(id).disabled = true);
                        return { success: true, msg: "Bravo, aucune erreur. Vous êtes un as de la structure électronique ! Vous pouvez passer à la suite." };
                    }
                    return { success: false, msg: "Vous avez commis des erreurs. Revoyez l'ordre de remplissage (1s, 2s, 2p...)." };
                }
            },
            {
                type: "game", title: "Structures électroniques (Colonne 14)",
                html: `<section class="game-area box has-background-light" style="height: 100%;">
                        <div class="box content consigne-box">
                            <p>Suite des structures électroniques : éléments de la <strong>colonne 14</strong> (Carbone et Silicium).</p>
                        </div>
                        <div id="grid-container" class="mt-4 mx-auto" style="margin-bottom: 30px;"></div>
                        
                        <div class="box mx-auto" style="max-width: 400px;">
                            <div class="field is-horizontal mb-2">
                                <div class="field-label is-normal"><label class="label" style="font-size: 1.3rem;"><sub>6</sub>C</label></div>
                                <div class="field-body"><div class="control"><input class="input has-text-weight-bold" type="text" id="conf-c"></div></div>
                            </div>
                            <div class="field is-horizontal">
                                <div class="field-label is-normal"><label class="label" style="font-size: 1.3rem;"><sub>14</sub>Si</label></div>
                                <div class="field-body"><div class="control"><input class="input has-text-weight-bold" type="text" id="conf-si"></div></div>
                            </div>
                        </div>
                    </section>`,
                onLoad: () => { renderModernSimplifiedGrid(document.getElementById('grid-container'), 'col14'); },
                validate: () => {
                    const clean = (val) => val.replace(/\s+/g, '').replace(/²/g, '2').replace(/⁶/g, '6').replace(/⁴/g, '4').toLowerCase();
                    let err = 0;
                    const check = (id, expected) => {
                        const el = document.getElementById(id);
                        if(clean(el.value) === expected) { el.classList.add('is-success'); el.classList.remove('is-danger'); }
                        else { el.classList.add('is-danger'); el.classList.remove('is-success'); err++; }
                    };
                    check('conf-c', '1s22s22p2'); check('conf-si', '1s22s22p63s23p2');
                    if (err === 0) {
                        ['conf-c','conf-si'].forEach(id => document.getElementById(id).disabled = true);
                        return { success: true, msg: "Bravo, toujours aussi fort ! Vous pouvez passer aux éléments de la colonne 17." };
                    }
                    return { success: false, msg: "Attention ! Comptez bien le total des électrons pour arriver à Z." };
                }
            },
            {
                type: "game", title: "Structures électroniques (Colonne 17)",
                html: `<section class="game-area box has-background-light" style="height: 100%;">
                        <div class="box content consigne-box">
                            <p>Dernière vérification des structures électroniques : éléments de la <strong>colonne 17</strong> (famille des halogènes).</p>
                        </div>
                        <div id="grid-container" class="mt-4 mx-auto" style="margin-bottom: 30px;"></div>
                        
                        <div class="box mx-auto" style="max-width: 400px;">
                            <div class="field is-horizontal mb-2">
                                <div class="field-label is-normal"><label class="label" style="font-size: 1.3rem;"><sub>9</sub>F</label></div>
                                <div class="field-body"><div class="control"><input class="input has-text-weight-bold" type="text" id="conf-f"></div></div>
                            </div>
                            <div class="field is-horizontal">
                                <div class="field-label is-normal"><label class="label" style="font-size: 1.3rem;"><sub>17</sub>Cl</label></div>
                                <div class="field-body"><div class="control"><input class="input has-text-weight-bold" type="text" id="conf-cl"></div></div>
                            </div>
                        </div>
                    </section>`,
                onLoad: () => { renderModernSimplifiedGrid(document.getElementById('grid-container'), 'col17'); },
                validate: () => {
                    const clean = (val) => val.replace(/\s+/g, '').replace(/²/g, '2').replace(/⁶/g, '6').replace(/⁵/g, '5').toLowerCase();
                    let err = 0;
                    const check = (id, expected) => {
                        const el = document.getElementById(id);
                        if(clean(el.value) === expected) { el.classList.add('is-success'); el.classList.remove('is-danger'); }
                        else { el.classList.add('is-danger'); el.classList.remove('is-success'); err++; }
                    };
                    check('conf-f', '1s22s22p5'); check('conf-cl', '1s22s22p63s23p5');
                    if (err === 0) {
                        ['conf-f','conf-cl'].forEach(id => document.getElementById(id).disabled = true);
                        return { success: true, msg: "Bravo, vous êtes décidemment incollable. Vous pouvez passer au récapitulatif." };
                    }
                    return { success: false, msg: "Revoyez la capacité maximale des sous-couches s et p." };
                }
            },
            {
                type: "game", title: "Le critère de changement de ligne",
                html: `<div class="box content consigne-box">
                    <p>D'après <strong>les structures électroniques complétées dans le tableau ci-dessous</strong>, quel est le critère qui se dégage <strong>pour le changement de ligne dans ce tableau (c'est à dire ce qui déclenche l'ajout d'une ligne supplémentaire)</strong> ?</p>
                    <div class="control mt-4">
                        <label class="radio is-block mb-2"><input type="radio" name="q_periode" value="hasard" class="mr-2"> Il n'y a pas de raisons, c'est comme ça !</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_periode" value="couche" class="mr-2"> Le début du remplissage d'une nouvelle couche électronique principale (n=1, n=2, n=3...)</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_periode" value="ecran" class="mr-2"> Le manque de place sur l'écran</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_periode" value="internes" class="mr-2"> L'absence d'électrons dans les couches internes</label>
                    </div>
                </div>
                <div class="box has-background-light">
                    <div id="grid-container" class="mx-auto" style="overflow-x: auto;"></div>
                </div>`,
                onLoad: () => { renderModernSimplifiedGrid(document.getElementById('grid-container'), 'all-configs'); },
                validate: () => {
                    const r = document.querySelector('input[name="q_periode"]:checked');
                    if(!r) return { success: false, msg: "Veuillez sélectionner une réponse." };
                    if(r.value === 'couche') { 
                        document.querySelectorAll('input[name="q_periode"]').forEach(i=>i.disabled=true); 
                        return { success: true, msg: "Effectivement, à chaque début de ligne (H, Li, Na) correspond l'ajout d'un électron sur une couche principale supplémentaire (1s, puis 2s, puis 3s)." }; 
                    }
                    return { success: false, msg: "Essayez de réfléchir au point commun des éléments Li et Na (début des lignes 2 et 3) dans le tableau."};
                }
            },
            {
                type: "game", title: "Le critère de changement de colonne",
                html: `<div class="box content consigne-box">
                    <p>Toujours avec les renseignements de la grille ci-dessous, que remarque-t-on quant <strong>aux éléments chimiques d'une même colonne</strong> ?</p>
                    <div class="control mt-4">
                        <label class="radio is-block mb-2"><input type="radio" name="q_col" value="couches" class="mr-2"> Ils ont tous le même nombre de couches électroniques</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_col" value="alpha" class="mr-2"> Ils sont classés verticalement dans l'ordre alphabétique</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_col" value="rien" class="mr-2"> Rien de particulier n'est remarquable</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q_col" value="internes" class="mr-2"> Ils ont tous 10 électrons internes</label>
                        <label class="radio is-block"><input type="radio" name="q_col" value="valence" class="mr-2"> Ils ont tous le même nombre d'électrons sur leur couche externe (électrons de valence)</label>
                    </div>
                </div>
                <div class="box has-background-light">
                    <div id="grid-container" class="mx-auto" style="overflow-x: auto;"></div>
                </div>`,
                onLoad: () => { renderModernSimplifiedGrid(document.getElementById('grid-container'), 'all-configs'); },
                validate: () => {
                    const r = document.querySelector('input[name="q_col"]:checked');
                    if(!r) return { success: false, msg: "Veuillez sélectionner une réponse." };
                    if(r.value === 'valence') { 
                        document.querySelectorAll('input[name="q_col"]').forEach(i=>i.disabled=true); 
                        return { success: true, msg: "Oui, les éléments chimiques d'une même colonne sont effectivement caractérisés par le même nombre d'électrons périphériques (de valence)." }; 
                    }
                    return { success: false, msg: "Encore et toujours : OBSERVEZ et REFLECHISSEZ. Comparez les électrons de la dernière couche pour la colonne H-Li-Na, ou F-Cl."};
                }
            },
            {
                type: "text", title: "Conclusion",
                html: `<div class="box content is-medium">
                    <h3 class="title is-4 has-text-success"><i class="fas fa-check-circle mr-2"></i> Bilan de la classification</h3>
                    <p>Vous connaissez désormais les critères qui gouvernent la structure du tableau actuel :</p>
                    <ul>
                        <li>Les éléments sont rangés par <strong>numéro atomique croissant</strong>.</li>
                        <li>Le passage à une nouvelle ligne correspond au <strong>début de remplissage d'une nouvelle couche électronique principale</strong>.</li>
                        <li>Les éléments d'une même colonne possèdent le <strong>même nombre d'électrons de valence</strong>, ce qui explique leurs propriétés chimiques similaires (familles).</li>
                    </ul>
                    <p class="has-text-centered mt-5"><i class="fas fa-arrow-right has-text-link"></i> Vous pouvez maintenant passer à la <strong>Partie 3 (Comparaison)</strong>.</p>
                </div>`
            }
        ];
    })(),
    partie3: [
        {
            type: "text", title: "Le génie des travaux de Mendeleïev",
            html: `<div class="box content is-medium">
                <h3 class="title is-4"><i class="fas fa-lightbulb has-text-warning mr-2"></i> Un tableau prenant en compte des éléments inconnus...</h3>
                <p class="has-text-centered my-4"><img src="assets/tableau.png" alt="Tableau de Mendeleiev" class="box is-inline-block p-1" style="max-width: 350px;"></p>
                <p>En 1870, la classification de Mendeleïev passa presque inaperçue des milieux scientifiques qui ne lui trouvaient que peu d'intérêt.</p>
                <p>Pourtant, le contenu du tableau confronté à des découvertes réalisées quelques années plus tard allait révéler l'aspect génial de ce travail et entraîner la reconnaissance de Mendeleïev.</p>
            </div>`
        },
        {
            type: "game", title: "Les trous du tableau",
            html: `<div class="box content"><p>Entre le zinc (Zn) et l'arsenic (As), Mendeleiev a laissé <span class="has-text-danger has-text-weight-bold">deux places vacantes</span> alors que dans l'ordre des masses atomiques As vient juste après Zn.</p></div>
            <div class="columns">
                <div class="column">
                    <section class="game-area box has-background-light" style="height: 100%;">
                        <div class="box consigne-box">
                            <p class="has-text-weight-bold mb-3">Pourquoi Mendeleiev n'a-t-il pas placé As en dessous de Al ou de Si ? <span class="has-text-grey is-size-7 has-text-weight-normal">(observez les propriétés...)</span></p>
                            <div class="control">
                                <label class="radio is-block mb-2"><input type="radio" name="reponse" value="a" class="mr-2"> aucune raison particulière, juste par amusement</label>
                                <label class="radio is-block mb-2"><input type="radio" name="reponse" value="b" class="mr-2"> parce que l'arsenic est très toxique et qu'il était ainsi mis en évidence</label>
                                <label class="radio is-block mb-2"><input type="radio" name="reponse" value="c" class="mr-2"> parce que As n'a aucun point commun avec Al ou Si alors qu'il "ressemble" à P</label>
                                <label class="radio is-block"><input type="radio" name="reponse" value="d" class="mr-2"> parce que l'arsenic est beaucoup trop lourd</label>
                            </div>
                        </div>
                        <div class="mendeleev-grid mt-4" id="grid-container"></div>
                    </section>
                </div>
                ${infoPanelTemplate}
            </div>`,
            onLoad: () => renderMendeleevGrid(document.getElementById('grid-container'), { mode: 'hole' }),
            validate: () => {
                const r = document.querySelector('input[name="reponse"]:checked');
                if(!r) return { success: false, msg: "Veuillez sélectionner une réponse." };
                if(r.value === 'c') { document.querySelectorAll('input[name="reponse"]').forEach(i=>i.disabled=true); return { success: true, msg: "Oui ! En appliquant strictement la règle des \"ressemblances chimiques et physiques\", As ne peut être situé qu'en dessous de P." }; }
                return { success: false, msg: "Non. Observez attentivement les propriétés chimiques de As et comparez-les aux colonnes."};
            }
        },
        {
            type: "game", title: "Les prévisions",
            html: `<div class="columns">
                <div class="column">
                    <section class="game-area box has-background-light" style="height: 100%;">
                        <div class="box content consigne-box">
                            <p>Mendeleiev a prévu que devraient y prendre place deux éléments non encore identifiés. Il n'a fallu que quelques années pour que ces deux éléments soient découverts :</p>
                            <ul><li>En 1875 : le <strong>"Gallium"</strong></li><li>En 1886 : le <strong>"Germanium"</strong></li></ul>
                            <p class="has-text-link has-text-weight-bold mt-3"><i class="fas fa-edit mr-2"></i> Complétez le tableau ci-dessous avec les symboles de ces éléments (deux lettres).</p>
                        </div>
                        <div class="mendeleev-grid mt-4" id="grid-container"></div>
                    </section>
                </div>
                ${infoPanelTemplate}
            </div>`,
            onLoad: () => renderMendeleevGrid(document.getElementById('grid-container'), { mode: 'input' }),
            validate: () => {
                const ga = document.getElementById('input-ga').value.trim(); const ge = document.getElementById('input-ge').value.trim();
                let ok = 0; if(ga === "Ga") ok++; if(ge === "Ge") ok++;
                if(ok === 2) { 
                    document.getElementById('input-ga').disabled = true; document.getElementById('input-ge').disabled = true; 
                    document.getElementById('input-ga').parentElement.classList.add('correct'); document.getElementById('input-ge').parentElement.classList.add('correct');
                    return { success: true, msg: "Bien. Ces deux éléments apparaissent effectivement sous ces symboles dans notre tableau actuel." }; 
                }
                return { success: false, msg: `Il y a des erreurs. Attention aux majuscules/minuscules (ex: Ga, Ge).` };
            }
        },
        {
            type: "game", title: "Les numéros atomiques",
            html: `<section class="game-area box has-background-light" >
                <div class="box content consigne-box">
                    <p class="has-text-weight-bold"><i class="fas fa-list-ol mr-2"></i> Vous pouvez désormais ajouter dans ce tableau les <span class="has-text-danger">numéros atomiques</span> du gallium et du germanium (inconnus à l'époque de Mendeleiev).</p>
                </div>
                <div class="mendeleev-grid mt-4 mx-auto" id="grid-container" style="width: 984px;"></div>
            </section>`,
            onLoad: () => renderMendeleevGrid(document.getElementById('grid-container'), { mode: 'atomic_input' }),
            validate: () => {
                const r1 = document.getElementById('rep1').value.trim(); const r2 = document.getElementById('rep2').value.trim();
                let ok = 0; if(r1 === "31") ok++; if(r2 === "32") ok++;
                if(ok === 2) { document.getElementById('rep1').disabled = true; document.getElementById('rep2').disabled = true; return { success: true, msg: "Parfait ! Vous avez bien assimilé que les numéros atomiques se suivent le long des lignes." }; }
                return { success: false, msg: `Non ! Rappelez-vous le critère actuel de classement des éléments le long des lignes...` };
            }
        },
        {
            type: "game", title: "Exceptions aux règles",
            html: `<div class="columns">
                <div class="column">
                    <section class="game-area box has-background-light" style="height: 100%;">
                        <div class="box content consigne-box">
                            <p>Dans certains cas, Mendeleiev n'a pas hésité à <strong>adapter et contourner les règles</strong> qu'il s'était fixées.</p>
                            <p class="has-text-link has-text-weight-bold"><i class="fas fa-hand-pointer mr-2"></i> Vous devez placer dans la cinquième ligne de l'extrait du tableau ci-dessous les trois éléments Sb, I et Te.</p>
                        </div>
                        <div class="card-pool mb-4" id="card-pool"></div>
                        <div class="box has-background-white is-inline-block mx-auto" style="display: flex; flex-direction: column; align-items: center;">
                            <div style="display: grid; grid-template-columns: 140px repeat(3, 70px); gap: 10px; justify-items: center; align-items: center;">
                                <div class="has-text-weight-bold has-text-grey is-size-7">-- 4ème ligne --</div><div class="slot" id="slot-As"></div><div class="slot" id="slot-Se"></div><div class="slot" id="slot-Br"></div>
                                <div class="has-text-weight-bold has-text-grey is-size-7">-- 5ème ligne --</div><div class="slot placeholder" id="zone-1"></div><div class="slot placeholder" id="zone-2"></div><div class="slot placeholder" id="zone-3"></div>
                            </div>
                        </div>
                    </section>
                </div>
                ${infoPanelTemplate}
            </div>`,
            onLoad: () => {
                const pool = document.getElementById('card-pool');
                const updates = [
                    { id: "Sb", nom: "ANTIMOINE", masse: "122", formule: "Sb", propPhy: "* Solide cassant", propChi: "* Dérivés toxiques", composes: "SbH<sub>3</sub>&nbsp;&nbsp;Sb<sub>2</sub>O<sub>5</sub>" },
                    { id: "Te", nom: "TELLURE", masse: "128", formule: "Te", propPhy: "* Solide cristallin", propChi: "* Brûle dans le dioxygène", composes: "H<sub>2</sub>Te&nbsp;&nbsp;TeO<sub>2</sub>" },
                    { id: "I", nom: "IODE", masse: "127", formule: "I<sub>2</sub>", propPhy: "* Vapeurs violettes", propChi: "* Réagit avec les métaux", composes: "NaI&nbsp;&nbsp;HI" },
                    { id: "Se", nom: "SELENIUM", masse: "79,0", formule: "Se", propPhy: "* Photoconducteur", propChi: "* Dérivés très toxiques", composes: "H<sub>2</sub>Se&nbsp;&nbsp;SeO<sub>2</sub>" }
                ];
                updates.forEach(u => { const idx = elementsData.findIndex(e=>e.id===u.id); if(idx!==-1) elementsData[idx]=u; else elementsData.push(u); });
                ['As', 'Se', 'Br'].forEach(id => { const s = document.getElementById('slot-'+id); const d = elementsData.find(e=>e.id===id); if(d&&s){ const c = createCard(d, false); c.style.margin="0"; s.appendChild(c); }});
                ["Sb", "I", "Te"].forEach(id => { const d = elementsData.find(e=>e.id===id); if(d) pool.appendChild(createCard(d, true)); });
                ['zone-1','zone-2','zone-3'].forEach(id => { const z = document.getElementById(id); z.addEventListener('dragover',commonAllowDrop); z.addEventListener('drop',handleCardDrop); });
                pool.addEventListener('dragover', commonAllowDrop); pool.addEventListener('drop', handleCardDrop);
            },
            validate: () => {
                document.querySelectorAll('.element-card').forEach(c => c.classList.remove('correct', 'incorrect'));
                const check = (id, exp) => { const z=document.getElementById(id); if(z.children.length>0 && z.children[0].id===exp) { z.children[0].classList.add('correct'); return 1; } else if(z.children.length>0) { z.children[0].classList.add('incorrect'); } return 0; };
                let ok = check('zone-1', 'Sb') + check('zone-2', 'Te') + check('zone-3', 'I');
                if (ok === 3) { document.querySelectorAll('.element-card').forEach(c => c.draggable = false); return { success: true, msg: "Correct ! Mendeleiev a inversé Iode et Tellure pour respecter les propriétés chimiques, malgré leurs masses." }; }
                return { success: false, msg: "Il y a des erreurs. Observez bien les propriétés chimiques (formules des composés) par rapport à la ligne du dessus."};
            }
        },
        {
            type: "game", title: "La colonne manquante",
            html: `<section class="game-area box has-background-light">
                <div class="box content consigne-box">
                    <p>Dans le tableau de Mendeleiev, <strong class="has-text-danger">la dernière colonne</strong> (celle des éléments aujourd'hui dénommés "gaz rares") <strong class="has-text-danger">était manquante.</strong></p>
                    <p class="has-text-weight-bold mb-3"><i class="fas fa-question-circle mr-2"></i> Pour quelle raison en était-il ainsi ?</p>
                    <div class="control">
                        <label class="radio is-block mb-2"><input type="radio" name="q1" value="a" class="mr-2">Ces gaz étant rares, ils n'avaient pu être découverts</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q1" value="b" class="mr-2">Mendeleiev ne les a pas placés dans son tableau car il ne leur trouvait aucun intérêt</label>
                        <label class="radio is-block mb-2"><input type="radio" name="q1" value="d" class="mr-2">Les gaz rares étant chimiquement inertes, ils n'ont pas de propriétés chimiques et ne pouvaient donc pas être découverts par réaction</label>
                        <label class="radio is-block"><input type="radio" name="q1" value="e" class="mr-2">Les gaz rares n'existaient pas encore à l'époque de Mendeleiev</label>
                    </div>
                </div>
                <div class="grid-missing-col mt-4" id="grid-container"></div>
            </section>`,
            onLoad: () => {
                const g = document.getElementById('grid-container');
                const add = (id) => g.appendChild(createCard(elementsData.find(e=>e.id===id), false));
                const gap = (n) => { for(let i=0; i<n; i++) g.appendChild(document.createElement('div')); };
                const mis = () => { const d=document.createElement('div'); d.className='element-card missing'; d.textContent="?"; d.title="Famille inconnue à l'époque"; g.appendChild(d); };
                add("H"); gap(6); mis(); ["Li","Be","B","C","N","O","F"].forEach(add); mis(); ["Na","Mg","Al","Si","P","S","Cl"].forEach(add); mis();
            },
            validate: () => {
                const r = document.querySelector('input[name="q1"]:checked');
                if(!r) return { success: false, msg: "Veuillez sélectionner une réponse." };
                if(r.value === 'd') { document.querySelectorAll('input[name="q1"]').forEach(i=>i.disabled=true); return { success: true, msg: "En effet ! Les gaz rares ne réagissant avec aucun autre élément, ils passaient inaperçus." }; }
                return { success: false, msg: "Non. Ce n'est pas la bonne raison. Relisez bien les propositions."};
            }
        },
        {
            type: "game", title: "La continuité",
            html: `<section class="game-area box has-background-light">
                <div class="box content consigne-box">
                    <p class="has-text-weight-bold"><i class="fas fa-keyboard mr-2"></i> Indiquez dans le tableau ci-dessous les <strong class="has-text-danger">numéros atomiques</strong> des gaz rares.</p>
                </div>
                <div class="grid-missing-col mt-4" id="grid-container"></div>
            </section>`,
            onLoad: () => {
                const g = document.getElementById('grid-container');
                const add = (id) => g.appendChild(createCard(elementsData.find(e=>e.id===id), false, {mode:'atomic'}));
                const gap = (n) => { for(let i=0; i<n; i++) g.appendChild(document.createElement('div')); };
                const inp = (id) => g.appendChild(createCard({id:"?"}, false, {mode:'inputAtomic', inputId:id}));
                add("H"); gap(6); inp("rep1"); ["Li","Be","B","C","N","O","F"].forEach(add); inp("rep2"); ["Na","Mg","Al","Si","P","S","Cl"].forEach(add); inp("rep3");
            },
            validate: () => {
                const reponses = [document.getElementById('rep1').value.trim(), document.getElementById('rep2').value.trim(), document.getElementById('rep3').value.trim()];
                const solutions = ["2", "10", "18"]; let ok = 0;
                for(let i=0; i<3; i++) {
                    const input = document.getElementById(`rep${i+1}`);
                    if(reponses[i] === solutions[i]) { ok++; input.style.backgroundColor = "#d4edda"; input.style.borderColor = "#28a745"; } 
                    else { input.style.backgroundColor = "#f8d7da"; input.style.borderColor = "#dc3545"; }
                }
                if(ok === 3) { for(let i=1; i<=3; i++) document.getElementById(`rep${i}`).disabled = true; return { success:true, msg:"Bien. La continuité des numéros atomiques est désormais parfaite sur le tableau." }; }
                return { success:false, msg:`Non ! Vous avez commis ${3-ok} erreur(s).`};
            }
        },
        {
            type: "game", title: "Les gaz nobles (suite)",
            html: `<section class="game-area box has-background-light">
                <div class="box content consigne-box">
                    <p>Il ne vous reste plus qu'à ajouter au tableau les <strong class="has-text-danger">symboles chimiques</strong> des gaz rares avant de valider.</p>
                    <p class="is-size-7 has-text-grey">(Ils ont pour noms, dans l'ordre : <strong class="has-text-link">hélium, néon, argon</strong>).</p>
                </div>
                <div class="grid-missing-col mt-4" id="grid-container"></div>
            </section>`,
            onLoad: () => {
                const g = document.getElementById('grid-container');
                const add = (id) => g.appendChild(createCard(elementsData.find(e=>e.id===id), false, {mode:'atomic'}));
                const inp = (z, id) => g.appendChild(createCard({id:"unknown", z:z}, false, {mode:'atomic_inputSymbol', inputId:id}));
                add("H"); const sp = document.createElement('div'); sp.className='spacer-row1'; g.appendChild(sp); inp(2, "rep1");
                ["Li","Be","B","C","N","O","F"].forEach(add); inp(10, "rep2");
                ["Na","Mg","Al","Si","P","S","Cl"].forEach(add); inp(18, "rep3");
            },
            validate: () => {
                const reponses = [document.getElementById('rep1').value.trim(), document.getElementById('rep2').value.trim(), document.getElementById('rep3').value.trim()];
                const solutions = ["He", "Ne", "Ar"]; let ok = 0;
                for(let i=0; i<3; i++) {
                    const parent = document.getElementById(`rep${i+1}`).parentElement;
                    if(reponses[i] === solutions[i]) { ok++; parent.classList.add('correct'); parent.classList.remove('incorrect'); parent.style.borderStyle = "solid"; } 
                    else { parent.classList.add('incorrect'); parent.classList.remove('correct'); parent.style.borderStyle = "solid"; }
                }
                if(ok === 3) { for(let i=1; i<=3; i++) document.getElementById(`rep${i}`).disabled = true; return { success:true, msg:"Bien. Ce sont les bons symboles pour l'hélium, le néon et l'argon." }; }
                return { success:false, msg:`Non ! Respectez les majuscules / minuscules.`};
            }
        },
        {
            type: "game", title: "Conclusion",
            html: `<div class="columns">
                <div class="column">
                    <section class="game-area box has-background-light" style="height: 100%;">
                        <div class="box content has-background-success-light" style="border-left: 4px solid #48c774;">
                            <p class="has-text-weight-bold is-size-5 mb-2"><i class="fas fa-trophy has-text-success mr-2"></i> Félicitations</p>
                            <p>Le tableau est désormais complet et son étude dans sa version actuelle parallèlement à la version de Mendeleiev est terminée.</p>
                        </div>
                        <div id="grid-container" class="mt-4"></div>
                    </section>
                </div>
                ${infoPanelTemplate}
            </div>`,
            onLoad: () => {
                const nobleGases = [
                    { id: "He", nom: "HELIUM", masse: "4,0", formule: "He", propPhy: "* Gaz incolore<br>* Très léger", propChi: "* Inerte (ne réagit pas)", composes: "Aucun composé stable connu" },
                    { id: "Ne", nom: "NEON", masse: "20,2", formule: "Ne", propPhy: "* Gaz incolore<br>* Emet une lumière rouge intense", propChi: "* Chimiquement inerte", composes: "Aucun composé naturel" },
                    { id: "Ar", nom: "ARGON", masse: "39,9", formule: "Ar", propPhy: "* Gaz incolore<br>* 1% de l'atmosphère", propChi: "* Extrêmement stable", composes: "Aucun à température ambiante" }
                ];
                nobleGases.forEach(g => { if(!elementsData.find(e=>e.id===g.id)) elementsData.push(g); });
                renderMendeleevGrid(document.getElementById('grid-container'), { mode: 'final' });
                document.getElementById('global-btn-next').style.display = 'none';
                document.getElementById('global-btn-home').style.display = 'inline-block';
            }
        }
    ]
};

// ==========================================
// MOTEUR SPA (ROUTEUR avec Bulma)
// ==========================================
function renderHome() {
    currentPart = ""; document.getElementById('global-controls').style.display = 'none';
    document.getElementById('spa-container').innerHTML = `
        <div class="columns is-desktop is-variable is-4">
            
            <div class="column is-7">
                <div class="box content is-medium" style="min-height: 100%;">
                    <img src="assets/portrait.jpg" alt="Portrait de Mendeleiev" class="box p-1" style="max-width: 140px; float: left; margin: 0 20px 10px 0;">
                    <p>Vous connaissez tous les classifications périodiques qui ornent les murs de tous les laboratoires de chimie.</p>
                    <p> Dans ce grand tableau sont rangés tous les éléments chimiques, qu'ils existent dans la nature ou qu'ils aient été synthétisés dans les accélérateurs de particules.</p>
                    <p class="has-text-weight-bold has-text-primary has-text-centered mt-4">Comment ce tableau a-t-il été initialement conçu ?</p>
                    <p class="has-text-weight-bold has-text-primary has-text-centered mt-4">Comment est-il construit aujourd'hui ?</p>
                    <p>Le TP qui suit va vous permettre de répondre à ces questions en reconstruisant la démarche historique de son créateur.</p>
                </div>
            </div>

            <div class="column is-5">
                <h3 class="title is-4 mb-3 has-text-grey-dark"><i class="fas fa-list-ul mr-2"></i> Sommaire du TP</h3>
                <div class="is-flex is-flex-direction-column" style="gap: 12px;">
                    
                    <button class="button is-link is-light is-justify-content-flex-start is-flex-wrap-wrap h-auto p-4" style="height: auto; white-space: normal;" onclick="startPart('partie1')">
                        <div class="has-text-left w-full" style="width: 100%;">
                            <strong class="is-block mb-1 is-size-5"><i class="fas fa-play-circle mr-2"></i>1. La démarche historique</strong>
                            <span class="is-size-7 is-block">Reconstituez la démarche de Mendeleïev pour créer le premier tableau.</span>
                        </div>
                    </button>
                    
                    <button class="button is-link is-light is-justify-content-flex-start is-flex-wrap-wrap h-auto p-4" style="height: auto; white-space: normal;" onclick="startPart('partie2')">
                        <div class="has-text-left w-full" style="width: 100%;">
                            <strong class="is-block mb-1 is-size-5"><i class="fas fa-play-circle mr-2"></i>2. Les critères actuels</strong>
                            <span class="is-size-7 is-block">Comprendre le rangement moderne des éléments.</span>
                        </div>
                    </button>
                    
                    <button class="button is-link is-light is-justify-content-flex-start is-flex-wrap-wrap h-auto p-4" style="height: auto; white-space: normal;" onclick="startPart('partie3')">
                        <div class="has-text-left w-full" style="width: 100%;">
                            <strong class="is-block mb-1 is-size-5"><i class="fas fa-play-circle mr-2"></i>3. Comparaison</strong>
                            <span class="is-size-7 is-block">Le génie de Mendeleïev face à la science moderne.</span>
                        </div>
                    </button>
                    
                </div>
                
                <div class="box mt-5 has-background-white-ter border-left-danger" style="border-left: 4px solid #f14668;">
                    <h3 class="title is-5 mb-2"><i class="fas fa-file-pdf has-text-danger mr-2"></i>Documents PDF</h3>
                    <div class="is-flex is-flex-direction-column" style="gap: 8px;">
                        <a href="assets/cartes.pdf" target="_blank" class="has-text-link is-size-7" disabled><i class="fas fa-download mr-1"></i> Cartes à imprimer</a>
                        <!-- <a href="images/Etude_classif_periodique.pdf" target="_blank" class="has-text-link is-size-7"><i class="fas fa-download mr-1"></i> Énoncé complet du TP</a> -->
                        <a href="assets/tableau_simplifie.pdf" target="_blank" class="has-text-link is-size-7"><i class="fas fa-download mr-1"></i> Tableau simplifié</a>
                    </div>
                </div>
            </div>

        </div>`;
}

function startPart(partKey) { currentPart = partKey; currentStepIndex = 0; renderStep(); }

function renderStep() {
    const step = STRUCTURE_TP[currentPart][currentStepIndex];
    document.getElementById('spa-container').innerHTML = step.html;
    
    const ctrl = document.getElementById('global-controls'); ctrl.style.display = 'block';
    const btnVerif = document.getElementById('global-btn-verif'); 
    const btnAction = document.getElementById('global-btn-action');
    const msgBox = document.getElementById('global-message-box');
    const btnNext = document.getElementById('global-btn-next');
    
    msgBox.innerHTML = ""; msgBox.className = "has-text-centered";
    
    if (step.type === "game") { btnNext.style.display = 'none'; } 
    else { btnNext.style.display = 'inline-block'; }
    
    btnNext.disabled = false;
    document.getElementById('global-btn-home').style.display = 'none';

    if (step.type === "game" && step.validate) { 
        btnVerif.style.display = "inline-flex"; 
        btnVerif.disabled = false; 
        btnVerif.onclick = executeValidation; 
    } else { 
        btnVerif.style.display = "none"; 
    }

    if (step.actionLabel && step.onAction) { 
        btnAction.style.display = "inline-flex"; 
        btnAction.textContent = step.actionLabel; 
        btnAction.onclick = step.onAction; 
    } else { 
        btnAction.style.display = "none"; 
    }

    if (step.onLoad) step.onLoad();
}

function executeValidation() {
    const res = STRUCTURE_TP[currentPart][currentStepIndex].validate();
    const msgBox = document.getElementById('global-message-box');
    
    // Remplacement par les notifications natives de Bulma
    msgBox.innerHTML = res.msg; 
    msgBox.className = res.success ? "notification is-success is-light py-2 px-4 m-0" : "notification is-danger is-light py-2 px-4 m-0";
    
    if (res.success) { 
        const btnNext = document.getElementById('global-btn-next');
        btnNext.style.display = 'inline-flex'; 
        btnNext.disabled = false; 
    }
}

document.getElementById('global-btn-prev').onclick = () => { if (currentStepIndex > 0) { currentStepIndex--; renderStep(); } else { renderHome(); } };
document.getElementById('global-btn-next').onclick = () => { if (currentStepIndex < STRUCTURE_TP[currentPart].length - 1) { currentStepIndex++; renderStep(); } else { renderHome(); } };
document.getElementById('global-btn-home').onclick = () => { renderHome(); };
window.onload = () => { renderHome(); };

// ==========================================
// ECOUTEURS GLOBAUX (RACCOURCIS CLAVIER)
// ==========================================
document.addEventListener('keydown', (event) => {
    // Force le passage à la suite (pour les professeurs / débuggage) avec "Ctrl + Flèche Droite"
    if (event.ctrlKey && event.key === 'ArrowRight') {
        event.preventDefault(); // Empêche un comportement par défaut indésirable
        if (currentPart !== "") {
            if (currentStepIndex < STRUCTURE_TP[currentPart].length - 1) {
                currentStepIndex++;
                renderStep();
            } else {
                renderHome();
            }
        }
    }
});