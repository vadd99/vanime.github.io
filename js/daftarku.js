// ==========================================
// SCRIPT HALAMAN DAFTARKU (js/daftarku.js)
// ==========================================

import { db, auth } from './firebase-init.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

window.addEventListener('layoutReady', () => {
    console.log("Halaman Daftarku berhasil dimuat.");

    const container = document.getElementById('daftarku-results-container');
    const countText = document.getElementById('daftarku-count');

    // Fungsi kecil untuk mengambil genre pertama
    const getFirstGenre = (genreString) => {
        if (!genreString) return 'Animasi';
        return genreString.split(',')[0].trim();
    };

    // Pantau status login
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // JIKA USER LOGIN: Tarik data dari database
            if (countText) countText.innerText = "Mengambil data daftar simpanan...";
            
            try {
                // Akses koleksi sub 'bookmarks' milik user ini, diurutkan dari yang terbaru disimpan
                const q = query(collection(db, "users", user.uid, "bookmarks"), orderBy("savedAt", "desc"));
                const snapshot = await getDocs(q);

                container.innerHTML = ''; // Bersihkan loading state

                if (snapshot.empty) {
                    if (countText) countText.innerText = "Anda belum menyimpan judul apapun.";
                    container.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #9ca3af;">
                            <i class="far fa-folder-open" style="font-size: 3rem; margin-bottom: 15px; color: #4ade80; opacity: 0.5;"></i>
                            <h3 style="color: #fff; margin-bottom: 8px;">Daftarku Masih Kosong</h3>
                            <p>Jelajahi animasi kami dan klik tombol "+ Daftarku" untuk menyimpannya di sini.</p>
                            <a href="index.html" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: var(--vadd-primary); color: #05110a; font-weight: bold; border-radius: 8px; text-decoration: none;">Jelajahi Sekarang</a>
                        </div>
                    `;
                    return;
                }

                // Render kartu untuk setiap judul yang disimpan
                let totalSaved = 0;
                snapshot.forEach((doc) => {
                    totalSaved++;
                    const data = doc.data();
                    const imgUrl = data.bannerUrl || "https://images.unsplash.com/photo-1560930950-5ce206df77ab?auto=format&fit=crop&q=80&w=300";
                    const mainGenre = getFirstGenre(data.genre);

                    const cardHTML = `
                        <div class="poster-card" onclick="window.location.href='detail.html?id=${data.seriesId}'" style="cursor:pointer;">
                            <div class="poster-box">
                                <img src="${imgUrl}" alt="${data.title}">
                                <div class="poster-gradient"></div>
                                <div class="badge-tag tag-primary" style="top:0.5rem; right:0.5rem; left:auto; background:rgba(0,0,0,0.6);"><i class="fas fa-check" style="color:#4ade80;"></i> TERSIMPAN</div>
                                <div class="poster-content">
                                    <h3 class="poster-title">${data.title}</h3>
                                    <div class="poster-footer">
                                        <span class="badge-outline">${mainGenre}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.innerHTML += cardHTML;
                });

                if (countText) countText.innerText = `Menampilkan ${totalSaved} judul yang disimpan`;

            } catch (error) {
                console.error("Gagal memuat Daftarku:", error);
                if (countText) countText.innerText = "Terjadi kesalahan saat memuat data.";
                container.innerHTML = `<div style="grid-column: 1 / -1; color: #ef4444;">Gagal mengambil data dari server.</div>`;
            }

        } else {
            // JIKA USER BELUM LOGIN: Tampilkan tombol suruh login
            if (countText) countText.innerText = "Akses ditolak.";
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: var(--vadd-panel); border: 1px solid var(--vadd-border); border-radius: 12px; max-width: 500px; margin: 0 auto;">
                    <div style="width: 60px; height: 60px; background: rgba(74, 222, 128, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <i class="fas fa-lock" style="font-size: 1.5rem; color: #4ade80;"></i>
                    </div>
                    <h3 style="color: #ffffff; font-size: 1.25rem; font-weight: bold; margin-bottom: 8px;">Anda Belum Login</h3>
                    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 24px; line-height: 1.5;">Silakan masuk ke akun Anda terlebih dahulu untuk dapat melihat dan mengelola koleksi Daftarku.</p>
                    <a href="auth.html" style="display: inline-block; padding: 12px 30px; background: var(--vadd-primary); color: #05110a; font-weight: bold; border-radius: 8px; text-decoration: none; transition: opacity 0.2s;">
                        Masuk / Daftar Akun
                    </a>
                </div>
            `;
        }
    });
});
