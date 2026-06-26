const state = {
  categories: [],
  products: [],
  content: {},
  activeCategory: "all",
  page: "home",
};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const maps = {
  plant:
    "https://www.google.com/maps?q=Village%20Pundri%20Gharunda%20Haryana%20132114&output=embed",
  office:
    "https://www.google.com/maps?q=193%20Sec%2029%20Part%202%20Huda%20Panipat%20132103&output=embed",
};

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function categoryName(id) {
  return state.categories.find((category) => category.id === id)?.name || id;
}

function renderFilters() {
  const filters = $("[data-filters]");
  const interest = $("[data-interest]");
  filters.innerHTML = [
    `<button class="active" data-filter="all">All</button>`,
    ...state.categories.map(
      (category) =>
        `<button data-filter="${category.id}">${category.name}</button>`,
    ),
  ].join("");
  interest.innerHTML = state.categories
    .map(
      (category) =>
        `<option value="${category.name}">${category.name}</option>`,
    )
    .join("");
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.activeCategory = button.dataset.filter;
    $$(".filters button").forEach((item) =>
      item.classList.toggle("active", item === button),
    );
    renderProducts();
  });
}

function renderProducts() {
  const grid = $("[data-product-grid]");
  const products =
    state.activeCategory === "all"
      ? state.products
      : state.products.filter(
          (product) => product.category === state.activeCategory,
        );
  grid.classList.remove("loading");
  grid.innerHTML = products
    .map(
      (product) => `
    <article class="product-card reveal" tabindex="0" data-product="${product.id}">
      <div class="product-media">
        <img loading="lazy" src="${product.images[0]}" alt="${product.name}">
        <span>View Details</span>
      </div>
      <div class="product-body">
        <p>${categoryName(product.category)}</p>
        <h3>${product.name}</h3>
      </div>
    </article>
  `,
    )
    .join("");
  grid.querySelectorAll("[data-product]").forEach((card) => {
    card.addEventListener("click", () => openProduct(card.dataset.product));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openProduct(card.dataset.product);
    });
  });
  revealFallback();
}

function renderShowcase() {
  const track = $("[data-horizontal-track]");
  track.innerHTML = state.products
    .slice(0, 6)
    .map(
      (product) => `
    <article class="showcase-card">
      <img loading="lazy" src="${product.images[0]}" alt="${product.name}">
      <div><p>${categoryName(product.category)}</p><h3>${product.name}</h3></div>
    </article>
  `,
    )
    .join("");
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1800&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1800&q=80",
  "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1800&q=80",
];

function cycleHeroImage() {
  let i = 0;
  const setImg = () => {
    document.documentElement.style.setProperty(
      "--hero-image",
      `url("${HERO_IMAGES[i % HERO_IMAGES.length]}")`,
    );
    i++;
  };
  setImg();
  setInterval(setImg, 5000);
}

function renderContent() {
  cycleHeroImage();
  $("[data-split]").textContent =
    state.content.heroTitle || "Where Comfort Meets Elegance";
  $("[data-hero-copy]").textContent = state.content.heroSubtitle || "";
  $("[data-about-copy]").textContent = state.content.about;
  $("[data-facility-gallery]").innerHTML = state.content.facilityImages
    .map(
      (src) =>
        `<img loading="lazy" src="${src}" alt="Florinaa textile facility">`,
    )
    .join("");
}

function pageFromPath() {
  const page = location.pathname.replace("/", "") || "home";
  return ["home", "about", "facility", "products", "contact"].includes(page)
    ? page
    : "home";
}

async function navigateTo(page, push = true) {
  const pageData = await request(`/api/pages/${page}`);
  state.page = pageData.page;
  document.title = `${pageData.title} | Florinaa`;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", pageData.description || "");
  $$("[data-page]").forEach((section) =>
    section.classList.toggle("active", section.dataset.page === state.page),
  );
  $$("[data-route]").forEach((link) =>
    link.classList.toggle("active", link.dataset.route === state.page),
  );
  if (push) history.pushState({ page: state.page }, "", pageData.path);
  scrollTo({ top: 0, behavior: "smooth" });
  updateHeaderStyle();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}

