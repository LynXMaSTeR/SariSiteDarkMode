// Developed by LynXMaSTeR

/**
 * Karanlık tema yapılandırma sabitleri.
 * CSS class adı ve tema renk paletini içerir.
 */
const DARK_CONFIG = {
  CLASS_NAME: 'sahibinden-dark-mode',
  COLORS: {
    DARK_BG: '#13151c',
    CARD_BG: '#1a1e2a',
    MESSAGE_CARD_BG: '#252833',
    ACCENT_BLUE: '#4da6ff',
    TEXT_MAIN: '#d1d1d6',
    TEXT_WHITE: '#ffffff',
    BORDER_SOFT: 'rgba(255,255,255,0.07)',
    BORDER_SUBTLE: 'rgba(255,255,255,0.05)'
  }
};

/** Dark mode uygulanmaması gereken HTML etiketleri (medya, SVG vb.) */
const SKIP_TAGS = new Set([
  'IMG', 'VIDEO', 'IFRAME', 'SVG', 'CANVAS', 'OBJECT', 'EMBED',
  'path', 'g', 'rect', 'circle', 'line', 'polygon', 'polyline', 'use', 'defs'
]);

let _observer = null;

// Initialization
chrome.storage.local.get({ darkModeEnabled: true }, (result) => {
  if (result.darkModeEnabled) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleDarkMode') {
    if (message.enabled) {
      enableDarkMode();
      setTimeout(fixComputedLightElements, 1500);
    } else {
      disableDarkMode();
    }
    sendResponse({ success: true });
  }
});

/** Karanlık modu etkinleştirir: CSS class ekler, inline stil düzeltici ve hover dinleyicileri başlatır */
function enableDarkMode() {
  document.documentElement.classList.add(DARK_CONFIG.CLASS_NAME);
  startInlineStyleFixer();
  addHoverListeners();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fixComputedLightElements();
      fixWhiteBorders();
    });
  } else {
    fixComputedLightElements();
    fixWhiteBorders();
  }

  window.addEventListener('load', () => {
    fixComputedLightElements();
    fixWhiteBorders();
    [800, 2000, 3500].forEach((delay) => {
      setTimeout(fixComputedLightElements, delay);
      if (delay <= 2000) setTimeout(fixWhiteBorders, delay);
    });
  }, { once: true });
}

/** Karanlık modu devre dışı bırakır */
function disableDarkMode() {
  document.documentElement.classList.remove(DARK_CONFIG.CLASS_NAME);
  stopInlineStyleFixer();
}

function isDarkActive() {
  return document.documentElement.classList.contains(DARK_CONFIG.CLASS_NAME);
}

/** Belirli bir elementin dark mode dönüşümünden hariç tutulup tutulmayacağını kontrol eder */
function isExcludedElement(el) {
  if (!el || SKIP_TAGS.has(el.tagName)) return true;
  if (el.matches && el.matches('.classifiedOtherBoxes')) return true;
  if (!el.closest) return false;
  return Boolean(
    el.closest('#colorbox, #cboxContent, .ui-dialog, [class*="lightbox"], [class*="Lightbox"], [class*="gallery"], [class*="Gallery"], [class*="slider"], [class*="Slider"], [class*="viewer"], [class*="Viewer"], [class*="photoViewer"], [class*="photo-viewer"], [class*="bigPhoto"], [class*="big-photo"], [class*="megaPhoto"], [class*="mega-photo"]') ||
    el.closest('[class*="damage"], [class*="Damage"], [class*="hasar"], [class*="Hasar"], [class*="damageMap"], [class*="damage-map"]') ||
    el.closest('#classified-location, .mapDetailsContainer, [class*="gm-style"], .classifiedOtherBoxes')
  );
}

