// ==========================================
// LOGIKA HALAMAN UTAMA / BERANDA (JS/HOME.JS)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("Halaman utama Vadd Studio berhasil dimuat.");
    
    // Interaksi Tambahan Kartu Video / Poster
    const videoCards = document.querySelectorAll('.video-card, .poster-card');
    videoCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.zIndex = '5';
        });
        card.addEventListener('mouseleave', () => {
            card.style.zIndex = '1';
        });
    });
});