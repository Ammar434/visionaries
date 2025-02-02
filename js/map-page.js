// map-page.js
import { DataProcessor } from './dataProcessor.js';
import { MapVisualizer } from './mapVisualizer.js';
import * as d3 from 'd3';

class MapPage {
    constructor() {
        this.dataProcessor = new DataProcessor();
        this.mapVisualizer = new MapVisualizer('map');
        this.filters = {
            month: 'all',
            severity: 'all',
            infrastructure: 'all'
        };
        this.initialize();
    }

    async initialize() {
        try {
            // Initialize the map
            this.mapVisualizer.initialize();

            // Load and process data
            const accidents = await this.dataProcessor.loadData();

            // Update the visualization
            this.mapVisualizer.updateData(accidents);

            // Setup filters
            this.setupFilters();

            // Initialize legends
            this.initializeLegends();

        } catch (error) {
            console.error('Error initializing map page:', error);
            this.showError('Failed to load the map visualization. Please try again later.');
        }
    }

    setupFilters() {
        // Month filter
        const monthSelect = document.getElementById('monthSelect');
        const months = this.dataProcessor.getAccidentsByMonth();

        Object.keys(months).sort((a, b) => a - b).forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = `Month ${month} (${months[month]} accidents)`;
            monthSelect.appendChild(option);
        });

        monthSelect.addEventListener('change', (event) => {
            this.filters.month = event.target.value;
            this.applyFilters();
        });

        // Severity filter
        const severitySelect = document.getElementById('severitySelect');
        severitySelect.addEventListener('change', (event) => {
            this.filters.severity = event.target.value;
            this.applyFilters();
        });

        // Infrastructure filter
        const infrastructureSelect = document.getElementById('infrastructureSelect');
        infrastructureSelect.addEventListener('change', (event) => {
            this.filters.infrastructure = event.target.value;
            this.applyFilters();
        });
    }

    applyFilters() {
        let filteredData = this.dataProcessor.bicycleAccidents;

        if (this.filters.month !== 'all') {
            filteredData = filteredData.filter(d => d.mois === parseInt(this.filters.month));
        }

        if (this.filters.severity !== 'all') {
            filteredData = filteredData.filter(d => d.grav === this.filters.severity);
        }

        if (this.filters.infrastructure !== 'all') {
            filteredData = filteredData.filter(d => d.infra === this.filters.infrastructure);
        }

        this.mapVisualizer.updateData(filteredData);
    }

    initializeLegends() {
        const legendSvg = d3.select('#severity-legend')
            .append('svg')
            .attr('width', 200)
            .attr('height', 100);

        const severityColors = {
            1: '#fee8c8',
            2: '#fdbb84',
            3: '#e34a33'
        };

        const entries = Object.entries(severityColors);
        entries.forEach(([severity, color], i) => {
            const g = legendSvg.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            g.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', color);

            g.append('text')
                .attr('x', 25)
                .attr('y', 12)
                .text(this.getSeverityLabel(severity));
        });
    }

    getSeverityLabel(severity) {
        const labels = {
            1: 'Light injury',
            2: 'Severe injury',
            3: 'Fatal'
        };
        return labels[severity] || 'Unknown';
    }

    showError(message) {
        console.error(message);
    }
}

// Initialize the map page
const mapPage = new MapPage();