/** Sayfadaki hesaplanmış (computed) açık arka planlı elementleri karanlık temaya dönüştürür */
function fixComputedLightElements() {
  if (!isDarkActive()) return;
  document.querySelectorAll('*').forEach((el) => {
    try {
      if (isExcludedElement(el)) return;

      const compStyle = window.getComputedStyle(el);
      if (!compStyle) return;

      const bg = compStyle.backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return;

      if (isLightRgb(bg)) {
        const r = el.getBoundingClientRect();
        if (r.width >= 20 && r.height >= 8) {
          const targetDark = (el.classList.contains('message-card-by-person') || el.closest('efes-message-card-by-person'))
            ? DARK_CONFIG.COLORS.MESSAGE_CARD_BG
            : DARK_CONFIG.COLORS.CARD_BG;

          el.style.setProperty('background-color', targetDark, 'important');
          el.style.setProperty('border-color', DARK_CONFIG.COLORS.BORDER_SUBTLE, 'important');

          el.querySelectorAll('*').forEach((child) => {
            try {
              if (SKIP_TAGS.has(child.tagName)) return;
              const childStyle = window.getComputedStyle(child);
              if (!childStyle) return;
              const childColor = childStyle.color;
              if (childColor) {
                const m = childColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
                if (m) {
                  const rC = parseInt(m[1], 10), gC = parseInt(m[2], 10), bC = parseInt(m[3], 10);
                  if (rC < 120 && gC < 120 && bC < 120 && Math.abs(rC - gC) < 25 && Math.abs(gC - bC) < 25) {
                    child.style.setProperty('color', DARK_CONFIG.COLORS.TEXT_WHITE, 'important');
                  }
                }
              }
            } catch (e) {}
          });
        }
      }
    } catch (e) {}
  });
}

/** Açık renkli border'ları karanlık temaya uygun hale getirir */
function fixWhiteBorders() {
  if (!isDarkActive()) return;
  const sides = ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
  document.querySelectorAll('*').forEach((el) => {
    try {
      if (isExcludedElement(el)) return;
      const style = window.getComputedStyle(el);
      if (!style) return;
      sides.forEach((side) => {
        const color = style[side];
        if (!color) return;
        if (isLightRgb(color) && color !== 'rgba(0, 0, 0, 0)') {
          const prop = side.replace(/([A-Z])/g, '-$1').toLowerCase();
          el.style.setProperty(prop, DARK_CONFIG.COLORS.BORDER_SOFT, 'important');
        }
      });
    } catch (e) {}
  });
}

/** Sayfa üzerindeki overlay/popup gibi fixed/absolute elementleri karanlık temaya dönüştürür */
function fixOverlays() {
  if (!isDarkActive()) return;

  document.querySelectorAll('*').forEach((el) => {
    try {
      if (isExcludedElement(el)) return;
      if (el.className && typeof el.className === 'string' &&
          (el.className.includes('megaPhoto') || el.className.includes('mega-photo'))) return;

      const style = window.getComputedStyle(el);
      if (!style) return;
      const pos = style.position;
      if (pos !== 'fixed' && pos !== 'absolute') return;

      const zIndex = parseInt(style.zIndex, 10) || 0;
      if (zIndex <= 0) return;

      const bg = style.backgroundColor;
      const isTransparentBg = (bg === 'rgba(0, 0, 0, 0)');

      if (isTransparentBg || isLightRgb(bg)) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 60 && rect.height > 60) {
          el.style.setProperty('background-color', DARK_CONFIG.COLORS.CARD_BG, 'important');
          el.style.setProperty('color', DARK_CONFIG.COLORS.TEXT_MAIN, 'important');
          el.querySelectorAll('*').forEach((child) => {
            try {
              if (SKIP_TAGS.has(child.tagName)) return;
              const childStyle = window.getComputedStyle(child);
              if (!childStyle) return;
              if (isTransparentBg) {
                const childBg = childStyle.backgroundColor;
                if (childBg !== 'rgba(0, 0, 0, 0)' && isLightRgb(childBg)) {
                  child.style.setProperty('background-color', DARK_CONFIG.COLORS.MESSAGE_CARD_BG, 'important');
                }
              }
              const childColor = childStyle.color;
              if (childColor && !isLightColor(childColor)) {
                child.style.setProperty('color', DARK_CONFIG.COLORS.TEXT_MAIN, 'important');
              }
            } catch (e) {}
          });
        }
      }
    } catch (e) {}
  });
}

