// ==========================================
// SCRIPT LOGIKA PLAYER VIDEO (js/player.js)
// ==========================================

import { db } from './firebase-init.js';
// Tambahkan updateDoc dan increment untuk sistem Like/Dislike
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// FUNGSI PENDETEKSI & PENCONVERSI LINK EMBED
function getResponsiveEmbedHTML(rawUrl) {
    if (!rawUrl) return '<div style="color:white; display:flex; align-items:center; justify-content:center; height:100%;">Video belum tersedia</div>';

    let embedHTML = '';

    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
        let videoId = '';
        if (rawUrl.includes('youtu.be/')) videoId = rawUrl.split('youtu.be/')[1].split('?')[0];
        else if (rawUrl.includes('embed/')) videoId = rawUrl.split('embed/')[1].split('?')[0];
        else if (rawUrl.includes('watch?v=')) videoId = rawUrl.split('watch?v=')[1].split('&')[0];
        
        const cleanYoutubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        embedHTML = `<iframe src="${cleanYoutubeUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
    
    } else if (rawUrl.includes('drive.google.com')) {
        let fileId = '';
        if (rawUrl.includes('/file/d/')) fileId = rawUrl.split('/file/d/')[1].split('/')[0];
        else if (rawUrl.includes('id=')) fileId = rawUrl.split('id=')[1].split('&')[0];
        
        const gdriveUrl = `https://drive.google.com/file/d/${fileId}/preview?autoplay=1`;
        embedHTML = `<iframe src="${gdriveUrl}" frameborder="0" allow="autoplay" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
    
    } else if (rawUrl.endsWith('.mp4') || rawUrl.endsWith('.mkv')) {
        embedHTML = `
            <video width="100%" height="100%" controls autoplay style="background:#000;">
                <source src="${rawUrl}" type="video/mp4">
                Browser Anda tidak mendukung pemutar video ini.
            </video>
        `;
    } else {
        if (rawUrl.includes('<iframe')) embedHTML = rawUrl;
        else embedHTML = `<iframe src="${rawUrl}" frameborder="0" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
    }

    return embedHTML;
}

function renderEmbed(url) {
    const embedContainer = document.getElementById('embed-container');
    const mainVideo = document.getElementById('main-video');
    const videoControls = document.getElementById('video-controls');
    const bigPlayBtn = document.getElementById('big-play-btn');

    if (!embedContainer) return;
    
    if (mainVideo) mainVideo.style.display = 'none';
    if (videoControls) videoControls.style.display = 'none';
    if (bigPlayBtn) bigPlayBtn.style.display = 'none';

    embedContainer.style.display = 'block';
    embedContainer.innerHTML = getResponsiveEmbedHTML(url);
}

