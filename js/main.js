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

        // 6. Inisialisasi Daftar Kategori/Genre untuk Sidebar dan Desktop Menu
        await initSidebarGenres();

        // 7. Beri sinyal ke script lokal halaman bahwa layout sudah selesai
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
    
    // ==========================================
    // LOGIKA PENCARIAN (SEARCH BAR)
    // ==========================================
    const btnSearchIcon = document.getElementById('btn-search-icon');
    const searchWrapper = document.getElementById('search-input-wrapper');
    const btnCloseSearch = document.getElementById('btn-close-search');
    const searchInput = document.getElementById('search-input');

    if(btnSearchIcon && searchWrapper && btnCloseSearch && searchInput) {
        // Buka Search Bar
        btnSearchIcon.addEventListener('click', () => {
            searchWrapper.classList.add('active');
            btnSearchIcon.style.opacity = '0';
            setTimeout(() => { searchInput.focus(); }, 300);
        });

        // Tutup Search Bar
        btnCloseSearch.addEventListener('click', () => {
            searchWrapper.classList.remove('active');
            btnSearchIcon.style.opacity = '1';
            searchInput.value = '';
        });

        // Eksekusi Pencarian saat tekan tombol "Enter"
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query !== '') {
                    // Arahkan ke halaman pencarian dengan parameter query
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }        

    // ==========================================
    // LOGIKA SIDEBAR MENU ACTIVE (Otomatis)
    // ==========================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    // Ambil menu link langsung di desktop (mengabaikan dropdown kategori)
    const desktopMenuItems = document.querySelectorAll('.desktop-menu > a'); 
    
    // Ganti class active di Sidebar HP
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });

    // Ganti class active di Menu Desktop (Navbar Atas)
    desktopMenuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
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

// ==========================================
// FUNGSI MEMUAT GENRE KE SIDEBAR & NAVBAR
// ==========================================
async function initSidebarGenres() {
    const sidebarGenreContainer = document.getElementById('sidebar-genre-list');
    const desktopGenreContainer = document.getElementById('desktop-genre-list'); 
    
    if (!sidebarGenreContainer && !desktopGenreContainer) return;

    try {
        const firebaseInit = await import('./firebase-init.js');
        const db = firebaseInit.db;
        
        const firestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const collection = firestore.collection;
        const getDocs = firestore.getDocs;

        // Ambil data genre dari database
        const genresSnap = await getDocs(collection(db, "genres"));
        let genresArray = [];
        
        genresSnap.forEach(doc => {
            const data = doc.data();
            if(data.name) genresArray.push(data.name.trim());
        });

        // Urutkan abjad
        genresArray.sort();
        
        // Bersihkan loading
        if(sidebarGenreContainer) sidebarGenreContainer.innerHTML = '';
        if(desktopGenreContainer) desktopGenreContainer.innerHTML = '';

        if(genresArray.length === 0) {
            const emptyMsg = '<span style="color:#9ca3af; font-size:0.8rem; padding: 10px;">Belum ada kategori.</span>';
            if(sidebarGenreContainer) sidebarGenreContainer.innerHTML = emptyMsg;
            if(desktopGenreContainer) desktopGenreContainer.innerHTML = emptyMsg;
            return;
        }

        // Looping injeksi data ke 2 tempat sekaligus
        genresArray.forEach(genre => {
            const urlSafeGenre = encodeURIComponent(genre);
            const htmlContent = `<a href="search.html?q=${urlSafeGenre}" class="genre-item">${genre}</a>`;
            
            if(sidebarGenreContainer) sidebarGenreContainer.innerHTML += htmlContent;
            if(desktopGenreContainer) desktopGenreContainer.innerHTML += htmlContent;
        });

    } catch (error) {
        console.error("Gagal memuat kategori:", error);
        const errorMsg = '<span style="color:#ef4444; font-size:0.8rem; padding: 10px;">Gagal memuat koneksi.</span>';
        if(sidebarGenreContainer) sidebarGenreContainer.innerHTML = errorMsg;
        if(desktopGenreContainer) desktopGenreContainer.innerHTML = errorMsg;
    }
}
