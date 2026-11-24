/* --- game.js --- */

// ==========================================
// 1. ÉTAT GLOBAL & BARRE DES CEINTURES
// ==========================================
const SESSION_STORAGE_KEY = 'phyweb_force2_progress';
let currentPart = "";
let currentStepIndex = 0;
let completedBelts = new Set();
let bleuEvalFirstTrySuccess = true; // Passe à false si erreur sur les étapes 4 à 6 du niveau Bleu
let vectorDragAbortController = null;

function saveProgress() {
    try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            currentPart,
            currentStepIndex,
            completedBelts: Array.from(completedBelts),
            bleuEvalFirstTrySuccess
        }));
    } catch (e) {
        // Ignore si sessionStorage est indisponible
    }
}

function loadProgress() {
    try {
        const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (Array.isArray(data.completedBelts)) {
            completedBelts = new Set(data.completedBelts);
        }
        if (typeof data.bleuEvalFirstTrySuccess === 'boolean') {
            bleuEvalFirstTrySuccess = data.bleuEvalFirstTrySuccess;
        }
        if (data.currentPart && STRUCTURE_TP[data.currentPart]) {
            const idx = Number(data.currentStepIndex);
            if (Number.isInteger(idx) && idx >= 0 && idx < STRUCTURE_TP[data.currentPart].length) {
                currentPart = data.currentPart;
                currentStepIndex = idx;
                return true;
            }
        }
    } catch (e) {
        // Ignore si données corrompues ou sessionStorage indisponible
    }
    return false;
}

window.resetSessionProgress = function() {
    completedBelts.clear();
    bleuEvalFirstTrySuccess = true;
    currentPart = "";
    currentStepIndex = 0;
    try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
        // Ignore
    }
    renderHome();
};

function cleanupStepEvents() {
    if (vectorDragAbortController) {
        vectorDragAbortController.abort();
        vectorDragAbortController = null;
    }
    window.isDraggingVector = false;
}

function updateBeltBar() {
    const bar = document.getElementById('belt-tracker');
    if (!currentPart) {
        bar.style.display = 'none';
        return;
    }
    bar.style.display = 'flex';
    ['bleu', 'vert', 'jaune', 'orange', 'rouge'].forEach(b => {
        const el = document.getElementById('belt-' + b);
        if (!el) return;
        el.classList.remove('active', 'completed');
        if (completedBelts.has(b)) el.classList.add('completed');
        if (currentPart === b) el.classList.add('active');
    });
}

function jumpToBelt(belt) {
    startPart(belt, 0);
}

