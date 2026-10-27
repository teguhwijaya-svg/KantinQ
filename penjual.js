
/* =====================================================
   1. PENYIMPANAN DATA KANTINQ
   ===================================================== */

// Semua data disimpan di localStorage browser.
// Browser dan perangkat berbeda tidak berbagi data otomatis.

const ORDER_KEY = "kantinQOrders";
const PRODUCT_KEY = "kantinQSellerProducts";

const ORDER_STATUSES = [
  "Menunggu",
  "Diproses",
  "Siap Diambil",
  "Selesai",
  "Dibatalkan"
];

// Data menu awal untuk dashboard penjual.
// Data awal ini hanya untuk fitur kelola menu penjual.
const defaultProducts = [
  {
    id: 1,
    name: "Bakso",
    price: 10000,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80",
    available: true
  },
  {
    id: 2,
    name: "Mie Ayam",
    price: 12000,
    image: "",
    available: true
  },
  {
    id: 3,
    name: "Nasi Goreng",
    price: 15000,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80",
    available: true
  },
  {
    id: 4,
    name: "Es Teh",
    price: 4000,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80",
    available: true
  },
  {
    id: 5,
    name: "Jus Jeruk",
    price: 7000,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80",
    available: true
  },
  {
    id: 6,
    name: "Roti Bakar",
    price: 8000,
    image: "",
    available: true
  }
];

/* Membaca data dari localStorage secara aman. */
function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) return fallback;

    const parsed = JSON.parse(value);

    return parsed;
  } catch (error) {
    console.error("Gagal membaca data:", error);
    return fallback;
  }
}

/* Menyimpan data dan memberi tahu jika penyimpanan gagal. */
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    alert("Data tidak dapat disimpan di browser ini.");
    return false;
  }
}

// Data pesanan dimulai kosong jika belum ada pesanan tersimpan.
let orders = readStorage(ORDER_KEY, []);

if (!Array.isArray(orders)) {
  orders = [];
}

// Mengambil menu tersimpan atau menggunakan menu awal.
let products = readStorage(PRODUCT_KEY, null);

if (!Array.isArray(products)) {
  products = defaultProducts.map(product => ({ ...product }));
  writeStorage(PRODUCT_KEY, products);
}

/* =====================================================
   2. ELEMEN HALAMAN DAN FORMAT RUPIAH
   ===================================================== */

const ordersList = document.getElementById("ordersList");
const productsList = document.getElementById("productsList");

const orderSearch = document.getElementById("orderSearch");
const statusFilter = document.getElementById("statusFilter");

const ordersMessage = document.getElementById("ordersMessage");
const productsMessage = document.getElementById("productsMessage");

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

/* Membuat elemen teks tanpa memasukkan HTML dari pengguna. */
function makeText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;

  if (className) {
    element.className = className;
  }

  return element;
}

/* =====================================================
   3. DASHBOARD DAN STATISTIK
   ===================================================== */

function renderDashboard() {
  const completed = orders.filter(
    order => order.status === "Selesai"
  );

  const active = orders.filter(
    order =>
      order.status !== "Selesai" &&
      order.status !== "Dibatalkan"
  );

  // Omzet hanya menghitung pesanan berstatus Selesai.
  const revenue = completed.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  document.getElementById("statOrders").textContent =
    orders.length;

  document.getElementById("statActive").textContent =
    active.length;

  document.getElementById("statCompleted").textContent =
    completed.length;

  document.getElementById("statRevenue").textContent =
    rupiah(revenue);
}

/* =====================================================
   4. MENAMPILKAN DAFTAR PESANAN
   ===================================================== */

