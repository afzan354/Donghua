/**
 * genre.js - Optimized for Performance
 */

document.addEventListener("DOMContentLoaded", () => {
    fetchGenresFromServer();
});

async function fetchGenresFromServer() {
    const container = document.getElementById("genre-container");
    const loader = document.getElementById("loading-state");
    const errorContainer = document.getElementById("error-container");
    const errorText = document.getElementById("error-text");

    // Reset view
    if (loader) loader.classList.remove("d-none");
    if (errorContainer) errorContainer.classList.add("d-none");
    if (container) container.innerHTML = "";

    try {
        const response = await apiRequest({
            type: "genres"
        });

        // Pastikan response dan data ada
        if (response && response.data) {
            const allData = response.data;
            
            // Filter Duplikat dengan Map (Lebih cepat dari loop biasa)
            const uniqueMap = new Map();
            allData.forEach(item => {
                if (item.name && item.slug) {
                    const cleanName = item.name.trim();
                    uniqueMap.set(cleanName.toLowerCase(), {
                        name: cleanName,
                        slug: item.slug
                    });
                }
            });

            // Sembunyikan loading
            if (loader) loader.classList.add("d-none");

            if (uniqueMap.size > 0) {
                // Buat fragment untuk performa (render sekaligus)
                const fragment = document.createDocumentFragment();
                
                uniqueMap.forEach(genre => {
                    const btn = document.createElement("a");
                    btn.className = "genre-btn";
                    btn.textContent = genre.name;
                    
                    // Navigasi ke list genre
                    btn.href = `genre-list.html?genre=${encodeURIComponent(genre.slug)}&name=${encodeURIComponent(genre.name)}`;
                    
                    fragment.appendChild(btn);
                });

                container.appendChild(fragment);
            } else {
                showError("Tidak ada kategori yang ditemukan.");
            }

        } else {
            showError("Server mengirimkan data kosong.");
        }
    } catch (error) {
        console.error("Genre Error:", error);
        showError("Koneksi gagal: " + (error.message || "Timeout"));
    }
}

function showError(msg) {
    const loader = document.getElementById("loading-state");
    const errorContainer = document.getElementById("error-container");
    const errorText = document.getElementById("error-text");

    if (loader) loader.classList.add("d-none");
    if (errorContainer) {
        errorContainer.classList.remove("d-none");
        errorText.textContent = msg;
    }
}