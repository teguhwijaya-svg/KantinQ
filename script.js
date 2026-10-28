
// =====================================================
// KANTINQ - SISTEM PEMBELI
// Data awal dapat kamu ubah sesuai menu kantin sekolah.
// =====================================================

const DEFAULT_MENUS = [
  {
    id: "m1", name: "Bakso", category: "Makanan Berat",
    price: 10000, stock: 20, sold: 12,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    description: "Bakso hangat dengan kuah gurih."
  },
  {
    id: "m2", name: "Mie Ayam", category: "Makanan Berat",
    price: 12000, stock: 15, sold: 10,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    description: "Mie ayam dengan topping pilihan."
  },
  {
    id: "m3", name: "Nasi Goreng", category: "Makanan Berat",
    price: 13000, stock: 12, sold: 8,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    description: "Nasi goreng hangat dan lezat."
  },
  {
    id: "m4", name: "Roti Bakar", category: "Makanan Ringan",
    price: 8000, stock: 10, sold: 6,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    description: "Roti panggang dengan topping manis."
  },
  {
    id: "m5", name: "Es Teh", category: "Minuman",
    price: 4000, stock: 30, sold: 25,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
    description: "Teh segar dengan es."
  },
  {
    id: "m6", name: "Jus Jeruk", category: "Minuman",
    price: 7000, stock: 12, sold: 9,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80",
    description: "Minuman jeruk yang menyegarkan."
  },
  {
    id: "m7", name: "Puding Cokelat", category: "Dessert",
    price: 6000, stock: 8, sold: 5,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
    description: "Puding lembut dengan rasa cokelat."
  }
];

const KEYS = {
  menus: "kantinQSellerProducts",
  orders: "kantinQOrders",
  ratings: "kantinQRatings",
  settings: "kantinQSettings",
  cart: "kantinQCart",
  promo: "kantinQPromo"
};

const $ = (id) => document.getElementById(id);
const rupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(number || 0);

