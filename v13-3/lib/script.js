var selectedCollection = ''; // เก็บชื่อ collection ที่เลือก
let ocDisValues = [];
let ocCalValues = [];

// ฟังก์ชั่นในการสร้างกราฟด้วย FusionCharts
function createChart(ocCalValues, ocDisValues) {
    var chartConfig = {
        type: 'zoomline',
        renderAt: 'c1',
        width: '100%',
        height: '500',
        dataFormat: 'json',
        dataSource: {
            "chart": {
                "caption": "Line Chart",
                "xAxisName": "DIGITIZER SIGNAL",
                "yAxisName": "Distance (m)",
                "theme": "fusion",
                "yAxisMinValue": "0",
                "yAxisMaxValue": "5000",
                "xAxisMinValue": "0"
            },
            "data": ocCalValues.map((x, i) => ({
                "label": x.toString(),
                "value": ocDisValues[i].toString()
            }))
        }
    };

    FusionCharts.ready(function() {
        var fusionChart = new FusionCharts(chartConfig);
        fusionChart.render();
    });
}

function formatDate(timestamp) {
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

function search1(){
    fetch('http://192.168.2.190:5000/collections/ALiN')
    .then(response => response.json())
    .then(data => {
        const dropdownContent = document.getElementById('dropdownContent');
        dropdownContent.innerHTML = ''; // Clear previous dropdown content
        data.sort((a, b) => {
            const timestampA = a.split('_')[1];
            const timestampB = b.split('_')[1];
            return timestampB.localeCompare(timestampA); // Sort in descending order
        });
        data.forEach((item, index) => {
            const timestamp = item.split('_')[1];
            const formattedDate = formatDate(timestamp);
            const option = document.createElement('a');
            option.href = '#';
            option.textContent = `ALiN_${formattedDate}`;
            option.onclick = function() {
                selectedCollection = `ALiN_${timestamp}`;
                document.getElementById('collectionName').textContent = 'Data experiment: ' + option.textContent;
                fetchData(selectedCollection, createChart);
            };
            dropdownContent.appendChild(option);
            if (index === 0) { 
                option.click();
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
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
                    if (mplDisValue >= 0 && mplDisValue <= 5000) {
                        mplCalValues.push(value);
                        mplDisValues.push(mplDisValue);
                    }
                });
                item.OC_cal.forEach((value, index) => {
                    let ocDisValue = item.dis[index];
                    if (ocDisValue >= 0 && ocDisValue <= 5000) {
                        ocCalValues.push(value);
                        ocDisValues.push(ocDisValue);
                    }
                });
            });
            console.log('MPL Cal Values:', mplCalValues);
            console.log('MPL Dis Values:', mplDisValues);
            console.log('OC Cal Values:', ocCalValues);
            console.log('OC Dis Values:', ocDisValues);
            callback(ocCalValues, ocDisValues);
        })
        .catch(error => console.error('Error fetching data:', error));
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

search1();
