// ==========================================
// SCRIPT KHUSUS HALAMAN INDEX (js/index.js)
// ==========================================

import { db } from './firebase-init.js'; 
import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.addEventListener('layoutReady', async () => {
    console.log("Vadd Studio: Halaman Utama (Index) sukses dimuat, mengambil data...");

    const heroImg = document.getElementById('hero-banner-img');
    const heroTitle = document.getElementById('hero-title-text');
    const heroDesc = document.getElementById('hero-desc-text');
    const heroBtn = document.getElementById('hero-play-btn');
    const seriesContainer = document.getElementById('series-grid-container');
    const popularContainer = document.getElementById('popular-series-container');

    try {
        // --- 1. MENGAMBIL SEMUA DATA SERIES DARI FIREBASE ---
        const q = query(collection(db, "series")); 
        const snapshot = await getDocs(q);
        
        let seriesData = [];
        snapshot.forEach(doc => {
            seriesData.push({ id: doc.id, ...doc.data() });
        });

        // Jika database kosong
        if(seriesData.length === 0) {
            if(heroTitle) heroTitle.innerHTML = "Belum Ada Judul";
            if(heroDesc) heroDesc.innerHTML = "Admin belum menambahkan seri animasi apapun ke dalam database.";
            if(seriesContainer) seriesContainer.innerHTML = "<div style='color:#9ca3af;'>Tidak ada judul yang tersedia.</div>";
            if(popularContainer) popularContainer.innerHTML = "<div style='color:#9ca3af;'>Tidak ada judul populer saat ini.</div>";
            return;
        }

        // --- 2. LOGIKA PENYORTIRAN UNTUK "PALING POPULER" ---
        let popularData = [...seriesData].sort((a, b) => {
            const viewsA = a.views || 0;
            const viewsB = b.views || 0;
            
            if (viewsB !== viewsA) {
                return viewsB - viewsA; 
            }
            
            const timeA = (a.createdAt && typeof a.createdAt.toMillis === 'function') ? a.createdAt.toMillis() : 0;
            const timeB = (b.createdAt && typeof b.createdAt.toMillis === 'function') ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });

        // --- 3. SET HERO BANNER (ATAS) ---
        const topSeries = popularData[0]; 
        
        if (heroImg) heroImg.src = topSeries.bannerUrl || topSeries.banner_url || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=2000";
        if (heroTitle) heroTitle.innerHTML = topSeries.title;
        if (heroDesc) heroDesc.innerHTML = topSeries.description || "Tonton keseruan animasi ini hanya di Vadd Studio.";
        if (heroBtn) heroBtn.href = `detail.html?id=${topSeries.id}`;


        // --- 4. RENDER SECTION "PALING POPULER" (CAROUSEL POTRAIT) ---
        if (popularContainer) {
            popularContainer.innerHTML = ''; 
            popularData.slice(0, 10).forEach((item, index) => { 
                const imgUrl = item.bannerUrl || item.banner_url || "https://images.unsplash.com/photo-1560930950-5ce206df77ab?auto=format&fit=crop&q=80&w=300";
                const views = item.views || 0;
                
                // Menempatkan badge di kanan atas agar tidak tertutup teks di desain portrait
                let badgeHtml = '';
                if (index === 0 && views > 0) {
                    badgeHtml = `<div class="badge-tag tag-accent" style="top:0.5rem; right:0.5rem; left:auto;">#1 POPULER</div>`;
                } else if (views === 0) {
                    badgeHtml = `<div class="badge-tag tag-primary" style="top:0.5rem; right:0.5rem; left:auto;">BARU</div>`;
                }

                // Menggunakan .poster-card agar bentuknya tegak (portrait)
                const cardHTML = `
                    <div class="poster-card" onclick="window.location.href='detail.html?id=${item.id}'" style="cursor:pointer; min-width: 160px; max-width: 200px; flex: 0 0 auto;">
                        <div class="poster-box">
                            <img src="${imgUrl}" alt="${item.title}">
                            <div class="poster-gradient"></div>
                            ${badgeHtml}
                            <div class="poster-content">
                                <h3 class="poster-title">${item.title}</h3>
                                <div class="poster-footer">
                                    <span class="badge-outline">${item.category || 'Animasi'}</span>
                                    ${views > 0 ? `<span style="color:var(--vadd-gold); font-size: 0.7rem;"><i class="fas fa-eye"></i> ${views}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                popularContainer.innerHTML += cardHTML;
            });
        }


        // --- 5. RENDER SECTION "TERBARU" (GRID POTRAIT) ---
        // Urutkan berdasarkan waktu upload terbaru
        if (seriesContainer) {
            let exploreData = [...seriesData].sort((a, b) => {
                const timeA = (a.createdAt && typeof a.createdAt.toMillis === 'function') ? a.createdAt.toMillis() : 0;
                const timeB = (b.createdAt && typeof b.createdAt.toMillis === 'function') ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
            });

            seriesContainer.innerHTML = '';
            exploreData.forEach(item => {
                const imgUrl = item.bannerUrl || item.banner_url || "https://images.unsplash.com/photo-1560930950-5ce206df77ab?auto=format&fit=crop&q=80&w=300";
                
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
        }

    } catch (error) {
        console.error("Gagal mengambil data dari Firebase:", error);
        if(heroTitle) heroTitle.innerHTML = "Terjadi Kesalahan";
        if(heroDesc) heroDesc.innerHTML = "Gagal memuat data dari database. Silakan periksa koneksi internet Anda.";
        if(seriesContainer) seriesContainer.innerHTML = "<div style='color:#ef4444;'>Gagal memuat daftar judul.</div>";
        if(popularContainer) popularContainer.innerHTML = "<div style='color:#ef4444;'>Gagal memuat daftar populer.</div>";
    }
});
