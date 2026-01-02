document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  
  if (!query) {
    alert("Query pencarian kosong");
    window.location.href = "index.html";
    return;
  }

  // Set query di input dan header
  document.getElementById("search-input-main").value = query;
  document.getElementById("search-query").textContent = query;
  
  loadSearch(query);
});

async function loadSearch(query) {
  try {
    document.getElementById("loading").style.display = "flex";
    
    const res = await apiRequest({ 
      type: "search",
      q: query
    });
    
    const validData = res.data.filter(item => {
      const hasRealImage = item.image && 
        !item.image.includes("placeholder") && 
        !item.image.includes("via.placeholder.com");
      return hasRealImage;
    });
    
    renderData(validData);
    
  } catch (e) {
    console.error(e);
    alert("Gagal load hasil pencarian: " + (e.message || "Unknown error"));
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
          <span class="badge-custom">${item.badge || "Donghua"}</span>
          <img src="${image}" loading="lazy" alt="${title}">
          <div class="card-overlay">
            <div class="card-title">${title}</div>
          </div>
        </div>
      </div>
    `;
  });
}

function handleSearchMain() {
  const input = document.getElementById("search-input-main");
  const query = input.value.trim();
  
  if (query) {
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
  }
}

function handleSearchEnterMain(event) {
  if (event.key === 'Enter') {
    handleSearchMain();
  }
}

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

// Export ke window agar bisa dipanggil dari HTML
window.handleSearchMain = handleSearchMain;
window.handleSearchEnterMain = handleSearchEnterMain;