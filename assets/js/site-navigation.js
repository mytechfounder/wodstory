(function () {
  "use strict";

  const menu = document.querySelector("[data-site-menu]");
  const overlay = document.querySelector("[data-site-menu-overlay]");
  const trigger = document.querySelector("[data-site-menu-open]");
  const closeButton = document.querySelector("[data-site-menu-close]");

  if (!menu || !overlay || !trigger || !closeButton) return;

  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    overlay.classList.toggle("is-open", open);
    document.body.classList.toggle("site-menu-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    if (open) closeButton.focus();
    else trigger.focus();
  }

  trigger.addEventListener("click", function () { setOpen(true); });
  closeButton.addEventListener("click", function () { setOpen(false); });
  overlay.addEventListener("click", function () { setOpen(false); });
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setOpen(false); });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("is-open")) setOpen(false);
  });
})();
