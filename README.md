# 🧩 7TV Emotes for Steam Chat

> A Chrome extension that brings **7TV emote picker** directly into Steam web chat — with real-time rendering and custom emote set support.

![Version](https://img.shields.io/badge/version-1.0.2-blueviolet?style=flat-square)
![Manifest](https://img.shields.io/badge/Manifest-V3-blue?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Chrome%20%2F%20Chromium-yellow?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
[![Download](https://img.shields.io/badge/Download-v1.0.2-brightgreen?style=flat-square&logo=github)](https://github.com/ftpobpl47hGTN56/7tv-emotes-steam-chat/releases/download/v1.0.2/1.0.2.steam-chat-7tv-emotes.zip)

---

## ✨ Features

- 🎭 **Emote Picker** — inline button inside Steam chat textarea
- 🌐 **Global 7TV emotes** — loaded automatically via `7tv.io` API
- 🔧 **Custom emote sets** — add your own 7TV set IDs via the popup
- 🖼️ **Inline rendering** — emote codes are replaced with images in real time
- ⚡ **Zero-width emote support** — rendered as overlays, just like on Twitch/Kick
- 📋 **Clipboard fallback** — if textarea isn't found, emote code is copied to clipboard



## 🧩 Installation (unpacked / developer mode)

> The extension is **not yet on the Chrome Web Store**. Install it manually:

1. Download or clone this repository:
   ```bash
   git clone https://github.com/ftpobpl47hGTN56/7tv-emotes-steam-chat.git
   ```

2. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **"Load unpacked"** and select the `steam-7tv-emotes/` folder

5. Open [Steam Web Chat](https://steamcommunity.com/chat) — the 7TV button will appear in the chat input area

---

## ⚙️ Usage

### Adding a custom emote set

1. Click the extension icon in the Chrome toolbar
2. In the popup, paste your **7TV Set ID**
   - Find it in the URL on `7tv.app/emote-sets/YOUR_SET_ID`
3. Click **Save** — the set will load automatically on next page visit

### Using emotes

- Click the **7TV button** (🟣) next to the chat input
- Search for an emote by name
- Click an emote to insert it into the chat
- Hit **Enter** to send — the emote code will render as an image

---

## 📁 Project Structure

```
steam-7tv-emotes/
├── manifest.json          # Chrome Extension Manifest V3
├── content.js             # Main logic: emote picker + inline rendering
├── content.css            # Styles for the picker UI
├── popup.html             # Extension popup (set ID manager)
├── popup.js               # Popup logic
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── stv-picker-7tvemt-bttn.svg
└── userscript for Steam Desktop - in SPF_UI exe/
    └── friends.custom.js  # Userscript for Steam Desktop app (CEF)
```

---
---

## 📸 Screenshots
>   <img width="996" height="811" alt="image" src="https://github.com/user-attachments/assets/c07acfc1-f154-4178-8cd3-8cc4fc425e8c" />

>   <img width="814" height="356" alt="image" src="https://github.com/user-attachments/assets/9cda0917-a14c-4f28-9bc6-c010c1daecc9" />

>   <img width="626" height="552" alt="image" src="https://github.com/user-attachments/assets/4cce857e-8ebd-41cf-a1d7-9c07314865b5" />

>  <img width="1319" height="860" alt="image" src="https://github.com/user-attachments/assets/75b0305c-0e7b-4597-88a9-9f623d363d27" />

>   <img width="900" height="601" alt="image" src="https://github.com/user-attachments/assets/61d740d5-404c-4c4e-983d-6120a9ce2272" />

---

## 🖥️ Userscript (Steam Desktop App)

For the **Steam desktop app** (which uses Chromium Embedded Framework), a separate userscript is included in:

```
userscript for Steam Desktop - in SPF_UI exe/friends.custom.js
```

This file can be injected via Steam's `SPF_UI` or similar CEF patching tools.

---

## 🔌 API Used

| Service | Endpoint |
|--------|----------|
| 7TV Global Emotes | `https://7tv.io/v3/emote-sets/global` |
| 7TV Custom Set | `https://7tv.io/v3/emote-sets/{id}` |
| 7TV CDN | `https://cdn.7tv.app/emote/{id}/1x.webp` |

---

## 🛠️ Development

To modify and test the extension locally:

1. Edit `content.js` or `popup.js` as needed
2. Go to `chrome://extensions/`
3. Click the **refresh icon** on the extension card
4. Reload Steam chat tab

No build step required — this is a plain JS / MV3 extension.

---

## 🤝 Contributing

Pull requests are welcome! If you find a bug or want to suggest a feature:

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add: your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a **Pull Request**

---

## 📜 License

[MIT](LICENSE) — free to use, modify, and distribute.

---

## 📜 Credits

- [7TV](https://7tv.app) — emote platform and API
- [Steam](https://store.steampowered.com) — chat platform
