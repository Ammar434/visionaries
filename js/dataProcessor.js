import Papa from 'papaparse';

export class DataProcessor {
    constructor(options = {}) {
        this.logger = options.logger || console;
        this.data = {
            caracteristiques: [],
            vehicules: [],
            usagers: [],
            lieux: []
        };
        this.bicycleAccidents = [];
    }

    async loadData() {
        this.logger.log('Starting loadData method');
        const year = 2022;

        try {
            const csvFiles = await Promise.all([
                this.loadCSVFile(`clean-caracteristiques-${year}.csv`),
                this.loadCSVFile(`clean-vehicules-${year}.csv`),
                this.loadCSVFile(`clean-usagers-${year}.csv`),
                this.loadCSVFile(`clean-lieux-${year}.csv`)
            ]);

            [
                this.data.caracteristiques,
                this.data.vehicules,
                this.data.usagers,
                this.data.lieux
            ] = csvFiles;

            return this.processBicycleAccidents();
        } catch (error) {
            this.logger.error('Error loading data:', error);
            throw error;
        }
    }

    async loadCSVFile(filename) {
        try {
            const response = await fetch(`/data/2022/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            this.logger.error(`Error loading ${filename}:`, error);
            throw error;
        }
    }

    parseCSV(csvText) {
        const results = Papa.parse(csvText, {
            header: true,
            delimiter: ';',
            dynamicTyping: false, // Changed to false to keep everything as strings
            skipEmptyLines: true,
            transformHeader: header => header.trim()
        });

        if (results.errors.length > 0) {
            this.logger.warn('CSV parsing errors:', results.errors);
        }

        return results.data;
    }

    normalizeId(id) {
        if (!id) return '';
        return id.toString().trim();
    }


    // In your DataProcessor class, modify the processBicycleAccidents method:
    processBicycleAccidents() {
        // First, normalize all IDs in vehicules data
        const bicycleVehicles = this.data.vehicules.filter(v =>
            v.catv && ['1', '01'].includes(v.catv.toString().trim())
        );

        // Create a Set of normalized bicycle accident IDs
        const bicycleAccidentIds = new Set(
            bicycleVehicles.map(v => this.normalizeId(v.Num_Acc))
        );

        // Helper function to parse French-formatted numbers
        const parseFrenchnumber = (str) => {
            if (!str) return null;
            // Replace comma with period and convert to float
            return parseFloat(str.toString().trim().replace(',', '.'));
        };

        // Process accidents using normalized IDs
        this.bicycleAccidents = this.data.caracteristiques
            .filter(acc => {
                const normalizedId = this.normalizeId(acc.Accident_Id);
                return bicycleAccidentIds.has(normalizedId);
            })
            .map(acc => {
                const normalizedId = this.normalizeId(acc.Accident_Id);
                const lieuxInfo = this.data.lieux.find(l =>
                    this.normalizeId(l.Num_Acc) === normalizedId
                );
                const usagersInfo = this.data.usagers.filter(u =>
                    this.normalizeId(u.Num_Acc) === normalizedId
                );

                // Parse coordinates properly
                const lat = parseFrenchnumber(acc.lat);
                const long = parseFrenchnumber(acc.long);

                return {
                    ...acc,
                    lat: lat,  // Now properly parsed
                    long: long, // Now properly parsed
                    users: usagersInfo,
                    location_details: lieuxInfo
                };
            });

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

    getGeographicCluster(precision = 2) {
        return this.bicycleAccidents.reduce((clusters, accident) => {
            const latCluster = accident.lat;
            const longCluster = accident.long;
            const key = `${latCluster},${longCluster}`;
            clusters[key] = (clusters[key] || 0) + 1;
            return clusters;
        }, {});
    }

    getUserDemographics() {
        const userTypes = {};
        const ageGroups = {};

        this.bicycleAccidents.forEach(accident => {
            accident.users.forEach(user => {
                const userType = user.catu || 'unknown';
                userTypes[userType] = (userTypes[userType] || 0) + 1;

                const age = user.age;
                if (age !== null && age !== undefined) {
                    const ageGroup = this.categorizeAge(age);
                    ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
                }
            });
        });

        return { userTypes, ageGroups };
    }

    categorizeAge(age) {
        if (age < 18) return '0-17';
        if (age < 25) return '18-24';
        if (age < 35) return '25-34';
        if (age < 45) return '35-44';
        if (age < 55) return '45-54';
        if (age < 65) return '55-64';
        return '65+';
    }

    analyzeAccidentTrends() {
        return {
            byMonth: this.getAccidentsByMonth(),
            byGravity: this.getAccidentsByGravity(),
            geographicClusters: this.getGeographicCluster(),
            userDemographics: this.getUserDemographics()
        };
    }
}