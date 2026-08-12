import { db } from './firebase-init.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.addEventListener('layoutReady', async () => {
    const container = document.getElementById('popular-container');

    try {
        const querySnapshot = await getDocs(collection(db, "series"));
        let seriesArray = [];
        
        querySnapshot.forEach((doc) => {
            seriesArray.push({ id: doc.id, ...doc.data() });
        });

        // Urutkan berdasarkan total_views dari yang terbesar ke terkecil
        seriesArray.sort((a, b) => (b.total_views || 0) - (a.total_views || 0));

        container.innerHTML = '';

        if (seriesArray.length === 0) {
            container.innerHTML = `<div class="empty-state">Belum ada data seri.</div>`;
            return;
        }

        seriesArray.forEach(item => {
            const poster = item.posterUrl || item.poster_url || item.bannerUrl || 'https://via.placeholder.com/300x400?text=No+Image';

            const cardHTML = `
                <a href="detail.html?id=${item.id}" class="poster-card">
                    <div class="poster-box">
                        <img src="${poster}" alt="${item.title}">
                        <div class="poster-gradient"></div>
                        <div class="poster-content">
                            <div class="poster-title">${item.title}</div>
                            <div class="poster-footer">
                                <span class="poster-rating"><i class="fas fa-star"></i> ${item.rating || '4.5'}</span>
                                <span style="font-size: 0.65rem; color: #9ca3af;"><i class="fas fa-eye"></i> ${item.total_views || 0}</span>
                            </div>
                        </div>
                    </div>
                </a>
            `;
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Gagal memuat data populer:", error);
        container.innerHTML = `<div class="empty-state" style="color: #ef4444;">Gagal memuat data dari server.</div>`;
    }
});
