// Демо-пароль поменяйте перед публикацией. ВАЖНО: пароль в статическом сайте нельзя считать секретным.
const DEMO_PASSWORD = "change-me-123";
const STORAGE_KEY = "ffa-tierlist-players-v9";
const UPDATE_KEY = "ffa-tierlist-updated-v1";
const TIERS = ["HT1", "LT1", "HT2", "LT2", "HT3", "LT3", "HT4", "LT4", "HT5", "LT5"];
const TIER_POINTS = {HT1:10, LT1:9, HT2:8, LT2:7, HT3:6, LT3:5, HT4:4, LT4:3, HT5:2, LT5:1};
function pointsForTier(tier){ return TIER_POINTS[tier] || 0; }
function combatRank(points){
  if(points <= 4) return "Combat Rookie";
  if(points <= 9) return "Combat Cadet";
  if(points <= 14) return "Combat Fighter";
  if(points <= 19) return "Combat Ace";
  if(points <= 29) return "Combat Elite";
  if(points <= 45) return "Combat Master";
  if(points <= 60) return "Combat GrandMaster";
  if(points <= 100) return "Combat Legend";
  return "Combat Legend+";
}
function totalPoints(player){
  // Add points for every tier mentioned in the player's combat note.
  const tiers = (player.note || player.tier || "").match(/\b(?:HT|LT)[1-5]\b/g) || [];
  return tiers.reduce((sum, tier) => sum + pointsForTier(tier), 0);
}
const OLD_TIER_MAP = {S:"HT1", A:"LT1", B:"HT2", C:"LT2", D:"HT3"};
const starterPlayers = [
  {name:"Sigma9109", tier:"LT3", rank:1, avatar:"sigma9109.png", note:"Sword: LT3 • Axe: HT4 • Gapple: LT4 • Npot: HT4 • UHC: LT4"},
  {name:"Neray_4009", tier:"HT3", rank:1, avatar:"neray_4009.png", note:"Sword: HT3 • Npot: LT3 • UHC: LT3"},
  {name:"VeykAbsolute", tier:"LT3", rank:3, avatar:"veykabsolute.png", note:"Gapple: LT3 • Sword: LT3 • Npot: LT3"},
  {name:"ItzMalvus", tier:"HT4", rank:4, avatar:"itzmalvus.png", note:"Mace: HT4 • Sword: LT3 • Npot: LT3"},
  {name:"Mspo228", tier:"HT4", rank:5, avatar:"mspo228.png", note:"UHC: HT4 • Sword: LT4 • Gapple: HT5 • Npot: HT4 • Axe: LT5"},
  {name:"CatastrophesMC", tier:"LT3", rank:6, avatar:"catastrophesmc.png", note:"Sword: LT3 • UHC: LT3"},
  {name:"Debard 12345", tier:"LT3", rank:6, avatar:"debard_12345.png", note:"Sword: LT3 • Npot: LT3"},
  {name:"SnadySoda7924", tier:"LT3", rank:6, avatar:"snadysoda7924.png", note:"Sword: LT3 • Axe: LT3"},
  {name:"DarknessBloods", tier:"HT4", rank:6, avatar:"darknessbloods.png", note:"Sword: HT4 • Gapple: LT3"},
  {name:"ItsaAndyMc", tier:"LT3", rank:7, avatar:"itsaandymc.png", note:"Npot: LT3"},
  {name:"AHreA48", tier:"LT3", rank:5, avatar:"ahrea480.png", note:"Sword: LT3 • Gapple: LT3"},
  {name:"DieZombie32", tier:"HT4", rank:10, avatar:"diezombie32.png", note:"Sword: HT4 • Gapple: HT4"},
  {name:"FireFox1817563", tier:"LT4", rank:11, avatar:"firefox817563.png", note:"Sword: LT4"},
  {name:"kiviWho", tier:"LT4", rank:12, avatar:"kiviwho.png", note:"Npot: LT4"},
  {name:"RyzeR1x", tier:"HT4", rank:10, avatar:"ryzer1x.png", note:"Sword: HT4"},
  {name:"EloGOAT", tier:"LT3", rank:16, avatar:"elogoat.png", note:"Npot: LT3 • Sword: LT3 • Gapple: LT3"},
  {name:"Barsikpvp12", tier:"LT3", rank:17, avatar:"barsikpvp12.png", note:"Sword: LT3"}
];
let players = loadPlayers();
let isAdmin = false;
let selectedKit = "all";
const $ = id => document.getElementById(id);

