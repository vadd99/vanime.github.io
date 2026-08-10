// Script Khusus Halaman Index (js/index.js)

// Menunggu event custom dari main.js (layoutReady) agar elemen DOM sudah terbentuk
window.addEventListener('layoutReady', () => {
    console.log("Vadd Studio: Halaman dan layout sukses dimuat!");

    // Contoh penambahan logika spesifik home page
    const videoCards = document.querySelectorAll('.video-card, .poster-card');
    
    videoCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah reload halaman
            console.log("Mengarahkan ke pemutar video...");
            // Anda bisa tambahkan logika redirect atau modal video di sini
        });
    });
});