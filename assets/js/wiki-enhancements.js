(function () {
  "use strict";

  const HOME_ID = "wiki-home";
  const BASE_TITLE = "Fantasy Wiki | Ο Κόσμος των Νάνων";
  const categoryMeta = {
    cosmo: { label: "Κοσμολογία", icon: "cosmo" },
    god: { label: "Το Πάνθεον", icon: "god" },
    race: { label: "Φυλές", icon: "race" },
    world: { label: "Κόσμοι", icon: "world" },
    archive: { label: "Αρχείο Lore", icon: "archive" },
    visual: { label: "Οπτικό Αρχείο", icon: "visual" },
    release: { label: "Κυκλοφορίες", icon: "archive" }
  };
  const iconPaths = {
    all: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    cosmo: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
    god: '<path d="m3 7 4 4 5-6 5 6 4-4-2 11H5L3 7Z"/><path d="M5 18h14"/>',
    race: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M15 14.5a5 5 0 0 1 6 4.5v1"/>',
    world: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    archive: '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z"/><path d="M5 19a2 2 0 0 1 2-2h13"/>',
    visual: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 17 5-5 4 4 2-2 5 5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    "arrow-right": '<path d="M5 12h14M14 7l5 5-5 5"/>',
    "arrow-left": '<path d="M19 12H5M10 7l-5 5 5 5"/>'
  };
  const entryVisuals = {
    "god-titan": { file: "titan", alt: "Ο Τιτάνας, Πατέρας των Θεών" },
    "god-lithania": { file: "lithania", alt: "Λιθάνια, θεά των Νάνων" },
    "god-arteonos": { file: "arteonos", alt: "Αρτεόνος, θεός των Ανθρώπων" },
    "god-aitheria": { file: "aitheria", alt: "Αιθερία, θεά των Ξωτικών" },
    "god-skotomedon": { file: "skotomedon", alt: "Σκοτομέδων, θεός των Σκοτεινών Ξωτικών" },
    "god-gromachth": { file: "gkromachth", alt: "Γκρομάχθ, θεός των Ορκ" },
    "world-dwarves": { file: "dwarf-planet", alt: "Πλανήτης των Νάνων", world: true },
    "world-humans": { file: "human-planet", alt: "Πλανήτης των Ανθρώπων", world: true, version: 2 },
    "world-elves": { file: "elf-planet", alt: "Πλανήτης των Ξωτικών", world: true, version: 2 },
    "world-dark-elves": { file: "dark-elf-planet", alt: "Πλανήτης των Σκοτεινών Ξωτικών", world: true, version: 2 },
    "world-orcs": { file: "orc-planet", alt: "Πλανήτης των Ορκ", world: true, version: 2 },
    "world-gods": { file: "gods-planet", alt: "Πλανήτης των Θεών", world: true, version: 2 }
  };

  let entries = [];
  let activeFilter = "all";
  let lastWikiMenuTrigger = null;

  function createUiIcon(name, className) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add(className || "wiki-ui-icon");
    svg.innerHTML = iconPaths[name] || iconPaths.compass;
    return svg;
  }

  function normalizeText(value) {
    return (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("el")
      .replace(/\s+/g, " ")
      .trim();
  }

  const wikiLinkAliases = [
    ["Πλανήτης των Σκοτεινών Ξωτικών", "world-dark-elves"],
    ["πλανήτη των Σκοτεινών Ξωτικών", "world-dark-elves"],
    ["Πλανήτης των Ανθρώπων", "world-humans"],
    ["πλανήτη των Ανθρώπων", "world-humans"],
    ["Πλανήτης των Ξωτικών", "world-elves"],
    ["πλανήτη των Ξωτικών", "world-elves"],
    ["Πλανήτης των Νάνων", "world-dwarves"],
    ["πλανήτη των Νάνων", "world-dwarves"],
    ["Πλανήτης των Θεών", "world-gods"],
    ["πλανήτη των Θεών", "world-gods"],
    ["Πλανήτης των Ορκ", "world-orcs"],
    ["πλανήτη των Ορκ", "world-orcs"],
    ["Βασίλειο των Θεών", "cosmo-godsrealm"],
    ["Βασιλείου των Θεών", "cosmo-godsrealm"],
    ["Θρόνος του Πατέρα", "cosmo-throne"],
    ["Θρόνου του Πατέρα", "cosmo-throne"],
    ["Σκοτεινά Ξωτικά", "race-dark-elves"],
    ["Σκοτεινών Ξωτικών", "race-dark-elves"],
    ["Σκοτομέδοντα", "god-skotomedon"],
    ["Σκοτομέδων", "god-skotomedon"],
    ["Γκρομάχθ", "god-gromachth"],
    ["Αρτεόνος", "god-arteonos"],
    ["Αρτεόνο", "god-arteonos"],
    ["Αιθερία", "god-aitheria"],
    ["Λιθάνια", "god-lithania"],
    ["Τιτάνας", "god-titan"],
    ["Τιτάνα", "god-titan"],
    ["Νάνων", "race-dwarves"],
    ["Νάνους", "race-dwarves"],
    ["Νάνοι", "race-dwarves"],
    ["Ανθρώπων", "race-humans"],
    ["Ανθρώπους", "race-humans"],
    ["Άνθρωποι", "race-humans"],
    ["Ξωτικών", "race-elves"],
    ["Ξωτικά", "race-elves"],
    ["Ορκ", "race-orcs"],
    ["Ισορροπία", "cosmo-balance"],
    ["ισορροπία", "cosmo-balance"],
    ["Σάεριν", "character-saerin"]
  ].sort((a, b) => b[0].length - a[0].length);

  function linkFirstTextOccurrence(container, alias, targetId) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      const index = textNode.nodeValue.indexOf(alias);
      if (index < 0) continue;

      const before = textNode.nodeValue.slice(0, index);
      const match = textNode.nodeValue.slice(index, index + alias.length);
      const after = textNode.nodeValue.slice(index + alias.length);
      const link = document.createElement("a");
      link.className = "wiki-inline-link";
      link.href = `#${targetId}`;
      link.dataset.wikiTarget = `#${targetId}`;
      link.textContent = match;
      textNode.replaceWith(document.createTextNode(before), link, document.createTextNode(after));
      return true;
    }
    return false;
  }

  function linkifyWikiArticles() {
    document.querySelectorAll(".wiki-section:not(.wiki-home-section)").forEach((section) => {
      const linkedTargets = new Set();
      const containers = section.querySelectorAll(".wiki-article-main > p, :scope > p, .wiki-glossary-list p");

      for (const container of containers) {
        for (const [alias, targetId] of wikiLinkAliases) {
          if (linkedTargets.size >= 4) return;
          if (targetId === section.id || linkedTargets.has(targetId)) continue;
          if (linkFirstTextOccurrence(container, alias, targetId)) linkedTargets.add(targetId);
        }
      }
    });
  }

  function categoryFromId(id) {
    if (id.startsWith("cosmo-")) return "cosmo";
    if (id.startsWith("god-")) return "god";
    if (id.startsWith("race-")) return "race";
    if (id.startsWith("world-")) return "world";
    if (id.startsWith("visual-")) return "visual";
    if (id.startsWith("book-")) return "release";
    return "archive";
  }

  function closeHeaderMenu() {
    const menu = document.getElementById("mobileSideMenu");
    const overlay = document.getElementById("mobileMenuOverlay");
    const trigger = document.querySelector(".mobile-menu-btn");
    if (!menu || !overlay) return;
    menu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("wiki-drawer-open");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  window.toggleMobileMenu = function () {
    const menu = document.getElementById("mobileSideMenu");
    const overlay = document.getElementById("mobileMenuOverlay");
    const trigger = document.querySelector(".mobile-menu-btn");
    if (!menu || !overlay) return;
    const willOpen = !menu.classList.contains("active");
    menu.classList.toggle("active", willOpen);
    overlay.classList.toggle("active", willOpen);
    document.body.classList.toggle("wiki-drawer-open", willOpen);
    if (trigger) trigger.setAttribute("aria-expanded", String(willOpen));
  };

  function closeWikiMenu(restoreFocus) {
    const sidebar = document.getElementById("wikiSidebar");
    const overlay = document.getElementById("wikiOverlay");
    const trigger = document.getElementById("wikiMenuToggle");
    if (!sidebar || !overlay) return;
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("wiki-drawer-open");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus && lastWikiMenuTrigger) lastWikiMenuTrigger.focus();
  }

  window.toggleWikiMenu = function () {
    const sidebar = document.getElementById("wikiSidebar");
    const overlay = document.getElementById("wikiOverlay");
    const trigger = document.getElementById("wikiMenuToggle");
    if (!sidebar || !overlay) return;
    const willOpen = !sidebar.classList.contains("active");
    if (!willOpen) {
      closeWikiMenu(true);
      return;
    }
    lastWikiMenuTrigger = document.activeElement;
    sidebar.classList.add("active");
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("wiki-drawer-open");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    sidebar.focus();
  };

  function arrangeWikiArticleSidebars() {
    document.querySelectorAll(".wiki-article-layout").forEach((layout) => {
      const main = layout.querySelector(":scope > .wiki-article-main");
      const infobox = layout.querySelector(":scope > .wiki-infobox");
      const tags = main ? main.querySelector(":scope > .wiki-tag-list") : null;
      if (!infobox || layout.querySelector(":scope > .wiki-article-side")) return;

      const side = document.createElement("aside");
      side.className = "wiki-article-side";
      layout.insertBefore(side, infobox);
      side.appendChild(infobox);
      if (tags) side.appendChild(tags);
    });
  }

  function buildEntryIndex() {
    const linkMap = new Map();
    document.querySelectorAll(".wiki-subcategories a[href^='#']").forEach((link) => {
      linkMap.set(link.getAttribute("href").slice(1), link);
    });

    entries = Array.from(document.querySelectorAll(".wiki-section:not(.wiki-home-section)")).map((section, index) => {
      const id = section.id;
      const title = section.querySelector("h2")?.textContent.trim() || id;
      const link = linkMap.get(id);
      const navigationTitle = link?.textContent.trim() || title;
      const category = categoryFromId(id);
      const tags = Array.from(section.querySelectorAll(".wiki-tag"))
        .map((tag) => tag.textContent.trim())
        .filter(Boolean);
      return {
        id,
        index,
        title,
        navigationTitle,
        category,
        categoryLabel: categoryMeta[category].label,
        tags,
        section,
        link,
        searchableText: normalizeText([title, navigationTitle, categoryMeta[category].label, tags.join(" "), section.textContent].join(" "))
      };
    });
  }

  function createEntryCard(entry, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.wikiTarget = `#${entry.id}`;

    const copy = document.createElement("span");
    copy.className = className.includes("related") ? "wiki-related-copy" : "wiki-result-copy";
    const title = document.createElement("span");
    title.className = className.includes("related") ? "wiki-related-title" : "wiki-result-title";
    title.textContent = entry.navigationTitle;
    const meta = document.createElement("span");
    meta.className = className.includes("related") ? "wiki-related-meta" : "wiki-result-meta";
    meta.textContent = entry.categoryLabel;
    copy.append(title, meta);

    const arrow = createUiIcon("arrow-right", "wiki-arrow-icon");
    button.append(copy, arrow);
    return button;
  }

  function getFeaturedEntries() {
    const featuredIds = ["cosmo-creation", "god-lithania", "race-dwarves", "world-dwarves", "timeline", "visual-gods"];
    return featuredIds.map((id) => entries.find((entry) => entry.id === id)).filter(Boolean);
  }

  function renderSearchResults() {
    const input = document.getElementById("wikiSearch");
    const results = document.getElementById("wikiSearchResults");
    const status = document.getElementById("wikiSearchStatus");
    if (!input || !results || !status) return;

    const query = normalizeText(input.value);
    const queryWords = query.split(" ").filter(Boolean);
    let matches = query
      ? entries
        .filter((entry) => queryWords.every((word) => entry.searchableText.includes(word)))
        .map((entry) => {
          const normalizedTitle = normalizeText(`${entry.navigationTitle} ${entry.title}`);
          const normalizedTags = normalizeText(entry.tags.join(" "));
          let score = entry.index * -0.001;
          if (normalizedTitle === query) score += 100;
          else if (normalizedTitle.startsWith(query)) score += 60;
          else if (queryWords.every((word) => normalizedTitle.includes(word))) score += 40;
          if (queryWords.every((word) => normalizedTags.includes(word))) score += 22;
          score += 5;
          return { entry, score };
        })
        .sort((a, b) => b.score - a.score)
        .map((item) => item.entry)
      : activeFilter === "all"
        ? getFeaturedEntries()
        : entries;

    if (activeFilter !== "all") matches = matches.filter((entry) => entry.category === activeFilter);
    results.replaceChildren();

    matches.forEach((entry) => results.appendChild(createEntryCard(entry, "wiki-result-card")));

    if (!matches.length) {
      status.textContent = "Δεν βρέθηκε σχετική καταχώριση. Δοκίμασε διαφορετική λέξη ή κατηγορία.";
    } else if (!query && activeFilter === "all") {
      status.textContent = "Προτεινόμενες καταχωρίσεις";
    } else {
      status.textContent = `${matches.length} ${matches.length === 1 ? "καταχώριση" : "καταχωρίσεις"}`;
    }
  }

  function setSearchFilter(filter, focusSearch, clearQuery) {
    activeFilter = filter;
    const input = document.getElementById("wikiSearch");
    if (clearQuery && input) input.value = "";
    document.querySelectorAll(".wiki-filter-button").forEach((button) => {
      const active = button.dataset.wikiFilter === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderSearchResults();
    if (focusSearch) input?.focus();
  }

  function relatedEntriesFor(entry) {
    return entries
      .filter((candidate) => candidate.id !== entry.id)
      .map((candidate) => {
        const sharedTags = candidate.tags.filter((tag) => entry.tags.includes(tag)).length;
        const score = sharedTags * 3 + (candidate.category === entry.category ? 2 : 0);
        return { candidate, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.candidate.index - b.candidate.index)
      .slice(0, 3)
      .map((item) => item.candidate);
  }

  function copyCurrentLink(button) {
    const copyText = window.location.href;
    const done = () => {
      const label = button.querySelector("span");
      if (!label) return;
      const original = label.textContent;
      label.textContent = "Αντιγράφηκε";
      window.setTimeout(() => { label.textContent = original; }, 1600);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(copyText).then(done).catch(() => {});
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = copyText;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand("copy"); done(); } catch (_error) {}
    textarea.remove();
  }

  function renderArticleExtras(entry) {
    document.querySelectorAll(".wiki-entry-topbar, .wiki-entry-footer").forEach((element) => element.remove());

    const heading = entry.section.querySelector("h2");
    if (!heading) return;

    const topbar = document.createElement("div");
    topbar.className = "wiki-entry-topbar";

    const breadcrumb = document.createElement("nav");
    breadcrumb.className = "wiki-breadcrumb";
    breadcrumb.setAttribute("aria-label", "Breadcrumb");
    const homeButton = document.createElement("button");
    homeButton.type = "button";
    homeButton.dataset.wikiTarget = `#${HOME_ID}`;
    homeButton.textContent = "Wiki";
    const separatorOne = document.createElement("span");
    separatorOne.setAttribute("aria-hidden", "true");
    separatorOne.textContent = "/";
    const categoryButton = document.createElement("button");
    categoryButton.type = "button";
    categoryButton.dataset.wikiCategory = entry.category;
    categoryButton.textContent = entry.categoryLabel;
    const separatorTwo = separatorOne.cloneNode(true);
    const current = document.createElement("span");
    current.setAttribute("aria-current", "page");
    current.textContent = entry.navigationTitle;
    breadcrumb.append(homeButton, separatorOne, categoryButton, separatorTwo, current);

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "wiki-copy-link";
    const copyLabel = document.createElement("span");
    copyLabel.textContent = "Αντιγραφή link";
    copyButton.append(createUiIcon("copy", "wiki-ui-icon"), copyLabel);
    copyButton.addEventListener("click", () => copyCurrentLink(copyButton));
    topbar.append(breadcrumb, copyButton);
    if (entry.section.classList.contains("wiki-section--visual-entry")) {
      const layout = entry.section.querySelector(".wiki-article-layout");
      if (layout) entry.section.insertBefore(topbar, layout);
    } else {
      heading.parentNode.insertBefore(topbar, heading);
    }

    const footer = document.createElement("div");
    footer.className = "wiki-entry-footer";
    const related = relatedEntriesFor(entry);
    if (related.length) {
      const relatedSection = document.createElement("section");
      relatedSection.className = "wiki-related-section";
      const relatedTitle = document.createElement("h3");
      relatedTitle.textContent = "Σχετικές καταχωρίσεις";
      const relatedGrid = document.createElement("div");
      relatedGrid.className = "wiki-related-grid";
      related.forEach((item) => relatedGrid.appendChild(createEntryCard(item, "wiki-related-card")));
      relatedSection.append(relatedTitle, relatedGrid);
      footer.appendChild(relatedSection);
    }

    const pagination = document.createElement("nav");
    pagination.className = "wiki-entry-pagination";
    pagination.setAttribute("aria-label", "Πλοήγηση άρθρων");
    const previous = entries[entry.index - 1];
    const next = entries[entry.index + 1];

    if (previous) {
      const previousButton = document.createElement("button");
      previousButton.type = "button";
      previousButton.className = "wiki-page-button previous";
      previousButton.dataset.wikiTarget = `#${previous.id}`;
      previousButton.innerHTML = `<span><small>Προηγούμενο</small><strong></strong></span>`;
      previousButton.querySelector("strong").textContent = previous.navigationTitle;
      previousButton.prepend(createUiIcon("arrow-left", "wiki-arrow-icon"));
      pagination.appendChild(previousButton);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "wiki-page-spacer";
      pagination.appendChild(spacer);
    }

    if (next) {
      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "wiki-page-button next";
      nextButton.dataset.wikiTarget = `#${next.id}`;
      nextButton.innerHTML = `<span><small>Επόμενο</small><strong></strong></span>`;
      nextButton.querySelector("strong").textContent = next.navigationTitle;
      nextButton.append(createUiIcon("arrow-right", "wiki-arrow-icon"));
      pagination.appendChild(nextButton);
    }
    footer.appendChild(pagination);
    entry.section.appendChild(footer);
  }

  function updateSidebar(entry) {
    document.querySelectorAll(".wiki-subcategories a").forEach((link) => {
      const active = Boolean(entry && link.getAttribute("href") === `#${entry.id}`);
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const homeButton = document.querySelector(".wiki-home-nav");
    if (homeButton) homeButton.classList.toggle("active", !entry);

    if (entry?.link) {
      const category = entry.link.closest(".wiki-category");
      if (category && !category.classList.contains("open")) {
        category.classList.add("open");
        category.querySelector(".wiki-category-button")?.setAttribute("aria-expanded", "true");
      }
    }
  }

  function showWikiSection(target, options) {
    const settings = Object.assign({ history: "push", scroll: true, focus: true }, options);
    const cleanId = (target || "").replace(/^#/, "") || HOME_ID;
    const isHome = cleanId === HOME_ID;
    const entry = isHome ? null : entries.find((item) => item.id === cleanId);
    const section = isHome ? document.getElementById(HOME_ID) : entry?.section;
    if (!section) return false;

    document.querySelectorAll(".wiki-section").forEach((item) => item.classList.remove("active"));
    section.classList.add("active");
    updateSidebar(entry);

    if (entry) {
      renderArticleExtras(entry);
      document.title = `${entry.navigationTitle} | Wiki του Κόσμου`;
    } else {
      document.querySelectorAll(".wiki-entry-topbar, .wiki-entry-footer").forEach((element) => element.remove());
      document.title = BASE_TITLE;
      renderSearchResults();
    }

    if (settings.history !== "none") {
      const destination = isHome ? `${window.location.pathname}${window.location.search}` : `#${cleanId}`;
      if (settings.history === "replace") history.replaceState({ wiki: cleanId }, "", destination);
      else history.pushState({ wiki: cleanId }, "", destination);
    }

    closeWikiMenu(false);

    if (settings.scroll) {
      section.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    }
    if (settings.focus) window.setTimeout(() => section.focus({ preventScroll: true }), 220);
    return true;
  }

  function initializeCategoryButtons() {
    document.querySelectorAll(".wiki-category-button").forEach((button, index) => {
      const category = button.closest(".wiki-category");
      const subcategories = category?.querySelector(".wiki-subcategories");
      if (!category || !subcategories) return;
      const panelId = `wiki-category-panel-${index + 1}`;
      subcategories.id = panelId;
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-expanded", String(category.classList.contains("open")));
      button.addEventListener("click", () => {
        const willOpen = !category.classList.contains("open");
        category.classList.toggle("open", willOpen);
        button.setAttribute("aria-expanded", String(willOpen));
      });
    });
  }

  function initializeUiIconsAndCounts() {
    const searchIcon = document.querySelector(".wiki-search-label > i");
    if (searchIcon) searchIcon.replaceWith(createUiIcon("search", "wiki-ui-icon"));

    const homeIcon = document.querySelector(".wiki-home-nav > i");
    if (homeIcon) homeIcon.replaceWith(createUiIcon("compass", "wiki-ui-icon"));

    document.querySelectorAll(".wiki-filter-button").forEach((button) => {
      const filter = button.dataset.wikiFilter;
      const count = filter === "all"
        ? entries.length
        : entries.filter((entry) => entry.category === filter).length;
      const badge = document.createElement("span");
      badge.className = "wiki-filter-count";
      badge.textContent = String(count);
      badge.setAttribute("aria-label", `${count} καταχωρίσεις`);
      button.appendChild(badge);
    });

    document.querySelectorAll(".wiki-category-card").forEach((card) => {
      const category = card.dataset.wikiCategory;
      const iconName = categoryMeta[category]?.icon;
      const iconContainer = card.querySelector(".wiki-category-card-icon");
      if (iconContainer && iconName) iconContainer.replaceChildren(createUiIcon(iconName, "wiki-ui-icon"));

      const oldArrow = card.querySelector(":scope > i");
      if (oldArrow) oldArrow.remove();

      const meta = card.querySelector(".wiki-category-meta");
      if (meta) {
        const count = entries.filter((entry) => entry.category === category).length;
        meta.append(` · ${count} ${count === 1 ? "καταχώριση" : "καταχωρίσεις"}`);
      }
    });
  }

  function initializeEntryVisuals() {
    Object.entries(entryVisuals).forEach(([sectionId, visual]) => {
      const section = document.getElementById(sectionId);
      const infobox = section?.querySelector(".wiki-infobox");
      if (!infobox || infobox.querySelector(".wiki-infobox-media")) return;

      const heading = section.querySelector(":scope > h2");
      const articleMain = section.querySelector(".wiki-article-main");
      if (heading && articleMain) articleMain.prepend(heading);
      section.classList.add("wiki-section--visual-entry");

      const suffix = visual.version ? `?v=${visual.version}` : "";
      const figure = document.createElement("figure");
      figure.className = `wiki-infobox-media${visual.world ? " wiki-infobox-media--world" : ""}`;

      const image = document.createElement("img");
      image.src = `assets/images/optimized/wiki/${visual.file}-720.webp${suffix}`;
      image.srcset = `assets/images/optimized/wiki/${visual.file}-360.webp${suffix} 360w, assets/images/optimized/wiki/${visual.file}-720.webp${suffix} 720w`;
      image.sizes = "(max-width: 1100px) 360px, 285px";
      image.width = 720;
      image.height = 720;
      image.loading = "lazy";
      image.decoding = "async";
      image.alt = visual.alt;
      image.addEventListener("error", () => figure.remove(), { once: true });

      const caption = document.createElement("figcaption");
      caption.textContent = "Επίσημη απεικόνιση";
      figure.append(image, caption);
      infobox.classList.add("wiki-infobox-visual");
      infobox.prepend(figure);
    });
  }

  function initializeEvents() {
    document.addEventListener("click", (event) => {
      const spoilerToggle = event.target.closest("[data-wiki-spoiler-toggle]");
      if (spoilerToggle) {
        const content = document.getElementById(spoilerToggle.getAttribute("aria-controls"));
        if (!content) return;
        const willOpen = content.hidden;
        content.hidden = !willOpen;
        spoilerToggle.setAttribute("aria-expanded", String(willOpen));
        spoilerToggle.textContent = willOpen ? "Απόκρυψη spoilers" : "Εμφάνιση spoilers";
        return;
      }

      const targetButton = event.target.closest("[data-wiki-target]");
      if (targetButton) {
        event.preventDefault();
        showWikiSection(targetButton.dataset.wikiTarget);
        return;
      }

      const navigationLink = event.target.closest(".wiki-subcategories a[href^='#']");
      if (navigationLink) {
        event.preventDefault();
        showWikiSection(navigationLink.getAttribute("href"));
        return;
      }

      const categoryButton = event.target.closest("[data-wiki-category]");
      if (categoryButton) {
        showWikiSection(`#${HOME_ID}`, { scroll: true });
        setSearchFilter(categoryButton.dataset.wikiCategory, true, true);
      }
    });

    document.getElementById("wikiSearch")?.addEventListener("input", renderSearchResults);
    document.querySelectorAll(".wiki-filter-button").forEach((button) => {
      button.addEventListener("click", () => setSearchFilter(button.dataset.wikiFilter, false));
    });
    document.getElementById("wikiMenuToggle")?.addEventListener("click", window.toggleWikiMenu);
    document.querySelector(".wiki-sidebar-close")?.addEventListener("click", () => closeWikiMenu(true));
    document.getElementById("wikiOverlay")?.addEventListener("click", () => closeWikiMenu(true));

    window.addEventListener("popstate", () => {
      showWikiSection(window.location.hash || `#${HOME_ID}`, { history: "none", scroll: true, focus: true });
    });
    window.addEventListener("hashchange", () => {
      const target = window.location.hash || `#${HOME_ID}`;
      const active = document.querySelector(".wiki-section.active");
      if (active?.id !== target.slice(1)) showWikiSection(target, { history: "none", scroll: true, focus: true });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeWikiMenu(true);
        closeHeaderMenu();
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        event.preventDefault();
        showWikiSection(`#${HOME_ID}`, { history: "push", scroll: true, focus: false });
        document.getElementById("wikiSearch")?.focus();
      }
    });
  }

  function initializeAccessibility() {
    const wikiSidebar = document.getElementById("wikiSidebar");
    if (wikiSidebar) wikiSidebar.tabIndex = -1;
    document.querySelectorAll(".wiki-section").forEach((section) => { section.tabIndex = -1; });

    const headerTrigger = document.querySelector(".mobile-menu-btn");
    if (headerTrigger) {
      headerTrigger.setAttribute("aria-controls", "mobileSideMenu");
      headerTrigger.setAttribute("aria-expanded", "false");
    }
  }

  function initializeSiteChrome() {
    const preloader = document.querySelector(".preloader");
    const scrollButton = document.getElementById("scrollToTop");
    const headerNav = document.getElementById("header-nav");

    const hidePreloader = () => {
      if (!preloader || preloader.dataset.hidden === "true") return;
      preloader.dataset.hidden = "true";
      preloader.style.opacity = "0";
      preloader.style.pointerEvents = "none";
      window.setTimeout(() => { preloader.style.display = "none"; }, 260);
    };

    const updateScrollUi = () => {
      const hasScrolled = window.scrollY > 80;
      headerNav?.classList.toggle("header-animation", hasScrolled);
      scrollButton?.classList.toggle("show", window.scrollY > 240);
    };

    if (document.readyState === "complete") hidePreloader();
    else window.addEventListener("load", hidePreloader, { once: true });
    window.setTimeout(hidePreloader, 1800);

    scrollButton?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", updateScrollUi, { passive: true });
    updateScrollUi();
  }

  window.addEventListener("DOMContentLoaded", () => {
    arrangeWikiArticleSidebars();
    initializeEntryVisuals();
    initializeCategoryButtons();
    buildEntryIndex();
    linkifyWikiArticles();
    initializeUiIconsAndCounts();
    initializeAccessibility();
    initializeEvents();
    initializeSiteChrome();
    renderSearchResults();

    const hashId = window.location.hash.slice(1);
    const initialTarget = hashId && document.getElementById(hashId)
      ? `#${hashId}`
      : `#${HOME_ID}`;
    showWikiSection(initialTarget, { history: "none", scroll: Boolean(window.location.hash), focus: false });
  });
})();
