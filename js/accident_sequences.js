import { DataProcessor } from "./data_processor.js";

// Comprehensive mapping of BAAC codes to readable values for visualization
const ACCIDENT_MAPPINGS = {
    timeOfDay: {
        '1': 'plein-jour',
        '2': 'crepuscule',
        '3': 'nuit-sans-eclairage',
        '4': 'nuit-eclairage-eteint',
        '5': 'nuit-eclairage-allume',
        '-1': 'inconnu'
    },
    weather: {
        '1': 'normal',
        '2': 'pluie-legere',
        '3': 'pluie-forte',
        '4': 'neige-grele',
        '5': 'brouillard',
        '6': 'vent-tempete',
        '7': 'temps-eblouissant',
        '8': 'temps-couvert',
        '9': 'autre-meteo',
        '-1': 'inconnu'
    },
    location: {
        '1': 'hors-agglomeration',
        '2': 'en-agglomeration',
        '-1': 'inconnu'
    },
    gravity: {
        '1': 'indemne',
        '2': 'tue',
        '3': 'hospitalise',
        '4': 'blesse-leger',
        '-1': 'inconnu'
    },
    roadType: {
        '1': 'autoroute',
        '2': 'nationale',
        '3': 'departementale',
        '4': 'communale',
        '5': 'hors-reseau',
        '6': 'parking',
        '7': 'metropole',
        '9': 'autre-route',
        '-1': 'inconnu'
    },
    surface: {
        '1': 'normale',
        '2': 'mouillee',
        '3': 'flaques',
        '4': 'inondee',
        '5': 'enneigee',
        '6': 'boue',
        '7': 'verglas',
        '8': 'huile',
        '9': 'autre-surface',
        '-1': 'inconnu'
    },
    infra: {
        '0': 'aucun',
        '1': 'tunnel',
        '2': 'pont',
        '3': 'bretelle',
        '4': 'rail',
        '5': 'carrefour',
        '6': 'zone-pietonne',
        '7': 'peage',
        '8': 'chantier',
        '9': 'autre-infra',
        '-1': 'inconnu'
    },
    intersection: {
        '1': 'hors-intersection',
        '2': 'intersection-x',
        '3': 'intersection-t',
        '4': 'intersection-y',
        '5': 'intersection-multiple',
        '6': 'giratoire',
        '7': 'place',
        '8': 'passage-niveau',
        '9': 'autre-intersection',
        '-1': 'inconnu'
    },
    collision: {
        '1': 'collision-frontale',
        '2': 'collision-arriere',
        '3': 'collision-cote',
        '4': 'collision-chaine',
        '5': 'collision-multiple',
        '6': 'autre-collision',
        '7': 'sans-collision',
        '-1': 'inconnu'
    },
    vosp: {
        '0': 'standard',
        '1': 'piste-cyclable',
        '2': 'bande-cyclable',
        '3': 'voie-reservee',
        '-1': 'inconnu'
    },
    maneuver: {
        '0': 'inconnue',
        '1': 'sans-changement',
        '2': 'meme-sens-file',
        '3': 'entre-files',
        '4': 'marche-arriere',
        '5': 'contresens',
        '6': 'franchissement-tpc',
        '7': 'couloir-bus-meme-sens',
        '8': 'couloir-bus-sens-inverse',
        '9': 'insertion',
        '10': 'demi-tour',
        '11': 'changement-file-gauche',
        '12': 'changement-file-droite',
        '13': 'deporte-gauche',
        '14': 'deporte-droite',
        '15': 'tournant-gauche',
        '16': 'tournant-droite',
        '17': 'depassement-gauche',
        '18': 'depassement-droite',
        '19': 'traversant-chaussee',
        '20': 'manoeuvre-stationnement',
        '21': 'manoeuvre-evitement',
        '22': 'ouverture-porte',
        '23': 'arrete-hors-stationnement',
        '24': 'stationnement',
        '25': 'circulant-trottoir',
        '26': 'autre-manoeuvre',
        '-1': 'inconnu'
    },
    obstacle: {
        '0': 'aucun',
        '1': 'vehicule-stationne',
        '2': 'arbre',
        '3': 'glissiere-metallique',
        '4': 'glissiere-beton',
        '5': 'autre-glissiere',
        '6': 'batiment',
        '7': 'poste-signal',
        '8': 'poteau',
        '9': 'mobilier-urbain',
        '10': 'parapet',
        '11': 'ilot-refuge',
        '12': 'bordure-trottoir',
        '13': 'fosse',
        '14': 'autre-obstacle-chaussee',
        '15': 'autre-obstacle-trottoir',
        '16': 'sortie-chaussee',
        '17': 'buse',
        '-1': 'inconnu'
    },
    obstacleMobile: {
        '0': 'aucun',
        '1': 'pieton',
        '2': 'vehicule',
        '4': 'vehicule-rail',
        '5': 'animal-domestique',
        '6': 'animal-sauvage',
        '9': 'autre-mobile',
        '-1': 'inconnu'
    },
    impactPoint: {
        '0': 'aucun',
        '1': 'avant',
        '2': 'avant-droit',
        '3': 'avant-gauche',
        '4': 'arriere',
        '5': 'arriere-droit',
        '6': 'arriere-gauche',
        '7': 'cote-droit',
        '8': 'cote-gauche',
        '9': 'multiple',
        '-1': 'inconnu'
    },
    tripPurpose: {
        '1': 'domicile-travail',
        '2': 'domicile-ecole',
        '3': 'courses',
        '4': 'professionnel',
        '5': 'promenade',
        '9': 'autre-trajet',
        '0': 'inconnu',
        '-1': 'inconnu'
    },
    safetyEquipment: {
        '0': 'aucun',
        '1': 'ceinture',
        '2': 'casque',
        '3': 'dispositif-enfant',
        '4': 'gilet',
        '5': 'airbag',
        '6': 'gants',
        '7': 'gants-airbag',
        '8': 'non-determinable',
        '9': 'autre-equipement',
        '-1': 'inconnu'
    },
    cyclistCategory: {
        'standard': 'velo-standard',
        'electric': 'velo-electrique'
    },
    interactionType: {
        'solo': 'seul',
        'with_vehicle': 'avec-vehicule',
        'with_pedestrian': 'avec-pieton',
        'with_infrastructure': 'avec-infrastructure',
        'unknown': 'interaction-inconnue'
    },
    vehicleType: {
        '01': 'bicycle',
        '02': 'cyclomoteur',
        '03': 'voiturette',
        '07': 'voiture',
        '10': 'utilitaire',
        '13': 'poids-lourd-leger',
        '14': 'poids-lourd-lourd',
        '15': 'poids-lourd-remorque',
        '16': 'tracteur-routier',
        '17': 'tracteur-semi',
        '30': 'scooter-50',
        '31': 'moto-125',
        '32': 'scooter-125',
        '33': 'moto-plus125',
        '34': 'scooter-plus125',
        '35': 'quad-leger',
        '36': 'quad-lourd',
        '37': 'autobus',
        '38': 'autocar',
        '39': 'train',
        '40': 'tramway',
        '50': 'edpm-moteur',
        '60': 'edpm-sans-moteur',
        '80': 'velo-electrique',
        '99': 'autre-vehicule',
        '00': 'inconnu'
    }
};

