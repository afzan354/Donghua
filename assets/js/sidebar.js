/**
 * Sidebar & History Logic Component
 * Versi Lengkap: Menu + Genre + History + Settings + Close Button
 */

document.addEventListener("DOMContentLoaded", () => {
    const sidebarContainer = document.getElementById("sidebar-container");
    if (sidebarContainer) {
        loadSidebar();
    }
});

function loadSidebar() {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    const currentPage = getCurrentPage();

    container.innerHTML = `
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="header-brand">
          <span class="brand-icon">🎬</span>
          <h2>Menu Utama</h2>
        </div>
        <button class="close-sidebar" onclick="toggleSidebar()" aria-label="Close Menu">✕</button>
      </div>
      
      <nav class="sidebar-nav">
        <a href="index.html" class="sidebar-link ${currentPage === 'home' ? 'active' : ''}">
          <span class="sidebar-icon">🏠</span>
          <span class="sidebar-text">Home</span>
        </a>
        
        <a href="ongoing.html" class="sidebar-link ${currentPage === 'ongoing' ? 'active' : ''}">
          <span class="sidebar-icon">🔥</span>
          <span class="sidebar-text">Ongoing</span>
        </a>
        
        <a href="completed.html" class="sidebar-link ${currentPage === 'completed' ? 'active' : ''}">
          <span class="sidebar-icon">✅</span>
          <span class="sidebar-text">Completed</span>
        </a>

        <a href="genre.html" class="sidebar-link ${currentPage === 'genre' || currentPage === 'genre-list' ? 'active' : ''}">
          <span class="sidebar-icon">📂</span>
          <span class="sidebar-text">Genre / Kategori</span>
        </a>
        
        <a href="schedule.html" class="sidebar-link ${currentPage === 'schedule' ? 'active' : ''}">
          <span class="sidebar-icon">📅</span>
          <span class="sidebar-text">Jadwal Rilis</span>
        </a>

        <a href="history.html" class="sidebar-link ${currentPage === 'history' ? 'active' : ''}">
          <span class="sidebar-icon">🕒</span>
          <span class="sidebar-text">Riwayat Tonton</span>
        </a>
        
        <div class="sidebar-divider"></div>

        <a href="settings.html" class="sidebar-link ${currentPage === 'settings' ? 'active' : ''}">
          <span class="sidebar-icon">⚙️</span>
          <span class="sidebar-text">Pengaturan</span>
        </a>
        
        <div class="sidebar-divider"></div>
        
        <div class="sidebar-search">
          <input 
            type="text" 
            id="sidebar-search-input" 
            placeholder="Cari donghua..." 
            class="search-input-sidebar"
            onkeypress="handleSidebarSearchEnter(event)"
          >
          <button onclick="handleSidebarSearch()" class="search-btn-sidebar">🔍</button>
        </div>
      </nav>

      <div class="sidebar-footer">
        <p>Donghua Stream v1.0.0</p>
      </div>
    </div>

    <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
    `;

    injectSidebarStyles();
}

/**
 * FUNGSI SIMPAN RIWAYAT
 * Dipanggil dari home.js saat item diklik
 */
// Di dalam assets/js/sidebar.js


// Pastikan fungsi ini didefinisikan secara global dan langsung
window.saveToHistory = function(item) {
    console.log("Memulai proses simpan riwayat..."); // Pesan ini harus muncul di Console (F12)
    
    if (!item || !item.url) return;

    try {
        let history = JSON.parse(localStorage.getItem('donghua_history')) || [];
        
        // Bersihkan data lama dengan judul yang sama agar tidak duplikat
        const baseTitle = item.title.split(" Episode")[0];
        history = history.filter(h => !h.title.includes(baseTitle));

        // Tambahkan data baru ke urutan paling atas
        history.unshift({
            title: item.title,
            url: item.url,
            image: item.image || "assets/img/no-image.jpg",
            episode: item.title.match(/Episode\s*\d+/i) ? item.title.match(/Episode\s*\d+/i)[0] : "",
            time: new Date().getTime()
        });

        // Simpan maksimal 30
        if (history.length > 30) history.pop();

        localStorage.setItem('donghua_history', JSON.stringify(history));
        console.log("✅ Berhasil menyimpan riwayat:", item.title);
    } catch (e) {
        console.error("❌ Gagal simpan ke LocalStorage:", e);
    }
};

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    if (page === 'index' || page === '') return 'home';
    return page;
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    }
}