function readData(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Data menu dan pesanan
let menus = readData(KEYS.menus, DEFAULT_MENUS);
let orders = readData(KEYS.orders, []);
let ratings = readData(KEYS.ratings, []);
let cart = readData(KEYS.cart, []);
let promoCode = readData(KEYS.promo, "");
let lastReceiptId = null;

if (!Array.isArray(menus) || menus.length === 0) {
  menus = DEFAULT_MENUS;
  saveData(KEYS.menus, menus);
}

// Memastikan data awal tersedia untuk halaman penjual
if (localStorage.getItem(KEYS.menus) === null) {
  saveData(KEYS.menus, menus);
}

const DEFAULT_SETTINGS = {
  isOpen: true,
  openingTime: "07:00",
  closingTime: "15:00",
  prepMinutes: 10
};

let settings = readData(KEYS.settings, DEFAULT_SETTINGS);

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function getStock(menu) {
  return Math.max(0, Number(menu.stock) || 0);
}

function getDiscount(subtotal) {
  // Promo contoh: HEMAT2000 untuk potongan Rp2.000,
  // minimal pembelian Rp20.000.
  if (promoCode.toUpperCase() === "HEMAT2000" && subtotal >= 20000) {
    return Math.min(2000, subtotal);
  }
  return 0;
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getTotal() {
  const subtotal = getSubtotal();
  return subtotal - getDiscount(subtotal);
}

// Jam operasional sederhana berdasarkan waktu perangkat.
function updateOpenStatus() {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = settings.openingTime.split(":").map(Number);
  const [ch, cm] = settings.closingTime.split(":").map(Number);
  const openAt = oh * 60 + om;
  const closeAt = ch * 60 + cm;
  const inHours = openAt <= closeAt
    ? current >= openAt && current < closeAt
    : current >= openAt || current < closeAt;
  const open = settings.isOpen && inHours;

  $("openStatus").textContent = open
    ? `🟢 Buka · ${settings.openingTime}–${settings.closingTime}`
    : `🔴 Tutup · ${settings.openingTime}–${settings.closingTime}`;
  $("openStatus").dataset.open = String(open);
}

function renderMenus() {
  const search = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const sort = $("sortFilter").value;

  let list = menus.filter(menu => {
    const available = menu.available !== false && getStock(menu) > 0;
    const matchesSearch = `${menu.name} ${menu.description || ""}`
      .toLowerCase().includes(search);
    const matchesCategory = category === "Semua" || menu.category === category;
    return matchesSearch && matchesCategory && (available || search !== "");
  });

  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "popular") list.sort((a, b) => (b.sold || 0) - (a.sold || 0));

  $("menuCount").textContent = `${list.length} menu`;
  $("emptyMenus").classList.toggle("hidden", list.length > 0);

  $("menuGrid").innerHTML = list.map(menu => {
    const stock = getStock(menu);
    const disabled = stock <= 0 || menu.available === false;
    return `
      <article class="menu-card">
        <img class="menu-photo"
          src="${escapeHTML(menu.image || "")}"
          alt="${escapeHTML(menu.name)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Foto+Menu'">
        <div class="menu-info">
          <span class="tag">${escapeHTML(menu.category)}</span>
          <h3>${escapeHTML(menu.name)}</h3>
          <p>${escapeHTML(menu.description || "Menu kantin pilihan.")}</p>
          <div class="menu-meta">
            <span class="price">${rupiah(menu.price)}</span>
            <span class="${disabled ? "sold-out" : "muted"}">
              ${disabled ? "Habis" : `Stok ${stock}`}
            </span>
          </div>
          <p>⭐ ${Number(menu.rating || 0).toFixed(1)} · Terjual ${menu.sold || 0}</p>
          <button class="button full" data-add="${escapeHTML(menu.id)}"
            ${disabled ? "disabled" : ""}>Tambah ke keranjang</button>
        </div>
      </article>`;
  }).join("");
}

function renderCart() {
  $("cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    $("cartItems").innerHTML = '<p class="empty">Keranjang masih kosong.</p>';
  } else {
    $("cartItems").innerHTML = cart.map(item => `
      <div class="cart-line">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <div class="muted">${rupiah(item.price)} × ${item.quantity}</div>
          <div class="quantity-controls">
            <button data-change="${escapeHTML(item.id)}" data-delta="-1">−</button>
            <span>${item.quantity}</span>
            <button data-change="${escapeHTML(item.id)}" data-delta="1">+</button>
            <button class="icon-button" data-remove="${escapeHTML(item.id)}" aria-label="Hapus">🗑️</button>
          </div>
        </div>
        <strong>${rupiah(item.price * item.quantity)}</strong>
      </div>`).join("");
  }

  const subtotal = getSubtotal();
  $("cartSubtotal").textContent = rupiah(subtotal);
  $("cartDiscount").textContent = rupiah(getDiscount(subtotal));
  $("cartTotal").textContent = rupiah(getTotal());
  $("checkoutButton").disabled = cart.length === 0;
  saveData(KEYS.cart, cart);
}

function addToCart(id) {
  const menu = menus.find(item => item.id === id);
  if (!menu || getStock(menu) <= 0 || menu.available === false) {
    showToast("Menu sedang habis.");
    return;
  }

  const existing = cart.find(item => item.id === id);
  if (existing) {
    if (existing.quantity >= getStock(menu)) {
      showToast("Jumlah pesanan melebihi stok.");
      return;
    }
    existing.quantity++;
  } else {
    cart.push({
      id: menu.id, name: menu.name,
      price: Number(menu.price), quantity: 1
    });
  }

  renderCart();
  showToast(`${menu.name} ditambahkan.`);
}

function changeQuantity(id, delta) {
  const item = cart.find(entry => entry.id === id);
  const menu = menus.find(entry => entry.id === id);
  if (!item) return;

  const next = item.quantity + delta;
  if (next <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  } else if (!menu || next > getStock(menu)) {
    showToast("Jumlah melebihi stok.");
    return;
  } else {
    item.quantity = next;
  }

  renderCart();
}

function makeOrderNumber() {
  const next = Number(localStorage.getItem("kantinQLastQueue") || "0") + 1;
  localStorage.setItem("kantinQLastQueue", String(next));
  return `KQ-${String(next).padStart(3, "0")}`;
}

function createOrder(event) {
  event.preventDefault();
  updateOpenStatus();

  if ($("openStatus").dataset.open !== "true") {
    showToast("Kantin sedang tutup.");
    return;
  }
  if (!cart.length) {
    showToast("Keranjang masih kosong.");
    return;
  }

  // Validasi stok sekali lagi sebelum checkout.
  for (const item of cart) {
    const menu = menus.find(entry => entry.id === item.id);
    if (!menu || menu.available === false || getStock(menu) < item.quantity) {
      showToast(`Stok ${item.name} tidak mencukupi. Muat ulang menu.`);
      renderMenus();
      return;
    }
  }

  const customer = $("customerName").value.trim();
  if (!customer) {
    showToast("Isi nama pembeli terlebih dahulu.");
    return;
  }

  const subtotal = getSubtotal();
  const discount = getDiscount(subtotal);
  const queue = makeOrderNumber();
  const order = {
    id: `KQ-${Date.now()}`,
    queue,
    customer,
    note: $("orderNote").value.trim(),
    items: cart.map(item => ({ ...item })),
    subtotal,
    discount,
    total: subtotal - discount,
    status: "Menunggu",
    createdAt: new Date().toISOString(),
    prepMinutes: Number(settings.prepMinutes) || 10
  };

  // Mengurangi stok lokal saat pesanan dibuat.
  // Untuk banyak perangkat, stok wajib divalidasi di backend.
  menus = menus.map(menu => {
    const ordered = cart.find(item => item.id === menu.id);
    return ordered
      ? { ...menu, stock: getStock(menu) - ordered.quantity }
      : menu;
  });

  orders.unshift(order);
  saveData(KEYS.orders, orders);
  saveData(KEYS.menus, menus);

  cart = [];
  promoCode = "";
  saveData(KEYS.promo, promoCode);
  $("promoInput").value = "";
  $("promoMessage").textContent = "";
  $("orderNote").value = "";
  saveData(KEYS.cart, cart);

  renderMenus();
  renderCart();
  renderOrders();
  renderRatingOptions();

  $("cartDialog").close();
  showReceipt(order);
  showToast(`Pesanan ${queue} berhasil dibuat.`);

  // Notifikasi hanya tampil pada browser yang sedang terbuka.
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Pesanan KantinQ dibuat", {
      body: `Nomor antrean ${queue}`
    });
  }
}

