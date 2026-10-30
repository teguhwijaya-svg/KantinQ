# 🍽️ KantinQ – Smart Canteen & Pre-Order

## A. Judul dan Deskripsi

**KantinQ – Smart Canteen & Pre-Order** merupakan sebuah platform website kantin digital yang dirancang untuk mempermudah proses pemesanan makanan dan minuman di lingkungan sekolah.

### Latar Belakang Masalah

Proses pemesanan makanan di kantin sekolah sering mengalami beberapa kendala, seperti:
- Antrean panjang saat jam istirahat.
- Keterbatasan informasi mengenai menu dan harga makanan.
- Kesulitan mengetahui ketersediaan makanan.
- Proses pencatatan pesanan yang masih dilakukan secara manual.
- Kesulitan bagi penjual dalam mengelola pesanan dan laporan penjualan.

### Solusi yang Ditawarkan

KantinQ hadir sebagai solusi digital dengan menyediakan sistem pemesanan makanan berbasis website yang praktis dan mudah digunakan.

### Target Pengguna

1. **Siswa:** Melihat menu, memilih makanan, melakukan pemesanan, dan memantau status pesanan.
2. **Penjual kantin:** Mengelola menu, menerima pesanan, memperbarui status pesanan, serta melihat laporan penjualan.
3. **Pengelola kantin:** Mempermudah pemantauan aktivitas pemesanan dan penjualan.

---

## B. Teknologi yang Digunakan

Proyek KantinQ dikembangkan menggunakan teknologi berikut:

| Teknologi | Kegunaan |
|---|---|
| HTML5 | Membuat struktur halaman website. |
| CSS3 | Mengatur desain, warna, animasi, dan responsivitas. |
| JavaScript | Mengatur interaksi dan fungsi website. |
| LocalStorage | Menyimpan data menu, pesanan, dan pengaturan pada browser. |
| Web Speech API | Membantu pemanggilan pelanggan ketika pesanan siap. |
| GitHub | Menyimpan kode sumber proyek. |
| GitHub Pages | Mempublikasikan website agar dapat diakses secara online. |

### Platform Publikasi

Website dipublikasikan menggunakan **GitHub Pages**.

### Struktur File

```text
KantinQ/
│
├── index.html       # Halaman pelanggan
├── style.css        # Desain halaman pelanggan
├── script.js        # Fungsi halaman pelanggan
│
├── penjual.html     # Halaman panel penjual
├── penjual.css      # Desain panel penjual
├── penjual.js       # Fungsi panel penjual
│
└── README.md        # Dokumentasi proyek
```

---

## C. Pemanfaatan AI (AI Usage Disclosure)

Dalam proses pengembangan KantinQ, Artificial Intelligence (AI) dimanfaatkan sebagai alat bantu untuk memperoleh ide, menyusun struktur kode, memperbaiki kesalahan pemrograman, dan mengembangkan fitur website.

### 1. Alat AI yang Digunakan

- **ChatGPT (OpenAI):** Membantu memberikan ide, menyusun kode HTML, CSS, dan JavaScript, menjelaskan fungsi kode, serta memperbaiki kesalahan program.

### 2. Contoh Prompt Utama

Berikut beberapa contoh perintah yang digunakan selama pengembangan KantinQ:

**Prompt 1 – Pembuatan Website**

"Buatkan website kantin digital bernama KantinQ menggunakan HTML, CSS, dan JavaScript. Website harus memiliki tampilan modern, responsif, dan dapat digunakan melalui HP maupun komputer. Jangan menggunakan database, cukup menggunakan LocalStorage."

**Prompt 2 – Pengembangan Fitur**

"Tambahkan fitur keranjang belanja, pencarian menu, kategori makanan, sistem pre-order, bukti pemesanan digital, dan status pesanan pada website KantinQ."

**Prompt 3 – Panel Penjual**

"Buatkan halaman khusus penjual yang dapat digunakan untuk mengelola menu, menerima pesanan, mengubah status pesanan, memanggil pelanggan ketika pesanan siap, dan melihat laporan penjualan."

