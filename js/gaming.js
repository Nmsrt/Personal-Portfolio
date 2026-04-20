// gaming.js
document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // Footer year
  // -----------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // -----------------------------
  // Helpers to build DOM
  // -----------------------------
  const createEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  };

  // -----------------------------
  // Render genres + games
  // -----------------------------
  const genresRoot = document.getElementById("gaming-genres");

  if (
    genresRoot &&
    typeof GAMING_GENRES !== "undefined" &&
    Array.isArray(GAMING_GENRES)
  ) {
    GAMING_GENRES.forEach((genre) => {
      const card = createEl("article", "genre-card");

      // Header with pill + toggle arrow
      const header = createEl("div", "genre-header");
      const toggleBtn = createEl("button", "genre-toggle");
      toggleBtn.type = "button";
      toggleBtn.setAttribute("aria-expanded", "true");

      const pill = createEl("span", "genre-pill", genre.label || "");
      const icon = createEl("span", "genre-toggle-icon", "▾");

      toggleBtn.append(pill, icon);
      header.append(toggleBtn);
      card.append(header);

      // Game list
      const list = createEl("ul", "game-list");

      (genre.games || []).forEach((game) => {
        const li = createEl("li", "game-item");
        if (game.url) li.dataset.url = game.url;
        if (game.title) li.dataset.title = game.title;
        if (game.type) li.dataset.type = game.type;
        if (game.notes) li.dataset.notes = game.notes;
        if (game.imageSrc) li.dataset.image = game.imageSrc;

        const entry = createEl("div", "game-entry");

        const info = createEl("div", "game-info");
        const main = createEl("div", "game-main");

        const titleEl = createEl("span", "game-title", game.title || "");
        main.append(titleEl);

        if (game.type) {
          const typeEl = createEl("span", "game-type", game.type);
          typeEl.setAttribute("data-type", game.type);
          main.append(typeEl);
        }

        const notesEl = createEl("p", "game-notes", game.notes || "");
        info.append(main, notesEl);
        entry.append(info);

        if (game.imageSrc) {
          const img = createEl("img", "game-photo");
          img.src = game.imageSrc;
          img.alt = game.imageAlt || game.title || "";
          img.loading = "lazy";
          img.decoding = "async";
          entry.append(img);
        }

        li.append(entry);
        list.append(li);
      });

      card.append(list);
      genresRoot.append(card);
    });
  }

  // -----------------------------
  // Render IGNs
  // -----------------------------
  const ignListEl = document.querySelector(".ign-list");
  if (
    ignListEl &&
    typeof GAMING_IGNS !== "undefined" &&
    Array.isArray(GAMING_IGNS)
  ) {
    ignListEl.innerHTML = "";
    GAMING_IGNS.forEach((ign) => {
      const row = createEl("li", "ign-row");
      const platform = createEl("span", "ign-platform", ign.platform || "");
      const name = createEl("span", "ign-name", ign.name || "");
      row.append(platform, name);
      ignListEl.append(row);
    });
  }

  // -----------------------------
  // Genre dropdown toggles
  // -----------------------------
  const refreshGenreToggles = () => {
    const toggles = document.querySelectorAll(".genre-toggle");
    toggles.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const card = btn.closest(".genre-card");
        if (!card) return;
        const isCollapsed = card.classList.toggle("collapsed");
        btn.setAttribute("aria-expanded", String(!isCollapsed));
      });
    });
  };

  refreshGenreToggles();

  // -----------------------------
  // Modal elements
  // -----------------------------
  const modalOverlay = document.querySelector(".game-modal-overlay");
  const modalImage = document.querySelector(".game-modal-image");
  const modalTitle = document.querySelector(".game-modal-title");
  const modalType = document.querySelector(".game-modal-type");
  const modalNotes = document.querySelector(".game-modal-notes");
  const modalLink = document.querySelector(".game-modal-link");
  const modalCloseBtn = document.querySelector(".game-modal-close");

  const openModal = ({ title, type, notes, image, url }) => {
    if (!modalOverlay) return;

    if (modalTitle) modalTitle.textContent = title || "";

    if (modalType) {
      modalType.textContent = type || "";
      modalType.style.display = type ? "" : "none";
      modalType.setAttribute("data-type", type);
    }

    if (modalNotes) {
      modalNotes.textContent = notes || "";
      modalNotes.style.display = notes ? "" : "none";
    }

    if (modalImage) {
      modalImage.src = image || "";
      modalImage.alt = title || "";
      modalImage.loading = "eager";
      modalImage.decoding = "async";
    }

    if (modalLink) {
      if (url) {
        modalLink.href = url;
        modalLink.style.display = "inline-flex";
      } else {
        modalLink.removeAttribute("href");
        modalLink.style.display = "none";
      }
    }

    modalOverlay.classList.add("is-open");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  };

  const closeModal = () => {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("is-open");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  };

  // -----------------------------
  // Wire up game item clicks
  // -----------------------------
  const attachGameItemHandlers = () => {
    const items = document.querySelectorAll(".game-item");
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const title = item.dataset.title || "";
        const type = item.dataset.type || "";
        const notes = item.dataset.notes || "";
        const image = item.dataset.image || "";
        const url = item.dataset.url || "";
        openModal({ title, type, notes, image, url });
      });
    });
  };

  attachGameItemHandlers();

  // -----------------------------
  // Modal close handlers
  // -----------------------------
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      closeModal();
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) {
        closeModal();
      }
    });
  }

  window.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      modalOverlay &&
      modalOverlay.classList.contains("is-open")
    ) {
      closeModal();
    }
  });
});
