/* --- game.js (Chevauchement horizontal + Hauteur compacte) --- */

const zMap = { "H": 1, "He": 2, "Li": 3, "Be": 4, "B": 5, "C": 6, "N": 7, "O": 8, "F": 9, "Ne": 10, "Na": 11, "Mg": 12, "Al": 13, "Si": 14, "P": 15, "S": 16, "Cl": 17, "Ar": 18, "K": 19, "Ca": 20, "Sc": 21, "Ti": 22, "V": 23, "Cr": 24, "Mn": 25, "Fe": 26, "Co": 27, "Ni": 28, "Cu": 29, "Zn": 30, "Ga": 31, "Ge": 32, "As": 33, "Se": 34, "Br": 35, "Kr": 36 };

function showInfo(id) {
    const data = elementsData.find(e => e.id === id);
    if (!data) return;
    const setHTML = (elemId, html) => { const el = document.getElementById(elemId); if (el) el.innerHTML = html; };
    const setText = (elemId, txt) => { const el = document.getElementById(elemId); if (el) el.textContent = txt; };
    setText('info-nom', data.nom); setText('info-symbole', data.id); setText('info-masse', data.masse);
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
            html: `<div class="box content">
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
            html: `<div class="box content">
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
            html: `<div class="box content">
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
            html: `<div class="box content"><p>L'Hydrogène est resté à part. Etudiez ses propriétés pour lui trouver une position qui soit en accord avec les principes établis jusqu'ici.</p></div>
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
                        <div class="box has-background-info-light" style="border-left: 4px solid #3298dc;">
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
                        <div class="box content has-background-info-light" style="border-left: 4px solid #3298dc;">
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
            html: `<section class="game-area box has-background-light">
                <div class="box content has-background-info-light" style="border-left: 4px solid #3298dc;">
                    <p class="has-text-weight-bold"><i class="fas fa-list-ol mr-2"></i> Vous pouvez désormais ajouter dans ce tableau les <span class="has-text-danger">numéros atomiques</span> du gallium et du germanium (inconnus à l'époque de Mendeleiev).</p>
                </div>
                <div class="mendeleev-grid mt-4" id="grid-container"></div>
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
                        <div class="box content has-background-info-light" style="border-left: 4px solid #3298dc;">
                            <p>Dans certains cas, Mendeleiev n'a pas hésité à <strong>adapter et contourner les règles</strong> qu'il s'était fixées.</p>
                            <p class="has-text-link has-text-weight-bold"><i class="fas fa-hand-pointer mr-2"></i> Vous devez placer dans la fifth ligne de l'extrait du tableau ci-dessous les trois éléments Sb, I et Te.</p>
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
                    { id: "Sb", nom: "ANTIMOINE", masse: "121,8", formule: "Sb", propPhy: "* Solide cassant", propChi: "* Dérivés toxiques", composes: "SbH<sub>3</sub>&nbsp;&nbsp;Sb<sub>2</sub>O<sub>5</sub>" },
                    { id: "Te", nom: "TELLURE", masse: "127,6", formule: "Te", propPhy: "* Solide cristallin", propChi: "* Brûle dans le dioxygène", composes: "H<sub>2</sub>Te&nbsp;&nbsp;TeO<sub>2</sub>" },
                    { id: "I", nom: "IODE", masse: "126,9", formule: "I<sub>2</sub>", propPhy: "* Vapeurs violettes", propChi: "* Réagit avec les métaux", composes: "NaI&nbsp;&nbsp;HI" },
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
                <div class="box content has-background-info-light" style="border-left: 4px solid #3298dc;">
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
                <div class="box content has-background-info-light" style="border-left: 4px solid #3298dc;">
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
                <div class="box content has-background-info-light" style="border-left: 4px solid #3298dc;">
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
                    <img src="assets/portrait.jpg" alt="Portrait de Mendeleiev" class="box p-1" style="max-width: 150px; float: left; margin: 0 20px 10px 0;">
                    <p>Vous connaissez tous les classifications périodiques qui ornent les murs de tous les laboratoires de chimie. Dans ce grand tableau sont rangés tous les éléments chimiques, qu'ils existent dans la nature ou qu'ils aient été synthétisés dans les accélérateurs de particules.</p>
                    <p class="has-text-weight-bold has-text-info mt-4">Comment ce tableau a-t-il été initialement conçu ? Comment est-il construit aujourd'hui ?</p>
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
                    
                    <button class="button is-static is-justify-content-flex-start is-flex-wrap-wrap h-auto p-4" style="height: auto; white-space: normal;">
                        <div class="has-text-left w-full" style="width: 100%;">
                            <strong class="is-block mb-1 is-size-5 has-text-grey"><i class="fas fa-lock mr-2"></i>2. Les critères actuels</strong>
                            <span class="is-size-7 is-block has-text-grey">Comprendre le rangement moderne des éléments.</span>
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
                        <a href="images/jeu_cartes_mendeleiev.pdf" target="_blank" class="has-text-link is-size-7"><i class="fas fa-download mr-1"></i> Cartes à imprimer</a>
                        <a href="images/Etude_classif_periodique.pdf" target="_blank" class="has-text-link is-size-7"><i class="fas fa-download mr-1"></i> Énoncé complet du TP</a>
                        <a href="images/tableau_simplifie.pdf" target="_blank" class="has-text-link is-size-7"><i class="fas fa-download mr-1"></i> Tableau simplifié</a>
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