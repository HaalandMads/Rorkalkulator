"use strict";

/* ============================================================
   Rørdata (nominelle verdier - se note i Dimensjoner-fanen)
   ============================================================ */
const PIPE_SYSTEMS = {
  "PE-Rør": [[16,12.4],[20,16],[25,20.4],[32,26],[40,32.6],[50,40.8],[63,51.4],[75,61.4],[90,73.6],[110,90],[125,102.2],[140,114.6],[160,130.8],[180,147.2],[200,163.6],[225,184],[250,204.6],[280,229.2],[315,257.8],[355,290.6]],
  "Kobber": [[10,8.4],[12,10],[15,13],[18,16],[22,20],[28,25.6],[35,32],[42,39],[54,51],[76.1,72.1]],
  "Sanipex": [[12,8.6],[16,11.6],[20,14.4],[25,18]],
  "PP-Grunnavløp": [[110,102.4],[125,116.4],[160,149],[200,186.2],[250,232.8],[315,293.4],[400,372.6]],
  "PVC-Grunnavløp og Overvann": [[75,68.6],[110,103.6],[125,117.6],[160,150.6],[200,188.2],[250,235.4],[315,296.6],[400,376.6]],
  "Mapress Galv": [[12,9.6],[15,12.6],[18,15.6],[22,19],[28,25],[35,32],[42,39],[54,51],[76.1,72.1]],
  "Mapress syrefast": [[12,10],[15,13],[18,16],[22,19.6],[28,25.6],[35,32],[42,39],[54,51],[76.1,72.1]],
};

// Brukes i "Automatisk rørforslag" (Forbruksvann) og rørvalget i Ventetid -
// et bevisst mindre utvalg enn hele referansetabellen i Dimensjoner-fanen.
const COMMON_SYSTEMS = ["PE-Rør", "Kobber", "Sanipex", "Mapress syrefast"];

const $ = (id) => document.getElementById(id);
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "-");

/* ============================================================
   Persistens (localStorage) - husker siste verdier på enheten
   ============================================================ */
const STORE_KEY = "rorkalk_v1";
function saveState() {
  const ids = ["fv_qnKV","fv_qnVV","fv_maxKV","fv_maxVV","fv_hoses","fv_v","fv_system",
               "d_q","d_v","v_q","v_d","q_v","q_d","vt_di","vt_qn","vt_l","vt_system","vt_dim"];
  const state = {};
  ids.forEach(id => { const el = $(id); if (el) state[id] = el.value; });
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    Object.keys(state).forEach(id => { const el = $(id); if (el) el.value = state[id]; });
  } catch (e) {}
}

/* ============================================================
   Forbruksvann
   ============================================================ */
function qs(sumQn, maxQn) {
  const diff = Math.max(0, sumQn - maxQn);
  return maxQn + 0.015 * diff + 0.17 * Math.sqrt(diff);
}

function minDim(flowLps, velocity) {
  if (!(velocity > 0)) return NaN;
  return 20 * Math.sqrt((10 * flowLps) / (Math.PI * velocity));
}

function suggestPipe(system, minDimMm) {
  const list = PIPE_SYSTEMS[system];
  if (!list || !Number.isFinite(minDimMm)) return null;
  for (const [outer, inner] of list) {
    if (inner >= minDimMm) return { outer, inner };
  }
  return null;
}

function populateSystemSelects() {
  // Forbruksvann: automatisk rørforslag - kun de 4 mest brukte systemene
  const fvSel = $("fv_system");
  fvSel.innerHTML = "";
  COMMON_SYSTEMS.forEach(n => {
    const o = document.createElement("option");
    o.value = n; o.textContent = n;
    fvSel.appendChild(o);
  });

  // Dimensjoner-fanen: hele referansetabellen, uendret
  const dimSel = $("dim_system");
  dimSel.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "__ALL__";
  optAll.textContent = "Alle systemer";
  dimSel.appendChild(optAll);
  Object.keys(PIPE_SYSTEMS).forEach(n => {
    const o = document.createElement("option");
    o.value = n; o.textContent = n;
    dimSel.appendChild(o);
  });

  // Ventetid: samme 4 systemer, pluss mulighet for å skrive inn selv
  const vtSel = $("vt_system");
  vtSel.innerHTML = "";
  COMMON_SYSTEMS.forEach(n => {
    const o = document.createElement("option");
    o.value = n; o.textContent = n;
    vtSel.appendChild(o);
  });
  const optCustom = document.createElement("option");
  optCustom.value = "__CUSTOM__";
  optCustom.textContent = "Egendefinert (skriv inn selv)";
  vtSel.appendChild(optCustom);
}

