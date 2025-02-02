// dataProcessor.js
import Papa from '/node_modules/papaparse/papaparse.min.js';

export class DataProcessor {
    constructor() {
        this.accidents = [];
        this.vehicles = [];
        this.bicycleAccidents = [];
    }

    async loadData() {
        try {
            const [vehiclesData, caractData] = await Promise.all([
                this.loadFile('vehicules2022.csv'),
                this.loadFile('caracteristiques2022.csv')
            ]);

            this.vehicles = this.parseCSV(vehiclesData);
            this.accidents = this.parseCSV(caractData);

            return this.processBicycleAccidents();
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    async loadFile(filename) {
        try {
            return await window.fs.readFile(filename, { encoding: 'utf8' });
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            throw error;
        }
    }

    parseCSV(csvData) {
        const results = Papa.parse(csvData, {
            header: true,
            delimiter: ';',
            dynamicTyping: true,
            skipEmptyLines: true
        });

        if (results.errors.length > 0) {
            console.warn('CSV parsing errors:', results.errors);
        }

        return results.data;
    }

    processBicycleAccidents() {
        // Filter for bicycle accidents (catv === '01' or 1)
        const bicycleVehicles = this.vehicles.filter(v =>
            v.catv === '01' || v.catv === 1
        );

        // Get unique accident IDs
        const bicycleAccidentIds = new Set(
            bicycleVehicles.map(v => v.Num_Acc)
        );

        // Get full accident data
        this.bicycleAccidents = this.accidents
            .filter(acc => bicycleAccidentIds.has(acc.Num_Acc))
            .map(acc => ({
                ...acc,
                // Ensure coordinates are numbers
                lat: parseFloat(acc.lat),
                long: parseFloat(acc.long)
            }))
            .filter(acc => !isNaN(acc.lat) && !isNaN(acc.long));

        return this.bicycleAccidents;
    }

    getAccidentsByMonth() {
        return this.bicycleAccidents.reduce((acc, accident) => {
            const month = accident.mois || 'unknown';
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
    }

    getAccidentsByGravity() {
        return this.bicycleAccidents.reduce((acc, accident) => {
            const gravity = accident.grav || 'unknown';
            acc[gravity] = (acc[gravity] || 0) + 1;
            return acc;
        }, {});
    }
}