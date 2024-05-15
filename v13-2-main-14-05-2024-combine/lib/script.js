var selectedCollection = ''; // เก็บชื่อ collection ที่เลือก
let ocDisValues = [];
let ocCalValues = [];

var ctx = document.getElementById('newChart').getContext('2d'); // ตรวจสอบว่าได้เพิ่ม canvas ที่มี id 'newChart' ใน HTML ของคุณแล้ว
var newChart = new Chart(ctx, {
    type: 'line', // หรือประเภทแผนภูมิอื่นตามที่ต้องการ
    data: {
        labels: ocCalValues, // ค่าสำหรับแกน X
        datasets: [{
            label: 'ALiN', // ชื่อชุดข้อมูล
            data: ocDisValues, // ค่าสำหรับแกน Y
            borderColor: 'blue', // สีขอบของเส้น
            borderWidth: 1,
            fill: false // ไม่ต้องกรอกพื้นที่ใต้เส้น
        }]
    },
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
        },
        plugins: {
            zoom: {
                zoom: {
                    wheel: {
                        enabled: false, // ไม่เปิดใช้งานซูมด้วยวงล้อเมาส์
                    },
                    drag: {
                        enabled: true, // เปิดใช้งานซูมแบบแถบลาก
                        borderColor: 'rgba(225,225,225,0.3)', // สีขอบของกล่องลาก
                        borderWidth: 1, // ความหนาของขอบ
                        backgroundColor: 'rgba(225,225,225,0.3)' // สีพื้นหลังของกล่องลาก
                    },
                    mode: 'xy', // กำหนดให้ซูมได้ทั้งแกน X และ Y
                },
                pan: {
                    enabled: true, // เปิดใช้งานการพาน
                    mode: 'xy' // กำหนดให้พานได้ทั้งแกน X และ Y
                },
                limits: {
                    max: 10, // จำกัดการซูมเข้าสูงสุด
                    min: 0.5 // จำกัดการซูมออกต่ำสุด
                }
            }
        }
    }
});

document.getElementById('resetZoom').addEventListener('click', function() {
    newChart.resetZoom();
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
    document.getElementById('loadingMessage').style.display = 'block';
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
            document.getElementById('loadingMessage').style.display = 'none';

            callback(mplCalValues, mplDisValues, ocCalValues, ocDisValues);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Hide loading message even if there is an error
            document.getElementById('loadingMessage').style.display = 'none';
        })        
}


function updateChart(mplCalValues, mplDisValues, ocCalValues, ocDisValues) {
    newChart.data.labels = mplCalValues.concat(ocCalValues); // assuming you want to show both on the same axis
    newChart.data.datasets = [
        {
            label: 'MPL',
            data: mplDisValues,
            borderColor: 'blue',
            borderWidth: 1,
            fill: false
        },
        {
            label: 'ALiN',
            data: ocDisValues,
            borderColor: 'red',
            borderWidth: 1,
            fill: false
        }
    ];

    newChart.options.scales.x.min = Math.min(...mplCalValues.concat(ocCalValues));
    newChart.options.scales.x.max = Math.max(...mplCalValues.concat(ocCalValues));
    newChart.options.scales.y.max = Math.max(...mplDisValues.concat(ocDisValues));

    newChart.options.scales.x = {
        type: 'linear',
        // beginAtZero: true,
        title: {
            display: true,
            text: 'DIGITIZER SIGNEL'
        },
        min: 0
    };

    newChart.options.scales.y = {
        type: 'linear',
        // beginAtZero: true,
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

