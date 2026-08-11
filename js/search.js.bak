// ==========================================
// SCRIPT LOGIKA PENCARIAN (js/search.js)
// ==========================================

import { db } from './firebase-init.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.addEventListener('layoutReady', async () => {
    console.log("Halaman Pencarian Dimuat!");

    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    
    const queryTextEl = document.getElementById('search-query-text');
    const searchCountEl = document.getElementById('search-count');
    const resultsContainer = document.getElementById('search-results-container');

    if (!queryParam || queryParam.trim() === '') {
        queryTextEl.innerText = "Tidak ada kata kunci";
        searchCountEl.innerText = "Masukkan kata kunci pada kolom pencarian di menu atas.";
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                Apa yang ingin Anda tonton hari ini?
            </div>
        `;
        return;
    }

    queryTextEl.innerText = `"${queryParam}"`;

    try {
        const querySnapshot = await getDocs(collection(db, "series"));
        const allSeries = [];
        
        querySnapshot.forEach((doc) => {
            allSeries.push({ id: doc.id, ...doc.data() });
        });

        const keyword = queryParam.toLowerCase().trim();
        const filteredResults = allSeries.filter(series => {
            const title = (series.title || "").toLowerCase();
            const desc = (series.description || "").toLowerCase();
            return title.includes(keyword) || desc.includes(keyword);
        });

        resultsContainer.innerHTML = ''; 

        if (filteredResults.length === 0) {
            searchCountEl.innerText = "0 hasil ditemukan.";
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    Yahh, sepertinya film <strong>${queryParam}</strong> belum tersedia di Vadd Studio.
                </div>
            `;
        } else {
            searchCountEl.innerText = `Ditemukan ${filteredResults.length} hasil yang cocok.`;
            

        filteredResults.forEach(item => {
            // Mengambil poster vertikal
            const poster = item.posterUrl || item.poster_url || item.bannerUrl || 'https://via.placeholder.com/300x400?text=No+Image';
            const genreText = item.category || item.genres || 'Animasi';

            const cardHTML = `
                <a href="detail.html?id=${item.id}" class="poster-card">
                    <div class="poster-box">
                        <img src="${poster}" alt="${item.title}">
                        <div class="poster-gradient"></div>
                        <div class="poster-content">
                            <div class="poster-title">${item.title}</div>
                            <div class="poster-footer">
                                <span class="poster-rating"><i class="fas fa-star"></i> ${item.rating || '4.5'}</span>
                            </div>
                        </div>
                    </div>
                    <!-- Badge Genre di bawah poster seperti di Screenshot -->
                    <div style="margin-top: 8px;">
                        <span style="background: rgba(96, 211, 129, 0.1); color: var(--vadd-primary); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-transform: lowercase;">
                            ${genreText}
                        </span>
                    </div>
                </a>
            `;
            resultsContainer.innerHTML += cardHTML;
        });
        
        }

    } catch (error) {
        console.error("Gagal mengambil data pencarian:", error);
        searchCountEl.innerText = "Terjadi kesalahan.";
        resultsContainer.innerHTML = `
            <div class="empty-state" style="color: #ef4444;">
                <i class="fas fa-exclamation-triangle"></i>
                Maaf, gagal menyambung ke server database.
            </div>
        `;
    }
});
