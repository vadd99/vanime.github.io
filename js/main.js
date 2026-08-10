// Script Utama: Mengatur Injeksi Layout & UI Dasar (js/main.js)
import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Fetch file layout.html
        const response = await fetch('layout.html');
        if (!response.ok) throw new Error("Gagal mengambil layout.html");
        
        const layoutHtml = await response.text();
        
        // 2. Masukkan Layout ke dalam <div id="layout-wrapper">
        const layoutWrapper = document.getElementById('layout-wrapper');
        if (layoutWrapper) {
            layoutWrapper.innerHTML = layoutHtml;
        }

        // 3. Ambil isi template dari index.html dan pindahkan ke tengah layout
        const templateContent = document.getElementById('page-content');
        const targetContainer = document.getElementById('main-content-target');
        
        if (templateContent && targetContainer) {
            targetContainer.appendChild(templateContent.content.cloneNode(true));
        }

        // 4. Inisialisasi logika interaktif UI & Auth
        initLayoutInteractions();
        initAuthProfile();

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

// Logika Profil Avatar & Popover Logout/Login
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

    // Toggle Popover Dropdown
    if (avatarBtn && popover) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('hidden');
        });

        // Tutup Popover saat mengeklik di luar area avatar
        document.addEventListener('click', (e) => {
            if (!popover.contains(e.target) && !avatarBtn.contains(e.target)) {
                popover.classList.add('hidden');
            }
        });
    }

    // Observer Status Login Firebase Auth
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Pengguna SUDAH Login
            if (loggedInView) loggedInView.classList.remove('hidden');
            if (loggedOutView) loggedOutView.classList.add('hidden');

            if (userNameEl) userNameEl.textContent = user.displayName || 'Pengguna Vadd';
            if (userEmailEl) userEmailEl.textContent = user.email;

            // Tampilkan foto pengguna jika ada (misal dari Google Sign-In)
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
            // Pengguna BELUM Login
            if (loggedInView) loggedInView.classList.add('hidden');
            if (loggedOutView) loggedOutView.classList.remove('hidden');
            if (avatarImg) avatarImg.classList.add('hidden');
            if (avatarIcon) avatarIcon.classList.remove('hidden');
        }
    });

    // Tombol Logout Action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                popover.classList.add('hidden');
                window.location.reload(); // Reload untuk memperbarui antarmuka
            } catch (error) {
                console.error("Gagal Logout:", error);
            }
        });
    }
}