
/* ==================================================
   1. DATA MENU KANTINQ
   ================================================== */

// Setiap menu memiliki ID, nama, harga, gambar, dan deskripsi.
// URL gambar diambil dari Unsplash dan membutuhkan internet.
const menus = [
  {
    id: 1,
    name: "Bakso",
    price: 10000,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=80",
    description: "Bakso hangat dengan kuah gurih."
  },
  {
    id: 2,
    name: "Mie Ayam",
    price: 12000,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=80",
    description: "Mie dengan topping ayam yang lezat."
  },
  {
    id: 3,
    name: "Nasi Goreng",
    price: 15000,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80",
    description: "Nasi goreng dengan bumbu pilihan."
  },
  {
    id: 4,
    name: "Es Teh",
    price: 4000,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=700&q=80",
    description: "Teh dingin yang menyegarkan."
  },
  {
    id: 5,
    name: "Jus Jeruk",
    price: 7000,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=80",
    description: "Minuman jeruk segar."
  },
  {
    id: 6,
    name: "Roti Bakar",
    price: 8000,
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=700&q=80",
    description: "Roti dengan isian manis."
  }
];

/* ==================================================
   2. MENYIAPKAN KERANJANG
   ================================================== */

// Mengambil data keranjang sebelumnya dari browser.
// Jika belum ada data, keranjang dimulai dalam keadaan kosong.
let cart = [];