export const VIZ_CONFIG = {
    dimensions: {
        width: 750,
        height: 750,
        radiusRatio: 20,
        minRadiusScale: 0.2,
        maxRadiusScale: 0.85,
        padding: 0.01,
        legendWidth: 200,
        legendItemHeight: 25
    },
    colors: {
        defaultColor: "#ccc",
        backgroundColor: "#f8f9fa",
        textColor: "#333333",
        highlightColor: "#ff7f0e",
        opacity: {
            default: 0.8,
            highlight: 1.0,
            fade: 0.3
        }
    },
    // colorScales: {
    //     timeOfDay: {
    //         title: "Moment de la journée",
    //         domain: ['plein-jour', 'crepuscule', 'nuit-sans-eclairage', 'nuit-eclairage-eteint', 'nuit-eclairage-allume'],
    //         range: ['#ffd700', '#ffa500', '#2c3e50', '#34495e', '#7f8c8d'],
    //         labels: {
    //             'plein-jour': 'Plein jour',
    //             'crepuscule': 'Crépuscule',
    //             'nuit-sans-eclairage': 'Nuit (sans éclairage)',
    //             'nuit-eclairage-eteint': 'Nuit (éclairage éteint)',
    //             'nuit-eclairage-allume': 'Nuit (éclairage allumé)'
    //         }
    //     },
    //     weather: {
    //         title: "Conditions météo",
    //         domain: ['normal', 'pluie-legere', 'pluie-forte', 'neige-grele', 'brouillard', 'vent-tempete', 'temps-eblouissant', 'temps-couvert', 'autre-meteo'],
    //         range: ['#66c2a5', '#8da0cb', '#6baed6', '#a6cee3', '#b2df8a', '#e31a1c', '#fb9a99', '#fdbf6f', '#cab2d6'],
    //         labels: {
    //             'normal': 'Normal',
    //             'pluie-legere': 'Pluie légère',
    //             'pluie-forte': 'Pluie forte',
    //             'neige-grele': 'Neige/Grêle',
    //             'brouillard': 'Brouillard',
    //             'vent-tempete': 'Vent/Tempête',
    //             'temps-eblouissant': 'Éblouissant',
    //             'temps-couvert': 'Couvert',
    //             'autre-meteo': 'Autre'
    //         }
    //     },
    //     location: {
    //         title: "Type de localisation",
    //         domain: ['en-agglomeration', 'hors-agglomeration'],
    //         range: ['#e78ac3', '#a6d854'],
    //         labels: {
    //             'en-agglomeration': 'Zone urbaine',
    //             'hors-agglomeration': 'Zone rurale'
    //         }
    //     },
    //     roadType: {
    //         title: "Type de route",
    //         domain: ['autoroute', 'nationale', 'departementale', 'communale', 'metropole', 'autre-route'],
    //         range: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#999999'],
    //         labels: {
    //             'autoroute': 'Autoroute',
    //             'nationale': 'Nationale',
    //             'departementale': 'Départementale',
    //             'communale': 'Communale',
    //             'metropole': 'Métropole',
    //             'autre-route': 'Autre'
    //         }
    //     },
    //     cyclePath: {
    //         title: "Aménagement cyclable",
    //         domain: ['standard', 'piste-cyclable', 'bande-cyclable', 'voie-reservee'],
    //         range: ['#999999', '#66c2a5', '#fc8d62', '#8da0cb'],
    //         labels: {
    //             'standard': 'Sans aménagement',
    //             'piste-cyclable': 'Piste cyclable',
    //             'bande-cyclable': 'Bande cyclable',
    //             'voie-reservee': 'Voie réservée'
    //         }
    //     },
    //     interactionType: {
    //         title: "Type d'interaction",
    //         domain: ['seul', 'avec-vehicule', 'avec-pieton', 'avec-infrastructure', 'interaction-inconnue'],
    //         range: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854'],
    //         labels: {
    //             'seul': 'Accident seul',
    //             'avec-vehicule': 'Avec véhicule',
    //             'avec-pieton': 'Avec piéton',
    //             'avec-infrastructure': 'Avec obstacle',
    //             'interaction-inconnue': 'Interaction inconnue'
    //         }
    //     },
    //     collision: {
    //         title: "Type de collision",
    //         domain: ['collision-frontale', 'collision-arriere', 'collision-cote', 'collision-chaine', 'collision-multiple', 'autre-collision', 'sans-collision'],
    //         range: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628'],
    //         labels: {
    //             'collision-frontale': 'Frontale',
    //             'collision-arriere': 'Par l\'arrière',
    //             'collision-cote': 'Par le côté',
    //             'collision-chaine': 'En chaîne',
    //             'collision-multiple': 'Multiple',
    //             'autre-collision': 'Autre collision',
    //             'sans-collision': 'Sans collision'
    //         }
    //     },
    //     maneuver: {
    //         title: "Manœuvre",
    //         domain: ['sans-changement', 'changement-direction', 'depassement', 'stationnement', 'traversee', 'autre-manoeuvre'],
    //         range: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02'],
    //         labels: {
    //             'sans-changement': 'En ligne droite',
    //             'changement-direction': 'Changement de direction',
    //             'depassement': 'Dépassement',
    //             'stationnement': 'Stationnement',
    //             'traversee': 'Traversée',
    //             'autre-manoeuvre': 'Autre manœuvre'
    //         }
    //     },
    //     severity: {
    //         title: "Gravité des blessures",
    //         domain: ['indemne', 'blesse-leger', 'hospitalise', 'tue'],
    //         range: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3'],
    //         labels: {
    //             'indemne': 'Indemne',
    //             'blesse-leger': 'Blessure légère',
    //             'hospitalise': 'Hospitalisé',
    //             'tue': 'Fatal'
    //         }
    //     },
    //     cycleType: {
    //         title: "Type de vélo",
    //         domain: ['velo-standard', 'velo-electrique'],
    //         range: ['#1f78b4', '#33a02c'],
    //         labels: {
    //             'velo-standard': 'Vélo standard',
    //             'velo-electrique': 'Vélo électrique'
    //         }
    //     }
    // },
    // Replace the colorScales in VIZ_CONFIG with this improved version
    // This uses more distinct color schemes with better contrast

    colorScales: {
        timeOfDay: {
            title: "Moment de la journée",
            domain: ['plein-jour', 'crepuscule', 'nuit-sans-eclairage', 'nuit-eclairage-eteint', 'nuit-eclairage-allume'],
            range: ['#FFA500', '#FF6347', '#191970', '#483D8B', '#6A5ACD'],
            labels: {
                'plein-jour': 'Plein jour',
                'crepuscule': 'Crépuscule',
                'nuit-sans-eclairage': 'Nuit (sans éclairage)',
                'nuit-eclairage-eteint': 'Nuit (éclairage éteint)',
                'nuit-eclairage-allume': 'Nuit (éclairage allumé)'
            }
        },
        weather: {
            title: "Conditions météo",
            domain: ['normal', 'pluie-legere', 'pluie-forte', 'neige-grele', 'brouillard', 'vent-tempete', 'temps-eblouissant', 'temps-couvert', 'autre-meteo'],
            range: ['#4CAF50', '#81C784', '#1976D2', '#0D47A1', '#B2EBF2', '#F44336', '#FFEB3B', '#78909C', '#9C27B0'],
            labels: {
                'normal': 'Normal',
                'pluie-legere': 'Pluie légère',
                'pluie-forte': 'Pluie forte',
                'neige-grele': 'Neige/Grêle',
                'brouillard': 'Brouillard',
                'vent-tempete': 'Vent/Tempête',
                'temps-eblouissant': 'Éblouissant',
                'temps-couvert': 'Couvert',
                'autre-meteo': 'Autre'
            }
        },
        location: {
            title: "Type de localisation",
            domain: ['en-agglomeration', 'hors-agglomeration'],
            range: ['#D81B60', '#2E7D32'],
            labels: {
                'en-agglomeration': 'Zone urbaine',
                'hors-agglomeration': 'Zone rurale'
            }
        },
        roadType: {
            title: "Type de route",
            domain: ['autoroute', 'nationale', 'departementale', 'communale', 'metropole', 'autre-route'],
            range: ['#B71C1C', '#1565C0', '#33691E', '#6A1B9A', '#EF6C00', '#546E7A'],
            labels: {
                'autoroute': 'Autoroute',
                'nationale': 'Nationale',
                'departementale': 'Départementale',
                'communale': 'Communale',
                'metropole': 'Métropole',
                'autre-route': 'Autre'
            }
        },
        cyclePath: {
            title: "Aménagement cyclable",
            domain: ['standard', 'piste-cyclable', 'bande-cyclable', 'voie-reservee'],
            range: ['#757575', '#00897B', '#E65100', '#3949AB'],
            labels: {
                'standard': 'Sans aménagement',
                'piste-cyclable': 'Piste cyclable',
                'bande-cyclable': 'Bande cyclable',
                'voie-reservee': 'Voie réservée'
            }
        },
        interactionType: {
            title: "Type d'interaction",
            domain: ['seul', 'avec-vehicule', 'avec-pieton', 'avec-infrastructure', 'interaction-inconnue'],
            range: ['#00ACC1', '#FF5722', '#5E35B1', '#827717', '#8D6E63'],
            labels: {
                'seul': 'Accident seul',
                'avec-vehicule': 'Avec véhicule',
                'avec-pieton': 'Avec piéton',
                'avec-infrastructure': 'Avec obstacle',
                'interaction-inconnue': 'Interaction inconnue'
            }
        },
        collision: {
            title: "Type de collision",
            domain: ['collision-frontale', 'collision-arriere', 'collision-cote', 'collision-chaine', 'collision-multiple', 'autre-collision', 'sans-collision'],
            range: ['#D32F2F', '#1976D2', '#388E3C', '#7B1FA2', '#FBC02D', '#E64A19', '#5D4037'],
            labels: {
                'collision-frontale': 'Frontale',
                'collision-arriere': 'Par l\'arrière',
                'collision-cote': 'Par le côté',
                'collision-chaine': 'En chaîne',
                'collision-multiple': 'Multiple',
                'autre-collision': 'Autre collision',
                'sans-collision': 'Sans collision'
            }
        },
        maneuver: {
            title: "Manœuvre",
            domain: ['sans-changement', 'changement-direction', 'depassement', 'stationnement', 'traversee', 'autre-manoeuvre'],
            range: ['#0288D1', '#D81B60', '#689F38', '#FFA000', '#5E35B1', '#607D8B'],
            labels: {
                'sans-changement': 'En ligne droite',
                'changement-direction': 'Changement de direction',
                'depassement': 'Dépassement',
                'stationnement': 'Stationnement',
                'traversee': 'Traversée',
                'autre-manoeuvre': 'Autre manœuvre'
            }
        },
        severity: {
            title: "Gravité des blessures",
            domain: ['indemne', 'blesse-leger', 'hospitalise', 'tue'],
            range: ['#4CAF50', '#FFC107', '#FF9800', '#F44336'],
            labels: {
                'indemne': 'Indemne',
                'blesse-leger': 'Blessure légère',
                'hospitalise': 'Hospitalisé',
                'tue': 'Fatal'
            }
        },
        cycleType: {
            title: "Type de vélo",
            domain: ['velo-standard', 'velo-electrique'],
            range: ['#2196F3', '#4CAF50'],
            labels: {
                'velo-standard': 'Vélo standard',
                'velo-electrique': 'Vélo électrique'
            }
        }
    },

    animation: {
        duration: 750,
        delay: 50
    },
    levels: [
        { id: 'timeOfDay', name: 'Moment de la journée' },
        { id: 'weather', name: 'Conditions météo' },
        { id: 'location', name: 'Localisation' },
        { id: 'roadType', name: 'Type de route' },
        { id: 'cyclePath', name: 'Aménagement cyclable' },
        { id: 'interactionType', name: 'Type d\'interaction' },
        { id: 'collision', name: 'Type de collision' },
        { id: 'maneuver', name: 'Manœuvre' },
        { id: 'severity', name: 'Gravité' },
        { id: 'cycleType', name: 'Type de vélo' }
    ]
};

