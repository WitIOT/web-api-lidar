// dataWorker.js
self.onmessage = function(e) {
    // รับ URL และ parameters จากหน้าหลัก
    const { apiUrl } = e.data;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // ส่งข้อมูลกลับไปยังหน้าหลัก
            self.postMessage({ success: true, data: data });
        })
        .catch(error => {
            // ส่งข้อผิดพลาดกลับไปหาหน้าหลัก
            self.postMessage({ success: false, error: error.message });
        });
}
