/* --- game.js : Moteur SPA, Routage Adaptatif & Composants Interactifs --- */

let currentPart = "";
let currentStepIndex = 0;
let completedBelts = new Set();

// État courant des composants interactifs
let activeDonneurState = {};
let activeDOIState = {};
let activeVectorInstances = {};

// ============================================================================
// PANNEAU LATÉRAL (MÉMENTO CONTEXTUEL)
// ============================================================================
function getMementoHTML(belt) {
    let content = "";
    if (belt === "bleu" || belt === "vert") {
        content = `
            <div class="info-item mb-3">
                <span class="tag is-info is-light mb-1 has-text-weight-bold">Action mécanique</span>
                <p class="is-size-7">Lorsqu'un objet agit sur un autre, l'objet qui agit est le <strong>donneur</strong>, celui qui subit l'action est le <strong>receveur</strong> (le système étudié).</p>
            </div>
            <div class="info-item mb-3">
                <span class="tag is-success is-light mb-1 has-text-weight-bold">Action de contact</span>
                <p class="is-size-7">Le donneur et le receveur doivent <strong>se toucher</strong>. Dès que le contact cesse, l'action disparaît !</p>
            </div>
            <div class="info-item">
                <span class="tag is-warning is-light mb-1 has-text-weight-bold">Action à distance</span>
                <p class="is-size-7">Agit sans contact (ex : attraction gravitationnelle de la <strong>Terre</strong>, aimant, corps électrisé).</p>
            </div>`;
    } else if (belt === "jaune") {
        content = `
            <div class="info-item mb-3">
                <span class="tag is-warning is-light mb-1 has-text-weight-bold">Diagramme Objet-Interaction</span>
                <p class="is-size-7">Le système étudié est placé au centre. On relie uniquement les objets qui agissent <strong>à cet instant précis</strong>.</p>
            </div>
            <div class="info-item mb-2">
                <p class="is-size-7"><strong>Trait plein (⟷) :</strong> interaction de <strong>contact</strong>.</p>
            </div>
            <div class="info-item">
                <p class="is-size-7"><strong>Trait pointillé (⇠⇢) :</strong> interaction à <strong>distance</strong>.</p>
            </div>`;
    } else {
        content = `
            <div class="info-item mb-2">
                <span class="tag is-orange mb-1 has-text-weight-bold">Les 4 caractéristiques d'une force</span>
                <ul class="is-size-7 pl-3" style="list-style-type: disc;">
                    <li><strong>Point d'application :</strong>
                        <br>• Action de contact : point de contact.
                        <br>• Action à distance : centre de gravité <strong>G</strong>.
                    </li>
                    <li class="mt-1"><strong>Direction :</strong> la droite selon laquelle s'exerce l'action (verticale, horizontale, le long du fil...).</li>
                    <li class="mt-1"><strong>Sens :</strong> vers le haut, le bas, la gauche, la droite...</li>
                    <li class="mt-1"><strong>Valeur (Norme) :</strong> en Newton (<strong>N</strong>).</li>
                </ul>
            </div>
            <div class="notification is-info is-light p-2 is-size-7 mt-2">
                <strong>Poids d'un corps :</strong><br>
                <code>P = m × g</code> avec <strong>m en kg</strong> et g = 9,81 N/kg.
            </div>`;
    }

    return `
    <div class="column is-narrow" style="width: 300px;">
        <aside class="info-panel box p-4" style="position: sticky; top: 20px;">
            <div class="mb-3 pb-2" style="border-bottom: 2px solid #006699;">
                <div class="title is-5 mb-0 has-text-link"><i class="fas fa-book-open mr-2"></i>Mémento Cours</div>
            </div>
            ${content}
        </aside>
    </div>`;
}