try {
  const savedCart = JSON.parse(
    localStorage.getItem("kantinQCart")
  );

  // Memastikan data yang tersimpan berbentuk array.
  if (Array.isArray(savedCart)) {
    cart = savedCart.filter(item =>
      menus.some(menu => menu.id === item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  }
} catch (error) {
  // Jika data tersimpan rusak, gunakan keranjang kosong.
  cart = [];
}

// Mengambil elemen HTML yang akan diisi JavaScript.
const menuList = document.getElementById("menuList");
const cartList = document.getElementById("cartList");
const totalElement = document.getElementById("total");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");

/* ==================================================
   3. FORMAT HARGA RUPIAH
   ================================================== */

// Mengubah angka menjadi format mata uang Indonesia.
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

/* ==================================================
   4. MENAMPILKAN KARTU MENU DAN GAMBAR
   ================================================== */

// Fungsi ini menampilkan semua menu atau hasil pencarian.
function renderMenus(keyword = "") {
  // Mengosongkan daftar sebelum membuat kartu baru.
  menuList.innerHTML = "";

  // Menyaring menu berdasarkan nama yang diketik.
  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(keyword.toLowerCase())
  );

  // Menampilkan pesan jika menu tidak ditemukan.
  if (filteredMenus.length === 0) {
    menuList.textContent = "Menu tidak ditemukan.";
    return;
  }

  // Membuat kartu untuk setiap menu.
  filteredMenus.forEach(menu => {
    const card = document.createElement("article");
    card.className = "menu-item";

    // Membuat elemen gambar makanan atau minuman.
    const image = document.createElement("img");
    image.className = "menu-image";
    image.src = menu.image;
    image.alt = "Gambar " + menu.name;
    image.loading = "lazy";

    // Jika gambar gagal dimuat, tampilkan pengganti.
    image.addEventListener("error", () => {
      const placeholder = document.createElement("div");
      placeholder.className = "menu-image image-fallback";
      placeholder.setAttribute("role", "img");
      placeholder.setAttribute("aria-label", menu.name);
      placeholder.textContent = "🍽️ " + menu.name;

      image.replaceWith(placeholder);
    }, { once: true });

    // Membuat area informasi menu.
    const info = document.createElement("div");
    info.className = "menu-info";

    const name = document.createElement("h3");
    name.textContent = menu.name;

    const description = document.createElement("p");
    description.textContent = menu.description;

    const price = document.createElement("strong");
    price.className = "menu-price";
    price.textContent = formatRupiah(menu.price);

    // Membuat tombol tambah ke keranjang.
    const button = document.createElement("button");
    button.className = "add-button";
    button.textContent = "+ Tambah ke Keranjang";

    // Saat diklik, menu masuk ke keranjang.
    button.addEventListener("click", () => {
      addToCart(menu.id);
    });

    // Menyusun elemen ke dalam kartu menu.
    info.append(name, description, price, button);
    card.append(image, info);
    menuList.appendChild(card);
  });
}

/* ==================================================
   5. MENAMBAHKAN MENU KE KERANJANG
   ================================================== */

function addToCart(menuId) {
  // Memeriksa apakah menu sudah ada di keranjang.
  const existingItem = cart.find(item => item.id === menuId);

  if (existingItem) {
    // Jika sudah ada, jumlahnya bertambah satu.
    existingItem.quantity++;
  } else {
    // Jika belum ada, tambahkan sebagai item baru.
    cart.push({
      id: menuId,
      quantity: 1
    });
  }

  // Simpan perubahan dan perbarui tampilan.
  saveCart();
  renderCart();

  const menu = menus.find(item => item.id === menuId);
  message.textContent = menu.name + " berhasil ditambahkan!";
}

/* ==================================================
   6. MENYIMPAN KERANJANG
   ================================================== */

// localStorage menyimpan data di browser perangkat pengguna.
// Data ini tidak otomatis dibagikan ke perangkat lain.
function saveCart() {
  try {
    localStorage.setItem(
      "kantinQCart",
      JSON.stringify(cart)
    );
  } catch (error) {
    message.textContent =
      "Keranjang tidak dapat disimpan di browser ini.";
  }
}

/* ==================================================
   7. MENAMPILKAN KERANJANG DAN TOTAL HARGA
   ================================================== */

function renderCart() {
  // Kosongkan tampilan lama sebelum diperbarui.
  cartList.innerHTML = "";

  // Nilai awal total pembayaran.
  let total = 0;

  // Jika belum ada pesanan, tampilkan informasi.
  if (cart.length === 0) {
    cartList.textContent = "Keranjang masih kosong.";
  }

  // Membuat baris untuk setiap item di keranjang.
  cart.forEach(item => {
    const menu = menus.find(menu => menu.id === item.id);

    // Lewati item yang tidak ditemukan dalam daftar menu.
    if (!menu) return;

    const subtotal = menu.price * item.quantity;
    total += subtotal;

    const row = document.createElement("div");
    row.className = "cart-item";

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const name = document.createElement("strong");
    name.textContent = menu.name;

    const details = document.createElement("p");
    details.textContent =
      item.quantity + " × " + formatRupiah(menu.price);

    const subtotalText = document.createElement("p");
    subtotalText.textContent =
      "Subtotal: " + formatRupiah(subtotal);

    // Tombol untuk menghapus menu dari keranjang.
    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.textContent = "Hapus";

    removeButton.addEventListener("click", () => {
      removeFromCart(item.id);
    });

    info.append(name, details, subtotalText);
    row.append(info, removeButton);
    cartList.appendChild(row);
  });

  // Perbarui total harga pada halaman.
  totalElement.textContent = formatRupiah(total);
}

/* ==================================================
   8. MENGHAPUS MENU DARI KERANJANG
   ================================================== */

function removeFromCart(menuId) {
  // Menghapus item dengan ID yang dipilih.
  cart = cart.filter(item => item.id !== menuId);

  // Simpan dan tampilkan perubahan.
  saveCart();
  renderCart();

  message.textContent = "Menu berhasil dihapus.";
}

/* ==================================================
   9. FITUR PENCARIAN
   ================================================== */

// Setiap kali pengguna mengetik, daftar menu diperbarui.
searchInput.addEventListener("input", event => {
  renderMenus(event.target.value);
});

/* ==================================================
   10. SIMULASI PEMESANAN
   ================================================== */

document.getElementById("checkoutBtn").addEventListener(
  "click",
  () => {
    // Pesanan tidak boleh kosong.
    if (cart.length === 0) {
      message.textContent =
        "Tambahkan makanan atau minuman terlebih dahulu.";
      return;
    }

    // Meminta konfirmasi sebelum menyelesaikan pesanan.
    const confirmed = confirm(
      "Apakah kamu yakin ingin menyelesaikan pesanan?"
    );

    if (!confirmed) return;

    // Hitung total akhir berdasarkan isi keranjang.
    const total = cart.reduce((sum, item) => {
      const menu = menus.find(menu => menu.id === item.id);

      return sum +
        (menu ? menu.price * item.quantity : 0);
    }, 0);

    // Menampilkan ringkasan pesanan sederhana.
    alert(
      "Pesanan berhasil dibuat!\n" +
      "Total pembayaran: " + formatRupiah(total) +
      "\n\nIni adalah simulasi, bukan pembayaran sungguhan."
    );

    // Kosongkan keranjang setelah simulasi selesai.
    cart = [];
    saveCart();
    renderCart();

    message.textContent =
      "Terima kasih telah memesan di KantinQ!";
  }
);

/* ==================================================
   11. MENJALANKAN WEBSITE SAAT DIBUKA
   ================================================== */

// Tampilkan daftar menu dan isi keranjang tersimpan.
renderMenus();
renderCart();

