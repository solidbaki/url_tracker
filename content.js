chrome.storage.local.get("trackedSites", (data) => {
  const trackedSites = data.trackedSites || [];
  const currentUrl = window.location.href;

  const matchedSite = trackedSites.find((site) => currentUrl.includes(site));

  if (matchedSite) {
    chrome.storage.local.set({ [`lastVisited_${matchedSite}`]: currentUrl }, () => {
      console.log(`Updated last visited for ${matchedSite}: ${currentUrl}`);
    });
  }
});