// ==========================================
// 2. MOTEUR INTERACTIF : NIVEAU BLEU
// ==========================================
function buildBleuStep(item, isLast = false) {
    return {
        type: "game",
        title: item.title,
        requirePaperConfirm: Boolean(item.paperNotice),
        html: `
            <div class="box content consigne-box">
                <div class="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap" style="gap: 8px;">
                    <span class="is-size-6"><strong>Système étudié (Receveur) : <span class="tag is-link is-medium">${item.receveur}</span></strong> — Sélectionnez chaque donneur qui agit sur <em>${item.receveur}</em>, complétez sa carte, puis cliquez sur <strong>Valider</strong>.</span>
                    ${item.evalMode
                        ? `<span class="tag is-primary is-light is-normal has-text-weight-semibold"><i class="fas fa-star mr-1"></i>Test de passage direct → Jaune</span>`
                        : `<span class="tag is-light is-normal"><i class="fas fa-graduation-cap mr-1"></i>Entraînement guidé</span>`}
                    ${item.airNeglected ? `<span class="tag is-info is-light is-normal"><i class="fas fa-wind mr-1"></i>Hypothèse : on néglige l'action de l'air</span>` : ''}
                    ${item.paperNotice ? `<span class="tag is-warning is-light is-medium has-text-weight-bold">${item.paperNotice}</span>` : ''}
                </div>
            </div>
            <div class="columns is-variable is-4 mb-0">
                <div class="column is-5">
                    <div class="scene-box h-100">
                        <div class="scene-svg-container mb-3">${SCENE_SVGS[item.svg]}</div>
                        <p class="is-size-6 has-text-grey-dark has-text-weight-semibold has-text-centered mb-2">Qui agit sur <strong>${item.receveur}</strong> ? (Cliquez pour ajouter / retirer)</p>
                        <div id="actors-pool" class="is-flex is-flex-wrap-wrap is-justify-content-center" style="gap: 8px;"></div>
                        <div id="trap-feedback" class="notification is-danger is-light mt-3 py-2 px-3 is-size-6" style="display:none; width:100%;"></div>
                    </div>
                </div>
                <div class="column is-7">
                    <div class="box has-background-white-bis p-4" style="min-height: 330px; height: 100%;">
                        <h4 class="title is-5 mb-3"><i class="fas fa-list-check has-text-info mr-2"></i>Actions mécaniques identifiées :</h4>
                        <div id="actions-cards-container">
                            <p class="has-text-grey is-italic is-size-6" id="empty-actions-hint">Cliquez sur un donneur sous l'image pour ajouter une action mécanique...</p>
                        </div>
                    </div>
                </div>
            </div>`,
        onLoad: () => {
            window.currentBleuSelected = new Set();
            const pool = document.getElementById('actors-pool');
            const container = document.getElementById('actions-cards-container');
            const trapBox = document.getElementById('trap-feedback');

            const updateEmptyHint = () => {
                const hint = document.getElementById('empty-actions-hint');
                if (hint) hint.style.display = window.currentBleuSelected.size === 0 ? 'block' : 'none';
            };

            const removeCandidate = (candId) => {
                window.currentBleuSelected.delete(candId);
                const chip = document.getElementById('chip-bleu-' + candId);
                if (chip) chip.classList.remove('selected', 'trap-shake');
                const card = document.getElementById('card-act-' + candId);
                if (card) card.remove();
                updateEmptyHint();
            };

            item.candidates.forEach(cand => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.id = 'chip-bleu-' + cand.id;
                btn.className = 'actor-chip';
                btn.innerHTML = cand.label;
                btn.onclick = () => {
                    trapBox.style.display = 'none';
                    btn.classList.remove('trap-shake');
                    if (window.currentBleuSelected.has(cand.id)) {
                        removeCandidate(cand.id);
                        return;
                    }
                    window.currentBleuSelected.add(cand.id);
                    btn.classList.add('selected');
                    updateEmptyHint();

                    const card = document.createElement('div');
                    card.className = 'action-detail-card';
                    card.id = 'card-act-' + cand.id;
                    card.innerHTML = `
                        <div class="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap mb-2" style="gap: 6px;">
                            <div class="is-flex is-align-items-center" style="gap: 6px;">
                                <span class="tag is-dark is-normal">Donneur : ${cand.label}</span>
                                <button type="button" class="delete is-small" aria-label="Retirer ${cand.id}" title="Retirer ce donneur"></button>
                            </div>
                            <div class="is-flex is-align-items-center" style="gap: 8px;">
                                <span class="is-size-6 has-text-weight-bold">Type :</span>
                                <div class="buttons has-addons m-0">
                                    <button type="button" class="button is-small type-btn-${cand.id}" data-val="contact" onclick="selectBleuType('${cand.id}', 'contact')">De contact</button>
                                    <button type="button" class="button is-small type-btn-${cand.id}" data-val="distance" onclick="selectBleuType('${cand.id}', 'distance')">À distance</button>
                                </div>
                            </div>
                        </div>
                        <div class="is-size-6 is-flex is-align-items-center is-flex-wrap-wrap mt-2" style="gap: 6px;">
                            <span><em>« C'est une action</em></span>
                            <div class="select is-small">
                                <select id="sel-prep-${cand.id}">
                                    <option value="">-- choisir --</option>
                                    ${item.candidates.map(c => `<option value="${c.prep || c.label}">${c.prep || ('de ' + c.label)}</option>`).join('')}
                                    <option value="de ${item.receveur}">de ${item.receveur}</option>
                                </select>
                            </div>
                            <span><em>sur</em></span>
                            <div class="select is-small">
                                <select id="sel-rec-${cand.id}">
                                    <option value="">-- choisir --</option>
                                    <option value="${item.receveur}">${item.receveur}</option>
                                    <option value="la Terre">la Terre</option>
                                    <option value="le sol">le sol</option>
                                </select>
                            </div>
                            <span><em>»</em></span>
                        </div>
                    `;
                    card.querySelector('.delete').addEventListener('click', () => {
                        trapBox.style.display = 'none';
                        removeCandidate(cand.id);
                    });
                    container.appendChild(card);
                };
                pool.appendChild(btn);
            });
        },
        validate: () => {
            const trapBox = document.getElementById('trap-feedback');
            trapBox.style.display = 'none';

            // 1. Vérifier les intrus sélectionnés (validation différée anti-clic au hasard)
            const selectedTraps = item.candidates.filter(c => !c.valid && window.currentBleuSelected.has(c.id));
            if (selectedTraps.length > 0) {
                if (item.evalMode) bleuEvalFirstTrySuccess = false;
                selectedTraps.forEach(t => {
                    const chip = document.getElementById('chip-bleu-' + t.id);
                    if (chip) {
                        chip.classList.remove('trap-shake');
                        void chip.offsetWidth;
                        chip.classList.add('trap-shake');
                    }
                    const card = document.getElementById('card-act-' + t.id);
                    if (card) card.className = 'action-detail-card incorrect';
                });
                trapBox.innerHTML = `<i class="fas fa-exclamation-triangle mr-1"></i> ${selectedTraps[0].trapMsg}`;
                trapBox.style.display = 'block';
                return {
                    success: false,
                    msg: `Intrus sélectionné (${selectedTraps[0].label}) : retire-le en cliquant dessus ou sur la croix !`
                };
            }

            // 2. Vérifier qu'il ne manque pas de donneurs valides
            const validCands = item.candidates.filter(c => c.valid);
            const missingCount = validCands.filter(c => !window.currentBleuSelected.has(c.id)).length;
            if (missingCount > 0) {
                if (item.evalMode) bleuEvalFirstTrySuccess = false;
                return {
                    success: false,
                    msg: `Il manque encore <strong>${missingCount} donneur(s)</strong> qui agissent sur ${item.receveur}.`
                };
            }

            // 3. Vérifier le détail de chaque carte (type, préposition, receveur)
            let errors = 0;
            validCands.forEach(cand => {
                const card = document.getElementById('card-act-' + cand.id);
                const chosenType = card.getAttribute('data-type');
                const selPrep = document.getElementById('sel-prep-' + cand.id);
                const selRec = document.getElementById('sel-rec-' + cand.id);

                const typeOk = chosenType === cand.type;
                const prepOk = selPrep.value === cand.prep;
                const recOk = selRec.value === item.receveur;

                selPrep.parentElement.classList.toggle('is-danger', !prepOk);
                selPrep.parentElement.classList.toggle('is-success', prepOk);
                selRec.parentElement.classList.toggle('is-danger', !recOk);
                selRec.parentElement.classList.toggle('is-success', recOk);

                if (typeOk && prepOk && recOk) {
                    card.className = 'action-detail-card correct';
                } else {
                    card.className = 'action-detail-card incorrect';
                    errors++;
                }
            });

            if (errors > 0) {
                if (item.evalMode) bleuEvalFirstTrySuccess = false;
                return { success: false, msg: `Il y a <strong>${errors} erreur(s)</strong> dans les cartes en rouge (vérifie le type et la phrase).` };
            }

            if (isLast) {
                completedBelts.add('bleu');
                updateBeltBar();
                if (bleuEvalFirstTrySuccess) {
                    return {
                        success: true,
                        msg: `🎉 <strong>Niveau Bleu réussi sans erreur !</strong> Recopie ta trace écrite papier puis passe directement au <strong>Niveau JAUNE</strong> !`,
                        nextOverride: { part: 'jaune', step: 0 }
                    };
                } else {
                    return {
                        success: true,
                        msg: `👍 Niveau Bleu terminé ! Recopie ta trace écrite papier puis passons par le <strong>Niveau VERT</strong> pour consolider tout ça.`,
                        nextOverride: { part: 'vert', step: 0 }
                    };
                }
            }
            return { success: true, msg: "Exact ! Toutes les actions mécaniques sur ce système sont bien identifiées." };
        }
    };
}

window.selectBleuType = function(candId, val) {
    const card = document.getElementById('card-act-' + candId);
    if (!card) return;
    card.setAttribute('data-type', val);
    document.querySelectorAll('.type-btn-' + candId).forEach(b => {
        if (b.getAttribute('data-val') === val) b.classList.add('is-info', 'is-selected');
        else b.classList.remove('is-info', 'is-selected');
    });
};

