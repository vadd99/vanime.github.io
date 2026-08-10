import { initLayoutInteractions } from '../layout.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Ambil file layout.html
        const response = await fetch('layout.html');
        if (!response.ok) throw new Error("Gagal memuat layout.html");
        
        const layoutHtml = await response.text();
        
        // 2. Tempelkan Layout ke wrapper
        const layoutWrapper = document.getElementById('layout-wrapper');
        if (layoutWrapper) {
            layoutWrapper.innerHTML = layoutHtml;
        }

        // 3. Pindahkan konten template dari index.html ke area main
        const templateContent = document.getElementById('page-content');
        const targetContainer = document.getElementById('main-content-target');
        
        if (templateContent && targetContainer) {
            targetContainer.appendChild(templateContent.content.cloneNode(true));
        }

        // 4. Inisialisasi event tombol, scroll & auth profil
        initLayoutInteractions();

        // 5. Beri tahu event bahwa layout siap
        window.dispatchEvent(new Event('layoutReady'));

    } catch (error) {
        console.error("Terjadi kesalahan:", error);
    }
});