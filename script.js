// Демо-пароль поменяйте перед публикацией. ВАЖНО: пароль в статическом сайте нельзя считать секретным.
const DEMO_PASSWORD = "change-me-123";
const STORAGE_KEY = "ffa-tierlist-players-v1";
const UPDATE_KEY = "ffa-tierlist-updated-v1";
const TIERS = ["S", "A", "B", "C", "D"];
const starterPlayers = [
  {name:"YourName", tier:"S", note:"Добавь сюда игроков через админку"},
  {name:"PvP_Master", tier:"A", note:"Пример игрока"},
  {name:"BedrockPro", tier:"B", note:"Пример игрока"},
  {name:"NewFighter", tier:"C", note:"Пример игрока"}
];
let players = loadPlayers();
let isAdmin = false;
const $ = id => document.getElementById(id);

function loadPlayers(){
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : starterPlayers.slice(); }
  catch { return starterPlayers.slice(); }
}
function savePlayers(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  localStorage.setItem(UPDATE_KEY, new Date().toISOString());
  render();
}
function skinUrl(name){ return `https://minotar.net/helm/${encodeURIComponent(name)}/64.png`; }
function render(){
  const query = $("search").value.trim().toLowerCase();
  const sort = $("sort").value;
  const count = players.length;
  $("playerCount").textContent = count;
  const last = localStorage.getItem(UPDATE_KEY);
  $("updated").textContent = "Обновлено: " + (last ? new Date(last).toLocaleDateString("ru-RU") : "демо-данные");
  const list = $("tierList"); list.innerHTML = "";
  let visibleCount = 0;
  TIERS.forEach(tier => {
    let tierPlayers = players.filter(p => p.tier === tier && p.name.toLowerCase().includes(query));
    if (sort === "name") tierPlayers.sort((a,b) => a.name.localeCompare(b.name));
    const row = document.createElement("div"); row.className = `tier-row tier-${tier}`;
    const label = document.createElement("div"); label.className = "tier-label"; label.textContent = tier;
    const holder = document.createElement("div"); holder.className = "tier-players";
    tierPlayers.forEach(p => {
      visibleCount++;
      const card = document.createElement("div"); card.className = "player-card";
      const img = document.createElement("img"); img.className = "player-skin"; img.alt = `Аватар ${p.name}`; img.src = skinUrl(p.name);
      img.onerror = () => { img.onerror = null; img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%2325293a'/%3E%3Ctext x='50%25' y='57%25' text-anchor='middle' font-size='32' fill='%23a78bfa'%3E%E2%98%BA%3C/text%3E%3C/svg%3E"; };
      const info = document.createElement("div"); info.className = "player-info";
      const name = document.createElement("div"); name.className = "player-name"; name.textContent = p.name;
      info.append(name);
      if (p.note) { const note = document.createElement("div"); note.className = "player-note"; note.textContent = p.note; info.append(note); }
      const badge = document.createElement("span"); badge.className = "player-badge"; badge.textContent = tier + " TIER";
      card.append(img, info, badge); holder.append(card);
    });
    row.append(label, holder); list.append(row);
  });
  $("empty").classList.toggle("hidden", visibleCount > 0);
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
  if (editIndex !== undefined) { players[Number(editIndex)] = {name,tier,note}; delete $("savePlayer").dataset.editIndex; $("savePlayer").textContent = "＋ Добавить игрока"; }
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
    players = data.map(p => ({name:String(p.name), tier:p.tier, note:String(p.note||"")}));
    savePlayers(); alert("Список импортирован.");
  } catch { alert("Не удалось импортировать. Проверь JSON: нужен массив объектов name/tier/note."); }
  e.target.value = "";
};
render();
