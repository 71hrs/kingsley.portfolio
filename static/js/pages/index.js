(function () {
  "use strict";

  var marqueeCleanup = null;

  function setupMarqueeMotion() {
    var marquee = document.querySelector(".overview-marquee");
    var track = marquee && marquee.querySelector(".overview-marquee-track");
    var set = track && track.querySelector(".overview-marquee-set");
    if (!track || !set) return null;

    var speed = Number(getComputedStyle(track).getPropertyValue("--overview-marquee-speed")) || 44;

    function updateDuration() {
      var distance = set.getBoundingClientRect().width;
      if (!distance) return;
      track.style.setProperty("--overview-marquee-duration", Math.max(distance / speed, 1).toFixed(3) + "s");
    }

    updateDuration();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateDuration);
    if ("ResizeObserver" in window) {
      var resizeObserver = new ResizeObserver(updateDuration);
      resizeObserver.observe(set);
      var handleResize = function () { updateDuration(); };
      window.addEventListener("resize", handleResize, { passive: true });
      return function () {
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    }
    window.addEventListener("resize", updateDuration, { passive: true });
    return function () { window.removeEventListener("resize", updateDuration); };
  }

  function initializePage() {
    if (typeof marqueeCleanup === "function") marqueeCleanup();
    marqueeCleanup = setupMarqueeMotion();
  }

  document.addEventListener("DOMContentLoaded", initializePage);
}());
