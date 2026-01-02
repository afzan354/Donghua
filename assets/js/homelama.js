document.addEventListener("DOMContentLoaded", loadHome);

async function loadHome() {
  try {
    const res = await apiRequest({ type: "home" });
    
    // FILTER DATA YANG VALID UNTUK DITAMPILKAN
    // Hanya tampilkan yang punya gambar asli (bukan placeholder) DAN ada title
    const validData = res.data.filter(item => {
      const hasRealImage = item.image && 
      !item.image.includes("placeholder") && 
      !item.image.includes("via.placeholder.com");
      const hasTitle = item.title && item.title.trim() !== "";
      
      // Harus punya gambar asli, title boleh kosong karena bisa extract dari URL
      return hasRealImage;
    });
    
    renderHome(validData);
  } catch (e) {
    console.error(e);
    alert("Gagal load data");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function renderHome(data) {
  const list = document.getElementById("donghua-list");
  const empty = document.getElementById("empty");
  list.innerHTML = "";
  
  if (data.length === 0) {
    empty.classList.remove("d-none");
    return;
  }
  
  data.forEach(item => {
    // Gambar sudah pasti ada karena sudah difilter
    const image = item.image;
    
    // Jika title kosong, extract dari URL
    const title = item.title && item.title.trim() !== ""
    ? item.title
    : extractTitleFromUrl(item.url);
    
    list.innerHTML += `
      <div class="col-6">
        <div class="card-donghua" onclick="openDetail('${encodeURIComponent(item.url)}')">
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

function openDetail(url) {
  location.href = `detail.html?url=${url}`;
}

// BUAT JUDUL DARI URL (UNTUK EPISODE)
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