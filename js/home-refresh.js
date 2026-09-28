(function () {
  "use strict";

  var header = document.querySelector(".header_section");
  var carousel = document.getElementById("customCarousel1");
  var contactEndpoint = "https://formsubmit.co/ajax/b4fee62468b703d3784eafbf84624bdc";
  var contactDialog;
  var contactForm;
  var contactStatus;
  var contactToast;
  var lastContactTrigger;

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

  function buildContactDialog() {
    var wrapper = document.createElement("div");

    wrapper.innerHTML = [
      '<div class="contact-dialog" id="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-dialog-title" hidden>',
      '  <button class="contact-dialog__backdrop" type="button" aria-label="Close contact form" data-contact-close></button>',
      '  <div class="contact-dialog__panel">',
      '    <button class="contact-dialog__close" type="button" aria-label="Close contact form" data-contact-close>&times;</button>',
      '    <p class="contact-dialog__eyebrow">Start a conversation</p>',
      '    <h2 id="contact-dialog-title">What can I help you build?</h2>',
      '    <p class="contact-dialog__intro">Send a note directly to Shane. You will receive a reply by email.</p>',
      '    <form class="contact-dialog__form" novalidate>',
      '      <div class="contact-dialog__field">',
      '        <label for="contact-dialog-email">Your email</label>',
      '        <input id="contact-dialog-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required>',
      '      </div>',
      '      <div class="contact-dialog__field">',
      '        <label for="contact-dialog-message">Message</label>',
      '        <textarea id="contact-dialog-message" name="message" rows="6" placeholder="Tell me a little about what you are working on." required></textarea>',
      '      </div>',
      '      <input class="contact-dialog__honeypot" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">',
      '      <input type="hidden" name="_subject" value="New message from shanegolden.ca">',
      '      <input type="hidden" name="_template" value="table">',
      '      <input type="hidden" name="_captcha" value="false">',
      '      <p class="contact-dialog__status" role="status" aria-live="polite"></p>',
      '      <button class="contact-dialog__submit" type="submit">Send message</button>',
      '    </form>',
      '  </div>',
      '</div>',
      '<div class="contact-toast" role="status" aria-live="polite" hidden></div>'
    ].join("");

    document.body.appendChild(wrapper);
    contactDialog = document.getElementById("contact-dialog");
    contactForm = contactDialog.querySelector(".contact-dialog__form");
    contactStatus = contactDialog.querySelector(".contact-dialog__status");
    contactToast = wrapper.querySelector(".contact-toast");

    contactDialog.querySelectorAll("[data-contact-close]").forEach(function (button) {
      button.addEventListener("click", closeContactDialog);
    });
    contactForm.addEventListener("submit", submitContactForm);
  }

  function openContactDialog(trigger) {
    var openNavigation = document.querySelector(".navbar-collapse.show");

    if (!contactDialog) buildContactDialog();

    if (openNavigation && trigger && trigger.closest(".navbar-collapse")) {
      lastContactTrigger = document.querySelector(".navbar-toggler");
      if (window.jQuery) window.jQuery(openNavigation).collapse("hide");
    } else {
      lastContactTrigger = trigger || document.activeElement;
    }
    contactStatus.textContent = "";
    contactDialog.hidden = false;
    document.body.classList.add("contact-dialog-open");
    contactDialog.querySelector("input[type='email']").focus();
  }

  function closeContactDialog() {
    if (!contactDialog || contactDialog.hidden) return;

    contactDialog.hidden = true;
    document.body.classList.remove("contact-dialog-open");

    if (lastContactTrigger && typeof lastContactTrigger.focus === "function") {
      lastContactTrigger.focus();
    }
  }

  function showContactToast(message, isError) {
    if (!contactToast) return;

    contactToast.textContent = message;
    contactToast.classList.toggle("is-error", Boolean(isError));
    contactToast.hidden = false;
    window.clearTimeout(showContactToast.timeoutId);
    showContactToast.timeoutId = window.setTimeout(function () {
      contactToast.hidden = true;
    }, 5200);
  }

  function submitContactForm(event) {
    var submitButton = contactForm.querySelector("button[type='submit']");
    var formData;

    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    contactStatus.textContent = "Sending your message securely...";
    formData = new FormData(contactForm);

    window.fetch(contactEndpoint, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Message delivery failed");
        return response.json();
      })
      .then(function (data) {
        if (data && data.success === false) throw new Error("Message delivery failed");
        contactForm.reset();
        closeContactDialog();
        showContactToast("Message sent. Shane will get back to you soon.", false);
      })
      .catch(function () {
        contactStatus.textContent = "The message could not be sent. Please try again or email info@shanegolden.ca.";
        showContactToast("Message not sent. Please try again.", true);
      })
      .finally(function () {
        submitButton.disabled = false;
        submitButton.textContent = "Send message";
      });
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-contact-trigger], a[href^='mailto:info@shanegolden.ca']");

    if (!trigger) return;
    event.preventDefault();
    openContactDialog(trigger);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeContactDialog();
  });

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