function handleSidebarSearch() {
    const input = document.getElementById("sidebar-search-input");
    const query = input.value.trim();
    if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

function handleSidebarSearchEnter(event) {
    if (event.key === 'Enter') {
        handleSidebarSearch();
    }
}

function injectSidebarStyles() {
    if (document.getElementById('sidebar-styles')) return;

    const style = document.createElement('style');
    style.id = 'sidebar-styles';
    style.textContent = `
        /* GAYA TOMBOL MENU (HAMBURGER) */
        .hamburger-btn {
            background: rgba(255, 255, 255, 0.15) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            color: #fff !important;
            padding: 8px 16px !important;
            border-radius: 10px !important;
            cursor: pointer !important;
            font-size: 0.9rem !important;
            font-weight: 600 !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            transition: all 0.2s ease !important;
            outline: none !important;
        }
        .hamburger-btn:active { transform: scale(0.95); background: rgba(255,255,255,0.25) !important; }

        /* CORE SIDEBAR */
        .sidebar {
            position: fixed; top: 0; left: -300px; width: 300px; height: 100vh;
            background: #1a1a2e !important; z-index: 10000;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; flex-direction: column; box-shadow: 5px 0 25px rgba(0, 0, 0, 0.5);
            text-align: left;
        }
        .sidebar.active { left: 0; }

        .sidebar-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); z-index: 9999;
            opacity: 0; visibility: hidden; transition: all 0.3s ease;
        }
        .sidebar-overlay.active { opacity: 1; visibility: visible; }

        .sidebar-header {
            padding: 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex; justify-content: space-between; align-items: center; color: white;
        }
        .header-brand h2 { font-size: 1.1rem !important; margin: 0 !important; font-weight: 700 !important; color: white !important; }
        
        .close-sidebar {
            background: rgba(255, 255, 255, 0.2); border: none; color: white;
            width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }

        .sidebar-nav { flex: 1; padding: 15px 0; overflow-y: auto; }
        .sidebar-link {
            display: flex !important; align-items: center !important; gap: 15px !important;
            padding: 12px 20px !important; color: rgba(255, 255, 255, 0.8) !important;
            text-decoration: none !important; border-left: 4px solid transparent; transition: 0.2s;
        }
        .sidebar-link.active, .sidebar-link:hover {
            background: rgba(255, 255, 255, 0.05); color: #ffd93d !important; border-left-color: #ff6b6b;
        }
        .sidebar-icon { font-size: 1.2rem; width: 25px; text-align: center; }
        .sidebar-text { font-size: 1rem; font-weight: 500; }

        .sidebar-divider { height: 1px; background: rgba(255, 255, 255, 0.1); margin: 10px 20px; }

        .sidebar-search { padding: 10px 20px; display: flex; gap: 8px; }
        .search-input-sidebar {
            flex: 1; padding: 10px; background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; outline: none;
        }
        .search-btn-sidebar { padding: 10px; background: #ff6b6b; border: none; border-radius: 8px; color: white; cursor: pointer; }

        .sidebar-footer { padding: 15px; text-align: center; color: rgba(255,255,255,0.2); font-size: 0.8rem; }
        
        body.sidebar-open { overflow: hidden; }

        @media (max-width: 480px) {
            .sidebar { width: 85%; left: -85%; }
        }
    `;
    document.head.appendChild(style);
}

// Export functions
window.toggleSidebar = toggleSidebar;
window.handleSidebarSearch = handleSidebarSearch;
window.handleSidebarSearchEnter = handleSidebarSearchEnter;