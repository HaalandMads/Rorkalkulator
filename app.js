"use strict";

/* ============================================================
   Rørdata (nominelle verdier - se note i Dimensjoner-fanen)
   ============================================================ */
const PIPE_SYSTEMS = {
  "PE-Rør SDR11": [[16,12.4],[20,16],[25,20.4],[32,26],[40,32.6],[50,40.8],[63,51.4],[75,61.4],[90,73.6],[110,90],[125,102.2],[140,114.6],[160,130.8],[180,147.2],[200,163.6],[225,184],[250,204.6],[280,229.2],[315,257.8],[355,290.6]],
  "FlowFit": [[16,12],[20,16],[25,20],[32,26.4],[40,34],[50,42.4],[63,55]],
  "Kobber": [[10,8.4],[12,10],[15,13],[18,16],[22,20],[28,25.6],[35,32],[42,39],[54,51],[76.1,72.1]],
  "Mepla": [[16,11.5],[20,15],[25,19],[32,26],[40,33],[50,42],[63,54]],
  "LK PAL": [[16,12],[20,15],[25,18],[32,26],[40,33],[50,42],[63,54],[75,60]],
  "Sanipex": [[12,8.6],[16,11.6],[20,14.4],[25,18]],
  "LK PE-X": [[16,12],[20,15],[25,18]],
  "Roth Multipex": [[12,8],[15,10],[18,12.4],[22,15.2],[28,20]],
  "PP-Grunnavløp": [[110,102.4],[125,116.4],[160,149],[200,186.2],[250,232.8],[315,293.4],[400,372.6]],
  "PP avløp": [[32,28.4],[40,36.4],[50,46.4],[75,70.4],[90,84.4],[110,103.2]],
  "MA": [[58,51],[75,68],[110,103],[135,127],[160,152]],
  "Pragma Overvann": [[110,97],[160,139],[200,176],[250,222],[315,278],[400,352],[500,439],[630,554]],
  "PVC-Grunnavløp og Overvann": [[75,68.6],[110,103.6],[125,117.6],[160,150.6],[200,188.2],[250,235.4],[315,296.6],[400,376.6]],
  "Geberit Silent": [[32,28],[40,36],[50,46],[75,69.8],[90,83.8],[110,102.8],[125,116.6],[160,149.6]],
  "Pragma Infra Overvann": [[343,299],[458,398],[573,498],[688,597],[888,795],[1143,993],[1356,1191],[1583,1393]],
  "Mapress Galv": [[12,9.6],[15,12.6],[18,15.6],[22,19],[28,25],[35,32],[42,39],[54,51],[76.1,72.1]],
  "Rillet stålrør": [[42.4,37.8],[48.3,43.7],[60.3,55.1],[76.1,70.9],[88.9,83.1],[114.3,107.9],[139.7,132.5],[168.3,160.3],[219.1,210.1],[273,263]],
  "Syrefaste stålrør": [[21.3,18.1],[21.3,17.3],[26.9,23.7],[26.9,22.9],[33.7,30.5],[33.7,29.7],[42.4,39.2],[42.4,38.4],[48.3,45.1],[48.3,44.3],[60.3,57.1],[60.3,56.3],[76.1,72.9],[76.1,72.1],[88.9,85.7],[88.9,84.9],[114.3,111.1],[114.3,110.3],[114.3,109.1],[139.7,135.7],[139.7,134.5],[168.3,164.3],[168.3,163.1],[168.3,162.3],[219.1,215.1],[219.1,213.9],[219.1,213.1],[273,267.8],[273,267],[323.9,317.9],[355.6,349.6]],
  "Mapress syrefast": [[12,10],[15,13],[18,16],[22,19.6],[28,25.6],[35,32],[42,39],[54,51],[76.1,72.1]],
  "Blåmalt mellomserie gjenget rør": [[17.2,12.5],[21.3,16],[26.9,21.6],[33.7,27.2],[42.4,35.9],[48.3,41.8],[60.3,53],[76.1,68.8],[88.9,80.8],[114.3,105.3]],
  "Aquatherm Greenpipe": [[20,14.4],[25,18],[32,24.8],[40,31],[50,38.8],[63,48.8],[75,58.2],[90,69.8],[110,85.4],[125,97]],
  "Aquatherm Bluepipe": [[20,14.4],[25,18],[32,24.8],[40,32.6],[50,40.8],[63,51.4],[75,61.4],[90,73.6],[110,90],[125,102.2],[160,130.8],[200,163.6]],
  "JRG Sanipex MT": [[16,11.5],[20,15],[26,20],[32,26],[40,33],[50,42],[63,54]],
};

// Brukes i "Automatisk rørforslag" (Forbruksvann) og rørvalget i Ventetid -
// alt under "Vannfordeling" og "PE-X systemer" i originalarket, pluss Mapress syrefast.
const COMMON_SYSTEMS = ["PE-Rør SDR11", "Kobber", "Sanipex", "LK PE-X", "Roth Multipex", "Mapress syrefast",
                        "Aquatherm Greenpipe", "JRG Sanipex MT"];
// Varme/Kjøl-fanen: alt under "Stålrør", pluss FlowFit, LK PAL, Mepla, Kobber og Roth Multipex.
const HEAT_SYSTEMS = ["Mapress Galv", "Rillet stålrør", "Syrefaste stålrør", "Mapress syrefast",
                      "Blåmalt mellomserie gjenget rør", "FlowFit", "LK PAL", "Mepla", "Kobber", "Roth Multipex",
                      "Aquatherm Greenpipe", "Aquatherm Bluepipe", "JRG Sanipex MT"];
// Grovhetskoeffisient pr. rørsystem [mm] - brukes i Darcy-Weisbach/Swamee-Jain
// for trykkfallsberegningen i Varme/Kjøl-fanen. Stål/støpejern ruere enn
// kobber/plastbaserte komposittsystemer (PEX/PE-X/PAL), som regnes hydraulisk glatte.
const PIPE_ROUGHNESS = {
  "PE-Rør SDR11": 0.007,
  "Kobber": 0.0015,
  "Sanipex": 0.007,
  "LK PE-X": 0.007,
  "Roth Multipex": 0.007,
  "FlowFit": 0.007,
  "LK PAL": 0.007,
  "Mepla": 0.007,
  "Mapress syrefast": 0.03,
  "Mapress Galv": 0.15,
  "Rillet stålrør": 0.15,
  "Syrefaste stålrør": 0.03,
  "Blåmalt mellomserie gjenget rør": 0.15,
  "Aquatherm Greenpipe": 0.007,
  "Aquatherm Bluepipe": 0.007,
  "JRG Sanipex MT": 0.007,
};

/* ============================================================
   Væskedata for "Fra effekt" - vann, etylenglykol, propylenglykol
   Kilde: Engineering ToolBox (densitet/cp-tabeller) og Mokon
   produktdatablad (temperaturtrend for propylenglykol cp),
   kalibrert mot Engineering ToolBox' referanseverdier.
   Densitet: vektfraksjon 0-0,6 x temp 0-100°C (kg/m³)
   cp: vekt% 0-50 x temp 0-100°C (Btu/lb·°F, konverteres til J/kg·K)
   ============================================================ */
