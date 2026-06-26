let db = null;
let editingProduct = null;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2400);
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function showAdmin() {
  $("[data-login-view]").classList.add("hidden");
  $("[data-admin-view]").classList.remove("hidden");
}

function showLogin() {
  $("[data-admin-view]").classList.add("hidden");
  $("[data-login-view]").classList.remove("hidden");
}

function categoryName(id) {
  return db.categories.find(category => category.id === id)?.name || id;
}

async function load() {
  db = await api("/api/admin/all");
  showAdmin();
  renderAll();
}

function renderAll() {
  renderMetrics();
  renderRecent();
  renderProductCategoryOptions();
  renderProducts();
  renderCategories();
  renderInquiries();
  renderContentForm();
}

function renderMetrics() {
  const unread = [...db.inquiries, ...db.leads].filter(item => item.status === "new").length;
  $("[data-metrics]").innerHTML = [
    ["Products", db.products.length],
    ["Categories", db.categories.length],
    ["Inquiries", db.inquiries.length],
    ["New Records", unread]
  ].map(([label, value]) => `<article class="metric"><strong>${value}</strong><span>${label}</span></article>`).join("");
}

function renderRecent() {
  const recent = [...db.inquiries, ...db.leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);
  $("[data-recent]").innerHTML = recent.map(item => `
    <tr>
      <td>${item.type || "catalogue-lead"}</td>
      <td>${item.fullName || item.name || "-"}</td>
      <td>${item.productInterest || "-"}</td>
      <td><span class="status ${item.status}">${item.status}</span></td>
      <td>${new Date(item.createdAt).toLocaleString()}</td>
    </tr>
  `).join("") || `<tr><td colspan="5">No leads yet.</td></tr>`;
}

function renderProductCategoryOptions() {
  const options = db.categories.sort((a, b) => a.order - b.order).map(category => `<option value="${category.id}">${category.name}</option>`).join("");
  $("[data-product-category]").innerHTML = options;
}

function productRows() {
  const search = ($("[data-product-search]")?.value || "").toLowerCase();
  return db.products.filter(product => [product.name, categoryName(product.category), product.gsm].join(" ").toLowerCase().includes(search));
}

