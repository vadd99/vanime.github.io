// ==========================================
// SCRIPT LOGIKA DETAIL FILM (js/detail.js)
// ==========================================

// Menunggu event 'layoutReady' dari js/main.js
window.addEventListener('layoutReady', () => {
    console.log("Halaman Detail berhasil dimuat beserta layout!");

    // 1. Toggle Sinopsis (Expand / Collapse)
    const btnToggleSynopsis = document.getElementById('btn-toggle-synopsis');
    const synopsisText = document.getElementById('synopsis-text');

    if (btnToggleSynopsis && synopsisText) {
        btnToggleSynopsis.addEventListener('click', () => {
            synopsisText.classList.toggle('expanded');
            if (synopsisText.classList.contains('expanded')) {
                btnToggleSynopsis.innerHTML = 'PERSINGKAT <i class="fas fa-chevron-up icon-arrow"></i>';
            } else {
                btnToggleSynopsis.innerHTML = 'LEBIH BANYAK DETAIL <i class="fas fa-chevron-right icon-arrow"></i>';
            }
        });
    }

    // 2. Fungsi Toast Notification Sederhana
    const toast = document.getElementById('vadd-toast');

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // 3. Toggle Bookmark / Tambahkan ke Daftarku
    const bookmarkBtns = document.querySelectorAll('.toggle-bookmark');

    bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');
            
            const icon = btn.querySelector('i');
            if (icon) {
                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    showToast('Berhasil ditambahkan ke Daftarku!');
                } else if (icon.classList.contains('fas') && !icon.classList.contains('fa-plus')) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    showToast('Dihapus dari Daftarku');
                } else {
                    showToast('Berhasil ditambahkan ke Daftarku!');
                }
            } else {
                showToast('Berhasil ditambahkan ke Daftarku!');
            }
        });
    });

    // 4. Tombol Bagikan
    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
        btnShare.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Mushoku Tensei - Vadd Studio',
                    url: window.location.href
                }).catch(() => {});
            } else {
                showToast('Tautan berhasil disalin!');
            }
        });
    }

});