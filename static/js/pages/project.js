(function () {
  "use strict";

  var revealCleanup = null;
  var projectCleanups = [];

  function resetProjectRuntime() {
    if (typeof revealCleanup === "function") revealCleanup();
    revealCleanup = null;
    projectCleanups.forEach(function (cleanup) {
      if (typeof cleanup === "function") cleanup();
    });
    projectCleanups = [];
  }

  function setupProjectReveal() {
    var elements = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!elements.length) return null;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach(function (element) { element.classList.add("is-visible"); });
      return null;
    }

    var observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -60px 0px", threshold: 0 });

    elements.forEach(function (element) { observer.observe(element); });
    return function () { observer.disconnect(); };
  }

  function setupProjectVideos() {
    var videos = Array.prototype.slice.call(document.querySelectorAll("video[autoplay]"));
    if (!videos.length) return null;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setPlayback(video, shouldPlay) {
      if (shouldPlay && !reduceMotion) {
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
          playRequest.catch(function () { /* Browser autoplay policy can decline silently. */ });
        }
        return;
      }
      video.pause();
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      videos.forEach(function (video) { setPlayback(video, false); });
      return null;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        setPlayback(entry.target, entry.isIntersecting && entry.intersectionRatio >= 0.1);
      });
    }, { threshold: [0, 0.1], rootMargin: "0px 0px -10% 0px" });

    videos.forEach(function (video) {
      video.pause();
      observer.observe(video);
    });

    return function () {
      observer.disconnect();
      videos.forEach(function (video) { video.pause(); });
    };
  }

  function setupProjectVideoEmbeds() {
    var frames = Array.prototype.slice.call(document.querySelectorAll(".project-video-frame"));
    if (!frames.length) return null;

    var cleanups = [];
    var heroMedia = document.querySelector(".project-hero-frame .project-media");
    var posterSource = heroMedia ? (heroMedia.currentSrc || heroMedia.src) : "";

    frames.forEach(function (frame) {
      var iframe = frame.querySelector("iframe.project-video");
      if (!iframe) return;

      var framePosterSource = frame.getAttribute("data-project-video-poster") || posterSource;
      if (framePosterSource) {
        var poster = document.createElement("img");
        poster.className = "project-video-poster";
        poster.src = framePosterSource;
        poster.alt = "";
        poster.setAttribute("aria-hidden", "true");
        frame.insertBefore(poster, iframe);
      }

      var launch = document.createElement("button");
      launch.className = "project-video-launch";
      launch.type = "button";
      var videoTitle = iframe.getAttribute("title") || "project video";
      launch.setAttribute("aria-label", "Play " + videoTitle);
      launch.innerHTML = '<span class="project-video-launch__icon" aria-hidden="true"></span>';
      frame.appendChild(launch);

      iframe.setAttribute("aria-hidden", "true");
      iframe.tabIndex = -1;

      function requestPlayback() {
        if (!iframe.contentWindow) return;
        iframe.contentWindow.postMessage(JSON.stringify({ method: "play" }), "https://player.vimeo.com");
      }

      function startPlayback() {
        frame.classList.add("is-playing");
        launch.setAttribute("aria-hidden", "true");
        launch.tabIndex = -1;
        iframe.removeAttribute("aria-hidden");
        iframe.tabIndex = 0;
        requestPlayback();
      }

      function handleLoad() {
        if (frame.classList.contains("is-playing")) requestPlayback();
      }

      launch.addEventListener("click", startPlayback);
      iframe.addEventListener("load", handleLoad);
      cleanups.push(function () {
        launch.removeEventListener("click", startPlayback);
        iframe.removeEventListener("load", handleLoad);
        launch.remove();
        var poster = frame.querySelector(".project-video-poster");
        if (poster) poster.remove();
      });
    });

    return function () {
      cleanups.forEach(function (cleanup) { cleanup(); });
    };
  }

  function setupNextSectionButton() {
    var button = document.querySelector(".next-section-button");
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-case-section]"));
    if (!button || !sections.length) return null;

    var arrow = button.querySelector(".next-arrow");
    if (arrow) {
      arrow.setAttribute("viewBox", "0 0 24 24");
      arrow.setAttribute("fill", "currentColor");
      arrow.innerHTML = '<path d="M2.5 6 12 18 21.5 6H2.5Z"></path>';
    }

    var measure = button.querySelector(".next-section-label-measure");
    var current = button.querySelector(".next-section-label-current");
    var labelHost = button.querySelector(".next-section-label");
    if (!measure || !current || !labelHost) return null;

    function findNext() {
      var threshold = window.innerHeight * 0.35;
      var currentIndex = -1;

      sections.some(function (section, index) {
        if (section.getBoundingClientRect().top > threshold) return true;
        currentIndex = index;
        return false;
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        currentIndex = sections.length - 1;
      }

      return sections[currentIndex + 1] || null;
    }

    function updateLabel(text) {
      if (current.textContent === text) return;
      var previous = current.textContent;

      labelHost.querySelectorAll(".next-section-label-previous").forEach(function (element) {
        element.remove();
      });

      if (previous) {
        var outgoing = document.createElement("span");
        outgoing.className = "next-section-label-previous";
        outgoing.textContent = previous;
        outgoing.addEventListener("animationend", function () {
          outgoing.remove();
        }, { once: true });
        labelHost.insertBefore(outgoing, current);
      }

      measure.textContent = text;
      current.textContent = text;
      current.classList.remove("is-entering");
      void current.offsetWidth;
      current.classList.add("is-entering");
    }

    function update() {
      var next = findNext();
      if (!next) {
        button.dataset.visible = "false";
        button.setAttribute("aria-hidden", "true");
        button.tabIndex = -1;
        button.disabled = true;
        return;
      }

      var sectionName = next.querySelector(".project-section-header .project-eyebrow");
      var label = sectionName ? sectionName.textContent.trim() : "Next section";
      updateLabel(label);
      button.dataset.visible = "true";
      button.setAttribute("aria-hidden", "false");
      button.tabIndex = 0;
      button.disabled = false;
      button.setAttribute("aria-label", "Skip to next section: " + label);
    }

    var handleClick = function () {
      var next = findNext();
      if (next) next.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    var frameRequested = false;
    var queueUpdate = function () {
      if (frameRequested) return;
      frameRequested = true;
      requestAnimationFrame(function () {
        frameRequested = false;
        update();
      });
    };

    button.addEventListener("click", handleClick);
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate, { passive: true });
    update();

    return function () {
      button.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }

  function setupProjectCarousel(carousel) {
    if (!carousel || carousel.dataset.initialized === "true") return null;

    var viewport = carousel.querySelector(".project-carousel__viewport");
    var track = carousel.querySelector(".project-carousel__track");
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".project-carousel__slide"));
    var previous = carousel.querySelector("[data-project-carousel-prev]");
    var next = carousel.querySelector("[data-project-carousel-next]");
    if (!viewport || !track || !slides.length || !previous || !next) return null;

    var previousPath = previous.querySelector("svg path");
    var nextPath = next.querySelector("svg path");
    if (previousPath) previousPath.setAttribute("d", "m20 25c-.3838 0-.7676-.1465-1.0605-.4395l-5.5-5.5c-.5859-.5854-.5859-1.5356 0-2.1211l5.5-5.5c.5859-.5859 1.5352-.5859 2.1211 0 .5859.5854.5859 1.5356 0 2.1211l-4.4395 4.4395 4.4395 4.4395c.5859.5854.5859 1.5356 0 2.1211-.293.293-.6768.4395-1.0605.4395z");
    if (nextPath) nextPath.setAttribute("d", "m22.5597 16.9375-5.5076-5.5c-.5854-.5854-1.5323-.5825-2.1157.0039-.5835.5869-.5815 1.5366.0039 2.1211l4.4438 4.4375-4.4438 4.4375c-.5854.5845-.5874 1.5342-.0039 2.1211.2922.2944.676.4414 1.0598.4414.3818 0 .7637-.1455 1.0559-.4375l5.5076-5.5c.2815-.2812.4403-.6636.4403-1.0625s-.1588-.7812-.4403-1.0625z");

    viewport.setAttribute("data-drag-surface", "");

    var position = 0;
    var visibleCount = Math.max(1, parseInt(carousel.getAttribute("data-project-carousel-visible"), 10) || 1);
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
    var hintObserver = null;

    function activateSwipeHint() {
      if (!carousel.querySelector(".project-carousel__swipe-hint") || carousel.dataset.hintSeen === "true") return;
      carousel.dataset.hintSeen = "true";
      carousel.classList.add("is-hint-active");
    }

    if (carousel.querySelector(".project-carousel__swipe-hint")) {
      if ("IntersectionObserver" in window) {
        hintObserver = new IntersectionObserver(function (entries) {
          if (entries.some(function (entry) { return entry.isIntersecting && entry.intersectionRatio >= 0.1; })) {
            activateSwipeHint();
            hintObserver.disconnect();
          }
        }, { threshold: [0, 0.1] });
        hintObserver.observe(carousel);
      } else {
        activateSwipeHint();
      }
      cleanupHandlers.push(function () {
        if (hintObserver) hintObserver.disconnect();
      });
    }

    function metrics() {
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      return {
        gap: gap,
        step: slides[0].getBoundingClientRect().width + gap
      };
    }

    function maximumScrollLeft() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function maximumPosition() {
      return Math.max(0, Math.min(slides.length - visibleCount, Math.ceil(maximumScrollLeft() / metrics().step)));
    }

    function clampPosition(nextPosition) {
      return Math.max(0, Math.min(nextPosition, maximumPosition()));
    }

    function updateState() {
      previous.disabled = position === 0;
      next.disabled = position === maximumPosition();
      slides.forEach(function (slide, index) {
        var isVisible = index >= position && index < position + visibleCount;
        slide.setAttribute("aria-hidden", isVisible ? "false" : "true");
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
      // Wheel and trackpad deltas arrive as smaller, discrete samples than a
      // pointer drag. Use a lower commit threshold so a light swipe can still
      // finish the same adjacent-card transition without changing drag input.
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
        var dragDistance = pointerStart.x - clientX;
        var step = metrics().step;
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

  function initializeProjectCarousels() {
    var carousels = Array.prototype.slice.call(document.querySelectorAll("[data-project-carousel]"));
    return carousels.map(setupProjectCarousel).filter(Boolean);
  }

  function initializePage() {
    resetProjectRuntime();
    revealCleanup = setupProjectReveal();
    var videoCleanup = setupProjectVideos();
    if (videoCleanup) projectCleanups.push(videoCleanup);
    var videoEmbedCleanup = setupProjectVideoEmbeds();
    if (videoEmbedCleanup) projectCleanups.push(videoEmbedCleanup);
    var nextSectionCleanup = setupNextSectionButton();
    if (nextSectionCleanup) projectCleanups.push(nextSectionCleanup);
    projectCleanups = projectCleanups.concat(initializeProjectCarousels());
  }

  document.addEventListener("DOMContentLoaded", initializePage);
}());
