var selectedCollection = ''; // เก็บชื่อ collection ที่เลือก
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

// function search1() {
//     fetch('http://localhost:5000/collections/ALiN')
//         .then(response => response.json())
//         .then(data => {
//             const dropdownContent = document.getElementById('dropdownContent');
//             dropdownContent.innerHTML = ''; // Clear previous dropdown content
//             data.forEach(item => {
//                 const timestamp = item.split('_')[1]; // Assuming item is like "ALiN_202404032035"
//                 const formattedDate = formatDate(timestamp);
//                 const option = document.createElement('a');
//                 option.href = '#';
//                 option.textContent = `ALiN_${formattedDate}`;
//                 option.onclick = function() {
//                     selectedCollection = `ALiN_${timestamp}`; // Keep the original format internally
//                     document.getElementById('collectionName').textContent = 'Data experiment: ' + option.textContent;
//                     fetchDataAndUpdateChart(selectedCollection);
//                 };
//                 dropdownContent.appendChild(option);
//                 if (timestamp === '202404032035') { // ตั้งค่าเริ่มต้นให้เลือกข้อมูลนี้
//                     option.click(); // Simulate click to select and fetch data
//                 }
//             });
//         })
//         .catch(error => console.error('Error fetching data:', error));
// }

function search1() {
    fetch('http://localhost:5000/collections/ALiN')
        .then(response => response.json())
        .then(data => {
            const dropdownContent = document.getElementById('dropdownContent');
            dropdownContent.innerHTML = ''; // Clear previous dropdown content

            // การเรียงข้อมูลจากใหม่ไปเก่า
            data.sort((a, b) => {
                const timestampA = a.split('_')[1];
                const timestampB = b.split('_')[1];
                if (timestampA && timestampB) {
                    return timestampB.localeCompare(timestampA); // เรียงจากมากไปน้อย
                }
                return 0;
            });

            data.forEach(item => {
                const timestamp = item.split('_')[1];
                if (timestamp) { // ตรวจสอบว่า timestamp ไม่เป็น undefined
                    const formattedDate = formatDate(timestamp);
                    const option = document.createElement('a');
                    option.href = '#';
                    option.textContent = `ALiN_${formattedDate}`;
                    option.onclick = function() {
                        selectedCollection = `ALiN_${timestamp}`; // Keep the original format internally
                        document.getElementById('collectionName').textContent = 'Data experiment: ' + option.textContent;
                        fetchDataAndUpdateChart(selectedCollection);
                    };
                    dropdownContent.appendChild(option);
                    if (timestamp === '202404032035') { // ตั้งค่าเริ่มต้นให้เลือกข้อมูลนี้
                        option.click(); // Simulate click to select and fetch data
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}







// ฟังก์ชันสำหรับดึงข้อมูล JSON จาก API และอัพเดทแผนภูมิ MPL_cal และ OC_cal
function fetchDataAndUpdateChart(selectedData) {
    // fetch('http://192.168.2.190:5000/data/ALiN/' + selectedData)
    fetch('http://localhost:5000/data/ALiN/' + selectedData)
        .then(response => {
            if (!response.ok) {
                throw new Error('ไม่สามารถดึงข้อมูล API ได้');
            }
            return response.json();
        })
        .then(data => {
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
        })
        .catch(error => {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        });
}

// เรียกใช้งานฟังก์ชันค้นหาเมื่อเว็บโหลดเสร็จ
search1();
