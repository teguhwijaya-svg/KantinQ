
/* =========================================================
   KANTINQ - PANEL PENJUAL
   Penyimpanan: localStorage (tanpa database)
   ========================================================= */

// 1. Kunci penyimpanan data di browser
const MENU_KEY = "kantinq_menus";
const ORDER_KEY = "kantinq_orders";
const SETTINGS_KEY = "kantinq_settings";

// 2. Data menu awal jika belum tersedia
const DEFAULT_MENUS = [
  {
    id: "m1",
    name: "Bakso Kuah",
    category: "Makanan",
    price: 12000,
    stock: 20,
    description: "Bakso hangat dengan kuah gurih.",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m2",
    name: "Nasi Goreng",
    category: "Makanan",
    price: 15000,
    stock: 20,
    description: "Nasi goreng lezat untuk makan siang.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m3",
    name: "Mie Ayam",
    category: "Makanan",
    price: 12000,
    stock: 20,
    description: "Mie ayam dengan topping ayam.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m4",
    name: "Es Teh",
    category: "Minuman",
    price: 4000,
    stock: 30,
    description: "Teh manis dingin yang menyegarkan.",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m5",
    name: "Jus Jeruk",
    category: "Minuman",
    price: 7000,
    stock: 20,
    description: "Minuman jeruk segar.",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m6",
    name: "Kentang Goreng",
    category: "Camilan",
    price: 8000,
    stock: 20,
    description: "Kentang goreng renyah.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m7",
    name: "Puding Cokelat",
    category: "Camilan",
    price: 6000,
    stock: 20,
    description: "Puding lembut dengan rasa cokelat.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "m8",
    name: "Roti Cokelat",
    category: "Camilan",
    price: 5000,
    stock: 20,
    description: "Roti dengan isian cokelat.",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484df?auto=format&fit=crop&w=600&q=80"
  }
];

const DEFAULT_SETTINGS = {
  open: true,
  prepMinutes: 10
};

const ORDER_STATUSES = [
  "Menunggu",
  "Diproses",
  "Siap Diambil",
  "Selesai",
  "Ditolak"
];

// 3. Fungsi bantuan
function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error("Gagal membaca data:", key, error);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    showToast("Data gagal disimpan. Periksa penyimpanan browser.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function getElement(id) {
  return document.getElementById(id);
}

// 4. Pastikan elemen halaman sudah tersedia
document.addEventListener("DOMContentLoaded", initializeSeller);

function initializeSeller() {
  // Isi data awal hanya jika belum ada data tersimpan.
  if (localStorage.getItem(MENU_KEY) === null) {
    saveJSON(MENU_KEY, DEFAULT_MENUS);
  }

  if (localStorage.getItem(ORDER_KEY) === null) {
    saveJSON(ORDER_KEY, []);
  }

  if (localStorage.getItem(SETTINGS_KEY) === null) {
    saveJSON(SETTINGS_KEY, DEFAULT_SETTINGS);
  }

  bindEvents();
  renderAll();
}

// 5. Membaca data terbaru dari browser
function getMenus() {
  const data = readJSON(MENU_KEY, DEFAULT_MENUS);
  return Array.isArray(data) ? data : DEFAULT_MENUS;
}

function getOrders() {
  const data = readJSON(ORDER_KEY, []);
  return Array.isArray(data) ? data : [];
}

function getSettings() {
  const data = readJSON(SETTINGS_KEY, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(data || {}) };
}

let menus = [];
let orders = [];
let settings = {};
let toastTimer;

