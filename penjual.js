
// =====================================================
// KANTINQ - SISTEM POV PENJUAL
// Semua data disimpan di localStorage browser.
// =====================================================

const KEYS = {
  menus: "kantinQSellerProducts",
  orders: "kantinQOrders",
  ratings: "kantinQRatings",
  settings: "kantinQSettings"
};

const DEFAULT_MENUS = [
  { id:"m1", name:"Bakso", category:"Makanan Berat", price:10000, stock:20, sold:12, image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80", description:"Bakso hangat dengan kuah gurih." },
  { id:"m2", name:"Mie Ayam", category:"Makanan Berat", price:12000, stock:15, sold:10, image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80", description:"Mie ayam dengan topping pilihan." },
  { id:"m3", name:"Nasi Goreng", category:"Makanan Berat", price:13000, stock:12, sold:8, image:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80", description:"Nasi goreng hangat." },
  { id:"m4", name:"Roti Bakar", category:"Makanan Ringan", price:8000, stock:10, sold:6, image:"https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80", description:"Roti panggang manis." },
  { id:"m5", name:"Es Teh", category:"Minuman", price:4000, stock:30, sold:25, image:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80", description:"Teh segar dengan es." },
  { id:"m6", name:"Jus Jeruk", category:"Minuman", price:7000, stock:12, sold:9, image:"https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80", description:"Jus jeruk menyegarkan." },
  { id:"m7", name:"Puding Cokelat", category:"Dessert", price:6000, stock:8, sold:5, image:"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80", description:"Puding lembut." }
];

const DEFAULT_SETTINGS = {
  isOpen: true,
  openingTime: "07:00",
  closingTime: "15:00",
  prepMinutes: 10
};

const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("id-ID", {
  style:"currency", currency:"IDR", maximumFractionDigits:0
}).format(Number(n) || 0);

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[c]);
}
function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2800);
}

let menus = read(KEYS.menus, DEFAULT_MENUS);
let orders = read(KEYS.orders, []);
let ratings = read(KEYS.ratings, []);
let settings = read(KEYS.settings, DEFAULT_SETTINGS);

if (!Array.isArray(menus) || menus.length === 0) menus = DEFAULT_MENUS;
save(KEYS.menus, menus);

function refreshData() {
  menus = read(KEYS.menus, DEFAULT_MENUS);
  orders = read(KEYS.orders, []);
  ratings = read(KEYS.ratings, []);
  settings = read(KEYS.settings, DEFAULT_SETTINGS);
}

function renderStats() {
  const completed = orders.filter(o => o.status === "Selesai");
  const active = orders.filter(o =>
    ["Menunggu", "Diproses", "Siap Diambil"].includes(o.status)
  );

  $("statOrders").textContent = orders.length;
  $("statActive").textContent = active.length;
  $("statCompleted").textContent = completed.length;
  $("statRevenue").textContent = money(completed.reduce((sum, o) => sum + o.total, 0));
}

function renderOrders() {
  const search = $("orderSearch").value.trim().toLowerCase();
  const status = $("statusFilter").value;

  const filtered = orders.filter(order => {
    const text = `${order.queue || ""} ${order.id || ""} ${order.customer || ""}`.toLowerCase();
    return text.includes(search) && (status === "Semua" || order.status === status);
  });

  $("ordersList").innerHTML = filtered.length ? filtered.map(order => `
    <article class="seller-order">
      <div class="seller-order-header">
        <strong>${esc(order.queue || order.id)} · ${esc(order.customer)}</strong>
        <span class="status-pill-small">${esc(order.status)}</span>
      </div>
      <p class="muted">${new Date(order.createdAt).toLocaleString("id-ID")}</p>
      <p>${(order.items || []).map(item => `${esc(item.name)} × ${item.quantity}`).join(", ")}</p>
      ${order.note ? `<p>Catatan: ${esc(order.note)}</p>` : ""}
      <p><strong>${money(order.total)}</strong></p>
      <div class="seller-order-actions">
        <select data-status="${esc(order.id)}" aria-label="Ubah status pesanan">
          ${["Menunggu","Diproses","Siap Diambil","Selesai","Ditolak"].map(s =>
            `<option value="${s}" ${s === order.status ? "selected" : ""}>${s}</option>`
          ).join("")}
        </select>
        <button class="button secondary" data-estimate="${esc(order.id)}">Atur estimasi</button>
      </div>
    </article>
  `).join("") : '<p class="empty">Belum ada pesanan yang cocok.</p>';
}

