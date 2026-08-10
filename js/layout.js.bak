// Logika Interaktif Layout (layout.js)
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const menuBtn = document.getElementById('mobile-menu-btn');
const closeBtn = document.getElementById('sidebar-close-btn');
const drawer = document.getElementById('sidebar-drawer');
const overlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    drawer.classList.add('open');
    overlay.style.display = 'block';
    setTimeout(() => overlay.style.opacity = '1', 10);
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
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