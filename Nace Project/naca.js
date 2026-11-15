// تهيئة حاويات الرسوم البيانية من مكتبة ECharts
const calendarChart = echarts.init(document.getElementById('calendar-heatmap'));
const trendChart = echarts.init(document.getElementById('anomaly-trend-chart'));

// بيانات تجريبية (ستُستبدل لاحقاً بـ fetch من الـ Back-end API)
let currentAnalyticsData = {
  region: "Cordoba, Argentina",
  year: "2026",
  dailyHotspots: generateMockDailyData(2026), // [Date, Count, Total_FRP]
  monthlyComparison: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    historicalAvg: [18, 22, 25, 30, 45, 70, 110, 145, 130, 85, 40, 20],
    selectedYearHarmonized: [20, 19, 28, 35, 50, 85, 195, 210, 140, 90, 42, 25],
    selectedYearRawModis: [4, 3, 5, 6, 9, 15, 34, 38, 25, 16, 8, 5]
  }
};

// دالة توليد بيانات يومية تجريبية لمحاكاة موسم الحرائق
function generateMockDailyData(year) {
  const data = [];
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const month = d.getMonth();
    // محاكاة ذروة الحرائق في يوليو وأغسطس
    const base = (month === 6 || month === 7) ? Math.floor(Math.random() * 95) : Math.floor(Math.random() * 15);
    const frp = +(base * 14.5).toFixed(1);
    data.push([dateStr, base, frp]);
  }
  return data;
}


function renderCalendar(year, dailyData) {
  calendarChart.setOption({
    title: { 
      text: `Daily Burning Activity Calendar (${year})`, 
      textStyle: { color: '#f8fafc', fontSize: 15 } 
    },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#475569',
      textStyle: { color: '#f8fafc' },
      formatter: (p) => `
        <b>Date:</b> ${p.value[0]}<br/>
        <b>Harmonized Hotspots:</b> ${p.value[1]}<br/>
        <b>Total FRP:</b> ${p.value[2]} MW
      `
    },
    visualMap: {
      min: 0, 
      max: 100, 
      type: 'piecewise', 
      orient: 'horizontal', 
      right: 10, 
      top: 0,
      textStyle: { color: '#cbd5e1' },
      pieces: [
        { value: 0, label: '0', color: '#0f172a' },
        { min: 1, max: 15, label: 'Low (1-15)', color: '#fef08a' },
        { min: 16, max: 45, label: 'Moderate (16-45)', color: '#f97316' },
        { min: 46, max: 75, label: 'High (46-75)', color: '#ea580c' },
        { min: 76, label: 'Extreme (>75)', color: '#dc2626' }
      ]
    },
    calendar: {
      top: 55, 
      left: 40, 
      right: 20, 
      cellSize: ['auto', 18], 
      range: year,
      itemStyle: { borderWidth: 2, borderColor: '#1e293b' },
      dayLabel: { color: '#94a3b8' },
      monthLabel: { color: '#e2e8f0' },
      splitLine: { lineStyle: { color: '#475569', width: 1.5 } }
    },
    series: [{ 
      type: 'heatmap', 
      coordinateSystem: 'calendar', 
      data: dailyData 
    }]
  });
}

// 2. دالة رسم الاتجاهات التاريخية وكشف الشذوذ (Trends & Anomalies)
function renderTrendChart(monthlyData, isHarmonized) {
  const activeSeries = isHarmonized ? monthlyData.selectedYearHarmonized : monthlyData.selectedYearRawModis;
  const seriesLabel = isHarmonized ? 'Selected Year (Harmonized VIIRS-Eq)' : 'Selected Year (Raw Uncalibrated)';

  trendChart.setOption({
    title: { 
      text: 'Seasonal Trend & Anomaly Detection vs. 25-Year Baseline', 
      textStyle: { color: '#f8fafc', fontSize: 15 } 
    },
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: '#0f172a', 
      textStyle: { color: '#f8fafc' } 
    },
    legend: { 
      data: ['25-Yr Historical Baseline', seriesLabel], 
      top: 28, 
      textStyle: { color: '#cbd5e1' } 
    },
    grid: { left: 45, right: 25, top: 70, bottom: 30 },
    xAxis: { 
      type: 'category', 
      data: monthlyData.months, 
      axisLabel: { color: '#94a3b8' } 
    },
    yAxis: { 
      type: 'value', 
      name: 'Hotspot Count', 
      nameTextStyle: { color: '#94a3b8' }, 
      axisLabel: { color: '#94a3b8' }, 
      splitLine: { lineStyle: { color: '#334155' } } 
    },
    series: [
      {
        name: '25-Yr Historical Baseline',
        type: 'line',
        data: monthlyData.historicalAvg,
        smooth: true,
        lineStyle: { type: 'dashed', color: '#94a3b8', width: 2 },
        itemStyle: { color: '#94a3b8' }
      },
      {
        name: seriesLabel,
        type: 'line',
        data: activeSeries,
        smooth: true,
        lineStyle: { color: '#f97316', width: 3 },
        itemStyle: { color: '#f97316' },
        areaStyle: { color: 'rgba(249, 115, 22, 0.15)' },
        markPoint: {
          data: [{ type: 'max', name: 'Peak Anomaly', itemStyle: { color: '#dc2626' } }]
        }
      }
    ]
  }, true);
}

// 3. الربط مع الخريطة عند الضغط على أي يوم في التقويم
calendarChart.on('click', (params) => {
  const clickedDate = params.value[0];
  window.dispatchEvent(new CustomEvent('calendarDateSelected', { detail: { date: clickedDate } }));
  console.log(`Selected Date dispatched to Map: ${clickedDate}`);
});

// 4. تصدير التحليلات (CSV & JSON)
document.getElementById('export-csv-btn').addEventListener('click', () => {
  const headers = ['Date,Harmonized_Hotspot_Count,Total_FRP_MW'];
  const rows = currentAnalyticsData.dailyHotspots.map(r => `${r[0]},${r[1]},${r[2]}`);
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `burning_activity_${currentAnalyticsData.year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.getElementById('export-json-btn').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAnalyticsData, null, 2));
  
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `burning_activity_${currentAnalyticsData.year}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 5. مستمعات الأحداث لتغيير السنة أو تفعيل/إلغاء Harmonization
document.getElementById('year-selector').addEventListener('change', (e) => {
  const yr = e.target.value;
  currentAnalyticsData.year = yr;
  currentAnalyticsData.dailyHotspots = generateMockDailyData(yr);
  renderCalendar(yr, currentAnalyticsData.dailyHotspots);
});

document.getElementById('harmonized-toggle').addEventListener('change', (e) => {
  renderTrendChart(currentAnalyticsData.monthlyComparison, e.target.checked);
});

// 6. التشغيل الأولي وجعل الرسوم متجاوبة مع حجم الشاشة
renderCalendar("2026", currentAnalyticsData.dailyHotspots);
renderTrendChart(currentAnalyticsData.monthlyComparison, true);

window.addEventListener('resize', () => {
  calendarChart.resize();
  trendChart.resize();
});