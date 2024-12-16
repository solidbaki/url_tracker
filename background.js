chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("trackedSites", (data) => {
    if (!data.trackedSites) {
      chrome.storage.local.set({ trackedSites: [] });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.storage.local.get("trackedSites", (data) => {
      const trackedSites = data.trackedSites || [];
      trackedSites.forEach((site) => {
        if (tab.url.includes(site)) {
          chrome.storage.local.set({ [`lastVisited_${site}`]: tab.url });
        }
      });
    });
  }
});

// when tab closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.url) {
      chrome.storage.local.get("trackedSites", (data) => {
        const trackedSites = data.trackedSites || [];
        trackedSites.forEach((site) => {
          if (tab.url.includes(site)) {
            chrome.storage.local.set({ [`lastVisited_${site}`]: tab.url });
          }
        });
      });
    }
  });
});

// add new url
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addSite") {
    chrome.storage.local.get("trackedSites", (data) => {
      const trackedSites = data.trackedSites || [];
      if (!trackedSites.includes(message.siteUrl)) {
        trackedSites.push(message.siteUrl);
        chrome.storage.local.set({ trackedSites: trackedSites });
      }
    });
    sendResponse({ success: true });
  }

  if (message.action === "getTrackedSites") {
    chrome.storage.local.get("trackedSites", (data) => {
      sendResponse(data.trackedSites || []);
    });
  }

  if (message.action === "openSite") {
    chrome.tabs.create({ url: message.siteUrl });
  }

  // delete url
  if (message.action === "deleteSite") {
    chrome.storage.local.get("trackedSites", (data) => {
      let trackedSites = data.trackedSites || [];
      trackedSites = trackedSites.filter((site) => site !== message.siteUrl); 
      chrome.storage.local.set({ trackedSites: trackedSites }, () => {
        chrome.storage.local.remove(`lastVisited_${message.siteUrl}`, () => {
          sendResponse({ success: true });
        });
      });
    });
    return true; 
  }

  return true;
});