export class AccidentSequences {
    constructor() {
        this.processor = new DataProcessor();
        this.bicycleAccidents = [];
        this.analyzedAccidents = [];
        this.sequencePatterns = {};
    }

    // async createHierarchicalData() {
    //     try {
    //         // Load and process accidents
    //         const accidents = await this.processor.loadAllYearsData();
    //         this.bicycleAccidents = accidents;

    //         // Analyze accidents to extract patterns and contexts
    //         this.analyzedAccidents = this.enrichAccidentData(accidents);

    //         // Convert to sequences for hierarchical structure
    //         const sequences = this.extractSequences(this.analyzedAccidents);

    //         // Build hierarchy for visualization
    //         const hierarchy = this.buildHierarchy(sequences);

    //         // Return the hierarchical data
    //         return hierarchy;
    //     } catch (error) {
    //         console.error("Error creating hierarchical data:", error);
    //         throw error;
    //     }
    // }

    enrichAccidentData(accidents) {
        return accidents.map(accident => {
            try {
                // Find bicycle vehicle in this accident
                const bicycleVehicle = this.findBicycleVehicle(accident);
                if (!bicycleVehicle) {
                    return { ...accident, sequence: null, isMissingData: true };
                }

                // Find cyclist user
                const cyclist = this.findCyclistUser(accident, bicycleVehicle);

                // Get accident context
                const context = this.getAccidentContext(accident, bicycleVehicle, cyclist);

                // Analyze interaction (solo, with vehicle, etc.)
                const interaction = this.analyzeInteraction(accident, bicycleVehicle);

                // Get cyclist details if available
                const cyclistDetails = cyclist ? {
                    age: this.calculateAge(cyclist.an_nais, accident.an),
                    gender: cyclist.sexe === '1' ? 'male' : 'female',
                    tripPurpose: ACCIDENT_MAPPINGS.tripPurpose[cyclist.trajet] || 'inconnu',
                    severity: ACCIDENT_MAPPINGS.gravity[cyclist.grav] || 'inconnu',
                    safetyEquipment: this.analyzeSafetyEquipment(cyclist)
                } : null;

                // Get infrastructure details
                const infrastructure = this.analyzeInfrastructure(accident);

                // Get temporal context
                const temporalContext = {
                    year: parseInt(accident.an),
                    month: parseInt(accident.mois),
                    day: parseInt(accident.jour),
                    hour: this.parseHour(accident.hrmn)
                };

                // Create enriched accident object
                return {
                    ...accident,
                    bicycleVehicle,
                    cyclist,
                    context,
                    interaction,
                    cyclistDetails,
                    infrastructure,
                    temporalContext,
                    sequence: this.createSequence({
                        accident,
                        bicycleVehicle,
                        cyclist,
                        context,
                        interaction,
                        cyclistDetails,
                        infrastructure
                    })
                };
            } catch (error) {
                console.error("Error processing accident:", error, accident);
                return { ...accident, sequence: null, processingError: true };
            }
        });
    }

