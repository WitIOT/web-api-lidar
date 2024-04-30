var selectedCollection = ''; // เก็บชื่อ collection ที่เลือก
// สร้างแผนภูมิ MPL_cal เป็นแกน y และ MPL_dis เป็นแกน x
var mplCtx = document.getElementById('mplChart').getContext('2d');
var mplChart = new Chart(mplCtx, {
    type: 'line',
    data: {
        labels: [], // Labels from API
        datasets: [{
            label: 'MPL_cal',
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
                    text: 'MPL_dis'
                },
                type: 'linear',
                min: 3657.468017578125,
                max: 4257.052734375
            },
            y: {
                title: {
                    display: true,
                    text: 'MPL_cal'
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
    }
});



// สร้างแผนภูมิ OC_cal เป็นแกน y และ dis เป็นแกน x
var ocCtx = document.getElementById('ocChart').getContext('2d');
var ocChart = new Chart(ocCtx, {
    type: 'line',
    data: {
        labels: [], // ลิสต์ของชื่อของแต่ละช่วงเวลา
        datasets: [{
            label: 'OC_cal',
            data: [], // ข้อมูล OC_cal จาก API
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
                    text: 'dis'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'OC_cal'
                }
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

function search() {
    const input = document.getElementById('searchInput').value;
    // fetch('http://192.168.2.190:5000/collections/ALiN')
    fetch('http://localhost:5000/collections/ALiN')
        .then(response => response.json())
        .then(data => {
            const dropdownContent = document.getElementById('dropdownContent');
            dropdownContent.innerHTML = ''; // Clear previous dropdown content
            data.forEach(item => {
                const option = document.createElement('a');
                option.href = '#';
                // Extract timestamp and reformat
                const timestamp = item.split('_')[1]; // Assuming item is like "ALiN_202404032035"
                const formattedDate = formatDate(timestamp);
                option.textContent = `ALiN_${formattedDate}`;
                option.onclick = function() {
                    selectedCollection = `ALiN_${timestamp}`; // Keep the original format internally
                    document.getElementById('collectionName').textContent = 'Collection: ' + option.textContent;
                    fetchDataAndUpdateChart(selectedCollection);
                };
                dropdownContent.appendChild(option);
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
                item.MPL_dis.forEach((value, index) => {
                    if (!mplChart.data.labels.includes(value)) {
                        mplChart.data.labels.push(value);
                    }
                    mplChart.data.datasets[0].data.push(item.MPL_cal[index]);
                });
                item.dis.forEach((value, index) => {
                    if (!ocChart.data.labels.includes(value)) {
                        ocChart.data.labels.push(value);
                    }
                    ocChart.data.datasets[0].data.push(item.OC_cal[index]);
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
search();