**Prompt 4 – Perbaikan Kode**

"Periksa dan perbaiki kode HTML, CSS, dan JavaScript agar seluruh fitur website KantinQ dapat berjalan dengan baik di GitHub Pages."

### 3. Penyesuaian dan Perbaikan Mandiri

AI digunakan sebagai pendamping dalam proses pengembangan, sedangkan penyesuaian dan pengujian dilakukan oleh pengembang.

Beberapa penyesuaian yang dilakukan antara lain:

1. Memisahkan kode menjadi beberapa file agar lebih mudah dikelola.
2. Menyesuaikan desain agar responsif pada perangkat Android, iOS, laptop, dan komputer.
3. Menggunakan LocalStorage agar data tetap tersimpan pada browser tanpa database.
4. Memperbaiki sistem perpindahan pesanan yang telah selesai ke bagian riwayat pesanan.
5. Menambahkan fitur pemanggilan pelanggan menggunakan Web Speech API.
6. Memperbaiki tampilan panel penjual agar lebih mudah digunakan.
7. Menyesuaikan gambar, nama, harga, dan kategori produk makanan.
8. Melakukan pengujian dan perbaikan apabila terdapat fitur yang belum berjalan sesuai harapan.

---

## D. Panduan Penggunaan

### 1. Mengakses Website

Website KantinQ dapat diakses melalui tautan GitHub Pages berikut:

**Link Website:**  
https://USERNAME.github.io/NAMA-REPOSITORY/

Ganti `USERNAME` dan `NAMA-REPOSITORY` sesuai akun serta nama repositori GitHub yang digunakan.

### 2. Panduan untuk Pelanggan

1. Buka website KantinQ.
2. Pilih menu makanan atau minuman yang tersedia.
3. Gunakan fitur pencarian atau kategori untuk menemukan menu.
4. Tentukan jumlah pesanan dan pilihan tambahan jika tersedia.
5. Masukkan menu ke keranjang.
6. Periksa pesanan dan total pembayaran.
7. Lakukan pemesanan melalui fitur yang tersedia.
8. Pantau status pesanan hingga siap diambil.
9. Ambil pesanan sesuai informasi yang ditampilkan.

### 3. Panduan untuk Penjual

1. Buka halaman panel penjual melalui `penjual.html`.
2. Lihat daftar pesanan pelanggan.
3. Terima dan proses pesanan.
4. Ubah status pesanan sesuai proses pengerjaan.
5. Ketika pesanan siap, gunakan fitur pemanggilan pelanggan.
6. Tandai pesanan sebagai selesai setelah diambil.
7. Kelola menu, harga, stok, dan informasi makanan.
8. Periksa laporan penjualan melalui halaman laporan.

### 4. Cara Menjalankan Secara Lokal

1. Unduh atau clone repositori KantinQ dari GitHub.
2. Ekstrak file apabila diunduh dalam bentuk ZIP.
3. Buka folder proyek.
4. Jalankan file `index.html` menggunakan browser.
5. Untuk membuka panel penjual, jalankan `penjual.html`.

**Catatan:** KantinQ menggunakan LocalStorage sehingga data tersimpan pada browser dan perangkat yang digunakan. Data tidak otomatis tersinkronisasi antarperangkat atau antarbrowser.

---

## E. Identitas Pengembang

Proyek KantinQ dikembangkan oleh tim peserta didik dari SMAN 1 Pagak.

| Keterangan | Identitas |
|---|---|
| Nama Produk | KantinQ – Smart Canteen & Pre-Order |
| Pengembang 1 | Ezhayo Rachmad R. |
| Kelas | XI-6 |
| Pengembang 2 | Wahyu Teguh Wijaya |
| Kelas | XI-2 |
| Jurusan/Program | KKA-PODISTIK |
| Asal Sekolah | SMAN 1 Pagak |

---

**KantinQ – Smart Canteen & Pre-Order**

*Solusi digital untuk pemesanan makanan kantin sekolah yang lebih praktis, modern, dan efisien.*