    findBicycleVehicle(accident) {
        if (!accident.vehicleData) {
            // Try to get vehicle data from the vehicules field if it's not explicitly available
            const vehicleId = this.processor.normalizeId(accident.Num_Acc);
            const year = accident.year;

            if (this.processor.yearlyData[year]?.vehicules) {
                accident.vehicleData = this.processor.yearlyData[year].vehicules.filter(v =>
                    this.processor.normalizeId(v.Num_Acc) === vehicleId
                );
            }
        }

        // Check both vehicules array (from processor) and users array 
        // (which might contain id_vehicule references)
        const vehicles = accident.vehicleData || [];

        // Find bicycle or electric bicycle
        return vehicles.find(v =>
            v.catv && ['1', '01', '80'].includes(v.catv.toString().trim())
        );
    }

    findCyclistUser(accident, bicycleVehicle) {
        if (!bicycleVehicle) return null;

        const bicycleId = bicycleVehicle.id_vehicule || bicycleVehicle.Num_Veh;

        // Find cyclist (driver) among users
        return (accident.users || []).find(u =>
            (u.id_vehicule === bicycleId || u.Num_Veh === bicycleId) &&
            u.catu === '1' // Driver
        );
    }

    getAccidentContext(accident, bicycleVehicle, cyclist) {
        return {
            timeOfDay: ACCIDENT_MAPPINGS.timeOfDay[accident.lum] || 'inconnu',
            weather: ACCIDENT_MAPPINGS.weather[accident.atm] || 'inconnu',
            location: ACCIDENT_MAPPINGS.location[accident.agg] || 'inconnu',
            intersection: ACCIDENT_MAPPINGS.intersection[accident.int] || 'inconnu',
            collisionType: ACCIDENT_MAPPINGS.collision[accident.col] || 'inconnu',
            cycleType: bicycleVehicle.catv === '80' ? 'velo-electrique' : 'velo-standard',
            surface: ACCIDENT_MAPPINGS.surface[accident.location_details?.surf] || 'inconnu',
            maneuver: ACCIDENT_MAPPINGS.maneuver[bicycleVehicle?.manv] || 'inconnu',
            impactPoint: ACCIDENT_MAPPINGS.impactPoint[bicycleVehicle?.choc] || 'inconnu',
            speedLimit: accident.location_details?.vma || 'inconnu'
        };
    }

