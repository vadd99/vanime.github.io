// ==========================================
// SCRIPT LOGIKA DETAIL FILM (js/detail.js)
// ==========================================

import { db, auth } from './firebase-init.js';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

window.addEventListener('layoutReady', async () => {
    console.log("Halaman Detail berhasil dimuat beserta layout!");

    const urlParams = new URLSearchParams(window.location.search);
    const seriesId = urlParams.get('id');
    
    // Variabel penampung data seri
    let currentSeriesData = {};

    if (!seriesId) {
        alert("ID Series tidak ditemukan!");
        window.location.href = 'index.html'; 
        return;
    }

    try {
        const seriesRef = doc(db, "series", seriesId);
        await updateDoc(seriesRef, {
            total_views: increment(1) 
        });
    } catch (error) {
        console.error("Gagal menambah view:", error);
    }

    const elPageTitle = document.getElementById('page-title');
    const elBanner = document.getElementById('detail-banner');
    const elTitle = document.getElementById('detail-title');
    const elDesc = document.getElementById('synopsis-text');
    const elEpContainer = document.getElementById('episode-container');
    const btnWatchHero = document.getElementById('btn-watch-hero');
    const btnWatchMobile = document.getElementById('btn-watch-mobile');
    const ratingContainer = document.getElementById('rating-container'); 
    
    // Elemen Extra Metadata
    const elHeroAge = document.getElementById('hero-age-badge');
    const elAudio = document.getElementById('detail-audio');
    const elSubtitle = document.getElementById('detail-subtitle');
    const elWarnings = document.getElementById('detail-warnings');
    const elGenre = document.getElementById('detail-genre');

    try {
        const docRef = doc(db, "series", seriesId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            if(elTitle) elTitle.innerHTML = "Judul Tidak Ditemukan";
            if(elDesc) elDesc.innerHTML = "Maaf, data film atau seri ini tidak ada di database.";
            return;
        }

        const sd = docSnap.data(); 
        currentSeriesData = sd; 

        if(elPageTitle) elPageTitle.innerText = `${sd.title} - Vadd Studio`;
        if(elBanner) elBanner.src = sd.bannerUrl || sd.banner_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1600";
        
        const mainGenreText = sd.genres ? sd.genres.split(',')[0].trim().toUpperCase() : (sd.category ? sd.category.toUpperCase() : 'ANIMASI');
        
        if(elTitle) elTitle.innerHTML = `${sd.title} <span style="display:block; font-size:14px; margin-top:8px; color:var(--color-green); letter-spacing:2px; font-weight:700;">${mainGenreText}</span>`;
        if(elDesc) elDesc.innerText = sd.description || "Tidak ada sinopsis tersedia untuk judul ini.";

        // --- SET METADATA EXTRA ---
        if (elHeroAge) elHeroAge.innerText = sd.ageRating || '13+';

        if (sd.audioLanguages && elAudio) {
            elAudio.querySelector('span').innerText = sd.audioLanguages;
            elAudio.style.display = 'block';
        }
        if (sd.subtitleLanguages && elSubtitle) {
            elSubtitle.querySelector('span').innerText = sd.subtitleLanguages;
            elSubtitle.style.display = 'block';
        }
        if (sd.contentWarnings && elWarnings) {
            elWarnings.querySelector('span').innerHTML = `<span style="background-color:rgba(255,255,255,0.1); padding:1px 4px; border-radius:3px; color:#fff; font-size:10px; font-weight:bold; margin-right:4px;">${sd.ageRating || '13+'}</span> ${sd.contentWarnings}`;
            elWarnings.style.display = 'block';
        }
        if (sd.genres && elGenre) {
            elGenre.querySelector('span').innerText = sd.genres;
            elGenre.style.display = 'block';
        }

        // --- LOGIKA RATING OTOMATIS ---
        let charSum = 0;
        for(let i = 0; i < seriesId.length; i++) charSum += seriesId.charCodeAt(i);
        let ratingValue = (4.2 + (charSum % 8) / 10).toFixed(1); 
        if (sd.rating) ratingValue = Number(sd.rating).toFixed(1);

        let starsHTML = '';
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = (ratingValue % 1) >= 0.4;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        for(let i=0; i<fullStars; i++) starsHTML += '<i class="fas fa-star" style="color:#facc15;"></i> ';
        if(hasHalfStar) starsHTML += '<i class="fas fa-star-half-alt" style="color:#facc15;"></i> ';
        for(let i=0; i<emptyStars; i++) starsHTML += '<i class="far fa-star" style="color:#facc15;"></i> ';

        if(ratingContainer) {
            ratingContainer.innerHTML = `${starsHTML} <span class="rating-val" style="margin-left:8px; font-weight:bold; color:#fff;">${ratingValue}</span>`;
        }

        // --- MENGAMBIL DATA EPISODE ---
        const q = query(collection(db, "episodes"), where("seriesId", "==", seriesId));
        const epSnapshot = await getDocs(q);

        let epArray = [];
        epSnapshot.forEach(doc => epArray.push({ id: doc.id, ...doc.data() }));
        epArray.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));

        if(elEpContainer) elEpContainer.innerHTML = ''; 

        if (epArray.length === 0) {
            if(elEpContainer) elEpContainer.innerHTML = '<div style="color:#9ca3af; padding: 20px;">Belum ada episode yang dirilis.</div>';
        } else {
            const firstEpId = epArray[0].id;
            const watchUrl = `player.html?ep=${firstEpId}`;
            
            if(btnWatchHero) { btnWatchHero.style.display = "inline-flex"; btnWatchHero.href = watchUrl; }
            if(btnWatchMobile) { btnWatchMobile.style.display = "inline-flex"; btnWatchMobile.href = watchUrl; }

            epArray.forEach(ep => {
                const thumb = ep.thumbnailUrl || "https://via.placeholder.com/350x200?text=No+Thumb";
                const epCardHTML = `
                    <a href="player.html?ep=${ep.id}" class="episode-card">
                        <div class="episode-thumb-box">
                            <img src="${thumb}" alt="E${ep.episodeNumber}">
                            <div class="episode-play-overlay"><i class="fas fa-play-circle"></i></div>
                        </div>
                        <div class="episode-details">
                            <span class="episode-series-name">${sd.title}</span>
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
        if(elEpContainer) elEpContainer.innerHTML = '<div style="color:#ef4444; padding: 20px;">Gagal memuat data.</div>';
    }

    // --- LOGIKA UI BUKA/TUTUP SINOPSIS ---
    const btnToggleSynopsis = document.getElementById('btn-toggle-synopsis');
    const synopsisWrapper = document.getElementById('synopsis-wrapper');
    if (btnToggleSynopsis && synopsisWrapper) {
        btnToggleSynopsis.addEventListener('click', () => {
            synopsisWrapper.classList.toggle('expanded');
            if (synopsisWrapper.classList.contains('expanded')) {
                btnToggleSynopsis.innerHTML = 'LEBIH SEDIKIT DETAIL <i class="fas fa-chevron-up icon-arrow"></i>';
            } else {
                btnToggleSynopsis.innerHTML = 'LEBIH BANYAK DETAIL <i class="fas fa-chevron-down icon-arrow"></i>';
            }
        });
    }

    const toast = document.getElementById('vadd-toast');
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ==========================================
    // UI MODAL KUSTOM: PERINGATAN LOGIN
    // ==========================================
    function showLoginPromptModal() {
        // Cek jika modal sudah pernah dibuka agar tidak ganda
        if (document.getElementById('vadd-login-modal')) return;

        // Bikin overlay background gelap
        const overlay = document.createElement('div');
        overlay.id = 'vadd-login-modal';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.backdropFilter = 'blur(5px)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';

        // Bikin kotak putih (panel) modalnya
        const box = document.createElement('div');
        box.style.backgroundColor = '#0a1f14'; // Warna bg panel (var(--vs-panel))
        box.style.border = '1px solid #1a3a26';
        box.style.borderRadius = '16px';
        box.style.padding = '24px';
        box.style.maxWidth = '320px';
        box.style.width = '90%';
        box.style.textAlign = 'center';
        box.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
        box.style.transform = 'translateY(20px) scale(0.95)';
        box.style.transition = 'all 0.3s ease';

        // Isi konten modal (HTML)
        box.innerHTML = `
            <div style="width: 50px; height: 50px; background: rgba(74, 222, 128, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <i class="fas fa-lock" style="font-size: 1.25rem; color: #4ade80;"></i>
            </div>
            <h3 style="color: #ffffff; font-size: 1.25rem; font-weight: bold; margin-bottom: 8px;">Anda Belum Login</h3>
            <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;">Silakan login terlebih dahulu untuk menyimpan judul ini ke Daftarku.</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="btn-cancel-login" style="flex: 1; padding: 10px 0; border-radius: 8px; border: 1px solid #1a3a26; background: transparent; color: #d1d5db; cursor: pointer; font-weight: 600; transition: background 0.2s;">Batal</button>
                <button id="btn-go-login" style="flex: 1; padding: 10px 0; border-radius: 8px; border: none; background: #4ade80; color: #05110a; cursor: pointer; font-weight: 700; transition: opacity 0.2s;">Login</button>
            </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // Kasih efek transisi animasi saat masuk
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            box.style.transform = 'translateY(0) scale(1)';
        });

        // Event listener saat tombol dibatalkan/ditutup
        const closeModal = () => {
            overlay.style.opacity = '0';
            box.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => overlay.remove(), 300); // Hapus elemen dari DOM setelah animasi
        };

        document.getElementById('btn-cancel-login').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(); // Tutup saat klik di luar kotak
        });

        // Event listener ke halaman Auth
        document.getElementById('btn-go-login').addEventListener('click', () => {
            window.location.href = 'auth.html';
        });
    }

    // ==========================================
    // LOGIKA DAFTARKU (BOOKMARK) DENGAN FIREBASE
    // ==========================================
    let currentUser = null;

    // Cek Status Bookmark saat Pertama Kali Load Halaman
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        
        if (user && seriesId) {
            try {
                const bookmarkRef = doc(db, "users", user.uid, "bookmarks", seriesId);
                const bookmarkSnap = await getDoc(bookmarkRef);
                
                if (bookmarkSnap.exists()) {
                    document.querySelectorAll('.toggle-bookmark').forEach(btn => {
                        btn.classList.add('active');
                        const icon = btn.querySelector('i');
                        if (icon) {
                            if (icon.classList.contains('fa-bookmark')) {
                                icon.classList.replace('far', 'fas');
                            } else if (icon.classList.contains('fa-plus')) {
                                icon.classList.replace('fa-plus', 'fa-check');
                            }
                        }
                    });
                }
            } catch (err) {
                console.error("Gagal mengecek status bookmark:", err);
            }
        }
    });

    // Logika Saat Tombol Daftarku di Klik
    const bookmarkBtns = document.querySelectorAll('.toggle-bookmark');
    bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // CEK LOGIN: Jika belum login, tampilkan Modal Pop-Up Kustom
            if (!currentUser) {
                showLoginPromptModal();
                return;
            }
            
            const isCurrentlyBookmarked = btn.classList.contains('active');
            const bookmarkRef = doc(db, "users", currentUser.uid, "bookmarks", seriesId);
            
            try {
                if (isCurrentlyBookmarked) {
                    await deleteDoc(bookmarkRef); 
                    
                    document.querySelectorAll('.toggle-bookmark').forEach(b => {
                        b.classList.remove('active');
                        const icon = b.querySelector('i');
                        if(icon) {
                            if (icon.classList.contains('fa-bookmark')) icon.classList.replace('fas', 'far');
                            else if (icon.classList.contains('fa-check')) icon.classList.replace('fa-check', 'fa-plus');
                        }
                    });
                    showToast('Dihapus dari Daftarku');
                    
                } else {
                    await setDoc(bookmarkRef, {
                        seriesId: seriesId,
                        title: currentSeriesData.title || "Tanpa Judul", 
                        bannerUrl: currentSeriesData.bannerUrl || currentSeriesData.banner_url || "",
                        genre: currentSeriesData.genres || currentSeriesData.category || "",
                        savedAt: new Date()
                    });
                    
                    document.querySelectorAll('.toggle-bookmark').forEach(b => {
                        b.classList.add('active');
                        const icon = b.querySelector('i');
                        if(icon) {
                            if (icon.classList.contains('fa-bookmark')) icon.classList.replace('far', 'fas');
                            else if (icon.classList.contains('fa-plus')) icon.classList.replace('fa-plus', 'fa-check');
                        }
                    });
                    showToast('Berhasil ditambahkan ke Daftarku!');
                }
            } catch (err) {
                console.error("Gagal mengubah status Daftarku:", err);
                alert("Terjadi kesalahan saat menyimpan data ke server.");
            }
        });
    });

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