function renderProducts() {
  $("productsList").innerHTML = menus.map(menu => `
    <article class="product-row">
      <img src="${esc(menu.image || "")}" alt="${esc(menu.name)}"
        onerror="this.onerror=null;this.src='https://placehold.co/200x200?text=Menu'">
      <div>
        <h3>${esc(menu.name)}</h3>
        <p>${esc(menu.category)} · ${money(menu.price)}</p>
        <p>Stok: <strong>${Number(menu.stock) || 0}</strong> · Terjual: ${Number(menu.sold) || 0}</p>
      </div>
      <div class="product-actions">
        <button class="button secondary" data-edit="${esc(menu.id)}">Edit</button>
        <button class="button secondary" data-stock="${esc(menu.id)}" data-delta="-1">− Stok</button>
        <button class="button secondary" data-stock="${esc(menu.id)}" data-delta="1">+ Stok</button>
        <button class="button" data-delete="${esc(menu.id)}">Hapus</button>
      </div>
    </article>
  `).join("");
}

function renderReport() {
  const completed = orders.filter(order => order.status === "Selesai");
  const revenue = completed.reduce((sum, order) => sum + order.total, 0);

  $("reportSummary").textContent =
    `${completed.length} pesanan selesai · Total omzet ${money(revenue)}`;

  $("reportTableBody").innerHTML = orders.length ? orders.map(order => `
    <tr>
      <td>${esc(order.queue || order.id)}</td>
      <td>${esc(order.customer)}</td>
      <td>${money(order.total)}</td>
      <td>${esc(order.status)}</td>
      <td>${new Date(order.createdAt).toLocaleString("id-ID")}</td>
    </tr>
  `).join("") : '<tr><td colspan="5">Belum ada transaksi.</td></tr>';
}

function renderRatings() {
  $("sellerRatings").innerHTML = ratings.length ? ratings.map(rating => `
    <div class="rating-item">
      <strong>${"★".repeat(Number(rating.stars))}${"☆".repeat(5 - Number(rating.stars))}</strong>
      <p>${esc(rating.comment || "Tanpa komentar")}</p>
      <small class="muted">${new Date(rating.createdAt).toLocaleDateString("id-ID")}</small>
    </div>
  `).join("") : '<p class="muted">Belum ada rating.</p>';
}

function renderSettings() {
  $("isOpenInput").checked = settings.isOpen !== false;
  $("openingTimeInput").value = settings.openingTime || "07:00";
  $("closingTimeInput").value = settings.closingTime || "15:00";
  $("prepMinutesInput").value = settings.prepMinutes || 10;
}

function renderAll() {
  renderStats();
  renderOrders();
  renderProducts();
  renderReport();
  renderRatings();
  renderSettings();
}

function resetProductForm() {
  $("productForm").reset();
  $("productId").value = "";
  $("saveProductButton").textContent = "Simpan menu";
}

$("productForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("productId").value || `m-${Date.now()}`;
  const old = menus.find(menu => menu.id === id);

  const product = {
    id,
    name: $("productName").value.trim(),
    category: $("productCategory").value,
    price: Number($("productPrice").value),
    stock: Math.max(0, Number($("productStock").value)),
    image: $("productImage").value.trim() || "https://placehold.co/600x400?text=Menu",
    description: $("productDescription").value.trim(),
    sold: old ? Number(old.sold) || 0 : 0,
    rating: old ? Number(old.rating) || 0 : 0,
    available: true
  };

  if (!product.name || product.price < 0 || !Number.isFinite(product.price)) {
    toast("Periksa nama dan harga menu.");
    return;
  }

  if (old) menus = menus.map(menu => menu.id === id ? product : menu);
  else menus.unshift(product);

  save(KEYS.menus, menus);
  resetProductForm();
  renderAll();
  toast("Menu berhasil disimpan.");
});

$("cancelEditButton").addEventListener("click", resetProductForm);