// 6. Notifikasi kecil di halaman
function showToast(message) {
  const toast = getElement("sellerToast");
  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// 7. Menghubungkan tombol dan form
function bindEvents() {
  getElement("saveSettingsButton")?.addEventListener("click", saveSettings);

  getElement("menuForm")?.addEventListener("submit", saveMenu);
  getElement("cancelEditButton")?.addEventListener("click", resetMenuForm);

  getElement("sellerMenuList")?.addEventListener("click", handleMenuActions);
  getElement("ordersList")?.addEventListener("click", handleOrderActions);
  getElement("ordersList")?.addEventListener("change", handleOrderStatusChange);

  getElement("orderSearch")?.addEventListener("input", renderOrders);
  getElement("orderFilter")?.addEventListener("change", renderOrders);

  getElement("refreshButton")?.addEventListener("click", () => {
    refreshData();
    renderAll();
    showToast("Data berhasil diperbarui.");
  });

  getElement("downloadReportButton")?.addEventListener("click", downloadReport);

  // Data yang diubah di tab browser lain pada perangkat yang sama.
  window.addEventListener("storage", event => {
    if ([MENU_KEY, ORDER_KEY, SETTINGS_KEY].includes(event.key)) {
      refreshData();
      renderAll();
    }
  });
}

// 8. Memuat ulang data dari localStorage
function refreshData() {
  menus = getMenus();
  orders = getOrders();
  settings = getSettings();
}

function renderAll() {
  refreshData();
  renderSettings();
  renderStats();
  renderOrders();
  renderSellerMenus();
  renderReport();
}

// 9. Pengaturan buka/tutup kantin
function renderSettings() {
  const openStatus = getElement("openStatus");
  const prepMinutes = getElement("prepMinutes");

  if (openStatus) openStatus.checked = Boolean(settings.open);
  if (prepMinutes) prepMinutes.value = settings.prepMinutes;
}

function saveSettings() {
  const openStatus = getElement("openStatus");
  const prepMinutes = getElement("prepMinutes");

  const minutes = Number(prepMinutes?.value);

  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
    showToast("Waktu persiapan harus 1–180 menit.");
    return;
  }

  settings = {
    open: Boolean(openStatus?.checked),
    prepMinutes: minutes
  };

  if (!saveJSON(SETTINGS_KEY, settings)) return;

  showToast(settings.open
    ? "Kantin sekarang dibuka."
    : "Kantin sekarang ditutup.");

  renderSettings();
}

// 10. Statistik panel penjual
function renderStats() {
  const activeCount = orders.filter(order =>
    !["Selesai", "Ditolak"].includes(order.status)
  ).length;

  const readyCount = orders.filter(order =>
    order.status === "Siap Diambil"
  ).length;

  const salesTotal = orders
    .filter(order => order.status === "Selesai")
    .reduce((total, order) => total + getOrderTotal(order), 0);

  if (getElement("activeCount")) {
    getElement("activeCount").textContent = activeCount;
  }

  if (getElement("readyCount")) {
    getElement("readyCount").textContent = readyCount;
  }

  if (getElement("menuCount")) {
    getElement("menuCount").textContent = menus.length;
  }

  if (getElement("salesTotal")) {
    getElement("salesTotal").textContent = rupiah(salesTotal);
  }
}

// 11. Menghitung total pesanan dari beberapa bentuk data
function getOrderItems(order) {
  return Array.isArray(order.items) ? order.items : [];
}

function getItemName(item) {
  return item.name || item.menuName || item.nama || "Menu";
}

function getItemQuantity(item) {
  return Math.max(0, Number(
    item.quantity ?? item.qty ?? item.jumlah ?? 1
  ) || 0);
}

function getItemPrice(item) {
  return Math.max(0, Number(
    item.price ?? item.harga ?? 0
  ) || 0);
}

function getOrderTotal(order) {
  const items = getOrderItems(order);

  if (items.length) {
    return items.reduce((sum, item) => {
      return sum + getItemPrice(item) * getItemQuantity(item);
    }, 0);
  }

  return Number(order.total ?? order.totalHarga ?? 0) || 0;
}

function getOrderId(order) {
  return order.id ?? order.orderId ?? "Tanpa ID";
}

function getCustomerName(order) {
  return order.name || order.customerName || order.nama || "Pelanggan";
}