function populateVentetidDims() {
  const system = $("vt_system").value;
  const dimSel = $("vt_dim");
  const dimRow = $("vt_dim_row");
  const diInput = $("vt_di");

  if (system === "__CUSTOM__") {
    dimRow.style.display = "none";
    diInput.readOnly = false;
    diInput.classList.remove("locked");
    return;
  }
  dimRow.style.display = "flex";
  dimSel.innerHTML = "";
  (PIPE_SYSTEMS[system] || []).forEach(([outer, inner]) => {
    const o = document.createElement("option");
    o.value = inner;
    o.textContent = outer + " mm  (innv. " + inner + " mm)";
    dimSel.appendChild(o);
  });
  diInput.readOnly = true;
  diInput.classList.add("locked");
  applyVentetidDim();
}

function applyVentetidDim() {
  const system = $("vt_system").value;
  if (system === "__CUSTOM__") return;
  const inner = parseFloat($("vt_dim").value);
  if (Number.isFinite(inner)) {
    $("vt_di").value = inner;
    recalcVentetid();
  }
}

function recalcForbruksvann() {
  const qnKV = parseFloat($("fv_qnKV").value) || 0;
  const qnVV = parseFloat($("fv_qnVV").value) || 0;
  const maxKV = parseFloat($("fv_maxKV").value) || 0;
  const maxVV = parseFloat($("fv_maxVV").value) || 0;
  const hoses = parseFloat($("fv_hoses").value) || 0;
  const v = parseFloat($("fv_v").value) || 2;

  const perHose = 1.86 / 3.6;
  const hoseFlow = hoses * perHose;

  const qsKV = qs(qnKV, maxKV);
  const qsVV = qs(qnVV, maxVV);
  const totalKV = qsKV + hoseFlow;

  $("out_qsKV").innerHTML = fmt(totalKV) + ' <span class="unit-sm">l/s' + (hoses > 0 ? " (inkl. brann)" : "") + '</span>';
  $("out_qsVV").innerHTML = fmt(qsVV) + ' <span class="unit-sm">l/s</span>';

  const dKV = minDim(totalKV, v);
  const dVV = minDim(qsVV, v);

  const system = $("fv_system").value;
  const sugKV = suggestPipe(system, dKV);
  const sugVV = suggestPipe(system, dVV);

  $("out_dimKV").textContent = fmt(dKV, 1) + " mm  →  " + (sugKV ? sugKV.outer + " mm" : "utenfor tabell");
  $("out_dimVV").textContent = fmt(dVV, 1) + " mm  →  " + (sugVV ? sugVV.outer + " mm" : "utenfor tabell");

  saveState();
}

/* ---- Kalkulator: dimensjon / hastighet / volumstrøm ---- */
function recalcMiniTool() {
  const active = document.querySelector("#calcSeg button.active").dataset.tool;
  let label = "", value = "";
  if (active === "dim") {
    const q = parseFloat($("d_q").value) || 0;
    const v = parseFloat($("d_v").value) || 0;
    label = "Innvendig dimensjon";
    value = fmt(minDim(q, v), 1) + " mm";
  } else if (active === "vel") {
    const q = parseFloat($("v_q").value) || 0;
    const d = parseFloat($("v_d").value) || 0;
    const vel = d > 0 ? (4000 * q) / (Math.PI * d * d) : NaN;
    label = "Hastighet";
    value = fmt(vel, 2) + " m/s";
  } else if (active === "flow") {
    const v = parseFloat($("q_v").value) || 0;
    const d = parseFloat($("q_d").value) || 0;
    const q = (v * (Math.PI / 4) * d * d) / 1000;
    label = "Volumstrøm";
    value = fmt(q, 2) + " l/s";
  }
  $("calcOutLabel").textContent = label;
  $("calcOut").textContent = value;
  saveState();
}

/* ============================================================
   Ventetid varmtvann
   ============================================================ */