/** Verilen kök element altındaki inline style ile belirlenmiş açık arka planları düzeltir */
function fixInlineStyles(root) {
  const els = root.querySelectorAll ? root.querySelectorAll('[style]') : [];
  els.forEach((el) => {
    if (!el.style) return;
    if (isExcludedElement(el)) return;

    const bg = el.style.backgroundColor || el.style.background;
    if (bg && isLightColor(bg)) {
      const targetDark = (el.classList.contains('message-card-by-person') || (el.closest && el.closest('efes-message-card-by-person')))
        ? DARK_CONFIG.COLORS.MESSAGE_CARD_BG
        : DARK_CONFIG.COLORS.DARK_BG;

      el.style.setProperty('background-color', targetDark, 'important');
      if (el.style.background && isLightColor(el.style.background)) {
        el.style.setProperty('background', 'none', 'important');
      }
    }
  });
}

/** Sahibinden.com'a özgü DOM yapılarını (arama özeti, mesaj sekmeleri, menüler vb.) düzeltir */
function fixSpecifics() {
  try {
    const texts = document.evaluate(
      "//text()[contains(., 'aramanızda') or contains(., 'bulundu')]",
      document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
    );
    for (let i = 0; i < texts.snapshotLength; i++) {
      const node = texts.snapshotItem(i);
      if (node.parentElement && node.parentElement.tagName !== 'STYLE' && node.parentElement.tagName !== 'SCRIPT') {
        node.parentElement.style.setProperty('color', DARK_CONFIG.COLORS.TEXT_MAIN, 'important');
        if (node.parentElement.parentElement) {
          node.parentElement.parentElement.style.setProperty('color', DARK_CONFIG.COLORS.TEXT_MAIN, 'important');
        }
      }
    }

    try {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        const txt = node.nodeValue.trim();
        if (txt === 'Soru-Cevap' || txt === 'Soru - Cevap' || txt === 'Mesajlar') {
          const p = node.parentElement;
          if (p && p.tagName !== 'STYLE' && p.tagName !== 'SCRIPT' && !p.classList.contains('antigravity-forced-white')) {
            const c = window.getComputedStyle(p).color || '';
            const isBlue = c.includes('rgb(77, 166, 255)') || c.includes('rgb(0, 102, 204)') || p.className.includes('active') || p.className.includes('selected');

            if (!isBlue) {
              p.style.cssText += 'color: #ffffff !important; opacity: 1 !important;';
              p.classList.add('antigravity-forced-white');
              p.id = 'ag-forced-white-container';
              if (p.parentElement) {
                p.parentElement.style.cssText += 'color: #ffffff !important; opacity: 1 !important;';
                p.parentElement.classList.add('antigravity-forced-white');
              }
            } else {
              p.style.cssText += 'color: #4da6ff !important; opacity: 1 !important;';
              p.classList.add('antigravity-forced-white');
            }
          }
        }
      }
    } catch (e) {}

    try {
      document.querySelectorAll('.favorite-list-popup, .wishlist-popup, .ui-dialog, .modal, #colorbox, #cboxContent, [role="dialog"]').forEach((popup) => {
        popup.style.setProperty('background-color', DARK_CONFIG.COLORS.CARD_BG, 'important');
        popup.querySelectorAll('*').forEach((child) => {
          if (SKIP_TAGS.has(child.tagName)) return;
          const cStyle = window.getComputedStyle(child);
          if (cStyle) {
            const cColor = cStyle.color;
            if (cColor && (cColor.includes('rgb(51, 51, 51)') || cColor.includes('rgb(0, 0, 0)') || cColor.includes('rgb(34, 34, 34)'))) {
              child.style.setProperty('color', DARK_CONFIG.COLORS.TEXT_MAIN, 'important');
            }
          }
        });
      });
    } catch (e) {}

    document.querySelectorAll('ul').forEach((ul) => {
      const txt = ul.innerText || '';
      if ((txt.includes('Anasayfa') && txt.includes('Vasıta')) || (txt.includes('Tümü') && txt.includes('Sahibinden'))) {
        let target = ul;
        if (ul.parentElement && ul.parentElement.tagName === 'DIV') target = ul.parentElement;
        target.style.setProperty('background-color', '#161820', 'important');
        target.style.setProperty('border', `1px solid ${DARK_CONFIG.COLORS.BORDER_SOFT}`, 'important');
        target.style.setProperty('border-radius', '6px', 'important');

        if (txt.includes('Anasayfa')) {
          ul.querySelectorAll('a, span, li').forEach((child) => {
            child.style.setProperty('color', '#8b8fa8', 'important');
          });
        }
      }
    });

    document.querySelectorAll('ul, div, dl').forEach((el) => {
      const style = window.getComputedStyle(el);
      if (!style) return;
      if (style.backgroundColor === 'rgba(0, 0, 0, 0)') {
        const isOverlay = style.position === 'absolute' || style.position === 'fixed';
        const isMenu = (el.className && typeof el.className === 'string' && (el.className.toLowerCase().includes('menu') || el.className.toLowerCase().includes('drop') || el.className.toLowerCase().includes('select'))) || (el.tagName === 'UL' && el.querySelector('li'));

        if (isOverlay && isMenu) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 20 && rect.height > 20 && rect.height < 1000 && rect.width < 800) {
            el.style.setProperty('background-color', DARK_CONFIG.COLORS.CARD_BG, 'important');
            el.style.setProperty('border', '1px solid rgba(255,255,255,0.1)', 'important');
            el.querySelectorAll('*').forEach((child) => {
              if (SKIP_TAGS.has(child.tagName)) return;
              child.style.setProperty('background-color', 'transparent', 'important');
              child.style.setProperty('color', DARK_CONFIG.COLORS.TEXT_MAIN, 'important');
            });
          }
        }
      }
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const toFix = new Set();
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim().length > 0) {
        const p = node.parentElement;
        if (p && !SKIP_TAGS.has(p.tagName) && p.tagName !== 'STYLE' && p.tagName !== 'SCRIPT') {
          if (!p.closest('[class*="damage"], [class*="hasar"]')) {
            toFix.add(p);
          }
        }
      }
    }

    toFix.forEach((p) => {
      const cStyle = window.getComputedStyle(p);
      if (cStyle) {
        const color = cStyle.color;
        if (color) {
          const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
          if (m) {
            const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
            const luma = (r * 299 + g * 587 + b * 114) / 1000;
            if (luma < 100 && !p.classList.contains('antigravity-forced-white')) {
              p.style.setProperty('color', DARK_CONFIG.COLORS.TEXT_MAIN, 'important');
              p.classList.add('antigravity-forced-white');
            }
          }
        }
      }
    });
  } catch (e) {}
}

