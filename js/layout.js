// ==========================================
// LOGIKA INTERAKTIF LAYOUT (JS/LAYOUT.JS)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

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