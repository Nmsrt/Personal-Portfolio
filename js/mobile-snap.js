(() => {
    const isMobileSnap = () => window.matchMedia("(max-width: 430px)").matches;

    const initMobileSnap = () => {
      const container = document.getElementById("snapContainer");
      if (!container) return false;

      // Wait until partials are actually in the DOM
      const hero = container.querySelector(".hero-canvas");
      const offer = container.querySelector("#offer, .offer-pillars");
      const tech  = container.querySelector("#tech, .tech-stack");
      if (!hero || !offer || !tech) return false;

      // Build the snap list in page order.
      // Footer: try common ids/classes; fallback to last element in container.
      const footer =
        container.querySelector("#footer") ||
        container.querySelector(".site-footer") ||
        container.lastElementChild;

      const sections = [hero, offer, tech, footer].filter(Boolean);

      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

      const closestIndex = () => {
        const y = container.scrollTop;
        let best = 0, bestDist = Infinity;
        sections.forEach((el, i) => {
          const d = Math.abs(el.offsetTop - y);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        return best;
      };

      let locked = false;
      let startY = 0;

      const jumpTo = (i) => {
        locked = true;
        const idx = clamp(i, 0, sections.length - 1);
        container.scrollTo({ top: sections[idx].offsetTop, behavior: "smooth" }); // INSTANT
        // small lock so one swipe doesn't trigger multiple jumps
        window.clearTimeout(jumpTo._t);
        jumpTo._t = window.setTimeout(() => (locked = false), 220);
      };

      // IMPORTANT: only run on mobile breakpoint
      const onTouchStart = (e) => {
        if (!isMobileSnap()) return;
        if (!e.touches || !e.touches[0]) return;
        startY = e.touches[0].clientY;
      };

      const onTouchEnd = (e) => {
        if (!isMobileSnap()) return;
        if (locked) return;

        const t = e.changedTouches && e.changedTouches[0];
        if (!t) return;

        const dy = startY - t.clientY; // swipe up => positive
        if (Math.abs(dy) < 40) return; // threshold

        const current = closestIndex();
        jumpTo(current + (dy > 0 ? 1 : -1));
      };

      container.addEventListener("touchstart", onTouchStart, { passive: true });
      container.addEventListener("touchend", onTouchEnd, { passive: true });

      // If user rotates / resizes, keep them aligned to the nearest section
      window.addEventListener("resize", () => {
        if (!isMobileSnap()) return;
        jumpTo(closestIndex());
      });

      // Snap cleanly on load (no animation)
      if (isMobileSnap()) jumpTo(closestIndex());

      return true;
    };

    // includes.js loads partials async -> poll until present
    let tries = 0;
    const tick = () => {
      if (initMobileSnap()) return;
      tries++;
      if (tries < 180) requestAnimationFrame(tick);
    };

    document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(tick));
  })();