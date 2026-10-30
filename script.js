
// ======================================================
// 1. DATA AWAL DAN PENYIMPANAN BROWSER
// ======================================================

const MENU_KEY = "kantinq_menus";
const ORDER_KEY = "kantinq_orders";
const SETTINGS_KEY = "kantinq_settings";
const CART_KEY = "kantinq_cart";

const defaultMenus = [
  {
    id: "m1",
    name: "Bakso Kuah",
    category: "Makanan",
    price: 12000,
    stock: 20,
    sold: 0,
    description: "Bakso hangat dengan kuah gurih.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "m2",
    name: "Nasi Goreng",
    category: "Makanan",
    price: 15000,
    stock: 20,
    sold: 0,
    description: "Nasi goreng lezat untuk mengisi energi.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "m3",
    name: "Mie Ayam",
    category: "Makanan",
    price: 12000,
    stock: 15,
    sold: 0,
    description: "Mie ayam dengan topping gurih.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "m4",
    name: "Es Teh",
    category: "Minuman",
    price: 4000,
    stock: 30,
    sold: 0,
    description: "Es teh manis yang menyegarkan.",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "m5",
    name: "Jus Jeruk",
    category: "Minuman",
    price: 7000,
    stock: 20,
    sold: 0,
    description: "Minuman jeruk segar.",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "m6",
    name: "Kentang Goreng",
    category: "Camilan",
    price: 8000,
    stock: 20,
    sold: 0,
    description: "Kentang goreng renyah.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "m7",
    name: "Puding Cokelat",
    category: "Dessert",
    price: 6000,
    stock: 15,
    sold: 0,
    description: "Puding cokelat dengan saus dan topping cokelat.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "m8",
    name: "Roti Cokelat",
    category: "Camilan",
    price: 5000,
    stock: 18,
    sold: 0,
    description: "Roti manis dengan isian cokelat.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
  }
];

// Mengambil data dari localStorage atau membuat data awal.
function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Gagal membaca data:", error);
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

if (!localStorage.getItem(MENU_KEY)) {
  saveJSON(MENU_KEY, defaultMenus);
}
if (!localStorage.getItem(ORDER_KEY)) {
  saveJSON(ORDER_KEY, []);
}
if (!localStorage.getItem(SETTINGS_KEY)) {
  saveJSON(SETTINGS_KEY, { open: true, prepMinutes: 10 });
}

let menus = readJSON(MENU_KEY, defaultMenus);
let orders = readJSON(ORDER_KEY, []);
let cart = readJSON(CART_KEY, []);
let promoApplied = false;
let activeCallOrderId = null;

// ======================================================
// 2. FUNGSI BANTUAN
// ======================================================

const $ = (id) => document.getElementById(id);

function rupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getStock(menu) {
  return Math.max(0, Number(menu.stock) || 0);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function refreshData() {
  menus = readJSON(MENU_KEY, defaultMenus);
  orders = readJSON(ORDER_KEY, []);
  cart = readJSON(CART_KEY, []);
}

// ======================================================
// 3. MENAMPILKAN MENU
// ======================================================

function renderMenus() {
  const query = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;

  const filteredMenus = menus.filter((menu) => {
    const matchesText =
      menu.name.toLowerCase().includes(query) ||
      menu.description.toLowerCase().includes(query);

    const matchesCategory =
      category === "Semua" || menu.category === category;

    return matchesText && matchesCategory;
  });

  $("menuList").innerHTML = filteredMenus.map((menu) => {
    const stock = getStock(menu);
    const image = escapeHTML(menu.image || "");
    return `
      <article class="menu-card">
        <img
          src="${image}"
          alt="${escapeHTML(menu.name)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/800x500?text=Gambar+Menu';"
        >
        <div class="menu-info">
          <span class="category-tag">${escapeHTML(menu.category)}</span>
          <h3>${escapeHTML(menu.name)}</h3>
          <p>${escapeHTML(menu.description)}</p>
          <span class="stock-text">Stok tersedia: ${stock}</span>
          <div class="menu-bottom">
            <span class="menu-price">${rupiah(menu.price)}</span>
            <button
              class="button button-primary"
              data-add="${escapeHTML(menu.id)}"
              ${stock < 1 ? "disabled" : ""}
              type="button"
            >${stock < 1 ? "Habis" : "+ Keranjang"}</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  $("emptyMenu").classList.toggle("hidden", filteredMenus.length > 0);
}

// ======================================================
// 4. KERANJANG DAN PERHITUNGAN HARGA
// ======================================================

function getCartDetails() {
  const details = cart.map((item) => {
    const menu = menus.find((entry) => entry.id === item.id);
    if (!menu) return null;

    const quantity = Math.max(0, Number(item.quantity) || 0);
    return {
      ...menu,
      quantity,
      lineTotal: menu.price * quantity
    };
  }).filter(Boolean);

  const subtotal = details.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = promoApplied && subtotal >= 20000 ? 2000 : 0;

  return {
    details,
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount)
  };
}

function saveCart() {
  saveJSON(CART_KEY, cart);
}

function renderCart() {
  // Hapus item keranjang jika menu sudah tidak ada.
  cart = cart.filter((item) => menus.some((menu) => menu.id === item.id));
  saveCart();

  const { details, subtotal, discount, total } = getCartDetails();

  $("cartList").innerHTML = details.map((item) => `
    <div class="cart-row">
      <div>
        <div class="cart-name">${escapeHTML(item.name)}</div>
        <div class="cart-price">${rupiah(item.price)} per item</div>
      </div>
      <strong>${rupiah(item.lineTotal)}</strong>
      <div class="quantity-control">
        <button type="button" data-minus="${escapeHTML(item.id)}" aria-label="Kurangi jumlah">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-plus="${escapeHTML(item.id)}" aria-label="Tambah jumlah">+</button>
        <button class="remove-button" type="button" data-remove="${escapeHTML(item.id)}">Hapus</button>
      </div>
    </div>
  `).join("");

  $("emptyCart").classList.toggle("hidden", details.length > 0);
  $("cartCount").textContent =
    `${details.reduce((sum, item) => sum + item.quantity, 0)} item`;
  $("subtotal").textContent = rupiah(subtotal);
  $("discount").textContent = rupiah(discount);
  $("total").textContent = rupiah(total);
  $("checkoutButton").disabled = details.length === 0;
}

function addToCart(id) {
  const menu = menus.find((item) => item.id === id);
  if (!menu || getStock(menu) < 1) {
    showToast("Menu sedang habis.");
    return;
  }

  const item = cart.find((entry) => entry.id === id);
  const currentQuantity = item ? item.quantity : 0;

  if (currentQuantity >= getStock(menu)) {
    showToast("Jumlah pesanan melebihi stok.");
    return;
  }

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${menu.name} ditambahkan ke keranjang.`);
}

function changeQuantity(id, amount) {
  const item = cart.find((entry) => entry.id === id);
  const menu = menus.find((entry) => entry.id === id);
  if (!item || !menu) return;

  const newQuantity = item.quantity + amount;

  if (newQuantity <= 0) {
    cart = cart.filter((entry) => entry.id !== id);
  } else if (newQuantity <= getStock(menu)) {
    item.quantity = newQuantity;
  } else {
    showToast("Jumlah melebihi stok yang tersedia.");
  }

  saveCart();
  renderCart();
}

// ======================================================
// 5. PROMO
// ======================================================

$("applyPromoButton").addEventListener("click", () => {
  const code = $("promoInput").value.trim().toUpperCase();
  const subtotal = getCartDetails().subtotal;

  if (code !== "HEMAT2000") {
    promoApplied = false;
    $("promoMessage").textContent = "Kode promo tidak valid.";
  } else if (subtotal < 20000) {
    promoApplied = false;
    $("promoMessage").textContent = "Minimal belanja Rp20.000 untuk memakai promo.";
  } else {
    promoApplied = true;
    $("promoMessage").textContent = "Promo berhasil! Diskon Rp2.000.";
  }

  renderCart();
});

// ======================================================
// 6. CHECKOUT / MEMBUAT PESANAN
// ======================================================

function makeOrderNumber() {
  return "KQ-" + Date.now().toString().slice(-8);
}

$("checkoutButton").addEventListener("click", () => {
  refreshData();

  const name = $("customerName").value.trim();
  const customerClass = $("customerClass").value.trim();
  const { details, subtotal, discount, total } = getCartDetails();

  if (!name) {
    showToast("Masukkan nama pelanggan terlebih dahulu.");
    $("customerName").focus();
    return;
  }

  if (details.length === 0) {
    showToast("Keranjang masih kosong.");
    return;
  }

  // Periksa stok terbaru sebelum menyimpan pesanan.
  for (const item of details) {
    const currentMenu = menus.find((menu) => menu.id === item.id);
    if (!currentMenu || item.quantity > getStock(currentMenu)) {
      showToast(`Stok ${item.name} tidak mencukupi. Periksa keranjang.`);
      renderMenus();
      renderCart();
      return;
    }
  }

  const settings = readJSON(SETTINGS_KEY, { open: true, prepMinutes: 10 });
  if (settings.open === false) {
    showToast("Kantin sedang tutup dan belum menerima pesanan.");
    return;
  }

  const newOrder = {
    id: makeOrderNumber(),
    name,
    customerClass,
    items: details.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    subtotal,
    discount,
    total,
    status: "Menunggu",
    createdAt: new Date().toISOString(),
    prepMinutes: Number(settings.prepMinutes) || 10
  };

  // Kurangi stok saat pesanan dibuat.
  menus = menus.map((menu) => {
    const orderedItem = details.find((item) => item.id === menu.id);
    return orderedItem
      ? { ...menu, stock: getStock(menu) - orderedItem.quantity }
      : menu;
  });

  orders = readJSON(ORDER_KEY, []);
  orders.unshift(newOrder);

  saveJSON(MENU_KEY, menus);
  saveJSON(ORDER_KEY, orders);

  cart = [];
  promoApplied = false;
  saveCart();
  $("promoInput").value = "";
  $("promoMessage").textContent = "";
  $("customerName").value = "";
  $("customerClass").value = "";

  renderAll();
  showToast(`Pesanan berhasil dibuat! Nomor: ${newOrder.id}`);
  $("pesanan").scrollIntoView({ behavior: "smooth" });
});

// ======================================================
// 7. PESANAN AKTIF DAN RIWAYAT
// ======================================================

function statusClass(status) {
  if (status === "Siap Diambil") return "status-siap";
  if (status === "Selesai") return "status-selesai";
  if (status === "Ditolak") return "status-ditolak";
  return "";
}

function orderCardHTML(order) {
  const items = (order.items || []).map((item) =>
    `<li>${escapeHTML(item.name)} × ${Number(item.quantity) || 0}</li>`
  ).join("");

  const date = new Date(order.createdAt).toLocaleString("id-ID");

  return `
    <article class="order-card">
      <h3>Pesanan ${escapeHTML(order.id)}</h3>
      <p><strong>${escapeHTML(order.name)}</strong>
        ${order.customerClass ? `· ${escapeHTML(order.customerClass)}` : ""}
      </p>
      <p class="small">${date}</p>
      <span class="status-pill ${statusClass(order.status)}">${escapeHTML(order.status)}</span>
      <ul>${items}</ul>
      <div class="price-line">
        <span>Total</span><strong>${rupiah(order.total)}</strong>
      </div>
      ${order.status === "Siap Diambil"
        ? `<p><strong>📣 Pesananmu siap diambil di kantin!</strong></p>`
        : ""}
      ${order.status === "Selesai"
        ? `<p class="small">Pesanan telah selesai.</p>`
        : ""}
    </article>
  `;
}

function renderOrders() {
  orders = readJSON(ORDER_KEY, []);

  // Pesanan selesai atau ditolak tidak lagi ditampilkan di daftar aktif.
  const activeOrders = orders.filter(
    (order) => !["Selesai", "Ditolak"].includes(order.status)
  );

  const historyOrders = orders.filter(
    (order) => ["Selesai", "Ditolak"].includes(order.status)
  );

  $("myOrders").innerHTML = activeOrders.map(orderCardHTML).join("");
  $("orderHistory").innerHTML = historyOrders.map(orderCardHTML).join("");

  $("emptyOrders").classList.toggle("hidden", activeOrders.length > 0);
  $("emptyHistory").classList.toggle("hidden", historyOrders.length > 0);
}

// ======================================================
// 8. PEMANGGILAN PESANAN SIAP
// ======================================================

function showCustomerCall(order) {
  activeCallOrderId = order.id;
  $("customerCallTitle").textContent = `📣 Pesanan ${order.id} sudah siap!`;
  $("customerCallMessage").textContent =
    `Perhatian, ${order.name}${order.customerClass ? ` dari kelas ${order.customerClass}` : ""}. Pesananmu sudah siap diambil di kantin.`;
  $("customerCall").classList.remove("hidden");
  $("noCustomerCall").classList.add("hidden");

  // Notifikasi browser hanya bekerja jika didukung dan telah diizinkan.
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("KantinQ — Pesanan Siap", {
        body: `Pesanan ${order.id} atas nama ${order.name} siap diambil.`
      });
    } catch (error) {
      console.log("Notifikasi browser tidak dapat ditampilkan.");
    }
  }
}

