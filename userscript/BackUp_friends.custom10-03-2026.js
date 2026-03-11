// Общие константы
const CHECK_INTERVAL = 200;
const DEBOUNCE_TIME  = 500;

let lastActionTime = 1;

// ───────────────────────────────────────────────
// 1. Авто-клик "ОК"
// ───────────────────────────────────────────────
function tryAutoConfirm() {
    const now = Date.now();
    if (now - lastActionTime < DEBOUNCE_TIME) return;
    lastActionTime = now;

    const sellOk = document.querySelector('#market_sell_dialog_ok');
    if (sellOk && isVisibleAndEnabled(sellOk)) {
        setTimeout(() => { if (isVisibleAndEnabled(sellOk)) sellOk.click(); }, 100);
        return;
    }
    const modalOk = findModalOkButton();
    if (modalOk && isVisibleAndEnabled(modalOk)) {
        setTimeout(() => { if (isVisibleAndEnabled(modalOk)) modalOk.click(); }, 120);
        return;
    }
}

function findModalOkButton() {
    const candidates = document.querySelectorAll('.newmodal span, .newmodal_buttons span');
    for (const span of candidates) {
        if (span.textContent.trim() === 'OK') {
            const btn = span.closest('div[class*="btn_"], a, button, [data-panel*="clickOnActivate"]');
            if (btn) return btn;
        }
    }
    return null;
}

function isVisibleAndEnabled(el) {
    if (!el || el.disabled) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) >= 0.15;
}

// ───────────────────────────────────────────────
// 2. Перемещение чекбокса под заголовок
// ───────────────────────────────────────────────
function moveSellControlsUnderHeader() {
    const modal = document.querySelector('#market_sell_dialog');
    if (!modal || modal.dataset.controlsMoved === 'true') return;

    const headerBorder = modal.querySelector('.newmodal_header_border');
    if (!headerBorder) return;

    const checkboxContainer = modal.querySelector('#market_sell_dialog_accept_ssa_container');
    const sellButton = modal.querySelector('#market_sell_dialog_accept');
    if (!checkboxContainer || !sellButton) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        padding: 12px 16px 8px;
        border-top: 1px solid rgba(255,255,255,0.08);
        margin-top: 1px;
        background: rgba(0,0,0,0.2);
    `;
    wrapper.appendChild(checkboxContainer);
    wrapper.appendChild(sellButton);
    headerBorder.insertAdjacentElement('afterend', wrapper);

    const inputArea = modal.querySelector('#market_sell_dialog_input_area');
    if (inputArea) {
        const clears = inputArea.querySelectorAll('div[style="clear:both"]');
        if (clears.length >= 2) {
            clears[clears.length - 1].remove();
            clears[clears.length - 2].remove();
        }
        const br = inputArea.querySelector('br');
        if (br) br.remove();
    }
    modal.dataset.controlsMoved = 'true';
}

// ───────────────────────────────────────────────
// 3. Инжект стилей
// ───────────────────────────────────────────────
function injectCustomStyles() {
    if (document.getElementById('force-injected-styles-by-user')) return;
    const style = document.createElement('style');
    style.id = 'force-injected-styles-by-user';
    style.textContent = `
    button._3QKUrmKA1DptBhihc8GSAF.RttCMpsTJp47IkzXpZYvA._0BH1ydyFmSnUvoVK2hIc {
        height: 33px !important;
        font-size: 20px !important;
        color: #1c3a49 !important;
    }
    input#market_sell_dialog_accept_ssa {
        position: relative !important;
        left: 65% !important;
        top: 35px !important;
        background: #749205 !important;
        width: 25px !important;
        height: 25px !important;
        z-index: 555555 !important;
    }`;
    (document.head || document.documentElement).appendChild(style);
}

// ───────────────────────────────────────────────
// 4. Пагинация инвентаря
// ───────────────────────────────────────────────
function moveInventoryPagination() {
    const pagination = document.querySelector('#inventory_pagecontrols');
    if (!pagination || pagination.dataset.movedByScript === 'true') return;

    const filterCtn = document.querySelector('.filter_ctn.inventory_filters');
    if (!filterCtn) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        float: right; margin-left: 16px; display: flex;
        align-items: center; gap: 8px; padding: 0 8px; height: 28px;
    `;
    wrapper.appendChild(pagination);

    const filterControl = filterCtn.querySelector('.filter_control_ctn');
    if (filterControl) filterControl.insertAdjacentElement('afterend', wrapper);
    else               filterCtn.appendChild(wrapper);

    pagination.dataset.movedByScript = 'true';
    const clearDiv = pagination.querySelector('div[style="clear: right;"]');
    if (clearDiv) clearDiv.remove();
    pagination.querySelectorAll('.pagebtn').forEach(el => {
        el.style.padding  = '4px 10px';
        el.style.fontSize = '14px';
    });
}

