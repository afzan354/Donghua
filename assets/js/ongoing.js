// Global state untuk pagination
let currentPage = 1;
let paginationData = null;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  
  if (pageParam) {
    currentPage = parseInt(pageParam) || 1;
  }
  
  loadOngoing(currentPage);
});

async function loadOngoing(page = 1) {
  try {
    document.getElementById("loading").style.display = "flex";
    
    const res = await apiRequest({ 
      type: "ongoing",
      page: page 
    });
    
    paginationData = res.pagination || null;
    currentPage = page;
    
    updateURLWithoutReload(page);
    
    const validData = res.data.filter(item => {
      const hasRealImage = item.image && 
        !item.image.includes("placeholder") && 
        !item.image.includes("via.placeholder.com");
      return hasRealImage;
    });
    
    renderData(validData);
    renderPagination();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (e) {
    console.error(e);
    alert("Gagal load data: " + (e.message || "Unknown error"));
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function renderData(data) {
  const list = document.getElementById("donghua-list");
  const empty = document.getElementById("empty");
  list.innerHTML = "";
  
  if (data.length === 0) {
    empty.classList.remove("d-none");
    return;
  }
  
  empty.classList.add("d-none");
  
  data.forEach(item => {
    const image = item.image;
    const title = item.title && item.title.trim() !== ""
      ? item.title
      : extractTitleFromUrl(item.url);
    
    list.innerHTML += `
      <div class="col-6">
        <div class="card-donghua" onclick="openItem('${encodeURIComponent(item.url)}')">
          <span class="badge-custom">${item.badge || "Ongoing"}</span>
          <img src="${image}" loading="lazy" alt="${title}">
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
  
  if (!paginationData) {
    paginationContainer.style.display = "none";
    return;
  }
  
  paginationContainer.style.display = "flex";
  currentPageSpan.textContent = paginationData.current_page;
  
  if (paginationData.total_pages) {
    totalPagesText.textContent = ` of ${paginationData.total_pages}`;
  } else {
    totalPagesText.textContent = "";
  }
  
  btnPrev.disabled = !paginationData.has_previous;
  btnNext.disabled = !paginationData.has_next;
}

function goToPrevPage() {
  if (paginationData && paginationData.has_previous) {
    loadOngoing(paginationData.previous_page);
  }
}

function goToNextPage() {
  if (paginationData && paginationData.has_next) {
    loadOngoing(paginationData.next_page);
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
    loadOngoing(event.state.page);
  } else {
    loadOngoing(1);
  }
});

function openItem(url) {
  const decodedUrl = decodeURIComponent(url);
  
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
  if (!url) return "Donghua";
  
  return decodeURIComponent(
    url.split("/")
      .filter(Boolean)
      .pop()
      .replace(/-/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase())
  );
}