(function () {
  "use strict";

  document.querySelectorAll("[data-book-slider]").forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-book-slide]"));
    const previousButton = slider.querySelector("[data-book-slider-prev]");
    const nextButton = slider.querySelector("[data-book-slider-next]");
    const dots = Array.from(slider.querySelectorAll("[data-book-slider-dot]"));
    const count = slider.querySelector("[data-book-slider-count]");
    let activeIndex = 0;
    let pointerStartX = null;

    if (slides.length < 2) return;

    function updateFocusableElements(slide, isActive) {
      slide.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach(function (element) {
        if (isActive) {
          if (element.dataset.bookSliderTabindex !== undefined) {
            const previousTabindex = element.dataset.bookSliderTabindex;
            if (previousTabindex) element.setAttribute("tabindex", previousTabindex);
            else element.removeAttribute("tabindex");
            delete element.dataset.bookSliderTabindex;
          }
        } else {
          if (element.dataset.bookSliderTabindex === undefined) {
            element.dataset.bookSliderTabindex = element.getAttribute("tabindex") || "";
          }
          element.setAttribute("tabindex", "-1");
        }
      });
    }

    function render() {
      slides.forEach(function (slide, index) {
        const isActive = index === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.classList.toggle("is-back", !isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
        updateFocusableElements(slide, isActive);
      });

      dots.forEach(function (dot, index) {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", String(isActive));
      });

      if (count) {
        count.textContent = String(activeIndex + 1).padStart(2, "0") +
          " / " + String(slides.length).padStart(2, "0");
      }
    }

    function goTo(index) {
      activeIndex = (index + slides.length) % slides.length;
      render();
    }

    previousButton?.addEventListener("click", function () {
      goTo(activeIndex - 1);
    });

    nextButton?.addEventListener("click", function () {
      goTo(activeIndex + 1);
    });

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(Number(dot.dataset.bookSliderDot));
      });
    });

    slider.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(activeIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(activeIndex + 1);
      }
    });

    slider.addEventListener("pointerdown", function (event) {
      if (event.target.closest("button, a")) return;
      pointerStartX = event.clientX;
    });

    slider.addEventListener("pointerup", function (event) {
      if (pointerStartX === null) return;
      const distance = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(distance) < 45) return;
      goTo(activeIndex + (distance < 0 ? 1 : -1));
    });

    slider.addEventListener("pointercancel", function () {
      pointerStartX = null;
    });

    render();
  });
})();