window.addEventListener('layoutReady', async () => {
    console.log("Halaman Pemutar Video dimuat!");

    const urlParams = new URLSearchParams(window.location.search);
    const epId = urlParams.get('ep');

    if (!epId) {
        alert("Video tidak ditemukan!");
        window.location.href = 'index.html';
        return;
    }

    const pageTitle = document.getElementById('page-title');
    const epMainTitle = document.getElementById('ep-main-title');
    
    const metaAudio = document.getElementById('meta-audio');
    const metaSub = document.getElementById('meta-sub');
    const metaAge = document.getElementById('meta-age');
    const metaWarning = document.getElementById('meta-warning');

    try {
        const epDoc = await getDoc(doc(db, "episodes", epId));
        
        if (!epDoc.exists()) {
            if(epMainTitle) epMainTitle.innerText = "Episode tidak ditemukan";
            return;
        }

        const epData = epDoc.data();
        const currentSeriesId = epData.seriesId;
        const currentEpNumber = Number(epData.episodeNumber);

        if(pageTitle) pageTitle.innerText = `E${currentEpNumber} - ${epData.episodeTitle || 'Episode'} | Vadd Studio`;
        if (epMainTitle) epMainTitle.innerText = `E${currentEpNumber} - ${epData.episodeTitle || 'Tanpa Judul'}`;
        
        // --- LOGIKA LIKE & DISLIKE ---
        let currentLikes = epData.likes || 0;
        let currentDislikes = epData.dislikes || 0;
        
        const likeCountEl = document.getElementById('like-count');
        const dislikeCountEl = document.getElementById('dislike-count');
        const btnLike = document.getElementById('btn-like');
        const btnDislike = document.getElementById('btn-dislike');
        
        if (likeCountEl) likeCountEl.innerText = currentLikes;
        if (dislikeCountEl) dislikeCountEl.innerText = currentDislikes;

        // Cek apakah pengunjung sudah pernah like/dislike (tersimpan di browser)
        let userVote = localStorage.getItem(`vadd_vote_${epId}`);
        if (userVote === 'like' && btnLike) btnLike.classList.add('active');
        if (userVote === 'dislike' && btnDislike) btnDislike.classList.add('active');

        // Fungsi Handle Vote
        const handleVote = async (type) => {
            const epRef = doc(db, "episodes", epId);
            let updates = {};

            // Nonaktifkan tombol sementara proses loading
            if(btnLike) btnLike.disabled = true;
            if(btnDislike) btnDislike.disabled = true;

            try {
                if (userVote === type) {
                    // Batal vote (Klik kedua kali)
                    updates[type + 's'] = increment(-1); // likes: -1 atau dislikes: -1
                    if (type === 'like') currentLikes = Math.max(0, currentLikes - 1);
                    else currentDislikes = Math.max(0, currentDislikes - 1);

                    userVote = null;
                    localStorage.removeItem(`vadd_vote_${epId}`);
                } else {
                    // Vote baru ATAU ganti pilihan (Dari like ke dislike, dsb)
                    updates[type + 's'] = increment(1);
                    if (type === 'like') currentLikes++;
                    else currentDislikes++;

                    if (userVote) {
                        // Jika ada vote lama, kurangi vote lamanya
                        updates[userVote + 's'] = increment(-1);
                        if (userVote === 'like') currentLikes = Math.max(0, currentLikes - 1);
                        else currentDislikes = Math.max(0, currentDislikes - 1);
                    }

                    userVote = type;
                    localStorage.setItem(`vadd_vote_${epId}`, type);
                }

                // Simpan ke Firestore Firebase
                await updateDoc(epRef, updates);

                // Update UI Angka & Tombol
                if (likeCountEl) likeCountEl.innerText = currentLikes;
                if (dislikeCountEl) dislikeCountEl.innerText = currentDislikes;
                
                if (btnLike) btnLike.classList.toggle('active', userVote === 'like');
                if (btnDislike) btnDislike.classList.toggle('active', userVote === 'dislike');

            } catch (err) {
                console.error("Gagal memperbarui vote:", err);
                alert("Terjadi kesalahan saat menyukai video.");
            }

            // Aktifkan kembali tombol
            if(btnLike) btnLike.disabled = false;
            if(btnDislike) btnDislike.disabled = false;
        };

        if (btnLike) btnLike.addEventListener('click', () => handleVote('like'));
        if (btnDislike) btnDislike.addEventListener('click', () => handleVote('dislike'));
        // -----------------------------


        // AMBIL DATA DETAIL SERI UNTUK KETERANGAN VIDEO
        const seriesDoc = await getDoc(doc(db, "series", currentSeriesId));
        if (seriesDoc.exists()) {
            const seriesData = seriesDoc.data();
            if(metaAudio) metaAudio.innerText = seriesData.audioLanguages || 'Tidak diketahui';
            if(metaSub) metaSub.innerText = seriesData.subtitleLanguages || 'Tidak diketahui';
            if(metaAge) metaAge.innerText = seriesData.ageRating || 'SU';
            if(metaWarning) metaWarning.innerText = seriesData.contentWarnings || 'Tidak ada peringatan khusus';
        }

        // --- RENDER SERVER SELECTOR CARD ---
        const serverSelector = document.getElementById('server-selector-container');
        
        let servers = epData.servers || [];
        if (servers.length === 0 && epData.embedUrl) {
             servers = [{ name: "Google Drive", url: epData.embedUrl }]; 
        }

        if (serverSelector && servers.length > 0) {
            serverSelector.innerHTML = '';
            servers.forEach((srv, index) => {
                const btn = document.createElement('button');
                btn.className = `server-btn ${index === 0 ? 'active' : ''}`;
                btn.innerHTML = `<i class="fas fa-play-circle"></i> ${srv.name}`;
                btn.onclick = () => {
                    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderEmbed(srv.url);
                };
                serverSelector.appendChild(btn);
            });

            renderEmbed(servers[0].url);
        } else {
             if (serverSelector) serverSelector.innerHTML = '<span style="color:#ef4444; font-size:0.8rem;">Tidak ada server yang tersedia.</span>';
             renderEmbed("");
        }

        // --- MENGAMBIL SEMUA DAFTAR EPISODE ---
        const epsQuery = query(collection(db, "episodes"), where("seriesId", "==", currentSeriesId));
        const epsSnapshot = await getDocs(epsQuery);
        
        const epSection = document.getElementById('episodes-section');
        const epScrollList = document.getElementById('ep-scroll-list');
        
        if (!epsSnapshot.empty && epSection && epScrollList) {
            let epArray = [];
            epsSnapshot.forEach(doc => epArray.push({ id: doc.id, ...doc.data() }));
            
            epArray.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
            epScrollList.innerHTML = '';
            
            epArray.forEach(ep => {
                const isActive = ep.id === epId; 
                const thumb = ep.thumbnailUrl || "https://via.placeholder.com/350x200?text=Eps+" + ep.episodeNumber;
                
                const iconOverlay = isActive ? 
                    `<i class="fas fa-volume-up" style="color:var(--vadd-primary);"></i>` : 
                    `<i class="fas fa-play"></i>`;

                const epHTML = `
                    <a href="player.html?ep=${ep.id}" class="next-episode-card ${isActive ? 'active-ep' : ''}" ${isActive ? 'id="current-playing-ep"' : ''}>
                        <div class="next-thumb-wrapper">
                            <img src="${thumb}" alt="E${ep.episodeNumber}">
                            <div class="play-overlay-mini">
                                ${iconOverlay}
                            </div>
                        </div>
                        <div class="next-episode-info">
                            <h4 class="next-title">E${ep.episodeNumber} - ${ep.episodeTitle || 'Tanpa Judul'}</h4>
                        </div>
                    </a>
                `;
                epScrollList.innerHTML += epHTML;
            });
            
            epSection.style.display = 'block';

            setTimeout(() => {
                const activeEl = document.getElementById('current-playing-ep');
                if (activeEl && epScrollList) {
                    activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 800);

        } else if (epSection) {
            epSection.style.display = 'none';
        }

    } catch (error) {
        console.error("Gagal memuat player:", error);
    }

    // Tombol Share API Native
    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
        btnShare.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Tonton di Vadd Studio',
                    url: window.location.href
                }).catch(() => {});
            } else {
                alert('URL halaman telah disalin!');
            }
        });
    }
});
