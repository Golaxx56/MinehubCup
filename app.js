/* Minehub Cup — la misma app sirve para la web pública (index.html) y para el editor (admin.html). */
const ADMIN = document.body.dataset.admin === "1";
const BOARDS = [
  {id:"general",  name:"Top General",    icon:"logo-m.png"},
  {id:"parkour",  name:"Parkour Tag",    icon:"icons/parkour-tag.png"},
  {id:"spleef",   name:"Spleef Royale",  icon:"icons/spleef-royale.png"},
  {id:"oneshot",  name:"One Shot",       icon:"icons/one-shot.png"},
  {id:"survival", name:"Survival Games", icon:"icons/survival-games.png"},
  {id:"pacer",    name:"Pacer",          icon:"icons/pacer.png"},
  {id:"mob",      name:"Mob Mayhem",     icon:"icons/mob-mayhem.png"},
  {id:"mosaic",   name:"Mosaic",         icon:"icons/mosaic.png"}
];
const $ = id => document.getElementById(id);
let rows = [], current = "general", loaded = false, dirty = false;

/* ---- skins ---- */
const skinUrls = n => [
  "https://minotar.net/helmet/" + encodeURIComponent(n) + "/64.png",
  "https://mc-heads.net/avatar/" + encodeURIComponent(n) + "/64",
  "https://crafatar.com/avatars/" + encodeURIComponent(n) + "?size=64&overlay"
];
function fallbackHead(name, cls){
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pick = (a, s) => a[(h >>> s) % a.length];
  const skin = pick(["#c68a5e","#e0ac7e","#a66a3f","#f1c9a0"], 0);
  const hair = pick(["#3b2512","#1c1c1c","#7a4a1e","#c9a13c","#8a2d1f"], 3);
  const eye  = pick(["#2b4f9e","#2f7a3a","#4a2c17","#6b6b6b"], 6);
  const cv = document.createElement("canvas"); cv.width = cv.height = 8; cv.className = cls || "head";
  const g = cv.getContext("2d");
  g.fillStyle = skin; g.fillRect(0,0,8,8);
  g.fillStyle = hair; g.fillRect(0,0,8,3); g.fillRect(0,3,1,2); g.fillRect(7,3,1,2);
  g.fillStyle = "#fff"; g.fillRect(1,4,2,1); g.fillRect(5,4,2,1);
  g.fillStyle = eye; g.fillRect(2,4,1,1); g.fillRect(5,4,1,1);
  g.fillStyle = "#6e3b26"; g.fillRect(3,6,2,1);
  return cv;
}
function skinImg(name, cls){
  const img = document.createElement("img");
  img.className = cls || "head"; img.alt = name; img.referrerPolicy = "no-referrer";
  const urls = skinUrls(name); let i = 0;
  img.src = urls[0];
  img.onerror = () => { if (++i < urls.length) img.src = urls[i]; else img.replaceWith(fallbackHead(name, cls)); };
  return img;
}
function ico(src, alt, cls){ const i = new Image(); i.src = src; i.alt = alt || ""; i.className = cls || "ico"; return i; }

/* ---- datos ---- */
function listFor(board){
  if (board === "general"){
    const tot = {}, disp = {};
    for (const r of rows){ const k = r.name.toLowerCase(); tot[k] = (tot[k] || 0) + (r.points || 0); disp[k] = disp[k] || r.name; }
    return Object.keys(tot).map(k => ({name: disp[k], points: tot[k]})).sort((a,b) => b.points - a.points);
  }
  return rows.filter(r => r.board === board).sort((a,b) => (b.points||0) - (a.points||0));
}
function say(t, err){ const m = $("msg"); if (!m) return; m.textContent = t; m.className = "msg" + (err ? " err" : ""); }
function markDirty(){ dirty = true; const b = $("download"); if (b) b.classList.add("pending"); }

