// Developed by LynXMaSTeR

const STATUS_CONFIG = {
  ACTIVE_TEXT: 'Aktif',
  INACTIVE_TEXT: 'Pasif',
  ACTIVE_COLOR: '#4cd964',
  INACTIVE_COLOR: '#a0a0ab'
};

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('darkModeToggle');
  const statusDesc = document.getElementById('statusDesc');

  chrome.storage.local.get({ darkModeEnabled: true }, (result) => {
    toggle.checked = result.darkModeEnabled;
    updateStatusText(result.darkModeEnabled);
  });

  toggle.addEventListener('change', () => {
    const isEnabled = toggle.checked;
    
    chrome.storage.local.set({ darkModeEnabled: isEnabled }, () => {
      updateStatusText(isEnabled);
      
      chrome.tabs.query({ url: "*://*.sahibinden.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'toggleDarkMode',
            enabled: isEnabled
          }).catch(() => {});
        });
      });
    });
  });

  function updateStatusText(enabled) {
    statusDesc.textContent = enabled ? STATUS_CONFIG.ACTIVE_TEXT : STATUS_CONFIG.INACTIVE_TEXT;
    statusDesc.style.color = enabled ? STATUS_CONFIG.ACTIVE_COLOR : STATUS_CONFIG.INACTIVE_COLOR;
  }
});
