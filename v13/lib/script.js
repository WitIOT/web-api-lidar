var selectedCollection = ''; // เก็บชื่อ collection ที่เลือก
let ocDisValues = [];
let ocCalValues = [];

document.addEventListener('DOMContentLoaded', function() {
    var ctx = document.getElementById('newChart').getContext('2d');
    window.newChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],  // ค่าเริ่มต้นเป็นอาร์เรย์ว่าง
            datasets: [{
                label: 'ALiN',
                data: [],  // ค่าเริ่มต้นเป็นอาร์เรย์ว่าง
                borderColor: 'red',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Calibrated Values'
                    }
                },
                y: {
                    type: 'linear',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Distance Values (m)'
                    }
                }
            }
        }
    });
});

// ใช้ฟังก์ชั่น updateChart สำหรับการอัปเดตข้อมูลแผนภูมิ
function updateChart(calValues, disValues) {
    newChart.data.labels = calValues;
    newChart.data.datasets[0].data = disValues;
    newChart.update();
}

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
                fetchData(selectedCollection, updateChart);

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

// function fetchDataAndUpdateChart(selectedData) {
//     fetch(`http://192.168.2.190:5000/data/ALiN/${selectedData}`)
//         .then(response => response.json())
//         .then(data => {
//             combinedChart.data.labels = [];
//             combinedChart.data.datasets[0].data = [];
//             combinedChart.data.datasets[1].data = [];
            
//             data.forEach(item => {
//                 item.MPL_cal.forEach((value, index) => {
//                     combinedChart.data.labels.push(value);
//                     combinedChart.data.datasets[0].data.push(item.MPL_dis[index]);
//                 });
//                 item.OC_cal.forEach((value, index) => {
//                     if (!combinedChart.data.labels.includes(value)) {
//                         combinedChart.data.labels.push(value);
//                     }
//                     combinedChart.data.datasets[1].data.push(item.dis[index]);
//                 });

//                 // Ensure each data set starts at zero if not already
//                 if (combinedChart.data.datasets[1].data[0] !== 0) {
//                     combinedChart.data.datasets[1].data.unshift(0); // Add a zero at the start
//                     combinedChart.data.labels.unshift(combinedChart.data.labels[0] - 1); // Adjust labels accordingly
//                 }
//             });

//             // Update the x-axis to accommodate all data
//             combinedChart.options.scales.x.min = Math.min(...combinedChart.data.labels);
//             combinedChart.options.scales.x.max = Math.max(...combinedChart.data.labels);

//             combinedChart.update();
//         })
//         .catch(error => console.error('Error fetching data:', error));
// }


function fetchData(selectedData, callback) {
    fetch(`http://192.168.2.190:5000/data/ALiN/${selectedData}`)
        .then(response => response.json())
        .then(data => {
            const calValues = [];
            const disValues = [];

            data.forEach(item => {
                item.OC_cal.forEach((value, index) => {
                    let disValue = item.dis[index];
                    if (value > 0 && disValue > 0 && disValue <= 5000) {
                        calValues.push(value);
                        disValues.push(disValue);
                    }
                    // calValues.push(value);
                    // disValues.push(disValue);
                });
            });

            callback(calValues, disValues); // ส่งข้อมูลไปยังฟังก์ชั่นอัปเดตแผนภูมิ
        })
        .catch(error => console.error('Error fetching data:', error));
}


function updateChart(calValues, disValues) {
    // ตรวจสอบว่ามีชุดข้อมูลในแผนภูมิหรือยัง
    if (newChart.data.datasets.length === 0) {
        newChart.data.datasets.push({
            label: 'New Dataset',
            borderColor: 'red',
            borderWidth: 1,
            fill: false
        });
    }

    newChart.data.labels = calValues;
    newChart.data.datasets[0].data = disValues;

    // ตั้งค่าและอัปเดตขอบเขตของแกน
    newChart.options.scales.x.min = Math.min(...calValues);
    newChart.options.scales.x.max = Math.max(...calValues);
    newChart.options.scales.y.max = Math.max(...disValues);
    
    newChart.options.scales.x = {
        type: 'linear',
        beginAtZero: true,
        title: {
            display: true,
            text: 'DIGITIZER SIGNEL'
        },
        min: 0
    };

    newChart.options.scales.y = {
        type: 'linear',
        beginAtZero: true,
        title: {
            display: true,
            text: 'Distance (m)'
        },
        min: 0,
        max: 5000
    };
    newChart.update();
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

