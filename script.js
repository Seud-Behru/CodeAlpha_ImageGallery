(() => {
  "use strict";

  /* ------------------------------------------------------------------
     1. DATA
     Photos come from picsum.photos (needs an internet connection).
     To use your own pictures, put them in an /images folder and replace
     `id` with `file: "images/my-photo.jpg"` (see getSrc below).
     w / h are only used for the shape of each tile.
  ------------------------------------------------------------------ */
  const IMAGES = [
    { id: 1015, w: 3, h: 2, cat: "nature",  title: "River valley" },
    { id: 1025, w: 1, h: 1, cat: "animals", title: "Pug in a blanket" },
    { id: 1047, w: 4, h: 5, cat: "urban",   title: "City street" },
    { id: 1018, w: 3, h: 2, cat: "nature",  title: "Mountain range" },
    { id: 1020, w: 4, h: 5, cat: "animals", title: "Brown bear" },
    { id: 1040, w: 3, h: 2, cat: "urban",   title: "Castle by the water" },
    { id: 1039, w: 4, h: 5, cat: "nature",  title: "Waterfall" },
    { id: 237,  w: 1, h: 1, cat: "animals", title: "Black puppy" },
    { id: 1060, w: 3, h: 2, cat: "urban",   title: "Coffee bar" },
    { id: 10,   w: 3, h: 2, cat: "nature",  title: "Forest and lake" },
    { id: 1003, w: 4, h: 5, cat: "animals", title: "Deer in the mist" }
  ];

  const THUMB_WIDTH = 640;
  const FULL_WIDTH = 1600;

  function getSrc(img, width) {
    if (img.file) return img.file;
    const height = Math.round((width * img.h) / img.w);
    return `https://picsum.photos/id/${img.id}/${width}/${height}`;
  }

  // Shown if an image fails to load
  const FALLBACK =
    "data:image/svg+xml," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>" +
        "<rect width='100%' height='100%' fill='#d6dae0'/>" +
        "<text x='50%' y='50%' fill='#5b6572' font-family='sans-serif' font-size='28' " +
        "text-anchor='middle'>Image unavailable</text></svg>"
    );

  /* ------------------------------------------------------------------
     2. ELEMENTS + STATE
  ------------------------------------------------------------------ */
  const galleryEl = document.getElementById("gallery");
  const filtersEl = document.getElementById("filters");
  const countEl = document.getElementById("count");
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbTitle = document.getElementById("lbTitle");
  const lbCount = document.getElementById("lbCount");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");

  let activeCategory = "all";
  let visible = [...IMAGES]; // photos currently shown after filtering
  let current = 0;           // index inside `visible`
  let lastFocused = null;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* ------------------------------------------------------------------
     3. BUILD THE PAGE
  ------------------------------------------------------------------ */
  function renderFilters() {
    const categories = ["all", ...new Set(IMAGES.map((i) => i.cat))];
    filtersEl.innerHTML = categories
      .map((cat) => {
        const n = cat === "all" ? IMAGES.length : IMAGES.filter((i) => i.cat === cat).length;
        const active = cat === activeCategory;
        return `<button type="button" class="chip${active ? " is-active" : ""}"
                  data-filter="${cat}" aria-pressed="${active}">
                  ${capitalize(cat)} <small>${n}</small>
                </button>`;
      })
      .join("");
  }

  function renderGallery() {
    galleryEl.innerHTML = IMAGES.map(
      (img, i) => `
      <li class="card" data-cat="${img.cat}" style="--ratio:${img.w} / ${img.h}">
        <button type="button" class="card-btn" data-index="${i}" aria-label="Open ${img.title}">
          <img src="${getSrc(img, THUMB_WIDTH)}" alt="${img.title}" loading="lazy">
          <span class="card-cap"><strong>${img.title}</strong><small>${img.cat}</small></span>
        </button>
      </li>`
    ).join("");

    galleryEl.querySelectorAll("img").forEach((el) => {
      el.addEventListener("error", () => { el.src = FALLBACK; }, { once: true });
    });
  }

  function updateCount() {
    const label = activeCategory === "all" ? "photos" : `${activeCategory} photos`;
    countEl.textContent = `Showing ${visible.length} ${label}`;
  }

  /* ------------------------------------------------------------------
     4. FILTERING
  ------------------------------------------------------------------ */
  function applyFilter(cat) {
    activeCategory = cat;
    visible = IMAGES.filter((i) => cat === "all" || i.cat === cat);

    galleryEl.querySelectorAll(".card").forEach((card) => {
      const show = cat === "all" || card.dataset.cat === cat;
      if (show) {
        card.hidden = false;
        // wait a frame so the fade-in transition runs
        requestAnimationFrame(() => card.classList.remove("is-out"));
      } else {
        card.classList.add("is-out");
        setTimeout(() => {
          if (card.classList.contains("is-out")) card.hidden = true;
        }, 250);
      }
    });

    filtersEl.querySelectorAll(".chip").forEach((chip) => {
      const on = chip.dataset.filter === cat;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", String(on));
    });
    updateCount();
  }

  filtersEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) applyFilter(chip.dataset.filter);
  });

  /* ------------------------------------------------------------------
     5. LIGHTBOX
  ------------------------------------------------------------------ */
  function showImage(index) {
    current = (index + visible.length) % visible.length; // wrap around
    const img = visible[current];

    lbImg.classList.add("is-loading");
    lbImg.onload = () => lbImg.classList.remove("is-loading");
    lbImg.onerror = () => { lbImg.src = FALLBACK; };
    lbImg.src = getSrc(img, FULL_WIDTH);
    lbImg.alt = img.title;
    lbTitle.textContent = img.title;
    lbCount.textContent = `${current + 1} / ${visible.length}`;

    // Preload the neighbours so next/prev feel instant
    [current - 1, current + 1].forEach((n) => {
      const neighbour = visible[(n + visible.length) % visible.length];
      new Image().src = getSrc(neighbour, FULL_WIDTH);
    });
  }

  function openLightbox(image) {
    const index = visible.indexOf(image);
    if (index === -1) return;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    showImage(index);
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { lightbox.hidden = true; }, 250);
    if (lastFocused) lastFocused.focus();
  }

  galleryEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".card-btn");
    if (btn) openLightbox(IMAGES[Number(btn.dataset.index)]);
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => showImage(current - 1));
  lbNext.addEventListener("click", () => showImage(current + 1));

  // Click on the dark backdrop closes the viewer
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard: arrows, Esc, and keep Tab focus inside the viewer
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showImage(current - 1);
    else if (e.key === "ArrowRight") showImage(current + 1);
    else if (e.key === "Tab") {
      const focusable = [lbClose, lbPrev, lbNext];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Touch: swipe left/right to navigate
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) showImage(current + (dx < 0 ? 1 : -1));
  });

  /* ------------------------------------------------------------------
     6. START
  ------------------------------------------------------------------ */
  renderFilters();
  renderGallery();
  updateCount();
})();