const BTU_TO_J = 4186.8;
const GLYCOL = {
  "Etylenglykol": {
    densX: [0,0.1,0.2,0.3,0.4,0.5,0.6], densT: [0,20,40,60,80,100],
    dens: [[1000,998,992,983,972,958],[1018,1014,1008,1000,992,984],[1036,1030,1022,1014,1005,995],
           [1054,1046,1037,1027,1017,1007],[1072,1063,1052,1041,1030,1018],[1090,1079,1067,1055,1042,1030],
           [1107,1095,1082,1068,1055,1042]],
    cpX: [0,10,20,30,40,50], cpT: [0,10,20,30,40,50,60,70,80,90,100],
    cp: [[1.0038,1.0018,1.0004,0.99943,0.99902,0.99913,0.99978,1.0009,1.0026,1.0049,1.0076],
         [0.97236,0.97422,0.97619,0.97827,0.98047,0.98279,0.98521,0.98776,0.99041,0.99318,0.99607],
         [0.93576,0.93976,0.94375,0.94775,0.95175,0.95574,0.95974,0.96373,0.96773,0.97173,0.97572],
         [0.89889,0.90405,0.9092,0.91436,0.91951,0.92467,0.92982,0.93498,0.94013,0.94529,0.95044],
         [0.85858,0.86484,0.87111,0.87737,0.88364,0.8899,0.89616,0.90243,0.90869,0.91496,0.92122],
         [0.81485,0.82217,0.82949,0.83682,0.84414,0.85146,0.85878,0.8661,0.87343,0.88075,0.88807]],
  },
  "Propylenglykol": {
    densX: [0,0.1,0.2,0.3,0.4,0.5,0.6], densT: [0,20,40,60,80,100],
    dens: [[1000,998,993,983,972,958],[1012,1006,998,988,976,965],[1022,1014,1004,992,980,967],
           [1031,1022,1010,997,983,969],[1041,1030,1016,1002,987,971],[1051,1038,1023,1006,990,974],
           [1061,1046,1029,1011,994,976]],
    cpX: [0,10,20,30,40,50], cpT: [0,10,20,30,40,50,60,70,80,90,100],
    cp: [[1.0038,1.0018,1.0004,0.99943,0.99902,0.99913,0.99978,1.0009,1.0026,1.0049,1.0076],
         [0.97705,0.97916,0.98157,0.98407,0.98662,0.98943,0.9925,0.99581,0.9994,1.00315,1.00706],
         [0.9503,0.95652,0.96274,0.96872,0.97422,0.97973,0.98522,0.99071,0.9962,1.0014,1.00652],
         [0.9161,0.92341,0.93072,0.93779,0.94439,0.95099,0.95758,0.96415,0.97073,0.97745,0.98421],
         [0.8819,0.8903,0.89869,0.90686,0.91455,0.92225,0.92993,0.9376,0.94526,0.9535,0.9619],
         [0.83537,0.84475,0.85413,0.86352,0.87293,0.88234,0.89174,0.90111,0.91049,0.92016,0.92992]],
  },
};
const GLYCOL_CONCENTRATIONS = [5,10,15,20,25,30,35,40,45,50];

// Kinematisk viskositet [m²/s], rader = 0,10,20,30,40,50 vekt/volum%, kolonner = 0,20,40,60,80,100°C.
// Kilde: Engineering ToolBox (etylenglykol) og Mokon produktdatablad (propylenglykol),
// konvertert fra dynamisk til kinematisk viskositet med tetthetstabellene over.
const VISC_T = [0,20,40,60,80,100];
const VISC_X = [0,10,20,30,40,50];
const WATER_NU_ROW = [1.787e-6,1.004e-6,6.580e-7,4.750e-7,3.650e-7,2.940e-7];
const EG_NU = [
  [1.787e-6,1.004e-6,6.580e-7,4.750e-7,3.650e-7,2.940e-7],
  [2.221e-6,1.354e-6,8.379e-7,5.888e-7,4.492e-7,3.682e-7],
  [2.654e-6,1.704e-6,1.018e-6,7.025e-7,5.334e-7,4.424e-7],
  [3.321e-6,2.142e-6,1.235e-6,8.277e-7,6.095e-7,4.965e-7],
  [6.363e-6,2.804e-6,1.579e-6,1.009e-6,6.989e-7,5.894e-7],
  [8.782e-6,3.625e-6,1.894e-6,1.161e-6,8.155e-7,6.796e-7],
];
const PG_NU = [
  [1.787e-6,1.004e-6,6.580e-7,4.750e-7,3.650e-7,2.940e-7],
  [2.913e-6,1.622e-6,9.666e-7,6.465e-7,4.717e-7,3.732e-7],
  [4.039e-6,2.240e-6,1.275e-6,8.181e-7,5.785e-7,4.525e-7],
  [7.033e-6,3.562e-6,1.797e-6,1.058e-6,7.296e-7,5.696e-7],
  [1.222e-5,5.652e-6,2.505e-6,1.364e-6,9.040e-7,6.870e-7],
  [1.815e-5,8.255e-6,3.528e-6,1.842e-6,1.159e-6,8.422e-7],
];

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

// Enkel bilineær interpolasjon i et rektangulært grid. xs/ys må være sortert stigende.
function bilinear(xs, ys, grid, x, y) {
  x = clamp(x, xs[0], xs[xs.length - 1]);
  y = clamp(y, ys[0], ys[ys.length - 1]);
  let i = 0; while (i < xs.length - 2 && xs[i + 1] < x) i++;
  let j = 0; while (j < ys.length - 2 && ys[j + 1] < y) j++;
  const x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1];
  const fx = x1 > x0 ? (x - x0) / (x1 - x0) : 0;
  const fy = y1 > y0 ? (y - y0) / (y1 - y0) : 0;
  const v00 = grid[i][j], v10 = grid[i + 1][j], v01 = grid[i][j + 1], v11 = grid[i + 1][j + 1];
  const v0 = v00 + (v10 - v00) * fx;
  const v1 = v01 + (v11 - v01) * fx;
  return v0 + (v1 - v0) * fy;
}

function fluidProps(fluidName, concentrationPct, tempC) {
  if (fluidName === "Vann") {
    const w = GLYCOL["Etylenglykol"];
    return {
      rho: bilinear(w.densX, w.densT, w.dens, 0, tempC),
      cp: bilinear(w.cpX, w.cpT, w.cp, 0, tempC) * BTU_TO_J,
      nu: bilinear(VISC_X, VISC_T, EG_NU, 0, tempC),
    };
  }
  const g = GLYCOL[fluidName];
  const nuTable = fluidName === "Etylenglykol" ? EG_NU : PG_NU;
  const x = (concentrationPct || 0) / 100;
  return {
    rho: bilinear(g.densX, g.densT, g.dens, x, tempC),
    cp: bilinear(g.cpX, g.cpT, g.cp, concentrationPct || 0, tempC) * BTU_TO_J,
    nu: bilinear(VISC_X, VISC_T, nuTable, concentrationPct || 0, tempC),
  };
}

/* ============================================================
   Darcy-Weisbach / Swamee-Jain - trykkfallsbasert rørvalg for
   Varme/Kjøl-fanen. Velger minste dimensjon i valgt system der
   trykkfallet ikke overstiger 120 Pa/m (varsel/gul 100-120 Pa/m).
   ============================================================ */
function evaluatePipe(Q_ls, dia_mm, rho, nu, e_mm) {
  if (!(dia_mm > 0) || !(nu > 0) || !(rho > 0)) return null;
  const v = (4000 * Q_ls) / (Math.PI * dia_mm * dia_mm);
  const Re = (v * (dia_mm / 1000)) / nu;
  if (!(Re > 0)) return null;
  const f = Re < 2300
    ? 64 / Re
    : 0.25 / Math.pow(Math.log10(e_mm / (3.7 * dia_mm) + 5.74 / Math.pow(Re, 0.9)), 2);
  const dpdl = (f * rho * v * v) / (2 * (dia_mm / 1000)); // Pa/m
  return { v, Re, f, dpdl };
}

const MAX_DPL = 120;   // Pa/m - øvre grense, dimensjonen forkastes over denne
const WARN_DPL = 100;  // Pa/m - gul varsel fra denne og opp til grensen

function suggestPipeByPressureDrop(system, Q_ls, rho, nu) {
  const list = PIPE_SYSTEMS[system];
  const e = PIPE_ROUGHNESS[system];
  if (!list) return null;
  for (const [outer, inner] of list) {
    const r = evaluatePipe(Q_ls, inner, rho, nu, e);
    if (r && r.dpdl <= MAX_DPL) {
      return { outer, inner, ...r };
    }
  }
  return null; // ingen dimensjon i tabellen holder seg under grensen
}

const $ = (id) => document.getElementById(id);
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "-");

/* ============================================================
   Persistens (localStorage) - husker siste verdier på enheten
   ============================================================ */
