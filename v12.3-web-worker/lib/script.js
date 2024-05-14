var selectedCollection = ''; // เก็บชื่อ collection ที่เลือก
var dataWorker = new Worker('dataWorker.js');

// สร้างแผนภูมิ MPL_cal เป็นแกน y และ MPL_dis เป็นแกน x
var mplCtx = document.getElementById('mplChart').getContext('2d');
var mplChart = new Chart(mplCtx, {
    type: 'line',
    data: {
        labels: [], // Labels from API
        datasets: [{
            label: 'MPL',
            data: [], // Data from API
            borderColor: 'blue',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        animation: false, // ปิดการใช้งานแอนิเมชัน
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'DIGITIZER SIGNAL' // Label for x-axis
                },
                type: 'linear', // Ensures values are treated as numerical
            },
            y: {
                title: {
                    display: true,
                    text: 'DISTANCE (m)' // Label for y-axis
                },
                type: 'linear', // Ensures values are treated as numerical
                min: 0,
                max:5000
            }
        }
    }
});




// สร้างแผนภูมิ OC_cal เป็นแกน y และ dis เป็นแกน x
var ocCtx = document.getElementById('ocChart').getContext('2d');
var ocChart = new Chart(ocCtx, {
    type: 'line',
    data: {
        labels: [], // Labels from API
        datasets: [{
            label: 'ALiN',
            data: [], // Data from API
            borderColor: 'red',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        animation: false, // ปิดการใช้งานแอนิเมชัน
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'DIGITIZER SIGNAL' // Label for x-axis
                },
                type: 'linear', // Ensures values are treated as numerical
                min: 0
            },
            y: {
                title: {
                    display: true,
                    text: 'DISTANCE (m)' // Label for y-axis
                },
                type: 'linear', // Ensures values are treated as numerical
                min: 0,
                max: 5000
            }
        }
    },
    plugins: {
        zoom: {
            zoom: {
                wheel: {
                    enabled: true,
                },
                pinch: {
                    enabled: true,
                },
                mode: 'xy'
            }
        }
    }
});

function formatDate(timestamp) {
    // Assuming timestamp is in the format "YYYYMMDDHHMM"
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);

    // Format to "YYYY-MM-DD HH:MM"
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

function search1(){
    fetch('http://192.168.2.190:5000/collections/ALiN')
    .then(response => response.json())
    .then(data => {
        const dropdownContent = document.getElementById('dropdownContent');
        dropdownContent.innerHTML = ''; // Clear previous dropdown content

        // Sort data from new to old
        data.sort((a, b) => {
            const timestampA = a.split('_')[1];
            const timestampB = b.split('_')[1];
            return timestampB.localeCompare(timestampA); // Sort in descending order
        });

        // Add sorted data to dropdown and automatically select the latest one
        data.forEach((item, index) => {
            const timestamp = item.split('_')[1];
            const formattedDate = formatDate(timestamp);
            const option = document.createElement('a');
            option.href = '#';
            option.textContent = `ALiN_${formattedDate}`;
            option.onclick = function() {
                selectedCollection = `ALiN_${timestamp}`;
                document.getElementById('collectionName').textContent = 'Data experiment: ' + option.textContent;
                fetchDataAndUpdateChart(selectedCollection);
            };
            dropdownContent.appendChild(option);
            // Automatically click on the first (newest) timestamp
            if (index === 0) { 
                option.click();
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
// }

}

// ฟังก์ชันสำหรับดึงข้อมูล JSON จาก API และอัพเดทแผนภูมิ MPL_cal และ OC_cal
function fetchDataAndUpdateChart(selectedData) {
    const apiUrl = 'http://192.168.2.190:5000/data/ALiN/' + selectedData;
    
    // ส่งคำขอไปยัง Web Worker
    dataWorker.postMessage({ apiUrl });

    dataWorker.onmessage = function(e) {
        const { success, data, error } = e.data;
        if (success) {
            // อัพเดทข้อมูลกราฟ
            updateChartData(data);
        } else {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        }
    };

    dataWorker.onerror = function(error) {
        console.error('Error from worker:', error);
    };
}

function updateChartData(data) {
    // ล้างข้อมูลเก่าในแผนภูมิ
    mplChart.data.labels = [];
    mplChart.data.datasets[0].data = [];
    ocChart.data.labels = [];
    ocChart.data.datasets[0].data = [];
    // ใส่ข้อมูลลงใน labels และ datasets
    data.forEach(item => {
        item.MPL_cal.forEach((value, index) => {
            if (!mplChart.data.labels.includes(value)) {
                mplChart.data.labels.push(value);
            }
            mplChart.data.datasets[0].data.push(item.MPL_dis[index]);
        });
        item.OC_cal.forEach((value, index) => {
            if (!ocChart.data.labels.includes(value)) {
                ocChart.data.labels.push(value);
            }
            ocChart.data.datasets[0].data.push(item.dis[index]);
        });
    });
    // อัพเดทแผนภูมิ
    mplChart.update();
    ocChart.update();
}


function downloadData() {
    if (!selectedCollection) {
        alert('Please select a data collection first.');
        return;
    }

    const apiUrl = 'http://192.168.2.190:5000/data/ALiN/' + selectedCollection;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", selectedCollection + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        })
        .catch(error => {
            console.error('Error downloading data:', error);
            alert('Failed to download data.');
        });
}

function downloadExcel() {
    if (!selectedCollection) {
        alert('Please select a data collection first.');
        return;
    }

    const apiUrl = 'http://192.168.2.190:5000/data/ALiN/' + selectedCollection;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const wb = XLSX.utils.book_new();
            const ws_name = "Data";

            // สร้าง array สำหรับเก็บข้อมูลที่จะแปลงเป็น Excel
            let excelData = [];
            data.forEach((item, index) => {
                item.MPL_cal.forEach((mplCalValue, mplIndex) => {
                    // สร้าง object สำหรับแต่ละแถว
                    let row = excelData[mplIndex] || {};
                    row.MPL_cal = mplCalValue;
                    row.MPL_dis = item.MPL_dis[mplIndex] || null;  // ใช้ || เพื่อใส่ค่าเริ่มต้นเป็น null ถ้าไม่มีข้อมูล
                    excelData[mplIndex] = row;
                });

                item.OC_cal.forEach((ocCalValue, ocIndex) => {
                    let row = excelData[ocIndex] || {};
                    row.OC_cal = ocCalValue;
                    row.OC_dis = item.dis[ocIndex] || null;
                    excelData[ocIndex] = row;
                });
            });

            // สร้าง worksheet จากข้อมูลที่จัดรูปแบบเสร็จแล้ว
            const ws = XLSX.utils.json_to_sheet(excelData);
            XLSX.utils.book_append_sheet(wb, ws, ws_name);

            // สร้างไฟล์ Excel และทำการดาวน์โหลด
            XLSX.writeFile(wb, selectedCollection + ".xlsx");
        })
        .catch(error => {
            console.error('Error downloading data:', error);
            alert('Failed to download data.');
        });
}




// เรียกใช้งานฟังก์ชันค้นหาเมื่อเว็บโหลดเสร็จ
search1();
