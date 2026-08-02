(function () {
  "use strict";

  /*
   * CREATOR PROFILE SETTINGS
   * Άλλαξε εδώ το κείμενο ή τα social links της κάρτας.
   */
  const PROFILE = {
    name: "Νικόλαος Χρούσης",
    role: "Συγγραφέας & δημιουργός",
    image: "assets/images/optimized/author-600.webp",
    bio: "Δημιουργός και συγγραφέας του «Κόσμου των Νάνων», ενός fantasy σύμπαντος γεμάτου αρχαίους θρύλους, ξεχασμένους θεούς και ιστορίες που περιμένουν να ειπωθούν.",
    socials: [
      {
        label: "Instagram",
        url: "https://www.instagram.com/mytechfounder",
        icon: "fa-brands fa-instagram"
      },
      {
        label: "Facebook",
        url: "https://www.facebook.com/mytechfounder",
        icon: "fa-brands fa-facebook-f"
      },
      {
        label: "X",
        url: "https://x.com/mytechfounder_",
        icon: "fa-brands fa-x-twitter"
      },
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/nchrousis/",
        icon: "fa-brands fa-linkedin-in"
      }
    ]
  };

  const modal = document.createElement("div");
  modal.className = "creator-profile-modal";
  modal.id = "creator-profile";
  modal.setAttribute("aria-hidden", "true");

  const socialLinks = PROFILE.socials.map(function (social) {
    return `
      <a class="creator-profile-social" href="${social.url}" target="_blank" rel="noopener noreferrer" aria-label="${social.label}" title="${social.label}">
        <i class="${social.icon}" aria-hidden="true"></i>
      </a>`;
  }).join("");

  modal.innerHTML = `
    <div class="creator-profile-backdrop" data-creator-profile-close></div>
    <section class="creator-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="creatorProfileName" aria-describedby="creatorProfileBio" tabindex="-1">
      <button class="creator-profile-close" type="button" data-creator-profile-close aria-label="Κλείσιμο παραθύρου">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>

      <div class="creator-profile-photo-wrap">
        <img class="creator-profile-photo" data-src="${PROFILE.image}" width="600" height="901" alt="${PROFILE.name}">
      </div>

      <div class="creator-profile-content">
        <span class="creator-profile-role">${PROFILE.role}</span>
        <h2 class="creator-profile-name" id="creatorProfileName">${PROFILE.name}</h2>
        <p class="creator-profile-bio" id="creatorProfileBio">${PROFILE.bio}</p>
        <div class="creator-profile-socials" aria-label="Social media">
          ${socialLinks}
        </div>
        <a class="creator-profile-more" href="author.html">Περισσότερα για τον συγγραφέα <span aria-hidden="true">→</span></a>
      </div>
    </section>`;

  document.body.appendChild(modal);

  const dialog = modal.querySelector(".creator-profile-dialog");
  let lastFocusedElement = null;

  function getFocusableElements() {
    return Array.from(modal.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"));
  }

  function openProfile(trigger) {
    lastFocusedElement = trigger;
    const profilePhoto = modal.querySelector(".creator-profile-photo");
    if (profilePhoto && !profilePhoto.src) profilePhoto.src = profilePhoto.dataset.src;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("creator-profile-modal-open");

    window.requestAnimationFrame(function () {
      dialog.focus();
    });
  }

  function closeProfile() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("creator-profile-modal-open");
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-creator-profile-open]");
    if (!trigger) return;
    event.preventDefault();
    openProfile(trigger);
  });

  modal.addEventListener("click", function (event) {
    if (event.target.closest("[data-creator-profile-close]")) closeProfile();
  });

  document.addEventListener("keydown", function (event) {
    if (!modal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeProfile();
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