    analyzeInteraction(accident, bicycleVehicle) {
        if (!bicycleVehicle) return { type: 'unknown' };

        let interactionType = 'solo';
        let interactingVehicleType = null;
        let interactingObstacle = null;

        // Check if any obstacles were hit
        if (bicycleVehicle.obs && bicycleVehicle.obs !== '0' && bicycleVehicle.obs !== '-1') {
            interactionType = 'with_infrastructure';
            interactingObstacle = ACCIDENT_MAPPINGS.obstacle[bicycleVehicle.obs] || 'inconnu';
        }

        // Check for mobile obstacles
        if (bicycleVehicle.obsm && bicycleVehicle.obsm !== '0' && bicycleVehicle.obsm !== '-1') {
            if (bicycleVehicle.obsm === '1') {
                interactionType = 'with_pedestrian';
            } else if (bicycleVehicle.obsm === '2') {
                interactionType = 'with_vehicle';
            } else {
                interactionType = 'with_infrastructure';
                interactingObstacle = ACCIDENT_MAPPINGS.obstacleMobile[bicycleVehicle.obsm] || 'autre-obstacle';
            }
        }

        // If there are other vehicles, identify the main one interacting with the bicycle
        if (accident.vehicleData && accident.vehicleData.length > 1) {
            const otherVehicles = accident.vehicleData.filter(v =>
                v.id_vehicule !== bicycleVehicle.id_vehicule &&
                v.Num_Veh !== bicycleVehicle.Num_Veh
            );

            if (otherVehicles.length > 0) {
                // If the interaction is still 'solo', change it to 'with_vehicle'
                if (interactionType === 'solo') {
                    interactionType = 'with_vehicle';
                }

                // Get the type of the interacting vehicle
                interactingVehicleType = otherVehicles[0].catv ?
                    ACCIDENT_MAPPINGS.vehicleType[otherVehicles[0].catv.toString().trim()] || 'inconnu' :
                    'inconnu';
            }
        }

        return {
            type: interactionType,
            vehicleType: interactingVehicleType,
            obstacle: interactingObstacle
        };
    }

    analyzeInfrastructure(accident) {
        if (!accident.location_details) return { type: 'unknown' };

        return {
            roadType: ACCIDENT_MAPPINGS.roadType[accident.location_details.catr] || 'inconnu',
            cyclePath: ACCIDENT_MAPPINGS.vosp[accident.location_details.vosp] || 'standard',
            infrastructure: ACCIDENT_MAPPINGS.infra[accident.location_details.infra] || 'aucun',
            profile: accident.location_details.prof,
            plan: accident.location_details.plan
        };
    }

    analyzeSafetyEquipment(cyclist) {
        if (!cyclist) return ['inconnu'];

        // Filter out unknown values and map to readable labels
        const equipment = [];

        if (cyclist.secu1 && cyclist.secu1 !== '-1' && cyclist.secu1 !== '0') {
            equipment.push(ACCIDENT_MAPPINGS.safetyEquipment[cyclist.secu1]);
        }

        if (cyclist.secu2 && cyclist.secu2 !== '-1' && cyclist.secu2 !== '0') {
            equipment.push(ACCIDENT_MAPPINGS.safetyEquipment[cyclist.secu2]);
        }

        if (cyclist.secu3 && cyclist.secu3 !== '-1' && cyclist.secu3 !== '0') {
            equipment.push(ACCIDENT_MAPPINGS.safetyEquipment[cyclist.secu3]);
        }

        return equipment.length > 0 ? equipment : ['aucun'];
    }

    calculateAge(birthYearStr, accidentYearStr) {
        if (!birthYearStr || !accidentYearStr) return null;

        const birthYear = parseInt(birthYearStr);
        const accidentYear = parseInt(accidentYearStr);

        if (isNaN(birthYear) || isNaN(accidentYear)) return null;

        return accidentYear - birthYear;
    }

    parseHour(hrmn) {
        if (!hrmn) return null;

        // Handle different formats (HHMM or H:MM)
        if (hrmn.includes(':')) {
            const parts = hrmn.split(':');
            return parseInt(parts[0]);
        }

        // Try to extract hours from HHMM format
        return parseInt(hrmn.substring(0, Math.min(2, hrmn.length)));
    }

    createSequence(data) {
        const { accident, context, interaction, infrastructure, cyclistDetails } = data;

        // Initialize sequence items with meaningful categories
        const timeOfDay = context.timeOfDay;
        const weather = context.weather;
        const location = context.location;
        const roadType = infrastructure.roadType;
        const cyclePath = infrastructure.cyclePath;
        const interactionType = ACCIDENT_MAPPINGS.interactionType[interaction.type] || 'interaction-inconnue';
        const collision = context.collisionType;

        // Group maneuvers into broader categories for better visualization
        let maneuver = 'autre-manoeuvre';
        if (context.maneuver.includes('changement') ||
            context.maneuver.includes('tournant') ||
            context.maneuver.includes('deporte')) {
            maneuver = 'changement-direction';
        } else if (context.maneuver.includes('depassement')) {
            maneuver = 'depassement';
        } else if (context.maneuver.includes('stationnement')) {
            maneuver = 'stationnement';
        } else if (context.maneuver.includes('traversant')) {
            maneuver = 'traversee';
        } else if (context.maneuver === 'sans-changement' ||
            context.maneuver === 'meme-sens-file') {
            maneuver = 'sans-changement';
        }

        // Determine severity from cyclist or other users if available
        let severity = 'inconnu';
        if (cyclistDetails && cyclistDetails.severity) {
            severity = cyclistDetails.severity;
        } else if (accident.users && accident.users.length > 0) {
            // Find the most severe injury
            const gravities = accident.users
                .map(u => parseInt(u.grav))
                .filter(g => !isNaN(g));

            if (gravities.length > 0) {
                // Lower values are more severe in the BAAC system
                const mostSevere = Math.min(...gravities);
                severity = ACCIDENT_MAPPINGS.gravity[mostSevere] || 'inconnu';
            }
        }

        // Determine cycle type
        const cycleType = context.cycleType;

        // Combine into final sequence
        // We only include valid values to keep sequences meaningful
        return {
            timeOfDay,
            weather,
            location,
            roadType,
            cyclePath,
            interactionType,// Continuing from where we left off in the createSequence method
            collision,
            maneuver,
            severity,
            cycleType
        };
    }
    // In the AccidentSequences class, ensure extractSequences works correctly with any level order:

