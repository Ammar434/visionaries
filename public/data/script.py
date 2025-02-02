import pandas as pd
import numpy as np

class AccidentDataCleaner:
    def __init__(self):
        self.vehicules = None
        self.usagers = None
        self.lieux = None
        self.caracteristiques = None
        self.bicycle_accidents = None

    def load_data(self, year=2022):
        """Load all CSV files"""
        try:
            self.vehicules = pd.read_csv(f'vehicules-{year}.csv', sep=';', encoding='utf-8')
            self.usagers = pd.read_csv(f'usagers-{year}.csv', sep=';', encoding='utf-8')
            self.lieux = pd.read_csv(f'lieux-{year}.csv', sep=';', encoding='utf-8')
            self.caracteristiques = pd.read_csv(f'caracteristiques-{year}.csv', sep=';', encoding='utf-8')
            
            print("Data loaded successfully")
        except Exception as e:
            print(f"Error loading data: {e}")
            raise

    def clean_vehicules(self):
        """Clean vehicules dataset and filter for bicycles"""
        if self.vehicules is None:
            raise ValueError("Data not loaded. Call load_data() first.")

        # Clean vehicle data
        self.vehicules = self.vehicules.copy()
        
        # Convert catv to string and strip whitespace
        self.vehicules['catv'] = self.vehicules['catv'].astype(str).str.strip()
        
        # Filter only bicycle accidents (catv = '1' or '01')
        bicycle_vehicles = self.vehicules[self.vehicules['catv'].isin(['1', '01'])]
        
        # Get unique accident IDs involving bicycles
        self.bicycle_accident_ids = set(bicycle_vehicles['Num_Acc'].unique())
        
        return bicycle_vehicles

    def clean_usagers(self):
        """Clean usagers dataset"""
        if self.usagers is None:
            raise ValueError("Data not loaded. Call load_data() first.")

        # Clean users data
        self.usagers = self.usagers.copy()
        
        # Calculate age from birth year
        current_year = 2022
        self.usagers['age'] = current_year - pd.to_numeric(self.usagers['an_nais'], errors='coerce')
        
        # Filter users involved in bicycle accidents
        users_in_bicycle_accidents = self.usagers[self.usagers['Num_Acc'].isin(self.bicycle_accident_ids)]
        
        return users_in_bicycle_accidents

    def clean_lieux(self):
        """Clean lieux dataset"""
        if self.lieux is None:
            raise ValueError("Data not loaded. Call load_data() first.")

        # Clean location data
        self.lieux = self.lieux.copy()
        
        # Filter locations of bicycle accidents
        locations_of_bicycle_accidents = self.lieux[self.lieux['Num_Acc'].isin(self.bicycle_accident_ids)]
        
        return locations_of_bicycle_accidents

    def clean_caracteristiques(self):
        """Clean caracteristiques dataset"""
        if self.caracteristiques is None:
            raise ValueError("Data not loaded. Call load_data() first.")

        # Clean characteristics data
        self.caracteristiques = self.caracteristiques.copy()
        
        # Convert latitude and longitude to numeric, handling French number format
        for col in ['lat', 'long']:
            if col in self.caracteristiques.columns:
                self.caracteristiques[col] = (self.caracteristiques[col]
                    .str.replace(',', '.')
                    .astype(float))
        
        # Filter characteristics of bicycle accidents
        characteristics_of_bicycle_accidents = self.caracteristiques[
            self.caracteristiques['Accident_Id'].isin(self.bicycle_accident_ids)
        ]
        
        return characteristics_of_bicycle_accidents

    def process_all_data(self):
        """Process all datasets and save cleaned versions"""
        try:
            # Clean vehicules first to get bicycle accident IDs
            clean_vehicules = self.clean_vehicules()
            clean_usagers = self.clean_usagers()
            clean_lieux = self.clean_lieux()
            clean_caracteristiques = self.clean_caracteristiques()
            
            # Save cleaned datasets
            clean_vehicules.to_csv('clean-vehicules-2022.csv', index=False, sep=';')
            clean_usagers.to_csv('clean-usagers-2022.csv', index=False, sep=';')
            clean_lieux.to_csv('clean-lieux-2022.csv', index=False, sep=';')
            clean_caracteristiques.to_csv('clean-caracteristiques-2022.csv', index=False, sep=';')
            
            print("All files have been cleaned and saved successfully")
            
            # Return summary statistics
            return {
                'total_bicycle_accidents': len(self.bicycle_accident_ids),
                'total_users_involved': len(clean_usagers),
                'total_vehicles_involved': len(clean_vehicules),
                'total_locations': len(clean_lieux)
            }
            
        except Exception as e:
            print(f"Error processing data: {e}")
            raise

def main():
    # Create cleaner instance
    cleaner = AccidentDataCleaner()
    
    # Load and process data
    cleaner.load_data()
    stats = cleaner.process_all_data()
    
    # Print summary statistics
    print("\nSummary Statistics:")
    for key, value in stats.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    main()