/** MutationObserver ile inline stil değişikliklerini izler ve dinamik olarak düzeltir */
function startInlineStyleFixer() {
  if (_observer) return;
  fixInlineStyles(document.documentElement);
  fixOverlays();
  fixSpecifics();

  _observer = new MutationObserver((mutations) => {
    let needsScan = false;
    mutations.forEach((m) => {
      if (m.type === 'attributes' && m.attributeName === 'style') {
        const el = m.target;
        if (!isExcludedElement(el)) {
          const bg = el.style.backgroundColor || el.style.background;
          if (bg && isLightColor(bg)) {
            const targetDark = (el.classList.contains('message-card-by-person') || (el.closest && el.closest('efes-message-card-by-person')))
              ? DARK_CONFIG.COLORS.MESSAGE_CARD_BG
              : DARK_CONFIG.COLORS.DARK_BG;
            el.style.setProperty('background-color', targetDark, 'important');
            if (el.style.background && isLightColor(el.style.background)) {
              el.style.setProperty('background', 'none', 'important');
            }
          }
        }
      } else if (m.type === 'childList') {
        needsScan = true;
      }
    });
    if (needsScan) {
      setTimeout(() => {
        fixComputedLightElements();
        fixWhiteBorders();
        fixOverlays();
        fixSpecifics();
      }, 50);
    }
  });

  _observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    childList: true,
    subtree: true
  });
}