    extractSequences(enrichedAccidents, levelOrder = null) {
        console.log("Extracting sequences with level order:", levelOrder);

        // Filter out accidents that couldn't be processed
        const validAccidents = enrichedAccidents.filter(accident =>
            accident.sequence && !accident.isMissingData && !accident.processingError
        );

        // Use provided level order or default to VIZ_CONFIG.levels
        const levelIds = levelOrder || VIZ_CONFIG.levels.map(level => level.id);

        console.log(`Using level order: ${levelIds.join(', ')}`);

        // Convert to sequence format expected by hierarchical visualization
        return validAccidents.map(accident => {
            const seq = accident.sequence;

            // Create an array of sequence elements aligned with the provided level order
            const sequenceArray = levelIds.map(levelId => {
                switch (levelId) {
                    case 'timeOfDay': return seq.timeOfDay || 'inconnu';
                    case 'weather': return seq.weather || 'inconnu';
                    case 'location': return seq.location || 'inconnu';
                    case 'roadType': return seq.roadType || 'inconnu';
                    case 'cyclePath': return seq.cyclePath || 'standard';
                    case 'interactionType': return seq.interactionType || 'interaction-inconnue';
                    case 'collision': return seq.collision || 'inconnu';
                    case 'maneuver': return seq.maneuver || 'autre-manoeuvre';
                    case 'severity': return seq.severity || 'inconnu';
                    case 'cycleType': return seq.cycleType || 'velo-standard';
                    default: return 'inconnu';
                }
            });

            return {
                sequence: sequenceArray.join('-'),
                rawSequence: sequenceArray,
                value: 1,  // Each accident counts as 1
                accident: accident  // Reference to full accident data if needed
            };
        });
    }

    // Make sure createHierarchicalData works with our modifications:
    async createHierarchicalData(levelOrder = null) {
        try {
            // Load and process accidents
            const accidents = await this.processor.loadAllYearsData();
            this.bicycleAccidents = accidents;

            // Analyze accidents to extract patterns and contexts
            this.analyzedAccidents = this.enrichAccidentData(accidents);

            // Convert to sequences for hierarchical structure with specified level order
            const sequences = this.extractSequences(this.analyzedAccidents, levelOrder);

            // Build hierarchy for visualization
            const hierarchy = this.buildHierarchy(sequences);

            // Return the hierarchical data
            return hierarchy;
        } catch (error) {
            console.error("Error creating hierarchical data:", error);
            throw error;
        }
    }
    // extractSequences(enrichedAccidents) {
    //     // Filter out accidents that couldn't be processed
    //     const validAccidents = enrichedAccidents.filter(accident =>
    //         accident.sequence && !accident.isMissingData && !accident.processingError
    //     );

    //     // Convert to sequence format expected by hierarchical visualization
    //     return validAccidents.map(accident => {
    //         const seq = accident.sequence;

    //         // Create an array of sequence elements in consistent order
    //         // This allows visualization to correctly group related accidents
    //         const sequenceArray = [
    //             seq.timeOfDay || 'inconnu',
    //             seq.weather || 'inconnu',
    //             seq.location || 'inconnu',
    //             seq.roadType || 'inconnu',
    //             seq.cyclePath || 'standard',
    //             seq.interactionType || 'interaction-inconnue',
    //             seq.collision || 'inconnu',
    //             seq.maneuver || 'autre-manoeuvre',
    //             seq.severity || 'inconnu',
    //             seq.cycleType || 'velo-standard'
    //         ];

    //         return {
    //             sequence: sequenceArray.join('-'),
    //             rawSequence: sequenceArray,
    //             value: 1,  // Each accident counts as 1
    //             accident: accident  // Reference to full accident data if needed
    //         };
    //     });
    // }


    // Add this function to your AccidentSequences class to properly map level IDs to sequence positions
    getLevelPosition(levelId) {
        return VIZ_CONFIG.levels.findIndex(level => level.id === levelId);
    }

    // Add this helper function to standardize the category names
    getNormalizedCategoryName(levelId, value) {
        // Make sure we're using the standardized name for this category
        // This helps when the same data might have different representations
        if (VIZ_CONFIG.colorScales[levelId] &&
            VIZ_CONFIG.colorScales[levelId].domain.includes(value)) {
            return value;
        }
        return 'inconnu'; // Default fallback
    }
    buildHierarchy(sequences) {
        const root = { name: "root", children: [] };

        sequences.forEach(({ sequence, rawSequence, value, accident }) => {
            let currentNode = root;

            // Process each level of the hierarchy
            rawSequence.forEach((name, index) => {
                // If we haven't initialized the children array yet, do so
                if (!currentNode.children) {
                    currentNode.children = [];
                }

                // Check if this child already exists
                let childNode = currentNode.children.find(node => node.name === name);

                // If not, create it
                if (!childNode) {
                    childNode = {
                        name: name,
                        level: index  // Store the level for reference
                    };
                    currentNode.children.push(childNode);
                }

                // Move to the next level
                currentNode = childNode;
            });

            // At the leaf node, add or increment value
            currentNode.value = (currentNode.value || 0) + value;

            // Store reference to originating accident if needed
            if (!currentNode.accidents) {
                currentNode.accidents = [];
            }
            currentNode.accidents.push(accident);
        });

        // Prune the tree to remove branches with very few accidents
        this.pruneHierarchy(root, 5);  // Minimum 5 accidents to keep a node

        return root;
    }

    pruneHierarchy(node, minCount) {
        // Base case: no children
        if (!node.children || node.children.length === 0) {
            return node.value || 0;
        }

        let totalValue = 0;
        const newChildren = [];

        // Process each child
        for (const child of node.children) {
            const childValue = this.pruneHierarchy(child, minCount);
            totalValue += childValue;

            // Only keep significant branches
            if (childValue >= minCount) {
                newChildren.push(child);
            }
        }

        // Update children array
        node.children = newChildren;

        // If we've eliminated all children but the node accumulated value,
        // convert it to a leaf node with the total value
        if (node.children.length === 0 && totalValue > 0) {
            node.value = totalValue;
            delete node.children;
        }

        return totalValue;
    }

