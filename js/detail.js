// ==========================================
// SCRIPT LOGIKA DETAIL FILM (js/detail.js)
// ==========================================

import { db } from './firebase-init.js';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.addEventListener('layoutReady', async () => {
    console.log("Halaman Detail berhasil dimuat beserta layout!");

    // 1. Ambil Parameter ID Series dari URL (Misal: detail.html?id=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const seriesId = urlParams.get('id');

    if (!seriesId) {
        alert("ID Series tidak ditemukan!");
        window.location.href = 'index.html'; // Kembalikan ke beranda
        return;
    }

    // --- FITUR VIEW COUNTER (Penghitung Jumlah Klik) ---
    try {
        const seriesRef = doc(db, "series", seriesId);
        await updateDoc(seriesRef, {
            total_views: increment(1) // Menambah +1 view setiap halaman dibuka
        });
        console.log("View berhasil ditambahkan!");
    } catch (error) {
        console.error("Gagal menambah view:", error);
    }

    // Elemen DOM
    const elPageTitle = document.getElementById('page-title');
    const elBanner = document.getElementById('detail-banner');
    const elTitle = document.getElementById('detail-title');
    const elCat = document.getElementById('detail-category');
    const elDesc = document.getElementById('synopsis-text');
    const elEpContainer = document.getElementById('episode-container');
    const btnWatchHero = document.getElementById('btn-watch-hero');
    const btnWatchMobile = document.getElementById('btn-watch-mobile');
    const ratingContainer = document.getElementById('rating-container'); // Tambahan DOM Rating

    try {
        // 2. MENGAMBIL DATA SERIES DARI FIREBASE
        const docRef = doc(db, "series", seriesId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            if(elTitle) elTitle.innerHTML = "Judul Tidak Ditemukan";
            if(elDesc) elDesc.innerHTML = "Maaf, data film atau seri ini tidak ada di database.";
            return;
        }

        const seriesData = docSnap.data();

        // 3. SET DATA SERIES KE HTML
        if(elPageTitle) elPageTitle.innerText = `${seriesData.title} - Vadd Studio`;
        if(elBanner) elBanner.src = seriesData.bannerUrl || seriesData.banner_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1600";
        if(elTitle) elTitle.innerHTML = `${seriesData.title} <span style="display:block; font-size:14px; margin-top:8px; color:var(--color-green); letter-spacing:2px; font-weight:700;">${seriesData.category ? seriesData.category.toUpperCase() : 'ANIMASI'}</span>`;
        if(elDesc) elDesc.innerText = seriesData.description || "Tidak ada sinopsis tersedia untuk judul ini.";

        // ========================================================
        // LOGIKA RATING OTOMATIS (Mencegah Bintang Kosong)
        // ========================================================
        let charSum = 0;
        for(let i = 0; i < seriesId.length; i++) {
            charSum += seriesId.charCodeAt(i);
        }
        
        // Menghasilkan angka antara 4.2 hingga 4.9 secara konsisten
        let ratingValue = (4.2 + (charSum % 8) / 10).toFixed(1); 
        
        // Jika di database sudah ada rating manual, utamakan data dari database
        if (seriesData.rating) {
            ratingValue = Number(seriesData.rating).toFixed(1);
        }

        // Generate Icon Bintang
        let starsHTML = '';
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = (ratingValue % 1) >= 0.4;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        for(let i=0; i<fullStars; i++) starsHTML += '<i class="fas fa-star" style="color:#facc15;"></i> ';
        if(hasHalfStar) starsHTML += '<i class="fas fa-star-half-alt" style="color:#facc15;"></i> ';
        for(let i=0; i<emptyStars; i++) starsHTML += '<i class="far fa-star" style="color:#facc15;"></i> ';

        // Suntikkan ke HTML
        if(ratingContainer) {
            ratingContainer.innerHTML = `
                ${starsHTML}
                <span class="rating-val" style="margin-left:8px; font-weight:bold; color:#fff;">${ratingValue}</span>
            `;
        }
        // ========================================================

        // 4. MENGAMBIL DATA EPISODE DARI FIREBASE
        const q = query(collection(db, "episodes"), where("seriesId", "==", seriesId));
        const epSnapshot = await getDocs(q);

        let epArray = [];
        epSnapshot.forEach(doc => epArray.push({ id: doc.id, ...doc.data() }));

        // Urutkan episode dari yang terkecil
        epArray.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));

        if(elEpContainer) elEpContainer.innerHTML = ''; // Bersihkan loading

        if (epArray.length === 0) {
            if(elEpContainer) elEpContainer.innerHTML = '<div style="color:#9ca3af; padding: 20px;">Belum ada episode yang dirilis.</div>';
        } else {
            // Jika episode ada, tampilkan tombol "Mulai Menonton E1"
            const firstEpId = epArray[0].id;
            const watchUrl = `player.html?ep=${firstEpId}`;
            
            if(btnWatchHero) {
                btnWatchHero.style.display = "inline-flex";
                btnWatchHero.href = watchUrl;
            }
            if(btnWatchMobile) {
                btnWatchMobile.style.display = "inline-flex";
                btnWatchMobile.href = watchUrl;
            }

            // Render Daftar Episode
            epArray.forEach(ep => {
                const thumb = ep.thumbnailUrl || "https://via.placeholder.com/350x200?text=No+Thumb";
                
                const epCardHTML = `
                    <a href="player.html?ep=${ep.id}" class="episode-card">
                        <div class="episode-thumb-box">
                            <img src="${thumb}" alt="E${ep.episodeNumber}">
                            <div class="episode-play-overlay">
                                <i class="fas fa-play-circle"></i>
                            </div>
                        </div>
                        <div class="episode-details">
                            <span class="episode-series-name">${seriesData.title}</span>
                            <h4 class="episode-title">E${ep.episodeNumber} - ${ep.episodeTitle || 'Tanpa Judul'}</h4>
                            <p class="episode-sub-info">Episode Animasi</p>
                        </div>
                        <button class="episode-more-btn" aria-label="Opsi" onclick="event.preventDefault();"><i class="fas fa-ellipsis-v"></i></button>
                    </a>
                `;
                if(elEpContainer) elEpContainer.innerHTML += epCardHTML;
            });
        }
    } catch (error) {
        console.error("Error Detail Firebase:", error);
        if(elEpContainer) elEpContainer.innerHTML = '<div style="color:#ef4444; padding: 20px;">Gagal memuat episode.</div>';
    }

    // --- LOGIKA UI (Dari detail.js asli) ---

    // Toggle Sinopsis
    const btnToggleSynopsis = document.getElementById('btn-toggle-synopsis');
    if (btnToggleSynopsis && elDesc) {
        btnToggleSynopsis.addEventListener('click', () => {
            elDesc.classList.toggle('expanded');
            if (elDesc.classList.contains('expanded')) {
                btnToggleSynopsis.innerHTML = 'PERSINGKAT <i class="fas fa-chevron-up icon-arrow"></i>';
            } else {
                btnToggleSynopsis.innerHTML = 'LEBIH BANYAK DETAIL <i class="fas fa-chevron-right icon-arrow"></i>';
            }
        });
    }

    // Fungsi Toast
    const toast = document.getElementById('vadd-toast');
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // Toggle Bookmark
    const bookmarkBtns = document.querySelectorAll('.toggle-bookmark');
    bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            if (icon) {
                if (icon.classList.contains('far')) {
                    icon.classList.replace('far', 'fas');
                    showToast('Berhasil ditambahkan ke Daftarku!');
                } else if (icon.classList.contains('fas') && !icon.classList.contains('fa-plus')) {
                    icon.classList.replace('fas', 'far');
                    showToast('Dihapus dari Daftarku');
                } else {
                    showToast('Berhasil ditambahkan ke Daftarku!');
                }
            }
        });
    });

    // Bagikan
    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
        btnShare.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({ title: elPageTitle ? elPageTitle.innerText : 'Tonton di Vadd Studio', url: window.location.href }).catch(() => {});
            } else {
                showToast('Tautan berhasil disalin!');
            }
        });
    }
});
