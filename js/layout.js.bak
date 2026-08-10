// Import instance auth dari firebase-init.js
import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Inisialisasi seluruh event interaktif layout
export function initLayoutInteractions() {
    // 1. Scroll Navbar
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
    });

    // 2. Sidebar Drawer Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        if (drawer) drawer.classList.add('open');
        if (overlay) {
            overlay.style.display = 'block';
            setTimeout(() => overlay.style.opacity = '1', 10);
        }
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (drawer) drawer.classList.remove('open');
        if (overlay) {
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

    // 3. Logika Avatar & Card Popover Profile
    initAuthProfile();
}

function initAuthProfile() {
    const avatarBtn = document.getElementById('user-avatar-btn');
    const popover = document.getElementById('profile-popover');
    const avatarIcon = document.getElementById('user-avatar-icon');
    const avatarImg = document.getElementById('user-avatar-img');
    const loggedInView = document.getElementById('popover-logged-in');
    const loggedOutView = document.getElementById('popover-logged-out');
    const userNameEl = document.getElementById('popover-user-name');
    const userEmailEl = document.getElementById('popover-user-email');
    const logoutBtn = document.getElementById('btn-logout');

    // Klik Avatar untuk Buka/Tutup Popover
    if (avatarBtn && popover) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('hidden');
        });

        // Tutup jika klik di luar
        document.addEventListener('click', (e) => {
            if (!popover.contains(e.target) && !avatarBtn.contains(e.target)) {
                popover.classList.add('hidden');
            }
        });
    }

    // Monitor Status Login Firebase
    if (auth) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User Sudah Login
                if (loggedInView) loggedInView.classList.remove('hidden');
                if (loggedOutView) loggedOutView.classList.add('hidden');

                if (userNameEl) userNameEl.textContent = user.displayName || 'Pengguna Vadd';
                if (userEmailEl) userEmailEl.textContent = user.email;

                // Tampilkan foto profil pengguna
                if (user.photoURL) {
                    if (avatarImg) {
                        avatarImg.src = user.photoURL;
                        avatarImg.classList.remove('hidden');
                    }
                    if (avatarIcon) avatarIcon.classList.add('hidden');
                } else {
                    if (avatarImg) avatarImg.classList.add('hidden');
                    if (avatarIcon) avatarIcon.classList.remove('hidden');
                }
            } else {
                // User Belum Login
                if (loggedInView) loggedInView.classList.add('hidden');
                if (loggedOutView) loggedOutView.classList.remove('hidden');
                if (avatarImg) avatarImg.classList.add('hidden');
                if (avatarIcon) avatarIcon.classList.remove('hidden');
            }
        });
    }

    // Tombol Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                popover.classList.add('hidden');
                window.location.reload();
            } catch (err) {
                console.error("Gagal Logout:", err);
            }
        });
    }
}