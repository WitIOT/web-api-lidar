var selectedCollection = ''; // เก็บชื่อ collection ที่เลือก

// สร้างแผนภูมิ MPL_cal เป็นแกน y และ MPL_dis เป็นแกน x
var mplCtx = document.getElementById('mplChart').getContext('2d');
var mplChart = new Chart(mplCtx, {
    type: 'line',
    data: {
        labels: [], // ลิสต์ของชื่อของแต่ละช่วงเวลา
        datasets: [{
            label: 'MPL_cal',
            data: [], // ข้อมูล MPL_cal จาก API
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
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'MPL_cal'
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
    }
});

// ฟังก์ชันสำหรับค้นหาข้อมูล
function search() {
    var input = document.getElementById('searchInput').value;
    fetch('http://192.168.2.190:5000/collections/ALiN')
        .then(response => response.json())
        .then(data => {
            var dropdownContent = document.getElementById('dropdownContent');
            dropdownContent.innerHTML = ''; // ล้างข้อมูลเก่าใน dropdown
            data.forEach(item => {
                var option = document.createElement('a');
                option.href = '#';
                option.textContent = item;
                option.onclick = function() {
                    selectedCollection = item;
                    document.getElementById('collectionName').textContent = 'Collection: ' + selectedCollection;
                    fetchDataAndUpdateChart(selectedCollection);
                };
                dropdownContent.appendChild(option);
            });
        })
        .catch(error => console.error('เกิดข้อผิดพลาดในการค้นหาข้อมูล:', error));
}

// ฟังก์ชันสำหรับดึงข้อมูล JSON จาก API และอัพเดทแผนภูมิ MPL_cal และ OC_cal
function fetchDataAndUpdateChart(selectedData) {
    fetch('http://192.168.2.190:5000/data/ALiN/' + selectedData)
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