$("dismissCallButton").addEventListener("click", () => {
  $("customerCall").classList.add("hidden");
  $("noCustomerCall").classList.remove("hidden");
});

function checkReadyOrders() {
  const latestOrders = readJSON(ORDER_KEY, []);
  const previousOrders = orders;
  orders = latestOrders;

  // Hanya panggil otomatis ketika status berubah menjadi siap.
  for (const order of latestOrders) {
    const previousOrder = previousOrders.find((item) => item.id === order.id);

    if (
      order.status === "Siap Diambil" &&
      previousOrder &&
      previousOrder.status !== "Siap Diambil"
    ) {
      showCustomerCall(order);
    }
  }

  // Menampilkan pemanggilan jika halaman dibuka ketika pesanan sudah siap.
  if (activeCallOrderId) {
    const currentCall = latestOrders.find((item) => item.id === activeCallOrderId);
    if (!currentCall || currentCall.status !== "Siap Diambil") {
      activeCallOrderId = null;
      $("customerCall").classList.add("hidden");
      $("noCustomerCall").classList.remove("hidden");
    }
  } else {
    const readyOrder = latestOrders.find((item) => item.status === "Siap Diambil");
    if (readyOrder) showCustomerCall(readyOrder);
  }

  renderOrders();
}

// Meminta izin notifikasi setelah pelanggan menekan tombol.
$("customerCall").addEventListener("click", async (event) => {
  if (event.target.id !== "dismissCallButton" &&
      "Notification" in window &&
      Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.log("Izin notifikasi tidak tersedia.");
    }
  }
});