// ============================================================================
// COMPOSANT 1 : CONSTRUCTEUR DONNEUR / RECEVEUR (BLEU & VERT)
// ============================================================================
function renderDonneurStep(containerId, situations, belt) {
    activeDonneurState = {};
    const container = document.getElementById(containerId);
    if (!container) return;

    let cardsHTML = situations.map(sit => {
        activeDonneurState[sit.id] = {}; // { actorName: 'contact' | 'distance' }
        const chips = sit.actorsPool.map(act => `
            <span class="actor-chip" id="chip-${sit.id}-${act}" onclick="toggleActor('${sit.id}', '${act.replace(/'/g, "\'")}')">
                <i class="fas fa-plus-circle mr-1"></i>${act}
            </span>
        `).join('');

        return `
        <div class="situation-card" id="card-${sit.id}">
            <div class="columns is-vcentered">
                <div class="column is-4">
                    <div class="scene-svg-box">${sit.svg}</div>
                </div>
                <div class="column is-8">
                    <h4 class="title is-6 mb-2 has-text-dark">${sit.title}</h4>
                    <p class="is-size-7 mb-2">
                        <span class="tag is-dark is-light">Receveur (Système) : <strong>${sit.receveur}</strong></span>
                        <span class="ml-2 has-text-grey">Cliquez sur le ou les donneur(s) qui agissent sur ${sit.receveur.toLowerCase()} :</span>
                    </p>
                    <div class="mb-2">${chips}</div>
                    <div id="selected-list-${sit.id}"></div>
                    <div id="feedback-${sit.id}" class="help mt-1"></div>
                </div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="columns">
            <div class="column">${cardsHTML}</div>
            ${getMementoHTML(belt)}
        </div>`;
}

window.toggleActor = function(sitId, actorName) {
    const state = activeDonneurState[sitId];
    if (state[actorName]) {
        delete state[actorName];
    } else {
        state[actorName] = "contact"; // valeur par défaut
    }
    updateDonneurUI(sitId);
};

window.setActorType = function(sitId, actorName, typeVal) {
    if (activeDonneurState[sitId] && activeDonneurState[sitId][actorName]) {
        activeDonneurState[sitId][actorName] = typeVal;
        updateDonneurUI(sitId);
    }
};

function updateDonneurUI(sitId) {
    const allSits = [...DATA_BLEU_VERT.bleu_entrainement, ...DATA_BLEU_VERT.bleu_test, ...DATA_BLEU_VERT.vert_entrainement, ...DATA_BLEU_VERT.vert_test];
    const sit = allSits.find(s => s.id === sitId);
    if (!sit) return;

    sit.actorsPool.forEach(act => {
        const chip = document.getElementById(`chip-${sitId}-${act}`);
        if (chip) {
            if (activeDonneurState[sitId][act]) chip.classList.add('selected');
            else chip.classList.remove('selected');
        }
    });

    const listEl = document.getElementById(`selected-list-${sitId}`);
    const entries = Object.entries(activeDonneurState[sitId]);
    if (entries.length === 0) {
        listEl.innerHTML = `<p class="is-size-7 has-text-grey-light is-italic">Aucun donneur sélectionné.</p>`;
        return;
    }

    listEl.innerHTML = entries.map(([act, type]) => {
        const escAct = act.replace(/'/g, "\'");
        return `
        <div class="action-row-config">
            <span>Action de <strong>${act}</strong> sur <strong>${sit.receveur.toLowerCase()}</strong></span>
            <div class="buttons has-addons mb-0">
                <button class="button is-small ${type === 'contact' ? 'is-info is-selected' : 'is-light'}" onclick="setActorType('${sitId}', '${escAct}', 'contact')">De contact</button>
                <button class="button is-small ${type === 'distance' ? 'is-warning is-selected' : 'is-light'}" onclick="setActorType('${sitId}', '${escAct}', 'distance')">À distance</button>
            </div>
        </div>`;
    }).join('');
}

function validateDonneurStep(situations) {
    let totalErrors = 0;
    let firstHint = "";

    situations.forEach(sit => {
        const card = document.getElementById(`card-${sit.id}`);
        const fb = document.getElementById(`feedback-${sit.id}`);
        const userMap = activeDonneurState[sit.id] || {};
        let sitErrors = [];

        // 1. Vérifier les donneurs attendus
        sit.expected.forEach(exp => {
            if (!userMap[exp.donneur]) {
                if (exp.donneur === "La Terre" && sit.hints && sit.hints.missing_Terre) {
                    sitErrors.push(sit.hints.missing_Terre);
                } else {
                    sitErrors.push(`Il manque un donneur qui agit sur ${sit.receveur.toLowerCase()}.`);
                }
            } else if (userMap[exp.donneur] !== exp.type) {
                sitErrors.push(`L'action de <strong>${exp.donneur}</strong> n'est pas "${userMap[exp.donneur] === 'contact' ? 'de contact' : 'à distance'}" (vérifie s'il y a contact ou non).`);
            }
        });

        // 2. Vérifier les intrus sélectionnés par erreur
        Object.keys(userMap).forEach(userAct => {
            if (!sit.expected.some(e => e.donneur === userAct)) {
                if (sit.hints && sit.hints[userAct]) {
                    sitErrors.push(sit.hints[userAct]);
                } else {
                    sitErrors.push(`<strong>${userAct}</strong> n'agit pas directement sur ${sit.receveur.toLowerCase()} à cet instant.`);
                }
            }
        });

        if (sitErrors.length === 0) {
            card.className = "situation-card is-correct";
            fb.className = "help is-success has-text-weight-bold";
            fb.innerHTML = `<i class="fas fa-check-circle mr-1"></i>Parfait !`;
        } else {
            totalErrors++;
            card.className = "situation-card is-incorrect";
            fb.className = "help is-danger has-text-weight-bold";
            fb.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${sitErrors[0]}`;
            if (!firstHint) firstHint = sitErrors[0];
        }
    });

    return {
        success: totalErrors === 0,
        errors: totalErrors,
        msg: totalErrors === 0
            ? "Toutes les situations sont correctement analysées !"
            : `Il reste <strong>${totalErrors} situation(s) à corriger</strong>. ${firstHint}`
    };
}

// ============================================================================
// COMPOSANT 2 : ÉDITEUR INTERACTIF DE D.O.I. (NIVEAU JAUNE)
// ============================================================================
function renderDOIStep(containerId, items) {
    activeDOIState = {};
    const container = document.getElementById(containerId);
    if (!container) return;

    const cardsHTML = items.map(item => {
        activeDOIState[item.id] = {};
        item.nodes.forEach(n => { activeDOIState[item.id][n.id] = "none"; });

        return `
        <div class="column is-6">
            <div class="situation-card" id="doi-card-${item.id}">
                <h4 class="title is-6 mb-2">${item.title}</h4>
                <div class="columns is-mobile is-vcentered mb-2">
                    <div class="column is-5">
                        <div class="scene-svg-box" style="height: 125px;">${item.svg}</div>
                    </div>
                    <div class="column is-7 is-size-7 has-text-grey">
                        <p class="mb-1"><i class="fas fa-mouse-pointer mr-1 has-text-info"></i><strong>Cliquez sur un objet périphérique</strong> (ou entre deux bulles) pour changer la flèche :</p>
                        <p>• 1 clic : <strong>Trait plein</strong> (contact)<br>• 2 clics : <strong>Pointillés</strong> (distance)<br>• 3 clics : Aucune interaction</p>
                    </div>
                </div>
                <div class="doi-canvas-wrapper">
                    <svg class="doi-svg" id="doi-svg-${item.id}" viewBox="0 0 300 280"></svg>
                </div>
                <div id="doi-fb-${item.id}" class="help mt-1"></div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="columns">
            <div class="column">
                <div class="columns is-multiline">${cardsHTML}</div>
            </div>
            ${getMementoHTML('jaune')}
        </div>`;

    items.forEach(item => drawDOIGraph(item));
}

function drawDOIGraph(item) {
    const svg = document.getElementById(`doi-svg-${item.id}`);
    if (!svg) return;
    const cx = 150, cy = 150;
    const state = activeDOIState[item.id];

    let defs = `<defs>
        <marker id="arr-end-${item.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e293b"/>
        </marker>
    </defs>`;

    let linksHTML = "";
    let nodesHTML = "";

    item.nodes.forEach(n => {
        const mode = state[n.id];
        const dx = n.x - cx, dy = n.y - cy;
        const dist = Math.hypot(dx, dy);
        const ux = dx / dist, uy = dy / dist;
        const x1 = cx + ux * 46, y1 = cy + uy * 30;
        const x2 = n.x - ux * 46, y2 = n.y - uy * 26;

        const escId = n.id.replace(/'/g, "\'");
        linksHTML += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e2e8f0" stroke-width="2"/>`;

        if (mode !== "none") {
            const dash = mode === "distance" ? 'stroke-dasharray="6,5"' : '';
            const strokeCol = mode === "contact" ? "#0284c7" : "#d97706";
            linksHTML += `<line class="doi-link-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeCol}" stroke-width="3" ${dash} marker-start="url(#arr-end-${item.id})" marker-end="url(#arr-end-${item.id})"/>`;
        }

        linksHTML += `<line class="doi-link-hit" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" onclick="cycleDOILink('${item.id}', '${escId}')"/>`;

        const strokeNode = mode === "contact" ? "#0284c7" : (mode === "distance" ? "#d97706" : "#94a3b8");
        nodesHTML += `
        <g class="doi-node" onclick="cycleDOILink('${item.id}', '${escId}')">
            <ellipse cx="${n.x}" cy="${n.y}" rx="48" ry="24" fill="#ffffff" stroke="${strokeNode}" stroke-width="2.5"/>
            <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b">${n.label}</text>
        </g>`;
    });

    const sysHTML = `
    <g>
        <ellipse cx="${cx}" cy="${cy}" rx="48" ry="28" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">${item.system}</text>
    </g>`;

    svg.innerHTML = defs + linksHTML + nodesHTML + sysHTML;
}

window.cycleDOILink = function(itemId, nodeId) {
    const order = ["none", "contact", "distance"];
    const curr = activeDOIState[itemId][nodeId];
    activeDOIState[itemId][nodeId] = order[(order.indexOf(curr) + 1) % order.length];
    const allItems = [...DATA_JAUNE.entrainement, ...DATA_JAUNE.test];
    const item = allItems.find(i => i.id === itemId);
    if (item) drawDOIGraph(item);
};

function validateDOIStep(items) {
    let errCount = 0;
    let firstMsg = "";

    items.forEach(item => {
        const card = document.getElementById(`doi-card-${item.id}`);
        const fb = document.getElementById(`doi-fb-${item.id}`);
        const user = activeDOIState[item.id];
        let localErr = "";

        for (const [nodeId, expMode] of Object.entries(item.expected)) {
            if (user[nodeId] !== expMode) {
                if (expMode === "none") {
                    localErr = item.hint || `L'objet <strong>${nodeId}</strong> n'agit pas directement sur le système (${item.system}) à cet instant !`;
                } else if (user[nodeId] === "none") {
                    localErr = `Tu as oublié l'interaction avec <strong>${nodeId}</strong>.`;
                } else {
                    localErr = `Vérifie le type de flèche pour <strong>${nodeId}</strong> : est-ce une interaction de contact (plein) ou à distance (pointillés) ?`;
                }
                break;
            }
        }

        if (!localErr) {
            card.className = "situation-card is-correct";
            fb.className = "help is-success has-text-weight-bold";
            fb.innerHTML = `<i class="fas fa-check-circle mr-1"></i>D.O.I. exact !`;
        } else {
            errCount++;
            card.className = "situation-card is-incorrect";
            fb.className = "help is-danger has-text-weight-bold";
            fb.innerHTML = `<i class="fas fa-exclamation-triangle mr-1"></i>${localErr}`;
            if (!firstMsg) firstMsg = localErr;
        }
    });

    return {
        success: errCount === 0,
        msg: errCount === 0
            ? "Bravo ! Tous tes Diagrammes Objet-Interaction sont justes."
            : `Il y a <strong>${errCount} schéma(s) à corriger</strong>. ${firstMsg}`
    };
}

// ============================================================================
// COMPOSANT 3 : TRACEUR INTERACTIF DE VECTEURS FORCES (ORANGE & ROUGE)
// ============================================================================
function renderVectorStep(containerId, configs, belt) {
    activeVectorInstances = {};
    const container = document.getElementById(containerId);
    if (!container) return;

    const cardsHTML = configs.map(cfg => {
        activeVectorInstances[cfg.id] = {
            config: cfg,
            selectedForceId: cfg.availableForces[0].id,
            drawn: {} // { forceId: { anchorId, x1, y1, x2, y2, angle } }
        };

        const forceBtns = cfg.availableForces.map((f, idx) => `
            <button class="button is-small ${idx === 0 ? 'is-dark' : 'is-light'}" id="fbtn-${cfg.id}-${f.id}" onclick="selectForceTool('${cfg.id}', '${f.id}')">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${f.color};margin-right:6px;"></span>
                <strong>${f.label}</strong>
            </button>
        `).join('');

        return `
        <div class="column ${configs.length > 1 ? 'is-6' : 'is-12'}">
            <div class="situation-card" id="veccard-${cfg.id}">
                <h4 class="title is-6 mb-1">${cfg.title}</h4>
                <p class="is-size-7 has-text-grey mb-2">${cfg.subtitle}</p>
                
                <div class="level is-mobile mb-2">
                    <div class="level-left">
                        <div class="buttons has-addons">${forceBtns}</div>
                    </div>
                    <div class="level-right">
                        <button class="button is-small is-danger is-light" onclick="clearVectors('${cfg.id}')">
                            <i class="fas fa-eraser mr-1"></i>Effacer
                        </button>
                    </div>
                </div>

                <div class="vector-stage" id="stage-${cfg.id}">
                    <svg class="vector-svg" id="vecsvg-${cfg.id}" viewBox="0 0 300 260"></svg>
                </div>
                <div id="vecfb-${cfg.id}" class="help mt-2"></div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="columns">
            <div class="column">
                <div class="notification is-info is-light py-2 px-3 mb-3 is-size-7">
                    <i class="fas fa-hand-pointer mr-1"></i><strong>Mode d'emploi :</strong> Sélectionnez la force à tracer au-dessus du schéma, puis <strong>cliquez sur un point d'application bleu et glissez la souris</strong> pour orienter la flèche.
                </div>
                <div class="columns is-multiline">${cardsHTML}</div>
            </div>
            ${getMementoHTML(belt)}
        </div>`;

    configs.forEach(cfg => initVectorCanvas(cfg));
}

window.selectForceTool = function(cfgId, forceId) {
    const inst = activeVectorInstances[cfgId];
    if (!inst) return;
    inst.selectedForceId = forceId;
    inst.config.availableForces.forEach(f => {
        const btn = document.getElementById(`fbtn-${cfgId}-${f.id}`);
        if (btn) btn.className = `button is-small ${f.id === forceId ? 'is-dark' : 'is-light'}`;
    });
};

window.clearVectors = function(cfgId) {
    const inst = activeVectorInstances[cfgId];
    if (!inst) return;
    inst.drawn = {};
    redrawVectorCanvas(cfgId);
};

function initVectorCanvas(cfg) {
    const svg = document.getElementById(`vecsvg-${cfg.id}`);
    if (!svg) return;

    let isDragging = false;
    let activeAnchor = null;

    const getSVGCoords = (ev) => {
        const rect = svg.getBoundingClientRect();
        const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
        const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
        return {
            x: (clientX - rect.left) * (300 / rect.width),
            y: (clientY - rect.top) * (260 / rect.height)
        };
    };

    const startDrag = (ev) => {
        const pt = getSVGCoords(ev);
        let bestAnchor = null;
        let minDist = 26;
        cfg.anchors.forEach(a => {
            const d = Math.hypot(pt.x - a.x, pt.y - a.y);
            if (d < minDist) { minDist = d; bestAnchor = a; }
        });
        if (!bestAnchor) return;
        ev.preventDefault();
        isDragging = true;
        activeAnchor = bestAnchor;
    };

    const moveDrag = (ev) => {
        if (!isDragging || !activeAnchor) return;
        ev.preventDefault();
        const pt = getSVGCoords(ev);
        const dx = pt.x - activeAnchor.x;
        const dy = pt.y - activeAnchor.y;
        const len = Math.hypot(dx, dy);
        if (len < 15) return;

        let rawDeg = Math.atan2(dy, dx) * (180 / Math.PI);
        const keyAngles = [0, 90, -90, 180, -180, -135, -115, -55, -45, 139];
        for (const ka of keyAngles) {
            if (Math.abs(rawDeg - ka) < 7) { rawDeg = ka; break; }
        }

        const rad = rawDeg * (Math.PI / 180);
        const fixedLen = Math.min(Math.max(len, 55), 85);
        const x2 = activeAnchor.x + Math.cos(rad) * fixedLen;
        const y2 = activeAnchor.y + Math.sin(rad) * fixedLen;

        const inst = activeVectorInstances[cfg.id];
        inst.drawn[inst.selectedForceId] = {
            anchorId: activeAnchor.id,
            x1: activeAnchor.x,
            y1: activeAnchor.y,
            x2: x2,
            y2: y2,
            angle: rawDeg
        };
        redrawVectorCanvas(cfg.id);
    };

    const endDrag = () => {
        if (isDragging) {
            isDragging = false;
            activeAnchor = null;
            const inst = activeVectorInstances[cfg.id];
            const nextF = cfg.availableForces.find(f => !inst.drawn[f.id]);
            if (nextF) selectForceTool(cfg.id, nextF.id);
        }
    };

    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    svg.addEventListener('touchstart', startDrag, { passive: false });
    svg.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend', endDrag);

    redrawVectorCanvas(cfg.id);
}

function redrawVectorCanvas(cfgId) {
    const inst = activeVectorInstances[cfgId];
    if (!inst) return;
    const cfg = inst.config;
    const svg = document.getElementById(`vecsvg-${cfgId}`);
    if (!svg) return;

    let defs = `<defs>`;
    cfg.availableForces.forEach(f => {
        defs += `
        <marker id="vec-arr-${cfgId}-${f.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="${f.color}"/>
        </marker>`;
    });
    defs += `</defs>`;

    let bgHTML = `<g id="bg-layer-${cfgId}">${cfg.svgBg}</g>`;

    let anchorsHTML = cfg.anchors.map(a => `
        <g>
            <circle class="anchor-point" cx="${a.x}" cy="${a.y}" r="6">
                <title>${a.label}</title>
            </circle>
        </g>
    `).join('');

    let vectorsHTML = "";
    for (const [fId, vec] of Object.entries(inst.drawn)) {
        const fMeta = cfg.availableForces.find(f => f.id === fId);
        if (!fMeta) continue;
        vectorsHTML += `
        <g>
            <line x1="${vec.x1}" y1="${vec.y1}" x2="${vec.x2}" y2="${vec.y2}" stroke="${fMeta.color}" stroke-width="3.5" marker-end="url(#vec-arr-${cfgId}-${fId})"/>
            <rect x="${vec.x2 - 28}" y="${vec.y2 - 22}" width="56" height="16" rx="3" fill="rgba(255,255,255,0.85)"/>
            <text x="${vec.x2}" y="${vec.y2 - 10}" text-anchor="middle" font-size="11" font-weight="bold" fill="${fMeta.color}">
                ${fMeta.label.split(' ')[0]}
            </text>
        </g>`;
    }

    svg.innerHTML = defs + bgHTML + anchorsHTML + vectorsHTML;
}

function angleDiff(a, b) {
    let d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
}

function validateVectorStep(configs) {
    let errCount = 0;
    let firstErrorMsg = "";

    configs.forEach(cfg => {
        const inst = activeVectorInstances[cfg.id];
        const card = document.getElementById(`veccard-${cfg.id}`);
        const fb = document.getElementById(`vecfb-${cfg.id}`);
        const bgLayer = document.getElementById(`bg-layer-${cfg.id}`);
        let localError = "";

        for (const exp of cfg.expectedVectors) {
            const drawn = inst.drawn[exp.id];
            const fMeta = cfg.availableForces.find(f => f.id === exp.id);
            if (!drawn) {
                localError = `Tu n'as pas encore tracé la force <strong>${fMeta.label}</strong>.`;
                break;
            }
            if (drawn.anchorId !== exp.anchor) {
                localError = exp.hintAnchor;
                break;
            }
            if (angleDiff(drawn.angle, exp.angle) > exp.tol) {
                localError = exp.hintDir;
                break;
            }
        }

        if (!localError) {
            card.className = "situation-card is-correct";
            fb.className = "help is-success has-text-weight-bold";
            fb.innerHTML = `<i class="fas fa-check-circle mr-1"></i>Représentation vectorielle parfaite !`;
        } else {
            errCount++;
            card.className = "situation-card is-incorrect";
            fb.className = "help is-danger has-text-weight-bold";
            fb.innerHTML = `<i class="fas fa-exclamation-triangle mr-1"></i>${localError}`;
            if (!firstErrorMsg) firstErrorMsg = localError;

            if (bgLayer) {
                bgLayer.classList.remove('sim-fall', 'sim-fly');
                void bgLayer.offsetWidth;
                bgLayer.classList.add('sim-fall');
            }
        }
    });

    return {
        success: errCount === 0,
        msg: errCount === 0
            ? "Excellent ! Tous les vecteurs forces ont le bon point d'application, la bonne direction et le bon sens."
            : `Attention : ${firstErrorMsg}`
    };
}

// ============================================================================
// COMPOSANT 4 : SYNTHÈSE NIVEAU ROUGE (CALCUL P = m*g + VECTEURS)
// ============================================================================
function renderRougeStep(containerId, dataObj) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="box consigne-box mb-4">
            <h4 class="title is-5 mb-2">${dataObj.title}</h4>
            <p class="mb-3">${dataObj.enonce}</p>
            <div class="field is-horizontal is-align-items-center">
                <div class="field-label is-normal" style="flex-grow: 0; white-space: nowrap; margin-right: 12px;">
                    <label class="label mb-0">${dataObj.calcQuestion}</label>
                </div>
                <div class="field-body" style="max-width: 220px;">
                    <div class="field has-addons mb-0">
                        <p class="control">
                            <input class="input has-text-weight-bold" type="text" id="input-p-${dataObj.id}" placeholder="Ex: 589">
                        </p>
                        <p class="control">
                            <a class="button is-static">N</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div id="rouge-vec-zone"></div>
    `;

    renderVectorStep("rouge-vec-zone", [dataObj.vectorConfig], "rouge");
}

function validateRougeStep(dataObj) {
    const inputEl = document.getElementById(`input-p-${dataObj.id}`);
    if (!inputEl) return { success: false, msg: "Erreur interne." };

    const rawVal = parseFloat(inputEl.value.trim().replace(',', '.'));
    if (isNaN(rawVal)) {
        inputEl.classList.add('is-danger');
        return { success: false, msg: "Veuillez d'abord calculer et saisir la valeur numérique du poids <strong>P</strong> en Newton (N)." };
    }

    if (dataObj.unitTrapVal && Math.abs(rawVal - dataObj.unitTrapVal) < 20) {
        inputEl.classList.add('is-danger');
        return {
            success: false,
            msg: `Un cerf-volant d'un poids de ${rawVal} N (soit 200 kg) ?! Attention : dans <code>P = m × g</code>, la masse <strong>m = 200 g</strong> doit d'abord être convertie en <strong>kilogrammes (kg)</strong> !`
        };
    }

    if (Math.abs(rawVal - dataObj.expectedP) > dataObj.tolP) {
        inputEl.classList.add('is-danger');
        return {
            success: false,
            msg: `La valeur du poids P (${rawVal} N) est incorrecte. Utilisez la relation <strong>P = m × g</strong> avec g = 9,81 N/kg.`
        };
    }

    inputEl.classList.remove('is-danger');
    inputEl.classList.add('is-success');

    const vecRes = validateVectorStep([dataObj.vectorConfig]);
    if (!vecRes.success) return vecRes;

    return {
        success: true,
        msg: `Bravo ! Le calcul du poids (P = ${dataObj.expectedP} N) et le tracé des 3 forces sont parfaitement exacts !`
    };
}

// ============================================================================
// STRUCTURE DU PARCOURS DIFFÉRENCIÉ (BLEU -> VERT -> JAUNE -> ORANGE -> ROUGE)
// ============================================================================
const STRUCTURE_TP = {
    bleu: [
        {
            title: "Niveau Bleu — Entraînement (Actions mécaniques)",
            onLoad: () => renderDonneurStep("spa-container", DATA_BLEU_VERT.bleu_entrainement, "bleu"),
            validate: () => validateDonneurStep(DATA_BLEU_VERT.bleu_entrainement)
        },
        {
            title: "Niveau Bleu — Test d'autonomie",
            onLoad: () => renderDonneurStep("spa-container", DATA_BLEU_VERT.bleu_test, "bleu"),
            validate: () => {
                const res = validateDonneurStep(DATA_BLEU_VERT.bleu_test);
                if (res.success) {
                    completedBelts.add("bleu");
                    completedBelts.add("vert");
                    res.msg = `<i class="fas fa-award mr-1"></i><strong>Test Bleu réussi !</strong> Comme tout est juste, vous passez directement au <strong>Niveau Jaune</strong> (le Niveau Vert est validé d'office) !`;
                    res.nextOverride = { part: "jaune", step: 0 };
                } else {
                    res.msg += `<br><span class="is-size-7">Astuce : si ce test vous pose problème, cliquez sur le bouton <strong>Vert</strong> en haut pour faire l'étape de remédiation.</span>`;
                }
                return res;
            },
            actionLabel: "Aller au Niveau Vert (Remédiation)",
            onAction: () => jumpToLevel("vert")
        }
    ],
    vert: [
        {
            title: "Niveau Vert — Entraînement (Remédiation)",
            onLoad: () => renderDonneurStep("spa-container", DATA_BLEU_VERT.vert_entrainement, "vert"),
            validate: () => validateDonneurStep(DATA_BLEU_VERT.vert_entrainement)
        },
        {
            title: "Niveau Vert — Test",
            onLoad: () => renderDonneurStep("spa-container", DATA_BLEU_VERT.vert_test, "vert"),
            validate: () => {
                const res = validateDonneurStep(DATA_BLEU_VERT.vert_test);
                if (res.success) {
                    completedBelts.add("vert");
                    res.nextOverride = { part: "jaune", step: 0 };
                }
                return res;
            }
        }
    ],
    jaune: [
        {
            title: "Niveau Jaune — Entraînement (Diagramme Objet-Interaction)",
            onLoad: () => renderDOIStep("spa-container", DATA_JAUNE.entrainement),
            validate: () => validateDOIStep(DATA_JAUNE.entrainement)
        },
        {
            title: "Niveau Jaune — Test (6 situations)",
            onLoad: () => renderDOIStep("spa-container", DATA_JAUNE.test),
            validate: () => {
                const res = validateDOIStep(DATA_JAUNE.test);
                if (res.success) {
                    completedBelts.add("jaune");
                    res.nextOverride = { part: "orange", step: 0 };
                }
                return res;
            }
        }
    ],
    orange: [
        {
            title: "Niveau Orange — Entraînement (Modélisation par des forces)",
            onLoad: () => renderVectorStep("spa-container", DATA_ORANGE.entrainement, "orange"),
            validate: () => validateVectorStep(DATA_ORANGE.entrainement)
        },
        {
            title: "Niveau Orange — Test (Tracé des forces)",
            onLoad: () => renderVectorStep("spa-container", DATA_ORANGE.test, "orange"),
            validate: () => {
                const res = validateVectorStep(DATA_ORANGE.test);
                if (res.success) {
                    completedBelts.add("orange");
                    res.nextOverride = { part: "rouge", step: 0 };
                }
                return res;
            }
        }
    ],
    rouge: [
        {
            title: "Niveau Rouge — Entraînement (Le skieur sur le tire-fesse)",
            onLoad: () => renderRougeStep("spa-container", DATA_ROUGE.entrainement),
            validate: () => validateRougeStep(DATA_ROUGE.entrainement)
        },
        {
            title: "Niveau Rouge — Test Final (Le cerf-volant)",
            onLoad: () => renderRougeStep("spa-container", DATA_ROUGE.test),
            validate: () => {
                const res = validateRougeStep(DATA_ROUGE.test);
                if (res.success) {
                    completedBelts.add("rouge");
                    document.getElementById('global-btn-home').style.display = 'inline-flex';
                }
                return res;
            }
        }
    ]
};

// ============================================================================
// ROUTEUR SPA & ACCUEIL
// ============================================================================
let pendingNextOverride = null;

function renderHome() {
    currentPart = "";
    document.getElementById('global-controls').style.display = 'none';
    document.getElementById('level-Belt-bar').style.display = 'none';

    document.getElementById('spa-container').innerHTML = `
        <div class="columns is-desktop is-variable is-5">
            <div class="column is-7">
                <div class="box content is-medium" style="height: 100%;">
                    <h2 class="title is-4 has-text-primary"><i class="fas fa-compress-arrows-alt mr-2"></i>Séquence MI-2 : Modéliser une action par une force</h2>
                    <p>En physique, lorsqu'un objet agit sur un autre (une raquette qui frappe une balle, un fil qui retient une lampe, la Terre qui nous attire), on parle d'<strong>action mécanique</strong>.</p>
                    <p>Dans cette activité interactive par <strong>parcours de couleurs</strong>, vous allez apprendre à :</p>
                    <ul>
                        <li>Identifier le <strong>donneur</strong>, le <strong>receveur</strong> et distinguer une action <strong>de contact</strong> d'une action <strong>à distance</strong>.</li>
                        <li>Construire un <strong>Diagramme Objet-Interaction (D.O.I.)</strong>.</li>
                        <li>Modéliser une action mécanique par un <strong>vecteur force</strong> (point d'application, direction, sens, valeur en Newton).</li>
                    </ul>
                    <div class="notification is-info is-light mt-4 is-size-6">
                        <i class="fas fa-route mr-2"></i><strong>Parcours adaptatif :</strong> Commencez au <strong>Niveau Bleu</strong>. Si vous réussissez le test Bleu du premier coup, vous sauterez directement au <strong>Niveau Jaune</strong> !
                    </div>
                </div>
            </div>

            <div class="column is-5">
                <h3 class="title is-5 mb-3 has-text-grey-dark"><i class="fas fa-flag-checkered mr-2"></i>Choisissez votre niveau</h3>
                <div class="is-flex is-flex-direction-column" style="gap: 10px;">
                    <button class="button is-info is-light is-justify-content-flex-start p-4" style="height:auto;" onclick="jumpToLevel('bleu')">
                        <div class="has-text-left">
                            <strong class="is-block is-size-6">1. Niveau BLEU — Actions mécaniques</strong>
                            <span class="is-size-7">Identifier Donneur, Receveur, Contact et Distance (Tennis & Handball).</span>
                        </div>
                    </button>
                    <button class="button is-success is-light is-justify-content-flex-start p-4" style="height:auto;" onclick="jumpToLevel('vert')">
                        <div class="has-text-left">
                            <strong class="is-block is-size-6">2. Niveau VERT — Consolidation</strong>
                            <span class="is-size-7">Situations complémentaires (Système solaire, aimant, kitesurf, iceberg).</span>
                        </div>
                    </button>
                    <button class="button is-warning is-light is-justify-content-flex-start p-4" style="height:auto;" onclick="jumpToLevel('jaune')">
                        <div class="has-text-left">
                            <strong class="is-block is-size-6">3. Niveau JAUNE — Diagramme Objet-Interaction</strong>
                            <span class="is-size-7">Construire les D.O.I. interactifs pour faire le bilan des interactions.</span>
                        </div>
                    </button>
                    <button class="button is-light is-justify-content-flex-start p-4" style="height:auto; border-left: 5px solid #ff7700;" onclick="jumpToLevel('orange')">
                        <div class="has-text-left">
                            <strong class="is-block is-size-6" style="color:#d96000;">4. Niveau ORANGE — Vecteurs Forces</strong>
                            <span class="is-size-7">Caractériser et tracer les vecteurs forces directement sur les schémas.</span>
                        </div>
                    </button>
                    <button class="button is-danger is-light is-justify-content-flex-start p-4" style="height:auto;" onclick="jumpToLevel('rouge')">
                        <div class="has-text-left">
                            <strong class="is-block is-size-6">5. Niveau ROUGE — Synthèse & Calcul du poids</strong>
                            <span class="is-size-7">Étude complète du skieur sur piste inclinée et du cerf-volant (P = m × g).</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>`;
}

window.jumpToLevel = function(partKey) {
    currentPart = partKey;
    currentStepIndex = 0;
    renderStep();
};

function updateBeltBarUI() {
    const bar = document.getElementById('level-Belt-bar');
    bar.style.display = 'block';
    document.querySelectorAll('.belt-btn').forEach(btn => {
        const p = btn.getAttribute('data-part');
        btn.classList.remove('active-belt', 'completed-belt');
        if (p === currentPart) btn.classList.add('active-belt');
        else if (completedBelts.has(p)) btn.classList.add('completed-belt');
    });
    const step = STRUCTURE_TP[currentPart][currentStepIndex];
    document.getElementById('step-title-badge').textContent = step.title;
}

function renderStep() {
    pendingNextOverride = null;
    updateBeltBarUI();

    const step = STRUCTURE_TP[currentPart][currentStepIndex];
    const ctrl = document.getElementById('global-controls');
    ctrl.style.display = 'block';

    const btnVerif = document.getElementById('global-btn-verif');
    const btnAction = document.getElementById('global-btn-action');
    const msgBox = document.getElementById('global-message-box');
    const btnNext = document.getElementById('global-btn-next');

    msgBox.innerHTML = "";
    msgBox.className = "has-text-centered";

    btnNext.style.display = 'none';
    document.getElementById('global-btn-home').style.display = 'none';

    btnVerif.style.display = "inline-flex";
    btnVerif.onclick = executeValidation;

    if (step.actionLabel && step.onAction) {
        btnAction.style.display = "inline-flex";
        btnAction.textContent = step.actionLabel;
        btnAction.onclick = step.onAction;
    } else {
        btnAction.style.display = "none";
    }

    if (step.onLoad) step.onLoad();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function executeValidation() {
    const step = STRUCTURE_TP[currentPart][currentStepIndex];
    const res = step.validate();
    const msgBox = document.getElementById('global-message-box');

    msgBox.innerHTML = res.msg;
    msgBox.className = res.success
        ? "notification is-success is-light py-2 px-4 m-0"
        : "notification is-danger is-light py-2 px-4 m-0";

    msgBox.classList.remove('feedback-anim');
    void msgBox.offsetWidth;
    msgBox.classList.add('feedback-anim');

    if (res.success) {
        pendingNextOverride = res.nextOverride || null;
        const btnNext = document.getElementById('global-btn-next');
        if (!(currentPart === 'rouge' && currentStepIndex === STRUCTURE_TP.rouge.length - 1)) {
            btnNext.style.display = 'inline-flex';
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
    if (pendingNextOverride) {
        currentPart = pendingNextOverride.part;
        currentStepIndex = pendingNextOverride.step;
        renderStep();
        return;
    }
    if (currentStepIndex < STRUCTURE_TP[currentPart].length - 1) {
        currentStepIndex++;
        renderStep();
    } else {
        renderHome();
    }
};

document.getElementById('global-btn-home').onclick = () => renderHome();
window.onload = () => renderHome();

// Raccourcis clavier Enseignant (Ctrl + Flèches)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'ArrowRight' && currentPart !== "") {
        event.preventDefault();
        if (currentStepIndex < STRUCTURE_TP[currentPart].length - 1) {
            currentStepIndex++;
            renderStep();
        }
    } else if (event.ctrlKey && event.key === 'ArrowLeft' && currentPart !== "") {
        event.preventDefault();
        if (currentStepIndex > 0) {
            currentStepIndex--;
            renderStep();
        } else {
            renderHome();
        }
    }
});
