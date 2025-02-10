import { DataProcessor } from './data_processor.js';

async function initializeDashboard() {
    try {
        const processor = new DataProcessor();

        // Load all years' data
        var yearData = await processor.loadAllYearsData();

        console.log("From Global overview")
        console.log(yearData)

        // Get comprehensive analysis
        const trends = processor.getYearlyTrends();

        // Get specific metrics
        const totalsByYear = processor.getTotalAccidentsByYear();
        const averageGravity = processor.getAverageGravityByYear();



    } catch (error) {
        console.error('Error initializing dashboard:', error);
        document.querySelector('.dashboard').innerHTML = `
            <div style="text-align: center; color: red; padding: 20px;">
                Error loading data. Please try again later.
            </div>
        `;
    }
}

// Start the application
initializeDashboard();