/**
 * detail.js - Final Optimized Version
 * Fitur: Auto-filter rekomendasi, clean parsing, dan error handling.
 */

document.addEventListener("DOMContentLoaded", () => {
    loadDetail();
});

async function loadDetail() {
    const params = new URLSearchParams(location.search);
    const url = params.get("url");

    if (!url) {
        showError("URL anime tidak ditemukan.");
        return;
    }

    const decodedUrl = decodeURIComponent(url);
    showLoading(true);

    try {
        // Memanggil fungsi apiRequest dari api.js
        const res = await apiRequest({
            type: "detail",
            url: decodedUrl
        });

        if (res && res.status === "ok") {
            displayAnimeDetail(res);
            renderEpisodes(res.episodes || []);
        } else {
            showError("Gagal mengambil data dari server.");
        }
    } catch (error) {
        console.error("Error loading detail:", error);
        showError("Terjadi kesalahan koneksi.");
    } finally {
        showLoading(false);
    }
}

/**
 * Menampilkan Informasi Utama Donghua
 */
function displayAnimeDetail(data) {
    const titleElement = document.getElementById("title");
    const posterImg = document.getElementById("poster-img");
    const descElement = document.getElementById("description");

    if (titleElement) titleElement.textContent = data.title || "Judul Tidak Tersedia";
    
    if (posterImg) {
        posterImg.src = data.image || "assets/img/no-image.jpg";
        posterImg.onerror = () => { posterImg.src = "assets/img/no-image.jpg"; };
    }

    if (descElement) {
        descElement.textContent = data.description || "Deskripsi tidak tersedia.";
    }

    document.title = `${data.title || "Detail"} - Donghua Stream`;
}

/**
 * Merender Daftar Episode dengan Filter Tanggal yang Ketat
 */
function renderEpisodes(episodes) {
    const listElement = document.getElementById("episodes-list");
    const emptyElement = document.getElementById("empty-episodes");

    if (!listElement) return;
    listElement.innerHTML = "";

    // Regex untuk mendeteksi tanggal rilis (Contoh: "December 28, 2025")
    const dateRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i;

    // FILTER: Hanya ambil episode yang memiliki string tanggal di teksnya
    // Ini akan membuang donghua rekomendasi yang tercampur di JSON
    const validEpisodes = episodes.filter(ep => {
        return ep.text && dateRegex.test(ep.text);
    });

    if (validEpisodes.length === 0) {
        if (emptyElement) emptyElement.style.display = "block";
        return;
    }

    if (emptyElement) emptyElement.style.display = "none";

    // Loop data yang sudah bersih
    validEpisodes.forEach(ep => {
        const parsed = parseEpisodeText(ep.text);
        
        const card = document.createElement("div");
        card.className = "episode-card";
        card.innerHTML = `
            <div class="episode-number">${parsed.number}</div>
            ${parsed.date ? `<div class="episode-date">${parsed.date}</div>` : ''}
        `;
        
        card.onclick = () => {
            // Mengirim URL ke halaman watch.html
            window.location.href = `watch.html?url=${encodeURIComponent(ep.url)}&title=${encodeURIComponent(parsed.number)}`;
        };
        
        listElement.appendChild(card);
    });
}

/**
 * Membersihkan dan memisahkan Nomor Episode dan Tanggal
 */
function parseEpisodeText(rawText) {
    if (!rawText) return { number: "Eps ??", date: "" };

    // Bersihkan karakter newline dan spasi berlebih
    const cleanText = rawText.replace(/\r/g, "").trim();
    const parts = cleanText.split("\n").map(p => p.trim()).filter(p => p);

    // 1. Ekstrak Tanggal
    let dateStr = "";
    const dateRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i;
    const dateMatch = cleanText.match(dateRegex);
    if (dateMatch) {
        dateStr = dateMatch[0];
    }

    // 2. Ekstrak Label Episode
    // Pada JSON kamu, baris pertama (parts[0]) biasanya adalah angka episode murni "02" atau "01"
    let epLabel = parts[0]; 

    if (/^\d+$/.test(epLabel)) {
        epLabel = `Episode ${epLabel}`;
    } else if (epLabel.length > 20) {
        // Jika baris pertama terlalu panjang, coba cari pola "Episode XX" di seluruh teks
        const match = cleanText.match(/Episode\s*(\d+)/i);
        epLabel = match ? `Episode ${match[1]}` : "Lihat Video";
    }

    return {
        number: epLabel,
        date: dateStr
    };
}

function showLoading(show) {
    const loader = document.getElementById("loading");
    if (loader) loader.style.display = show ? "flex" : "none";
}

function showError(message) {
    const descElement = document.getElementById("description");
    if (descElement) {
        descElement.innerHTML = `<div style="color: #ff6b6b; font-weight: bold;">⚠️ ${message}</div>`;
    }
}