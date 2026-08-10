// Script Utama: Mengatur Injeksi Layout & UI Dasar (js/main.js)

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Fetch file layout.html
        const response = await fetch('layout.html');
        if (!response.ok) throw new Error("Gagal mengambil layout.html");
        
        const layoutHtml = await response.text();
        
        // 2. Masukkan Layout ke dalam <div id="layout-wrapper">
        document.getElementById('layout-wrapper').innerHTML = layoutHtml;

        // 3. Ambil isi template dari index.html dan pindahkan ke tengah layout
        const templateContent = document.getElementById('page-content');
        const targetContainer = document.getElementById('main-content-target');
        
        if (templateContent && targetContainer) {
            targetContainer.appendChild(templateContent.content.cloneNode(true));
        }

        // 4. Inisialisasi logika interaktif (Navbar Scroll & Sidebar Toggle)
        initLayoutInteractions();

        // 5. Beri sinyal ke js/index.js bahwa halaman sudah selesai dirakit
        window.dispatchEvent(new Event('layoutReady'));

    } catch (error) {
        console.error("Terjadi kesalahan saat memuat Layout:", error);
    }
});

function initLayoutInteractions() {
    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if(navbar) {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
    });

    // Sidebar Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        if(drawer) drawer.classList.add('open');
        if(overlay) {
            overlay.style.display = 'block';
            setTimeout(() => overlay.style.opacity = '1', 10);
        }
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if(drawer) drawer.classList.remove('open');
        if(overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
}