function showReceipt(order) {
  lastReceiptId = order.id;
  $("receiptContent").innerHTML = `
    <div class="receipt">
      <h2>KantinQ</h2>
      <p>Struk pesanan kantin digital</p>
      <hr>
      <div class="receipt-row"><span>Nomor antrean</span><strong>${escapeHTML(order.queue)}</strong></div>
      <div class="receipt-row"><span>Pembeli</span><strong>${escapeHTML(order.customer)}</strong></div>
      <div class="receipt-row"><span>Waktu</span><span>${new Date(order.createdAt).toLocaleString("id-ID")}</span></div>
      <hr>
      ${order.items.map(item => `
        <div class="receipt-row">
          <span>${escapeHTML(item.name)} × ${item.quantity}</span>
          <strong>${rupiah(item.price * item.quantity)}</strong>
        </div>`).join("")}
      <hr>
      <div class="receipt-row"><span>Subtotal</span><span>${rupiah(order.subtotal)}</span></div>
      <div class="receipt-row"><span>Diskon</span><span>−${rupiah(order.discount)}</span></div>
      <div class="receipt-row"><strong>Total</strong><strong>${rupiah(order.total)}</strong></div>
      <p>Status: <strong>${escapeHTML(order.status)}</strong></p>
      ${order.note ? `<p>Catatan: ${escapeHTML(order.note)}</p>` : ""}
    </div>`;
  $("receiptDialog").showModal();
}

function renderOrders() {
  orders = readData(KEYS.orders, []);
  $("myOrders").innerHTML = orders.length ? orders.map(order => `
    <article class="order-card">
      <div class="order-card-top">
        <strong>${escapeHTML(order.queue || order.id)}</strong>
        <span class="status-pill-small">${escapeHTML(order.status)}</span>
      </div>
      <p>${new Date(order.createdAt).toLocaleString("id-ID")}</p>
      <p>${order.items.map(item => `${escapeHTML(item.name)} × ${item.quantity}`).join(", ")}</p>
      <p><strong>Total ${rupiah(order.total)}</strong></p>
      <p class="muted">${getStatusMessage(order.status, order.prepMinutes)}</p>
      <button class="button secondary" data-receipt="${escapeHTML(order.id)}">Lihat struk</button>
    </article>`).join("") : '<p class="empty">Belum ada pesanan di perangkat ini.</p>';
}

function getStatusMessage(status, minutes) {
  const messages = {
    "Menunggu": "Pesanan menunggu konfirmasi penjual.",
    "Diproses": `Pesanan sedang dibuat. Perkiraan ${minutes || 10} menit.`,
    "Siap Diambil": "Silakan ambil pesanan di kantin.",
    "Selesai": "Pesanan sudah selesai. Terima kasih!",
    "Ditolak": "Pesanan ditolak oleh penjual. Hubungi penjual untuk tindak lanjut."
  };
  return messages[status] || "Status pesanan diperbarui.";
}

function renderRatingOptions() {
  const completed = orders.filter(order => order.status === "Selesai");
  const previous = $("ratingOrder").value;
  $("ratingOrder").innerHTML = '<option value="">Pilih pesanan selesai</option>' +
    completed.map(order => {
      const alreadyRated = ratings.some(rating => rating.orderId === order.id);
      return `<option value="${escapeHTML(order.id)}" ${alreadyRated ? "disabled" : ""}>
        ${escapeHTML(order.queue || order.id)}${alreadyRated ? " (sudah dinilai)" : ""}
      </option>`;
    }).join("");
  if (completed.some(order => order.id === previous)) $("ratingOrder").value = previous;
}

