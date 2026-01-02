let currentPage = 1;
let paginationData = null;
let currentGenre = "";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentGenre = urlParams.get('genre'); // Mengambil slug genre
  const genreName = urlParams.get('name'); // Mengambil nama genre untuk judul
  const pageParam = urlParams.get('page');
  
  if (genreName) {
    document.getElementById("genre-title").textContent = `Genre: ${genreName}`;
  }
  
  if (pageParam) {
    currentPage = parseInt(pageParam) || 1;
  }
  
  if (currentGenre) {
    loadGenreList(currentGenre, currentPage);
  } else {
    location.href = 'genre.html'; // Balikkan jika tidak ada genre
  }
});

async function loadGenreList(genre, page = 1) {
  try {
    document.getElementById("loading").style.display = "flex";
    
    // Request ke API sesuai format baru kamu
    const res = await apiRequest({ 
      type: "genre",
      genre: genre,
      page: page 
    });
    
    paginationData = res.pagination || null;
    currentPage = page;
    
    updateURLWithoutReload(genre, page);
    
    // Filter data (Sama dengan home.js kamu)
    const validData = res.data.filter(item => {
      return item.image && !item.image.includes("placeholder");
    });
    
    renderGenreList(validData);
    renderPagination();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (e) {
    console.error(e);
    alert("Gagal load genre: " + (e.message || "Unknown error"));
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function renderGenreList(data) {
  const list = document.getElementById("donghua-list");
  const empty = document.getElementById("empty");
  list.innerHTML = "";
  
  if (!data || data.length === 0) {
    empty.classList.remove("d-none");
    return;
  }
  
  empty.classList.add("d-none");
  
  data.forEach(item => {
    // Gunakan Title dari API, jika kosong extract dari URL
    const title = item.title && item.title.trim() !== "" 
                  ? item.title 
                  : extractTitleFromUrl(item.url);
    
    list.innerHTML += `
      <div class="col-6">
        <div class="card-donghua" onclick="openItem('${encodeURIComponent(item.url)}')">
          <span class="badge-custom">${item.badge || "Donghua"}</span>
          <img src="${item.image}" loading="lazy" alt="${title}">
          <div class="card-overlay">
            <div class="card-title">${title}</div>
          </div>
        </div>
      </div>
    `;
  });
}

// Logika Pagination (Sama dengan home.js kamu)
function renderPagination() {
  const paginationContainer = document.getElementById("pagination-container");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const currentPageSpan = document.getElementById("current-page");
  const totalPagesText = document.getElementById("total-pages-text");
  
  if (!paginationData) {
    paginationContainer.style.display = "none";
    return;
  }
  
  paginationContainer.style.display = "flex";
  currentPageSpan.textContent = paginationData.current_page;
  
  if (paginationData.total_pages) {
    totalPagesText.textContent = ` of ${paginationData.total_pages}`;
  }
  
  btnPrev.disabled = !paginationData.has_previous;
  btnNext.disabled = !paginationData.has_next;
}

function goToPrevPage() {
  if (paginationData && paginationData.has_previous) {
    loadGenreList(currentGenre, paginationData.previous_page);
  }
}

function goToNextPage() {
  if (paginationData && paginationData.has_next) {
    loadGenreList(currentGenre, paginationData.next_page);
  }
}

function updateURLWithoutReload(genre, page) {
  const newUrl = `${window.location.pathname}?genre=${genre}&page=${page}`;
  window.history.pushState({ genre: genre, page: page }, '', newUrl);
}

function openItem(url) {
  const decodedUrl = decodeURIComponent(url);
  location.href = `detail.html?url=${encodeURIComponent(decodedUrl)}`;
}

function extractTitleFromUrl(url) {
  if (!url) return "Donghua";
  const slug = url.split("/").filter(Boolean).pop();
  return slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}