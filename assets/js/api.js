async function apiRequest(params = {}) {
  // 1. Konfigurasi Cache
  const CACHE_DURATION = 15 * 60 * 1000; // 15 Menit dalam milidetik
  
  // Tentukan tipe apa saja yang boleh disimpan (Home, Ongoing, Genre, dll)
  // Search dan Watch tidak disimpan agar data selalu fresh
  const cacheableTypes = ["home", "ongoing", "completed", "genres", "genre_detail"];
  const isCacheable = cacheableTypes.includes(params.type);

  // Buat Key unik untuk setiap request berdasarkan parameter
  const cacheKey = `cache_${params.type}_${params.url || ''}_${params.page || ''}`;

  // 2. Cek apakah ada data di Cache
  if (isCacheable) {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsedCache = JSON.parse(cachedData);
        const now = new Date().getTime();

        // Jika usia cache belum mencapai 15 menit, gunakan data cache
        if (now - parsedCache.timestamp < CACHE_DURATION) {
          console.log(`🚀 Mengambil dari Cache [${params.type}]`);
          return parsedCache.data;
        }
      } catch (e) {
        console.error("Cache Parse Error", e);
      }
    }
  }

  // 3. Jika tidak ada cache atau cache basi, panggil API
  params.token = API_TOKEN;
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_API}?${query}`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-API-KEY": API_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error("API Error");
    }

    const result = await response.json();

    // 4. Simpan ke Cache jika request berhasil dan diizinkan
    if (isCacheable && result.status === "ok") {
      const cachePayload = {
        timestamp: new Date().getTime(),
        data: result
      };
      localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
      console.log(`💾 Menyimpan ke Cache [${params.type}]`);
    }

    return result;

  } catch (error) {
    console.error("Request Error:", error);
    throw error;
  }
}

/**
 * Fungsi tambahan untuk membersihkan cache yang sudah tua (opsional)
 * Menghapus cache yang sudah lebih dari 24 jam agar penyimpanan tidak penuh
 */
function clearOldCaches() {
  const now = new Date().getTime();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("cache_")) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (now - item.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key);
        }
      } catch (e) {}
    }
  }
}

// Jalankan pembersihan saat file di-load
clearOldCaches();

// Fungsi untuk menghapus semua cache API secara manual
window.forceClearAPICache = function() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("cache_")) {
            localStorage.removeItem(key);
            count++;
            i--; // Reset index karena item dihapus
        }
    }
    console.log(`🧹 ${count} data cache telah dibersihkan.`);
    return count;
};