function loadPlayers(){
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : starterPlayers.slice();
    const merged = data.map(p => ({...p, tier: OLD_TIER_MAP[p.tier] || p.tier}));
    starterPlayers.forEach(sp => {
      const existing = merged.find(p => p.name.toLowerCase() === sp.name.toLowerCase());
      if (!existing) merged.push({...sp});
      else {
        // Apply this update's corrected kit data while retaining existing avatar and other fields.
        if (sp.name === "DieZombie32") existing.note = sp.note;
        if (!existing.avatar && sp.avatar) existing.avatar = sp.avatar;
      }
    });
    return merged.filter(p => TIERS.includes(p.tier));
  } catch {
    return starterPlayers.map(p => ({...p, tier: OLD_TIER_MAP[p.tier] || "HT1"}));
  }
}
function savePlayers(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  localStorage.setItem(UPDATE_KEY, new Date().toISOString());
  render();
}
function skinUrl(name){ return `https://minotar.net/helm/${encodeURIComponent(name)}/64.png`; }
function avatarUrl(player){ return player.avatar || skinUrl(player.name); }
function renderLeaderboard(){
  const board = $("leaderboard");
  if (!board) return;
  board.innerHTML = "";
  players.slice().sort((a,b) => totalPoints(b)-totalPoints(a) || a.name.localeCompare(b.name)).slice(0,4).forEach((p, index) => {
    const card = document.createElement("article"); card.className = "leader-card";
    const rank = document.createElement("div"); rank.className = `leader-rank rank-${p.rank}`; rank.textContent = `#${index+1}`;
    const img = document.createElement("img"); img.className = "leader-avatar"; img.alt = `Фото ${p.name}`; img.src = avatarUrl(p);
    const body = document.createElement("div"); body.className = "leader-body";
    const name = document.createElement("h3"); name.textContent = p.name;
    const modes = document.createElement("p"); modes.className = "leader-modes"; modes.textContent = (p.note || `${p.tier}`) + ` • ${totalPoints(p)} pts`;
    const tier = document.createElement("span"); tier.className = `leader-tier tier-pill-${p.tier}`; tier.textContent = p.tier;
    body.append(name, modes); card.append(rank, img, body, tier); board.append(card);
  });
}
function getPlayerKitTier(player, kit){
  const entries = (player.note || "").match(/(Sword|Gapple|Npot|Axe|Mace|UHC)\s*:\s*(HT[1-5]|LT[1-5])/gi) || [];
  for (const entry of entries) {
    const bits = entry.split(":");
    if (bits[0].trim().toLowerCase() === kit.toLowerCase()) return bits[1].trim().toUpperCase();
  }
  return null;
}
function render(){
  const query = $("search").value.trim().toLowerCase();
  const sort = $("sort").value;
  const list = $("tierList"); list.innerHTML = "";
  let visible = players.filter(p => p.name.toLowerCase().includes(query));
  if (selectedKit !== "all") visible = visible.filter(p => getPlayerKitTier(p, selectedKit));
  visible.sort((a,b) => {
    if (selectedKit !== "all") {
      const tierDiff = pointsForTier(getPlayerKitTier(b, selectedKit)) - pointsForTier(getPlayerKitTier(a, selectedKit));
      if (tierDiff) return tierDiff;
    }
    return sort === "name" ? a.name.localeCompare(b.name) : totalPoints(b)-totalPoints(a) || a.name.localeCompare(b.name);
  });
  $("kitViewLabel").textContent = selectedKit === "all" ? "Общий рейтинг по сумме очков" : `Рейтинг режима ${selectedKit} — от сильнейшего тира к слабейшему`;
  document.querySelectorAll(".kit-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.kit === selectedKit));
  visible.forEach((p, index) => {
    const row = document.createElement("article"); row.className = `ranking-row row-${Math.min(index+1,3)}`;
    const rank = document.createElement("div"); rank.className = "ranking-number"; rank.textContent = `${index+1}.`;
    const portrait = document.createElement("div"); portrait.className = "portrait-panel";
    const img = document.createElement("img"); img.className = "ranking-avatar"; img.alt = `Скин ${p.name}`; img.src = avatarUrl(p);
    img.onerror = () => { img.onerror = null; img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%2325293a'/%3E%3Ctext x='50%25' y='57%25' text-anchor='middle' font-size='32' fill='%23a78bfa'%3E%E2%98%BA%3C/text%3E%3C/svg%3E"; };
    portrait.append(img);
    const info = document.createElement("div"); info.className = "ranking-info";
    const name = document.createElement("h3"); name.textContent = p.name;
    const subtitle = document.createElement("p"); subtitle.className = "ranking-points"; subtitle.textContent = `✦ ${combatRank(totalPoints(p))} • ${totalPoints(p)} points`;
    info.append(name, subtitle);
    const total = document.createElement("div"); total.className = "total-badge"; total.textContent = selectedKit === "all" ? `${totalPoints(p)} pts` : getPlayerKitTier(p, selectedKit);
    if (selectedKit !== "all") total.classList.add("tier-badge");
    const modes = document.createElement("div"); modes.className = "mode-list";
    const matches = (p.note || `${p.tier}`).match(/(Sword|Gapple|Npot|Axe|Mace|UHC)\s*:\s*(HT[1-5]|LT[1-5])/gi) || [];
    matches.forEach(entry => {
      const bits = entry.split(":"); const mode = bits[0].trim(); const tier = bits[1].trim().toUpperCase();
      if (selectedKit !== "all" && mode.toLowerCase() !== selectedKit.toLowerCase()) return;
      const item = document.createElement("div"); item.className = "mode-item";
      const icon = document.createElement("span"); icon.className = `mode-icon mode-${mode.toLowerCase()}`; icon.textContent = ({Sword:"⚔",Gapple:"●",Npot:"◉",Axe:"◆",Mace:"✦",UHC:"◈"})[mode] || "•";
      const label = document.createElement("span"); label.className = `mode-tier tier-${tier}`; label.textContent = tier;
      item.append(icon,label); item.title = `${mode}: ${tier}`; modes.append(item);
    });
    row.append(rank, portrait, info, total, modes); list.append(row);
  });
  $("playerCount") && ($("playerCount").textContent = players.length);
  const last = localStorage.getItem(UPDATE_KEY);
  $("updated") && ($("updated").textContent = "Обновлено: " + (last ? new Date(last).toLocaleDateString("ru-RU") : "демо-данные"));
  $("empty").classList.toggle("hidden", visible.length > 0);
  if (isAdmin) renderManageList();
}
function renderManageList(){
  const list = $("manageList"); list.innerHTML = "";
  players.forEach((p, index) => {
    const item = document.createElement("div"); item.className = "manage-item";
    const text = document.createElement("span"); text.textContent = `${p.name} — ${p.tier}`;
    const controls = document.createElement("div");
    const edit = document.createElement("button"); edit.textContent = "Изменить"; edit.onclick = () => {
      $("playerName").value = p.name; $("playerTier").value = p.tier; $("playerNote").value = p.note || "";
      $("savePlayer").textContent = "Сохранить изменения"; $("savePlayer").dataset.editIndex = index;
    };
    const remove = document.createElement("button"); remove.textContent = "Удалить"; remove.onclick = () => {
      if (confirm(`Удалить игрока ${p.name}?`)) { players.splice(index,1); savePlayers(); }
    };
    controls.append(edit, remove); item.append(text, controls); list.append(item);
  });
}
function openModal(){ $("adminModal").classList.remove("hidden"); }
function closeModal(){ $("adminModal").classList.add("hidden"); }
$("adminOpen").onclick = openModal;
$("adminClose").onclick = closeModal;
document.querySelector(".modal-backdrop").onclick = closeModal;
$("search").addEventListener("input", render);
$("sort").addEventListener("change", render);
document.querySelectorAll(".kit-tab").forEach(btn => btn.addEventListener("click", () => { selectedKit = btn.dataset.kit; render(); }));
$("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  if ($("adminPassword").value === DEMO_PASSWORD) {
    isAdmin = true; $("loginError").textContent = ""; $("loginForm").classList.add("hidden"); $("editor").classList.remove("hidden"); renderManageList();
  } else $("loginError").textContent = "Неверный пароль. Для демо-проекта пароль указан в script.js.";
});
$("savePlayer").onclick = e => {
  e.preventDefault();
  const name = $("playerName").value.trim();
  const tier = $("playerTier").value;
  const note = $("playerNote").value.trim();
  if (!name || !/^[A-Za-z0-9_]{1,16}$/.test(name)) { alert("Введите ник из 1–16 латинских букв, цифр или подчёркиваний."); return; }
  const editIndex = $("savePlayer").dataset.editIndex;
  const existing = players.findIndex((p,i) => p.name.toLowerCase() === name.toLowerCase() && String(i) !== editIndex);
  if (existing !== -1) { alert("Игрок с таким ником уже есть."); return; }
  if (editIndex !== undefined) { const oldPlayer = players[Number(editIndex)];
    players[Number(editIndex)] = {...oldPlayer, name, tier, note}; delete $("savePlayer").dataset.editIndex; $("savePlayer").textContent = "＋ Добавить игрока"; }
  else players.push({name,tier,note});
  $("playerName").value = ""; $("playerNote").value = ""; savePlayers();
};
$("logout").onclick = () => { isAdmin = false; $("editor").classList.add("hidden"); $("loginForm").classList.remove("hidden"); $("adminPassword").value = ""; };
$("exportData").onclick = () => {
  const blob = new Blob([JSON.stringify(players,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="ffa-tierlist.json"; a.click(); URL.revokeObjectURL(url);
};
$("importData").onchange = async e => {
  try {
    const data = JSON.parse(await e.target.files[0].text());
    if (!Array.isArray(data) || data.some(p => !p.name || !TIERS.includes(p.tier))) throw new Error();
    players = data.map(p => ({...p, name:String(p.name), tier:OLD_TIER_MAP[p.tier] || p.tier, note:String(p.note||"")})); if (players.some(p => !TIERS.includes(p.tier))) throw new Error();
    savePlayers(); alert("Список импортирован.");
  } catch { alert("Не удалось импортировать. Проверь JSON: нужен массив объектов name/tier/note."); }
  e.target.value = "";
};
render();
