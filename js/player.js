// ==========================================
// SCRIPT LOGIKA PLAYER VIDEO (JS/PLAYER.JS)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
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
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    function updatePlayState() {
        if (video.paused) {
            btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
            bigPlayBtn.classList.remove('hidden');
        } else {
            btnPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
            bigPlayBtn.classList.add('hidden');
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
    if (btnSkipBackward) {
        btnSkipBackward.addEventListener('click', () => {
            video.currentTime = Math.max(0, video.currentTime - 10);
        });
    }

    if (btnSkipForward) {
        btnSkipForward.addEventListener('click', () => {
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
        });
    }

    // 4. Progress Bar & Time Update
    if (video) {
        video.addEventListener('timeupdate', () => {
            if (video.duration) {
                const pct = (video.currentTime / video.duration) * 100;
                progressBar.style.width = `${pct}%`;
                videoTime.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
            }
        });

        video.addEventListener('progress', () => {
            if (video.buffered.length > 0 && video.duration) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const pct = (bufferedEnd / video.duration) * 100;
                bufferBar.style.width = `${pct}%`;
            }
        });
    }

    // Scrub / Click pada Progress Bar
    if (progressContainer) {
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (video.duration) {
                video.currentTime = clickPos * video.duration;
            }
        });
    }

    // 5. Pengaturan Volume
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            video.volume = e.target.value;
            video.muted = (e.target.value === '0');
            updateVolumeIcon();
        });
    }

    if (btnVolume) {
        btnVolume.addEventListener('click', () => {
            video.muted = !video.muted;
            if (video.muted) {
                volumeSlider.value = 0;
            } else {
                volumeSlider.value = video.volume || 1;
            }
            updateVolumeIcon();
        });
    }

    function updateVolumeIcon() {
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
    if (videoContainer) {
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
});
