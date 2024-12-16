// background.js

// Initialize the saved URLs if not already set
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("trackedSites", (data) => {
    if (!data.trackedSites) {
      chrome.storage.local.set({ trackedSites: [] }); // Empty list by default
    }
  });
});

// Listen for tab updates (navigation) to track the last visited URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.storage.local.get("trackedSites", (data) => {
      const trackedSites = data.trackedSites || [];
      trackedSites.forEach((site) => {
        if (tab.url.includes(site)) {
          // Save the last visited URL in storage for this site
          chrome.storage.local.set({ [`lastVisited_${site}`]: tab.url });
        }
      });
    });
  }
});

// Listen for tab closure to save the last visited URL if it's tracked
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.url) {
      chrome.storage.local.get("trackedSites", (data) => {
        const trackedSites = data.trackedSites || [];
        trackedSites.forEach((site) => {
          if (tab.url.includes(site)) {
            // Save the last visited URL when the tab is closed
            chrome.storage.local.set({ [`lastVisited_${site}`]: tab.url });
          }
        });
      });
    }
  });
});

// Add a new site to the tracked list
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addSite") {
    chrome.storage.local.get("trackedSites", (data) => {
      const trackedSites = data.trackedSites || [];
      if (!trackedSites.includes(message.siteUrl)) {
        trackedSites.push(message.siteUrl);
        chrome.storage.local.set({ trackedSites: trackedSites });
      }
    });
  }

  // Send back the list of tracked sites to the popup
  if (message.action === "getTrackedSites") {
    chrome.storage.local.get("trackedSites", (data) => {
      sendResponse(data.trackedSites || []);
    });
  }

  // Open the site directly when clicked from the popup
  if (message.action === "openSite") {
    chrome.tabs.create({ url: message.siteUrl });
  }

  // Ensure the response is asynchronous
  return true;
});
