<p align="center">
  <img src="logo.png" alt="Sarı Site Dark Mode" width="80">
</p>

<h1 align="center">🌙 Sarı Site Dark Mode</h1>

<p align="center">
  <a href="README.md">Türkçe</a> · English
</p>

A custom dark theme Chrome extension built for **Sahibinden.com** — Turkey's largest classifieds platform. Reduces eye strain and makes nighttime browsing comfortable.

## ✨ Features

- 🎨 **Comprehensive Dark Theme** — Compatible with all pages (search, listing details, messages, account, etc.)
- 🔄 **One-Click Toggle** — Instantly switch via the popup
- 🧠 **Smart Color Detection** — Automatically detects and converts inline styles and dynamic elements
- 🗺️ **Map Support** — Google Maps views are darkened using an invert filter
- 📊 **Chart Compatibility** — Supports chart libraries like Highcharts
- 🖼️ **Media Protection** — Images, videos, and SVGs remain untouched
- 💬 **Messaging Support** — Covers all messaging interfaces, including next-gen components (efes-*)
- ⚡ **MutationObserver** — Monitors dynamic DOM changes in real-time to maintain theme consistency

## 📦 Installation

1. [**⬇️ Download the project as ZIP**](https://github.com/LynXMaSTeR/SariSiteDarkMode/archive/refs/heads/main.zip) and extract it.

2. Open `chrome://extensions` in Chrome.

3. Enable **Developer mode** (toggle in the top-right corner).

4. Click **Load unpacked**.

5. Select the downloaded project folder.

6. The extension will appear in your browser toolbar. 🎉

## 🚀 Usage

1. Navigate to Sahibinden.com.
2. Click the extension icon in the browser toolbar.
3. Use the toggle in the popup to **enable** or **disable** dark mode.
4. Your preference is saved automatically — no page refresh needed.

## 📸 Screenshot

![Sarı Site Dark Mode](screenshot.png)

## 🛠️ Technologies

| Technology | Description |
|-----------|----------|
| **Chrome Extensions API (Manifest V3)** | Extension framework |
| **JavaScript (Vanilla)** | Content script & popup logic |
| **CSS** | Comprehensive dark theme styles |
| **Chrome Storage API** | User preference persistence |
| **MutationObserver API** | Real-time DOM change tracking |

## 📁 Project Structure

```
SariSiteDarkMode/
├── manifest.json        # Extension configuration
├── content.js           # Main content script injected into pages
├── popup.html           # Popup UI
├── popup.js             # Popup logic
├── logo.png             # Extension icon
└── styles/
    └── sahibinden.css   # Dark theme CSS rules (~1300 lines)
```

## 👨‍💻 Developer

**LynXMaSTeR**

## 📄 License

This project is licensed under the [MIT License](LICENSE).
