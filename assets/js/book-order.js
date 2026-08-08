(function () {
  "use strict";

  /*
   * BOOK ORDER SETTINGS — edit only the values below.
   * url: Paste the final order URL between the quotes.
   * icon: Replace the SVG file or change its path here.
   * iconSize: Change the number (pixels) to make each icon larger or smaller.
   * enabled: Use true to enable an option and false to keep it visible but disabled.
   * visible: Use false to hide an option without deleting its settings.
   */
  const ORDER_OPTIONS = [
    {
      label: "Αγορά από Public",
      note: "Διαθέσιμο για παραγγελία",
      url: "https://lxbgvx.short.gy/public",
      icon: "assets/images/optimized/ui/public-112.webp",
      iconSize: 28,
      enabled: true,
      visible: true,
      recommended: true
    },
    {
      label: "Αγορά από Skroutz",
      note: "Παραγγελία μέσω Skroutz",
      url: "https://lxbgvx.short.gy/skroutz",
      icon: "assets/images/optimized/ui/skroutz-112.png",
      iconSize: 28,
      enabled: true,
      visible: true
    },
    {
      label: "Αγορά από Meltemi Books",
      note: "Παραγγελία από τον εκδοτικό οίκο",
      url: "https://lxbgvx.short.gy/BOOKS-GR",
      icon: "assets/images/optimized/ui/meltemi-112.webp",
      iconSize: 28,
      enabled: true,
      visible: true
    },
    {
      label: "Αγορά με Κρυπτονομίσματα",
      note: "Διαθέσιμο σύντομα",
      url: "",
      icon: "assets/images/icons/usdc.png",
      iconSize: 28,
      enabled: false,
      visible: true
    }
  ];

  const modal = document.createElement("div");
  modal.className = "book-order-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="book-order-backdrop" data-book-order-close></div>
    <section class="book-order-dialog" role="dialog" aria-modal="true" aria-labelledby="bookOrderTitle" aria-describedby="bookOrderDescription" tabindex="-1">
      <button class="book-order-close" type="button" data-book-order-close aria-label="Κλείσιμο παραθύρου">&times;</button>
      <span class="book-order-kicker">Η Πτώση των Θεών</span>
      <h2 class="book-order-title" id="bookOrderTitle">Παράγγειλε το βιβλίο</h2>
      <p class="book-order-description" id="bookOrderDescription">Επίλεξε τον τρόπο αγοράς που σε εξυπηρετεί.</p>
      <div class="book-order-options"></div>
      <p class="book-order-status" aria-live="polite"></p>
    </section>`;

  const optionsContainer = modal.querySelector(".book-order-options");
  const dialog = modal.querySelector(".book-order-dialog");
  const status = modal.querySelector(".book-order-status");
  let lastFocusedElement = null;

  ORDER_OPTIONS.forEach(function (option) {
    if (option.visible === false) return;

    const link = document.createElement("a");
    link.className = "book-order-option";
    if (option.recommended) link.classList.add("is-recommended");
    link.href = option.url || "#";
    link.style.setProperty("--order-icon-size", `${option.iconSize}px`);
    link.innerHTML = `
      <span class="book-order-icon-wrap">
        <img class="book-order-icon" data-src="${option.icon}" alt="" width="${option.iconSize}" height="${option.iconSize}">
      </span>
      <span class="book-order-option-copy">
        <span class="book-order-option-label">${option.label}</span>
        <span class="book-order-option-meta">
          <span class="book-order-option-note">${option.note}</span>
          ${option.recommended ? '<span class="book-order-recommended">Προτεινόμενο</span>' : ""}
        </span>
      </span>
      <span class="book-order-arrow" aria-hidden="true">→</span>`;

    if (!option.enabled) {
      link.classList.add("is-disabled");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      link.addEventListener("click", function (event) {
        event.preventDefault();
      });
    } else if (option.url) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        status.textContent = "Ο σύνδεσμος παραγγελίας θα προστεθεί σύντομα.";
      });
    }

    optionsContainer.appendChild(link);
  });

  document.body.appendChild(modal);

  function getFocusableElements() {
    return Array.from(modal.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"));
  }

  function openModal(trigger) {
    lastFocusedElement = trigger;
    modal.querySelectorAll(".book-order-icon[data-src]").forEach(function (icon) {
      if (!icon.src) icon.src = icon.dataset.src;
    });
    status.textContent = "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("book-order-modal-open");
    window.requestAnimationFrame(function () {
      dialog.focus();
    });
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("book-order-modal-open");
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-book-order-open]");
    if (!trigger) return;
    event.preventDefault();
    openModal(trigger);
  });

  modal.addEventListener("click", function (event) {
    if (event.target.closest("[data-book-order-close]")) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (!modal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });
})();