$("productsList").addEventListener("click", event => {
  const edit = event.target.closest("[data-edit]");
  const stock = event.target.closest("[data-stock]");
  const remove = event.target.closest("[data-delete]");

  if (edit) {
    const menu = menus.find(item => item.id === edit.dataset.edit);
    if (!menu) return;

    $("productId").value = menu.id;
    $("productName").value = menu.name;
    $("productCategory").value = menu.category;
    $("productPrice").value = menu.price;
    $("productStock").value = menu.stock;
    $("productImage").value = menu.image || "";
    $("productDescription").value = menu.description || "";
    $("saveProductButton").textContent = "Simpan perubahan";
    $("productName").focus();
  }

  if (stock) {
    menus = menus.map(menu => menu.id === stock.dataset.stock
      ? { ...menu, stock: Math.max(0, (Number(menu.stock) || 0) + Number(stock.dataset.delta)) }
      : menu
    );
    save(KEYS.menus, menus);
    renderProducts();
    toast("Stok diperbarui.");
  }

  if (remove) {
    const menu = menus.find(item => item.id === remove.dataset.delete);
    if (!menu) return;
    if (!confirm(`Hapus menu "${menu.name}"?`)) return;

    menus = menus.filter(item => item.id !== menu.id);
    save(KEYS.menus, menus);
    renderProducts();
    toast("Menu dihapus.");
  }
});

$("ordersList").addEventListener("change", event => {
  const select = event.target.closest("[data-status]");
  if (!select) return;

  const order = orders.find(item => item.id === select.dataset.status);
  if (!order) return;

  const previous = order.status;
  order.status = select.value;

  // Jika ditandai selesai, jumlah penjualan menu diperbarui.
  // Status Selesai hanya boleh diproses satu kali.
  if (previous !== "Selesai" && order.status === "Selesai") {
    menus = menus.map(menu => {
      const item = order.items.find(entry => entry.id === menu.id);
      return item ? { ...menu, sold: (Number(menu.sold) || 0) + item.quantity } : menu;
    });
    save(KEYS.menus, menus);
  }

  save(KEYS.orders, orders);
  renderAll();
  toast("Status pesanan diperbarui.");
});

$("ordersList").addEventListener("click", event => {
  const button = event.target.closest("[data-estimate]");
  if (!button) return;

  const order = orders.find(item => item.id === button.dataset.estimate);
  if (!order) return;

  const answer = prompt("Perkiraan persiapan dalam menit:", String(order.prepMinutes || settings.prepMinutes || 10));
  if (answer === null) return;

  const minutes = Number(answer);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
    toast("Masukkan angka 1 sampai 180.");
    return;
  }

  order.prepMinutes = minutes;
  save(KEYS.orders, orders);
  renderOrders();
  toast("Estimasi waktu disimpan.");
});

$("settingsForm").addEventListener("submit", event => {
  event.preventDefault();
  settings = {
    isOpen: $("isOpenInput").checked,
    openingTime: $("openingTimeInput").value,
    closingTime: $("closingTimeInput").value,
    prepMinutes: Number($("prepMinutesInput").value)
  };
  save(KEYS.settings, settings);
  toast("Pengaturan kantin disimpan.");
});

$("orderSearch").addEventListener("input", renderOrders);
$("statusFilter").addEventListener("change", renderOrders);

$("sellerRefreshButton").addEventListener("click", () => {
  refreshData();
  renderAll();
  toast("Data lokal dimuat ulang.");
});

// Ekspor laporan transaksi ke file CSV.
$("exportCsvButton").addEventListener("click", () => {
  const header = ["Nomor", "Pembeli", "Total", "Status", "Waktu"];
  const rows = orders.map(order => [
    order.queue || order.id,
    order.customer,
    order.total,
    order.status,
    new Date(order.createdAt).toLocaleString("id-ID")
  ]);

  // Escape tanda kutip dan bungkus tiap kolom dengan tanda kutip.
  const csv = [header, ...rows].map(row =>
    row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan-kantinQ-${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

$("sellerThemeButton").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("kantinQTheme", document.body.classList.contains("dark") ? "dark" : "light");
});

window.addEventListener("storage", event => {
  if (!event.key || Object.values(KEYS).includes(event.key)) {
    refreshData();
    renderAll();
  }
});

$("sellerYear").textContent = new Date().getFullYear();
if (localStorage.getItem("kantinQTheme") === "dark") {
  document.body.classList.add("dark");
}
renderAll();
