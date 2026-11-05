/* --- game.js --- */

// ==========================================
// 1. ÉTAT GLOBAL & BARRE DES CEINTURES
// ==========================================
let currentPart = "";
let currentStepIndex = 0;
let completedBelts = new Set();
let bleuEvalFirstTrySuccess = true; // Passe à false si erreur sur les étapes 4 à 6 du niveau Bleu

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
        html: `
            <div class="box content consigne-box">
                <div class="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap" style="gap: 8px;">
                    <span class="is-size-6"><strong>Système étudié (Receveur) : <span class="tag is-link is-normal">${item.receveur}</span></strong> — Cliquez sur chaque donneur qui agit sur <em>${item.receveur}</em> puis complétez sa carte.</span>
                    ${item.paperNotice ? `<span class="tag is-warning is-light has-text-weight-bold">${item.paperNotice}</span>` : ''}
                </div>
            </div>
            <div class="columns is-variable is-3 mb-0">
                <div class="column is-5">
                    <div class="scene-box h-100">
                        <div class="scene-svg-container mb-2">${SCENE_SVGS[item.svg]}</div>
                        <p class="is-size-7 has-text-grey has-text-centered mb-2">Qui agit sur <strong>${item.receveur}</strong> ? (Cliquez)</p>
                        <div id="actors-pool" class="is-flex is-flex-wrap-wrap is-justify-content-center" style="gap: 6px;"></div>
                        <div id="trap-feedback" class="notification is-danger is-light mt-2 py-1 px-2 is-size-7" style="display:none; width:100%;"></div>
                    </div>
                </div>
                <div class="column is-7">
                    <div class="box has-background-white-bis p-3" style="min-height: 265px; height: 100%;">
                        <h4 class="title is-6 mb-2"><i class="fas fa-list-check has-text-info mr-2"></i>Actions mécaniques identifiées :</h4>
                        <div id="actions-cards-container">
                            <p class="has-text-grey is-italic is-size-7" id="empty-actions-hint">Cliquez sur un donneur sous l'image pour ajouter une action mécanique...</p>
                        </div>
                    </div>
                </div>
            </div>`,
        onLoad: () => {
            window.currentBleuSelected = new Set();
            const pool = document.getElementById('actors-pool');
            const container = document.getElementById('actions-cards-container');
            const trapBox = document.getElementById('trap-feedback');

            item.candidates.forEach(cand => {
                const btn = document.createElement('div');
                btn.className = 'actor-chip';
                btn.innerHTML = cand.label;
                btn.onclick = () => {
                    trapBox.style.display = 'none';
                    if (!cand.valid) {
                        if (item.evalMode) bleuEvalFirstTrySuccess = false;
                        btn.classList.remove('trap-shake');
                        void btn.offsetWidth;
                        btn.classList.add('trap-shake');
                        trapBox.innerHTML = `<i class="fas fa-exclamation-triangle mr-1"></i> ${cand.trapMsg}`;
                        trapBox.style.display = 'block';
                        return;
                    }
                    if (window.currentBleuSelected.has(cand.id)) return;
                    window.currentBleuSelected.add(cand.id);
                    btn.classList.add('selected');
                    const hint = document.getElementById('empty-actions-hint');
                    if (hint) hint.style.display = 'none';

                    const card = document.createElement('div');
                    card.className = 'action-detail-card';
                    card.id = 'card-act-' + cand.id;
                    card.innerHTML = `
                        <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
                            <span class="tag is-dark is-small">Donneur : ${cand.label}</span>
                            <div class="is-flex is-align-items-center" style="gap: 6px;">
                                <span class="is-size-7 has-text-weight-bold">Type :</span>
                                <div class="buttons has-addons m-0">
                                    <button type="button" class="button is-small py-0 px-2 type-btn-${cand.id}" style="height:24px;" data-val="contact" onclick="selectBleuType('${cand.id}', 'contact')">De contact</button>
                                    <button type="button" class="button is-small py-0 px-2 type-btn-${cand.id}" style="height:24px;" data-val="distance" onclick="selectBleuType('${cand.id}', 'distance')">À distance</button>
                                </div>
                            </div>
                        </div>
                        <div class="is-size-7 is-flex is-align-items-center is-flex-wrap-wrap mt-1" style="gap: 5px;">
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
                    container.appendChild(card);
                };
                pool.appendChild(btn);
            });
        },
        validate: () => {
            const validCands = item.candidates.filter(c => c.valid);
            if (window.currentBleuSelected.size < validCands.length) {
                if (item.evalMode) bleuEvalFirstTrySuccess = false;
                return {
                    success: false,
                    msg: `Il manque encore <strong>${validCands.length - window.currentBleuSelected.size} donneur(s)</strong> qui agissent sur ${item.receveur}.`
                };
            }
            let errors = 0;
            validCands.forEach(cand => {
                const card = document.getElementById('card-act-' + cand.id);
                const chosenType = card.getAttribute('data-type');
                const chosenPrep = document.getElementById('sel-prep-' + cand.id).value;
                const chosenRec = document.getElementById('sel-rec-' + cand.id).value;

                if (chosenType === cand.type && chosenPrep === cand.prep && chosenRec === item.receveur) {
                    card.className = 'action-detail-card correct';
                } else {
                    card.className = 'action-detail-card incorrect';
                    errors++;
                }
            });

            if (errors > 0) {
                if (item.evalMode) bleuEvalFirstTrySuccess = false;
                return { success: false, msg: `Il y a <strong>${errors} erreur(s)</strong> dans les cartes en rouge.` };
            }

            if (isLast) {
                completedBelts.add('bleu');
                updateBeltBar();
                if (bleuEvalFirstTrySuccess) {
                    return {
                        success: true,
                        msg: `🎉 <strong>Niveau Bleu réussi sans erreur !</strong> N'oublie pas ta trace écrite papier, puis passe directement au <strong>Niveau JAUNE</strong> !`,
                        nextOverride: { part: 'jaune', step: 0 }
                    };
                } else {
                    return {
                        success: true,
                        msg: `👍 Niveau Bleu terminé ! Passons par le <strong>Niveau VERT</strong> pour consolider tout ça.`,
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
        title: batchIndex === 0 ? "Niveau Vert (1/2) : Situations 1 à 3" : "Niveau Vert (2/2) : Situations 4 à 6",
        html: `
            <div class="box content consigne-box">
                <p class="mb-0 is-size-6">Indiquez pour chaque objet proposé s'il agit <strong>par contact</strong>, <strong>à distance</strong>, ou s'il <strong>n'agit pas directement</strong> sur le receveur étudié.</p>
            </div>
            <div class="columns is-variable is-2 mb-0">
                ${items.map(it => `
                    <div class="column is-4">
                        <div class="box h-100 p-2" id="vcard-${it.id}">
                            <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
                                <span class="has-text-weight-bold is-size-7">${it.title}</span>
                                <span class="tag is-info is-light is-small">Receveur : <strong>&nbsp;${it.receveur}</strong></span>
                            </div>
                            <div class="scene-svg-container mb-2" style="max-width:100%; height:115px;">${SCENE_SVGS[it.svg]}</div>
                            ${it.options.map(opt => `
                                <div class="is-flex is-justify-content-space-between is-align-items-center mb-1 pb-1" style="border-bottom: 1px solid #f1f5f9; gap: 4px;">
                                    <span class="is-size-7 has-text-weight-semibold" style="line-height:1.1;">${opt.label}</span>
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
// 4. MOTEUR INTERACTIF : NIVEAU JAUNE (CONSTRUCTEUR D.O.I ÉPURÉ)
// ==========================================
function buildJauneStep(item, isLast = false) {
    return {
        type: "game",
        title: item.title,
        actionLabel: "Réinitialiser",
        onAction: () => {
            window.doiActors = {};
            renderDoiWorkspace(item);
        },
        html: `
            <div class="box content consigne-box">
                <div class="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap" style="gap: 6px;">
                    <span class="is-size-7"><strong>1.</strong> Cliquez sur un objet (réserve ou diagramme) pour l'ajouter ou le retirer. &nbsp;|&nbsp; <strong>2. Cliquez sur une flèche</strong> pour basculer entre <strong>Trait plein (Contact)</strong> et <strong>Pointillés (À distance)</strong>.</span>
                    ${item.paperNotice ? `<span class="tag is-warning is-light has-text-weight-bold">${item.paperNotice}</span>` : ''}
                </div>
            </div>
            <div class="columns is-variable is-3 mb-0">
                <div class="column is-4">
                    <div class="scene-box h-100">
                        <div class="scene-svg-container mb-2">${SCENE_SVGS[item.svg]}</div>
                        <p class="is-size-7 has-text-weight-bold mb-1">Objets disponibles (Cliquez) :</p>
                        <div id="doi-pool" class="is-flex is-flex-wrap-wrap is-justify-content-center" style="gap: 6px;"></div>
                    </div>
                </div>
                <div class="column is-8">
                    <div class="doi-workspace h-100">
                        <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
                            <span class="is-size-7 has-text-grey"><i class="fas fa-mouse-pointer mr-1"></i> Cliquez sur une double flèche : Plein (Contact) ⟷ Pointillés (À distance)</span>
                            <span class="tag is-warning is-light has-text-weight-bold">Système : ${item.systeme}</span>
                        </div>
                        <svg id="doi-canvas" class="doi-svg" viewBox="0 0 560 280"></svg>
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
        const chip = document.createElement('div');
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

    const cx = 280, cy = 140;
    const sysW = 140, sysH = 54;
    const hw1 = sysW / 2, hh1 = sysH / 2;

    const actorW = 136, actorH = 50;
    const hw2 = actorW / 2, hh2 = actorH / 2;
    const pad = 3;

    const positions = [
        { x: 110, y: 65 },
        { x: 450, y: 65 },
        { x: 280, y: 235 },
        { x: 110, y: 215 },
        { x: 450, y: 215 }
    ];

    let svgHTML = `
        <defs>
            <marker id="doi-arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e293b"/>
            </marker>
        </defs>
    `;

    const placedNames = Object.keys(window.doiActors);
    placedNames.forEach((name, idx) => {
        const pos = positions[idx % positions.length];
        const type = window.doiActors[name];
        const dash = type === 'distance' ? 'stroke-dasharray="7,6"' : '';

        const dx = pos.x - cx;
        const dy = pos.y - cy;
        const absDx = Math.abs(dx) || 1e-5;
        const absDy = Math.abs(dy) || 1e-5;

        const scale1 = Math.min((hw1 + pad) / absDx, (hh1 + pad) / absDy);
        const startX = Math.round(cx + dx * scale1);
        const startY = Math.round(cy + dy * scale1);

        const scale2 = Math.min((hw2 + pad) / absDx, (hh2 + pad) / absDy);
        const endX = Math.round(pos.x - dx * scale2);
        const endY = Math.round(pos.y - dy * scale2);

        const escapedName = name.replace(/'/g, "\\'");
        const fontSize = name.length > 16 ? 11.5 : (name.length > 13 ? 12 : 13);

        // Sans aucun label sur la flèche, ni croix rouge sur le rectangle !
        svgHTML += `
            <g class="doi-line-group" onclick="toggleDoiArrow('${escapedName}')" style="cursor:pointer;">
                <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" class="doi-line-hit"/>
                <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" class="doi-line-vis" ${dash}
                      marker-start="url(#doi-arrow-end)" marker-end="url(#doi-arrow-end)"/>
            </g>
            <g transform="translate(${pos.x}, ${pos.y})" onclick="removeDoiActor('${escapedName}')" style="cursor:pointer;">
                <title>Cliquer pour retirer du diagramme</title>
                <rect x="${-actorW / 2}" y="${-actorH / 2}" width="${actorW}" height="${actorH}" rx="5" fill="#ffffff" stroke="#2563eb" stroke-width="2.5"/>
                <text x="0" y="5" text-anchor="middle" fill="#1e293b" font-size="${fontSize}" font-weight="bold">${name}</text>
            </g>
        `;
    });

    svgHTML += `
        <g transform="translate(${cx}, ${cy})">
            <rect x="${-sysW / 2}" y="${-sysH / 2}" width="${sysW}" height="${sysH}" rx="5" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/>
            <text x="0" y="5" text-anchor="middle" fill="#713f12" font-size="15" font-weight="bold">${item.systeme}</text>
        </g>
    `;

    svg.innerHTML = svgHTML;
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
        actionLabel: "Effacer les flèches",
        onAction: () => {
            window.drawnVectors = {};
            renderVectorCanvas(item);
        },
        html: `
            <div class="box content consigne-box">
                <div class="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap" style="gap: 6px;">
                    <span class="is-size-7"><strong>${item.subtitle}</strong> Sélectionnez la force à droite puis tirez la flèche depuis un point d'ancrage bleu (●).</span>
                    ${item.paperNotice ? `<span class="tag is-warning is-light has-text-weight-bold">${item.paperNotice}</span>` : ''}
                </div>
            </div>
            <div class="columns is-variable is-3 mb-0">
                <!-- VOLET GAUCHE : CARACTÉRISTIQUES COMPACTES -->
                <div class="column is-6">
                    ${item.forces.map(f => `
                        <div class="box p-2 mb-2" id="fcard-${f.id}" style="border-left: 5px solid ${f.color};">
                            <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
                                <span class="is-size-6 has-text-weight-bold" style="color:${f.color};">Force ${f.htmlLabel}</span>
                                ${f.givenValue ? `<span class="tag is-dark is-small">Valeur : ${f.givenValue}</span>` : ''}
                            </div>
                            <div class="columns is-mobile is-multiline is-variable is-1 m-0">
                                <div class="column is-5 py-1">
                                    <label class="is-size-7 has-text-weight-semibold">Point d'application :</label>
                                    <div class="select is-small is-fullwidth">
                                        <select id="f-pt-${f.id}">
                                            <option value="">-- Choisir --</option>
                                            ${f.pointOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="column is-4 py-1">
                                    <label class="is-size-7 has-text-weight-semibold">Direction :</label>
                                    <div class="select is-small is-fullwidth">
                                        <select id="f-dir-${f.id}">
                                            <option value="">-- Choisir --</option>
                                            <option value="verticale">Verticale (↕)</option>
                                            <option value="horizontale">Horizontale (↔)</option>
                                            <option value="selon le fil (oblique)">Selon le fil (⤡)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="column is-3 py-1">
                                    <label class="is-size-7 has-text-weight-semibold">Sens :</label>
                                    <div class="select is-small is-fullwidth">
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
                                    <div class="column is-12 py-1">
                                        <div class="is-flex is-align-items-center" style="gap: 6px;">
                                            <label class="is-size-7 has-text-weight-bold">Valeur déduite :</label>
                                            <input type="text" id="f-val-${f.id}" class="input is-small" style="max-width: 90px; height: 24px;" placeholder="ex: 0,56">
                                            <span class="is-size-7 has-text-weight-bold">N</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- VOLET DROIT : TRACEUR DE VECTEURS SUR SCHÉMA -->
                <div class="column is-6">
                    <div class="box p-2 h-100 is-flex is-flex-direction-column align-items-center justify-content-center">
                        <div class="buttons is-centered mb-2" id="vector-tool-tabs">
                            ${item.forces.map(f => `
                                <button type="button" class="button is-small force-tab-btn" id="vtab-${f.id}"
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
                        <div id="vector-live-info" class="is-size-7 has-text-grey has-text-centered mt-1">
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
            for (let f of item.forces) {
                const pt = document.getElementById('f-pt-' + f.id).value;
                const dir = document.getElementById('f-dir-' + f.id).value;
                const sens = document.getElementById('f-sens-' + f.id).value;
                const card = document.getElementById('fcard-' + f.id);

                let ok = (pt === f.expectedPoint && dir === f.expectedDirection && sens === f.expectedSens);
                if (f.askValue) {
                    const valStr = document.getElementById('f-val-' + f.id).value.replace(',', '.').trim();
                    if (Math.abs(parseFloat(valStr) - f.expectedValue) > 0.02) ok = false;
                }
                if (!ok) {
                    textErrors++;
                    card.style.backgroundColor = '#fef2f2';
                } else {
                    card.style.backgroundColor = '#f0fdf4';
                }
            }

            if (textErrors > 0) {
                return {
                    success: false,
                    msg: `Vérifie les caractéristiques à gauche (${textErrors} force(s) comporte(nt) des erreurs).`
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
                let diff = Math.abs(vec.angle - f.expectedAngle);
                if (diff > 180) diff = 360 - diff;
                const tol = f.angleTolerance || 18;
                if (diff > tol) {
                    return {
                        success: false,
                        msg: `L'orientation (direction ou sens) du vecteur <strong>${f.htmlLabel}</strong> tracé est incorrecte.`
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

            if (item.id === "o_3") {
                const lenP = window.drawnVectors["P"].length;
                const lenS = window.drawnVectors["Fsol"].length;
                if (Math.abs(lenP - lenS) > 35) {
                    return {
                        success: false,
                        msg: `Comme P et F<sub>sol/balle</sub> ont la même valeur (0,56 N), leurs flèches doivent avoir environ la même longueur !`
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
    const svg = document.getElementById('vector-svg');
    if (!svg) return;

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

    svg.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDrag);

    svg.addEventListener('touchstart', e => {
        if (e.touches.length > 0) {
            e.preventDefault();
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    window.addEventListener('touchmove', e => {
        if (window.isDraggingVector && e.touches.length > 0) {
            moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    window.addEventListener('touchend', endDrag);
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
            const lx = (v.x1 + v.x2) / 2 + (v.angle === 90 || v.angle === -90 ? 34 : 0);
            const ly = (v.y1 + v.y2) / 2 + (v.angle === 0 || v.angle === 180 ? -14 : 0);
            const labelTxt = f.svgText || f.id;
            html += `
                <g pointer-events="none">
                    <line x1="${v.x1}" y1="${v.y1}" x2="${v.x2}" y2="${v.y2}"
                          stroke="${f.color}" stroke-width="4" stroke-linecap="round"
                          marker-end="url(#vhead-${f.id})"/>
                    <rect x="${lx - 32}" y="${ly - 11}" width="64" height="16" rx="4" fill="rgba(255,255,255,0.88)"/>
                    <text x="${lx}" y="${ly + 1}" text-anchor="middle" fill="${f.color}" font-size="11" font-weight="bold">${labelTxt}</text>
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
        title: "Niveau Rouge : Le Skieur et le Cerf-Volant (Sur Fiche Papier)",
        html: `
            <div class="box content paper-callout">
                <p class="mb-0 is-size-7"><strong class="has-text-danger"><i class="fas fa-pencil-ruler mr-1"></i>Défi Final sur votre Fiche Papier :</strong> Réalisez les deux études complètes sur votre feuille. Utilisez cet écran pour <strong>vérifier vos calculs de poids P</strong> avant d'appeler le professeur.</p>
            </div>
            <div class="columns is-variable is-3 mb-0">
                <!-- EXERCICE 1 : LE SKIEUR -->
                <div class="column is-6">
                    <div class="box p-3 h-100">
                        <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                            <h4 class="title is-6 m-0">1. Le skieur sur le tire-fesse</h4>
                            <span class="tag is-danger is-light is-small">m = 60,0 kg | g = 9,81 N/kg</span>
                        </div>
                        <div class="scene-svg-container mb-2" style="max-width:100%; height:135px;">${SCENE_SVGS.rouge_skieur}</div>
                        <div class="notification is-light p-2 mb-2">
                            <div class="is-flex is-align-items-center is-justify-content-space-between" style="gap: 8px;">
                                <label class="is-size-7 has-text-weight-bold">Calcul du poids P<sub>skieur</sub> :</label>
                                <div class="field has-addons m-0">
                                    <div class="control">
                                        <input type="text" id="inp-poids-skieur" class="input is-small" style="width:110px;" placeholder="P = ...">
                                    </div>
                                    <div class="control"><span class="button is-static is-small">N</span></div>
                                </div>
                            </div>
                            <div id="fb-skieur" class="is-size-7 mt-1"></div>
                        </div>
                        <details class="is-size-7">
                            <summary class="has-text-link has-text-weight-semibold" style="cursor:pointer;">💡 Coup de pouce : Force de la neige</summary>
                            <p class="mt-1 p-1 has-background-info-light" style="border-radius:4px;">Sans frottements, l'action de la neige est <strong>perpendiculaire à la pente</strong> (vers le haut) !</p>
                        </details>
                    </div>
                </div>

                <!-- EXERCICE 2 : LE CERF-VOLANT -->
                <div class="column is-6">
                    <div class="box p-3 h-100">
                        <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                            <h4 class="title is-6 m-0">2. Le cerf-volant</h4>
                            <span class="tag is-danger is-small">m = 200 g | g = 9,81 N·kg⁻¹</span>
                        </div>
                        <div class="scene-svg-container mb-2" style="max-width:100%; height:135px;">${SCENE_SVGS.rouge_cerfvolant}</div>
                        <div class="notification is-light p-2 mb-2">
                            <div class="is-flex is-align-items-center is-justify-content-space-between" style="gap: 8px;">
                                <label class="is-size-7 has-text-weight-bold">Calcul du poids P<sub>cerf-volant</sub> :</label>
                                <div class="field has-addons m-0">
                                    <div class="control">
                                        <input type="text" id="inp-poids-cv" class="input is-small" style="width:110px;" placeholder="P = ...">
                                    </div>
                                    <div class="control"><span class="button is-static is-small">N</span></div>
                                </div>
                            </div>
                            <div id="fb-cv" class="is-size-7 mt-1"></div>
                        </div>
                        <details class="is-size-7">
                            <summary class="has-text-link has-text-weight-semibold" style="cursor:pointer;">💡 Coup de pouce : Les 3 donneurs</summary>
                            <p class="mt-1 p-1 has-background-info-light" style="border-radius:4px;">Le cerf-volant subit l'action de <strong>la Terre</strong> (à distance), du <strong>fil</strong> (contact) et du <strong>vent</strong> (contact).</p>
                        </details>
                    </div>
                </div>
            </div>`,
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
                fbSki.innerHTML = `<span class="has-text-danger">Erreur : utilise P = m × g avec m = 60,0 kg et g = 9,81 N/kg.</span>`;
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
    currentPart = "";
    updateBeltBar();
    document.getElementById('global-controls').style.display = 'none';

    document.getElementById('spa-container').innerHTML = `
        <div class="columns is-desktop is-variable is-4 mt-1">
            <div class="column is-7">
                <div class="box content p-4" style="height: 100%;">
                    <span class="tag is-link is-light mb-2">Seconde • Séquence MI-2 : Forces et lois de Newton</span>
                    <h1 class="title is-4 has-text-primary mb-2">Découverte des Actions Mécaniques et des Forces</h1>
                    <p class="is-size-6">Cette activité interactive accompagne votre <strong>fiche papier</strong> pour apprendre à identifier les actions mécaniques, construire un Diagramme Objet-Interaction (D.O.I) et tracer des vecteurs forces.</p>
                    
                    <div class="notification is-info is-light my-3 py-2 px-3 is-size-7">
                        <p class="has-text-weight-bold mb-1"><i class="fas fa-route mr-1"></i>Fonctionnement par ceintures de couleurs :</p>
                        <ul class="mb-0" style="padding-left:16px;">
                            <li>Vous démarrez au <strong>Niveau Bleu</strong>. Sans erreur sur la fin du niveau Bleu, vous passez directement au <strong>Niveau Jaune</strong> !</li>
                            <li>Gardez votre <strong>fiche papier (avec les Mémentos Doc 1, 2 et 3)</strong> sous les yeux pour compléter les traces écrites demandées et le <strong>Niveau Rouge</strong>.</li>
                        </ul>
                    </div>

                    <div class="has-text-centered mt-4">
                        <button class="button is-link shadow" onclick="startPart('bleu', 0)">
                            <span class="icon"><i class="fas fa-play"></i></span>
                            <span>Démarrer au Niveau Bleu</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="column is-5">
                <h3 class="title is-6 mb-2 has-text-grey-dark"><i class="fas fa-layer-group mr-1"></i>Accès direct aux ceintures</h3>
                <div class="is-flex is-flex-direction-column" style="gap: 8px;">
                    
                    <button class="button is-white is-justify-content-flex-start p-3 shadow-sm" style="height:auto; border-left: 5px solid var(--c-bleu);" onclick="startPart('bleu', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-7" style="color:var(--c-bleu);">🔵 Niveau Bleu — Actions mécaniques (6 situations)</strong>
                            <span class="is-size-7 has-text-grey">Donneur, Receveur, action de contact ou à distance.</span>
                        </div>
                    </button>

                    <button class="button is-white is-justify-content-flex-start p-3 shadow-sm" style="height:auto; border-left: 5px solid var(--c-vert);" onclick="startPart('vert', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-7" style="color:var(--c-vert);">🟢 Niveau Vert — Renforcement (6 situations)</strong>
                            <span class="is-size-7 has-text-grey">Entraînement supplémentaire sur les types d'actions.</span>
                        </div>
                    </button>

                    <button class="button is-white is-justify-content-flex-start p-3 shadow-sm" style="height:auto; border-left: 5px solid var(--c-jaune);" onclick="startPart('jaune', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-7" style="color:#b45309;">🟡 Niveau Jaune — Diagramme D.O.I (9 situations)</strong>
                            <span class="is-size-7 has-text-grey">Construire les D.O.I interactifs et éviter les intrus.</span>
                        </div>
                    </button>

                    <button class="button is-white is-justify-content-flex-start p-3 shadow-sm" style="height:auto; border-left: 5px solid var(--c-orange);" onclick="startPart('orange', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-7" style="color:var(--c-orange);">🟠 Niveau Orange — Vecteurs Forces (6 situations)</strong>
                            <span class="is-size-7 has-text-grey">Caractéristiques et tracé des vecteurs sur schéma.</span>
                        </div>
                    </button>

                    <button class="button is-white is-justify-content-flex-start p-3 shadow-sm" style="height:auto; border-left: 5px solid var(--c-rouge);" onclick="startPart('rouge', 0)">
                        <div class="has-text-left">
                            <strong class="is-block is-size-7" style="color:var(--c-rouge);">🔴 Niveau Rouge — Défi sur Papier (2 problèmes)</strong>
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
    const step = STRUCTURE_TP[currentPart][currentStepIndex];
    const totalSteps = STRUCTURE_TP[currentPart].length;

    const headerBadge = `
        <div class="is-flex is-justify-content-space-between is-align-items-center mb-1">
            <h2 class="title is-6 m-0 has-text-primary">${step.title}</h2>
            <span class="tag is-small is-light has-text-weight-bold">Étape ${currentStepIndex + 1} / ${totalSteps}</span>
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
    const res = STRUCTURE_TP[currentPart][currentStepIndex].validate();
    const msgBox = document.getElementById('global-message-box');

    msgBox.innerHTML = res.msg;
    msgBox.className = res.success
        ? "notification is-success is-light py-1 px-3 m-0 is-size-7"
        : "notification is-danger is-light py-1 px-3 m-0 is-size-7";

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
            btnNext.disabled = false;
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

window.onload = () => {
    renderHome();
};

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
