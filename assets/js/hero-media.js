(function () {
  "use strict";

  const hero = document.querySelector(".thumbs-gallery-main");
  if (!hero) return;

  const videos = Array.from(hero.querySelectorAll("video"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  let heroVisible = true;

  function syncPlayback() {
    const allowMotion = !reducedMotion.matches && !saveData && !document.hidden && heroVisible;

    videos.forEach(function (video) {
      const slide = video.closest(".swiper-slide");
      const isActive = Boolean(slide && slide.classList.contains("swiper-slide-active"));

      if (allowMotion && isActive) {
        video.play().catch(function () {
          /* The poster remains visible when autoplay is restricted. */
        });
      } else {
        video.pause();
      }
    });
  }

  const slideObserver = new MutationObserver(syncPlayback);
  hero.querySelectorAll(".swiper-slide").forEach(function (slide) {
    slideObserver.observe(slide, { attributes: true, attributeFilter: ["class"] });
  });

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(function (entries) {
      heroVisible = entries.some(function (entry) { return entry.isIntersecting; });
      syncPlayback();
    }, { threshold: 0.08 });
    visibilityObserver.observe(hero);
  }

  document.addEventListener("visibilitychange", syncPlayback);
  reducedMotion.addEventListener?.("change", syncPlayback);
  window.requestAnimationFrame(syncPlayback);
})();
