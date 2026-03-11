// content.js

// ============================================================
//  Steam 7TV Emote Picker — content.js  (v7)
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
  let collapsedSets = new Set();  // set IDs that are folded
  let setPages      = new Map();  // setId → current page index

  // flat array for search
  let allEmotes = [];
  let filtered  = [];
  let page      = 0;
  let open      = false;
  let picker    = null;
  let btn       = null;
  let query     = "";

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
    if (!ta) { navigator.clipboard.writeText(text).catch(() => {}); return; }
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
    try {
      const stored     = await chrome.storage.local.get("customSetIds");
      const customSets = stored.customSetIds || [];
      for (const item of customSets) {
        const id    = typeof item === "string" ? item    : item.id;
        const label = typeof item === "object"  ? item.name : null;
        urls.push({ url: CUSTOM_API + id, label });
      }
    } catch {}

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
      "[7TV Steam] Loaded", allEmotes.length, "emotes across", allSets.length, "sets",
      "(ZW:", allEmotes.filter(e => e.zeroWidth).length + ")"
    );
  }

  // ── Picker UI ─────────────────────────────────────────────

  function buildPicker() {
    const el = document.createElement("div");
    el.id = "stv-picker";
    el.innerHTML = `
      <div class="stv-header">
        <span class="stv-title">7TV</span>
        <input class="stv-search" type="text" placeholder="Поиск…" />
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
    item.title = emote.name + (emote.zeroWidth ? " (overlay)" : "") + " | Shift+send as link";

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
      const text = e.shiftKey ? CDN + emote.id + "/2x.png" : emote.name;
      insertText(text);
      if (e.shiftKey) togglePicker(false);
    }, true);

    return item;
  }

  // ── Set section: header strip + paginated emotes ─────────
  //
  //  Header layout:
  //    ▾  SetName  setId  [spacer]  [◀ 1/12 ▶]  [count]
  //
  //  Clicking the header (outside the ◀▶ nav) toggles collapse.
  //  Clicking ◀/▶ moves that set's page and re-renders.

  function makeSetSection(set) {
    const frag = document.createDocumentFragment();

    const curPage     = setPages.get(set.id) || 0;
    const totalPages  = Math.ceil(set.emotes.length / SET_PAGE_SIZE);
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

    // Per-set page navigation
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

    // Toggle collapse — skip clicks that landed on the nav
    header.addEventListener("mousedown", function(e) {
      if (e.target.closest(".stv-set-nav")) return;
      e.preventDefault(); e.stopPropagation();
      collapsedSets.has(set.id) ? collapsedSets.delete(set.id) : collapsedSets.add(set.id);
      renderPage();
    }, true);

    frag.appendChild(header);

    // ── Emote slice (current page only) ──
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
      // ── Set view ──
      if (prevBtn) prevBtn.style.visibility = "hidden";
      if (nextBtn) nextBtn.style.visibility = "hidden";
      if (pinfo)   pinfo.textContent = allEmotes.length + " emotes";

      allSets.forEach(set => frag.appendChild(makeSetSection(set)));

    } else {
      // ── Search view (flat + paginated) ──
      if (prevBtn) prevBtn.style.visibility = "visible";
      if (nextBtn) nextBtn.style.visibility = "visible";

      const start = page * PAGE_SIZE;
      const slice = filtered.slice(start, start + PAGE_SIZE);
      const total = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (pinfo) pinfo.textContent = (page + 1) + " / " + total + " (" + filtered.length + ")";

      slice.forEach(emote => frag.appendChild(makeEmoteItem(emote)));
    }

    const savedScroll = grid.scrollTop;  // ← save before wipe
    grid.innerHTML = "";
    grid.appendChild(frag);
    grid.scrollTop = savedScroll;        // ← restore after render
  }

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

  // ── AutoResize ────────────────────────────────────────────

  function setupAutoResize(textarea) {
    if (textarea.dataset.autoResizeEnabled === "true") return;
    const minHeight = 80;
    const maxHeight = 542;

    function resize() {
      textarea.style.height = minHeight + "px";
      let h = textarea.scrollHeight;
      if (h < minHeight)      { h = minHeight; }
      else if (h > maxHeight) { h = maxHeight; textarea.style.overflowY = "auto"; }
      else                    { textarea.style.overflowY = "hidden"; }
      textarea.style.height = h + "px";
    }

    textarea.addEventListener("input",  resize);
    textarea.addEventListener("change", resize);
    textarea.addEventListener("keydown", function(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        setTimeout(() => { textarea.style.height = minHeight + "px"; textarea.style.overflowY = "hidden"; }, 50);
      }
    });

    textarea.dataset.autoResizeEnabled = "true";
    resize();
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
    btn.id        = "stv-open7tv-picker-btn";
    btn.type      = "button";
    btn.title     = "7TV Emote Picker";
    btn.innerHTML = `<img src="${chrome.runtime.getURL("icons/stv-picker-7tvemt-bttn.svg")}" alt="7TV" />`;
    btn.addEventListener("mousedown", function(e) {
      e.preventDefault(); e.stopPropagation();
      togglePicker();
    }, true);

    picker = buildPicker();
    picker.style.display = "none";

    ta.insertAdjacentElement("afterend", btn);
    ta.insertAdjacentElement("afterend", picker);

    console.log("[7TV Steam] Injected ✅");
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
      const tokens  = rawText.split(/(\s+)/);
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
      nodes.forEach(function(node) {
        if (node.type === "text") { span.appendChild(document.createTextNode(node.value)); return; }
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
    await loadEmotes();
    if (!inject()) {
      let tries = 0;
      const iv = setInterval(function() {
        if (inject() || ++tries > 40) clearInterval(iv);
      }, 500);
    }
    renderEmotesInMessages();
    startObserver();
    setInterval(renderEmotesInMessages, 1000);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else
    init();

})();