(function () {
  "use strict";
  document.documentElement.dataset.page = "works";
  var revealCleanup = null;

  function setupScrollReveal() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".works-card"));
    var grids = Array.prototype.slice.call(document.querySelectorAll(".works-grid"));
    if (!cards.length) return;
    var navigationEntry = window.performance && window.performance.getEntriesByType
      ? window.performance.getEntriesByType("navigation")[0]
      : null;
    var isHistoryTraversal = navigationEntry && navigationEntry.type === "back_forward";

    grids.forEach(function (grid) {
      var gridCards = Array.prototype.slice.call(grid.querySelectorAll(".works-card"));
      var columns = getComputedStyle(grid).gridTemplateColumns;
      var columnCount = columns && columns !== "none" ? columns.split(" ").length : 1;
      gridCards.forEach(function (card, index) {
        card.style.transitionDelay = (index % columnCount) * 80 + "ms";
      });
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || isHistoryTraversal || !("IntersectionObserver" in window)) {
      cards.forEach(function (card) { card.dataset.visible = "true"; });
      return;
    }

    var observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.dataset.visible = "true";
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -60px 0px", threshold: 0 });

    cards.forEach(function (card) { observer.observe(card); });
    return function () { observer.disconnect(); };
  }

  function initializePage() {
    if (revealCleanup) revealCleanup();
    revealCleanup = setupScrollReveal() || null;
  }

  document.addEventListener("DOMContentLoaded", initializePage);
}());