    // Get statistics about the sequences
    getSequenceStatistics() {
        if (this.analyzedAccidents.length === 0) {
            return null;
        }

        const stats = {
            totalAccidents: this.analyzedAccidents.length,
            validSequences: this.analyzedAccidents.filter(a => a.sequence && !a.processingError).length,
            byTimeOfDay: {},
            byWeather: {},
            byLocation: {},
            byRoadType: {},
            byCyclePath: {},
            byInteractionType: {},
            byCollision: {},
            byManeuver: {},
            bySeverity: {},
            byCycleType: {},
            topSequences: []
        };

        // Count occurrences for each dimension
        this.analyzedAccidents.forEach(accident => {
            if (!accident.sequence) return;

            const seq = accident.sequence;

            // Increment counts for each dimension
            incrementCount(stats.byTimeOfDay, seq.timeOfDay);
            incrementCount(stats.byWeather, seq.weather);
            incrementCount(stats.byLocation, seq.location);
            incrementCount(stats.byRoadType, seq.roadType);
            incrementCount(stats.byCyclePath, seq.cyclePath);
            incrementCount(stats.byInteractionType, seq.interactionType);
            incrementCount(stats.byCollision, seq.collision);
            incrementCount(stats.byManeuver, seq.maneuver);
            incrementCount(stats.bySeverity, seq.severity);
            incrementCount(stats.byCycleType, seq.cycleType);
        });

        // Find most common sequences
        const sequenceCounts = {};
        this.analyzedAccidents.forEach(accident => {
            if (!accident.sequence) return;

            const sequence = Object.values(accident.sequence).join('-');
            sequenceCounts[sequence] = (sequenceCounts[sequence] || 0) + 1;
        });

        // Sort and take top 10
        stats.topSequences = Object.entries(sequenceCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([sequence, count]) => ({ sequence, count }));

        return stats;

        // Helper function to increment counts
        function incrementCount(obj, key) {
            if (!key) return;
            obj[key] = (obj[key] || 0) + 1;
        }
    }

    // Additional analysis methods that can be used for exploring the data

    getYearlyTrends() {
        const trends = {
            byYear: {},
            byYearAndSeverity: {},
            byYearAndTimeOfDay: {},
            byYearAndInteraction: {}
        };

        this.analyzedAccidents.forEach(accident => {
            if (!accident.sequence || !accident.temporalContext) return;

            const year = accident.temporalContext.year;
            if (!year) return;

            // Count by year
            trends.byYear[year] = (trends.byYear[year] || 0) + 1;

            // Initialize year objects if they don't exist
            if (!trends.byYearAndSeverity[year]) trends.byYearAndSeverity[year] = {};
            if (!trends.byYearAndTimeOfDay[year]) trends.byYearAndTimeOfDay[year] = {};
            if (!trends.byYearAndInteraction[year]) trends.byYearAndInteraction[year] = {};

            // Count by severity
            const severity = accident.sequence.severity || 'inconnu';
            trends.byYearAndSeverity[year][severity] =
                (trends.byYearAndSeverity[year][severity] || 0) + 1;

            // Count by time of day
            const timeOfDay = accident.sequence.timeOfDay || 'inconnu';
            trends.byYearAndTimeOfDay[year][timeOfDay] =
                (trends.byYearAndTimeOfDay[year][timeOfDay] || 0) + 1;

            // Count by interaction type
            const interaction = accident.sequence.interactionType || 'interaction-inconnue';
            trends.byYearAndInteraction[year][interaction] =
                (trends.byYearAndInteraction[year][interaction] || 0) + 1;
        });

        return trends;
    }

    getSeasonalPatterns() {
        const patterns = {
            byMonth: Array(12).fill(0),
            byMonthAndSeverity: Array(12).fill().map(() => ({})),
            byMonthAndTimeOfDay: Array(12).fill().map(() => ({})),
            byMonthAndWeather: Array(12).fill().map(() => ({}))
        };

        this.analyzedAccidents.forEach(accident => {
            if (!accident.sequence || !accident.temporalContext) return;

            const month = accident.temporalContext.month;
            if (!month || month < 1 || month > 12) return;

            // Adjust to 0-based index
            const monthIndex = month - 1;

            // Count by month
            patterns.byMonth[monthIndex]++;

            // Count by severity
            const severity = accident.sequence.severity || 'inconnu';
            patterns.byMonthAndSeverity[monthIndex][severity] =
                (patterns.byMonthAndSeverity[monthIndex][severity] || 0) + 1;

            // Count by time of day
            const timeOfDay = accident.sequence.timeOfDay || 'inconnu';
            patterns.byMonthAndTimeOfDay[monthIndex][timeOfDay] =
                (patterns.byMonthAndTimeOfDay[monthIndex][timeOfDay] || 0) + 1;

            // Count by weather
            const weather = accident.sequence.weather || 'inconnu';
            patterns.byMonthAndWeather[monthIndex][weather] =
                (patterns.byMonthAndWeather[monthIndex][weather] || 0) + 1;
        });

        return patterns;
    }

    getUrbanVsRural() {
        const comparison = {
            byLocation: {},
            byLocationAndSeverity: {},
            byLocationAndTimeOfDay: {},
            byLocationAndInteraction: {},
            byLocationAndCyclePath: {}
        };

        this.analyzedAccidents.forEach(accident => {
            if (!accident.sequence) return;

            const location = accident.sequence.location || 'inconnu';

            // Count by location
            comparison.byLocation[location] = (comparison.byLocation[location] || 0) + 1;

            // Initialize location objects if they don't exist
            if (!comparison.byLocationAndSeverity[location]) comparison.byLocationAndSeverity[location] = {};
            if (!comparison.byLocationAndTimeOfDay[location]) comparison.byLocationAndTimeOfDay[location] = {};
            if (!comparison.byLocationAndInteraction[location]) comparison.byLocationAndInteraction[location] = {};
            if (!comparison.byLocationAndCyclePath[location]) comparison.byLocationAndCyclePath[location] = {};

            // Count by severity
            const severity = accident.sequence.severity || 'inconnu';
            comparison.byLocationAndSeverity[location][severity] =
                (comparison.byLocationAndSeverity[location][severity] || 0) + 1;

            // Count by time of day
            const timeOfDay = accident.sequence.timeOfDay || 'inconnu';
            comparison.byLocationAndTimeOfDay[location][timeOfDay] =
                (comparison.byLocationAndTimeOfDay[location][timeOfDay] || 0) + 1;

            // Count by interaction type
            const interaction = accident.sequence.interactionType || 'interaction-inconnue';
            comparison.byLocationAndInteraction[location][interaction] =
                (comparison.byLocationAndInteraction[location][interaction] || 0) + 1;

            // Count by cycle path
            const cyclePath = accident.sequence.cyclePath || 'standard';
            comparison.byLocationAndCyclePath[location][cyclePath] =
                (comparison.byLocationAndCyclePath[location][cyclePath] || 0) + 1;
        });

        return comparison;
    }