function openProduct(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product) return;
  $("[data-product-detail]").innerHTML = `
    <div class="detail">
      <div class="detail-gallery">${product.images.map((src) => `<img src="${src}" alt="${product.name}">`).join("")}</div>
      <div class="detail-copy">
        <p class="section-kicker">${categoryName(product.category)}</p>
        <h2>${product.name}</h2>
        <div class="spec-list">
          <div><span>GSM</span><strong>${product.gsm}</strong></div>
          // <div><span>Dimensions</span><strong>${product.dimensions}</strong></div>
          <div><span>Material</span><strong>${product.material}</strong></div>
        </div>
        <h3>Wash Care</h3>
        <div class="care">${product.washCare.map((item) => `<span>${item}</span>`).join("")}</div>
        <p></p>
        <a class="btn primary" href="${whatsappUrl(`Hi Florinaa, I'm interested in ${product.name}`)}" target="_blank" rel="noreferrer">Inquiry on WhatsApp</a>
      </div>
    </div>
  `;
  $("[data-product-modal]").showModal();
}

function whatsappUrl(message = "Hi Florinaa, I'm interested in your products") {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function setupForms() {
  $$("[data-whatsapp]").forEach((link) => {
    link.href = whatsappUrl();
    link.target = "_blank";
    link.rel = "noreferrer";
  });

  $("[data-inquiry-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    await request("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    event.currentTarget.reset();
    toast("Inquiry received. Florinaa will contact you shortly.");
  });

  $("[data-lead-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const result = await request("/api/leads", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    $("[data-lead-modal]").close();
    toast("Catalogue unlocked.");
    window.open(result.catalogueUrl || "#", "_blank");
  });

  $$("[data-open-lead]").forEach((button) =>
    button.addEventListener("click", () => $("[data-lead-modal]").showModal()),
  );
  $("[data-close-modal]").addEventListener("click", () =>
    $("[data-product-modal]").close(),
  );
  $("[data-close-lead]").addEventListener("click", () =>
    $("[data-lead-modal]").close(),
  );
}

function setupRouting() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-route]");
    if (!link) return;
    event.preventDefault();
    navigateTo(link.dataset.route).catch((error) => toast(error.message));
  });
  addEventListener("popstate", () =>
    navigateTo(pageFromPath(), false).catch((error) => toast(error.message)),
  );
}

function setupMaps() {
  const iframe = $("[data-map]");
  iframe.src = maps.plant;
  $$("[data-map-tab]").forEach((button) =>
    button.addEventListener("click", () => {
      $$("[data-map-tab]").forEach((item) =>
        item.classList.toggle("active", item === button),
      );
      iframe.src = maps[button.dataset.mapTab];
    }),
  );
}

function splitHeroText() {
  const title = $("[data-split]");
  title.innerHTML = title.textContent
    .split(" ")
    .map((word) => `<span class="word"><span>${word}</span></span>`)
    .join(" ");
}

let lastScrollY = 0;

function updateHeaderStyle() {
  const header = $("[data-header]");
  if (!header) return;

  const currentScrollY = window.scrollY;

  // Hide on scroll down, show on scroll up
  if (currentScrollY > lastScrollY && currentScrollY > 80) {
    header.classList.add("nav-hidden");
  } else {
    header.classList.remove("nav-hidden");
  }

  // Shadow when scrolled
  if (currentScrollY > 10) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  lastScrollY = currentScrollY;
}
function setupAnimations() {
  splitHeroText();
  setTimeout(() => document.body.classList.add("words-ready"), 1200);
  addEventListener("scroll", updateHeaderStyle, { passive: true });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(".word span", {
      y: 0,
      duration: 1.1,
      stagger: 0.08,
      ease: "power4.out",
      delay: 0.25,
    });
    gsap.to(".hero-media", {
      yPercent: 14,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.utils.toArray(".reveal").forEach((node, index) => {
      ScrollTrigger.create({
        trigger: node,
        start: "top 88%",
        onEnter: () => node.classList.add("in-view"),
      });
    });
    gsap.to("[data-horizontal-track]", {
      x: () =>
        -Math.max(
          0,
          $("[data-horizontal-track]").scrollWidth - innerWidth + 120,
        ),
      ease: "none",
      scrollTrigger: {
        trigger: ".horizontal-section",
        start: "top top",
        end: "+=1600",
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    setupCounters();
  } else {
    revealFallback();
    $$(".word span").forEach((word, index) =>
      setTimeout(() => (word.style.transform = "translateY(0)"), 80 * index),
    );
    setupCounters();
  }

  if (matchMedia("(pointer:fine)").matches) setupCursor();
}

function revealFallback() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );
  $$(".reveal").forEach((node) => observer.observe(node));
}

function setupCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count);
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / 1400);
        node.textContent =
          Math.floor(target * progress).toLocaleString("en-IN") +
          (target > 20 ? "+" : "");
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.unobserve(node);
    });
  });
  $$("[data-count]").forEach((node) => observer.observe(node));
}

function setupCursor() {
  const cursor = $(".cursor");
  addEventListener("pointermove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
  $$(".magnetic, .product-card, button, a").forEach((node) => {
    node.addEventListener("pointerenter", () => cursor.classList.add("active"));
    node.addEventListener("pointerleave", () =>
      cursor.classList.remove("active"),
    );
  });

  // Magnetic pull on .magnetic buttons
  $$(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}
function initBlurText() {
  const el = document.getElementById("blur-title");
  if (!el) return;

  const words = el.textContent.trim().split(" ");
  el.innerHTML = words
    .map(w => `<span class="blur-word">${w}</span>`)
    .join("");

  const spans = el.querySelectorAll(".blur-word");

  spans.forEach((span, i) => {
    setTimeout(() => {
      span.classList.add("visible");
    }, 200 + i * 120); // 200ms delay, 120ms gap between words
  });
}

async function boot() {
  const data = await request("/api/site");
  Object.assign(state, data);
  renderContent();
  renderFilters();
  renderProducts();
  renderShowcase();
  setupForms();
  setupRouting();
  setupMaps();
  setupAnimations();
  await navigateTo(pageFromPath(), false);
}

boot().catch((error) => toast(error.message));
