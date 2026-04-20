// js/desksetup.js

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".desk-grid");
  const items = window.DESK_ITEMS || [];

  const modal = document.getElementById("desk-modal");
  if (!grid || !modal) return;

  const modalTitle = modal.querySelector("#desk-modal-title");
  const modalMeta = modal.querySelector("#desk-modal-meta");
  const modalSpecs = modal.querySelector("#desk-modal-specs");
  const modalImg = modal.querySelector("#desk-modal-image");

  // ---------- RENDER CARDS FROM DATA ----------
  const renderCards = () => {
    if (!items.length) return;

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card desk-card";
      card.dataset.itemId = item.id;

      const tag = document.createElement("div");
      tag.className = "card-tag";
      tag.textContent = item.tag;

      const title = document.createElement("h2");
      title.className = "desk-card-title";
      title.textContent = item.title;

      const meta = document.createElement("p");
      meta.className = "desk-card-meta";
      meta.textContent = item.meta;

      const specList = document.createElement("ul");
      specList.className = "desk-spec-list";

      item.specs.forEach((spec) => {
        const li = document.createElement("li");

        const labelSpan = document.createElement("span");
        labelSpan.className = "desk-spec-label";
        labelSpan.textContent = spec.label;

        const valueSpan = document.createElement("span");
        valueSpan.className = "desk-spec-value";

        if (spec.allowHtml) {
          valueSpan.innerHTML = spec.value;
        } else {
          valueSpan.textContent = spec.value;
        }

        li.appendChild(labelSpan);
        li.append(" ");
        li.appendChild(valueSpan);
        specList.appendChild(li);
      });

      const photoWrapper = document.createElement("div");
      photoWrapper.className = "desk-card-photo";

      const img = document.createElement("img");
      img.src = item.image.src;
      img.alt = item.image.alt || item.title;

      photoWrapper.appendChild(img);

      card.appendChild(tag);
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(specList);
      card.appendChild(photoWrapper);

      grid.appendChild(card);
    });
  };

  // ---------- MODAL LOGIC ----------

  const openModal = (card) => {
    if (!card) return;

    const cardTitle = card.querySelector(".desk-card-title");
    const cardMeta = card.querySelector(".desk-card-meta");
    const cardSpecs = card.querySelectorAll(".desk-spec-list li");
    const cardImg = card.querySelector(".desk-card-photo img");

    if (modalTitle && cardTitle) {
      modalTitle.textContent = cardTitle.textContent.trim();
    }

    if (modalMeta) {
      modalMeta.textContent = cardMeta ? cardMeta.textContent.trim() : "";
      modalMeta.style.display = cardMeta ? "block" : "none";
    }

    if (modalSpecs) {
      modalSpecs.innerHTML = "";
      cardSpecs.forEach((li) => {
        modalSpecs.appendChild(li.cloneNode(true));
      });
      modalSpecs.style.display = cardSpecs.length ? "flex" : "none";
    }

    if (modalImg && cardImg) {
      modalImg.src = cardImg.getAttribute("src");
      modalImg.alt = cardImg.getAttribute("alt") || "";
    }

    modal.classList.add("is-open");
    document.body.classList.add("no-scroll");
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  };

  const bindCardEvents = () => {
    const cards = document.querySelectorAll(".desk-card");
    cards.forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => openModal(card));
    });
  };

  const dialog = modal.querySelector(".desk-modal-dialog");
  if (dialog) {
    dialog.addEventListener("click", (e) => e.stopPropagation());
  }

  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  // ---------- INIT ----------
  renderCards();
  bindCardEvents();
});