// ======================================================
// 9. MODE GELAP
// ======================================================

$("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  $("themeButton").textContent = isDark ? "☀️ Mode Terang" : "🌙 Mode Gelap";
  localStorage.setItem("kantinq_dark", isDark ? "yes" : "no");
});

if (localStorage.getItem("kantinq_dark") === "yes") {
  document.body.classList.add("dark");
  $("themeButton").textContent = "☀️ Mode Terang";
}

// ======================================================
// 10. EVENT TOMBOL MENU DAN KERANJANG
// ======================================================

$("menuList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

$("cartList").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.plus) changeQuantity(button.dataset.plus, 1);
  if (button.dataset.minus) changeQuantity(button.dataset.minus, -1);

  if (button.dataset.remove) {
    cart = cart.filter((item) => item.id !== button.dataset.remove);
    saveCart();
    renderCart();
  }
});

$("searchInput").addEventListener("input", renderMenus);
$("categoryFilter").addEventListener("change", renderMenus);

function renderAll() {
  refreshData();
  renderMenus();
  renderCart();
  renderOrders();
}

renderAll();

// Memperbarui tampilan saat halaman penjual mengubah data di browser yang sama.
window.addEventListener("storage", (event) => {
  if ([MENU_KEY, ORDER_KEY, SETTINGS_KEY].includes(event.key)) {
    renderAll();
    checkReadyOrders();
  }
});

// Pemeriksaan berkala membantu halaman pelanggan melihat status terbaru
// jika data berubah di tab lain pada browser yang sama.
setInterval(checkReadyOrders, 3000);
