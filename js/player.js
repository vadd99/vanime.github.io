// ==========================================
// SCRIPT LOGIKA PLAYER VIDEO (js/player.js)
// ==========================================

import { db } from './firebase-init.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    const epSeriesTitle = document.getElementById('ep-series-title');
    const epMainTitle = document.getElementById('ep-main-title');
    const epDesc = document.getElementById('ep-desc');
    
    const embedContainer = document.getElementById('embed-container');
    const mainVideo = document.getElementById('main-video');
    const videoControls = document.getElementById('video-controls');
    const bigPlayBtn = document.getElementById('big-play-btn');

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
        if (epSeriesTitle) {
            epSeriesTitle.innerText = epData.seriesTitle || "Judul Seri";
            epSeriesTitle.href = `detail.html?id=${currentSeriesId}`;
        }
        if (epMainTitle) epMainTitle.innerText = `E${currentEpNumber} - ${epData.episodeTitle || 'Tanpa Judul'}`;
        
        const seriesDoc = await getDoc(doc(db, "series", currentSeriesId));
        if (seriesDoc.exists() && epDesc) {
            epDesc.innerText = seriesDoc.data().description || "Selamat menonton episode ini di Vadd Studio!";
        }

        if (epData.embedUrl) {
            if (mainVideo) mainVideo.style.display = 'none';
            if (videoControls) videoControls.style.display = 'none';
            if (bigPlayBtn) bigPlayBtn.style.display = 'none';

            if (embedContainer) {
                embedContainer.style.display = 'block';
                embedContainer.innerHTML = getResponsiveEmbedHTML(epData.embedUrl);
            }
        }

        // --- MENGAMBIL SEMUA DAFTAR EPISODE ---
        const epsQuery = query(collection(db, "episodes"), where("seriesId", "==", currentSeriesId));
        const epsSnapshot = await getDocs(epsQuery);
        
        const epSection = document.getElementById('episodes-section');
        const epScrollList = document.getElementById('ep-scroll-list');
        
        if (!epsSnapshot.empty && epSection && epScrollList) {
            let epArray = [];
            epsSnapshot.forEach(doc => epArray.push({ id: doc.id, ...doc.data() }));
            
            // Mengurutkan episode berdasarkan nomor (1, 2, 3...)
            epArray.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));

            epScrollList.innerHTML = '';
            
            epArray.forEach(ep => {
                const isActive = ep.id === epId; // Cek apakah ini episode yang sedang ditonton
                const thumb = ep.thumbnailUrl || "https://via.placeholder.com/350x200?text=Eps+" + ep.episodeNumber;
                
                // Jika aktif, ganti ikon play menjadi ikon volume/sedang diputar
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

            // Auto-scroll list ke episode yang sedang ditonton
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

    const toast = document.getElementById('vadd-toast');
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    const btnLike = document.getElementById('btn-like');
    const btnDislike = document.getElementById('btn-dislike');
    const btnDownload = document.getElementById('btn-download');

    if (btnLike) {
        btnLike.addEventListener('click', () => {
            btnLike.classList.toggle('active');
            if (btnDislike) btnDislike.classList.remove('active');
        });
    }

    if (btnDislike) {
        btnDislike.addEventListener('click', () => {
            btnDislike.classList.toggle('active');
            if (btnLike) btnLike.classList.remove('active');
        });
    }

    if (btnDownload) {
        btnDownload.addEventListener('click', () => showToast('Memulai pengunduhan video...'));
    }
});