// ==========================================
// 3. MOTEUR INTERACTIF : NIVEAU VERT
// ==========================================
function buildVertStep(batchIndex, items) {
    return {
        type: "game",
        title: batchIndex === 0 ? "Niveau Vert — Situations 1 à 3" : "Niveau Vert — Situations 4 à 6",
        html: `
            <div class="box content consigne-box">
                <p class="mb-0 is-size-6">Indiquez pour chaque objet proposé s'il agit <strong>par contact</strong>, <strong>à distance</strong>, ou s'il <strong>n'agit pas directement</strong> sur le receveur étudié.</p>
            </div>
            <div class="columns is-variable is-3 mb-0">
                ${items.map(it => `
                    <div class="column is-4">
                        <div class="box h-100 p-3" id="vcard-${it.id}">
                            <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                                <span class="has-text-weight-bold is-size-6">${it.title}</span>
                                <span class="tag is-info is-light is-normal">Receveur : <strong>&nbsp;${it.receveur}</strong></span>
                            </div>
                            ${it.airNeglected ? `<p class="is-size-7 has-text-info mb-2"><i class="fas fa-wind mr-1"></i>Hypothèse : on néglige l'action de l'air.</p>` : ''}
                            <div class="scene-svg-container mb-3" style="max-width:100%; height:150px;">${SCENE_SVGS[it.svg]}</div>
                            ${it.options.map(opt => `
                                <div class="is-flex is-justify-content-space-between is-align-items-center mb-2 pb-1" style="border-bottom: 1px solid #f1f5f9; gap: 6px;">
                                    <span class="is-size-6 has-text-weight-semibold" style="line-height:1.15;">${opt.label}</span>
                                    <div class="select is-small" style="flex-shrink:0;">
                                        <select id="vsel-${it.id}-${opt.id}">
                                            <option value="">-- Action ? --</option>
                                            <option value="contact">Contact</option>
                                            <option value="distance">À distance</option>
                                            <option value="none">Aucune (Intrus)</option>
                                        </select>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>`,
        validate: () => {
            let err = 0;
            let unanswered = 0;
            items.forEach(it => {
                let cardOk = true;
                it.options.forEach(opt => {
                    const sel = document.getElementById(`vsel-${it.id}-${opt.id}`);
                    if (!sel.value) { unanswered++; cardOk = false; }
                    else if (sel.value !== opt.expected) {
                        err++; cardOk = false;
                        sel.parentElement.classList.add('is-danger');
                        sel.parentElement.classList.remove('is-success');
                    } else {
                        sel.parentElement.classList.add('is-success');
                        sel.parentElement.classList.remove('is-danger');
                    }
                });
                const box = document.getElementById(`vcard-${it.id}`);
                box.style.border = cardOk ? "2px solid var(--success-color)" : "2px solid var(--error-color)";
            });

            if (unanswered > 0) return { success: false, msg: `Veuillez renseigner toutes les listes déroulantes (${unanswered} restante(s)).` };
            if (err > 0) return { success: false, msg: `Il reste <strong>${err} erreur(s)</strong> (encadrées en rouge).` };

            if (batchIndex === 1) {
                completedBelts.add('vert');
                updateBeltBar();
                return {
                    success: true,
                    msg: "Bravo ! Le niveau Vert est validé. Passons aux Diagrammes Objet-Interactions (Niveau Jaune) !",
                    nextOverride: { part: 'jaune', step: 0 }
                };
            }
            return { success: true, msg: "Parfait pour ces 3 premières situations !" };
        }
    };
}

// ==========================================
// 4. MOTEUR INTERACTIF : NIVEAU JAUNE (OBJETS EN RECTANGLES DANS LE D.O.I)
// ==========================================
function buildJauneStep(item, isLast = false) {
    return {
        type: "game",
        title: item.title,
        requirePaperConfirm: Boolean(item.paperNotice),
        actionLabel: "Réinitialiser",
        onAction: () => {
            window.doiActors = {};
            renderDoiWorkspace(item);
        },
        html: `
            <div class="box content consigne-box">
                <div class="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap" style="gap: 8px;">
                    <span class="is-size-6"><strong>1.</strong> Cliquez sur un objet pour l'ajouter ou le retirer. &nbsp;|&nbsp; <strong>2. Cliquez sur une flèche</strong> pour basculer entre <strong>Trait plein (Contact)</strong> et <strong>Pointillés (À distance)</strong>.</span>
                    ${item.airNeglected ? `<span class="tag is-info is-light is-normal"><i class="fas fa-wind mr-1"></i>Hypothèse : on néglige l'action de l'air</span>` : ''}
                    ${item.paperNotice ? `<span class="tag is-warning is-light is-medium has-text-weight-bold">${item.paperNotice}</span>` : ''}
                </div>
            </div>
            <div class="columns is-variable is-4 mb-0">
                <div class="column is-4">
                    <div class="scene-box h-100">
                        <div class="scene-svg-container mb-3">${SCENE_SVGS[item.svg]}</div>
                        <p class="is-size-6 has-text-weight-bold mb-2">Objets disponibles (Cliquez) :</p>
                        <div id="doi-pool" class="is-flex is-flex-wrap-wrap is-justify-content-center" style="gap: 8px;"></div>
                    </div>
                </div>
                <div class="column is-8">
                    <div class="doi-workspace h-100">
                        <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                            <span class="is-size-6 has-text-grey-dark"><i class="fas fa-mouse-pointer mr-1"></i> Cliquez sur une double flèche : Plein (Contact) ⟷ Pointillés (À distance)</span>
                            <span class="tag is-warning is-light is-medium has-text-weight-bold">Système : ${item.systeme}</span>
                        </div>
                        <svg id="doi-canvas" class="doi-svg" viewBox="0 0 580 310"></svg>
                    </div>
                </div>
            </div>`,
        onLoad: () => {
            window.doiActors = {};
            renderDoiWorkspace(item);
        },
        validate: () => {
            const placed = Object.keys(window.doiActors);
            const expectedKeys = Object.keys(item.expected);

            for (let p of placed) {
                if (!expectedKeys.includes(p)) {
                    return {
                        success: false,
                        msg: `L'objet <strong>« ${p} »</strong> n'interagit pas directement avec <em>${item.systeme}</em> ! ${item.trapHint || 'Clique dessus pour le retirer.'}`
                    };
                }
            }
            if (placed.length < expectedKeys.length) {
                return {
                    success: false,
                    msg: `Diagramme incomplet : il manque <strong>${expectedKeys.length - placed.length} objet(s)</strong> en interaction avec <em>${item.systeme}</em>.`
                };
            }
            for (let k of expectedKeys) {
                if (window.doiActors[k] !== item.expected[k]) {
                    const attendu = item.expected[k] === 'contact' ? 'un trait PLEIN (action de contact)' : 'des POINTILLÉS (action à distance)';
                    return {
                        success: false,
                        msg: `Entre <strong>${k}</strong> et <strong>${item.systeme}</strong>, il faut ${attendu}. Clique sur la flèche pour la modifier !`
                    };
                }
            }

            if (isLast) {
                completedBelts.add('jaune');
                updateBeltBar();
                return {
                    success: true,
                    msg: "🎉 Félicitations ! Tu maîtrises les D.O.I. Direction le <strong>Niveau ORANGE</strong> pour tracer les vecteurs forces !",
                    nextOverride: { part: 'orange', step: 0 }
                };
            }
            return { success: true, msg: "D.O.I parfait !" };
        }
    };
}

function renderDoiWorkspace(item) {
    const pool = document.getElementById('doi-pool');
    const svg = document.getElementById('doi-canvas');
    if (!pool || !svg) return;

    pool.innerHTML = '';
    item.pool.forEach(actorName => {
        const isPlaced = window.doiActors.hasOwnProperty(actorName);
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'actor-chip ' + (isPlaced ? 'selected' : '');
        chip.innerHTML = (isPlaced ? '<i class="fas fa-check"></i> ' : '<i class="fas fa-plus"></i> ') + actorName;
        chip.onclick = () => {
            if (window.doiActors.hasOwnProperty(actorName)) {
                delete window.doiActors[actorName];
            } else {
                window.doiActors[actorName] = 'contact';
            }
            renderDoiWorkspace(item);
        };
        pool.appendChild(chip);
    });

    const cx = 290, cy = 150;
    const positions = [
        { x: 115, y: 70 },
        { x: 465, y: 70 },
        { x: 290, y: 255 },
        { x: 115, y: 235 },
        { x: 465, y: 235 }
    ];

    let svgHTML = `
        <defs>
            <marker id="doi-arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e293b"/>
            </marker>
        </defs>
    `;

    // Demi-hauteur des rectangles d'objets (largeur adaptée au texte)
    const halfH = 27;

    const placedNames = Object.keys(window.doiActors);
    placedNames.forEach((name, idx) => {
        const pos = positions[idx % positions.length];
        const type = window.doiActors[name];
        const dash = type === 'distance' ? 'stroke-dasharray="8,6"' : '';
        const halfW = Math.max(68, Math.ceil(name.length * 4.5) + 14);

        const dx = pos.x - cx;
        const dy = pos.y - cy;
        const angle = Math.atan2(dy, dx);

        // Point de départ sur l'ovale central (Système : rx=70, ry=36)
        const startX = cx + Math.cos(angle) * 72;
        const startY = cy + Math.sin(angle) * 38;

        // Point d'arrivée sur le bord du RECTANGLE de l'objet
        const absCos = Math.abs(Math.cos(angle));
        const absSin = Math.abs(Math.sin(angle));
        const distRect = Math.min(
            absCos > 0.001 ? (halfW + 3) / absCos : 1000,
            absSin > 0.001 ? (halfH + 3) / absSin : 1000
        );
        const endX = pos.x - Math.cos(angle) * distRect;
        const endY = pos.y - Math.sin(angle) * distRect;

        // Objet représenté par un RECTANGLE et Système par un OVALE !
        svgHTML += `
            <g class="doi-line-group" data-doi-toggle="${idx}" style="cursor:pointer;">
                <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" class="doi-line-hit"/>
                <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" class="doi-line-vis" ${dash}
                      marker-start="url(#doi-arrow-end)" marker-end="url(#doi-arrow-end)"/>
            </g>
            <g transform="translate(${pos.x}, ${pos.y})" data-doi-remove="${idx}" style="cursor:pointer;">
                <title>Cliquer pour retirer du diagramme</title>
                <rect x="${-halfW}" y="${-halfH}" width="${halfW * 2}" height="${halfH * 2}" rx="4" fill="#ffffff" stroke="#2563eb" stroke-width="2.5"/>
                <text x="0" y="5" text-anchor="middle" fill="#1e293b" font-size="14" font-weight="bold">${name}</text>
            </g>
        `;
    });

    // Ovale central du Système étudié
    svgHTML += `
        <g transform="translate(${cx}, ${cy})">
            <ellipse cx="0" cy="0" rx="70" ry="36" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/>
            <text x="0" y="6" text-anchor="middle" fill="#713f12" font-size="16" font-weight="bold">${item.systeme}</text>
        </g>
    `;

    svg.innerHTML = svgHTML;

    svg.querySelectorAll('[data-doi-toggle]').forEach(el => {
        const name = placedNames[Number(el.getAttribute('data-doi-toggle'))];
        el.addEventListener('click', () => window.toggleDoiArrow(name));
    });
    svg.querySelectorAll('[data-doi-remove]').forEach(el => {
        const name = placedNames[Number(el.getAttribute('data-doi-remove'))];
        el.addEventListener('click', () => window.removeDoiActor(name));
    });
}

window.toggleDoiArrow = function(name) {
    if (!window.doiActors || !window.doiActors[name]) return;
    window.doiActors[name] = window.doiActors[name] === 'contact' ? 'distance' : 'contact';
    const stepObj = STRUCTURE_TP[currentPart][currentStepIndex];
    if (stepObj && stepObj.itemRef) renderDoiWorkspace(stepObj.itemRef);
};

window.removeDoiActor = function(name) {
    if (!window.doiActors) return;
    delete window.doiActors[name];
    const stepObj = STRUCTURE_TP[currentPart][currentStepIndex];
    if (stepObj && stepObj.itemRef) renderDoiWorkspace(stepObj.itemRef);
};

// ==========================================
// 5. MOTEUR INTERACTIF : NIVEAU ORANGE (VECTEURS FORCES)
// ==========================================
function buildOrangeStep(item, isLast = false) {
    return {
        type: "game",
        title: item.title,
        requirePaperConfirm: Boolean(item.paperNotice),
        actionLabel: "Effacer les flèches",
        onAction: () => {
            window.drawnVectors = {};
            renderVectorCanvas(item);
        },
        html: `
            <div class="box content consigne-box">
                <div class="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap" style="gap: 8px;">
                    <span class="is-size-6"><strong>${item.subtitle}</strong> Sélectionnez la force à droite puis tirez la flèche depuis un point d'ancrage bleu (●).</span>
                    ${item.airNeglected ? `<span class="tag is-info is-light is-normal"><i class="fas fa-wind mr-1"></i>Hypothèse : on néglige l'action de l'air</span>` : ''}
                    ${item.paperNotice ? `<span class="tag is-warning is-light is-medium has-text-weight-bold">${item.paperNotice}</span>` : ''}
                </div>
            </div>
            <div class="columns is-variable is-4 mb-0">
                <!-- VOLET GAUCHE : CARACTÉRISTIQUES -->
                <div class="column is-6">
                    ${item.forces.map(f => `
                        <div class="box p-3 mb-3" id="fcard-${f.id}" style="border-left: 5px solid ${f.color};">
                            <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                                <span class="is-size-5 has-text-weight-bold" style="color:${f.color};">Force ${f.htmlLabel}</span>
                                ${f.givenValue ? `<span class="tag is-dark is-normal">Valeur : ${f.givenValue}</span>` : ''}
                            </div>
                            <div class="columns is-mobile is-multiline is-variable is-2 m-0">
                                <div class="column is-12 py-1">
                                    <label class="is-size-6 has-text-weight-semibold">Point d'application :</label>
                                    <div class="select is-small is-fullwidth mt-1">
                                        <select id="f-pt-${f.id}">
                                            <option value="">-- Choisir le point d'application --</option>
                                            ${f.pointOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="column is-6 py-1">
                                    <label class="is-size-6 has-text-weight-semibold">Direction :</label>
                                    <div class="select is-small is-fullwidth mt-1">
                                        <select id="f-dir-${f.id}">
                                            <option value="">-- Choisir --</option>
                                            <option value="verticale">Verticale (↕)</option>
                                            <option value="horizontale">Horizontale (↔)</option>
                                            <option value="selon le fil (oblique)">Selon le fil (⤡)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="column is-6 py-1">
                                    <label class="is-size-6 has-text-weight-semibold">Sens :</label>
                                    <div class="select is-small is-fullwidth mt-1">
                                        <select id="f-sens-${f.id}">
                                            <option value="">-- Choisir --</option>
                                            <option value="vers le bas">Vers le bas (↓)</option>
                                            <option value="vers le haut">Vers le haut (↑)</option>
                                            <option value="vers la gauche">Vers la gauche (←)</option>
                                            <option value="vers la droite (vers l'aimant)">Vers la droite (→)</option>
                                            <option value="vers le haut / vers le fil">Selon le fil (↖)</option>
                                        </select>
                                    </div>
                                </div>
                                ${f.askValue ? `
                                    <div class="column is-12 py-1 mt-1">
                                        <div class="is-flex is-align-items-center" style="gap: 8px;">
                                            <label class="is-size-6 has-text-weight-bold">Valeur déduite :</label>
                                            <input type="text" id="f-val-${f.id}" class="input is-small" style="max-width: 100px;" placeholder="ex: 0,56">
                                            <span class="is-size-6 has-text-weight-bold">N</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- VOLET DROIT : TRACEUR DE VECTEURS SUR SCHÉMA -->
                <div class="column is-6">
                    <div class="box p-3 h-100 is-flex is-flex-direction-column align-items-center justify-content-center">
                        <div class="buttons is-centered mb-2" id="vector-tool-tabs">
                            ${item.forces.map(f => `
                                <button type="button" class="button is-normal force-tab-btn" id="vtab-${f.id}"
                                        style="background-color: ${f.color}; color: white;"
                                        onclick="selectVectorTool('${f.id}')">
                                    <i class="fas fa-pen mr-2"></i>
                                    <span class="force-btn-label">Tracer ${f.htmlLabel}</span>
                                </button>
                            `).join('')}
                        </div>
                        <div class="vector-canvas-wrap">
                            <svg id="vector-svg" class="vector-svg" viewBox="0 0 360 250"></svg>
                        </div>
                        <div id="vector-live-info" class="is-size-6 has-text-grey-dark has-text-centered mt-2">
                            Cliquez sur un point d'ancrage bleu (●) et glissez pour tracer le vecteur.
                        </div>
                    </div>
                </div>
            </div>`,
        onLoad: () => {
            window.activeForceId = item.forces[0].id;
            window.drawnVectors = {};
            window.isDraggingVector = false;
            selectVectorTool(item.forces[0].id);
            initVectorCanvasEvents(item);
            renderVectorCanvas(item);
        },
        validate: () => {
            let textErrors = 0;
            const wrongFields = new Set();

            for (let f of item.forces) {
                const ptEl = document.getElementById('f-pt-' + f.id);
                const dirEl = document.getElementById('f-dir-' + f.id);
                const sensEl = document.getElementById('f-sens-' + f.id);
                const card = document.getElementById('fcard-' + f.id);

                const ptOk = ptEl.value === f.expectedPoint;
                const dirOk = dirEl.value === f.expectedDirection;
                const sensOk = sensEl.value === f.expectedSens;

                ptEl.parentElement.classList.toggle('is-danger', !ptOk);
                ptEl.parentElement.classList.toggle('is-success', ptOk);
                dirEl.parentElement.classList.toggle('is-danger', !dirOk);
                dirEl.parentElement.classList.toggle('is-success', dirOk);
                sensEl.parentElement.classList.toggle('is-danger', !sensOk);
                sensEl.parentElement.classList.toggle('is-success', sensOk);

                if (!ptOk) wrongFields.add("le point d'application");
                if (!dirOk) wrongFields.add("la direction");
                if (!sensOk) wrongFields.add("le sens");

                let valOk = true;
                if (f.askValue) {
                    const valEl = document.getElementById('f-val-' + f.id);
                    const valStr = valEl.value.replace(',', '.').trim();
                    const val = parseFloat(valStr);
                    valOk = !(valStr === '' || isNaN(val) || Math.abs(val - f.expectedValue) > 0.02);
                    valEl.classList.toggle('is-danger', !valOk);
                    valEl.classList.toggle('is-success', valOk);
                    if (!valOk) wrongFields.add("la valeur");
                }

                const ok = ptOk && dirOk && sensOk && valOk;
                if (!ok) {
                    textErrors++;
                    card.style.backgroundColor = '#fef2f2';
                } else {
                    card.style.backgroundColor = '#f0fdf4';
                }
            }

            if (textErrors > 0) {
                const details = Array.from(wrongFields).join(', ');
                return {
                    success: false,
                    msg: `Vérifie les champs en rouge à gauche : <strong>${details}</strong>.`
                };
            }

            for (let f of item.forces) {
                const vec = window.drawnVectors[f.id];
                if (!vec || vec.length < 22) {
                    return {
                        success: false,
                        msg: `Tu n'as pas encore tracé le vecteur <strong>${f.htmlLabel}</strong> sur le schéma à droite !`
                    };
                }
                if (vec.anchorId !== f.expectedAnchor) {
                    return {
                        success: false,
                        msg: `Le vecteur <strong>${f.htmlLabel}</strong> ne part pas du bon point d'application sur le schéma !`
                    };
                }
                const diff = Math.abs((((vec.angle - f.expectedAngle) % 360) + 540) % 360 - 180);
                const tol = f.angleTolerance || 18;
                if (diff > tol) {
                    if (Math.abs(diff - 180) <= tol) {
                        return {
                            success: false,
                            msg: item.reverseSensHint
                                ? item.reverseSensHint
                                : `Bonne <strong>direction</strong> pour <strong>${f.htmlLabel}</strong>, mais le <strong>sens</strong> est inversé !`
                        };
                    }
                    return {
                        success: false,
                        msg: `La <strong>direction</strong> (droite d'action) du vecteur <strong>${f.htmlLabel}</strong> tracé est incorrecte.`
                    };
                }
            }

            if (item.compareLengthRule === "Fraq_gt_P") {
                const lenP = window.drawnVectors["P"].length;
                const lenF = window.drawnVectors["Fraq"].length;
                if (lenF <= lenP * 1.25) {
                    return {
                        success: false,
                        msg: `F<sub>raquette/balle</sub> (10 N) est beaucoup plus grande que P (0,56 N) : la flèche bleue doit être nettement plus longue que la rouge !`
                    };
                }
            }

            if (item.equalLengthPair) {
                const [idA, idB] = item.equalLengthPair;
                const lenA = window.drawnVectors[idA].length;
                const lenB = window.drawnVectors[idB].length;
                if (Math.abs(lenA - lenB) > 16) {
                    const fA = item.forces.find(f => f.id === idA);
                    const fB = item.forces.find(f => f.id === idB);
                    return {
                        success: false,
                        msg: `Le système est immobile (en équilibre) : ${fA.htmlLabel} et ${fB.htmlLabel} se compensent et doivent donc avoir la même longueur !`
                    };
                }
            }

            if (isLast) {
                completedBelts.add('orange');
                updateBeltBar();
                return {
                    success: true,
                    msg: "🎉 Bravo ! Tu maîtrises le tracé des vecteurs forces. Tu débloques le <strong>Niveau ROUGE</strong> final !",
                    nextOverride: { part: 'rouge', step: 0 }
                };
            }
            return { success: true, msg: "Parfait ! Caractéristiques et représentation vectorielle exactes." };
        }
    };
}

window.selectVectorTool = function(forceId) {
    window.activeForceId = forceId;
    document.querySelectorAll('.force-tab-btn').forEach(btn => {
        if (btn.id === 'vtab-' + forceId) btn.classList.add('is-active-tab');
        else btn.classList.remove('is-active-tab');
    });
};

function getSvgCoords(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function initVectorCanvasEvents(item) {
    cleanupStepEvents();
    const svg = document.getElementById('vector-svg');
    if (!svg) return;

    vectorDragAbortController = new AbortController();
    const { signal } = vectorDragAbortController;

    const startDrag = (clientX, clientY) => {
        const coords = getSvgCoords(svg, clientX, clientY);
        let bestAnchor = null;
        let minDist = 28;
        item.anchors.forEach(a => {
            const d = Math.hypot(coords.x - a.x, coords.y - a.y);
            if (d < minDist) {
                minDist = d;
                bestAnchor = a;
            }
        });
        if (!bestAnchor) return;

        window.isDraggingVector = true;
        window.dragCurrentAnchor = bestAnchor;
        window.drawnVectors[window.activeForceId] = {
            anchorId: bestAnchor.id,
            x1: bestAnchor.x,
            y1: bestAnchor.y,
            x2: coords.x,
            y2: coords.y,
            angle: 0,
            length: 0
        };
        renderVectorCanvas(item);
    };

    const moveDrag = (clientX, clientY) => {
        if (!window.isDraggingVector) return;
        const coords = getSvgCoords(svg, clientX, clientY);
        const vec = window.drawnVectors[window.activeForceId];
        if (!vec) return;

        let dx = coords.x - vec.x1;
        let dy = coords.y - vec.y1;
        let len = Math.min(Math.hypot(dx, dy), 115);
        let rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);

        let snappedAngle = Math.round(rawAngle / 15) * 15;
        let rad = snappedAngle * (Math.PI / 180);

        vec.x2 = vec.x1 + Math.cos(rad) * len;
        vec.y2 = vec.y1 + Math.sin(rad) * len;
        vec.angle = snappedAngle;
        vec.length = Math.round(len);

        const info = document.getElementById('vector-live-info');
        if (info) {
            info.innerHTML = `Départ : <strong>${window.dragCurrentAnchor.label}</strong> | Longueur : <strong>${ (len / 25).toFixed(1) } cm</strong>`;
        }
        renderVectorCanvas(item);
    };

    const endDrag = () => {
        window.isDraggingVector = false;
    };

    svg.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY), { signal });
    window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY), { signal });
    window.addEventListener('mouseup', endDrag, { signal });

    svg.addEventListener('touchstart', e => {
        if (e.touches.length > 0) {
            e.preventDefault();
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false, signal });
    window.addEventListener('touchmove', e => {
        if (window.isDraggingVector && e.touches.length > 0) {
            moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false, signal });
    window.addEventListener('touchend', endDrag, { signal });
}

function renderVectorCanvas(item) {
    const svg = document.getElementById('vector-svg');
    if (!svg) return;

    let html = `
        <defs>
            ${item.forces.map(f => `
                <marker id="vhead-${f.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="${f.color}"/>
                </marker>
            `).join('')}
        </defs>
        <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
        </pattern>
        <rect width="360" height="250" fill="url(#smallGrid)"/>
        ${item.modelShape}
    `;

    item.anchors.forEach(a => {
        html += `
            <g>
                <circle cx="${a.x}" cy="${a.y}" r="7" class="anchor-point">
                    <title>${a.label}</title>
                </circle>
                <line x1="${a.x - 4}" y1="${a.y}" x2="${a.x + 4}" y2="${a.y}" stroke="#1e3a8a" stroke-width="1.5" pointer-events="none"/>
                <line x1="${a.x}" y1="${a.y - 4}" x2="${a.x}" y2="${a.y + 4}" stroke="#1e3a8a" stroke-width="1.5" pointer-events="none"/>
            </g>
        `;
    });

    item.forces.forEach(f => {
        const v = window.drawnVectors[f.id];
        if (v && v.length > 8) {
            const sym = f.svgSymbol || f.id;
            const sub = f.svgSub || "";
            const subWidth = sub ? sub.length * 5.2 + 2 : 0;
            const boxW = Math.max(24, Math.ceil(16 + subWidth));
            const boxH = 22;

            let lx = (v.x1 + v.x2) / 2 + (v.angle === 90 || v.angle === -90 ? (boxW / 2 + 12) : 0);
            let ly = (v.y1 + v.y2) / 2 + (v.angle === 0 || v.angle === 180 ? -16 : 0);
            lx = Math.max(boxW / 2 + 4, Math.min(356 - boxW / 2, lx));
            ly = Math.max(16, Math.min(238, ly));

            const textStartX = lx - (subWidth / 2) - 4;
            const arrowY = ly - 7;
            html += `
                <g pointer-events="none">
                    <line x1="${v.x1}" y1="${v.y1}" x2="${v.x2}" y2="${v.y2}"
                          stroke="${f.color}" stroke-width="4" stroke-linecap="round"
                          marker-end="url(#vhead-${f.id})"/>
                    <rect x="${lx - boxW / 2}" y="${ly - 13}" width="${boxW}" height="${boxH}" rx="4" fill="rgba(255,255,255,0.9)" stroke="${f.color}" stroke-opacity="0.25" stroke-width="1"/>
                    <path d="M ${textStartX - 1} ${arrowY} L ${textStartX + 9} ${arrowY} M ${textStartX + 6.5} ${arrowY - 2} L ${textStartX + 9} ${arrowY} L ${textStartX + 6.5} ${arrowY + 2}"
                          fill="none" stroke="${f.color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    <text x="${textStartX}" y="${ly + 4}" text-anchor="start" fill="${f.color}" font-size="12" font-weight="bold">${sym}${sub ? `<tspan dy="3" font-size="8.5" font-weight="600">${sub}</tspan>` : ''}</text>
                </g>
            `;
        }
    });

    svg.innerHTML = html;
}

// ==========================================
// 6. NIVEAU ROUGE : ASSISTANT AUTONOMIE PAPIER
// ==========================================
const ROUGE_STEPS = [
    {
        type: "game",
        title: "Niveau Rouge — Le Skieur et le Cerf-Volant (Sur Fiche Papier)",
        html: `
            <div class="box content paper-callout">
                <p class="mb-0 is-size-6"><strong class="has-text-danger"><i class="fas fa-pencil-ruler mr-1"></i>Défi Final sur votre Fiche Papier :</strong> Réalisez les deux études complètes sur votre feuille. Utilisez cet écran pour <strong>vérifier vos calculs de poids P</strong> avant d'appeler le professeur.</p>
            </div>
            <div class="columns is-variable is-4 mb-0">
                <!-- EXERCICE 1 : LE SKIEUR -->
                <div class="column is-6">
                    <div class="box p-4 h-100">
                        <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                            <h4 class="title is-5 m-0">1. Le skieur sur le tire-fesse</h4>
                            <span class="tag is-danger is-light is-normal">m = 60,0 kg | g = 9,81 N·kg⁻¹</span>
                        </div>
                        <div class="scene-svg-container mb-3" style="max-width:100%; height:180px;">${SCENE_SVGS.rouge_skieur}</div>
                        <div class="notification is-light p-3 mb-2">
                            <div class="is-flex is-align-items-center is-justify-content-space-between" style="gap: 8px;">
                                <label class="is-size-6 has-text-weight-bold">Calcul du poids P<sub>skieur</sub> :</label>
                                <div class="field has-addons m-0">
                                    <div class="control">
                                        <input type="text" id="inp-poids-skieur" class="input is-small" style="width:120px;" placeholder="P = ...">
                                    </div>
                                    <div class="control"><span class="button is-static is-small">N</span></div>
                                </div>
                            </div>
                            <div id="fb-skieur" class="is-size-6 mt-1"></div>
                        </div>
                        <details class="is-size-6">
                            <summary class="has-text-link has-text-weight-semibold" style="cursor:pointer;">💡 Coup de pouce : Force de la neige</summary>
                            <p class="mt-1 p-2 has-background-info-light" style="border-radius:4px;">Sans frottements, l'action de la neige est <strong>perpendiculaire à la pente</strong> (vers le haut) !</p>
                        </details>
                    </div>
                </div>

                <!-- EXERCICE 2 : LE CERF-VOLANT -->
                <div class="column is-6">
                    <div class="box p-4 h-100">
                        <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                            <h4 class="title is-5 m-0">2. Le cerf-volant</h4>
                            <span class="tag is-danger is-normal">m = 200 g | g = 9,81 N·kg⁻¹</span>
                        </div>
                        <div class="scene-svg-container mb-3" style="max-width:100%; height:180px;">${SCENE_SVGS.rouge_cerfvolant}</div>
                        <div class="notification is-light p-3 mb-2">
                            <div class="is-flex is-align-items-center is-justify-content-space-between" style="gap: 8px;">
                                <label class="is-size-6 has-text-weight-bold">Calcul du poids P<sub>cerf-volant</sub> :</label>
                                <div class="field has-addons m-0">
                                    <div class="control">
                                        <input type="text" id="inp-poids-cv" class="input is-small" style="width:120px;" placeholder="P = ...">
                                    </div>
                                    <div class="control"><span class="button is-static is-small">N</span></div>
                                </div>
                            </div>
                            <div id="fb-cv" class="is-size-6 mt-1"></div>
                        </div>
                        <details class="is-size-6">
                            <summary class="has-text-link has-text-weight-semibold" style="cursor:pointer;">💡 Coup de pouce : Les 3 donneurs</summary>
                            <p class="mt-1 p-2 has-background-info-light" style="border-radius:4px;">Le cerf-volant subit l'action de <strong>la Terre</strong> (à distance), du <strong>fil</strong> (contact) et du <strong>vent</strong> (contact).</p>
                        </details>
                    </div>
                </div>
            </div>`,
        onLoad: () => {
            ['inp-poids-skieur', 'inp-poids-cv'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('keydown', e => {
                        if (e.key === 'Enter') executeValidation();
                    });
                }
            });
        },
        validate: () => {
            const vSki = parseFloat(document.getElementById('inp-poids-skieur').value.replace(',', '.').trim());
            const vCv = parseFloat(document.getElementById('inp-poids-cv').value.replace(',', '.').trim());
            const fbSki = document.getElementById('fb-skieur');
            const fbCv = document.getElementById('fb-cv');

            let skiOk = false, cvOk = false;

            if (isNaN(vSki)) {
                fbSki.innerHTML = `<span class="has-text-danger">Entre une valeur numérique.</span>`;
            } else if (Math.abs(vSki - 588.6) <= 1.5) {
                skiOk = true;
                fbSki.innerHTML = `<span class="has-text-success has-text-weight-bold"><i class="fas fa-check"></i> Exact ! P = 60,0 × 9,81 ≈ 589 N.</span>`;
            } else {
                fbSki.innerHTML = `<span class="has-text-danger">Erreur : utilise P = m × g avec m = 60,0 kg et g = 9,81 N·kg⁻¹.</span>`;
            }

            if (isNaN(vCv)) {
                fbCv.innerHTML = `<span class="has-text-danger">Entre une valeur numérique.</span>`;
            } else if (Math.abs(vCv - 1962) <= 15) {
                fbCv.innerHTML = `<span class="has-text-danger has-text-weight-bold"><i class="fas fa-exclamation-circle"></i> Attention à l'unité ! Convertis m = 200 g en kilogrammes (0,200 kg) !</span>`;
            } else if (Math.abs(vCv - 1.96) <= 0.05) {
                cvOk = true;
                fbCv.innerHTML = `<span class="has-text-success has-text-weight-bold"><i class="fas fa-check"></i> Bravo ! 200 g = 0,200 kg donc P = 1,96 N.</span>`;
            } else {
                fbCv.innerHTML = `<span class="has-text-danger">Vérifie ton calcul (convertis 200 g en kg).</span>`;
            }

            if (skiOk && cvOk) {
                completedBelts.add('rouge');
                updateBeltBar();
                document.getElementById('global-btn-home').style.display = 'inline-flex';
                return {
                    success: true,
                    msg: "🏆 <strong>Calculs du niveau Rouge validés !</strong> Appelle le professeur pour valider tes schémas sur ta fiche papier !"
                };
            }
            return {
                success: false,
                msg: "Vérifie les indications sous les champs de calcul du poids."
            };
        }
    }
];

