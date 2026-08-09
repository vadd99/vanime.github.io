// ==========================================
// LOGIKA INTERAKTIF LAYOUT & ROUTER (JS/LAYOUT.JS)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------
    // A. ROUTER OTOMATIS INJEKSI HALAMAN
    // ------------------------------------------
    const contentSlot = document.getElementById('main-content-slot');
    const pageCssTag = document.getElementById('page-css');

    function loadPageContent() {
        // Ambil nama halaman dari URL (misal: ?page=detail), default 'home'
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = urlParams.get('page') || 'home';

        // 1. Ganti CSS Halaman secara Otomatis
        if (pageCssTag) {
            pageCssTag.href = `css/${currentPage}.css`;
        }

        // 2. Tandai Menu Aktif di Navbar
        document.querySelectorAll('[data-page]').forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // 3. Inject Potongan HTML (home.html, detail.html, player.html)
        fetch(`${currentPage}.html`)
            .then(response => {
                if (!response.ok) throw new Error('Halaman tidak ditemukan');
                return response.text();
            })
            .then(htmlContent => {
                if (contentSlot) {
                    contentSlot.innerHTML = htmlContent;
                }

                // 4. Load JS Khusus Halaman jika ada (misal: js/home.js)
                const existingScript = document.getElementById('dynamic-page-js');
                if (existingScript) existingScript.remove();

                const script = document.createElement('script');
                script.id = 'dynamic-page-js';
                script.src = `js/${currentPage}.js`;
                document.body.appendChild(script);
            })
            .catch(err => {
                if (contentSlot) {
                    contentSlot.innerHTML = `
                        <div style="text-align: center; padding: 6rem 1rem; color: #ffffff;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f27329; margin-bottom: 1rem;"></i>
                            <h2>Halaman Tidak Ditemukan</h2>
                            <p style="margin-top: 0.5rem; color: #a0a0a0;">File ${currentPage}.html belum dibuat atau salah nama.</p>
                        </div>
                    `;
                }
            });
    }

    // Jalankan Router saat pertama dimuat
    loadPageContent();


    // ------------------------------------------
    // B. LOGIKA NAVBAR SCROLL & SIDEBAR
    // ------------------------------------------

    // 1. Efek Transisi Navbar saat di-Scroll
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // 2. Kontrol Sidebar Mobile Drawer
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        if (!drawer || !overlay) return;
        drawer.classList.add('open');
        overlay.style.display = 'block';
        setTimeout(() => overlay.style.opacity = '1', 10);
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (!drawer || !overlay) return;
        drawer.classList.remove('open');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

});
