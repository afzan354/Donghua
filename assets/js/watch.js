/**
 * watch.js
 * Menangani pemutaran video, sortir server OK.ru, dan pencatatan riwayat.
 */

let currentServers = [];
let currentNavigation = {};
let activeServerIndex = 0;

document.addEventListener("DOMContentLoaded", loadWatch);

async function loadWatch() {
    const loadingEl = document.getElementById("loading");
    const titleEl = document.getElementById("episode-title");

    try {
        // 1. Ambil Parameter URL secepat mungkin
        const urlParams = new URLSearchParams(window.location.search);
        const url = urlParams.get('url');
        
        if (!url) {
            window.location.href = "index.html";
            return;
        }

        const decodedUrl = decodeURIComponent(url);
        const epTitle = extractTitleFromUrl(decodedUrl);
        
        // Update judul di layar segera agar user tidak melihat "Loading..." terlalu lama
        if (titleEl) titleEl.textContent = epTitle;

        // 2. SIMPAN KE RIWAYAT SEGERA (Tanpa Menunggu API)
        // Kita gunakan interval kecil untuk memastikan window.saveToHistory sudah terdefinisi
        let retrySave = 0;
        const saveInterval = setInterval(() => {
            if (typeof window.saveToHistory === "function") {
                window.saveToHistory({
                    title: epTitle,
                    url: window.location.href, // Menggunakan URL saat ini agar klik di riwayat balik ke sini
                    image: localStorage.getItem('last_poster_clicked') || "assets/img/no-image.jpg"
                });
                console.log("✅ Riwayat berhasil dipicu untuk:", epTitle);
                clearInterval(saveInterval);
            } else {
                retrySave++;
                console.log("⏳ Menunggu sidebar.js siap... (percobaan " + retrySave + ")");
                if (retrySave > 10) clearInterval(saveInterval); // Berhenti jika setelah 5 detik tetap gagal
            }
        }, 500);

        // 3. Ambil data dari API untuk Server Video
        const res = await apiRequest({ 
            type: "watch", 
            url: decodedUrl 
        });

        if (!res || res.status !== "ok") {
            throw new Error("Gagal mengambil data dari server");
        }

        // 4. Logika Sortir Server: OK.ru Prioritas Utama
        if (res.servers && res.servers.length > 0) {
            currentServers = res.servers.sort((a, b) => {
                const labelA = (a.label || "").toLowerCase();
                const labelB = (b.label || "").toLowerCase();
                if (labelA.includes("ok.ru")) return -1;
                if (labelB.includes("ok.ru")) return 1;
                return 0;
            });
        }

        currentNavigation = res.navigation || {};
        
        // Render UI
        renderServers();
        renderNavigation();

        // 5. Auto Load Server Pertama (Hasil sortir)
        if (currentServers.length > 0) {
            loadServer(0);
        }

    } catch (e) {
        console.error("Watch Error:", e);
        if (titleEl) titleEl.textContent = "Gagal memuat episode.";
    } finally {
        if (loadingEl) loadingEl.style.display = "none";
    }
}

/**
 * Merender daftar tombol server
 */
function renderServers() {
    const container = document.getElementById("server-buttons");
    if (!container) return;
    
    container.innerHTML = "";

    currentServers.forEach((server, index) => {
        const btn = document.createElement("button");
        btn.className = `server-btn ${index === activeServerIndex ? 'active' : ''}`;
        
        // Membersihkan label (Misal: "OK.ru [Ads]" menjadi "OK.ru")
        const cleanLabel = server.label.split(' [')[0];
        btn.textContent = cleanLabel; 
        
        btn.onclick = () => loadServer(index);
        container.appendChild(btn);
    });
}

/**
 * Memuat URL server ke dalam Iframe
 */
function loadServer(index) {
    if (!currentServers[index]) return;

    activeServerIndex = index;
    const server = currentServers[index];
    const player = document.getElementById("video-player");
    
    if (player) {
        player.src = server.url;
    }

    // Update status tombol aktif
    document.querySelectorAll(".server-btn").forEach((btn, i) => {
        btn.classList.toggle("active", i === index);
    });
    
    console.log("Memutar dari server:", server.label);
}

/**
 * Mengatur tombol navigasi Prev/Next
 */
function renderNavigation() {
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    
    if (btnPrev) btnPrev.disabled = !currentNavigation.prev;
    if (btnNext) btnNext.disabled = !currentNavigation.next;
}

function goToPrev() {
    if (currentNavigation.prev) {
        window.location.href = `watch.html?url=${encodeURIComponent(currentNavigation.prev)}`;
    }
}

function goToNext() {
    if (currentNavigation.next) {
        window.location.href = `watch.html?url=${encodeURIComponent(currentNavigation.next)}`;
    }
}

/**
 * Mengambil judul yang rapi dari string URL
 */
function extractTitleFromUrl(url) {
    try {
        const parts = url.split('/').filter(Boolean).pop();
        return parts
            .replace(/-/g, ' ')
            .replace(/subtitle indonesia/gi, '')
            .trim()
            .replace(/\b\w/g, l => l.toUpperCase());
    } catch (e) {
        return "Streaming Donghua";
    }
}