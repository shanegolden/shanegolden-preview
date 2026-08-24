(function () {
  "use strict";

  var header = document.querySelector(".header_section");
  var carousel = document.getElementById("customCarousel1");

  function updateHeader() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
  }

  function syncIndicators(index) {
    if (!carousel) return;

    carousel.querySelectorAll(".carousel-indicators li").forEach(function (indicator, i) {
      if (i === index) {
        indicator.setAttribute("aria-current", "true");
      } else {
        indicator.removeAttribute("aria-current");
      }
    });
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (carousel && window.jQuery) {
    window.jQuery(carousel).on("slide.bs.carousel", function (event) {
      syncIndicators(event.to);
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.jQuery(carousel).carousel("pause");
    }
  }

  syncIndicators(0);
})();