function renderProducts() {
  $("[data-product-table]").innerHTML = productRows().map(product => `
    <tr>
      <td><strong>${product.name}</strong><br><small>${product.material}</small></td>
      <td>${categoryName(product.category)}</td>
      <td>${product.gsm}</td>
      <td><span class="status ${product.visible ? "read" : ""}">${product.visible ? "Visible" : "Hidden"}</span></td>
      <td>
        <div class="row-actions">
          <button data-edit-product="${product.id}">Edit</button>
          <button data-toggle-product="${product.id}">${product.visible ? "Hide" : "Show"}</button>
          <button class="danger" data-delete-product="${product.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function fillProductForm(product) {
  editingProduct = product || null;
  const form = $("[data-product-form]");
  const fields = form.elements;
  fields.id.value = product?.id || "";
  fields.name.value = product?.name || "";
  fields.category.value = product?.category || db.categories[0]?.id || "";
  fields.gsm.value = product?.gsm || "";
  // fields.dimensions.value = product?.dimensions || "";
  fields.material.value = product?.material || "";
  fields.washCare.value = (product?.washCare || []).join(", ");
  fields.images.value = (product?.images || []).join("\n");
  fields.visible.checked = product?.visible !== false;
  $("[data-product-form-title]").textContent = product ? "Edit Product" : "Add Product";
}

function renderCategories() {
  const list = $("[data-category-list]");
  list.innerHTML = db.categories.sort((a, b) => a.order - b.order).map(category => `
    <div class="category-item" draggable="true" data-category="${category.id}">
      <span>☰</span>
      <input value="${category.name}" data-category-name="${category.id}">
      <div class="row-actions">
        <button data-save-category="${category.id}">Save</button>
        <button class="danger" data-delete-category="${category.id}">Delete</button>
      </div>
    </div>
  `).join("");
  setupCategoryDrag();
}

function renderInquiries() {
  const search = ($("[data-inquiry-search]")?.value || "").toLowerCase();
  const inquiries = db.inquiries.filter(item => JSON.stringify(item).toLowerCase().includes(search));
  $("[data-inquiry-table]").innerHTML = inquiries.map(item => `
    <tr>
      <td>${item.fullName || "-"}</td>
      <td>${item.phone || "-"}</td>
      <td>${item.email || "-"}</td>
      <td>${item.productInterest || "-"}</td>
      <td><span class="status ${item.status}">${item.status}</span></td>
      <td><div class="row-actions">
        <button data-status="read" data-kind="inquiries" data-id="${item.id}">Read</button>
        <button data-status="responded" data-kind="inquiries" data-id="${item.id}">Responded</button>
      </div></td>
    </tr>
  `).join("") || `<tr><td colspan="6">No inquiries yet.</td></tr>`;

  $("[data-lead-table]").innerHTML = db.leads.map(item => `
    <tr>
      <td>${item.name || "-"}</td>
      <td>${item.phone || "-"}</td>
      <td>${item.email || "-"}</td>
      <td><span class="status ${item.status}">${item.status}</span></td>
      <td><div class="row-actions">
        <button data-status="read" data-kind="leads" data-id="${item.id}">Read</button>
        <button data-status="responded" data-kind="leads" data-id="${item.id}">Responded</button>
      </div></td>
    </tr>
  `).join("") || `<tr><td colspan="5">No catalogue leads yet.</td></tr>`;
}

function renderContentForm() {
  const form = $("[data-content-form]");
  const fields = form.elements;
  fields.heroImage.value = db.content.heroImage || "";
  fields.heroTitle.value = db.content.heroTitle || "";
  fields.heroSubtitle.value = db.content.heroSubtitle || "";
  fields.about.value = db.content.about || "";
  fields.facilityImages.value = (db.content.facilityImages || []).join("\n");
  fields.catalogueUrl.value = db.content.catalogueUrl || "";
}

function setupCategoryDrag() {
  let dragged = null;
  $$(".category-item").forEach(item => {
    item.addEventListener("dragstart", () => {
      dragged = item;
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", async () => {
      item.classList.remove("dragging");
      const ids = $$("[data-category]").map((node, index) => ({ id: node.dataset.category, order: index + 1 }));
      await Promise.all(ids.map(category => api(`/api/admin/categories/${category.id}`, { method: "PUT", body: JSON.stringify({ order: category.order }) })));
      await load();
      toast("Category order saved.");
    });
    item.addEventListener("dragover", event => {
      event.preventDefault();
      const list = $("[data-category-list]");
      const after = [...list.querySelectorAll(".category-item:not(.dragging)")].find(node => event.clientY < node.getBoundingClientRect().top + node.offsetHeight / 2);
      if (after) list.insertBefore(dragged, after);
      else list.appendChild(dragged);
    });
  });
}

function setupEvents() {
  $("[data-login-form]").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      await load();
      toast("Welcome back.");
    } catch (error) {
      toast(error.message);
    }
  });

  $("[data-logout]").addEventListener("click", async () => {
    await api("/api/auth/logout", { method: "POST" });
    showLogin();
  });

  $$("[data-section-link]").forEach(button => button.addEventListener("click", () => {
    $$("[data-section-link]").forEach(item => item.classList.toggle("active", item === button));
    $$("[data-section]").forEach(section => section.classList.toggle("active", section.dataset.section === button.dataset.sectionLink));
    $("[data-page-title]").textContent = button.textContent;
  }));

  $("[data-product-search]").addEventListener("input", renderProducts);
  $("[data-inquiry-search]").addEventListener("input", renderInquiries);
  $("[data-reset-product]").addEventListener("click", () => fillProductForm(null));

  $("[data-product-form]").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = form.elements;
    const payload = {
      name: fields.name.value,
      category: fields.category.value,
      gsm: fields.gsm.value,
      // dimensions: fields.dimensions.value,
      material: fields.material.value,
      washCare: fields.washCare.value,
      images: fields.images.value,
      visible: fields.visible.checked
    };
    if (editingProduct) {
      await api(`/api/admin/products/${editingProduct.id}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await api("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
    }
    fillProductForm(null);
    await load();
    toast("Product saved.");
  });

  $("[data-category-form]").addEventListener("submit", async event => {
    event.preventDefault();
    await api("/api/admin/categories", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    event.currentTarget.reset();
    await load();
    toast("Category added.");
  });

  $("[data-content-form]").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = form.elements;
    await api("/api/admin/content", {
      method: "PUT",
      body: JSON.stringify({
        heroImage: fields.heroImage.value,
        heroTitle: fields.heroTitle.value,
        heroSubtitle: fields.heroSubtitle.value,
        about: fields.about.value,
        facilityImages: fields.facilityImages.value.split("\n").map(value => value.trim()).filter(Boolean),
        catalogueUrl: fields.catalogueUrl.value
      })
    });
    await load();
    toast("Content updated.");
  });

  document.addEventListener("click", async event => {
    const edit = event.target.closest("[data-edit-product]");
    const toggle = event.target.closest("[data-toggle-product]");
    const removeProduct = event.target.closest("[data-delete-product]");
    const saveCategory = event.target.closest("[data-save-category]");
    const removeCategory = event.target.closest("[data-delete-category]");
    const status = event.target.closest("[data-status]");

    if (edit) fillProductForm(db.products.find(product => product.id === edit.dataset.editProduct));
    if (toggle) {
      const product = db.products.find(item => item.id === toggle.dataset.toggleProduct);
      await api(`/api/admin/products/${product.id}`, { method: "PUT", body: JSON.stringify({ ...product, visible: !product.visible }) });
      await load();
    }
    if (removeProduct && confirm("Delete this product?")) {
      await api(`/api/admin/products/${removeProduct.dataset.deleteProduct}`, { method: "DELETE" });
      await load();
      toast("Product deleted.");
    }
    if (saveCategory) {
      const input = $(`[data-category-name="${saveCategory.dataset.saveCategory}"]`);
      await api(`/api/admin/categories/${saveCategory.dataset.saveCategory}`, { method: "PUT", body: JSON.stringify({ name: input.value }) });
      await load();
      toast("Category saved.");
    }
    if (removeCategory && confirm("Delete this category? Products keep their category id until edited.")) {
      await api(`/api/admin/categories/${removeCategory.dataset.deleteCategory}`, { method: "DELETE" });
      await load();
      toast("Category deleted.");
    }
    if (status) {
      await api(`/api/admin/${status.dataset.kind}/${status.dataset.id}`, { method: "PUT", body: JSON.stringify({ status: status.dataset.status }) });
      await load();
      toast("Status updated.");
    }
  });
}

setupEvents();
load().catch(() => showLogin());
