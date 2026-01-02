// Global state untuk pagination
let currentPage = 1;
let paginationData = null;

document.addEventListener("DOMContentLoaded", () => {
  // Cek apakah ada parameter page di URL
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  
  if (pageParam) {
    currentPage = parseInt(pageParam) || 1;
  }
  
  loadHome(currentPage);
});

async function loadHome(page = 1) {
  try {
    // Tampilkan loading
    const loadingElem = document.getElementById("loading");
    if (loadingElem) loadingElem.style.display = "flex";
    
    // Request ke API dengan parameter page
    const res = await apiRequest({ 
      type: "home",
      page: page 
    });
    
    // Simpan data pagination
    paginationData = res.pagination || null;
    currentPage = page;
    
    // Update URL tanpa reload halaman
    updateURLWithoutReload(page);
    
    // KEAMANAN DATA: Pastikan res.data ada sebelum difilter
    const rawData = (res && res.data) ? res.data : [];
    
    // FILTER DATA YANG VALID
    const validData = rawData.filter(item => {
      // Pastikan item tidak null dan punya image
      if (!item || !item.image) return false;

      const hasRealImage = !item.image.includes("placeholder") && 
                           !item.image.includes("via.placeholder.com");
      
      // Kembalikan true jika ada gambar asli
      return hasRealImage;
    });
    
    renderHome(validData);
    renderPagination();
    
    // Scroll ke atas setelah load halaman baru
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (e) {
    console.error("Error loading home:", e);
    // Jika gagal, render list kosong agar UI tidak rusak
    renderHome([]);
    alert("Gagal load data: " + (e.message || "Periksa koneksi internet Anda"));
  } finally {
    const loadingElem = document.getElementById("loading");
    if (loadingElem) loadingElem.style.display = "none";
  }
}

function renderHome(data) {
  const list = document.getElementById("donghua-list");
  const empty = document.getElementById("empty");
  if (!list) return;

  list.innerHTML = "";
  
  if (!data || data.length === 0) {
    if (empty) empty.classList.remove("d-none");
    return;
  }
  
  if (empty) empty.classList.add("d-none");
  
  data.forEach(item => {
    const image = item.image;
    const title = (item.title && item.title.trim() !== "") 
                  ? item.title 
                  : extractTitleFromUrl(item.url);
    const badge = item.badge || "Donghua";
    
    // Mengirim data lengkap ke openItem agar bisa disimpan ke riwayat
    list.innerHTML += `
      <div class="col-6">
        <div class="card-donghua" onclick="openItem('${encodeURIComponent(item.url)}', '${title.replace(/'/g, "\\'")}', '${image}', '${badge}')">
          <span class="badge-custom">${badge}</span>
          <div class="img-container">
            <img src="${image}" loading="lazy" alt="${title}">
          </div>
          <div class="card-overlay">
            <div class="card-title">${title}</div>
          </div>
        </div>
      </div>
    `;
  });
}

function renderPagination() {
  const paginationContainer = document.getElementById("pagination-container");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const currentPageSpan = document.getElementById("current-page");
  const totalPagesText = document.getElementById("total-pages-text");
  
  if (!paginationData || !paginationContainer) {
    if (paginationContainer) paginationContainer.style.display = "none";
    return;
  }
  
  paginationContainer.style.display = "flex";
  if (currentPageSpan) currentPageSpan.textContent = paginationData.current_page;
  
  if (totalPagesText) {
    totalPagesText.textContent = paginationData.total_pages ? ` of ${paginationData.total_pages}` : "";
  }
  
  if (btnPrev) btnPrev.disabled = !paginationData.has_previous;
  if (btnNext) btnNext.disabled = !paginationData.has_next;
}

function goToPrevPage() {
  if (paginationData && paginationData.has_previous) {
    loadHome(paginationData.previous_page);
  }
}

function goToNextPage() {
  if (paginationData && paginationData.has_next) {
    loadHome(paginationData.next_page);
  }
}

function updateURLWithoutReload(page) {
  const newUrl = page > 1 
    ? `${window.location.pathname}?page=${page}` 
    : window.location.pathname;
  window.history.pushState({ page: page }, '', newUrl);
}

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.page) {
    loadHome(event.state.page);
  } else {
    loadHome(1);
  }
});

/**
 * Membuka item dan menyimpan ke riwayat lokal
 */
function openItem(url, title, image, badge) {
  const decodedUrl = decodeURIComponent(url);
  
  // Simpan gambar sementara agar watch.js bisa mengambilnya jika API watch tidak sedia gambar
  if (image) localStorage.setItem('last_poster_clicked', image);

  if (window.saveToHistory) {
    window.saveToHistory({
      url: decodedUrl,
      title: title,
      image: image,
      badge: badge
    });
  }
  
  // Sisa kodingan pindah halaman...
  if (isEpisodeUrl(decodedUrl)) {
    location.href = `watch.html?url=${url}`;
  } else {
    location.href = `detail.html?url=${url}`;
  }
}

function isEpisodeUrl(url) {
  return url.toLowerCase().includes('episode');
}

function extractTitleFromUrl(url) {
  if (!url) return "Donghua Episode";
  return decodeURIComponent(
    url.split("/")
      .filter(Boolean)
      .pop()
      .replace(/-/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase())
  );
}