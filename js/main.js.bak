// Script Utama: Mengatur Injeksi Layout & UI Dasar (js/main.js)

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Fetch file layout.html
        const response = await fetch('layout.html');
        if (!response.ok) throw new Error("Gagal mengambil layout.html");
        
        const layoutHtml = await response.text();
        
        // 2. Masukkan Layout ke dalam <div id="layout-wrapper">
        document.getElementById('layout-wrapper').innerHTML = layoutHtml;

        // 3. Ambil isi template dari halaman (index, detail, player) dan pindahkan ke tengah layout
        const templateContent = document.getElementById('page-content');
        const targetContainer = document.getElementById('main-content-target');
        
        if (templateContent && targetContainer) {
            targetContainer.appendChild(templateContent.content.cloneNode(true));
        }

        // 4. Inisialisasi logika interaktif (Navbar Scroll & Sidebar Toggle)
        initLayoutInteractions();

        // 5. Inisialisasi Logika Autentikasi secara dinamis agar tidak error "import outside module"
        await initAuthLogic();

        // 6. Beri sinyal ke script lokal halaman bahwa layout sudah selesai
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


// --- FUNGSI BARU: LOGIKA AUTENTIKASI ---
async function initAuthLogic() {
    let auth, onAuthStateChanged, signOut;
    
    try {
        // Import module Firebase secara dinamis (Dynamic Import)
        const firebaseInit = await import('./firebase-init.js');
        auth = firebaseInit.auth;
        
        const firebaseAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        onAuthStateChanged = firebaseAuth.onAuthStateChanged;
        signOut = firebaseAuth.signOut;
    } catch (err) {
        console.error("Gagal memuat modul Firebase Auth:", err);
        return; // Hentikan fungsi auth jika gagal, tapi layout tetap aman
    }

    const avatarBtn = document.getElementById('btn-user-avatar');
    const dropdownMenu = document.getElementById('profile-dropdown');
    const menuLogin = document.getElementById('menu-login');
    const menuLogout = document.getElementById('menu-logout');
    const menuDaftarku = document.getElementById('menu-daftarku');
    const menuAdmin = document.getElementById('menu-admin');
    
    const displayNameEl = document.getElementById('user-display-name');
    const displayEmailEl = document.getElementById('user-display-email');

    // 1. Toggle Dropdown saat Avatar diklik
    if (avatarBtn) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah event klik menutup dropdown seketika
            if (dropdownMenu.style.display === 'none') {
                dropdownMenu.style.display = 'block';
            } else {
                dropdownMenu.style.display = 'none';
            }
        });
    }

    // Menutup dropdown jika user klik di sembarang tempat (luar dropdown)
    window.addEventListener('click', () => {
        if (dropdownMenu) dropdownMenu.style.display = 'none';
    });
    // Mencegah klik di dalam dropdown menutup dropdown itu sendiri
    if (dropdownMenu) {
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation(); 
        });
    }

    // 2. Pantau Perubahan Status Login
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // USER SEDANG LOGIN
            const userName = user.displayName || user.email.split('@')[0]; // Ambil nama atau potongan email
            
            if(displayNameEl) displayNameEl.innerText = userName;
            if(displayEmailEl) displayEmailEl.innerText = user.email;

            // Tampilkan tombol yang sesuai untuk user login
            if(menuLogin) menuLogin.style.display = 'none';
            if(menuLogout) menuLogout.style.display = 'block';
            if(menuDaftarku) menuDaftarku.style.display = 'block';

            // Ganti ikon avatar menjadi inisial nama
            if(avatarBtn) avatarBtn.innerHTML = `<span style="font-weight: bold; font-size: 14px;">${userName.charAt(0).toUpperCase()}</span>`;
            
            // Cek apakah user admin
            if (user.email === 'admin@vaddstudio.com' || user.email === 'fatkhurohmanofficial@gmail.com') {
                if(menuAdmin) menuAdmin.style.display = 'block';
            }

        } else {
            // USER BELUM LOGIN
            if(displayNameEl) displayNameEl.innerText = 'Guest';
            if(displayEmailEl) displayEmailEl.innerText = 'Silakan Login';

            if(menuLogin) menuLogin.style.display = 'block';
            if(menuLogout) menuLogout.style.display = 'none';
            if(menuDaftarku) menuDaftarku.style.display = 'none';
            if(menuAdmin) menuAdmin.style.display = 'none';

            // Kembalikan ikon default
            if(avatarBtn) avatarBtn.innerHTML = '<i class="fas fa-user"></i>';
        }
    });

    // 3. Logika Eksekusi Logout
    if (menuLogout) {
        menuLogout.addEventListener('click', () => {
            signOut(auth).then(() => {
                // Logout berhasil
                alert("Anda berhasil keluar.");
                if(dropdownMenu) dropdownMenu.style.display = 'none'; // tutup dropdown
                
                // Jika sedang di halaman admin, tendang ke index
                if(window.location.pathname.includes('admin.html')) {
                    window.location.href = 'index.html';
                }
            }).catch((error) => {
                alert("Terjadi kesalahan saat keluar: " + error.message);
            });
        });
    }
}