const STORE_KEY = "rorkalk_v1";
function saveState() {
  const ids = ["fv_qnKV","fv_qnVV","fv_maxKV","fv_maxVV","fv_hoses","fv_v","fv_system",
               "d_q","d_v","v_q","v_d","q_v","q_d","vt_di","vt_qn","vt_l","vt_system","vt_dim",
               "fe_effekt","fe_tur","fe_retur","fe_fluid","fe_conc","fe_system","fe_override",
               "me_tur","me_retur","me_fluid","me_conc","me_system","me_dim",
               "av_qn","av_max","av_kurve","av_system","av_fall_ratio","av_wc",
               "aq_vhs","aq_taz","aq_pa","aq_psv",
               "ev_q","ev_radtype","ev_tstr","ev_taz","ev_fluid","ev_conc","ev_hst","ev_psv","ev_pz","ev_vhs","ev_vgsolar",
               "ek_vs","ek_stagnt","ek_fluid","ek_conc","ek_hst","ek_psv","ek_pz","ek_vhs","ek_vgsolar"];
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

// Gruppering for Dimensjoner-fanen, iht. oppsettet i det opprinnelige regnearket
const SYSTEM_GROUPS = {
  "Vannfordeling": ["PE-R\u00f8r SDR11", "FlowFit", "Kobber", "Mepla", "LK PAL"],
  "PE-X systemer": ["LK PE-X", "Roth Multipex"],
  "Avl\u00f8p og overvann": ["PP-Grunnavl\u00f8p", "PP avl\u00f8p", "MA", "Pragma Overvann",
                           "PVC-Grunnavl\u00f8p og Overvann", "Geberit Silent", "Pragma Infra Overvann"],
  "St\u00e5lr\u00f8r": ["Mapress Galv", "Rillet st\u00e5lr\u00f8r", "Syrefaste st\u00e5lr\u00f8r",
             "Mapress syrefast", "Bl\u00e5malt mellomserie gjenget r\u00f8r"],
  "Aquatherm / JRG": ["Sanipex", "Aquatherm Greenpipe", "Aquatherm Bluepipe", "JRG Sanipex MT"],
};

/* ============================================================
   IMI Pneumatex - Beregning og kalkulasjon (ed.7b 05.2026)
   Ekspansjonskar-dimensjonering. Formler og tabeller gjengitt
   fra IMI Pneumatex sitt eget beregningsunderlag.
   ============================================================ */

// Tabell 1 (s.4): e ekspansjonskoeffisient
const IMI_T1_COLS = [20,30,40,50,60,70,80,90,100,105,110];
const IMI_TABLE1 = {
  "Vann":   [0.0016,0.0041,0.0077,0.0119,0.0169,0.0226,0.0288,0.0357,0.0433,0.0472,0.0513],
  "MEG_30": [0.0093,0.0129,0.0169,0.0224,0.0286,0.0352,0.0422,0.0497,0.0577,0.0620,0.0663],
  "MEG_40": [0.0144,0.0189,0.0240,0.0300,0.0363,0.0432,0.0505,0.0582,0.0663,0.0706,0.0750],
  "MEG_50": [0.0198,0.0251,0.0307,0.0370,0.0437,0.0507,0.0581,0.0660,0.0742,0.0786,0.0830],
  "MPG_30": [0.0151,0.0207,0.0267,0.0333,0.0401,0.0476,0.0554,0.0639,0.0727,0.0774,0.0823],
  "MPG_40": [0.0211,0.0272,0.0338,0.0408,0.0481,0.0561,0.0644,0.0731,0.0826,0.0873,0.0924],
  "MPG_50": [0.0288,0.0355,0.0425,0.0500,0.0577,0.0660,0.0747,0.0839,0.0935,0.0985,0.1036],
};
// Tabell 2 (s.5): pv overtrykk mot fordampning (bar), kun TAZ>100°C
const IMI_T2_COLS = [100,105,110]; // 100 -> pv=0 (implisitt, jf. "damptrykk for TAZ>100°C")
const IMI_TABLE2 = {
  "Vann":   [0,0.1948,0.4196],
  "MEG_30": [0,0.1793,0.3864],
  "MEG_40": [0,0.1671,0.3601],
  "MEG_50": [0,0.1523,0.3284],
  "MPG_30": [0,0.1938,0.4176],
  "MPG_40": [0,0.1938,0.4175],
  "MPG_50": [0,0.1938,0.4174],
};
// Tabell 4 (s.5): vs (liter/kW) for varmeanlegg
const IMI_T4_COLS = ["90|70","80|60","70|55","70|50","60|40","50|40","40|30","35|28"];
const IMI_T4_TSMAX = [90,80,70,70,60,50,40,35];
const IMI_TABLE4 = {
  "Eldre radiatorer":     [14.0,16.5,20.1,20.6,27.9,36.6,null,null],
  "Nye radiatorer":       [9.0,10.1,12.1,11.9,15.1,20.1,null,null],
  "Konvektorer":          [6.5,7.0,8.4,7.9,9.6,13.4,null,null],
  "Ventilasjonssystemer": [5.8,6.1,7.2,6.6,7.6,10.8,null,null],
  "Gulvvarme":            [10.3,11.4,13.3,13.1,15.8,20.3,29.1,37.8],
};

const AQUAPRESSO_SIZES = [8,12,18,25,35,50,80,140,200,300,400,500,600,800,1000,1500,2000,3000];
const STATICO_SIZES = [8,18,25,35,50,80,140,200,300,400,500,600,800,1000,1500,2000,3000,4000,5000];

function imiInterp(cols, arr, x) {
  if (x <= cols[0]) return arr[0];
  if (x >= cols[cols.length - 1]) return arr[arr.length - 1];
  let i = 0;
  while (i < cols.length - 2 && cols[i + 1] < x) i++;
  const x0 = cols[i], x1 = cols[i + 1], y0 = arr[i], y1 = arr[i + 1];
  const f = (x - x0) / (x1 - x0);
  return y0 + (y1 - y0) * f;
}
function imiFluidKey(fluid, conc) {
  if (fluid === "Vann") return "Vann";
  const prefix = fluid === "Etylenglykol (MEG)" ? "MEG" : "MPG";
  return prefix + "_" + conc;
}
function imiLookupE(fluidKey, t) { return imiInterp(IMI_T1_COLS, IMI_TABLE1[fluidKey], t); }
function imiLookupPv(fluidKey, t) { return imiInterp(IMI_T2_COLS, IMI_TABLE2[fluidKey], t); }
function roundUpSize(sizes, v) {
  for (const s of sizes) if (s >= v) return s;
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

  // "Rørdimensjon fra effekt" (Varme/Kjøl): egen, litt bredere systemliste
  const feSel = $("fe_system");
  feSel.innerHTML = "";
  HEAT_SYSTEMS.forEach(n => {
    const o = document.createElement("option");
    o.value = n; o.textContent = n;
    feSel.appendChild(o);
  });

  // Blandingsforhold 5-50%, i 5%-trinn
  const concSel = $("fe_conc");
  concSel.innerHTML = "";
  GLYCOL_CONCENTRATIONS.forEach(p => {
    const o = document.createElement("option");
    o.value = p; o.textContent = p + " %";
    concSel.appendChild(o);
  });
  concSel.value = 30;

  // Dimensjoner-fanen: hele referansetabellen, gruppert som i regnearket
  const dimSel = $("dim_system");
  dimSel.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "__ALL__";
  optAll.textContent = "Alle systemer";
  dimSel.appendChild(optAll);
  Object.entries(SYSTEM_GROUPS).forEach(([groupName, names]) => {
    const grp = document.createElement("optgroup");
    grp.label = groupName;
    names.forEach(n => {
      if (!PIPE_SYSTEMS[n]) return;
      const o = document.createElement("option");
      o.value = n; o.textContent = n;
      grp.appendChild(o);
    });
    dimSel.appendChild(grp);
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
   Utstyrsliste - Standard abonnementsvilkår for vann og avløp,
   Tekniske bestemmelser (KS/Kommuneforlaget 2008), tabell 1
   (vedlegg s. 37): "Normalvannmengder for tappesteder".
   ============================================================ */
const EQUIPMENT_LIST = [
  { name: "Drikkefontene", kv: 0.05, vv: null },
  { name: "Klosettsisterne", kv: 0.1, vv: null },
  { name: "Servantbatteri", kv: 0.1, vv: 0.1 },
  { name: "Bid\u00e9batteri", kv: 0.1, vv: 0.1 },
  { name: "Tappeventil/slangekran (innend\u00f8rs)", kv: 0.2, vv: 0.2 },
  { name: "Oppvaskbatteri", kv: 0.2, vv: 0.2 },
  { name: "Batteri til utslagsvask/skyllekar/vaskekar", kv: 0.2, vv: 0.2 },
  { name: "Dusjbatteri", kv: 0.2, vv: 0.2 },
  { name: "Vaskemaskin (husholdning)", kv: 0.2, vv: 0.2 },
  { name: "Oppvaskmaskin (husholdning)", kv: 0.2, vv: null },
  { name: "Badebatteri", kv: 0.3, vv: 0.3 },
  { name: "Hagekran/g\u00e5rdskran", kv: 0.4, vv: null },
  { name: "Spyleventil for urinaler", kv: 0.4, vv: null },
  { name: "Spyleventil for WC", kv: 1.3, vv: null },
];
const EQ_STORE_KEY = "rorkalk_eq_v1";

/* ============================================================
   Avløp - Standard abonnementsvilkår, tabell 13 (normalvannmengde
   fra utstyr med selvstendig vannlås) og figur 7 (samtidighet).
   Digitalisert fra bilder av originaltabellen/-grafen levert av
   bruker. Figur 7 er logg-logg-kurver, digitalisert som ankerpunkt
   og interpolert i logg-logg-rom (kryssjekket mot kjent fasit:
   13 l/s sum -> ca. 2,4 l/s på Kurve A).
   ============================================================ */
const EQUIPMENT_LIST_AVLOP = [
  { name: "Drikkefontene", q: 0.1 },
  { name: "Bid\u00e9", q: 0.3 },
  { name: "Urinal (pr. stand) og veggurinal", q: 0.3 },
  { name: "Servant med 1 1/4\" bunnventil", q: 0.4 },
  { name: "Vaskerenne", q: 0.4 },
  { name: "Oppvask (enkel/dobbel) og planvask", q: 0.6 },
  { name: "Vaskemaskin i bolig", q: 0.6 },
  { name: "Oppvaskmaskin i bolig", q: 0.6 },
  { name: "Vaskekar", q: 0.6 },
  { name: "Badekar", q: 0.9 },
  { name: "Utslagsvask, laboratorievask", q: 0.9 },
  { name: "Kombinert opp- og utslagsvask", q: 0.9 },
  { name: "Gulvsluk, 75 mm st\u00f8pejern", q: 1.2 },
  { name: "Vaskemaskin i fellesvaskeri for boliger", q: 1.2 },
  { name: "Oppvaskmaskin i erverv, liten st\u00f8rrelse", q: 1.2 },
  { name: "Gulvsluk, 75 mm plast", q: 1.5 },
  { name: "WC", q: 1.8 },
  { name: "Gulvsluk, 110 mm", q: 2.0 },
];
const AV_EQ_STORE_KEY = "rorkalk_av_eq_v1";

const SAMTIDIGHET_KURVE_A = [[5,1.75],[10,2.12],[20,2.56],[50,3.3],[100,4.57],[200,6.33],[500,9.75],[1000,13.5]];
const SAMTIDIGHET_KURVE_B = [[5,2.4],[10,2.86],[20,3.41],[50,4.3],[100,6.07],[200,8.56],[500,13.46],[1000,19]];

// Tabell 14 - tillatt belastning av stående ventilerte spillvannsledninger.
// 115 mm gjelder kun plast, 125 mm kun støpejern - alle 5 tillatte
// avløpssystemer under er plastbaserte, så 115 mm-tрinnet brukes her.
const STANDING_TABLE_14 = [
  [45, 1.4, 0.7],
  [65, 8, 4],
  [80, 26, 13],
  [100, 90, 45],
  [115, 230, 115],
];

// Rørsystemer tillatt for avløpsforslag (ekskl. begge Pragma-variantene)
const AVLOP_SYSTEMS = ["PP-Grunnavl\u00f8p", "PP avl\u00f8p", "PVC-Grunnavl\u00f8p og Overvann", "MA", "Geberit Silent"];

// Liggende ventilerte spillvannsledninger (figur 8/støpejern-betong, figur 9/plast) -
// disse diagrammene er nomogrammer basert på gravitasjonsstrømning i rør (Manning-type
// formel: Q = (1/n)·A·R^(2/3)·I^(1/2)). Siden alle tillatte avløpssystemer over er plast,
// bruker vi standard Manning-tall for glatte plastrør (n≈0,010). Dette er en fysikkbasert
// tilnærming til figur 9, ikke en pikselnøyaktig avlesning av selve diagrammet.
const MANNING_N_PLAST = 0.010;

function manningFullFlow(diaInnerMm, fallPermille, n) {
  const D = diaInnerMm / 1000;
  const I = fallPermille / 1000;
  const Q = (0.3117 / n) * Math.pow(D, 8 / 3) * Math.sqrt(I);
  return Q * 1000; // l/s
}

function suggestStandingPipe(flow, buildingType) {
  const col = buildingType === "B" ? 2 : 1;
  for (const row of STANDING_TABLE_14) {
    if (flow <= row[col]) return row[0]; // innv. diameter [mm]
  }
  return null;
}

function suggestAvlopPipe(system, requiredInnerMm, minOuterMm) {
  const list = PIPE_SYSTEMS[system];
  if (!list) return null;
  const minOuter = minOuterMm || 0;
  for (const [outer, inner] of list) {
    if (inner >= requiredInnerMm && outer >= minOuter) return { outer, inner };
  }
  return null;
}

function suggestLiggendePipe(system, flow, fallPermille, minOuterMm, minInnerMm) {
  const list = PIPE_SYSTEMS[system];
  if (!list) return null;
  const minOuter = minOuterMm || 0;
  const minInner = minInnerMm || 0;
  for (const [outer, inner] of list) {
    if (outer < minOuter || inner < minInner) continue;
    const cap = manningFullFlow(inner, fallPermille, MANNING_N_PLAST);
    if (cap >= flow) return { outer, inner, cap };
  }
  return null;
}

function totalAvEquipmentCount() {
  const counts = avEqCounts();
  let total = 0;
  Object.values(counts).forEach(n => { total += (n || 0); });
  return total;
}

function loglogInterp(points, x) {
  const first = points[0][0];
  if (x <= first) {
    // Under grafens dokumenterte område (< 5 l/s sum) er det ingen reell
    // samtidighetsreduksjon å hente ut av kurven ennå - bruk summen direkte
    // i stedet for å klemme opp til kurvens laveste ankerpunkt.
    return x;
  }
  const last = points[points.length - 1][0];
  if (x > last) x = last;
  const lx = points.map(p => Math.log(p[0]));
  const ly = points.map(p => Math.log(p[1]));
  let i = 0;
  const lxq = Math.log(x);
  while (i < lx.length - 2 && lx[i + 1] < lxq) i++;
  const x0 = lx[i], x1 = lx[i + 1], y0 = ly[i], y1 = ly[i + 1];
  const f = x1 > x0 ? (lxq - x0) / (x1 - x0) : 0;
  return Math.exp(y0 + (y1 - y0) * f);
}


function eqCounts() {
  try { return JSON.parse(localStorage.getItem(EQ_STORE_KEY)) || {}; } catch (e) { return {}; }
}
function saveEqCounts(counts) {
  try { localStorage.setItem(EQ_STORE_KEY, JSON.stringify(counts)); } catch (e) {}
}

function renderEquipmentList() {
  const wrap = $("eqList");
  wrap.innerHTML = "";
  const counts = eqCounts();
  EQUIPMENT_LIST.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "eq-row";
    row.dataset.idx = i;
    const count = counts[i] || 0;
    if (count > 0) row.classList.add("eq-active");
    const valsTxt = "KV " + item.kv.toFixed(2) + (item.vv != null ? " \u00b7 VV " + item.vv.toFixed(2) : "") + " l/s";
    row.innerHTML =
      `<div class="eq-name">${item.name}<span class="eq-vals">${valsTxt}</span></div>` +
      `<div class="eq-stepper">` +
      `<button type="button" class="eq-minus" aria-label="F\u00e6rre">\u2212</button>` +
      `<span class="eq-count">${count}</span>` +
      `<button type="button" class="eq-plus" aria-label="Flere">+</button>` +
      `</div>`;
    wrap.appendChild(row);
  });

  wrap.querySelectorAll(".eq-minus").forEach(btn => {
    btn.addEventListener("click", () => stepEquipment(btn.closest(".eq-row").dataset.idx, -1));
  });
  wrap.querySelectorAll(".eq-plus").forEach(btn => {
    btn.addEventListener("click", () => stepEquipment(btn.closest(".eq-row").dataset.idx, 1));
  });
}

function stepEquipment(idx, delta) {
  const counts = eqCounts();
  const cur = counts[idx] || 0;
  counts[idx] = Math.max(0, cur + delta);
  saveEqCounts(counts);
  renderEquipmentList();
  recalcEquipment();
}

function recalcEquipment() {
  const counts = eqCounts();
  let sumKV = 0, sumVV = 0, maxKV = 0, maxVV = 0;
  EQUIPMENT_LIST.forEach((item, i) => {
    const n = counts[i] || 0;
    if (n <= 0) return;
    sumKV += n * item.kv;
    if (item.kv > maxKV) maxKV = item.kv;
    if (item.vv != null) {
      sumVV += n * item.vv;
      if (item.vv > maxVV) maxVV = item.vv;
    }
  });
  $("eq_sums").innerHTML = `&Sigma;qn KV = ${sumKV.toFixed(2)} l/s &middot; &Sigma;qn VV = ${sumVV.toFixed(2)} l/s`;
  $("eq_max").innerHTML = `KV = ${maxKV.toFixed(2)} l/s &middot; VV = ${maxVV.toFixed(2)} l/s`;

  const enabled = $("eq_enabled").checked;
  ["fv_qnKV", "fv_maxKV", "fv_qnVV", "fv_maxVV"].forEach(id => {
    $(id).readOnly = enabled;
    $(id).classList.toggle("locked", enabled);
  });
  if (enabled) {
    $("fv_qnKV").value = sumKV.toFixed(2);
    $("fv_maxKV").value = maxKV.toFixed(2);
    $("fv_qnVV").value = sumVV.toFixed(2);
    $("fv_maxVV").value = maxVV.toFixed(2);
    recalcForbruksvann();
  }
  try { localStorage.setItem("rorkalk_eq_enabled", enabled ? "1" : "0"); } catch (e) {}
}


/* ============================================================
   Avløp: utstyrsliste og samtidighet
   ============================================================ */
function avEqCounts() {
  try { return JSON.parse(localStorage.getItem(AV_EQ_STORE_KEY)) || {}; } catch (e) { return {}; }
}
function saveAvEqCounts(counts) {
  try { localStorage.setItem(AV_EQ_STORE_KEY, JSON.stringify(counts)); } catch (e) {}
}

function renderAvEquipmentList() {
  const wrap = $("avEqList");
  wrap.innerHTML = "";
  const counts = avEqCounts();
  EQUIPMENT_LIST_AVLOP.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "eq-row";
    row.dataset.idx = i;
    const count = counts[i] || 0;
    if (count > 0) row.classList.add("eq-active");
    row.innerHTML =
      `<div class="eq-name">${item.name}<span class="eq-vals">${item.q.toFixed(2)} l/s</span></div>` +
      `<div class="eq-stepper">` +
      `<button type="button" class="eq-minus" aria-label="F\u00e6rre">\u2212</button>` +
      `<span class="eq-count">${count}</span>` +
      `<button type="button" class="eq-plus" aria-label="Flere">+</button>` +
      `</div>`;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll(".eq-minus").forEach(btn => {
    btn.addEventListener("click", () => stepAvEquipment(btn.closest(".eq-row").dataset.idx, -1));
  });
  wrap.querySelectorAll(".eq-plus").forEach(btn => {
    btn.addEventListener("click", () => stepAvEquipment(btn.closest(".eq-row").dataset.idx, 1));
  });
}

function stepAvEquipment(idx, delta) {
  const counts = avEqCounts();
  const cur = counts[idx] || 0;
  counts[idx] = Math.max(0, cur + delta);
  saveAvEqCounts(counts);
  renderAvEquipmentList();
  recalcAvEquipment();
  recalcAvlop(); // antall utstyr påvirker bunnledningsregelen uansett bryterstilling
}

function recalcAvEquipment() {
  const counts = avEqCounts();
  let sum = 0, max = 0;
  EQUIPMENT_LIST_AVLOP.forEach((item, i) => {
    const n = counts[i] || 0;
    if (n <= 0) return;
    sum += n * item.q;
    if (item.q > max) max = item.q;
  });
  $("av_eq_sum").innerHTML = `&Sigma;qn = ${sum.toFixed(2)} l/s`;
  $("av_eq_max").innerHTML = `${max.toFixed(2)} l/s`;

  const enabled = $("av_eq_enabled").checked;
  ["av_qn", "av_max"].forEach(id => {
    $(id).readOnly = enabled;
    $(id).classList.toggle("locked", enabled);
  });
  if (enabled) {
    $("av_qn").value = sum.toFixed(2);
    $("av_max").value = max.toFixed(2);
    recalcAvlop();
  }
  try { localStorage.setItem("rorkalk_av_eq_enabled", enabled ? "1" : "0"); } catch (e) {}
}

function recalcAvlop() {
  const qn = parseFloat($("av_qn").value) || 0;
  const max = parseFloat($("av_max").value) || 0;
  const kurve = $("av_kurve").value === "B" ? SAMTIDIGHET_KURVE_B : SAMTIDIGHET_KURVE_A;
  let result = qn > 0 ? loglogInterp(kurve, qn) : 0;
  result = Math.max(result, max);
  $("av_result").innerHTML = fmt(result, 2) + ' <span class="unit-sm">l/s</span>';

  const buildingType = $("av_kurve").value;
  const system = $("av_system").value;
  const wcCount = parseFloat($("av_wc").value) || 0;
  const isBunnledning = $("av_bunnledning").checked;
  const totalEquipCount = totalAvEquipmentCount() + wcCount;

  // Regelbaserte minstekrav (utvendig DN) som gjelder uansett beregnet mengde
  let minOuterDN = 0;
  let ruleNotes = [];
  if (wcCount > 0) {
    minOuterDN = Math.max(minOuterDN, 90);
    ruleNotes.push("WC: min. 90 mm (helst 110 mm)");
  }
  if (isBunnledning) {
    const bunnMin = totalEquipCount <= 1 ? 75 : 110;
    minOuterDN = Math.max(minOuterDN, bunnMin);
    ruleNotes.push(`Bunnledning (${totalEquipCount || 1} utstyr): min. ${bunnMin} mm`);
  }

  // Stående ventilert spillvannsledning (tabell 14 - eksakt oppslag)
  const standingInnerReq = suggestStandingPipe(result, buildingType) || 0;
  const standingPipe = suggestAvlopPipe(system, standingInnerReq, minOuterDN);
  if (standingPipe) {
    $("av_standing").textContent = `${standingPipe.outer} mm (innv. ${standingPipe.inner} mm)`;
  } else if (standingInnerReq) {
    $("av_standing").textContent = `min. innv. ${standingInnerReq} mm \u2192 utenfor tabell for valgt system`;
  } else {
    $("av_standing").textContent = "over tabellens \u00f8vre grense (400 l/s type A / 200 l/s type B)";
  }

  // Liggende ventilert spillvannsledning (Manning-basert tilnærming til figur 8/9)
  const fallRatio = parseFloat($("av_fall_ratio").value) || 60;
  const fall = fallRatio > 0 ? 1000 / fallRatio : 0; // 1:X -> promille
  if (fall > 0) {
    const pipe = suggestLiggendePipe(system, result, fall, minOuterDN, standingInnerReq);
    $("av_liggende").innerHTML = pipe
      ? `${pipe.outer} mm (innv. ${pipe.inner} mm) &middot; kapasitet ${fmt(pipe.cap,1)} l/s ved 1:${fmt(fallRatio,0)}`
      : "ingen dimensjon i valgt system holder ved dette fallet/kravet";
  } else {
    $("av_liggende").textContent = "-";
  }

  $("av_rules_active").textContent = ruleNotes.length ? ruleNotes.join(" \u00b7 ") : "";
  $("av_rules_active").style.display = ruleNotes.length ? "block" : "none";

  saveState();
}

/* ============================================================
   Aquapresso - ekspansjon for varmt forbruksvann (IMI s.30-32)
   ============================================================ */
function recalcAquapresso() {
  const Vhs = parseFloat($("aq_vhs").value) || 0;
  const TAZ = parseFloat($("aq_taz").value) || 60;
  const pa = parseFloat($("aq_pa").value) || 0;
  const psv = parseFloat($("aq_psv").value) || 0;

  const e = imiLookupE("Vann", TAZ);
  const p0 = pa - 0.3;
  $("aq_p0").textContent = fmt(p0, 2) + " bar";
  $("aq_e").textContent = e.toFixed(4);

  let VN = NaN;
  const denom = (p0 + 1) * (psv - p0 - 0.8);
  if (denom > 0 && psv > 0) {
    VN = Vhs * e * (psv + 0.5) * (p0 + 1.3) / denom;
  }

  if (!Number.isFinite(VN) || VN <= 0) {
    $("aq_vn").textContent = "-";
    $("aq_size").textContent = "Sjekk at psv er stort nok i forhold til p0 (psv > p0 + 0,8 bar kreves).";
    saveState();
    return;
  }
  $("aq_vn").innerHTML = fmt(VN, 1) + ' <span class="unit-sm">liter (n\u00f8dvendig)</span>';
  const size = roundUpSize(AQUAPRESSO_SIZES, VN);
  $("aq_size").innerHTML = size
    ? `Nærmeste standardstørrelse: <b>${size} liter</b>`
    : "Over standard st\u00f8rrelsessortiment (opptil 3000 l) - kontakt leverand\u00f8r";
  saveState();
}

/* ============================================================
   Statico - ekspansjonskar for varme-/kj\u00f8leanlegg, EN 12828
   (IMI Pneumatex s.3-11). Statico-spesifikke formler for pe/PF/VN.
   ============================================================ */
function staticoCalc(inputs) {
  const { Vs, Vhs, fluidKey, tForE, Hst, psv, pz, Vgsolar, vento, mode } = inputs;
  const e = imiLookupE(fluidKey, tForE);
  const pv = tForE > 100 ? imiLookupPv(fluidKey, tForE) : 0;
  const p0 = Math.max(Hst / 10 + pv + 0.2, (pz || 0));
  const pa = p0 + 0.3;
  let dpsvc;
  if (mode === "kjol") {
    dpsvc = psv <= 3 ? 0.6 : 0.2 * psv;
  } else {
    dpsvc = psv <= 5 ? 0.5 : 0.1 * psv;
  }
  const pe = psv - dpsvc;
  const PF = (pe + 1) / (pe - p0);
  const Vwr = Math.max(0.005 * Vs, 3);
  const Ve = e * (Vs + (Vhs || 0));
  const ventoAdd = vento ? 2 : 0;
  const VN = (Ve + Vwr + 1.1 * (Vgsolar || 0) + ventoAdd) * PF;
  return { e, pv, p0, pa, dpsvc, pe, PF, Vwr, Ve, VN };
}

function recalcEkspansjonVarme() {
  const Q = parseFloat($("ev_q").value) || 0;
  const radType = $("ev_radtype").value;
  const tsIdx = parseInt($("ev_tstr").value, 10);
  const vsPerKw = IMI_TABLE4[radType][tsIdx];
  const Vs = vsPerKw != null ? vsPerKw * Q : 0;
  $("ev_vs").innerHTML = vsPerKw != null
    ? `${fmt(Vs,1)} liter <span class="unit-sm">(${vsPerKw} l/kW &times; ${Q} kW)</span>`
    : "Kombinasjon ikke tabellf\u00f8rt - velg annet temperatursett";

  const TAZ = parseFloat($("ev_taz").value) || IMI_T4_TSMAX[tsIdx];
  const fluid = $("ev_fluid").value;
  const conc = $("ev_conc").value;
  const fluidKey = imiFluidKey(fluid, conc);
  const Hst = parseFloat($("ev_hst").value) || 0;
  const psv = parseFloat($("ev_psv").value) || 0;
  const pz = parseFloat($("ev_pz").value) || 0;
  const Vhs = parseFloat($("ev_vhs").value) || 0;
  const Vgsolar = parseFloat($("ev_vgsolar").value) || 0;
  const vento = $("ev_vento").checked;

  const r = staticoCalc({ Vs, Vhs, fluidKey, tForE: TAZ, Hst, psv, pz, Vgsolar, vento, mode: "varme" });
  renderStaticoResult("ev", r, Q > 0 && vsPerKw != null);
  saveState();
}

function recalcEkspansjonKjol() {
  const Vs = parseFloat($("ek_vs").value) || 0;
  const stagnT = parseFloat($("ek_stagnt").value) || 40;
  const fluid = $("ek_fluid").value;
  const conc = $("ek_conc").value;
  const fluidKey = imiFluidKey(fluid, conc);
  const Hst = parseFloat($("ek_hst").value) || 0;
  const psv = parseFloat($("ek_psv").value) || 0;
  const pz = parseFloat($("ek_pz").value) || 0;
  const Vhs = parseFloat($("ek_vhs").value) || 0;
  const Vgsolar = parseFloat($("ek_vgsolar").value) || 0;
  const vento = $("ek_vento").checked;

  const r = staticoCalc({ Vs, Vhs, fluidKey, tForE: stagnT, Hst, psv, pz, Vgsolar, vento, mode: "kjol" });
  renderStaticoResult("ek", r, Vs > 0);
  saveState();
}

function renderStaticoResult(prefix, r, valid) {
  $(`${prefix}_e`).textContent = r.e.toFixed(4);
  $(`${prefix}_p0`).textContent = fmt(r.p0, 2) + " bar";
  $(`${prefix}_pa`).textContent = fmt(r.pa, 2) + " bar";
  $(`${prefix}_pe`).textContent = fmt(r.pe, 2) + " bar";
  if (!valid || !Number.isFinite(r.VN) || r.pe <= r.p0) {
    $(`${prefix}_vn`).textContent = "-";
    $(`${prefix}_size`).textContent = r.pe <= r.p0
      ? "Ugyldig: sikkerhetsventilens \u00e5pningstrykk er for lavt i forhold til statisk h\u00f8yde/minstetrykk."
      : "-";
    return;
  }
  $(`${prefix}_vn`).innerHTML = fmt(r.VN, 1) + ' <span class="unit-sm">liter (n\u00f8dvendig)</span>';
  const size = roundUpSize(STATICO_SIZES, r.VN);
  $(`${prefix}_size`).innerHTML = size
    ? `Anbefalt Statico-st\u00f8rrelse: <b>${size} liter</b>`
    : "Over standard st\u00f8rrelsessortiment (opptil 5000 l) - kontakt leverand\u00f8r";
}



function updateFraEffektVisibility() {
  const fluid = $("fe_fluid").value;
  $("fe_conc_row").style.display = fluid === "Vann" ? "none" : "flex";
}

function recalcFraEffekt(resetOverride) {
  const effekt = parseFloat($("fe_effekt").value) || 0;
  const tur = parseFloat($("fe_tur").value);
  const retur = parseFloat($("fe_retur").value);
  const fluid = $("fe_fluid").value;
  const conc = parseFloat($("fe_conc").value) || 0;
  const system = $("fe_system").value;

  if (!Number.isFinite(tur) || !Number.isFinite(retur)) return;
  const dT = tur - retur;
  const avgT = (tur + retur) / 2;
  const props = fluidProps(fluid, conc, avgT);

  const fluidLabel = fluid === "Vann" ? "Vann" : `${fluid} ${conc}%`;
  $("fe_props").innerHTML =
    `&Delta;T=${fmt(dT,1)}\u00b0C &middot; ${fluidLabel} &middot; \u03c1=${fmt(props.rho,0)} kg/m\u00b3 &middot; ` +
    `cp=${fmt(props.cp,0)} J/kg\u00b7K &middot; \u03bd=${props.nu.toExponential(2)} m\u00b2/s`;

  let flow = NaN;
  if (dT > 0 && props.cp > 0 && props.rho > 0) {
    flow = (effekt * 1e6) / (props.cp * dT * props.rho);
  }
  $("fe_flow").innerHTML = Number.isFinite(flow) ? fmt(flow, 3) + ' <span class="unit-sm">l/s</span>' : "ugyldig \u0394T";

  const dimRow = $("fe_dim_row");
  dimRow.classList.remove("status-ok", "status-bad", "status-bad-yellow");
  let dpLabel = "-";
  let recommendedInner = null;
  if (Number.isFinite(flow)) {
    const sug = suggestPipeByPressureDrop(system, flow, props.rho, props.nu);
    if (sug) {
      $("fe_dim").textContent = `${sug.outer} mm  (innv. ${sug.inner} mm)`;
      if (sug.dpdl > WARN_DPL) dimRow.classList.add("status-bad-yellow");
      dpLabel = `v=${fmt(sug.v,2)} m/s &middot; Re=${fmt(sug.Re,0)} &middot; ` +
                `<b>${fmt(sug.dpdl,1)} Pa/m</b> (grense ${MAX_DPL} Pa/m)`;
      recommendedInner = sug.inner;
    } else {
      $("fe_dim").textContent = "ingen dimensjon \u2264 " + MAX_DPL + " Pa/m";
      dimRow.classList.add("status-bad");
      dpLabel = "st\u00f8rste tilgjengelige dimensjon overstiger fortsatt grensen";
    }
  } else {
    $("fe_dim").textContent = "-";
  }
  $("fe_dp").innerHTML = dpLabel;

  if (resetOverride) populateFeOverrideOptions(recommendedInner);
  recalcFraEffektOverride(flow, props, recommendedInner);
  saveState();
}

/* ---- Overstyr dimensjon manuelt (samme tab) ---- */
function populateFeOverrideOptions(preferInner) {
  const system = $("fe_system").value;
  const sel = $("fe_override");
  sel.innerHTML = "";
  const list = PIPE_SYSTEMS[system] || [];
  list.forEach(([outer, inner]) => {
    const o = document.createElement("option");
    o.value = inner;
    o.textContent = `${outer} mm  (innv. ${inner} mm)`;
    sel.appendChild(o);
  });
  if (Number.isFinite(preferInner)) {
    sel.value = preferInner;
  }
}

function recalcFraEffektOverride(flow, props, recommendedInner) {
  const system = $("fe_system").value;
  const row = $("fe_override_row");
  const warnBox = $("fe_override_warn");
  row.classList.remove("status-ok", "status-bad", "status-bad-yellow");
  warnBox.style.display = "none";

  if (!Number.isFinite(flow)) {
    $("fe_override_result").textContent = "-";
    return;
  }
  const chosenInner = parseFloat($("fe_override").value);
  if (!Number.isFinite(chosenInner)) { $("fe_override_result").textContent = "-"; return; }

  const e = PIPE_ROUGHNESS[system];
  const r = evaluatePipe(flow, chosenInner, props.rho, props.nu, e);
  if (!r) { $("fe_override_result").textContent = "-"; return; }

  $("fe_override_result").innerHTML =
    `v=${fmt(r.v,2)} m/s &middot; Re=${fmt(r.Re,0)} &middot; <b>${fmt(r.dpdl,1)} Pa/m</b>`;

  if (r.dpdl > MAX_DPL) {
    row.classList.add("status-bad");
    warnBox.style.display = "block";
    warnBox.className = "note warn status-text-bad";
    warnBox.textContent = `For liten dimensjon - trykkfallet (${fmt(r.dpdl,1)} Pa/m) overstiger grensen på ${MAX_DPL} Pa/m. Velg en større dimensjon.`;
  } else {
    if (r.dpdl > WARN_DPL) row.classList.add("status-bad-yellow");
    // Er valgt dimensjon overdimensjonert? Sammenlign mot den faktisk BESTE
    // (minste gyldige) dimensjonen i systemet - ikke bare ett hakk ned.
    if (Number.isFinite(recommendedInner) && recommendedInner < chosenInner) {
      const rBest = evaluatePipe(flow, recommendedInner, props.rho, props.nu, e);
      const bestOuter = (PIPE_SYSTEMS[system] || []).find(([outer, inner]) => inner === recommendedInner);
      const outerLabel = bestOuter ? `${bestOuter[0]} mm (innv. ${recommendedInner} mm)` : `innv. ${recommendedInner} mm`;
      if (rBest) {
        warnBox.style.display = "block";
        warnBox.className = "note warn";
        warnBox.textContent = `Trykkfallet er lavt her - beste dimensjon (n\u00e6rmest under ${MAX_DPL} Pa/m uten \u00e5 overstige den) er ${outerLabel}, som gir ${fmt(rBest.dpdl,1)} Pa/m. Vurder om den er et bedre/rimeligere valg.`;
      }
    }
  }
}


/* ============================================================
   Maks effekt fra dimensjon (motsatt vei av "Rørdimensjon fra
   effekt") - finner største volumstrøm/effekt en gitt dimensjon
   tåler før trykkfallet når 120 Pa/m, via binærsøk.
   ============================================================ */
function findMaxFlowForDpdl(dia_mm, rho, nu, e_mm, targetDpdl) {
  let lo = 1e-6, hi = 50; // l/s - romslig øvre grense, halveres ned uansett
  let r = evaluatePipe(hi, dia_mm, rho, nu, e_mm);
  if (!r) return null;
  // sørg for at intervallet faktisk omslutter target (dpdl øker monotont med Q)
  let guard = 0;
  while (r.dpdl < targetDpdl && guard < 30) { hi *= 2; r = evaluatePipe(hi, dia_mm, rho, nu, e_mm); guard++; }
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const rm = evaluatePipe(mid, dia_mm, rho, nu, e_mm);
    if (!rm) { lo = mid; continue; }
    if (rm.dpdl > targetDpdl) hi = mid; else lo = mid;
  }
  return evaluatePipe(lo, dia_mm, rho, nu, e_mm);
}

function populateMaxEffektSelects() {
  const sysSel = $("me_system");
  sysSel.innerHTML = "";
  HEAT_SYSTEMS.forEach(n => {
    const o = document.createElement("option");
    o.value = n; o.textContent = n;
    sysSel.appendChild(o);
  });
  const concSel = $("me_conc");
  concSel.innerHTML = "";
  GLYCOL_CONCENTRATIONS.forEach(p => {
    const o = document.createElement("option");
    o.value = p; o.textContent = p + " %";
    concSel.appendChild(o);
  });
  concSel.value = 30;
  populateMaxEffektDims();
}

function populateMaxEffektDims() {
  const system = $("me_system").value;
  const sel = $("me_dim");
  const current = sel.value;
  sel.innerHTML = "";
  (PIPE_SYSTEMS[system] || []).forEach(([outer, inner]) => {
    const o = document.createElement("option");
    o.value = inner;
    o.textContent = `${outer} mm  (innv. ${inner} mm)`;
    sel.appendChild(o);
  });
  if (current) sel.value = current;
}

function updateMaxEffektVisibility() {
  const fluid = $("me_fluid").value;
  $("me_conc_row").style.display = fluid === "Vann" ? "none" : "flex";
}

function recalcMaxEffekt() {
  const tur = parseFloat($("me_tur").value);
  const retur = parseFloat($("me_retur").value);
  const fluid = $("me_fluid").value;
  const conc = parseFloat($("me_conc").value) || 0;
  const system = $("me_system").value;
  const dia = parseFloat($("me_dim").value);

  if (!Number.isFinite(tur) || !Number.isFinite(retur) || !Number.isFinite(dia)) return;
  const dT = tur - retur;
  const avgT = (tur + retur) / 2;
  const props = fluidProps(fluid, conc, avgT);
  const fluidLabel = fluid === "Vann" ? "Vann" : `${fluid} ${conc}%`;
  $("me_props").innerHTML =
    `&Delta;T=${fmt(dT,1)}\u00b0C &middot; ${fluidLabel} &middot; \u03c1=${fmt(props.rho,0)} kg/m\u00b3 &middot; ` +
    `cp=${fmt(props.cp,0)} J/kg\u00b7K &middot; \u03bd=${props.nu.toExponential(2)} m\u00b2/s`;

  const e = PIPE_ROUGHNESS[system];
  const r = findMaxFlowForDpdl(dia, props.rho, props.nu, e, MAX_DPL);
  if (!r) {
    $("me_flow").textContent = "-";
    $("me_effekt").textContent = "-";
    $("me_v").textContent = "-";
    return;
  }
  const flow = (r.v * Math.PI * dia * dia) / 4000; // reverser v -> Q

  $("me_flow").innerHTML = fmt(flow, 3) + ' <span class="unit-sm">l/s</span>';
  let effekt = NaN;
  if (dT > 0 && props.cp > 0 && props.rho > 0) {
    effekt = (flow * props.cp * dT * props.rho) / 1e6;
  }
  $("me_effekt").innerHTML = Number.isFinite(effekt) ? fmt(effekt, 2) + ' <span class="unit-sm">kW</span>' : "ugyldig \u0394T";
  $("me_v").innerHTML = `v=${fmt(r.v,2)} m/s &middot; Re=${fmt(r.Re,0)} &middot; ${fmt(r.dpdl,1)} Pa/m`;

  saveState();
}

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

  function renderSystemRows(sys) {
    PIPE_SYSTEMS[sys].forEach(([outer, inner]) => {
      if (search && !String(outer).includes(search) && !String(inner).includes(search)) return;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${sys}</td><td>${outer}</td><td>${inner}</td>`;
      tbody.appendChild(tr);
    });
  }

  if (sysFilter === "__ALL__") {
    Object.entries(SYSTEM_GROUPS).forEach(([groupName, names]) => {
      const header = document.createElement("tr");
      header.innerHTML = `<td colspan="3" class="dim-group-header">${groupName}</td>`;
      tbody.appendChild(header);
      names.forEach(sys => { if (PIPE_SYSTEMS[sys]) renderSystemRows(sys); });
    });
  } else {
    renderSystemRows(sysFilter);
  }
}

/* ============================================================
   Navigasjon (faner)
   ============================================================ */
function switchView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll("nav.tabbar button").forEach(b => b.classList.remove("active"));
  $("view-" + name).classList.add("active");
  document.querySelector(`nav.tabbar button[data-view="${name}"]`).classList.add("active");
  const titles = { forbruksvann: "Forbruksvann", ventetid: "Ventetid varmtvann", dimensjoner: "Rørdimensjoner", varmekjol: "Varme/Kjøl" };
  $("headerSub").textContent = titles[name];
}

/* ============================================================
   Init
   ============================================================ */
function init() {
  populateSystemSelects();
  populateMaxEffektSelects();
  loadState();
  populateVentetidDims();
  loadState(); // gjenopprett lagret dimensjon nå som alternativene finnes
  applyVentetidDim();
  renderDimTable();

  document.querySelectorAll("nav.tabbar button").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.querySelectorAll("#fv-vann input, #fv-vann select").forEach(el => {
    el.addEventListener("input", () => { recalcForbruksvann(); recalcMiniTool(); });
  });
  $("eq_enabled").addEventListener("change", recalcEquipment);
  try { $("eq_enabled").checked = localStorage.getItem("rorkalk_eq_enabled") === "1"; } catch (e) {}
  renderEquipmentList();
  recalcEquipment();
  $("eqToggleBtn").addEventListener("click", () => {
    const list = $("eqList");
    const open = list.classList.toggle("eq-list-collapsed") === false;
    $("eqToggleBtn").classList.toggle("open", open);
    $("eqToggleLabel").textContent = open ? "Skjul utstyrsliste" : "Vis utstyrsliste";
  });

  // --- Underfaner (gjenbrukes i Forbruksvann og Varme/Kjøl) ---
  // Hver .subtab-bar styrer kun .subview-elementene i sin egen nærmeste .view-forelder.
  // Merk: [data-subtab] skiller disse fra den nøstede Varme/Kjøl-vekslen ([data-vksub]) under.
  document.querySelectorAll(".subtab-bar").forEach(bar => {
    const buttons = bar.querySelectorAll(".subtab[data-subtab]");
    if (!buttons.length) return;
    const scope = bar.closest(".view");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        scope.querySelectorAll(":scope > .subview").forEach(v => v.classList.remove("active"));
        btn.classList.add("active");
        $(btn.dataset.subtab).classList.add("active");
      });
    });
  });

  // --- Nøstet Varme/Kjøl-veksler inni Ekspansjon-underfanen ---
  document.querySelectorAll('[data-vksub]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('[data-vksub]').forEach(b => b.classList.remove("active"));
      document.querySelectorAll("#vk-ekspansjon .vksub").forEach(v => v.classList.remove("active"));
      btn.classList.add("active");
      $(btn.dataset.vksub).classList.add("active");
    });
  });

  // --- Forbruksvann: Avløp-underfane ---
  const avSysSel = $("av_system");
  AVLOP_SYSTEMS.forEach(n => {
    const o = document.createElement("option");
    o.value = n; o.textContent = n;
    avSysSel.appendChild(o);
  });
  document.querySelectorAll("#av_qn, #av_max, #av_kurve, #av_system, #av_fall_ratio, #av_wc, #av_bunnledning").forEach(el => {
    el.addEventListener("input", recalcAvlop);
  });
  $("rulesToggleBtn").addEventListener("click", () => {
    const list = $("rulesList");
    const open = list.classList.toggle("eq-list-collapsed") === false;
    $("rulesToggleBtn").classList.toggle("open", open);
    $("rulesToggleLabel").textContent = open ? "Skjul n\u00f8kkelregler" : "Vis n\u00f8kkelregler";
  });
  $("av_eq_enabled").addEventListener("change", recalcAvEquipment);
  try { $("av_eq_enabled").checked = localStorage.getItem("rorkalk_av_eq_enabled") === "1"; } catch (e) {}
  renderAvEquipmentList();
  recalcAvEquipment();
  recalcAvlop();
  $("avEqToggleBtn").addEventListener("click", () => {
    const list = $("avEqList");
    const open = list.classList.toggle("eq-list-collapsed") === false;
    $("avEqToggleBtn").classList.toggle("open", open);
    $("avEqToggleLabel").textContent = open ? "Skjul utstyrsliste" : "Vis utstyrsliste";
  });

  // --- Forbruksvann: Aquapresso-ekspansjon ---
  document.querySelectorAll("#aq_vhs, #aq_taz, #aq_pa, #aq_psv").forEach(el => {
    el.addEventListener("input", recalcAquapresso);
  });
  recalcAquapresso();

  // --- Varme/Kjøl: "Rørdimensjon fra effekt" ---
  document.querySelectorAll("#fe_effekt, #fe_tur, #fe_retur, #fe_fluid, #fe_conc").forEach(el => {
    el.addEventListener("input", () => recalcFraEffekt(false));
  });
  $("fe_fluid").addEventListener("change", () => { updateFraEffektVisibility(); recalcFraEffekt(false); });
  $("fe_system").addEventListener("change", () => recalcFraEffekt(true));
  $("fe_override").addEventListener("input", () => recalcFraEffekt(false));
  updateFraEffektVisibility();
  populateFeOverrideOptions();

  // --- Varme/Kjøl: "Maks effekt fra dimensjon" ---
  document.querySelectorAll("#me_tur, #me_retur, #me_fluid, #me_conc, #me_dim").forEach(el => {
    el.addEventListener("input", recalcMaxEffekt);
  });
  $("me_fluid").addEventListener("change", () => { updateMaxEffektVisibility(); recalcMaxEffekt(); });
  $("me_system").addEventListener("change", () => { populateMaxEffektDims(); recalcMaxEffekt(); });
  updateMaxEffektVisibility();

  // --- Varme/Kjøl: "Ekspansjon" (Statico, EN 12828) ---
  document.querySelectorAll("#ev_q, #ev_radtype, #ev_tstr, #ev_taz, #ev_fluid, #ev_conc, #ev_hst, #ev_psv, #ev_pz, #ev_vhs, #ev_vgsolar, #ev_vento").forEach(el => {
    el.addEventListener("input", recalcEkspansjonVarme);
  });
  $("ev_fluid").addEventListener("change", () => {
    $("ev_conc_row").style.display = $("ev_fluid").value === "Vann" ? "none" : "flex";
    recalcEkspansjonVarme();
  });
  $("ev_tstr").addEventListener("change", () => {
    $("ev_taz").value = IMI_T4_TSMAX[parseInt($("ev_tstr").value, 10)];
    recalcEkspansjonVarme();
  });
  recalcEkspansjonVarme();

  document.querySelectorAll("#ek_vs, #ek_stagnt, #ek_fluid, #ek_conc, #ek_hst, #ek_psv, #ek_pz, #ek_vhs, #ek_vgsolar, #ek_vento").forEach(el => {
    el.addEventListener("input", recalcEkspansjonKjol);
  });
  $("ek_fluid").addEventListener("change", () => {
    $("ek_conc_row").style.display = $("ek_fluid").value === "Vann" ? "none" : "flex";
    recalcEkspansjonKjol();
  });
  recalcEkspansjonKjol();

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
  recalcFraEffekt(true);
  recalcMaxEffekt();

  setupInstallPrompt();
  registerServiceWorker();
  setupAboutOverlay();
}

function setupAboutOverlay() {
  const overlay = $("aboutOverlay");
  const open = () => overlay.classList.add("open");
  const close = () => overlay.classList.remove("open");
  $("brandLogoBtn").addEventListener("click", open);
  $("aboutClose").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
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