/** MutationObserver'ı durdurur */
function stopInlineStyleFixer() {
  if (_observer) {
    _observer.disconnect();
    _observer = null;
  }
}

/** Hover ve click event listener'larını ekler (karanlık temada etkileşim düzeltmeleri) */
function addHoverListeners() {
  document.addEventListener('mouseover', (e) => {
    if (!isDarkActive()) return;
    const el = e.target.closest('a, button, li, .btn, [role="button"], tr.searchResultsItem');
    if (!el || SKIP_TAGS.has(el.tagName)) return;

    if (el.classList.contains('message-card-by-person')) return;

    const bg = window.getComputedStyle(el).backgroundColor;
    if (bg && isLightRgb(bg) && bg !== 'rgba(0, 0, 0, 0)') {
      if (!el.hasAttribute('data-orig-bg')) {
        el.setAttribute('data-orig-bg', el.style.backgroundColor || '');
      }
      el.style.setProperty('background-color', DARK_CONFIG.COLORS.MESSAGE_CARD_BG, 'important');
      el.classList.add('ag-hover-active');
    } else if (el.classList.contains('searchResultsItem')) {
      if (!el.hasAttribute('data-orig-bg')) {
        el.setAttribute('data-orig-bg', el.style.backgroundColor || '');
      }
      el.style.setProperty('background-color', DARK_CONFIG.COLORS.MESSAGE_CARD_BG, 'important');
      el.classList.add('ag-hover-active');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (!isDarkActive()) return;
    const el = e.target.closest('.ag-hover-active');
    if (el) {
      el.classList.remove('ag-hover-active');
      const origBg = el.getAttribute('data-orig-bg');
      if (origBg !== null) {
        if (origBg === '') {
          el.style.removeProperty('background-color');
        } else {
          el.style.setProperty('background-color', origBg);
        }
        el.removeAttribute('data-orig-bg');
      }
    }
  });

  document.addEventListener('click', () => {
    if (!isDarkActive()) return;
    [50, 300, 800].forEach((delay) => setTimeout(fixSpecifics, delay));
  });
}

/** Verilen renk string'inin (rgb, hex, isim) açık renk olup olmadığını kontrol eder */
function isLightColor(str) {
  if (!str) return false;
  str = str.toLowerCase();
  if (str === 'transparent' || str === 'none') return false;
  if (str.startsWith('rgb')) return isLightRgb(str);
  if (str.startsWith('#')) return isLightHex(str);
  return str === 'white';
}

/** RGB string'inden luma hesaplayarak açık renk kontrolü yapar (eşik: 195) */
function isLightRgb(s) {
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return false;
  const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
  return (r * 299 + g * 587 + b * 114) / 1000 > 195;
}

/** HEX renk kodundan luma hesaplayarak açık renk kontrolü yapar (eşik: 195) */
function isLightHex(s) {
  s = s.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  if (s.length !== 6) return false;
  const r = parseInt(s.substr(0, 2), 16);
  const g = parseInt(s.substr(2, 2), 16);
  const b = parseInt(s.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 195;
}

