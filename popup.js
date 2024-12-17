document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("tracked-sites-list");

  function loadTrackedSites() {
    chrome.runtime.sendMessage({ action: "getTrackedSites" }, (trackedSites) => {
      list.innerHTML = ""; 
      trackedSites.forEach((site) => {
        addListItem(site);
      });
    });
  }

  function addListItem(site) {
    const li = document.createElement("li");

    const siteText = document.createElement("span");
    siteText.textContent = site;

    chrome.storage.local.get([`lastVisited_${site}`], (data) => {
      const lastVisited = data[`lastVisited_${site}`];
      if (lastVisited) {
        siteText.textContent = `${lastVisited}`;
      }

      siteText.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "openSite", siteUrl: lastVisited });
      });
    });

    li.appendChild(siteText);

    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = " 🗑️";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.color = "red";
    deleteBtn.style.marginLeft = "10px";

    deleteBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage(
        { action: "deleteSite", siteUrl: site },
        () => {
          loadTrackedSites();
        }
      );
    });

    li.appendChild(deleteBtn);
    list.appendChild(li);
  }

  document.getElementById("add-site").addEventListener("click", () => {
    const siteUrl = document.getElementById("site-url").value.trim();
    if (siteUrl) {
      chrome.runtime.sendMessage({ action: "addSite", siteUrl: siteUrl }, () => {
        loadTrackedSites(); 
        document.getElementById("site-url").value = ""; 
      });
    }
  });

  loadTrackedSites();
});
