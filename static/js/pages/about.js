(function () {
  "use strict";

  function initializeBeyondCarousel() {
    var carousel = document.querySelector("[data-about-beyond-carousel]");
    if (!carousel || carousel.dataset.initialized === "true") return null;

    var viewport = carousel.querySelector(".about-beyond-viewport");
    var track = carousel.querySelector("[data-about-beyond-track]");
    var previous = carousel.querySelector("[data-about-beyond-prev]");
    var next = carousel.querySelector("[data-about-beyond-next]");
    if (!viewport || !track || !previous || !next) return null;
    var cards = Array.prototype.slice.call(track.querySelectorAll(".about-beyond-card"));
    if (!cards.length) return null;
    var position = 0;
    var frame = null;
    var pointerStart = null;
    var pointerAxis = null;
    var dragReleaseTimer = null;
    var scrollSettleTimer = null;
    var wheelDrag = null;
    var wheelReleaseTimer = null;
    var wheelQuietWindow = 24;
    var wheelSettleDuration = 240;
    var scrollAnimationFrame = null;
    var isScrollAnimating = false;
    var cleanupHandlers = [];

    viewport.setAttribute("data-drag-surface", "");

    function metrics() {
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      return {
        gap: gap,
        step: cards[0].getBoundingClientRect().width + gap
      };
    }

    function maximumScrollLeft() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function maximumPosition() {
      return Math.max(0, Math.min(cards.length - 1, Math.ceil(maximumScrollLeft() / metrics().step)));
    }

    function clampPosition(nextPosition) {
      return Math.max(0, Math.min(nextPosition, maximumPosition()));
    }

    function updateState() {
      previous.disabled = position === 0;
      next.disabled = position === maximumPosition();
      cards.forEach(function (card, index) {
        card.setAttribute("aria-hidden", index === position ? "false" : "true");
      });
    }

    function cancelScrollAnimation() {
      if (scrollAnimationFrame) window.cancelAnimationFrame(scrollAnimationFrame);
      scrollAnimationFrame = null;
      isScrollAnimating = false;
    }

    function animateScrollTo(left, duration) {
      cancelScrollAnimation();
      var start = viewport.scrollLeft;
      var distance = left - start;
      if (Math.abs(distance) < 1) {
        viewport.scrollLeft = left;
        return;
      }

      var startedAt = performance.now();
      duration = duration || 420;
      isScrollAnimating = true;

      function tick(now) {
        var progress = Math.min(1, (now - startedAt) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        viewport.scrollLeft = start + (distance * eased);
        if (progress < 1) {
          scrollAnimationFrame = window.requestAnimationFrame(tick);
          return;
        }
        viewport.scrollLeft = left;
        scrollAnimationFrame = null;
        isScrollAnimating = false;
      }

      scrollAnimationFrame = window.requestAnimationFrame(tick);
    }

    function setPosition(nextPosition, animate, duration) {
      position = clampPosition(nextPosition);
      var left = Math.min(position * metrics().step, maximumScrollLeft());
      if (animate) {
        animateScrollTo(left, duration);
      } else {
        cancelScrollAnimation();
        viewport.scrollLeft = left;
      }

      updateState();
    }

    function settleAfterScroll() {
      if (pointerStart || isScrollAnimating) return;
      setPosition(Math.round(viewport.scrollLeft / metrics().step), true, 220);
    }

    function finishWheelDrag() {
      if (!wheelDrag || pointerStart || isScrollAnimating) return;

      var elapsed = performance.now() - wheelDrag.lastInputAt;
      if (elapsed < wheelQuietWindow) {
        wheelReleaseTimer = window.setTimeout(finishWheelDrag, wheelQuietWindow - elapsed);
        return;
      }

      var gesture = wheelDrag;
      wheelDrag = null;
      wheelReleaseTimer = null;

      var step = metrics().step;
      var moved = viewport.scrollLeft - gesture.startLeft;
      var direction = gesture.direction || (moved === 0 ? 0 : (moved > 0 ? 1 : -1));
      var threshold = Math.min(14, step * 0.03);
      var targetPosition = gesture.startPosition;
      if (Math.abs(moved) >= threshold && direction) {
        targetPosition += direction;
      } else {
        targetPosition = Math.round(viewport.scrollLeft / step);
      }

      setPosition(targetPosition, true, wheelSettleDuration);
    }

    function scheduleWheelRelease() {
      if (wheelReleaseTimer) window.clearTimeout(wheelReleaseTimer);
      wheelReleaseTimer = window.setTimeout(finishWheelDrag, wheelQuietWindow);
    }

    function syncPosition() {
      if (!viewport.clientWidth || !metrics().step) return;
      position = clampPosition(Math.round(viewport.scrollLeft / metrics().step));
      updateState();
    }

    function moveBy(direction) {
      setPosition(position + direction, true);
    }

    var handlePrevious = function () { moveBy(-1); };
    var handleNext = function () { moveBy(1); };
    previous.addEventListener("click", handlePrevious);
    next.addEventListener("click", handleNext);
    cleanupHandlers.push(function () {
      previous.removeEventListener("click", handlePrevious);
      next.removeEventListener("click", handleNext);
    });

    var handleWheel = function (event) {
      var isHorizontalWheel = Math.abs(event.deltaX) > 0;
      var isShiftWheelFallback = !isHorizontalWheel && event.shiftKey && Math.abs(event.deltaY) > 0;
      if (!isHorizontalWheel && !isShiftWheelFallback) return;

      if (scrollSettleTimer) {
        window.clearTimeout(scrollSettleTimer);
        scrollSettleTimer = null;
      }
      if (isScrollAnimating) cancelScrollAnimation();
      var delta = isHorizontalWheel ? event.deltaX : event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      if (event.deltaMode === 2) delta *= viewport.clientWidth;
      if (!wheelDrag) {
        wheelDrag = {
          startLeft: viewport.scrollLeft,
          startPosition: clampPosition(Math.round(viewport.scrollLeft / metrics().step)),
          direction: delta > 0 ? 1 : -1,
          lastInputAt: performance.now()
        };
      } else {
        wheelDrag.direction = delta > 0 ? 1 : -1;
        wheelDrag.lastInputAt = performance.now();
      }

      event.preventDefault();
      viewport.scrollLeft = Math.max(0, Math.min(
        maximumScrollLeft(),
        viewport.scrollLeft + delta
      ));
      scheduleWheelRelease();
    };
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    cleanupHandlers.push(function () { viewport.removeEventListener("wheel", handleWheel); });

    var handleScroll = function () {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(function () {
        frame = null;
        syncPosition();
      });
      if (scrollSettleTimer) window.clearTimeout(scrollSettleTimer);
      if (wheelDrag) {
        scheduleWheelRelease();
      } else if (!pointerStart && !isScrollAnimating) {
        scrollSettleTimer = window.setTimeout(function () {
          scrollSettleTimer = null;
          settleAfterScroll();
        }, 48);
      }
    };
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    cleanupHandlers.push(function () { viewport.removeEventListener("scroll", handleScroll); });

    var handleScrollEnd = function () {
      if (wheelDrag) return;
      settleAfterScroll();
    };
    viewport.addEventListener("scrollend", handleScrollEnd);
    cleanupHandlers.push(function () { viewport.removeEventListener("scrollend", handleScrollEnd); });

    var handlePointerDown = function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      if (dragReleaseTimer) window.clearTimeout(dragReleaseTimer);
      if (scrollSettleTimer) window.clearTimeout(scrollSettleTimer);
      if (wheelReleaseTimer) window.clearTimeout(wheelReleaseTimer);
      wheelDrag = null;
      cancelScrollAnimation();
      pointerStart = {
        x: event.clientX,
        y: event.clientY,
        scrollLeft: viewport.scrollLeft,
        position: position,
        lastX: event.clientX,
        lastTime: performance.now(),
        velocity: 0
      };
      pointerAxis = null;
      viewport.setPointerCapture(event.pointerId);
    };
    viewport.addEventListener("pointerdown", handlePointerDown);
    cleanupHandlers.push(function () { viewport.removeEventListener("pointerdown", handlePointerDown); });

    var handlePointerMove = function (event) {
      if (!pointerStart) return;

      var deltaX = event.clientX - pointerStart.x;
      var deltaY = event.clientY - pointerStart.y;
      if (!pointerAxis && Math.hypot(deltaX, deltaY) > 3) {
        pointerAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
      }
      if (pointerAxis !== "horizontal") return;

      event.preventDefault();
      viewport.classList.add("is-dragging");
      var now = performance.now();
      var elapsed = Math.max(1, now - pointerStart.lastTime);
      pointerStart.velocity = (pointerStart.lastX - event.clientX) / elapsed;
      pointerStart.lastX = event.clientX;
      pointerStart.lastTime = now;
      viewport.scrollLeft = Math.max(0, Math.min(
        maximumScrollLeft(),
        pointerStart.scrollLeft - deltaX
      ));
    };
    viewport.addEventListener("pointermove", handlePointerMove);
    cleanupHandlers.push(function () { viewport.removeEventListener("pointermove", handlePointerMove); });

    function finishPointerDrag(clientX) {
      if (!pointerStart) return;

      if (pointerAxis === "horizontal") {
        var step = metrics().step;
        var dragDistance = pointerStart.x - clientX;
        var dragThreshold = Math.min(28, step * 0.055);
        var targetPosition = pointerStart.position;
        var draggedEnough = Math.abs(dragDistance) >= dragThreshold;
        var flickedEnough = Math.abs(pointerStart.velocity) >= 0.08;
        if (draggedEnough || flickedEnough) {
          targetPosition += dragDistance > 0 ? 1 : -1;
        } else {
          targetPosition = Math.round(viewport.scrollLeft / step);
        }
        setPosition(targetPosition, true);
      }

      pointerStart = null;
      pointerAxis = null;
      dragReleaseTimer = window.setTimeout(function () {
        viewport.classList.remove("is-dragging");
        dragReleaseTimer = null;
      }, 320);
    }

    function endPointer(event) {
      if (!pointerStart) return;
      finishPointerDrag(event.clientX);
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    }

    var cancelPointer = function () {
      if (!pointerStart) return;
      pointerStart = null;
      pointerAxis = null;
      viewport.classList.remove("is-dragging");
      if (dragReleaseTimer) {
        window.clearTimeout(dragReleaseTimer);
        dragReleaseTimer = null;
      }
    };

    viewport.addEventListener("pointerup", endPointer);
    viewport.addEventListener("pointercancel", endPointer);
    cleanupHandlers.push(function () {
      viewport.removeEventListener("pointerup", endPointer);
      viewport.removeEventListener("pointercancel", endPointer);
    });
    var handleLostPointerCapture = function () {
      if (pointerStart && pointerAxis === "horizontal") {
        finishPointerDrag(pointerStart.lastX);
        return;
      }
      cancelPointer();
    };
    viewport.addEventListener("lostpointercapture", handleLostPointerCapture);
    window.addEventListener("blur", cancelPointer);
    cleanupHandlers.push(function () {
      viewport.removeEventListener("lostpointercapture", handleLostPointerCapture);
      window.removeEventListener("blur", cancelPointer);
    });

    var handleKeydown = function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveBy(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveBy(1);
      }
    };
    viewport.addEventListener("keydown", handleKeydown);
    cleanupHandlers.push(function () { viewport.removeEventListener("keydown", handleKeydown); });

    function handleResize() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(function () {
        frame = null;
        setPosition(position, false);
      });
    }

    window.addEventListener("resize", handleResize, { passive: true });
    cleanupHandlers.push(function () { window.removeEventListener("resize", handleResize); });
    carousel.dataset.initialized = "true";
    viewport.tabIndex = 0;
    setPosition(0, false);

    return function () {
      if (scrollSettleTimer) window.clearTimeout(scrollSettleTimer);
      if (wheelReleaseTimer) window.clearTimeout(wheelReleaseTimer);
      wheelDrag = null;
      cancelScrollAnimation();
      cleanupHandlers.forEach(function (cleanup) { cleanup(); });
    };
  }

  document.addEventListener("DOMContentLoaded", initializeBeyondCarousel);
}());