function renderRatings() {
  ratings = readData(KEYS.ratings, []);
  $("ratingsList").innerHTML = ratings.length ? ratings.slice(0, 10).map(rating => `
    <div class="rating-item">
      <strong>${"★".repeat(rating.stars)}${"☆".repeat(5 - rating.stars)}</strong>
      <p>${escapeHTML(rating.comment || "Tanpa komentar")}</p>
      <small class="muted">${new Date(rating.createdAt).toLocaleDateString("id-ID")}</small>
    </div>`).join("") : '<p class="muted">Belum ada ulasan.</p>';
}

$("menuGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

$("cartItems").addEventListener("click", event => {
  const change = event.target.closest("[data-change]");
  const remove = event.target.closest("[data-remove]");

  if (change) changeQuantity(change.dataset.change, Number(change.dataset.delta));
  if (remove) {
    cart = cart.filter(item => item.id !== remove.dataset.remove);
    renderCart();
  }
});

$("cartButton").addEventListener("click", () => $("cartDialog").showModal());
$("checkoutForm").addEventListener("submit", createOrder);
$("searchInput").addEventListener("input", renderMenus);
$("categoryFilter").addEventListener("change", renderMenus);
$("sortFilter").addEventListener("change", renderMenus);
$("refreshOrdersButton").addEventListener("click", () => {
  menus = readData(KEYS.menus, DEFAULT_MENUS);
  orders = readData(KEYS.orders, []);
  ratings = readData(KEYS.ratings, []);
  settings = readData(KEYS.settings, DEFAULT_SETTINGS);
  renderMenus();
  renderOrders();
  renderRatingOptions();
  renderRatings();
  updateOpenStatus();
  showToast("Data lokal dimuat ulang.");
});

$("checkPromoButton").addEventListener("click", () => {
  const code = $("promoInput").value.trim().toUpperCase();
  if (code === "HEMAT2000") {
    promoCode = code;
    saveData(KEYS.promo, promoCode);
    $("promoMessage").textContent = "Promo aktif: diskon Rp2.000 untuk belanja minimal Rp20.000.";
    showToast("Promo berhasil digunakan.");
  } else {
    promoCode = "";
    saveData(KEYS.promo, promoCode);
    $("promoMessage").textContent = "Kode promo tidak valid.";
  }
  renderCart();
});

$("myOrders").addEventListener("click", event => {
  const button = event.target.closest("[data-receipt]");
  if (!button) return;
  const order = orders.find(item => item.id === button.dataset.receipt);
  if (order) showReceipt(order);
});

$("printReceiptButton").addEventListener("click", () => window.print());

$("ratingForm").addEventListener("submit", event => {
  event.preventDefault();
  const orderId = $("ratingOrder").value;
  const order = orders.find(item => item.id === orderId);
  if (!order || order.status !== "Selesai") {
    showToast("Rating hanya dapat diberikan untuk pesanan selesai.");
    return;
  }
  if (ratings.some(rating => rating.orderId === orderId)) {
    showToast("Pesanan ini sudah diberi rating.");
    return;
  }

  ratings.unshift({
    id: `R-${Date.now()}`,
    orderId,
    stars: Number($("ratingStars").value),
    comment: $("ratingComment").value.trim(),
    createdAt: new Date().toISOString()
  });
  saveData(KEYS.ratings, ratings);
  $("ratingComment").value = "";
  renderRatingOptions();
  renderRatings();
  showToast("Terima kasih atas rating kamu!");
});

$("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("kantinQTheme", document.body.classList.contains("dark") ? "dark" : "light");
});

function refreshOnStorageChange(event) {
  if (!event.key || Object.values(KEYS).includes(event.key)) {
    menus = readData(KEYS.menus, DEFAULT_MENUS);
    orders = readData(KEYS.orders, []);
    ratings = readData(KEYS.ratings, []);
    settings = readData(KEYS.settings, DEFAULT_SETTINGS);
    renderMenus();
    renderCart();
    renderOrders();
    renderRatingOptions();
    renderRatings();
    updateOpenStatus();
  }
}

// Storage event membantu menyegarkan tab lain di browser/origin yang sama.
window.addEventListener("storage", refreshOnStorageChange);

function init() {
  if (localStorage.getItem("kantinQTheme") === "dark") document.body.classList.add("dark");
  $("year").textContent = new Date().getFullYear();
  renderMenus();
  renderCart();
  renderOrders();
  renderRatingOptions();
  renderRatings();
  updateOpenStatus();

  // Meminta izin notifikasi setelah tindakan pengguna, bukan otomatis.
  $("themeButton").addEventListener("contextmenu", event => {
    event.preventDefault();
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        showToast(permission === "granted"
          ? "Notifikasi diizinkan."
          : "Izin notifikasi tidak diberikan.");
      });
    }
  });
}

init();