// ==========================================
// 7. ASSEMBLAGE DE LA STRUCTURE DU TP UNIFIÉE
// ==========================================
const STRUCTURE_TP = {
    bleu: BLEU_DATA.map((it, idx) => buildBleuStep(it, idx === BLEU_DATA.length - 1)),
    vert: [
        buildVertStep(0, VERT_DATA.slice(0, 3)),
        buildVertStep(1, VERT_DATA.slice(3, 6))
    ],
    jaune: JAUNE_DATA.map((it, idx) => {
        const s = buildJauneStep(it, idx === JAUNE_DATA.length - 1);
        s.itemRef = it;
        return s;
    }),
    orange: ORANGE_DATA.map((it, idx) => buildOrangeStep(it, idx === ORANGE_DATA.length - 1)),
    rouge: ROUGE_STEPS
};

// ==========================================
// 8. ROUTEUR SPA (ACCUEIL, NAVIGATION, RACCOURCIS)
// ==========================================
function renderHome() {
    cleanupStepEvents();
    currentPart = "";
    currentStepIndex = 0;
    updateBeltBar();
    saveProgress();
    document.getElementById('global-controls').style.display = 'none';

    const doneTag = (belt) => completedBelts.has(belt)
        ? `<span class="tag is-success is-light is-small ml-2"><i class="fas fa-check mr-1"></i>Validé</span>`
        : '';

    document.getElementById('spa-container').innerHTML = `
        <div class="columns is-desktop is-variable is-5 mt-2">
            <div class="column is-7">
                <div class="box content is-medium p-5" style="height: 100%;">
                    <span class="tag is-link is-light is-medium mb-3">Seconde • Séquence MI-2 : Forces et lois de Newton</span>
                    <h1 class="title is-3 has-text-primary mb-3">Découverte des Actions Mécaniques et des Forces</h1>
                    <p>Cette activité interactive accompagne votre <strong>fiche papier</strong> pour apprendre à identifier les actions mécaniques, construire un Diagramme Objet-Interaction (D.O.I) et tracer des vecteurs forces.</p>
                    
                    <div class="notification is-info is-light my-4 py-3 px-4 is-size-6">
                        <p class="has-text-weight-bold mb-2"><i class="fas fa-route mr-1"></i>Fonctionnement par ceintures de couleurs :</p>
                        <ul class="mb-0" style="padding-left:18px;">
                            <li>Vous démarrez au <strong>Niveau Bleu</strong>. Sans erreur sur la fin du niveau Bleu, vous passez directement au <strong>Niveau Jaune</strong> !</li>
                            <li>Gardez votre <strong>fiche papier (avec les Mémentos Doc 1, 2 et 3)</strong> sous les yeux pour compléter les traces écrites demandées et le <strong>Niveau Rouge</strong>.</li>
                        </ul>
                    </div>

                    <div class="has-text-centered mt-5">
                        <button class="button is-link is-medium shadow" onclick="startPart('bleu', 0)">
                            <span class="icon"><i class="fas fa-play"></i></span>
                            <span>Démarrer au Niveau Bleu</span>
                        </button>
                        ${completedBelts.size > 0 ? `
                            <div class="mt-3">
                                <button type="button" class="button is-small is-light has-text-grey" onclick="resetSessionProgress()">
                                    <span class="icon is-small"><i class="fas fa-rotate-left"></i></span>
                                    <span>Réinitialiser la progression de cette session</span>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <div class="column is-5">
                <h3 class="title is-4 mb-3 has-text-grey-dark"><i class="fas fa-layer-group mr-2"></i>Accès direct aux ceintures</h3>
                <div class="is-flex is-flex-direction-column" style="gap: 10px;">
                    
                    <button class="button is-white is-justify-content-flex-start p-4 shadow-sm" style="height:auto; border-left: 6px solid var(--c-bleu);" onclick="startPart('bleu', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-5" style="color:var(--c-bleu);">🔵 Niveau Bleu — Actions mécaniques ${doneTag('bleu')}</strong>
                            <span class="is-size-7 has-text-grey">Donneur, Receveur, action de contact ou à distance (6 situations).</span>
                        </div>
                    </button>

                    <button class="button is-white is-justify-content-flex-start p-4 shadow-sm" style="height:auto; border-left: 6px solid var(--c-vert);" onclick="startPart('vert', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-5" style="color:var(--c-vert);">🟢 Niveau Vert — Renforcement ${doneTag('vert')}</strong>
                            <span class="is-size-7 has-text-grey">Entraînement supplémentaire sur les types d'actions (6 situations).</span>
                        </div>
                    </button>

                    <button class="button is-white is-justify-content-flex-start p-4 shadow-sm" style="height:auto; border-left: 6px solid var(--c-jaune);" onclick="startPart('jaune', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-5" style="color:#b45309;">🟡 Niveau Jaune — Diagramme D.O.I ${doneTag('jaune')}</strong>
                            <span class="is-size-7 has-text-grey">Construire les D.O.I interactifs et éviter les intrus (9 situations).</span>
                        </div>
                    </button>

                    <button class="button is-white is-justify-content-flex-start p-4 shadow-sm" style="height:auto; border-left: 6px solid var(--c-orange);" onclick="startPart('orange', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-5" style="color:var(--c-orange);">🟠 Niveau Orange — Vecteurs Forces ${doneTag('orange')}</strong>
                            <span class="is-size-7 has-text-grey">Caractéristiques et tracé des vecteurs sur schéma (7 situations).</span>
                        </div>
                    </button>

                    <button class="button is-white is-justify-content-flex-start p-4 shadow-sm" style="height:auto; border-left: 6px solid var(--c-rouge);" onclick="startPart('rouge', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-5" style="color:var(--c-rouge);">🔴 Niveau Rouge — Défi sur Papier ${doneTag('rouge')}</strong>
                            <span class="is-size-7 has-text-grey">Skieur et Cerf-volant : vérification de P = m × g.</span>
                        </div>
                    </button>

                </div>
            </div>
        </div>
    `;
}

function startPart(partKey, stepIdx = 0) {
    currentPart = partKey;
    currentStepIndex = stepIdx;
    if (partKey === 'bleu' && stepIdx === 0) {
        bleuEvalFirstTrySuccess = true;
    }
    updateBeltBar();
    renderStep();
}

function renderStep() {
    cleanupStepEvents();
    saveProgress();
    const step = STRUCTURE_TP[currentPart][currentStepIndex];
    const totalSteps = STRUCTURE_TP[currentPart].length;

    const headerBadge = `
        <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
            <h2 class="title is-5 m-0 has-text-primary">${step.title}</h2>
            <span class="tag is-medium is-light has-text-weight-bold">Étape ${currentStepIndex + 1} / ${totalSteps}</span>
        </div>
    `;

    document.getElementById('spa-container').innerHTML = headerBadge + step.html;

    const ctrl = document.getElementById('global-controls');
    ctrl.style.display = 'block';

    const btnVerif = document.getElementById('global-btn-verif');
    const btnAction = document.getElementById('global-btn-action');
    const msgBox = document.getElementById('global-message-box');
    const btnNext = document.getElementById('global-btn-next');

    msgBox.innerHTML = "";
    msgBox.className = "has-text-centered";

    window.pendingNextOverride = null;

    if (step.type === "game") {
        btnNext.style.display = 'none';
    } else {
        btnNext.style.display = 'inline-flex';
    }

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
        btnAction.innerHTML = `<i class="fas fa-undo mr-1"></i> ${step.actionLabel}`;
        btnAction.onclick = step.onAction;
    } else {
        btnAction.style.display = "none";
    }

    if (step.onLoad) step.onLoad();
}

function executeValidation() {
    const step = STRUCTURE_TP[currentPart][currentStepIndex];
    const res = step.validate();
    saveProgress();
    const msgBox = document.getElementById('global-message-box');

    msgBox.innerHTML = res.msg;
    msgBox.className = res.success
        ? "notification is-success is-light py-2 px-4 m-0 is-size-6"
        : "notification is-danger is-light py-2 px-4 m-0 is-size-6";

    msgBox.classList.remove('feedback-anim');
    void msgBox.offsetWidth;
    msgBox.classList.add('feedback-anim');

    if (res.success) {
        if (res.nextOverride) {
            window.pendingNextOverride = res.nextOverride;
        }
        const btnNext = document.getElementById('global-btn-next');
        if (currentPart !== 'rouge') {
            btnNext.style.display = 'inline-flex';
            if (step.requirePaperConfirm) {
                btnNext.disabled = true;
                const confirmWrap = document.createElement('label');
                confirmWrap.className = 'paper-confirm-wrap';
                confirmWrap.innerHTML = `<input type="checkbox" id="paper-confirm-chk"> <span>J'ai bien recopié cette trace écrite sur ma fiche papier</span>`;
                confirmWrap.querySelector('input').addEventListener('change', (e) => {
                    btnNext.disabled = !e.target.checked;
                });
                msgBox.appendChild(document.createElement('br'));
                msgBox.appendChild(confirmWrap);
            } else {
                btnNext.disabled = false;
            }
        }
    }
}

