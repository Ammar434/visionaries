import { DataProcessor } from './dataProcessor.js';
import { drawMonthlyChart, drawSeverityChart } from './charts.js';

async function initializeDashboard() {
    try {
        const dataProcessor = new DataProcessor();
        const accidents = await dataProcessor.loadData();

        // Update total accidents count
        document.getElementById('total-accidents').innerHTML = `
            Total Bicycle Accidents in 2022: <span class="total-number">${accidents.length}</span>
        `;

        // Get data for charts
        const monthlyData = dataProcessor.getAccidentsByMonth();
        const severityData = dataProcessor.getAccidentsByGravity();

        // Draw charts
        drawMonthlyChart(monthlyData);
        drawSeverityChart(severityData);
    } catch (error) {
        // console.error('Error initializing dashboard:', error);
    }
}

// Start the application
initializeDashboard();