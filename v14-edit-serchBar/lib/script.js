var selectedCollection = ''; // เก็บชื่อ collection ที่เลือก
let ocDisValues = [];
let ocCalValues = [];
var originalFormatCollection = "";

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
                min: 0,
                max: 5000
            },
            y: {
                type: 'linear',
                beginAtZero: true, // ตั้งค่าให้แกน Y เริ่มที่ 0
                title: {
                    display: true,
                    text: 'Distance (m)' // ชื่อแกน Y
                },
                min: 0
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

document.getElementById('toggleSettings').addEventListener('click', function() {
    const settingsDiv = document.getElementById('settings');
    settingsDiv.style.display = settingsDiv.style.display === 'none' ? 'block' : 'none';
});

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
                    // if (mplDisValue >= 0 && mplDisValue <= 5000) {
                    //     mplCalValues.push(value);
                    //     mplDisValues.push(mplDisValue);
                    // }
                    mplCalValues.push(value);
                    mplDisValues.push(mplDisValue);
                });
                item.OC_cal.forEach((value, index) => {
                    let ocDisValue = item.dis[index];
                    ocCalValues.push(value);
                    ocDisValues.push(ocDisValue);
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
    const showMPL = document.getElementById('showMPL').checked;
    const showALiN = document.getElementById('showALiN').checked;

    const xMin = document.getElementById('xMin').value;
    const xMax = document.getElementById('xMax').value;
    const yMin = document.getElementById('yMin').value;
    const yMax = document.getElementById('yMax').value;

    newChart.data.labels = mplCalValues.concat(ocCalValues); // assuming you want to show both on the same axis
    newChart.data.datasets = [];

    if (showMPL) {
        newChart.data.datasets.push({
            label: 'MPL',
            data: mplDisValues,
            borderColor: 'blue',
            borderWidth: 1,
            fill: false
        });
    }

    if (showALiN) {
        newChart.data.datasets.push({
            label: 'ALiN',
            data: ocDisValues,
            borderColor: 'red',
            borderWidth: 1,
            fill: false
        });
    }

    newChart.options.scales.x.min = xMin ? Number(xMin) : Math.min(...mplCalValues.concat(ocCalValues));
    newChart.options.scales.x.max = xMax ? Number(xMax) : Math.max(...mplCalValues.concat(ocCalValues));
    newChart.options.scales.y.min = yMin ? Number(yMin) : 0;
    newChart.options.scales.y.max = yMax ? Number(yMax) : Math.max(...mplDisValues.concat(ocDisValues));

    newChart.update();
}

function fetchDatesAndTimes() {
    fetch('http://192.168.2.190:5000/collections/ALiN')
    .then(response => response.json())
    .then(data => {
        const dateSelect = document.getElementById('dateSelect');
        dateSelect.innerHTML = '';  // ล้าง dropdown date

        const dates = {};

        // จัดระเบียบข้อมูลตามวันที่และเวลา
        data.forEach(item => {
            const [prefix, timestamp] = item.split('_');
            const date = timestamp.substring(0, 8);
            const time = timestamp.substring(8, 12);

            if (!dates[date]) {
                dates[date] = [];
            }
            dates[date].push(time);
        });

        // เรียงวันที่ในลำดับจากใหม่ไปเก่า
        const sortedDates = Object.keys(dates).sort((a, b) => b.localeCompare(a));

        // เติมข้อมูลใน dropdown สำหรับวันที่
        sortedDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
            dateSelect.appendChild(option);
        });

        // อัปเดต dropdown สำหรับเวลาโดยอัตโนมัติสำหรับวันที่แรก
        updateTimeDropdown();
    })
    .catch(error => console.error('Error fetching dates:', error));
}

function updateTimeDropdown() {
    const dateSelect = document.getElementById('dateSelect');
    const selectedDate = dateSelect.value;
    const timeSelect = document.getElementById('timeSelect');
    timeSelect.innerHTML = '';

    fetch('http://192.168.2.190:5000/collections/ALiN')
    .then(response => response.json())
    .then(data => {
        const times = data
            .filter(item => item.includes(selectedDate))
            .map(item => item.split('_')[1].substring(8, 12))
            .sort((a, b) => b.localeCompare(a));

        // เติมข้อมูลใน dropdown สำหรับเวลา
        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = `${time.substring(0, 2)}:${time.substring(2, 4)}`;
            timeSelect.appendChild(option);
        });

        updateDataExperimentLabel();
    })
    .catch(error => console.error('Error fetching times:', error));
}