document.getElementById('global-btn-prev').onclick = () => {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep();
    } else {
        renderHome();
    }
};

document.getElementById('global-btn-next').onclick = () => {
    if (window.pendingNextOverride) {
        const target = window.pendingNextOverride;
        window.pendingNextOverride = null;
        startPart(target.part, target.step || 0);
        return;
    }
    if (currentStepIndex < STRUCTURE_TP[currentPart].length - 1) {
        currentStepIndex++;
        renderStep();
    } else {
        renderHome();
    }
};

document.getElementById('global-btn-home').onclick = () => {
    renderHome();
};

function initApp() {
    if (loadProgress()) {
        updateBeltBar();
        renderStep();
    } else {
        renderHome();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Raccourcis clavier Enseignant / Debug (Ctrl + Flèches Gauche/Droite)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'ArrowRight') {
        event.preventDefault();
        if (currentPart !== "") {
            if (currentStepIndex < STRUCTURE_TP[currentPart].length - 1) {
                currentStepIndex++;
                renderStep();
            } else {
                const order = ['bleu', 'vert', 'jaune', 'orange', 'rouge'];
                const nextIdx = order.indexOf(currentPart) + 1;
                if (nextIdx < order.length) startPart(order[nextIdx], 0);
                else renderHome();
            }
        }
    } else if (event.ctrlKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentPart !== "") {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                renderStep();
            } else {
                renderHome();
            }
        }
    }
});
