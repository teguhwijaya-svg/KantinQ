
// ======================================================
// 1. PENYIMPANAN DATA
// ======================================================

const MENU_KEY = "kantinq_menus";
const ORDER_KEY = "kantinq_orders";
const SETTINGS_KEY = "kantinq_settings";

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
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484df?auto=format&fit=crop&w=800&q=80"
  }
];

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
let settings = readJSON(SETTINGS_KEY, {
  open: true,
  prepMinutes: 10
});

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

function showSellerToast(message) {
  const toast = $("sellerToast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showSellerToast.timer);
  showSellerToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function refreshData() {
  menus = readJSON(MENU_KEY, defaultMenus);
  orders = readJSON(ORDER_KEY, []);
  settings = readJSON(SETTINGS_KEY, {
    open: true,
    prepMinutes: 10
  });
}

function saveMenus() {
  saveJSON(MENU_KEY, menus);
}

function saveOrders() {
  saveJSON(ORDER_KEY, orders);
}

// ======================================================
// 3. PENGATURAN KANTIN
// ======================================================

function renderSettings() {
  $("openStatus").value = settings.open === false ? "closed" : "open";
  $("prepMinutes").value = Number(settings.prepMinutes) || 10;
}

$("saveSettingsButton").addEventListener("click", () => {
  const minutes = Number($("prepMinutes").value);

  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
    showSellerToast("Estimasi harus antara 1 sampai 180 menit.");
    return;
  }

  settings = {
    open: $("openStatus").value === "open",
    prepMinutes: minutes
  };

  saveJSON(SETTINGS_KEY, settings);
  showSellerToast("Pengaturan kantin berhasil disimpan.");
});

// ======================================================
// 4. DASHBOARD DAN RINGKASAN
// ======================================================

function renderStats() {
  const activeOrders = orders.filter(
    (order) => !["Selesai", "Ditolak"].includes(order.status)
  );

  const readyOrders = orders.filter(
    (order) => order.status === "Siap Diambil"
  );

  const completedOrders = orders.filter(
    (order) => order.status === "Selesai"
  );

  const totalSales = completedOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  $("activeCount").textContent = activeOrders.length;
  $("readyCount").textContent = readyOrders.length;
  $("menuCount").textContent = menus.length;
  $("salesTotal").textContent = rupiah(totalSales);
}

// ======================================================
// 5. MENAMPILKAN PESANAN
// ======================================================

function renderOrders() {
  const query = $("orderSearch").value.trim().toLowerCase();
  const filter = $("orderFilter").value;

  const filteredOrders = orders.filter((order) => {
    const matchesQuery =
      String(order.id).toLowerCase().includes(query) ||
      String(order.name).toLowerCase().includes(query) ||
      String(order.customerClass || "").toLowerCase().includes(query);

    const matchesStatus =
      filter === "Semua" || order.status === filter;

    return matchesQuery && matchesStatus;
  });

  $("ordersList").innerHTML = filteredOrders.map((order) => {
    const itemsHTML = (order.items || []).map((item) => `
      <li>${escapeHTML(item.name)} × ${Number(item.quantity) || 0}
        — ${rupiah(Number(item.price || 0) * Number(item.quantity || 0))}
      </li>
    `).join("");

    const date = new Date(order.createdAt).toLocaleString("id-ID");

    return `
      <article class="order-card">
        <h3>Pesanan ${escapeHTML(order.id)}</h3>
        <p><strong>${escapeHTML(order.name)}</strong>
          ${order.customerClass ? `· ${escapeHTML(order.customerClass)}` : ""}
        </p>
        <p class="small">${date}</p>
        <p class="status-label">Status: ${escapeHTML(order.status)}</p>
        <ul class="order-items">${itemsHTML}</ul>
        <div class="report-total">
          <span>Total pesanan</span>
          <strong>${rupiah(order.total)}</strong>
        </div>

        <div class="order-controls">
          <select data-status="${escapeHTML(order.id)}" aria-label="Ubah status pesanan">
            ${["Menunggu", "Diproses", "Siap Diambil", "Selesai", "Ditolak"]
              .map((status) => `
                <option value="${status}" ${order.status === status ? "selected" : ""}>
                  ${status}
                </option>
              `).join("")}
          </select>
          <button class="btn btn-outline" type="button" data-estimate="${escapeHTML(order.id)}">
            ⏱ Estimasi
          </button>
          ${order.status === "Siap Diambil" ? `
            <button class="btn order-call-button" type="button" data-call="${escapeHTML(order.id)}">
              📣 Panggil Pelanggan
            </button>
          ` : ""}
        </div>
      </article>
    `;
  }).join("");

  $("noOrders").classList.toggle("hidden", filteredOrders.length > 0);
}

// ======================================================
// 6. PEMANGGILAN PELANGGAN DENGAN SUARA
// ======================================================

function announceCustomer(order) {
  const message =
    `Perhatian. Nomor antrean ${order.id}. ` +
    `Pelanggan atas nama ${order.name}. ` +
    "Pesanan Anda sudah siap. Silakan mengambil pesanan di kantin.";

  // Membacakan panggilan jika browser mendukung fitur suara.
  if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "id-ID";
    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  }

  showSellerToast(`📣 Memanggil ${order.name}, pesanan ${order.id}.`);
}