function search() {
    updateGraph();
    document.getElementById('updateAxis').disabled = false; // Enable the Update Axis button after search
}

function updateDataExperimentLabel() {
    const dateSelect = document.getElementById('dateSelect');
    const timeSelect = document.getElementById('timeSelect');
    const dataExperiment = document.getElementById('dataExperiment');

    const selectedDate = dateSelect.value;
    const selectedTime = timeSelect.value;
    
    if (selectedDate && selectedTime) {
        // Format selectedDate and selectedTime into desired format
        const formattedDate = `${selectedDate.substring(0, 4)}-${selectedDate.substring(4, 6)}-${selectedDate.substring(6, 8)}`;
        const formattedTime = `${selectedTime.substring(0, 2)}:${selectedTime.substring(2, 4)}`;
        selectedCollection = `ALiN_${formattedDate} ${formattedTime}`;

        dataExperiment.textContent = selectedCollection;
    } else {
        dataExperiment.textContent = '';
    }
}

function downloadData() {
    if (!originalFormatCollection) {
        alert('Please select a data collection first.');
        return;
    }

    const apiUrl = 'http://192.168.2.190:5000/data/ALiN/' + originalFormatCollection;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", originalFormatCollection + ".json");
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
    if (!originalFormatCollection) {
        alert('Please select a data collection first.');
        return;
    }

    const apiUrl = 'http://192.168.2.190:5000/data/ALiN/' + originalFormatCollection;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                console.error('Fetched data is not an array:', data);
                alert('Failed to download data. The data format is incorrect.');
                return;
            }

            const wb = XLSX.utils.book_new();
            const ws_name = "Data";

            let excelData = [];
            data.forEach((item, index) => {
                item.MPL_cal.forEach((mplCalValue, mplIndex) => {
                    let row = excelData[mplIndex] || {};
                    row.MPL_cal = mplCalValue;
                    row.MPL_dis = item.MPL_dis[mplIndex] || null;
                    excelData[mplIndex] = row;
                });

                item.OC_cal.forEach((ocCalValue, ocIndex) => {
                    let row = excelData[ocIndex] || {};
                    row.OC_cal = ocCalValue;
                    row.OC_dis = item.dis[ocIndex] || null;
                    excelData[ocIndex] = row;
                });
            });

            const ws = XLSX.utils.json_to_sheet(excelData);
            XLSX.utils.book_append_sheet(wb, ws, ws_name);

            XLSX.writeFile(wb, selectedCollection + ".xlsx");
        })
        .catch(error => {
            console.error('Error downloading data:', error);
            alert('Failed to download data.');
        });
}

function updateGraph() {
    const dateSelect = document.getElementById('dateSelect');
    const timeSelect = document.getElementById('timeSelect');

    const selectedDate = dateSelect.value;
    const selectedTime = timeSelect.value;

    // Update the label with the new selection
    updateDataExperimentLabel();

    // Convert formatted date and time back to the original format for fetching data
    const originalFormatCollection = `ALiN_${selectedDate}${selectedTime}`;
    
    fetchData(originalFormatCollection, updateChart);
}

document.addEventListener('DOMContentLoaded', function() {
    fetchDatesAndTimes();

    // Add event listener to date and time dropdowns to update the graph when a date or time is selected
    const dateSelect = document.getElementById('dateSelect');
    const timeSelect = document.getElementById('timeSelect');
    const showMPL = document.getElementById('showMPL');
    const showALiN = document.getElementById('showALiN');
    const updateAxis = document.getElementById('updateAxis');

    dateSelect.addEventListener('change', function() {
        updateTimeDropdown();
        updateGraph();
    });
    timeSelect.addEventListener('change', updateGraph);
    showMPL.addEventListener('change', updateGraph);
    showALiN.addEventListener('change', updateGraph);
    updateAxis.addEventListener('click', updateGraph);

    const searchButton = document.querySelector('button[type="submit"]');
    searchButton.addEventListener('click', function(event) {
        event.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บ
        search();
    });
});
