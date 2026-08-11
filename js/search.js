// ==========================================
// SCRIPT LOGIKA PENCARIAN (js/search.js)
// ==========================================

import { db } from './firebase-init.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Tunggu hingga elemen layout (navbar, dll) selesai dimuat oleh main.js
window.addEventListener('layoutReady', async () => {
    console.log("Halaman Pencarian Dimuat!");

    // 1. Ambil Parameter "q" (Query) dari URL (contoh: search.html?q=rakudai)
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    
    // Elemen DOM
    const queryTextEl = document.getElementById('search-query-text');
    const searchCountEl = document.getElementById('search-count');
    const resultsContainer = document.getElementById('search-results-container');

    // Jika user mengakses halaman ini tanpa kata kunci sama sekali
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

    // Set teks header
    queryTextEl.innerText = `"${queryParam}"`;

    try {
        // 2. Ambil seluruh data Seri/Film dari Firebase
        // Karena Firestore tidak punya Full-Text search, kita filter secara manual di client (sangat cepat untuk ribuan data)
        const querySnapshot = await getDocs(collection(db, "series"));
        const allSeries = [];
        
        querySnapshot.forEach((doc) => {
            allSeries.push({ id: doc.id, ...doc.data() });
        });

        // 3. Logika Filter (Cocokkan kata kunci dengan Judul atau Deskripsi)
        const keyword = queryParam.toLowerCase().trim();
        const filteredResults = allSeries.filter(series => {
            const title = (series.title || "").toLowerCase();
            const desc = (series.description || "").toLowerCase();
            
            // Akan me-return TRUE jika judul atau deskripsi mengandung kata kunci yang diketik
            return title.includes(keyword) || desc.includes(keyword);
        });

        // 4. Render Hasil ke HTML
        resultsContainer.innerHTML = ''; // Bersihkan loading spinner

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
            
            // Looping data yang cocok untuk dibuatkan Card
            filteredResults.forEach(item => {
                const banner = item.bannerUrl || 'https://via.placeholder.com/300x400?text=No+Image';
                
                const cardHTML = `
                    <a href="detail.html?id=${item.id}" class="search-card">
                        <img src="${banner}" alt="${item.title}" class="search-thumb">
                        <div>
                            <h3 class="search-title">${item.title}</h3>
                            <div class="search-meta">
                                <span class="search-category">${item.category || 'Animasi'}</span>
                                <span><i class="fas fa-star" style="color:#facc15;"></i> ${item.rating || '4.5'}</span>
                            </div>
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
                Maaf, gagal menyambung ke server database. Silakan periksa koneksi internet Anda.
            </div>
        `;
    }
});
