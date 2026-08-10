// ==========================================
// SCRIPT KHUSUS HALAMAN INDEX (js/index.js)
// ==========================================

// Menunggu event custom dari main.js (layoutReady) agar elemen DOM sudah terbentuk
window.addEventListener('layoutReady', () => {
    console.log("Vadd Studio: Halaman Utama (Index) sukses dimuat!");

    // 1. Mengarahkan klik kartu video / poster ke halaman detail
    const videoCards = document.querySelectorAll('.video-card, .poster-card');
    
    videoCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Mencegah sifat bawaan tag <a> jika ada, agar dikontrol penuh oleh JS
            e.preventDefault(); 
            
            // Pindah ke halaman detail film
            window.location.href = 'detail.html';
        });
    });

    // 2. Mengarahkan tombol "Mulai Menonton" di Banner Utama (Hero)
    const heroPlayBtn = document.querySelector('.hero .btn-primary');
    if (heroPlayBtn) {
        heroPlayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Biasanya banner diarahkan ke detail atau langsung ke player, 
            // kita arahkan ke detail.html sesuai alur
            window.location.href = 'detail.html'; 
        });
    }

    // 3. Efek interaksi tambahan jika diperlukan (seperti hover play button dll)
    // Bisa ditambahkan di sini...
});