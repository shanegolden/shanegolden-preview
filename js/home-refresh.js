(function () {
  "use strict";

  var header = document.querySelector(".header_section");
  var carousel = document.getElementById("customCarousel1");
  var contactEndpoint = "https://shanegolden-contact.shanegolden.workers.dev/contact";
  var turnstileSiteKey = "0x4AAAAAAFIBis0p9SRQ28KX";
  var contactDialog;
  var contactForm;
  var contactStatus;
  var contactToast;
  var lastContactTrigger;
  var turnstileWidgetId;
  var turnstileScriptPromise;
  var pendingContactSubmission = false;

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
      '        <input id="contact-dialog-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" maxlength="254" required>',
      '      </div>',
      '      <div class="contact-dialog__field">',
      '        <label for="contact-dialog-message">Message</label>',
      '        <textarea id="contact-dialog-message" name="message" rows="6" maxlength="4000" placeholder="Tell me a little about what you are working on." required></textarea>',
      '      </div>',
      '      <input class="contact-dialog__honeypot" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">',
      '      <div class="contact-dialog__turnstile" aria-label="Security check"></div>',
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

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstileScriptPromise) return turnstileScriptPromise;

    turnstileScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = function () {
        if (window.turnstile) resolve(window.turnstile);
        else reject(new Error("Security check unavailable"));
      };
      script.onerror = function () {
        reject(new Error("Security check unavailable"));
      };
      document.head.appendChild(script);
    });

    return turnstileScriptPromise;
  }

  function ensureTurnstile() {
    return loadTurnstile().then(function () {
      if (turnstileWidgetId !== undefined) return turnstileWidgetId;

      turnstileWidgetId = window.turnstile.render(
        contactDialog.querySelector(".contact-dialog__turnstile"),
        {
          sitekey: turnstileSiteKey,
          action: "contact",
          appearance: "interaction-only",
          execution: "execute",
          callback: function (token) {
            if (!pendingContactSubmission) return;
            pendingContactSubmission = false;
            sendContactForm(token);
          },
          "error-callback": handleTurnstileFailure,
          "expired-callback": handleTurnstileFailure,
          "timeout-callback": handleTurnstileFailure
        }
      );

      return turnstileWidgetId;
    });
  }

  function setContactFormBusy(isBusy) {
    var submitButton = contactForm.querySelector("button[type='submit']");
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? "Sending..." : "Send message";
  }

  function resetTurnstile() {
    if (window.turnstile && turnstileWidgetId !== undefined) {
      window.turnstile.reset(turnstileWidgetId);
    }
  }

  function handleTurnstileFailure() {
    if (!pendingContactSubmission) return;
    pendingContactSubmission = false;
    setContactFormBusy(false);
    contactStatus.textContent = "The security check could not finish. Please try again.";
    showContactToast("Message not sent. Please try again.", true);
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
    ensureTurnstile().catch(function () {
      contactStatus.textContent = "The secure form could not load. Please refresh and try again.";
    });
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

  function sendContactForm(turnstileToken) {
    var formData = new FormData(contactForm);
    formData.set("cf-turnstile-response", turnstileToken);

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
        resetTurnstile();
        closeContactDialog();
        showContactToast("Message sent. Shane will get back to you soon.", false);
      })
      .catch(function () {
        resetTurnstile();
        contactStatus.textContent = "The message could not be sent. Please try again.";
        showContactToast("Message not sent. Please try again.", true);
      })
      .finally(function () {
        setContactFormBusy(false);
      });
  }

  function submitContactForm(event) {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    setContactFormBusy(true);
    contactStatus.textContent = "Checking and sending your message securely...";
    pendingContactSubmission = true;

    ensureTurnstile()
      .then(function (widgetId) {
        window.turnstile.execute(widgetId);
      })
      .catch(handleTurnstileFailure);
  }

  function openContactDialogFromForm(event) {
    var sourceForm = event.currentTarget;
    var emailField = sourceForm.querySelector("input[type='email']");
    var messageField = sourceForm.querySelector("textarea[name='message']");

    event.preventDefault();
    if (!sourceForm.checkValidity()) {
      sourceForm.reportValidity();
      return;
    }

    openContactDialog(sourceForm);
    if (emailField && emailField.value) {
      contactForm.querySelector("input[type='email']").value = emailField.value;
    }
    if (messageField && messageField.value) {
      contactForm.querySelector("textarea[name='message']").value = messageField.value;
    }
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-contact-trigger]");

    if (!trigger) return;
    event.preventDefault();
    openContactDialog(trigger);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeContactDialog();
  });

  document.querySelectorAll("form[data-contact-form]").forEach(function (form) {
    form.addEventListener("submit", openContactDialogFromForm);
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
