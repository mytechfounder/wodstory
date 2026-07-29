(function () {
  "use strict";

  const STORAGE_KEY = "wod_cookie_consent_v1";
  const ANALYTICS_SRC = "https://tools.dezigniacs.com/analytics/pixel/n2U8T9s9VSkF7574";

  function loadAnalytics() {
    if (document.querySelector('script[data-wod-analytics]')) return;
    const script = document.createElement("script");
    script.src = ANALYTICS_SRC;
    script.defer = true;
    script.dataset.wodAnalytics = "true";
    document.head.appendChild(script);
  }

  function getChoice() {
    try { return window.localStorage.getItem(STORAGE_KEY); }
    catch (_error) { return null; }
  }

  function saveChoice(choice) {
    try { window.localStorage.setItem(STORAGE_KEY, choice); }
    catch (_error) { /* The site still works when storage is blocked. */ }
  }

  const banner = document.createElement("section");
  banner.className = "wod-cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-labelledby", "wodCookieTitle");
  banner.innerHTML = `
    <h2 id="wodCookieTitle">Επιλογές απορρήτου</h2>
    <p>Χρησιμοποιούμε απαραίτητη τοπική αποθήκευση για να θυμόμαστε την επιλογή σου. Τα προαιρετικά analytics ενεργοποιούνται μόνο με τη συγκατάθεσή σου. <a href="cookies.html">Πολιτική cookies</a></p>
    <div class="wod-cookie-actions">
      <button type="button" data-cookie-choice="essential">Μόνο απαραίτητα</button>
      <button type="button" class="is-primary" data-cookie-choice="analytics">Αποδοχή analytics</button>
    </div>`;

  const settings = document.createElement("button");
  settings.type = "button";
  settings.className = "wod-cookie-settings";
  settings.textContent = "Ρυθμίσεις cookies";

  function showBanner() {
    if (!banner.isConnected) document.body.appendChild(banner);
    settings.classList.remove("is-visible");
  }

  function applyChoice(choice) {
    const previousChoice = getChoice();
    saveChoice(choice);
    if (choice === "analytics") loadAnalytics();
    banner.remove();
    settings.classList.add("is-visible");

    // Reload once when analytics consent is withdrawn so the third-party
    // script is removed immediately from the current document as well.
    if (previousChoice === "analytics" && choice === "essential") {
      window.location.reload();
    }
  }

  banner.addEventListener("click", function (event) {
    const button = event.target.closest("[data-cookie-choice]");
    if (button) applyChoice(button.dataset.cookieChoice);
  });
  settings.addEventListener("click", showBanner);
  document.body.appendChild(settings);

  const choice = getChoice();
  if (choice === "analytics") loadAnalytics();
  if (choice) settings.classList.add("is-visible");
  else showBanner();
})();
