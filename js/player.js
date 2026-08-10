// ==========================================
// SCRIPT LOGIKA PLAYER VIDEO (js/player.js)
// ==========================================

// Ganti DOMContentLoaded dengan layoutReady (Sesuai arsitektur Injeksi Vadd Studio)
window.addEventListener('layoutReady', () => {
    console.log("Halaman Pemutar Video berhasil dimuat beserta layout!");

    const video = document.getElementById('main-video');
    const videoContainer = document.getElementById('video-container');
    const bigPlayBtn = document.getElementById('big-play-btn');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnSkipBackward = document.getElementById('btn-skip-backward');
    const btnSkipForward = document.getElementById('btn-skip-forward');
    const btnVolume = document.getElementById('btn-volume');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('progress-bar');
    const bufferBar = document.getElementById('buffer-bar');
    const progressContainer = document.getElementById('progress-container');
    const videoTime = document.getElementById('video-time');
    const btnFullscreen = document.getElementById('btn-fullscreen');

    // 1. Format Waktu (Detik -> MM:SS)
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // 2. Play / Pause Toggle
    function togglePlay() {
        if (!video) return;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    function updatePlayState() {
        if (!video) return;
        if (video.paused) {
            if(btnPlayPause) btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
            if(bigPlayBtn) bigPlayBtn.classList.remove('hidden');
        } else {
            if(btnPlayPause) btnPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
            if(bigPlayBtn) bigPlayBtn.classList.add('hidden');
        }
    }

    if (video) {
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', updatePlayState);
        video.addEventListener('pause', updatePlayState);
    }

    if (bigPlayBtn) bigPlayBtn.addEventListener('click', togglePlay);
    if (btnPlayPause) btnPlayPause.addEventListener('click', togglePlay);

    // 3. Skip +/- 10 Detik
    if (btnSkipBackward && video) {
        btnSkipBackward.addEventListener('click', () => {
            video.currentTime = Math.max(0, video.currentTime - 10);
        });
    }

    if (btnSkipForward && video) {
        btnSkipForward.addEventListener('click', () => {
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
        });
    }

    // 4. Progress Bar & Time Update
    if (video) {
        video.addEventListener('timeupdate', () => {
            if (video.duration && progressBar && videoTime) {
                const pct = (video.currentTime / video.duration) * 100;
                progressBar.style.width = `${pct}%`;
                videoTime.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
            }
        });

        video.addEventListener('progress', () => {
            if (video.buffered.length > 0 && video.duration && bufferBar) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const pct = (bufferedEnd / video.duration) * 100;
                bufferBar.style.width = `${pct}%`;
            }
        });
    }

    // Scrub / Click pada Progress Bar
    if (progressContainer && video) {
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (video.duration) {
                video.currentTime = clickPos * video.duration;
            }
        });
    }

    // 5. Pengaturan Volume
    if (volumeSlider && video) {
        volumeSlider.addEventListener('input', (e) => {
            video.volume = e.target.value;
            video.muted = (e.target.value === '0');
            updateVolumeIcon();
        });
    }

    if (btnVolume && video) {
        btnVolume.addEventListener('click', () => {
            video.muted = !video.muted;
            if (video.muted) {
                if(volumeSlider) volumeSlider.value = 0;
            } else {
                if(volumeSlider) volumeSlider.value = video.volume || 1;
            }
            updateVolumeIcon();
        });
    }

    function updateVolumeIcon() {
        if(!video || !btnVolume) return;
        if (video.muted || video.volume === 0) {
            btnVolume.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (video.volume < 0.5) {
            btnVolume.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            btnVolume.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }

    // 6. Fullscreen Toggle
    if (btnFullscreen && videoContainer) {
        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                videoContainer.requestFullscreen().catch(err => console.error(err));
            } else {
                document.exitFullscreen().catch(err => console.error(err));
            }
        });
    }

    // 7. Auto Hide Controls saat idle
    let idleTimer;
    if (videoContainer && video) {
        videoContainer.addEventListener('mousemove', () => {
            videoContainer.classList.remove('user-idle');
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                if (!video.paused) {
                    videoContainer.classList.add('user-idle');
                }
            }, 3000);
        });
    }

    // 8. Toast Notification & Toolbar Interaksi
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
    const btnMiniDownload = document.querySelector('.btn-download-mini');

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
        btnDownload.addEventListener('click', () => {
            showToast('Memulai pengunduhan video...');
        });
    }
    
    if (btnMiniDownload) {
        btnMiniDownload.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah pindah halaman saat klik ikon download
            showToast('Memulai pengunduhan episode...');
        });
    }
});