(function () {
  "use strict";

  var SHARED_TAB_TITLE = "Yuhui Qi";

  function setupSharedTabTitle() {
    document.title = SHARED_TAB_TITLE;
  }

  function pageKeyFromUrl(url) {
    var pathname = new URL(url, window.location.href).pathname.replace(/\/+$/, "") || "/";
    if (pathname === "/" || /\/index(?:\.html)?$/.test(pathname)) return "index";
    if (/\/works(?:\.html)?$/.test(pathname)) return "works";
    if (/\/about(?:\.html)?$/.test(pathname)) return "about";
    if (/\/work\/[^/]+\.html$/.test(pathname)) return "project";
    return null;
  }

  var initialNavigationEntry = window.performance && window.performance.getEntriesByType
    ? window.performance.getEntriesByType("navigation")[0]
    : null;
  var skipPageEntry = pageKeyFromUrl(window.location.href) === "works"
    || (initialNavigationEntry && initialNavigationEntry.type === "back_forward");

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && !skipPageEntry) {
    document.documentElement.dataset.pageEntry = "pending";
  }

  function setupPageEntry() {
    var entry = document.querySelector("[data-page-entry]");
    var navigationEntry = window.performance && window.performance.getEntriesByType
      ? window.performance.getEntriesByType("navigation")[0]
      : null;
    var isHistoryTraversal = navigationEntry && navigationEntry.type === "back_forward";
    var isWorksPage = pageKeyFromUrl(window.location.href) === "works";
    if (!entry || window.matchMedia("(prefers-reduced-motion: reduce)").matches || isHistoryTraversal || isWorksPage) {
      document.documentElement.dataset.pageEntry = "ready";
      return;
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.dataset.pageEntry = "ready";
      });
    });
  }

  function setupPointer() {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    var dot = document.querySelector(".custom-cursor-dot");
    var ring = document.querySelector(".custom-cursor-ring");
    if (!dot || !ring) return;

    var pointer = { x: -100, y: -100 };
    var ringPosition = { x: -100, y: -100 };
    var frameRequested = false;
    var pointerSuspended = false;
    var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function setPointerState(state) {
      dot.dataset.state = state;
      ring.dataset.state = state;
    }

    function syncPointerState(target) {
      var interactiveTarget = target && target.closest
        ? target.closest("a, button, [role=\"button\"], [data-cursor]")
        : null;
      if (!interactiveTarget) {
        setPointerState("default");
        return;
      }
      setPointerState(interactiveTarget.dataset.cursor || (interactiveTarget.tagName === "BUTTON" ? "hover" : "link"));
    }

    function renderPointer() {
      frameRequested = false;
      if (pointerSuspended) return;
      var easing = reducedMotionQuery.matches ? 1 : 0.18;
      ringPosition.x += (pointer.x - ringPosition.x) * easing;
      ringPosition.y += (pointer.y - ringPosition.y) * easing;
      dot.style.transform = "translate3d(" + pointer.x + "px, " + pointer.y + "px, 0) translate3d(-50%, -50%, 0)";
      ring.style.transform = "translate3d(" + ringPosition.x + "px, " + ringPosition.y + "px, 0) translate3d(-50%, -50%, 0)";
      if (Math.abs(pointer.x - ringPosition.x) > 0.1 || Math.abs(pointer.y - ringPosition.y) > 0.1) {
        requestAnimationFrame(renderPointer);
      }
    }

    function queuePointerFrame() {
      if (!frameRequested && !pointerSuspended) {
        frameRequested = true;
        requestAnimationFrame(renderPointer);
      }
    }

    function suspendPointer(shouldSuspend) {
      pointerSuspended = shouldSuspend;
      dot.dataset.suspended = String(shouldSuspend);
      ring.dataset.suspended = String(shouldSuspend);
      if (shouldSuspend) {
        dot.dataset.visible = "false";
        ring.dataset.visible = "false";
      }
    }

    document.addEventListener("pointermove", function (event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      dot.dataset.visible = "true";
      ring.dataset.visible = "true";
      syncPointerState(event.target);
      queuePointerFrame();
    }, { passive: true });

    document.addEventListener("pointerleave", function () {
      dot.dataset.visible = "false";
      ring.dataset.visible = "false";
    });

    document.addEventListener("pointerover", function (event) {
      syncPointerState(event.target);
    });

    document.addEventListener("pointerout", function (event) {
      var target = event.target.closest("a, button, [role=\"button\"], [data-cursor]");
      if (target && !target.contains(event.relatedTarget)) {
        syncPointerState(event.relatedTarget);
      }
    });

    document.querySelectorAll("[data-cursor-suspend], .project-video-frame").forEach(function (surface) {
      surface.addEventListener("pointerenter", function () { suspendPointer(true); }, { passive: true });
      surface.addEventListener("pointerleave", function () { suspendPointer(false); }, { passive: true });
    });

    return function resetPointerState() {
      setPointerState("default");
    };
  }

  function setupMobileNavigation() {
    var rail = document.querySelector(".portfolio-rail");
    var railLinks = rail ? Array.prototype.slice.call(rail.querySelectorAll(".rail-project-link")) : [];
    var brand = rail ? rail.querySelector(".rail-brand") : null;
    if (!rail || !railLinks.length || !brand || document.querySelector(".mobile-site-header")) return;

    var header = document.createElement("header");
    header.className = "mobile-site-header";
    header.innerHTML = '<div class="mobile-site-header-inner"><a class="mobile-site-brand" href="' + brand.getAttribute("href") + '" aria-label="Yuhui Qi home"><img src="' + brand.querySelector("img").getAttribute("src") + '" alt=""></a><button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-site-menu" aria-label="Open navigation"><span></span><span></span></button></div><nav class="mobile-site-menu" id="mobile-site-menu" aria-label="Primary navigation"></nav>';
    var menu = header.querySelector(".mobile-site-menu");
    var toggle = header.querySelector(".mobile-menu-toggle");

    railLinks.forEach(function (link) {
      var item = document.createElement("a");
      item.href = link.getAttribute("href");
      item.textContent = link.querySelector(".rail-project-name").textContent.trim();
      if (link.getAttribute("aria-current") === "page") item.setAttribute("aria-current", "page");
      menu.appendChild(item);
    });

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      menu.setAttribute("aria-hidden", "true");
      menu.inert = true;
      menu.classList.remove("is-open");
    }

    window.__portfolioCloseMobileNavigation = closeMenu;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      menu.setAttribute("aria-hidden", String(!open));
      menu.inert = !open;
      menu.classList.toggle("is-open", open);
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    closeMenu();
    document.body.prepend(header);
  }

  function setupRailFooter() {
    var railBottom = document.querySelector(".rail-bottom");
    if (!railBottom) return;

    railBottom.innerHTML = '<div class="rail-footer-divider" aria-hidden="true"></div><div class="rail-footer-meta"><p class="rail-copyright">© 2026 Yuhui Qi</p><nav class="rail-social-links" aria-label="Social links"><a class="rail-social-link rail-social-link--linkedin" href="https://www.linkedin.com/in/kingsley-qi/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.3 8.5H3.2V20h3.1V8.5ZM4.75 3A1.8 1.8 0 1 0 4.75 6.6 1.8 1.8 0 0 0 4.75 3ZM8.8 8.5V20h3.1v-5.7c0-1.5.3-3 2.2-3 1.9 0 1.9 1.8 1.9 3.1V20H19v-6.3c0-3.1-.7-5.5-4.4-5.5-1.8 0-3 .9-3.5 1.7h-.1V8.5H8.8Z"></path></svg></a><a class="rail-social-link rail-social-link--instagram" href="https://www.instagram.com/backup.7.0" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.35" cy="6.65" r="0.85" fill="currentColor" stroke="none"></circle></svg></a><a class="rail-social-link rail-social-link--resume" href="static/documents/Resume%20-%20Yuhui%20Qi.pdf" target="_blank" rel="noopener noreferrer" aria-label="Resume"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.75 2.75h5.1l5.4 5.4v13.1H6.75a1.5 1.5 0 0 1-1.5-1.5V4.25a1.5 1.5 0 0 1 1.5-1.5Z"></path><path d="M11.85 2.75v5.4h5.4"></path><path d="M12 11.25v6"></path><path d="m9.5 14.75 2.5 2.5 2.5-2.5"></path></svg></a></nav></div>';
    var resumeLink = railBottom.querySelector(".rail-social-link--resume");
    if (resumeLink && pageKeyFromUrl(window.location.href) === "project") {
      resumeLink.href = "../static/documents/Resume%20-%20Yuhui%20Qi.pdf";
    }
  }

  function setupPlaceholders() {
    document.querySelectorAll("[data-placeholder]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var destination = document.querySelector(link.getAttribute("href"));
        if (!destination) return;
        event.preventDefault();
        destination.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setupLocalSectionNav() {
    var nav = document.querySelector("[data-local-nav]");
    var candidates = nav ? Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']")) : [];
    var items = candidates.map(function (link) {
      var id = link.getAttribute("href").slice(1);
      return { link: link, section: id ? document.getElementById(id) : null };
    }).filter(function (item) { return item.section; });
    if (!nav || !items.length) return;

    var links = items.map(function (item) { return item.link; });
    var sections = items.map(function (item) { return item.section; });
    var pageEntry = document.querySelector("main[data-page-entry], article[data-page-entry]");
    var basePageEntryPaddingBottom = pageEntry ? parseFloat(window.getComputedStyle(pageEntry).paddingBottom) || 0 : 0;

    var indicator = nav.querySelector(".page-local-nav-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "page-local-nav-indicator";
      indicator.setAttribute("aria-hidden", "true");
      nav.appendChild(indicator);
    }

    var activeLink = links.find(function (link) {
      return link.getAttribute("href") === window.location.hash;
    }) || links.find(function (link) {
      return link.classList.contains("is-active");
    }) || links[0];
    var pendingNavigation = null;
    var pendingReleaseTimer = 0;
    var scrollFrameRequested = false;
    var destroyed = false;

    function positionIndicator(link, animate) {
      if (!link) return;
      var navRect = nav.getBoundingClientRect();
      var linkRect = link.getBoundingClientRect();
      var left = linkRect.left - navRect.left - nav.clientLeft + nav.scrollLeft;
      var top = linkRect.top - navRect.top - nav.clientTop + nav.scrollTop;
      if (!animate) indicator.classList.add("is-prepared");
      indicator.style.width = linkRect.width + "px";
      indicator.style.height = linkRect.height + "px";
      indicator.style.transform = "translate3d(" + left + "px, " + top + "px, 0)";
      if (!animate) {
        requestAnimationFrame(function () { indicator.classList.remove("is-prepared"); });
      }
    }

    function setActive(link, animate, force) {
      if (!link) return;
      var changed = activeLink !== link;
      if (!changed && !force) return;
      activeLink = link;
      links.forEach(function (item) {
        item.classList.toggle("is-active", item === link);
      });
      positionIndicator(link, animate && changed);
    }

    setActive(activeLink, false, true);

    function getLocalNavTitleGap() {
      var rootStyles = window.getComputedStyle(document.documentElement);
      var gapValue = rootStyles.getPropertyValue("--local-nav-title-gap").trim();
      var rootFontSize = parseFloat(rootStyles.fontSize) || 16;
      var titleGap = parseFloat(gapValue) || 40;
      if (gapValue.indexOf("rem") !== -1) titleGap *= rootFontSize;
      return titleGap;
    }

    function getSectionAnchor(section) {
      return section.querySelector("[data-local-section-title]") || section;
    }

    function getSectionActivationLine() {
      return nav.getBoundingClientRect().bottom + getLocalNavTitleGap();
    }

    function findActiveLink() {
      var activationLine = getSectionActivationLine();
      var current = links[0];
      sections.forEach(function (section, index) {
        if (getSectionAnchor(section).getBoundingClientRect().top <= activationLine) {
          current = links[index];
        }
      });

      return current;
    }

    function updateFromScroll() {
      if (scrollFrameRequested) return;
      scrollFrameRequested = true;
      requestAnimationFrame(function () {
        if (destroyed) return;
        scrollFrameRequested = false;
        if (pendingNavigation) {
          setActive(pendingNavigation.link, false);
          return;
        }
        setActive(findActiveLink(), true);
      });
    }

    function clearPendingNavigation() {
      pendingNavigation = null;
      window.clearTimeout(pendingReleaseTimer);
      pendingReleaseTimer = 0;
    }

    function getSectionTargetY(section) {
      var title = getSectionAnchor(section);
      var targetTop = getSectionActivationLine();
      var targetY = window.scrollY + title.getBoundingClientRect().top - targetTop;
      // Scroll to the next pixel so sub-pixel layout rounding cannot leave
      // the title just below the active threshold after a navigation click.
      return Math.max(0, Math.ceil(targetY));
    }

    function ensureLastSectionReachable() {
      if (!pageEntry) return;

      // The final section must be able to reach the same activation line as
      // every other section. Without enough document height, the browser
      // clamps the scroll position first and the previous section remains
      // active even though the final link was clicked.
      if (!nav.getClientRects().length) {
        pageEntry.style.paddingBottom = basePageEntryPaddingBottom + "px";
        return;
      }

      pageEntry.style.paddingBottom = basePageEntryPaddingBottom + "px";
      var targetY = getSectionTargetY(sections[sections.length - 1]);
      var maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      var shortfall = targetY - maxScrollY;
      if (shortfall > 0) {
        pageEntry.style.paddingBottom = (basePageEntryPaddingBottom + Math.ceil(shortfall) + 1) + "px";
      }
    }

    function finishPendingNavigation(force) {
      if (!pendingNavigation) return;
      var distance = Math.abs(window.scrollY - pendingNavigation.targetY);
      var destination = getSectionAnchor(sections[pendingNavigation.index]);
      var targetReached = distance <= 0.5 && destination.getBoundingClientRect().top <= getSectionActivationLine();
      // Keep the requested item locked until the smooth scroll is actually
      // at its target. Releasing it 16px early lets scroll detection briefly
      // promote the previous section, which creates a visible bounce.
      if (!force && !targetReached) return;
      var completedLink = pendingNavigation.link;
      clearPendingNavigation();
      setActive(completedLink, false, true);
      updateFromScroll();
    }

    function startNavigation(index, updateHistory) {
      var section = sections[index];
      var link = links[index];
      if (!section || !link) return;

      clearPendingNavigation();
      pendingNavigation = {
        index: index,
        link: link,
        targetY: getSectionTargetY(section)
      };
      setActive(link, true, true);
      if (updateHistory) window.history.pushState(null, "", link.getAttribute("href"));

      window.scrollTo({
        top: pendingNavigation.targetY,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });

      pendingReleaseTimer = window.setTimeout(function () {
        finishPendingNavigation(true);
      }, 2400);
    }

    var clickHandlers = [];
    links.forEach(function (link, index) {
      var handleClick = function (event) {
        if ((event.button != null && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        startNavigation(index, true);
      };
      clickHandlers.push({ link: link, handler: handleClick });
      link.addEventListener("click", handleClick);
    });

    var handleScroll = function () {
      if (pendingNavigation) finishPendingNavigation(false);
      updateFromScroll();
    };
    var handleResize = function () {
      ensureLastSectionReachable();
      if (pendingNavigation) pendingNavigation.targetY = getSectionTargetY(sections[pendingNavigation.index]);
      positionIndicator(activeLink, false);
      updateFromScroll();
    };
    var handleScrollEnd = function () { finishPendingNavigation(false); };
    var handleHashChange = function () {
      var index = links.findIndex(function (link) { return link.getAttribute("href") === window.location.hash; });
      if (index === -1) return;
      startNavigation(index, false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scrollend", handleScrollEnd, { passive: true });
    window.addEventListener("hashchange", handleHashChange, { passive: true });
    ensureLastSectionReachable();
    window.addEventListener("load", ensureLastSectionReachable, { passive: true });
    updateFromScroll();

    return function () {
      destroyed = true;
      clearPendingNavigation();
      clickHandlers.forEach(function (item) { item.link.removeEventListener("click", item.handler); });
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scrollend", handleScrollEnd);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("load", ensureLastSectionReachable);
    };
  }

  function setupRailSelection() {
    var nav = document.querySelector(".rail-primary-nav");
    var links = nav ? Array.prototype.slice.call(nav.querySelectorAll(".rail-project-link")) : [];
    if (!nav || !links.length) return;

    var indicator = nav.querySelector(".rail-project-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "rail-project-indicator";
      indicator.setAttribute("aria-hidden", "true");
      nav.appendChild(indicator);
    }

    var selectedLink = links.find(function (link) {
      return link.getAttribute("aria-current") === "page";
    }) || links[0];
    var pendingNavigationTimer = 0;

    function positionIndicator(link, animate) {
      if (!link) return;
      var navRect = nav.getBoundingClientRect();
      var linkRect = link.getBoundingClientRect();
      var left = linkRect.left - navRect.left - nav.clientLeft + nav.scrollLeft;
      var top = linkRect.top - navRect.top - nav.clientTop + nav.scrollTop;
      if (!animate) indicator.classList.add("is-prepared");
      indicator.style.width = linkRect.width + "px";
      indicator.style.height = linkRect.height + "px";
      indicator.style.transform = "translate3d(" + left + "px, " + top + "px, 0)";
      if (!animate) {
        requestAnimationFrame(function () { indicator.classList.remove("is-prepared"); });
      }
    }

    function selectLink(link, animate) {
      if (!link || link === selectedLink) return;
      selectedLink = link;
      links.forEach(function (item) {
        if (item === link) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
      });
      positionIndicator(selectedLink, animate !== false);
    }

    function syncForUrl(url) {
      var page = pageKeyFromUrl(url);
      if (page === "project") page = "works";
      var link = links.find(function (item) { return pageKeyFromUrl(item.href) === page; });
      if (link) selectLink(link, true);
      document.querySelectorAll(".mobile-site-menu a").forEach(function (item) {
        item.toggleAttribute("aria-current", pageKeyFromUrl(item.href) === page);
      });
    }

    function handleRailNavigation(event) {
      if ((event.button != null && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.currentTarget;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      var target;
      try {
        target = new URL(link.href, window.location.href);
      } catch (error) {
        return;
      }
      if (target.origin !== window.location.origin || target.href === window.location.href) return;

      event.preventDefault();
      if (pendingNavigationTimer) window.clearTimeout(pendingNavigationTimer);
      selectLink(link, true);

      try {
        window.sessionStorage.setItem("portfolio-rail-source-animated", "1");
      } catch (error) {
        // The destination page keeps its existing fallback animation.
      }

      var delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : parseFloat(getComputedStyle(indicator).transitionDuration) * 1000 || 320;
      pendingNavigationTimer = window.setTimeout(function () {
        pendingNavigationTimer = 0;
        window.location.assign(target.href);
      }, delay);
    }

    links.forEach(function (link) {
      link.addEventListener("click", handleRailNavigation);
    });

    window.__portfolioRailSelection = {
      select: selectLink,
      syncForUrl: syncForUrl
    };

    var railTransition = null;
    var sourceAnimationCompleted = false;
    try {
      railTransition = window.sessionStorage.getItem("portfolio-rail-transition");
      if (railTransition) window.sessionStorage.removeItem("portfolio-rail-transition");
      sourceAnimationCompleted = window.sessionStorage.getItem("portfolio-rail-source-animated") === "1";
      if (sourceAnimationCompleted) window.sessionStorage.removeItem("portfolio-rail-source-animated");
    } catch (error) {
      railTransition = null;
      sourceAnimationCompleted = false;
    }

    var currentPage = pageKeyFromUrl(window.location.href);
    if (currentPage === "project") currentPage = "works";
    var transitionParts = railTransition ? railTransition.split(">") : [];
    var originPage = transitionParts[0];
    var transitionTarget = transitionParts[1];
    var originLink = originPage && transitionTarget === currentPage
      ? links.find(function (link) {
        var page = pageKeyFromUrl(link.href);
        return page === originPage;
      })
      : null;

    if (originLink && originLink !== selectedLink && !sourceAnimationCompleted) {
      positionIndicator(originLink, false);
      requestAnimationFrame(function () {
        positionIndicator(selectedLink, true);
      });
    } else {
      positionIndicator(selectedLink, false);
    }

    // Primary rail links use native document navigation. The destination page
    // receives the source-animation marker so it does not replay the same
    // indicator movement after the document has loaded.
    window.addEventListener("resize", function () { positionIndicator(selectedLink, false); }, { passive: true });
  }


  function setupInternalNavigation() {
    if ("scrollRestoration" in window.history) {
      // Let the browser restore Back/Forward positions, including BFCache
      // entries. The custom logic below is only a fallback for a document
      // navigation where the browser has not restored a saved position.
      window.history.scrollRestoration = "auto";
    }

    var scrollStateKey = "portfolioScrollY";
    var scrollMemoryPrefix = "portfolio-scroll:";

    function getScrollMemoryKey() {
      return scrollMemoryPrefix + window.location.pathname + window.location.search + window.location.hash;
    }

    function getUrlKey(url) {
      var target = new URL(url, window.location.href);
      return target.pathname + target.search + target.hash;
    }

    function saveScrollPosition() {
      var top = Math.max(0, Math.round(window.scrollY));

      try {
        window.sessionStorage.setItem(getScrollMemoryKey(), String(top));
      } catch (error) {
        // The history entry below still provides restoration when storage is unavailable.
      }

      try {
        var currentState = window.history.state;
        var nextState = currentState && typeof currentState === "object"
          ? Object.assign({}, currentState)
          : {};
        if (nextState[scrollStateKey] === top) return;
        nextState[scrollStateKey] = top;
        window.history.replaceState(nextState, "", window.location.href);
      } catch (error) {
        // Scroll restoration remains best-effort when history is unavailable.
      }
    }

    function readScrollPosition() {
      // A history entry is more precise than a URL key when the same page is
      // opened more than once in a session.
      try {
        var state = window.history.state;
        var historyValue = state && typeof state === "object"
          ? Number(state[scrollStateKey])
          : NaN;
        if (Number.isFinite(historyValue)) return Math.max(0, historyValue);
      } catch (error) {
        // Fall through to the session memory below.
      }

      try {
        var stored = Number(window.sessionStorage.getItem(getScrollMemoryKey()));
        if (Number.isFinite(stored)) return Math.max(0, stored);
      } catch (error) {
        // Fall through to the history entry below.
      }

      return null;
    }

    function clearScrollMemory() {
      try {
        window.sessionStorage.removeItem(getScrollMemoryKey());
      } catch (error) {
        // A new navigation still starts at the top when storage is unavailable.
      }
    }

    function markFreshNavigation(event) {
      if ((event.button != null && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      var target;
      try {
        target = new URL(link.href, window.location.href);
      } catch (error) {
        return;
      }
      if (target.origin !== window.location.origin || getUrlKey(target.href) === getUrlKey(window.location.href)) return;

      var originPage = pageKeyFromUrl(window.location.href);
      var targetPage = pageKeyFromUrl(target.href);
      if (originPage === "project" && targetPage === "works") {
        // Works is the semantic return destination for every project page.
        // Preserve the gallery's saved position instead of treating it as a
        // fresh visit to Works. This is intentionally route-based rather than
        // project- or device-specific.
        try {
          window.sessionStorage.removeItem("portfolio-navigation-intent");
        } catch (error) {
          // Native navigation still proceeds when storage is unavailable.
        }
        return;
      }

      try {
        window.sessionStorage.setItem("portfolio-navigation-intent", getUrlKey(target.href));
        window.sessionStorage.removeItem(scrollMemoryPrefix + getUrlKey(target.href));
        if (originPage === "project") originPage = "works";
        if (targetPage === "project") targetPage = "works";
        if (originPage && targetPage && originPage !== targetPage) {
          window.sessionStorage.setItem("portfolio-rail-transition", originPage + ">" + targetPage);
        }
      } catch (error) {
        // Native navigation still proceeds when storage is unavailable.
      }
    }

    function consumeFreshNavigationIntent() {
      try {
        var intent = window.sessionStorage.getItem("portfolio-navigation-intent");
        if (intent !== getUrlKey(window.location.href)) return false;
        window.sessionStorage.removeItem("portfolio-navigation-intent");
        clearScrollMemory();
        return true;
      } catch (error) {
        return false;
      }
    }

    var freshNavigation = consumeFreshNavigationIntent();
    var navigationEntry = window.performance && window.performance.getEntriesByType
      ? window.performance.getEntriesByType("navigation")[0]
      : null;
    var isHistoryTraversal = navigationEntry && navigationEntry.type === "back_forward";
    var scrollSavingReady = false;
    var pageShowHandled = false;
    var userScrollIntent = false;

    function restoreScrollPosition(top) {
      var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      var target = Math.min(Math.max(0, top), maxScroll);
      var previousBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo({ top: target, left: 0, behavior: "auto" });
      document.documentElement.style.scrollBehavior = previousBehavior;
    }

    function waitForStableLayout(onStable) {
      var imageReady = Array.prototype.map.call(document.images, function (image) {
        if (image.complete) {
          return image.decode ? image.decode().catch(function () {}) : Promise.resolve();
        }
        if (image.loading === "lazy") return Promise.resolve();
        return new Promise(function (resolve) {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
          window.setTimeout(resolve, 1200);
        });
      });
      var fontReady = document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();

      Promise.race([
        Promise.all([Promise.all(imageReady), fontReady]),
        new Promise(function (resolve) { window.setTimeout(resolve, 1200); })
      ]).then(function () {
        var lastHeight = -1;
        var stableFrames = 0;
        var startedAt = window.performance && window.performance.now
          ? window.performance.now()
          : Date.now();

        function checkHeight() {
          var height = document.documentElement.scrollHeight;
          stableFrames = height === lastHeight ? stableFrames + 1 : 0;
          lastHeight = height;
          var now = window.performance && window.performance.now
            ? window.performance.now()
            : Date.now();
          if (stableFrames >= 4 || now - startedAt >= 1600) {
            onStable();
            return;
          }
          window.requestAnimationFrame(checkHeight);
        }

        window.requestAnimationFrame(checkHeight);
      });
    }

    function handlePageShow(event) {
      if (pageShowHandled) return;
      pageShowHandled = true;

      // A persisted page already contains the browser's exact scroll state.
      // Do not overwrite it with a URL-based fallback.
      if (event && event.persisted) {
        scrollSavingReady = true;
        return;
      }

      var remembered = readScrollPosition();
      waitForStableLayout(function () {
        // Never take control back from someone who started scrolling while
        // images, fonts, or embeds were still settling.
        if (userScrollIntent) {
          scrollSavingReady = true;
          return;
        }
        if (freshNavigation) {
          restoreScrollPosition(0);
        } else if (!isHistoryTraversal && remembered != null) {
          restoreScrollPosition(remembered);
        } else if (isHistoryTraversal && remembered != null && window.scrollY <= 1) {
          // Native restoration is preferred. This only runs when a full
          // document traversal returned at the top despite saved state.
          restoreScrollPosition(remembered);
        }
        scrollSavingReady = true;
      });
    }

    function markUserScrollIntent(event) {
      if (event.type === "keydown") {
        var scrollKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
        if (scrollKeys.indexOf(event.key) === -1) return;
      }
      userScrollIntent = true;
    }

    if (freshNavigation) {
      clearScrollMemory();
      saveScrollPosition();
    }

    var saveFrame = 0;
    function queueScrollSave() {
      if (!scrollSavingReady) return;
      if (saveFrame) return;
      saveFrame = window.requestAnimationFrame(function () {
        saveFrame = 0;
        saveScrollPosition();
      });
    }

    window.addEventListener("scroll", queueScrollSave, { passive: true });
    window.addEventListener("wheel", markUserScrollIntent, { passive: true, capture: true });
    window.addEventListener("touchstart", markUserScrollIntent, { passive: true, capture: true });
    window.addEventListener("pointerdown", markUserScrollIntent, { passive: true, capture: true });
    document.addEventListener("keydown", markUserScrollIntent, true);
    document.addEventListener("click", markFreshNavigation, true);
    window.addEventListener("pagehide", saveScrollPosition, { passive: true });
    window.addEventListener("beforeunload", saveScrollPosition);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") saveScrollPosition();
    });
    window.addEventListener("pageshow", handlePageShow, { passive: true });
    if (document.readyState === "complete") {
      handlePageShow();
    }
  }

  var resetPointerState = null;

  function initializeSharedRuntime() {
    setupSharedTabTitle();
    setupPageEntry();
    resetPointerState = setupPointer() || null;
    setupRailFooter();
    setupMobileNavigation();
    setupPlaceholders();
    setupLocalSectionNav();
    setupRailSelection();
    setupInternalNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSharedRuntime, { once: true });
  } else {
    initializeSharedRuntime();
  }
}());
