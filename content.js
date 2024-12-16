// content.js

chrome.storage.local.get("lastVisited", (data) => {
  if (data.lastVisited) {
    console.log("Last visited URL:", data.lastVisited);
  }
});
