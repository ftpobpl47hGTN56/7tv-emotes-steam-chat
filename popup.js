// popup.js
 
const inp    = document.getElementById("inp");
const btn    = document.getElementById("btn");
const msg    = document.getElementById("msg");
const listEl = document.getElementById("set-list");

const CUSTOM_API = "https://7tv.io/v3/emote-sets/";

// Новая структура: [{ id: "...", name: "..." }, ...]
let sets = [];

function extractId(raw) {
  raw = raw.trim();
  let m = raw.match(/emote-sets\/([A-Za-z0-9]{10,30})/);
  if (m) return m[1];
  m = raw.match(/users\/([A-Za-z0-9]{10,30})/);
  if (m) return m[1];
  if (/^[A-Za-z0-9]{10,30}$/.test(raw)) return raw;
  return null;
}

function showMsg(text, color) {
  msg.innerHTML = '<span style="color:' + color + '">' + text + '</span>';
  // Авто-скрытие через 4 секунды
  setTimeout(() => { msg.innerHTML = ""; }, 4000);
}

// Получить информацию о владельце сета
async function fetchSetOwner(setId) {
  try {
    const r = await fetch(CUSTOM_API + setId);
    if (!r.ok) return null;
    const data = await r.json();
    
    // Имя владельца может быть в разных полях
    const ownerName = data.owner?.display_name || 
                      data.owner?.username || 
                      data.user?.display_name ||
                      data.user?.username ||
                      null;
    
    console.log("[7TV Popup] Fetched owner for", setId, "→", ownerName);
    return ownerName;
  } catch (e) {
    console.error("[7TV Popup] Failed to fetch owner:", e);
    return null;
  }
}

function renderList() {
  listEl.innerHTML = "";
  if (!sets.length) {
    listEl.innerHTML = '<li><span class="empty">Пока пусто…</span></li>';
    return;
  }
  
  sets.forEach(function(set) {
    const li = document.createElement("li");
    
    // Контейнер для текста
    const textDiv = document.createElement("div");
    textDiv.className = "set-info";
    
    // Никнейм (если есть)
    if (set.name && set.name !== set.id) {
      const nameSpan = document.createElement("span");
      nameSpan.className = "set-name";
      nameSpan.textContent = set.name;
      textDiv.appendChild(nameSpan);
    }
    
    // ID (всегда показываем)
    const idSpan = document.createElement("span");
    idSpan.className = "set-id";
    idSpan.textContent = set.id;
    textDiv.appendChild(idSpan);
    
    // Кнопка удаления
    const del = document.createElement("button");
    del.className = "sm";
    del.textContent = "✕";
    del.title = "Удалить сет";
    del.addEventListener("click", function() { remove(set.id); });
    
    li.appendChild(textDiv);
    li.appendChild(del);
    listEl.appendChild(li);
  });
}

function save(cb) {
  chrome.storage.local.set({ customSetIds: sets }, cb);
}

async function add() {
  const id = extractId(inp.value);
  if (!id) {
    inp.className = "err";
    showMsg("Не похоже на ссылку или ID 7TV", "#ff6b6b");
    return;
  }
  
  if (sets.some(s => s.id === id)) {
    showMsg("Этот сет уже добавлен ✓", "#64d2ff");
    return;
  }
  
  // Показать индикатор загрузки
  btn.disabled = true;
  btn.textContent = "⏳";
  inp.disabled = true;
  showMsg("Загрузка информации о сете...", "#64d2ff");
  
  // Получить имя владельца
  const ownerName = await fetchSetOwner(id);
  
  sets.push({ 
    id: id, 
    name: ownerName || id 
  });
  
  save(function() {
    renderList();
    inp.value = "";
    inp.className = "ok";
    inp.disabled = false;
    btn.disabled = false;
    btn.textContent = "Добавить";
    
    const displayName = ownerName ? ownerName : "Сет";
    showMsg(`✅ ${displayName} добавлен! Перезагрузите Steam чат.`, "#5cd65c");
  });
}

function remove(id) {
  sets = sets.filter(function(s) { return s.id !== id; });
  save(function() {
    renderList();
    showMsg("Сет удалён. Перезагрузите страницу.", "#c6d4df");
  });
}

btn.addEventListener("click", add);
inp.addEventListener("keydown", function(e) { 
  if (e.key === "Enter" && !btn.disabled) add(); 
});
inp.addEventListener("input", function() { 
  inp.className = ""; 
  msg.innerHTML = ""; 
});

// Load saved sets on open
chrome.storage.local.get("customSetIds", function(d) {
  const stored = d.customSetIds || [];
  
  // Миграция старого формата (массив строк → массив объектов)
  if (stored.length > 0 && typeof stored[0] === 'string') {
    console.log("[7TV Popup] Migrating old format...");
    sets = stored.map(id => ({ id: id, name: id }));
    save(() => renderList());
  } else {
    sets = stored;
    renderList();
  }
});