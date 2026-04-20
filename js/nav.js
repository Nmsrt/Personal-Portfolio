(() => {
  const init = () => {
    const root = document.documentElement;
    const burger = document.querySelector(".topbar-burger");
    const closeBtns = document.querySelectorAll("[data-nav-close]");

    // Close only on actual anchor links (not buttons)
    const navLinks = document.querySelectorAll(
      ".mobile-nav a.mobile-link, .mobile-nav a.mobile-sublink"
    );

    // About dropdown
    const aboutToggle = document.querySelector(".mobile-link-toggle");

    if (!burger) return false; // header not injected yet

    const openNav = () => {
      root.classList.add("nav-open");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };

    const closeAboutMenu = () => {
      if (!aboutToggle) return;
      aboutToggle.setAttribute("aria-expanded", "false");
    };

    const closeNav = () => {
      root.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      closeAboutMenu();
    };

    burger.addEventListener("click", () => {
      root.classList.contains("nav-open") ? closeNav() : openNav();
    });

    closeBtns.forEach((b) => b.addEventListener("click", closeNav));

    // Close sidebar on link click
    navLinks.forEach((a) => a.addEventListener("click", closeNav));

    // Ensure About submenu starts closed
    closeAboutMenu();

    // Toggle About submenu without closing sidebar
    aboutToggle?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = aboutToggle.getAttribute("aria-expanded") === "true";
      aboutToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 721px)").matches) closeNav();
    });

    return true;
  };

  // keep trying until the header partial exists
  let tries = 0;
  const tick = () => {
    if (init()) return;
    if (++tries < 180) requestAnimationFrame(tick);
  };

  document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(tick));
})();
