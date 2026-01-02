// Cek apakah user sudah pernah menyimpan setting custom di storage
const savedBaseApi = localStorage.getItem('custom_base_api');
const savedToken = localStorage.getItem('custom_api_token');

// Jika ada pakai yang di storage, jika tidak pakai default
const BASE_API = savedBaseApi || "http://localhost/desember/10/api.php";
const API_TOKEN = savedToken || "zanhub_55c1f5352da39a629a58e2aeb2fe8c4b";