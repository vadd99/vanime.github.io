// ==========================================
// SCRIPT LOGIKA RILIS TERBARU (js/lates.js)
// ==========================================

import { db } from './firebase-init.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.addEventListener('layoutReady', async () => {
    // Memastikan ID sesuai dengan yang ada di lates.html
    const container = document.getElementById('latest-container');

    if (!container) return; // Mencegah error jika elemen tidak ada

    // Fungsi kecil untuk mengambil genre pertama (Sama seperti index.js)
    const getFirstGenre = (genreString) => {
        if (!genreString) return 'Animasi';
        return genreString.split(',')[0].trim();
    };

    try {
        const querySnapshot = await getDocs(collection(db, "series"));
        let seriesArray = [];
        
        querySnapshot.forEach((doc) => {
            seriesArray.push({ id: doc.id, ...doc.data() });
        });

        // SORTING AKURAT: Berdasarkan waktu upload terbaru (Sama seperti index.js)
        seriesArray.sort((a, b) => {
            const timeA = (a.createdAt && typeof a.createdAt.toMillis === 'function') ? a.createdAt.toMillis() : 0;
            const timeB = (b.createdAt && typeof b.createdAt.toMillis === 'function') ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });

        container.innerHTML = '';

        if (seriesArray.length === 0) {
            container.innerHTML = `<div class="empty-state">Belum ada data rilis terbaru.</div>`;
            return;
        }

        // Render card
        seriesArray.forEach(item => {
            const imgUrl = item.bannerUrl || item.banner_url || "https://images.unsplash.com/photo-1560930950-5ce206df77ab?auto=format&fit=crop&q=80&w=300";
            const mainGenre = getFirstGenre(item.genres || item.category);

            // Struktur HTML disamakan 100% dengan poster-card di index.js
            const cardHTML = `
                <div class="poster-card" onclick="window.location.href='detail.html?id=${item.id}'" style="cursor:pointer;">
                    <div class="poster-box">
                        <img src="${imgUrl}" alt="${item.title}">
                        <div class="poster-gradient"></div>
                        <div class="poster-content">
                            <h3 class="poster-title">${item.title}</h3>
                            <div class="poster-footer">
                                <span class="badge-outline">${mainGenre}</span>
                                <span style="color:var(--vadd-primary); font-size: 0.65rem; font-weight: 800; letter-spacing: 0.05em;">BARU</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Gagal memuat data terbaru:", error);
        container.innerHTML = `<div class="empty-state" style="color: #ef4444;">Gagal memuat data dari server.</div>`;
    }
});
