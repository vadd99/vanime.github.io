// ==========================================
// SCRIPT KHUSUS HALAMAN INDEX (js/index.js)
// ==========================================

// 1. Import Firebase dari firebase-init.js (Jalurnya harus sesuai letak folder js)
import { db } from './firebase-init.js'; 
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Menunggu layout dari main.js siap
window.addEventListener('layoutReady', async () => {
    console.log("Vadd Studio: Halaman Utama (Index) sukses dimuat, mulai mengambil data Firebase...");

    const heroImg = document.getElementById('hero-banner-img');
    const heroTitle = document.getElementById('hero-title-text');
    const heroDesc = document.getElementById('hero-desc-text');
    const heroBtn = document.getElementById('hero-play-btn');
    const seriesContainer = document.getElementById('series-grid-container');

    try {
        // --- 1. MENGAMBIL DATA SERIES DARI FIREBASE ---
        // Kita urutkan berdasarkan yang paling baru dibuat (jika ada field createdAt)
        // Jika tidak ada createdAt, kita tarik semua saja dulu.
        const q = query(collection(db, "series")); 
        const snapshot = await getDocs(q);
        
        let seriesData = [];
        snapshot.forEach(doc => {
            seriesData.push({ id: doc.id, ...doc.data() });
        });

        // Jika database kosong
        if(seriesData.length === 0) {
            heroTitle.innerHTML = "Belum Ada Judul";
            heroDesc.innerHTML = "Admin belum menambahkan seri animasi apapun ke dalam database.";
            seriesContainer.innerHTML = "<div style='color:#9ca3af;'>Tidak ada judul yang tersedia.</div>";
            return;
        }

        // --- 2. SET BAGIAN HERO BANNER (ATAS) DENGAN SERIES TERBARU/PERTAMA ---
        // Ambil data pertama di array (bisa diubah logikanya jika mau ngacak/random)
        const topSeries = seriesData[0]; 
        
        heroImg.src = topSeries.bannerUrl || topSeries.banner_url || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2000";
        heroTitle.innerHTML = topSeries.title;
        heroDesc.innerHTML = topSeries.description || "Tonton keseruan animasi ini hanya di Vadd Studio.";
        
        // Arahkan tombol ke halaman detail dengan membawa parameter ID
        heroBtn.href = `detail.html?id=${topSeries.id}`;


        // --- 3. SET DAFTAR SERIES DI BAGIAN BAWAH (POSTER GRID) ---
        seriesContainer.innerHTML = ''; // Bersihkan tulisan loading

        seriesData.forEach(item => {
            // Gunakan banner atau gambar fallback jika kosong
            const imgUrl = item.bannerUrl || item.banner_url || "https://images.unsplash.com/photo-1560930950-5ce206df77ab?auto=format&fit=crop&q=80&w=300";
            
            // Format HTML untuk kartu poster
            const cardHTML = `
                <div class="poster-card" onclick="window.location.href='detail.html?id=${item.id}'" style="cursor:pointer;">
                    <div class="poster-box">
                        <img src="${imgUrl}" alt="${item.title}">
                        <div class="poster-gradient"></div>
                        <div class="poster-content">
                            <h3 class="poster-title">${item.title}</h3>
                            <div class="poster-footer">
                                <span class="badge-outline">${item.category || 'Animasi'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            seriesContainer.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Gagal mengambil data dari Firebase:", error);
        heroTitle.innerHTML = "Terjadi Kesalahan";
        heroDesc.innerHTML = "Gagal memuat data dari database. Silakan periksa koneksi internet Anda.";
        seriesContainer.innerHTML = "<div style='color:#ef4444;'>Gagal memuat daftar judul.</div>";
    }
});
