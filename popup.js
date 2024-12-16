document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("tracked-sites-list");

  // Load tracked sites and display them
  function loadTrackedSites() {
    chrome.runtime.sendMessage({ action: "getTrackedSites" }, (trackedSites) => {
      list.innerHTML = ""; // Clear the list before updating
      trackedSites.forEach((site) => {
        addListItem(site);
      });
    });
  }

  // Add a list item for a tracked site
  function addListItem(site) {
    const li = document.createElement("li");

    // Create text content
    const siteText = document.createElement("span");
    siteText.textContent = site;

    // Fetch last visited URL for this site
    chrome.storage.local.get([`lastVisited_${site}`], (data) => {
      const lastVisited = data[`lastVisited_${site}`];
      if (lastVisited) {
        siteText.textContent = `${site} (Last visited: ${lastVisited})`;
      }

      // Make the site clickable
      siteText.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "openSite", siteUrl: site });
      });
    });

    li.appendChild(siteText);

    // Create delete button
    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = " 🗑️";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.color = "red";
    deleteBtn.style.marginLeft = "10px";

    // Handle delete click
    deleteBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage(
        { action: "deleteSite", siteUrl: site },
        () => {
          loadTrackedSites(); // Refresh the list after deletion
        }
      );
    });

    li.appendChild(deleteBtn);
    list.appendChild(li);
  }

  // Handle adding a new site
  document.getElementById("add-site").addEventListener("click", () => {
    const siteUrl = document.getElementById("site-url").value.trim();
    if (siteUrl) {
      // Send message to add the site
      chrome.runtime.sendMessage({ action: "addSite", siteUrl: siteUrl }, () => {
        loadTrackedSites(); // Refresh the list after adding a site
        document.getElementById("site-url").value = ""; // Clear input field
      });
    }
  });

  // Initial load of tracked sites
  loadTrackedSites();
});