$("ordersList").addEventListener("click", (event) => {
  const callButton = event.target.closest("[data-call]");
  const estimateButton = event.target.closest("[data-estimate]");

  if (callButton) {
    const order = orders.find(
      (item) => item.id === callButton.dataset.call
    );

    if (order && order.status === "Siap Diambil") {
      announceCustomer(order);
    }
  }

  if (estimateButton) {
    const order = orders.find(
      (item) => item.id === estimateButton.dataset.estimate
    );

    if (order) {
      const minutes = Number(order.prepMinutes || settings.prepMinutes || 10);
      showSellerToast(`Estimasi persiapan pesanan ${order.id}: ${minutes} menit.`);
    }
  }
});

// ======================================================
// 7. MENGUBAH STATUS PESANAN
// ======================================================

$("ordersList").addEventListener("change", (event) => {
  const select = event.target.closest("[data-status]");
  if (!select) return;

  const order = orders.find((item) => item.id === select.dataset.status);
  if (!order) return;

  const previousStatus = order.status;
  const newStatus = select.value;

  // Jangan mengubah pesanan selesai atau ditolak menjadi status aktif
  // tanpa sengaja, agar perhitungan penjualan tidak bertambah dua kali.
  if (["Selesai", "Ditolak"].includes(previousStatus) &&
      !["Selesai", "Ditolak"].includes(newStatus)) {
    const confirmed = confirm(
      "Pesanan ini sudah masuk riwayat. Yakin ingin mengaktifkannya kembali?"
    );

    if (!confirmed) {
      select.value = previousStatus;
      return;
    }
  }

  order.status = newStatus;

  // Jika status baru menjadi siap, panggil pelanggan otomatis.
  if (previousStatus !== "Siap Diambil" && newStatus === "Siap Diambil") {
    announceCustomer(order);
  }

  // Tambahkan jumlah terjual hanya ketika pesanan pertama kali selesai.
  if (previousStatus !== "Selesai" && newStatus === "Selesai") {
    menus = menus.map((menu) => {
      const soldItem = (order.items || []).find((item) => item.id === menu.id);

      return soldItem
        ? {
            ...menu,
            sold: Number(menu.sold || 0) + Number(soldItem.quantity || 0)
          }
        : menu;
    });

    saveMenus();
  }

  saveOrders();
  renderAll();
  showSellerToast(`Status pesanan ${order.id} diubah menjadi ${newStatus}.`);
});

// ======================================================
// 8. TAMBAH, EDIT, DAN HAPUS MENU
// ======================================================

function resetMenuForm() {
  $("menuForm").reset();
  $("menuId").value = "";
  $("formTitle").textContent = "Tambah Menu Baru";
  $("saveMenuButton").textContent = "Simpan Menu";
  $("menuCategory").value = "Makanan";
}

$("menuForm").addEventListener("submit", (event) => {
  event.preventDefault();
  refreshData();

  const id = $("menuId").value;
  const name = $("menuName").value.trim();
  const category = $("menuCategory").value;
  const price = Number($("menuPrice").value);
  const stock = Number($("menuStock").value);
  const description = $("menuDescription").value.trim();
  const image = $("menuImage").value.trim();

  if (!name || !description) {
    showSellerToast("Nama dan deskripsi menu harus diisi.");
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    showSellerToast("Harga harus lebih besar dari nol.");
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    showSellerToast("Stok harus berupa bilangan bulat nol atau lebih.");
    return;
  }

  const existingMenu = menus.find((menu) => menu.id === id);

  const menuData = {
    id: id || `m-${Date.now()}`,
    name,
    category,
    price,
    stock,
    sold: existingMenu ? Number(existingMenu.sold || 0) : 0,
    description,
    image: image || "https://placehold.co/800x500?text=Gambar+Menu"
  };

  if (existingMenu) {
    menus = menus.map((menu) => menu.id === id ? menuData : menu);
    showSellerToast("Menu berhasil diperbarui.");
  } else {
    menus.push(menuData);
    showSellerToast("Menu baru berhasil ditambahkan.");
  }

  saveMenus();
  resetMenuForm();
  renderAll();
});