function getOrderStatus(order) {
  return ORDER_STATUSES.includes(order.status) ? order.status : "Menunggu";
}

// 12. Menampilkan pesanan
function renderOrders() {
  const list = getElement("ordersList");
  const noOrders = getElement("noOrders");

  if (!list) return;

  const searchText = (getElement("orderSearch")?.value || "")
    .trim()
    .toLowerCase();

  const filterStatus = getElement("orderFilter")?.value || "Semua";

  const filteredOrders = orders.filter(order => {
    const searchSource = [
      getOrderId(order),
      getCustomerName(order),
      order.customerClass || "",
      ...getOrderItems(order).map(getItemName)
    ].join(" ").toLowerCase();

    const matchesSearch = searchSource.includes(searchText);
    const matchesStatus = filterStatus === "Semua" ||
      getOrderStatus(order) === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (noOrders) {
    noOrders.classList.toggle("hidden", filteredOrders.length > 0);
  }

  if (!filteredOrders.length) {
    list.innerHTML = "";
    return;
  }

  list.innerHTML = filteredOrders.map(order => {
    const status = getOrderStatus(order);
    const items = getOrderItems(order);

    const itemHTML = items.length
      ? items.map(item => `
          <li>
            <span>${escapeHTML(getItemName(item))} × ${getItemQuantity(item)}</span>
            <strong>${rupiah(getItemPrice(item) * getItemQuantity(item))}</strong>
          </li>
        `).join("")
      : "<li>Rincian menu tidak tersedia</li>";

    const options = ORDER_STATUSES.map(itemStatus => `
      <option value="${itemStatus}" ${status === itemStatus ? "selected" : ""}>
        ${itemStatus}
      </option>
    `).join("");

    const readyButton = status === "Siap Diambil"
      ? `<button type="button" class="btn-call" data-call="${escapeHTML(getOrderId(order))}">
           📢 Panggil Pelanggan
         </button>`
      : "";

    return `
      <article class="order-card">
        <div class="order-card-header">
          <div>
            <h3>Pesanan #${escapeHTML(getOrderId(order))}</h3>
            <p>${escapeHTML(getCustomerName(order))}</p>
            <small>${escapeHTML(order.customerClass || "")}</small>
          </div>
          <span class="status-label ${statusClass(status)}">
            ${escapeHTML(status)}
          </span>
        </div>

        <p class="order-date">${escapeHTML(formatDate(
          order.createdAt || order.date || order.tanggal
        ))}</p>

        <ul class="order-items">${itemHTML}</ul>

        <div class="order-total">
          <span>Total</span>
          <strong>${rupiah(getOrderTotal(order))}</strong>
        </div>

        <div class="order-controls">
          <label>
            Status pesanan
            <select data-status="${escapeHTML(getOrderId(order))}">
              ${options}
            </select>
          </label>
          ${readyButton}
        </div>
      </article>
    `;
  }).join("");
}

function statusClass(status) {
  return "status-" + status
    .toLowerCase()
    .replace(/\s+/g, "-");
}

// 13. Mengubah status pesanan
function handleOrderStatusChange(event) {
  const select = event.target.closest("[data-status]");
  if (!select) return;

  const order = orders.find(item =>
    String(getOrderId(item)) === select.dataset.status
  );

  if (!order) return;

  const oldStatus = getOrderStatus(order);
  const newStatus = select.value;

  if (!ORDER_STATUSES.includes(newStatus)) {
    showToast("Status pesanan tidak valid.");
    renderOrders();
    return;
  }

  order.status = newStatus;

  if (newStatus === "Siap Diambil") {
    order.readyAt = new Date().toISOString();
  }

  if (newStatus === "Selesai") {
    order.completedAt = new Date().toISOString();
  }

  if (!saveJSON(ORDER_KEY, orders)) {
    order.status = oldStatus;
    renderOrders();
    return;
  }

  if (newStatus === "Siap Diambil") {
    announceCustomer(order);
  } else {
    showToast(`Pesanan diperbarui menjadi "${newStatus}".`);
  }

  renderAll();
}

// 14. Panggilan suara saat pesanan siap
function announceCustomer(order) {
  const customer = getCustomerName(order);
  const orderId = getOrderId(order);
  const message = `Perhatian, pesanan ${orderId} atas nama ${customer} sudah siap. Silakan ambil pesanan di kantin.`;

  showToast(`📢 Pesanan ${orderId} siap diambil!`);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "id-ID";
    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
  }
}

function handleOrderActions(event) {
  const button = event.target.closest("[data-call]");
  if (!button) return;

  const order = orders.find(item =>
    String(getOrderId(item)) === button.dataset.call
  );

  if (order) announceCustomer(order);
}

// 15. Menampilkan menu penjual
function renderSellerMenus() {
  const list = getElement("sellerMenuList");
  if (!list) return;

  if (!menus.length) {
    list.innerHTML = "<p>Belum ada menu. Silakan tambahkan menu baru.</p>";
    return;
  }

  list.innerHTML = menus.map(menu => `
    <article class="seller-menu-item">
      <img
        src="${escapeHTML(menu.image || "")}"
        alt="${escapeHTML(menu.name)}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://placehold.co/400x250?text=KantinQ';"
      >

      <div class="seller-menu-info">
        <h3>${escapeHTML(menu.name)}</h3>
        <p>${escapeHTML(menu.category || "Lainnya")}</p>
        <p>${escapeHTML(menu.description || "")}</p>
        <strong>${rupiah(menu.price)}</strong>
        <p>Stok: ${Number(menu.stock) || 0}</p>
      </div>

      <div class="menu-actions">
        <button type="button" class="btn-edit" data-edit-menu="${escapeHTML(menu.id)}">
          Edit
        </button>
        <button type="button" class="btn-danger" data-delete-menu="${escapeHTML(menu.id)}">
          Hapus
        </button>
      </div>
    </article>
  `).join("");
}

// 16. Menambah atau mengedit menu
function saveMenu(event) {
  event.preventDefault();
  refreshData();

  const id = getElement("menuId")?.value.trim() || "";
  const name = getElement("menuName")?.value.trim() || "";
  const category = getElement("menuCategory")?.value || "Lainnya";
  const price = Number(getElement("menuPrice")?.value);
  const stock = Number(getElement("menuStock")?.value);
  const description = getElement("menuDescription")?.value.trim() || "";
  const image = getElement("menuImage")?.value.trim() || "";

  if (!name || !description) {
    showToast("Nama dan deskripsi menu wajib diisi.");
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    showToast("Harga harus lebih besar dari nol.");
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    showToast("Stok harus berupa bilangan bulat minimal 0.");
    return;
  }

  const existingMenu = menus.find(menu => String(menu.id) === id);

  const menuData = {
    id: existingMenu ? existingMenu.id : `m-${Date.now()}`,
    name,
    category,
    price,
    stock,
    description,
    image: image || "https://placehold.co/400x250?text=KantinQ"
  };

  if (existingMenu) {
    menus = menus.map(menu =>
      String(menu.id) === id ? { ...menu, ...menuData } : menu
    );
  } else {
    menus.push(menuData);
  }

  if (!saveJSON(MENU_KEY, menus)) return;

  resetMenuForm();
  renderAll();
  showToast(existingMenu ? "Menu berhasil diperbarui." : "Menu berhasil ditambahkan.");
}

function resetMenuForm() {
  getElement("menuForm")?.reset();

  if (getElement("menuId")) getElement("menuId").value = "";

  const title = getElement("formTitle");
  if (title) title.textContent = "Tambah Menu";

  const saveButton = getElement("saveMenuButton");
  if (saveButton) saveButton.textContent = "Simpan Menu";

  const cancelButton = getElement("cancelEditButton");
  if (cancelButton) cancelButton.hidden = true;
}

// 17. Tombol edit dan hapus menu
function handleMenuActions(event) {
  const editButton = event.target.closest("[data-edit-menu]");
  const deleteButton = event.target.closest("[data-delete-menu]");

  if (editButton) {
    editMenu(editButton.dataset.editMenu);
  }

  if (deleteButton) {
    deleteMenu(deleteButton.dataset.deleteMenu);
  }
}

function editMenu(id) {
  const menu = menus.find(item => String(item.id) === String(id));
  if (!menu) return;

  getElement("menuId").value = menu.id;
  getElement("menuName").value = menu.name;
  getElement("menuCategory").value = menu.category || "Lainnya";
  getElement("menuPrice").value = menu.price;
  getElement("menuStock").value = menu.stock;
  getElement("menuDescription").value = menu.description || "";
  getElement("menuImage").value = menu.image || "";

  if (getElement("formTitle")) {
    getElement("formTitle").textContent = "Edit Menu";
  }

  if (getElement("saveMenuButton")) {
    getElement("saveMenuButton").textContent = "Simpan Perubahan";
  }

  if (getElement("cancelEditButton")) {
    getElement("cancelEditButton").hidden = false;
  }

  getElement("menuForm")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function deleteMenu(id) {
  const menu = menus.find(item => String(item.id) === String(id));
  if (!menu) return;

  if (!confirm(`Yakin ingin menghapus menu "${menu.name}"?`)) return;

  menus = menus.filter(item => String(item.id) !== String(id));

  if (!saveJSON(MENU_KEY, menus)) return;

  if (String(getElement("menuId")?.value) === String(id)) {
    resetMenuForm();
  }

  renderAll();
  showToast("Menu berhasil dihapus.");
}

// 18. Laporan penjualan
function renderReport() {
  const list = getElement("reportList");
  const totalElement = getElement("reportTotal");

  const completedOrders = orders.filter(order =>
    getOrderStatus(order) === "Selesai"
  );

  const total = completedOrders.reduce(
    (sum, order) => sum + getOrderTotal(order), 0
  );

  if (totalElement) totalElement.textContent = rupiah(total);

  if (!list) return;

  if (!completedOrders.length) {
    list.innerHTML = "<p>Belum ada pesanan yang selesai.</p>";
    return;
  }

  list.innerHTML = completedOrders.map(order => `
    <article class="report-item">
      <div>
        <strong>Pesanan #${escapeHTML(getOrderId(order))}</strong>
        <p>${escapeHTML(getCustomerName(order))}</p>
        <small>${escapeHTML(formatDate(
          order.completedAt || order.createdAt || order.date
        ))}</small>
      </div>
      <strong>${rupiah(getOrderTotal(order))}</strong>
    </article>
  `).join("");
}

// 19. Mengunduh laporan sebagai file CSV
function downloadReport() {
  const completedOrders = orders.filter(order =>
    getOrderStatus(order) === "Selesai"
  );

  if (!completedOrders.length) {
    showToast("Belum ada laporan penjualan untuk diunduh.");
    return;
  }

  const rows = [
    ["ID Pesanan", "Nama Pelanggan", "Tanggal", "Status", "Total"],
    ...completedOrders.map(order => [
      getOrderId(order),
      getCustomerName(order),
      formatDate(order.completedAt || order.createdAt || order.date),
      getOrderStatus(order),
      getOrderTotal(order)
    ])
  ];

  // Mengamankan teks CSV agar tanda koma dan kutip tidak merusak kolom.
  const csv = rows.map(row => row.map(value =>
    `"${String(value ?? "").replace(/"/g, '""')}"`
  ).join(",")).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "laporan-penjualan-kantinq.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  showToast("Laporan berhasil diunduh.");
}

// 20. Pembaruan otomatis untuk perubahan di browser ini
// Tidak memakai interval pendek agar form edit tidak terus-menerus terganggu.
window.addEventListener("focus", () => {
  refreshData();
  renderAll();
});