    getInteractionAnalysis() {
        const analysis = {
            byInteractionType: {},
            byInteractionAndSeverity: {},
            byInteractionAndTimeOfDay: {},
            byInteractionAndLocation: {},
            byInteractionAndManeuver: {},
            totalAccidents: 0
        };

        this.analyzedAccidents.forEach(accident => {
            if (!accident.sequence) return;

            analysis.totalAccidents++;

            const interaction = accident.sequence.interactionType || 'interaction-inconnue';

            // Count by interaction type
            analysis.byInteractionType[interaction] =
                (analysis.byInteractionType[interaction] || 0) + 1;

            // Initialize interaction objects if they don't exist
            if (!analysis.byInteractionAndSeverity[interaction]) analysis.byInteractionAndSeverity[interaction] = {};
            if (!analysis.byInteractionAndTimeOfDay[interaction]) analysis.byInteractionAndTimeOfDay[interaction] = {};
            if (!analysis.byInteractionAndLocation[interaction]) analysis.byInteractionAndLocation[interaction] = {};
            if (!analysis.byInteractionAndManeuver[interaction]) analysis.byInteractionAndManeuver[interaction] = {};

            // Count by severity
            const severity = accident.sequence.severity || 'inconnu';
            analysis.byInteractionAndSeverity[interaction][severity] =
                (analysis.byInteractionAndSeverity[interaction][severity] || 0) + 1;

            // Count by time of day
            const timeOfDay = accident.sequence.timeOfDay || 'inconnu';
            analysis.byInteractionAndTimeOfDay[interaction][timeOfDay] =
                (analysis.byInteractionAndTimeOfDay[interaction][timeOfDay] || 0) + 1;

            // Count by location
            const location = accident.sequence.location || 'inconnu';
            analysis.byInteractionAndLocation[interaction][location] =
                (analysis.byInteractionAndLocation[interaction][location] || 0) + 1;

            // Count by maneuver
            const maneuver = accident.sequence.maneuver || 'autre-manoeuvre';
            analysis.byInteractionAndManeuver[interaction][maneuver] =
                (analysis.byInteractionAndManeuver[interaction][maneuver] || 0) + 1;
        });

        return analysis;
    }

    getCyclePathSafetyAnalysis() {
        const analysis = {
            byCyclePath: {},
            byCyclePathAndSeverity: {},
            byCyclePathAndInteraction: {},
            byCyclePathAndLocation: {},
            totalAccidents: 0
        };

        this.analyzedAccidents.forEach(accident => {
            if (!accident.sequence) return;

            analysis.totalAccidents++;

            const cyclePath = accident.sequence.cyclePath || 'standard';

            // Count by cycle path
            analysis.byCyclePath[cyclePath] =
                (analysis.byCyclePath[cyclePath] || 0) + 1;

            // Initialize cycle path objects if they don't exist
            if (!analysis.byCyclePathAndSeverity[cyclePath]) analysis.byCyclePathAndSeverity[cyclePath] = {};
            if (!analysis.byCyclePathAndInteraction[cyclePath]) analysis.byCyclePathAndInteraction[cyclePath] = {};
            if (!analysis.byCyclePathAndLocation[cyclePath]) analysis.byCyclePathAndLocation[cyclePath] = {};

            // Count by severity
            const severity = accident.sequence.severity || 'inconnu';
            analysis.byCyclePathAndSeverity[cyclePath][severity] =
                (analysis.byCyclePathAndSeverity[cyclePath][severity] || 0) + 1;

            // Count by interaction
            const interaction = accident.sequence.interactionType || 'interaction-inconnue';
            analysis.byCyclePathAndInteraction[cyclePath][interaction] =
                (analysis.byCyclePathAndInteraction[cyclePath][interaction] || 0) + 1;

            // Count by location
            const location = accident.sequence.location || 'inconnu';
            analysis.byCyclePathAndLocation[cyclePath][location] =
                (analysis.byCyclePathAndLocation[cyclePath][location] || 0) + 1;
        });

        return analysis;
    }

    getCommonSequencePatterns() {
        if (this.sequencePatterns.common) {
            return this.sequencePatterns.common;
        }

        // Extract all unique combinations of important factors
        const patterns = [];

        this.analyzedAccidents.forEach(accident => {
            if (!accident.sequence) return;

            const seq = accident.sequence;

            // Focus on the most important factors for pattern detection
            const pattern = {
                location: seq.location || 'inconnu',
                timeOfDay: seq.timeOfDay || 'inconnu',
                interactionType: seq.interactionType || 'interaction-inconnue',
                cyclePath: seq.cyclePath || 'standard',
                maneuver: seq.maneuver || 'autre-manoeuvre',
                severity: seq.severity || 'inconnu',
            };

            // Create a string key for this pattern
            const key = Object.values(pattern).join('-');

            // Find existing pattern or create new one
            let existingPattern = patterns.find(p => p.key === key);
            if (!existingPattern) {
                existingPattern = {
                    key,
                    pattern,
                    count: 0,
                    accidents: []
                };
                patterns.push(existingPattern);
            }

            // Increment count and add to accidents list
            existingPattern.count++;
            existingPattern.accidents.push(accident);
        });

        // Sort patterns by frequency
        patterns.sort((a, b) => b.count - a.count);

        // Store and return the results
        this.sequencePatterns.common = patterns;
        return patterns;
    }
}