// popup.js

document.addEventListener("DOMContentLoaded", () => {
  // Load tracked sites and display them
  chrome.runtime.sendMessage({ action: "getTrackedSites" }, (trackedSites) => {
    const list = document.getElementById("tracked-sites-list");
    list.innerHTML = ""; // Clear the list before updating
    trackedSites.forEach((site) => {
      const li = document.createElement("li");
      li.textContent = site;

      // Fetch last visited URL for this site
      chrome.storage.local.get([`lastVisited_${site}`], (data) => {
        const lastVisited = data[`lastVisited_${site}`];
        if (lastVisited) {
          li.textContent = `${site} (Last visited: ${lastVisited})`;
        }

        // Make the site clickable
        li.addEventListener("click", () => {
          chrome.runtime.sendMessage({ action: "openSite", siteUrl: site });
        });
      });

      list.appendChild(li);
    });
  });

  // Handle adding a new site
  document.getElementById("add-site").addEventListener("click", () => {
    const siteUrl = document.getElementById("site-url").value;
    if (siteUrl) {
      // Send message to add the site
      chrome.runtime.sendMessage(
        { action: "addSite", siteUrl: siteUrl },
        () => {

          chrome.runtime.sendMessage(
            { action: "getTrackedSites" },
            (trackedSites) => {
              const list = document.getElementById("tracked-sites-list");
              const li = document.createElement("li");
              li.textContent = siteUrl;

              chrome.storage.local.get([`lastVisited_${siteUrl}`], (data) => {
                const lastVisited = data[`lastVisited_${siteUrl}`];
                if (lastVisited) {
                  li.textContent = `${siteUrl} (Last visited: ${lastVisited})`;
                }

                li.addEventListener("click", () => {
                  chrome.runtime.sendMessage({
                    action: "openSite",
                    siteUrl: siteUrl,
                  });
                });

                list.appendChild(li);

                document.getElementById("site-url").value = "";
              });
            }
          );
        }
      );
    }
  });
});
