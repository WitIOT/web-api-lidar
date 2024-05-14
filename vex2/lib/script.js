var selectedCollection = ''; // เก็บชื่อ collection ที่เลือก
let ocDisValues = [];
let ocCalValues = [];


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
                // fetchDataAndUpdateChart(selectedCollection);
                // เรียกใช้ฟังก์ชั่นดึงข้อมูลและอัปเดตแผนภูมิ
                fetchData(selectedCollection,updateChart);

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

function fetchData(selectedData, callback) {
    fetch(`http://192.168.2.190:5000/data/ALiN/${selectedData}`)
        .then(response => response.json())
        .then(data => {
            const mplCalValues = [];
            const mplDisValues = [];
            const ocCalValues = [];
            const ocDisValues = [];

            data.forEach(item => {
                item.MPL_cal.forEach((value, index) => {
                    let mplDisValue = item.MPL_dis[index];
                    // Ensure MPL_dis value is between 0 and 5000
                    if (mplDisValue >= 0 && mplDisValue <= 5000) {
                        mplCalValues.push(value);
                        mplDisValues.push(mplDisValue);
                    }
                });
                item.OC_cal.forEach((value, index) => {
                    let ocDisValue = item.dis[index];
                    // Optionally apply the same filter for OC data if needed
                    if (ocDisValue >= 0 && ocDisValue <= 5000) {
                        ocCalValues.push(value);
                        ocDisValues.push(ocDisValue);
                    }
                });
            });

            // callback(mplCalValues, mplDisValues, ocCalValues, ocDisValues);
            renderZoomableChart(ocCalValues, ocDisValues);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function renderZoomableChart(ocCalValues, ocDisValues) {
    const ctx = document.getElementById('chart-container').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ocCalValues.map(value => value.toString()),
            datasets: [{
                label: 'Distance',
                data: ocDisValues,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'DIGITIZER SIGNEL' // ชื่อแกน X
                        },
                        min: 0
                    },
                    y: {
                        type: 'linear',
                        beginAtZero: true, // ตั้งค่าให้แกน Y เริ่มที่ 0
                        title: {
                            display: true,
                            text: 'Distance (m)' // ชื่อแกน Y
                        },
                        min: 0,
                        max: 5000
                    }
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                    }
                }
            }
        }
    });
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
// เรียกใช้ฟังก์ชั่นดึงข้อมูลและอัปเดตแผนภูมิ

