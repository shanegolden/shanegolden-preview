(function () {
  "use strict";

  function prepareExpandableSections() {
    document.querySelectorAll(".detail-box .more-text").forEach(function (section, index) {
      var button = section.nextElementSibling;

      section.id = section.id || "expanded-content-" + (index + 1);

      if (button && button.classList.contains("read-more-btn")) {
        button.setAttribute("aria-controls", section.id);
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  window.toggleReview = function (button) {
    var detailBox = button.closest(".detail-box");
    var moreText = detailBox ? detailBox.querySelector(".more-text") : null;

    if (!moreText) return;

    var isOpen = moreText.classList.toggle("is-open");
    moreText.style.display = isOpen ? "block" : "none";
    button.textContent = isOpen ? "Show less" : "Read more";
    button.setAttribute("aria-expanded", String(isOpen));
  };

  prepareExpandableSections();
})();