/* ---- pintado ---- */
function renderTabs(){
  const t = $("tabs"); t.textContent = "";
  for (const b of BOARDS){
    const el = document.createElement("button");
    el.className = "tab"; el.type = "button"; el.setAttribute("role","tab");
    el.setAttribute("aria-selected", b.id === current ? "true" : "false");
    el.append(ico(b.icon, ""), document.createTextNode(b.name));
    el.onclick = () => { current = b.id; render(); };
    t.append(el);
  }
}
function renderBoard(){
  const b = BOARDS.find(x => x.id === current), box = $("board"); box.textContent = "";
  const h = document.createElement("div"); h.className = "board-head";
  const h2 = document.createElement("h2"); h2.textContent = b.name;
  h.append(ico(b.icon, "", "ico"), h2); box.append(h);
  const list = listFor(current);
  if (!list.length){
    const e = document.createElement("div"); e.className = "empty";
    const s = document.createElement("strong"); s.textContent = loaded ? "Todavía no hay jugadores" : "Cargando clasificación…";
    e.append(s, document.createTextNode(loaded ? (ADMIN ? "Añade el primero con el formulario de arriba." : "Los puntos aparecerán aquí en cuanto se publiquen.") : ""));
    box.append(e); return;
  }
  const editable = ADMIN && current !== "general";
  list.forEach((p, i) => {
    const r = document.createElement("div"); r.className = "row r" + (i + 1);
    const rank = document.createElement("div"); rank.className = "rank"; rank.textContent = "#" + (i + 1);
    const nick = document.createElement("div"); nick.className = "nick"; nick.textContent = p.name;
    r.append(rank, skinImg(p.name), nick);
    const pts = document.createElement("div"); pts.className = "pts";
    if (editable){
      const inp = document.createElement("input"); inp.type = "number"; inp.min = "0"; inp.className = "pts-edit";
      inp.value = p.points; inp.setAttribute("aria-label", "Puntos de " + p.name);
      inp.onchange = () => { p.points = Math.max(0, parseInt(inp.value, 10) || 0); markDirty(); say("Puntos de " + p.name + " cambiados. Descarga data.json para publicarlos."); render(); };
      pts.append(inp);
    } else {
      pts.append(document.createTextNode(Number(p.points).toLocaleString("es-ES")));
    }
    pts.append(ico("points.png", "puntos"));
    r.append(pts);
    if (editable){
      const d = document.createElement("button"); d.className = "del"; d.type = "button"; d.textContent = "✕";
      d.title = "Quitar a " + p.name; d.setAttribute("aria-label", "Quitar a " + p.name);
      d.onclick = () => { rows.splice(rows.indexOf(p), 1); markDirty(); say(p.name + " eliminado. Descarga data.json para publicarlo."); render(); };
      r.append(d);
    }
    box.append(r);
  });
}
function renderSelect(){
  const s = $("boardSel"), keep = s.value; s.textContent = "";
  for (const b of BOARDS.filter(x => x.id !== "general")){
    const o = document.createElement("option"); o.value = b.id; o.textContent = b.name; s.append(o);
  }
  s.value = current !== "general" ? current : (keep || "parkour");
}
function render(){ renderTabs(); renderBoard(); if (ADMIN) renderSelect(); }

/* ---- carga de data.json ---- */
function setData(obj){
  const list = obj && Array.isArray(obj.scores) ? obj.scores : [];
  rows = list.filter(r => r && typeof r.name === "string" && BOARDS.some(b => b.id === r.board))
             .map(r => ({board: r.board, name: r.name, points: Math.max(0, parseInt(r.points, 10) || 0)}));
  loaded = true; render();
}
async function load(){
  try {
    const res = await fetch("data.json?t=" + Date.now(), {cache: "no-store"});
    if (!res.ok) throw new Error(res.status);
    setData(await res.json());
  } catch(e){
    loaded = true; render();
    if (ADMIN) say("No pude leer data.json automáticamente. Usa «Abrir data.json» para cargarlo desde tu ordenador.", true);
  }
}

/* ---- editor ---- */
if (ADMIN){
  let prevTimer;
  $("nick").addEventListener("input", () => {
    clearTimeout(prevTimer);
    prevTimer = setTimeout(() => {
      const n = $("nick").value.trim().replace(/[^A-Za-z0-9_]/g, "");
      $("prevSlot").textContent = "";
      if (!n){ $("prevTxt").textContent = "Escribe un nombre para ver su skin"; return; }
      $("prevSlot").append(skinImg(n, "head")); $("prevTxt").textContent = n;
    }, 250);
  });
  $("form").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("nick").value.trim().replace(/[^A-Za-z0-9_]/g, "");
    const points = Math.max(0, parseInt($("points").value, 10) || 0);
    const board = $("boardSel").value;
    if (!name) return;
    const ex = rows.find(r => r.board === board && r.name.toLowerCase() === name.toLowerCase());
    if (ex) ex.points = points; else rows.push({board, name, points});
    markDirty(); current = board;
    say(name + ": " + points + " puntos en " + BOARDS.find(b => b.id === board).name + ". Descarga data.json para publicarlo.");
    $("nick").value = ""; $("prevSlot").textContent = ""; $("prevTxt").textContent = "Escribe un nombre para ver su skin";
    render();
  });
  $("download").addEventListener("click", () => {
    const sorted = rows.slice().sort((a,b) => a.board.localeCompare(b.board) || b.points - a.points);
    const blob = new Blob([JSON.stringify({scores: sorted}, null, 2) + "\n"], {type: "application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "data.json";
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    dirty = false; $("download").classList.remove("pending");
    say("data.json descargado. Súbelo a tu repositorio de GitHub para que todos lo vean.");
  });
  $("openfile").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    try { setData(JSON.parse(await f.text())); say("data.json cargado."); dirty = false; }
    catch(err){ say("Ese archivo no es un data.json válido.", true); }
  });
  window.addEventListener("beforeunload", e => { if (dirty){ e.preventDefault(); e.returnValue = ""; } });
}

/* ---- logos de respaldo ---- */
$("logoM").onerror = () => { $("logoM").style.display = "none"; };
$("logoWord").onerror = () => { const s = document.createElement("span"); s.className = "wordmark-fallback"; s.textContent = "MINEHUB"; $("logoWord").replaceWith(s); };

render();
load();