function renderOrders() {
  ordersList.innerHTML = "";

  const keyword = orderSearch.value
    .trim()
    .toLowerCase();

  const selectedStatus = statusFilter.value;

  // Memfilter pesanan berdasarkan kata kunci dan status.
  const filteredOrders = orders.filter(order => {
    const matchesKeyword = (
      String(order.id).toLowerCase().includes(keyword) ||
      String(order.customer || "").toLowerCase().includes(keyword)
    );

    const matchesStatus = (
      selectedStatus === "Semua" ||
      order.status === selectedStatus
    );

    return matchesKeyword && matchesStatus;
  });

  if (filteredOrders.length === 0) {
    ordersList.appendChild(
      makeText(
        "p",
        orders.length === 0
          ? "Belum ada pesanan. Pesanan yang tersimpan di browser ini akan muncul di sini."
          : "Tidak ada pesanan yang cocok dengan pencarian.",
        "empty-state"
      )
    );

    renderDashboard();
    return;
  }

  // Menampilkan pesanan terbaru di bagian atas.
  filteredOrders.slice().reverse().forEach(order => {
    const card = document.createElement("article");
    card.className = "order-card";

    const top = document.createElement("div");
    top.className = "order-top";

    const titleArea = document.createElement("div");

    titleArea.appendChild(
      makeText("h3", "Pesanan #" + order.id)
    );

    titleArea.appendChild(
      makeText("p", "Pembeli: " + (order.customer || "Tidak diketahui"))
    );

    const badge = makeText(
      "span",
      order.status,
      "status-label"
    );

    badge.dataset.status = order.status;

    top.append(titleArea, badge);
    card.appendChild(top);

    // Daftar barang pada pesanan.
    const details = document.createElement("div");
    details.className = "order-detail";

    const items = Array.isArray(order.items) ? order.items : [];

    if (items.length === 0) {
      details.appendChild(
        makeText("p", "Rincian menu tidak tersedia.")
      );
    } else {
      items.forEach(item => {
        details.appendChild(
          makeText(
            "p",
            `${item.name} × ${item.quantity} — ${rupiah(
              Number(item.price) * Number(item.quantity)
            )}`
          )
        );
      });
    }

    card.appendChild(details);

    // Menampilkan waktu jika tersedia.
    if (order.createdAt) {
      const date = new Date(order.createdAt);

      if (!Number.isNaN(date.getTime())) {
        card.appendChild(
          makeText(
            "p",
            "Waktu: " + date.toLocaleString("id-ID")
          )
        );
      }
    }

    card.appendChild(
      makeText("p", "Total: " + rupiah(Number(order.total) || 0), "order-total")
    );

    // Pilihan status pesanan.
    const actions = document.createElement("div");
    actions.className = "order-actions";

    const select = document.createElement("select");
    select.className = "status-select";
    select.setAttribute(
      "aria-label",
      "Ubah status pesanan " + order.id
    );

    ORDER_STATUSES.forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = status === order.status;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      updateOrderStatus(order.id, select.value);
    });

    actions.appendChild(select);

    // Pesanan dapat dibatalkan kecuali sudah selesai.
    if (
      order.status !== "Selesai" &&
      order.status !== "Dibatalkan"
    ) {
      const cancelButton = makeText(
        "button",
        "Batalkan",
        "delete-button"
      );

      cancelButton.type = "button";

      cancelButton.addEventListener("click", () => {
        const confirmed = confirm(
          "Yakin ingin membatalkan pesanan ini?"
        );

        if (confirmed) {
          updateOrderStatus(order.id, "Dibatalkan");
        }
      });

      actions.appendChild(cancelButton);
    }

    card.appendChild(actions);
    ordersList.appendChild(card);
  });

  renderDashboard();
}

/* =====================================================
   5. MENGUBAH STATUS PESANAN
   ===================================================== */

function updateOrderStatus(orderId, newStatus) {
  // Hanya menerima status yang diizinkan.
  if (!ORDER_STATUSES.includes(newStatus)) return;

  const previousOrders = orders;

  orders = orders.map(order =>
    String(order.id) === String(orderId)
      ? { ...order, status: newStatus }
      : order
  );

  // Perubahan diterapkan jika berhasil disimpan.
  if (!writeStorage(ORDER_KEY, orders)) {
    orders = previousOrders;
    return;
  }

  ordersMessage.textContent =
    "Status pesanan berhasil diperbarui.";

  renderOrders();
}

/* =====================================================
   6. PENCARIAN DAN FILTER PESANAN
   ===================================================== */

orderSearch.addEventListener("input", renderOrders);
statusFilter.addEventListener("change", renderOrders);

/* =====================================================
   7. MENAMPILKAN DAFTAR MENU
   ===================================================== */

function renderProducts() {
  productsList.innerHTML = "";

  if (products.length === 0) {
    productsList.appendChild(
      makeText("p", "Belum ada menu. Tambahkan menu baru.", "empty-state")
    );
    return;
  }

  products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    // Menampilkan gambar menu.
    const image = document.createElement("img");
    image.className = "product-thumb";
    image.alt = "Gambar " + product.name;
    image.loading = "lazy";

    if (product.image) {
      image.src = product.image;
    } else {
      image.src =
        "https://placehold.co/200x200/eef2ff/4338ca?text=Menu";
    }

    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.alt = "Gambar tidak tersedia";
    }, { once: true });

    const info = document.createElement("div");
    info.className = "product-information";

    info.appendChild(makeText("h3", product.name));
    info.appendChild(makeText("p", rupiah(product.price)));

    info.appendChild(
      makeText(
        "p",
        product.available ? "Tersedia" : "Tidak tersedia"
      )
    );

    const actions = document.createElement("div");
    actions.className = "product-actions";

    // Tombol mengubah ketersediaan menu.
    const stockButton = makeText(
      "button",
      product.available ? "Nonaktifkan" : "Aktifkan",
      "stock-button"
    );

    stockButton.type = "button";
    stockButton.addEventListener("click", () => {
      toggleProduct(product.id);
    });

    // Tombol mengubah nama, harga, dan gambar.
    const editButton = makeText(
      "button",
      "Edit",
      "edit-button"
    );

    editButton.type = "button";
    editButton.addEventListener("click", () => {
      editProduct(product.id);
    });

    // Tombol menghapus menu.
    const deleteButton = makeText(
      "button",
      "Hapus",
      "delete-button"
    );

    deleteButton.type = "button";
    deleteButton.addEventListener("click", () => {
      deleteProduct(product.id);
    });

    actions.append(stockButton, editButton, deleteButton);
    info.appendChild(actions);

    card.append(image, info);
    productsList.appendChild(card);
  });
}

