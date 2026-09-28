(function () {
  "use strict";

  var defaultTitle = document.title.trim() || "Shane Golden";
  var initialAwayTitle = "Wait, come back!";
  var awayBaseTitle = "The future is waiting";
  var awayEmojis = ["😐", "🫤", "😐", "🫠"];
  var welcomeBackEmoji = "🐐";
  var createWithShaneEmojis = [
    "☄️", "😇", "🫶", "😏", "🔋", "⭐️", "🤯", "🤸", "🤩", "⭐️",
    "✨", "💫", "🌠", "🦸🏻‍♂️", "🚀", "🛸", "🛫", "🤖", "👨🏻‍💻", "👨‍🔬", "⚡️"
  ];
  var maxDots = 3;
  var awayInterval;
  var awayDelay;
  var welcomeTitleDelay;
  var restoreTitleDelay;
  var dotCount = 0;
  var firstVisit = false;

  try {
    firstVisit = sessionStorage.getItem("firstVisit") !== "true";
    sessionStorage.setItem("firstVisit", "true");
  } catch (_error) {
    firstVisit = false;
  }

  function clearTitleTimers() {
    window.clearInterval(awayInterval);
    window.clearTimeout(awayDelay);
    window.clearTimeout(welcomeTitleDelay);
    window.clearTimeout(restoreTitleDelay);
  }

  function getFixedDots(count) {
    var dots = ".".repeat(count);
    var totalPadding = maxDots + 1 - count;
    return dots + "\u00A0".repeat(totalPadding);
  }

  function startAwayAnimation() {
    clearTitleTimers();
    document.title = initialAwayTitle;

    awayDelay = window.setTimeout(function () {
      var emojiIndex = 0;
      dotCount = 0;

      awayInterval = window.setInterval(function () {
        dotCount = (dotCount + 1) % (maxDots + 1);
        emojiIndex = (emojiIndex + 1) % awayEmojis.length;
        document.title = awayBaseTitle + getFixedDots(dotCount) + awayEmojis[emojiIndex];
      }, 400);
    }, 1000);
  }

  function showWelcomeBackSequence() {
    var fixedPadding = "\u00A0".repeat(maxDots + 1);
    var randomEmoji = createWithShaneEmojis[
      Math.floor(Math.random() * createWithShaneEmojis.length)
    ];

    clearTitleTimers();
    document.title = "Welcome back!" + fixedPadding + welcomeBackEmoji;

    welcomeTitleDelay = window.setTimeout(function () {
      document.title = "Create with Shane" + fixedPadding + randomEmoji;
    }, 2000);

    restoreTitleDelay = window.setTimeout(function () {
      document.title = defaultTitle;
    }, 5000);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (!firstVisit) startAwayAnimation();
      return;
    }

    if (!firstVisit) {
      showWelcomeBackSequence();
    } else {
      document.title = defaultTitle;
      firstVisit = false;
    }
  });

  window.addEventListener("pagehide", clearTitleTimers);
  document.title = defaultTitle;
})();