// ───────────────────────────────────────────────
// 5. Блок "Продать" над изображением
// ───────────────────────────────────────────────
function moveSellBlockAboveImage() {
    const itemDescription = document.querySelector('div[class*="_2lajVjbyrA4lq9xF0X4NQW"]');
    if (!itemDescription) return;

    const sellBlock = itemDescription.querySelector('div[class*="_1NBFz9qQu7S4tSVNyypXBZ"]');
    if (!sellBlock || sellBlock.dataset.movedAboveImage === 'true') return;

    const imageContainer = itemDescription.querySelector('div[class*="_1u7tlq5OcUVR8p7-ic_ZVw"]');
    if (!imageContainer) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        margin: 0 0 16px 0; padding: 12px 16px;
        background: rgba(0,0,0,0.22); border-radius: 6px;
        border: 1px solid rgba(94,152,217,0.25);
    `;
    wrapper.appendChild(sellBlock);
    imageContainer.parentNode.insertBefore(wrapper, imageContainer);
    sellBlock.dataset.movedAboveImage = 'true';
}

function runAllFeatures() {
    tryAutoConfirm();
    moveSellControlsUnderHeader();
    injectCustomStyles();
    moveInventoryPagination();
    moveSellBlockAboveImage();
}

runAllFeatures();
const mainInterval = setInterval(runAllFeatures, CHECK_INTERVAL);
const mainObserver = new MutationObserver(() => { runAllFeatures(); });
mainObserver.observe(document.body, {
    childList: true, subtree: true,
    attributes: true, attributeFilter: ['style', 'class', 'disabled']
});
setTimeout(() => { clearInterval(mainInterval); mainObserver.disconnect(); }, 10 * 60 * 1000);


// ============================================================
//  Steam 7TV Emote Picker — Desktop Client (SFP_UI)  v7
//  + per-set pagination to handle large sets (700+ emotes)
// ============================================================
(function () {
  "use strict";

  const GLOBAL_API    = "https://7tv.io/v3/emote-sets/global";
  const CUSTOM_API    = "https://7tv.io/v3/emote-sets/";
  const CDN           = "https://cdn.7tv.app/emote/";
  const PAGE_SIZE     = 60;   // global search pagination
  const SET_PAGE_SIZE = 48;   // per-set pagination

  // { id, name, emotes: [{name, id, zeroWidth}] }[]
  let allSets       = [];
  let collapsedSets = new Set();  // set IDs folded
  let setPages      = new Map();  // setId → current page index

  let allEmotes = [];
  let filtered  = [];
  let page      = 0;
  let open      = false;
  let picker    = null;
  let btn       = null;
  let query     = "";

  // ── LocalStorage helpers ──────────────────────────────────

  function getCustomSets() {
    try {
      const raw = localStorage.getItem("stv_custom_sets");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveCustomSets(sets) {
    try { localStorage.setItem("stv_custom_sets", JSON.stringify(sets)); }
    catch (e) { console.error("[7TV] Save error:", e); }
  }

  // ── Textarea helpers ──────────────────────────────────────

  function getTextarea() {
    return (
      document.querySelector("textarea.chatentry_chatTextarea_113iu") ||
      document.querySelector("textarea[class*='chatentry_chatTextarea']") ||
      document.querySelector("textarea[class*='chatTextarea']") ||
      document.querySelector("textarea[maxlength='5000']") ||
      document.querySelector("textarea[role='button']")
    );
  }

  function insertText(text) {
    const ta = getTextarea();
    if (!ta) return;
    ta.focus();
    const s      = ta.selectionStart ?? ta.value.length;
    const e      = ta.selectionEnd   ?? ta.value.length;
    const before = ta.value.slice(0, s);
    const after  = ta.value.slice(e);
    const pad    = (before === "" || before.endsWith(" ")) ? "" : " ";
    ta.value = before + pad + text + " " + after;
    const pos = (before + pad + text + " ").length;
    ta.selectionStart = ta.selectionEnd = pos;
    const proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    if (proto && proto.set) proto.set.call(ta, ta.value);
    ta.dispatchEvent(new Event("input",  { bubbles: true }));
    ta.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // ── Load emotes ───────────────────────────────────────────

  async function fetchSet(apiUrl) {
    try {
      const r = await fetch(apiUrl);
      if (!r.ok) return null;
      const d = await r.json();
      return {
        id:     d.id   || apiUrl,
        name:   d.name || d.id || "Set",
        emotes: (d.emotes || []).map(e => ({
          name:      e.name,
          id:        e.id,
          zeroWidth: !!(e.flags & 1) || !!(e.data?.flags & 1),
        })),
      };
    } catch { return null; }
  }

  async function loadEmotes() {
    const urls = [{ url: GLOBAL_API, label: null }];
    const customSets = getCustomSets();
    customSets.forEach(item => {
      const id    = typeof item === "string" ? item    : item.id;
      const label = typeof item === "object"  ? item.name : null;
      urls.push({ url: CUSTOM_API + id, label });
    });

    const results = await Promise.all(urls.map(s => fetchSet(s.url)));
    const seen = new Set();
    allSets   = [];
    allEmotes = [];

    results.forEach((set, i) => {
      if (!set) return;
      if (urls[i].label) set.name = urls[i].label;
      set.emotes = set.emotes.filter(e => {
        if (seen.has(e.name)) return false;
        seen.add(e.name);
        return true;
      });
      allSets.push(set);
      allEmotes.push(...set.emotes);
    });

    filtered = allEmotes;
    console.log(
      "[7TV Desktop] Loaded", allEmotes.length, "emotes across", allSets.length, "sets",
      "(ZW:", allEmotes.filter(e => e.zeroWidth).length + ")"
    );
  }

  async function fetchSetOwner(setId) {
    try {
      const r = await fetch(CUSTOM_API + setId);
      if (!r.ok) return null;
      const data = await r.json();
      return data.owner?.display_name || data.owner?.username ||
             data.user?.display_name  || data.user?.username  ||
             data.name || null;
    } catch (e) { console.error("[7TV] Failed to fetch owner:", e); return null; }
  }

  // ── Settings UI ───────────────────────────────────────────

  function openSettings() {
    if (document.getElementById("stv-settings-modal")) return;

    const modal = document.createElement("div");
    modal.id = "stv-settings-modal";
    modal.innerHTML = `
      <div class="stv-settings-overlay"></div>
      <div class="stv-settings-panel">
        <div class="stv-settings-header">
          <span class="stv-settings-title">7TV Custom Emote Sets</span>
          <button type="button" class="stv-settings-close">✕</button>
        </div>
        <div class="stv-settings-body">
          <div class="stv-input-row">
            <input type="text" id="stv-set-input" placeholder="Вставьте ссылку или ID сета 7TV..." />
            <button type="button" id="stv-add-set">Add Set</button>
          </div>
          <div id="stv-set-msg"></div>
          <ul id="stv-set-list"></ul>
        </div>
      </div>`;

    document.body.appendChild(modal);

    const overlay = modal.querySelector(".stv-settings-overlay");
    const closeBtn = modal.querySelector(".stv-settings-close");
    const input    = modal.querySelector("#stv-set-input");
    const addBtn   = modal.querySelector("#stv-add-set");
    const msgEl    = modal.querySelector("#stv-set-msg");
    const listEl   = modal.querySelector("#stv-set-list");

    function close() { modal.remove(); }

    function showMsg(text, color) {
      msgEl.innerHTML = `<span style="color:${color}">${text}</span>`;
      setTimeout(() => { msgEl.innerHTML = ""; }, 3000);
    }

    function extractId(raw) {
      raw = raw.trim();
      let m = raw.match(/emote-sets\/([A-Za-z0-9]{10,30})/);
      if (m) return m[1];
      m = raw.match(/users\/([A-Za-z0-9]{10,30})/);
      if (m) return m[1];
      if (/^[A-Za-z0-9]{10,30}$/.test(raw)) return raw;
      return null;
    }

    function renderList() {
      const sets = getCustomSets();
      listEl.innerHTML = "";
      if (!sets.length) {
        listEl.innerHTML = '<li class="stv-empty">Нет кастомных сетов</li>';
        return;
      }
      sets.forEach(set => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="stv-set-name">${set.name || set.id}</span>
          <span class="stv-set-id">${set.id}</span>
          <button type="button" class="stv-remove-set" data-id="${set.id}">✕</button>`;
        listEl.appendChild(li);
      });
      listEl.querySelectorAll(".stv-remove-set").forEach(b => {
        b.addEventListener("click", function() {
          let sets = getCustomSets();
          sets = sets.filter(s => s.id !== this.dataset.id);
          saveCustomSets(sets);
          renderList();
          showMsg("Сет удалён. Перезагрузите чат.", "#c6d4df");
        });
      });
    }

    async function addSet() {
      const id = extractId(input.value);
      if (!id) { showMsg("Неверный формат ID или ссылки", "#ff6b6b"); return; }
      let sets = getCustomSets();
      if (sets.some(s => s.id === id)) { showMsg("Этот сет уже добавлен", "#64d2ff"); return; }
      showMsg("⏳ Загрузка информации о сете...", "#64d2ff");
      addBtn.disabled = true;
      const ownerName = await fetchSetOwner(id);
      sets.push({ id, name: ownerName || id });
      saveCustomSets(sets);
      renderList();
      input.value = "";
      addBtn.disabled = false;
      showMsg(`✅ Сет добавлен: ${ownerName || id}`, "#5cd65c");
    }

    overlay.addEventListener("click", close);
    closeBtn.addEventListener("click", close);
    addBtn.addEventListener("click", addSet);
    input.addEventListener("keydown", e => { if (e.key === "Enter") addSet(); });
    renderList();
  }

  // ── Picker UI ─────────────────────────────────────────────

  function buildPicker() {
    const el = document.createElement("div");
    el.id = "stv-picker";
    el.innerHTML = `
      <div class="stv-header">
        <span class="stv-title">7TV</span>
        <input class="stv-search" type="text" placeholder="Поиск…" />
        <button type="button" class="stv-settings-btn" title="Настройки">⚙</button>
        <button type="button" class="stv-close">✕</button>
      </div>
      <div class="stv-grid" id="stv-grid"></div>
      <div class="stv-footer">
        <button type="button" class="stv-nav" id="stv-prev">◀</button>
        <span class="stv-page" id="stv-pinfo"></span>
        <button type="button" class="stv-nav" id="stv-next">▶</button>
      </div>`;

    el.querySelector(".stv-close").addEventListener("mousedown", function(e) {
      e.preventDefault(); e.stopPropagation();
      togglePicker(false);
    }, true);

    el.querySelector(".stv-settings-btn").addEventListener("mousedown", function(e) {
      e.preventDefault(); e.stopPropagation();
      openSettings();
    }, true);

    el.querySelector(".stv-search").addEventListener("input", function() {
      query    = this.value.toLowerCase().trim();
      filtered = query
        ? allEmotes.filter(e => e.name.toLowerCase().includes(query))
        : allEmotes;
      page = 0;
      renderPage();
    });

    el.querySelector("#stv-prev").addEventListener("mousedown", function(e) {
      e.preventDefault(); e.stopPropagation();
      if (page > 0) { page--; renderPage(); }
    }, true);

    el.querySelector("#stv-next").addEventListener("mousedown", function(e) {
      e.preventDefault(); e.stopPropagation();
      if (page < Math.ceil(filtered.length / PAGE_SIZE) - 1) { page++; renderPage(); }
    }, true);

    document.addEventListener("mousedown", function(e) {
      if (!open) return;
      const livePicker = document.getElementById("stv-picker");
      const liveBtn    = document.getElementById("stv-open7tv-picker-btn");
      if (livePicker && livePicker.contains(e.target)) return;
      if (liveBtn    && liveBtn.contains(e.target))    return;
      togglePicker(false);
    }, true);

    return el;
  }

  // ── Emote item factory ────────────────────────────────────

  function makeEmoteItem(emote) {
    const item = document.createElement("div");
    item.className = "stv-item" + (emote.zeroWidth ? " stv-zw" : "");
    item.title = emote.name + (emote.zeroWidth ? " (overlay)" : "") + " | Shift+click — send as link";

    const img = document.createElement("img");
    img.src     = CDN + emote.id + "/4x.webp";
    img.alt     = emote.name;
    img.loading = "lazy";
    img.onerror = function() { this.src = CDN + emote.id + "/4x.png"; };

    const lbl = document.createElement("span");
    lbl.textContent = emote.name;

    item.appendChild(img);
    item.appendChild(lbl);

    item.addEventListener("mousedown", function(e) {
      e.preventDefault(); e.stopPropagation();
      insertText(e.shiftKey ? CDN + emote.id + "/2x.png" : emote.name);
    }, true);

    return item;
  }

  // ── Set section: header + paginated emote slice ───────────
  //
  //  Header layout:
  //    ▾  SetName  setId  [spacer]  [◀ 1/12 ▶]  [count]
  //
  //  Clicking the header (not the ◀▶) toggles collapse.
  //  Clicking ◀/▶ changes that set's page.

  function makeSetSection(set) {
    const frag = document.createDocumentFragment();

    const curPage    = setPages.get(set.id) || 0;
    const totalPages = Math.ceil(set.emotes.length / SET_PAGE_SIZE);
    const isCollapsed = collapsedSets.has(set.id);

    // ── Header ──
    const header = document.createElement("div");
    header.className   = "stv-set-header" + (isCollapsed ? " stv-set-collapsed" : "");
    header.dataset.setId = set.id;

    const arrow = document.createElement("span");
    arrow.className   = "stv-set-arrow";
    arrow.textContent = "▾";

    const nameEl = document.createElement("span");
    nameEl.className   = "stv-set-label-name";
    nameEl.textContent = set.name;

    const idEl = document.createElement("span");
    idEl.className   = "stv-set-label-id";
    idEl.textContent = set.id;

    const spacer = document.createElement("span");
    spacer.className = "stv-set-spacer";

    // Per-set nav (only when expanded and multi-page)
    const nav = document.createElement("span");
    nav.className = "stv-set-nav";

    if (!isCollapsed && totalPages > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.type      = "button";
      prevBtn.className = "stv-set-nav-btn";
      prevBtn.textContent = "◀";
      prevBtn.disabled  = (curPage === 0);

      const label = document.createElement("span");
      label.className   = "stv-set-nav-label";
      label.textContent = (curPage + 1) + " / " + totalPages;

      const nextBtn = document.createElement("button");
      nextBtn.type      = "button";
      nextBtn.className = "stv-set-nav-btn";
      nextBtn.textContent = "▶";
      nextBtn.disabled  = (curPage >= totalPages - 1);

      prevBtn.addEventListener("mousedown", function(e) {
        e.preventDefault(); e.stopPropagation();
        if (curPage > 0) { setPages.set(set.id, curPage - 1); renderPage(); }
      }, true);

      nextBtn.addEventListener("mousedown", function(e) {
        e.preventDefault(); e.stopPropagation();
        if (curPage < totalPages - 1) { setPages.set(set.id, curPage + 1); renderPage(); }
      }, true);

      nav.appendChild(prevBtn);
      nav.appendChild(label);
      nav.appendChild(nextBtn);
    }

    const count = document.createElement("span");
    count.className   = "stv-set-count";
    count.textContent = set.emotes.length;

    header.appendChild(arrow);
    header.appendChild(nameEl);
    header.appendChild(idEl);
    header.appendChild(spacer);
    header.appendChild(nav);
    header.appendChild(count);

    header.addEventListener("mousedown", function(e) {
      if (e.target.closest(".stv-set-nav")) return;
      e.preventDefault(); e.stopPropagation();
      collapsedSets.has(set.id) ? collapsedSets.delete(set.id) : collapsedSets.add(set.id);
      renderPage();
    }, true);

    frag.appendChild(header);

    // ── Current page emotes ──
    if (!isCollapsed) {
      const start = curPage * SET_PAGE_SIZE;
      set.emotes.slice(start, start + SET_PAGE_SIZE)
                .forEach(emote => frag.appendChild(makeEmoteItem(emote)));
    }

    return frag;
  }

  // ── Render ────────────────────────────────────────────────

  function renderPage() {
    
    const grid    = document.getElementById("stv-grid");
    const pinfo   = document.getElementById("stv-pinfo");
    const prevBtn = document.getElementById("stv-prev");
    const nextBtn = document.getElementById("stv-next");
    if (!grid) return;

    const frag = document.createDocumentFragment();

    if (!query) {
      if (prevBtn) prevBtn.style.visibility = "hidden";
      if (nextBtn) nextBtn.style.visibility = "hidden";
      if (pinfo)   pinfo.textContent = allEmotes.length + " эмоутов";
      allSets.forEach(set => frag.appendChild(makeSetSection(set)));
    } else {
      if (prevBtn) prevBtn.style.visibility = "visible";
      if (nextBtn) nextBtn.style.visibility = "visible";
      const start = page * PAGE_SIZE;
      const slice = filtered.slice(start, start + PAGE_SIZE);
      const total = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (pinfo) pinfo.textContent = (page + 1) + " / " + total + " (" + filtered.length + ")";
      slice.forEach(emote => frag.appendChild(makeEmoteItem(emote)));
    }

    const savedScroll = grid.scrollTop;  // сохраняем до очистки
    grid.innerHTML = "";
    grid.appendChild(frag);
    grid.scrollTop = savedScroll;        // восстанавливаем после рендера
  }

  // ── togglePicker ──────────────────────────────────────────

  function togglePicker(force) {
    open = (force !== undefined) ? force : !open;
    if (picker) picker.style.display = open ? "flex" : "none";
    if (btn)    btn.classList.toggle("stv-open7tv-picker-btn-active", open);
    if (open) {
      renderPage();
      setTimeout(function() {
        if (picker) picker.querySelector(".stv-search").focus();
      }, 40);
    }
  }

  // ── Inject button ─────────────────────────────────────────

  function inject() {
    if (document.getElementById("stv-open7tv-picker-btn")) return true;
    const ta = getTextarea();
    if (!ta) return false;
    const parent = ta.parentElement;
    if (!parent) return false;

    if (window.getComputedStyle(parent).position === "static")
      parent.style.position = "relative";

    btn = document.createElement("button");
    btn.id          = "stv-open7tv-picker-btn";
    btn.type        = "button";
    btn.title       = "7TV Emote Picker";
    btn.textContent = "7TV Emotes";
    btn.addEventListener("mousedown", function(e) {
      e.preventDefault(); e.stopPropagation();
      togglePicker();
    }, true);

    picker = buildPicker();
    picker.style.display = "none";

    ta.insertAdjacentElement("afterend", btn);
    ta.insertAdjacentElement("afterend", picker);

    console.log("[7TV Desktop] Injected ✅");
    return true;
  }

  // ── Zero-width overlay rendering ─────────────────────────

  function renderEmotesInMessages() {
    if (!allEmotes.length) return;
    const map = new Map(allEmotes.map(e => [e.name, e]));

    document.querySelectorAll(".msgText span[bbcode-text]").forEach(span => {
      if (span.dataset.stv) return;
      span.dataset.stv = "1";

      const rawText = span.getAttribute("bbcode-text") || span.textContent;
      const tokens  = rawText.trim().split(/\s+/);
      if (!tokens.some(t => map.has(t))) return;

      const nodes = [];
      for (let i = 0; i < tokens.length; i++) {
        const t     = tokens[i];
        const emote = map.get(t);
        if (!emote) { nodes.push({ type: "text", value: t }); continue; }

        if (emote.zeroWidth) {
          let lastEmote = null;
          for (let j = nodes.length - 1; j >= 0; j--) {
            if (nodes[j].type === "emote") { lastEmote = nodes[j]; break; }
          }
          if (lastEmote) { lastEmote.overlays.push(emote); continue; }
        }
        nodes.push({ type: "emote", emote, overlays: [] });
      }

      span.innerHTML = "";
      nodes.forEach(function(node, idx) {
        if (node.type === "text") { span.appendChild(document.createTextNode(node.value)); return; }
        if (idx > 0) span.appendChild(document.createTextNode(" "));

        if (node.overlays.length === 0) { span.appendChild(makeEmoteImg(node.emote)); return; }

        const wrap = document.createElement("span");
        wrap.className = "stv-emote-wrap";
        const base = makeEmoteImg(node.emote);
        base.className = "stv-emote-inline stv-emote-base";
        wrap.appendChild(base);
        node.overlays.forEach(ov => {
          const ovImg = makeEmoteImg(ov);
          ovImg.className = "stv-emote-inline stv-emote-overlay";
          wrap.appendChild(ovImg);
        });
        span.appendChild(wrap);
      });
    });
  }

  function makeEmoteImg(emote) {
    const img = document.createElement("img");
    img.src       = CDN + emote.id + "/4x.webp";
    img.alt       = emote.name;
    img.title     = emote.name;
    img.className = "stv-emote-inline";
    img.onerror   = function() { this.src = CDN + emote.id + "/4x.png"; };
    return img;
  }

  // ── Inject CSS ────────────────────────────────────────────

 function injectCSS() {
    if (document.getElementById("stv-styles-link")) return;

    const css = `
 /* ──── webkit-scrollbar ──── */ 
/* ──── стили скроллбара stv-grid ──── */
.stv-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)) !important;
    gap: 3px !important;
    padding: 8px !important;
    overflow-y: scroll !important;   /* scroll — не auto, CEF требует явного значения */
    flex: 1 !important;
    /* убираем scrollbar-color и scrollbar-width отсюда полностью */
}
.stv-grid::-webkit-scrollbar {
    width: 24px !important;
    background: transparent !important;
}
.stv-grid::-webkit-scrollbar-track {
    background: rgba(18, 58, 83, 0.2) !important;
    border-radius: 10px !important;
}
.stv-grid::-webkit-scrollbar-thumb {
    background-color: #59406e !important;
    border-radius: 10px !important;
    border: 2px solid rgb(77, 40, 99) !important;
    background-clip: padding-box !important;
}
.stv-grid::-webkit-scrollbar-thumb:hover {
        background-color: #714b8c !important;
        border: 2px solid #9e85ab !important;
  }
 /* ──── webkit-scrollbar ──── */


/* ──── SteamChat scroll ──── */
    .chatHistoryScroll::-webkit-scrollbar {
        width: 44px !important;
        background: #0c1b345c !important;
    }
    .chatHistoryScroll::-webkit-scrollbar-thumb {
        background-color: #59406e !important;
        border-radius: 15px !important;
    }
    .chatHistoryScroll::-webkit-scrollbar-thumb:hover {
        background-color: #714b8c !important;
        border: 2px solid #9e85ab !important;
    }
      /* ──── SteamChat scroll ──── */
      textarea.Focusable:hover  {
              background-color:rgb(15 98 12 / 39%) !important;
              box-shadow: inset 0px 0px 4px #000 !important;
              color: #e5d19a !important;
              border: 1px solidrgb(197, 162, 67) !important;
      }


      textarea.Focusable {
              background-color: #285688f5 !important;
              box-shadow: inset 0px 0px 4px #000 !important;
              color: #e5d19a !important;
              border: 1px solid #29b5b2 !important;
      }
      
      textarea.Focusable::-webkit-scrollbar {
          width: 25px !important;
          background: transparent !important;
      }
      textarea.Focusable::-webkit-scrollbar-thumb {
              background-color: #59406e !important;
              border-radius: 15px !important;
      }

      textarea.Focusable::-webkit-scrollbar-thumb:hover {
              background-color: #714b8c !important;
              border: 2px solid #9e85ab !important;
      }
      
    textarea.Focusable {
            background-color: #1f3d5d5e !important;
            box-shadow: inset 0px 0px 4px #000 !important;
            color: #e5d19a !important;
            border: 1px solid #29b5b2 !important;
      }

 /* ──── Trigger button ──── */
    #stv-open7tv-picker-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 75px !important;
      height: 44px !important;
      cursor: pointer !important;
      vertical-align: middle !important;
      flex-shrink: 0 !important;
      position: relative !important;
      z-index: 100 !important;
      margin: 0 4px !important;
      background: rgb(10 51 89) !important;
      border: 1px solid !important;
      color: rgb(51 237 229) !important;
      border-radius: 8px !important;
      transition: background 0.15s, border-color 0.15s !important;
      padding: 15px 12px !important;
    }
    #stv-open7tv-picker-btn:hover {
      background: rgb(177 130 34 / 59%) !important;
      border-color: rgb(255 212 100) !important;
    }
    #stv-open7tv-picker-btn.stv-open7tv-picker-btn-active {
      background: rgb(92, 17, 142) !important;
      border-color: rgb(80, 191, 235) !important;
      color: #fff !important;
    }

    /* ── Picker panel ── */
    #stv-picker {
      position: absolute !important;
      bottom: 100% !important;
      right: 0 !important;
      left: auto !important;
      flex-direction: column !important;
      width: 680px !important;
      max-height: 600px !important;
      box-shadow: rgba(0,0,0,0.65) 0 8px 32px !important;
      z-index: 99999 !important;
      margin-bottom: 6px !important;
      font-family: "Motiva Sans", Arial, sans-serif !important;
      background: rgb(44, 34, 57) !important;
      border: 1px solid rgba(255,255,255,0.15) !important;
      border-radius: 10px !important;
      overflow: hidden !important;
      animation: 0.14s ease stvIn !important;
    }
    @keyframes stvIn {
      from { opacity: 0; transform: translateY(6px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)  scale(1); }
    }

    /* ── Header ── */
    .stv-header {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      padding: 9px 11px 8px !important;
      border-bottom: 1px solid rgba(255,255,255,0.08) !important;
      flex-shrink: 0 !important;
    }
    .stv-title {
      font-size: 12px !important;
      font-weight: 700 !important;
      color: #64d2ff !important;
      letter-spacing: 0.5px !important;
      white-space: nowrap !important;
    }
 .stv-search {
    min-width: 0px !important;
    height: 25px !important;
    color: rgb(86 183 186) !important;
    font-size: 14px !important;
    flex: 1 1 0% !important;
    background: rgb(33 23 35) !important;
    border-width: 1px !important;
    border-style: solid !important;
    border-color: rgb(228 194 69 / 54%) !important;
    border-image: initial !important;
    border-radius: 5px !important;
    padding: 4px 8px !important;
    outline: none !important;
    transition: border-color 0.15s !important;
}
    .stv-search:focus {
       border-color: #64d2ff !important;
    }
    .stv-settings-btn, .stv-close {
      background: transparent !important;
      border: none !important;
      color: rgba(198,212,223,0.5) !important;
      font-size: 14px !important;
      cursor: pointer !important;
      padding: 0 4px !important;
      transition: color 0.15s !important;
    }
    .stv-settings-btn:hover, .stv-close:hover {
       color: #64d2ff !important; 
    }

    /* ── Grid ── */
    .stv-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)) !important;
      gap: 3px !important;
      padding: 8px !important;
      overflow-y: auto !important;
      flex: 1 !important;
      
    } 

    /* ── Set header strip ── */
    .stv-set-header {
      grid-column: 1 / -1 !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      padding: 5px 8px 5px 6px !important;
      margin: 4px 0 2px !important;
      background: rgba(100, 210, 255, 0.07) !important;
      border: 1px solid rgba(100, 210, 255, 0.18) !important;
      border-radius: 5px !important;
      cursor: pointer !important;
      user-select: none !important;
      transition: background 0.12s, border-color 0.12s !important;
    }
    .stv-set-header:hover {
      background: rgba(100, 210, 255, 0.14) !important;
      border-color: rgba(100, 210, 255, 0.35) !important;
    }
    .stv-set-arrow {
      font-size: 12px !important;
      color: #64d2ff !important;
      flex-shrink: 0 !important;
      transition: transform 0.15s !important;
      display: inline-block !important;
    }
    .stv-set-collapsed .stv-set-arrow {
      transform: rotate(-90deg) !important;
    }
    .stv-set-label-name {
      font-size: 14px !important;
      font-weight: 700 !important;
      color:rgb(255, 195, 105) !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 160px !important;
    }
    .stv-set-label-id {
      font-size: 14px !important;
      font-family: "Courier New", monospace !important;
      color: rgba(219, 180, 236, 0.9) !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
       max-width: 250px !important;
    }
    .stv-set-spacer { 
       flex: 1 !important;
     }

     
    /* Emote count badge */
    .stv-set-count {
      font-size: 10px !important;
      color: rgba(100,210,255,0.6) !important;
      background: rgba(100,210,255,0.1) !important;
      border-radius: 3px !important;
      padding: 1px 5px !important;
      flex-shrink: 0 !important;
      white-space: nowrap !important;
    }

    /* ── Emote item ── */
    .stv-item {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 3px !important;
      padding: 5px 3px !important;
      border-radius: 5px !important;
      cursor: pointer !important;
      border: 1px solid transparent !important;
      transition: background 0.1s !important;
      min-height: 68px !important;
      position: relative !important;
    }
    .stv-item:hover {
      background: rgba(255,255,255,0.09) !important;
      border-color: rgba(100,210,255,0.3) !important;
    }
    .stv-item:active { transform: scale(0.93) !important; }
    .stv-item img { width: 36px !important; height: 36px !important; object-fit: contain !important; }
    .stv-item span {
      font-size: 14px !important;
      color: rgb(241 243 193 / 78%) !important;
      text-align: center !important;
      word-break: break-all !important;
      line-height: 1.2 !important;
      max-width: 100% !important;
      display: -webkit-box !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
    }
    .stv-item:hover::before {
      content: "Shift-send as link" !important;
      position: absolute !important;
      bottom: 2px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      font-size: 11px !important;
      color: rgb(100,175,255) !important;
      background: rgba(0,0,0,0.85) !important;
      padding: 2px 5px !important;
      border-radius: 2px !important;
      white-space: nowrap !important;
      z-index: 1000 !important;
      pointer-events: none !important;
    }
    .stv-item.stv-zw { opacity: 0.75 !important; }
    .stv-item.stv-zw::after {
      content: "ZW" !important;
      position: absolute !important;
      top: 3px !important; right: 3px !important;
      font-size: 7px !important;
      color: #64d2ff !important;
      background: rgba(0,0,0,0.5) !important;
      border-radius: 2px !important;
      padding: 1px 2px !important;
    }

    /* ── Footer ── */
    .stv-footer {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
      padding: 7px 12px !important;
      border-top: 1px solid rgba(255,255,255,0.08) !important;
      flex-shrink: 0 !important;
    }
    .stv-nav {
      background: rgba(255,255,255,0.07) !important;
      border: 1px solid rgba(255,255,255,0.13) !important;
      border-radius: 4px !important;
      color: #c6d4df !important;
      cursor: pointer !important;
      padding: 3px 10px !important;
      font-size: 12px !important;
    }
    .stv-nav:hover { background: rgba(255,255,255,0.14) !important; }
    .stv-page {
      font-size: 11px !important;
      color: rgba(198,212,223,0.55) !important;
      min-width: 50px !important;
      text-align: center !important;
    }

    /* ── Inline emotes ── */
    .stv-emote-inline {
      height: 54px !important; width: auto !important;
      vertical-align: middle !important; margin: 0 1px !important;
      object-fit: contain !important;
    }
    .stv-emote-wrap {
      display: inline-block !important; position: relative !important;
      vertical-align: middle !important;
      width: 54px !important; height: 54px !important; margin: 0 1px !important;
    }
    .stv-emote-wrap .stv-emote-base {
      display: block !important; width: 100% !important; height: 100% !important;
      object-fit: contain !important; position: relative !important;
    }
    .stv-emote-wrap .stv-emote-overlay {
      position: absolute !important;
      top: 50% !important; left: 50% !important;
      transform: translate(-50%, -50%) !important;
      height: 54px !important; width: auto !important;
      margin: 0 !important; pointer-events: none !important; z-index: 2 !important;
    }

    /* ── Settings modal ── */
    #stv-settings-modal {
      position: fixed !important; top: 0 !important; left: 0 !important;
      width: 100% !important; height: 100% !important; z-index: 999999 !important;
    }
    .stv-settings-overlay {
      position: absolute !important; top: 0 !important; left: 0 !important;
      width: 100% !important; height: 100% !important; background: rgba(0,0,0,0.7) !important;
    }
    .stv-settings-panel {
      position: absolute !important; top: 50% !important; left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 480px !important; background: #1b2838 !important;
      border: 1px solid rgba(255,255,255,0.15) !important;
      border-radius: 10px !important; box-shadow: 0 12px 48px rgba(0,0,0,0.8) !important;
      font-family: "Motiva Sans", Arial, sans-serif !important;
    }
    .stv-settings-header {
      display: flex !important; align-items: center !important;
      justify-content: space-between !important;
      padding: 12px 16px !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    }
    .stv-settings-title { font-size: 14px !important; font-weight: 700 !important; color: #64d2ff !important; }
    .stv-settings-close {
      background: transparent !important; border: none !important;
      color: rgba(198,212,223,0.5) !important; font-size: 16px !important; cursor: pointer !important;
    }
    .stv-settings-body { padding: 16px !important; }
    .stv-input-row { display: flex !important; gap: 8px !important; margin-bottom: 12px !important; }
    #stv-set-input {
      flex: 1 !important; background: rgba(255,255,255,0.07) !important;
      border: 1px solid rgba(255,255,255,0.15) !important; border-radius: 5px !important;
      color: #c6d4df !important; font-size: 13px !important; padding: 8px !important;
    }
    #stv-add-set {
      background: #64d2ff !important; border: none !important; border-radius: 5px !important;
      color: #1b2838 !important; font-weight: 600 !important; padding: 8px 16px !important; cursor: pointer !important;
    }
    #stv-set-msg { font-size: 12px !important; margin-bottom: 12px !important; min-height: 18px !important; }
    #stv-set-list {
      list-style: none !important; padding: 0 !important; margin: 0 !important;
      max-height: 200px !important; overflow-y: auto !important;
    }
    #stv-set-list li {
      display: flex !important; flex-direction: column !important;
      align-items: stretch !important; position: relative !important;
      padding: 10px 50px 10px 10px !important;
      background: rgba(255,255,255,0.05) !important;
      border-radius: 5px !important; margin-bottom: 6px !important; gap: 4px !important;
    }
    .stv-set-name { font-size: 14px !important; font-weight: 600 !important; color: #64d2ff !important; }
    .stv-set-id   { font-size: 11px !important; color: rgba(198,212,223,0.5) !important; font-family: monospace !important; }
    .stv-remove-set {
      position: absolute !important; top: 8px !important; right: 8px !important;
      background: transparent !important; border: 1px solid rgba(255,0,0,0.3) !important;
      border-radius: 3px !important; color: #ff6b6b !important;
      font-size: 11px !important; padding: 4px 8px !important; cursor: pointer !important;
    }
    .stv-empty { color: rgba(198,212,223,0.35) !important; font-size: 12px !important; text-align: center !important; padding: 16px !important; }

    /* ── Steam textarea ── */
    .chatentry_chatEntryControls_3Ule3 {
      position: relative !important; display: flex !important; flex-direction: row !important;
      flex: 1 !important; background-color: #1b0826 !important;
      box-shadow: inset 0 0 4px #000 !important; outline: none !important;
      color: #cc8631 !important; border: 1px solid #29b5b2 !important; padding-right: 2px !important;
    }
    .chatentry_chatEntryControls_3Ule3::-webkit-scrollbar-thumb { background-color: #59406e !important; border-radius: 15px !important; }
    .chatentry_chatEntryControls_3Ule3::-webkit-scrollbar-thumb:hover { background-color: #714b8c !important; border: 2px solid #9e85ab !important; }
    textarea.chatentry_chatTextarea_113iu,
    textarea[class*='chatentry_chatTextarea'],
    textarea[class*='chatTextarea'] {
      background-color: #1f3d5d5e !important; box-shadow: inset 0 0 4px #000 !important;
      outline: none !important; color: #e5d19a !important; border: 1px solid #29b5b2 !important;
      padding-right: 2px !important; min-height: 90px !important; max-height: 560px !important;
      overflow-y: hidden !important; resize: none !important; transition: height 0.1s ease !important;
    }

    /* Per-set page navigation */
    .stv-set-nav {
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      flex-shrink: 0 !important;
    }
    .stv-set-nav-btn {
      background: rgba(100, 210, 255, 0.12) !important;
      border: 1px solid rgba(100, 210, 255, 0.25) !important;
      border-radius: 3px !important;
      color: #64d2ff !important;
      font-size: 14px !important;
      padding: 1px 6px !important;
      cursor: pointer !important;
      line-height: 1.4 !important;
      transition: background 0.1s !important;
      width: 40px;
      height: 32px;
    }
    .stv-set-nav-btn:hover:not(:disabled) {
      background: rgba(100, 210, 255, 0.25) !important;
    }
    .stv-set-nav-btn:disabled {
      opacity: 0.3 !important;
      cursor: default !important;
    }
  .stv-set-nav-label {
        font-size: 14px !important;
        color: rgb(240 217 99 / 83%) !important;
        min-width: 32px !important;
        text-align: center !important;
        white-space: nowrap !important;
  }
  `;

    // Метод 1: через blob (работает в CEF там где <style> не работает)
    try {
        const blob = new Blob([css], { type: "text/css" });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement("link");
        link.id   = "stv-styles-link";
        link.rel  = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
    } catch (e) {
        // Fallback на обычный <style>
        const style = document.createElement("style");
        style.id = "stv-styles-link";
        style.textContent = css;
        document.head.appendChild(style);
    }
}
  // ── AutoResize ────────────────────────────────────────────

  function setupAutoResize(textarea) {
    if (textarea.dataset.autoResizeEnabled === "true") return;
    const minHeight = 85;
    const maxHeight = 560;

    function resize() {
      textarea.style.height = "auto";
      let h = textarea.scrollHeight;
      if (h < minHeight)      { h = minHeight; }
      else if (h > maxHeight) { h = maxHeight; textarea.style.overflowY = "auto"; }
      else                    { textarea.style.overflowY = "hidden"; }
      textarea.style.height = h + "px";
    }

    textarea.addEventListener("input",  resize);
    textarea.addEventListener("change", resize);
    textarea.dataset.autoResizeEnabled = "true";
    resize();
  }

  // ── Observer ──────────────────────────────────────────────

  function startObserver() {
    let timer;
    new MutationObserver(function() {
      clearTimeout(timer);
      timer = setTimeout(function() {
        inject();
        renderEmotesInMessages();
        const textarea = getTextarea();
        if (textarea && textarea.dataset.autoResizeEnabled !== "true") setupAutoResize(textarea);
      }, 300);
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ── Init ──────────────────────────────────────────────────

  async function init() {
    // Migrate old string-array format → [{id, name}]
    const oldSets = getCustomSets();
    if (oldSets.length > 0 && typeof oldSets[0] === "string") {
      console.log("[7TV] Migrating old format...");
      const newSets = await Promise.all(
        oldSets.map(async id => ({ id, name: (await fetchSetOwner(id)) || id }))
      );
      saveCustomSets(newSets);
    }

    injectCSS();
    await loadEmotes();

    if (!inject()) {
      let tries = 0;
      const iv = setInterval(function() {
        if (inject() || ++tries > 40) clearInterval(iv);
      }, 500);
    }

    const textarea = getTextarea();
    if (textarea) setupAutoResize(textarea);

    renderEmotesInMessages();
    startObserver();
    setInterval(renderEmotesInMessages, 1000);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else
    init();

})();