function recalcVentetid() {
  const di = parseFloat($("vt_di").value) || 0;
  const qn = parseFloat($("vt_qn").value) || 0;
  const L = parseFloat($("vt_l").value) || 0;
  let t = NaN;
  if (qn > 0) {
    t = (Math.PI / 4) / qn * Math.pow(10, 3) * Math.pow(di, 2) * L / 1000000;
  }
  $("out_ventetid").innerHTML = fmt(t, 1) + ' <span class="unit-sm">sek</span>';
  const row = $("vt_result_row");
  row.classList.remove("status-ok", "status-bad");
  if (Number.isFinite(t)) row.classList.add(t > 10 ? "status-bad" : "status-ok");
  saveState();
}

/* ============================================================
   Dimensjoner - tabellvisning med søk/filter
   ============================================================ */
function renderDimTable() {
  const sysFilter = $("dim_system").value;
  const search = $("dim_search").value.trim();
  const tbody = $("dimTableBody");
  tbody.innerHTML = "";
  const systems = sysFilter === "__ALL__" ? Object.keys(PIPE_SYSTEMS) : [sysFilter];
  systems.forEach(sys => {
    PIPE_SYSTEMS[sys].forEach(([outer, inner]) => {
      if (search && !String(outer).includes(search) && !String(inner).includes(search)) return;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${sys}</td><td>${outer}</td><td>${inner}</td>`;
      tbody.appendChild(tr);
    });
  });
}

/* ============================================================
   Navigasjon (faner)
   ============================================================ */
function switchView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll("nav.tabbar button").forEach(b => b.classList.remove("active"));
  $("view-" + name).classList.add("active");
  document.querySelector(`nav.tabbar button[data-view="${name}"]`).classList.add("active");
  const titles = { forbruksvann: "Forbruksvann", ventetid: "Ventetid varmtvann", dimensjoner: "Rørdimensjoner" };
  $("headerSub").textContent = titles[name];
}

/* ============================================================
   Init
   ============================================================ */
function init() {
  populateSystemSelects();
  loadState();
  populateVentetidDims();
  loadState(); // gjenopprett lagret dimensjon nå som alternativene finnes
  applyVentetidDim();
  renderDimTable();

  document.querySelectorAll("nav.tabbar button").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.querySelectorAll("#view-forbruksvann input, #view-forbruksvann select").forEach(el => {
    el.addEventListener("input", () => { recalcForbruksvann(); recalcMiniTool(); });
  });

  document.querySelectorAll("#calcSeg button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#calcSeg button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".subtool").forEach(s => s.classList.remove("active"));
      btn.classList.add("active");
      $("tool-" + btn.dataset.tool).classList.add("active");
      recalcMiniTool();
    });
  });

  document.querySelectorAll("#view-ventetid input").forEach(el => {
    el.addEventListener("input", recalcVentetid);
  });
  $("vt_system").addEventListener("change", () => { populateVentetidDims(); saveState(); });
  $("vt_dim").addEventListener("change", () => { applyVentetidDim(); saveState(); });

  $("dim_system").addEventListener("change", renderDimTable);
  $("dim_search").addEventListener("input", renderDimTable);

  recalcForbruksvann();
  recalcMiniTool();
  recalcVentetid();

  setupInstallPrompt();
  registerServiceWorker();
}

/* ============================================================
   PWA: installasjon og service worker
   ============================================================ */
function setupInstallPrompt() {
  const banner = $("installBanner");
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone === true ||
                        window.matchMedia("(display-mode: standalone)").matches;
  const dismissedKey = "rorkalk_install_dismissed";

  $("installDismiss").addEventListener("click", () => {
    banner.style.display = "none";
    localStorage.setItem(dismissedKey, "1");
  });

  if (isStandalone || localStorage.getItem(dismissedKey)) return;

  if (isIOS) {
    // iOS støtter ikke beforeinstallprompt - vis manuell fremgangsmåte i stedet.
    $("installText").innerHTML = isSafari
      ? 'Trykk <strong>Del</strong>-ikonet nederst i Safari, og velg <strong>«Legg til på Hjem-skjerm»</strong>.'
      : 'Åpne denne siden i <strong>Safari</strong> (ikke ' + (/crios/i.test(navigator.userAgent) ? "Chrome" : "denne appen") + ') for å installere den.';
    $("installBtn").style.display = "none";
    banner.style.display = "flex";
    return;
  }

  // Android/Chrome-familien: bruk den ekte install-prompten.
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    banner.style.display = "flex";
  });
  $("installBtn").addEventListener("click", async () => {
    banner.style.display = "none";
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
  });
  window.addEventListener("appinstalled", () => { banner.style.display = "none"; });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