/* =====================================================
   8. MENAMBAHKAN MENU BARU
   ===================================================== */

document.getElementById("productForm").addEventListener(
  "submit",
  event => {
    event.preventDefault();

    const name = document.getElementById("productName")
      .value.trim();

    const price = Number(
      document.getElementById("productPrice").value
    );

    const image = document.getElementById("productImage")
      .value.trim();

    if (!name || !Number.isSafeInteger(price) || price <= 0) {
      productsMessage.textContent =
        "Masukkan nama dan harga menu yang valid.";
      return;
    }

    // Membuat ID unik sederhana untuk menu baru.
    const newId = Date.now();

    const newProduct = {
      id: newId,
      name,
      price,
      image,
      available: true
    };

    const previousProducts = products;
    products = [...products, newProduct];

    if (!writeStorage(PRODUCT_KEY, products)) {
      products = previousProducts;
      return;
    }

    // Mengosongkan formulir setelah berhasil.
    event.target.reset();

    productsMessage.textContent =
      "Menu berhasil ditambahkan.";

    renderProducts();
  }
);

/* =====================================================
   9. EDIT MENU
   ===================================================== */

function editProduct(productId) {
  const product = products.find(
    item => item.id === productId
  );

  if (!product) return;

  const newName = prompt("Nama menu:", product.name);

  // Tombol Cancel tidak mengubah data.
  if (newName === null) return;

  const cleanName = newName.trim();

  if (!cleanName) {
    alert("Nama menu tidak boleh kosong.");
    return;
  }

  const priceInput = prompt(
    "Harga menu:",
    String(product.price)
  );

  if (priceInput === null) return;

  const newPrice = Number(priceInput);

  if (!Number.isSafeInteger(newPrice) || newPrice <= 0) {
    alert("Harga harus berupa angka positif.");
    return;
  }

  const imageInput = prompt(
    "URL gambar (kosongkan jika tidak digunakan):",
    product.image || ""
  );

  if (imageInput === null) return;

  const newImage = imageInput.trim();

  // URL gambar harus menggunakan HTTPS.
  if (newImage && !/^https:\/\//i.test(newImage)) {
    alert("URL gambar harus menggunakan HTTPS.");
    return;
  }

  const previousProducts = products;

  products = products.map(item =>
    item.id === productId
      ? {
          ...item,
          name: cleanName,
          price: newPrice,
          image: newImage
        }
      : item
  );

  if (!writeStorage(PRODUCT_KEY, products)) {
    products = previousProducts;
    return;
  }

  productsMessage.textContent = "Menu berhasil diperbarui.";
  renderProducts();
}

/* =====================================================
   10. MENGUBAH KETERSEDIAAN MENU
   ===================================================== */

function toggleProduct(productId) {
  const previousProducts = products;

  products = products.map(product =>
    product.id === productId
      ? { ...product, available: !product.available }
      : product
  );

  if (!writeStorage(PRODUCT_KEY, products)) {
    products = previousProducts;
    return;
  }

  productsMessage.textContent =
    "Ketersediaan menu berhasil diubah.";

  renderProducts();
}

/* =====================================================
   11. MENGHAPUS MENU
   ===================================================== */

function deleteProduct(productId) {
  const product = products.find(
    item => item.id === productId
  );

  if (!product) return;

  const confirmed = confirm(
    `Hapus menu "${product.name}" dari daftar penjual?`
  );

  if (!confirmed) return;

  const previousProducts = products;

  products = products.filter(
    item => item.id !== productId
  );

  if (!writeStorage(PRODUCT_KEY, products)) {
    products = previousProducts;
    return;
  }

  productsMessage.textContent = "Menu berhasil dihapus.";
  renderProducts();
}

/* =====================================================
   12. MENYEGARKAN DATA DARI BROWSER YANG SAMA
   ===================================================== */

// Jika tab lain pada origin yang sama mengubah pesanan,
// dashboard ini akan membaca data terbaru.
window.addEventListener("storage", event => {
  if (event.key === ORDER_KEY) {
    orders = readStorage(ORDER_KEY, []);
    renderOrders();
  }

  if (event.key === PRODUCT_KEY) {
    products = readStorage(PRODUCT_KEY, defaultProducts);
    renderProducts();
  }
});

/* =====================================================
   13. MENJALANKAN DASHBOARD
   ===================================================== */

renderDashboard();
renderOrders();
renderProducts();

