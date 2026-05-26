import { bodyWeightHistory, saveState } from "./data.js";
import { formatDate, vibrate, showToast } from "./utils.js";
let bodyChart = null;
function saveBodyWeight() {
    const input = document.getElementById("body-weight-input");
    if (!input)
        return;
    const weight = parseFloat(input.value);
    if (!weight || weight <= 0) {
        showToast("Введіть коректну вагу", "warning");
        return;
    }
    const date = new Date().toISOString();
    bodyWeightHistory.push({ date, weight });
    saveState();
    renderBodyStats();
    vibrate(50);
    input.value = "";
}
function renderBodyStats() {
    const historyList = document.getElementById("body-history-list");
    if (!historyList)
        return;
    const sortedHistory = [...bodyWeightHistory].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    historyList.innerHTML = sortedHistory
        .map((item) => `
        <div class="body-history-item">
            <span>${formatDate(item.date)}</span>
            <span style="color:var(--accent); font-weight:bold;">${item.weight} кг</span>
        </div>
    `)
        .join("");
    renderBodyChart();
}
function renderBodyChart() {
    const canvas = document.getElementById("body-chart");
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    if (bodyChart)
        bodyChart.destroy();
    const data = bodyWeightHistory.slice(-15);
    if (data.length === 0)
        return;
    bodyChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map((i) => new Date(i.date).toLocaleDateString()),
            datasets: [
                {
                    label: "Вага тіла (кг)",
                    data: data.map((i) => i.weight),
                    borderColor: "#00d4ff",
                    backgroundColor: "rgba(0, 212, 255, 0.1)",
                    fill: true,
                    tension: 0.3,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false, grid: { color: "rgba(255,255,255,0.05)" } },
                x: { grid: { display: false } },
            },
        },
    });
}
export { saveBodyWeight, renderBodyStats, renderBodyChart };