$("cancelEditButton").addEventListener("click", resetMenuForm);

$("sellerMenuList").addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-menu]");
  const deleteButton = event.target.closest("[data-delete-menu]");

  if (editButton) {
    const menu = menus.find((item) => item.id === editButton.dataset.editMenu);
    if (!menu) return;

    $("menuId").value = menu.id;
    $("menuName").value = menu.name;
    $("menuCategory").value = menu.category;
    $("menuPrice").value = menu.price;
    $("menuStock").value = menu.stock;
    $("menuDescription").value = menu.description;
    $("menuImage").value = menu.image || "";
    $("formTitle").textContent = "Edit Menu";
    $("saveMenuButton").textContent = "Simpan Perubahan";

    $("menuForm").scrollIntoView({ behavior: "smooth" });
  }

  if (deleteButton) {
    const menu = menus.find((item) => item.id === deleteButton.dataset.deleteMenu);
    if (!menu) return;

    const confirmed = confirm(`Yakin ingin menghapus menu "${menu.name}"?`);
    if (!confirmed) return;

    menus = menus.filter((item) => item.id !== menu.id);
    saveMenus();
    resetMenuForm();
    renderAll();
    showSellerToast("Menu berhasil dihapus.");
  }
});

function renderSellerMenus() {
  $("sellerMenuList").innerHTML = menus.map((menu) => `
    <article class="seller-menu-item">
      <img
        src="${escapeHTML(menu.image || "")}"
        alt="${escapeHTML(menu.name)}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://placehold.co/300x300?text=Menu';"
      >
      <div>
        <h3>${escapeHTML(menu.name)}</h3>
        <p>${escapeHTML(menu.category)} · ${rupiah(menu.price)}</p>
        <p>Stok: ${Number(menu.stock) || 0} · Terjual: ${Number(menu.sold) || 0}</p>
        <p>${escapeHTML(menu.description)}</p>
        <div class="menu-actions">
          <button class="btn btn-outline" type="button" data-edit-menu="${escapeHTML(menu.id)}">
            Edit
          </button>
          <button class="btn btn-danger" type="button" data-delete-menu="${escapeHTML(menu.id)}">
            Hapus
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

// ======================================================
// 9. LAPORAN PENJUALAN
// ======================================================

function renderReport() {
  const completedOrders = orders.filter(
    (order) => order.status === "Selesai"
  );

  $("reportList").innerHTML = completedOrders.map((order) => `
    <tr>
      <td>${escapeHTML(order.id)}</td>
      <td>${escapeHTML(order.name)}</td>
      <td>${new Date(order.createdAt).toLocaleDateString("id-ID")}</td>
      <td>${rupiah(order.total)}</td>
    </tr>
  `).join("");

  const total = completedOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  $("reportTotal").textContent = rupiah(total);
}

$("downloadReportButton").addEventListener("click", () => {
  const completedOrders = orders.filter(
    (order) => order.status === "Selesai"
  );

  if (completedOrders.length === 0) {
    showSellerToast("Belum ada penjualan selesai untuk diunduh.");
    return;
  }

  const rows = [
    ["Nomor Pesanan", "Nama Pelanggan", "Tanggal", "Total"],
    ...completedOrders.map((order) => [
      order.id,
      order.name,
      new Date(order.createdAt).toLocaleString("id-ID"),
      order.total
    ])
  ];

  // CSV dapat dibuka dengan Excel atau aplikasi spreadsheet lain.
  const csv = rows.map((row) =>
    row.map((value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`
    ).join(",")
  ).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "laporan-penjualan-kantinq.csv";
  link.click();
  URL.revokeObjectURL(url);

  showSellerToast("Laporan CSV berhasil dibuat.");
});

// ======================================================
// 10. EVENT FILTER DAN PENYEGARAN DATA
// ======================================================

$("orderSearch").addEventListener("input", renderOrders);
$("orderFilter").addEventListener("change", renderOrders);

$("refreshButton").addEventListener("click", () => {
  refreshData();
  renderAll();
  showSellerToast("Data berhasil diperbarui.");
});

function renderAll() {
  refreshData();
  renderSettings();
  renderStats();
  renderOrders();
  renderSellerMenus();
  renderReport();
}

// Jalankan saat halaman pertama kali dibuka.
renderAll();

// Dengarkan perubahan data dari tab lain dalam browser yang sama.
window.addEventListener("storage", (event) => {
  if ([MENU_KEY, ORDER_KEY, SETTINGS_KEY].includes(event.key)) {
    renderAll();
  }
});

// Periksa data berkala agar perubahan pada tab lain cepat terlihat.
setInterval(() => {
  refreshData();
  renderStats();
  renderOrders();
  renderSellerMenus();
  renderReport();
}, 3000);
