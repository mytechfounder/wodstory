(function () {
  "use strict";

  function initializeScrollToTop() {
    const button = document.getElementById("scrollToTop");
    if (!button) return;

    const updateVisibility = function () {
      button.classList.toggle("show", window.scrollY > 480);
    };

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();
  }

  function initializeVerticalRails() {
    document.querySelectorAll(".infinity-slide-vertical .swiper-wrapper").forEach(function (wrapper) {
      wrapper.style.flexDirection = "column";
    });
  }

  function initializeHeroCarousel() {
    const carousel = document.querySelector('[data-carousel-name="home-hero-slider"]');
    if (!carousel) return;

    const mainWrapper = carousel.querySelector(".thumbs-gallery-main > .swiper-wrapper");
    const thumbnailWrapper = carousel.querySelector(".thumbs-gallery > .swiper-wrapper");
    if (!mainWrapper || !thumbnailWrapper) return;

    const slides = Array.from(mainWrapper.children).filter(function (element) {
      return element.classList.contains("swiper-slide");
    });
    const allThumbnails = Array.from(thumbnailWrapper.children).filter(function (element) {
      return element.classList.contains("swiper-slide");
    });
    const thumbnails = allThumbnails.slice(0, slides.length);
    if (!slides.length || thumbnails.length !== slides.length) return;

    allThumbnails.slice(slides.length).forEach(function (thumbnail) {
      thumbnail.hidden = true;
    });

    mainWrapper.style.transform = "none";
    thumbnailWrapper.style.transform = "none";
    thumbnailWrapper.style.gap = "clamp(10px, 1.5vw, 24px)";

    let activeIndex = 0;
    let autoplayTimer = null;
    let pointerStartX = null;

    function pauseVideo(slide) {
      const video = slide.querySelector("video");
      if (video) video.pause();
    }

    function playVideo(slide) {
      const video = slide.querySelector("video");
      if (!video) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") playPromise.catch(function () {});
    }

    function showSlide(index, userInitiated) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        const isActive = slideIndex === activeIndex;
        slide.hidden = !isActive;
        slide.classList.toggle("swiper-slide-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
        if (isActive) playVideo(slide);
        else pauseVideo(slide);
      });

      thumbnails.forEach(function (thumbnail, thumbnailIndex) {
        const isActive = thumbnailIndex === activeIndex;
        thumbnail.classList.toggle("swiper-slide-thumb-active", isActive);
        thumbnail.setAttribute("aria-current", isActive ? "true" : "false");
        thumbnail.tabIndex = 0;
      });

      if (userInitiated) restartAutoplay();
    }

    function restartAutoplay() {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      autoplayTimer = window.setInterval(function () {
        showSlide(activeIndex + 1, false);
      }, 9000);
    }

    thumbnails.forEach(function (thumbnail, index) {
      thumbnail.style.width = "calc((100% - 2 * clamp(10px, 1.5vw, 24px)) / 3)";
      thumbnail.style.flexShrink = "0";
      thumbnail.setAttribute("role", "button");
      thumbnail.setAttribute("aria-label", "Προβολή βιβλίου " + (index + 1));
      thumbnail.addEventListener("click", function () {
        showSlide(index, true);
      });
      thumbnail.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showSlide(index, true);
        }
      });
    });

    carousel.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") showSlide(activeIndex - 1, true);
      if (event.key === "ArrowRight") showSlide(activeIndex + 1, true);
    });
    carousel.addEventListener("pointerdown", function (event) {
      pointerStartX = event.clientX;
    });
    carousel.addEventListener("pointerup", function (event) {
      if (pointerStartX === null) return;
      const distance = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(distance) < 48) return;
      showSlide(activeIndex + (distance < 0 ? 1 : -1), true);
    });
    carousel.addEventListener("mouseenter", function () {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
    });
    carousel.addEventListener("mouseleave", restartAutoplay);
    carousel.addEventListener("focusin", function () {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
    });
    carousel.addEventListener("focusout", restartAutoplay);

    showSlide(0, false);
    restartAutoplay();
  }

  initializeScrollToTop();
  initializeVerticalRails();
  initializeHeroCarousel();
})();
