import pandas as pd
import numpy as np

class AccidentDataCleaner:
    def __init__(self):
        self.vehicules = None
        self.usagers = None
        self.lieux = None
        self.caracteristiques = None
        self.bicycle_accidents = None

    def load_data(self, year):
        """Load all CSV files with correct encodings"""
        try:
            # self.caracteristiques = pd.read_csv(f'{year}/caracteristiques_{year}.csv', sep=',', encoding='cp1252')
            self.caracteristiques = pd.read_csv(f'{year}/caracteristiques-{year}.csv', sep=';', encoding='iso-8859-1',low_memory=False)
            self.vehicules = pd.read_csv(f'{year}/vehicules-{year}.csv', sep=';', encoding='utf-8',low_memory=False)
            self.usagers = pd.read_csv(f'{year}/usagers-{year}.csv', sep=';', encoding='utf-8',low_memory=False)
            self.lieux = pd.read_csv(f'{year}/lieux-{year}.csv', sep=';', encoding='utf-8',low_memory=False)
            
            print("Data loaded successfully")
        except Exception as e:
            print(f"Error loading data: {e}")
            raise

    def clean_caracteristiques(self):
        """Clean caracteristiques dataset"""
        if self.caracteristiques is None:
            raise ValueError("Data not loaded. Call load_data() first.")

        # Clean characteristics data
        self.caracteristiques = self.caracteristiques.copy()
        
        # No need to convert lat/long as they are already float type
        
        # Filter characteristics of bicycle accidents using Num_Acc instead of Accident_Id
        characteristics_of_bicycle_accidents = self.caracteristiques[
            self.caracteristiques['Num_Acc'].isin(self.bicycle_accident_ids)
        ]
        
        return characteristics_of_bicycle_accidents

    def clean_vehicules(self):
        """Clean vehicules dataset and filter for bicycles"""
        if self.vehicules is None:
            raise ValueError("Data not loaded. Call load_data() first.")

        # Clean vehicle data
        self.vehicules = self.vehicules.copy()
        
        # catv is already an integer type, no need to convert to string
        # Filter only bicycle accidents (catv = 1)
        bicycle_vehicles = self.vehicules[self.vehicules['catv'] == 1]
        
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

    
    def process_all_data(self, year):
        """Process all datasets and save cleaned versions"""
        try:
            # Clean vehicules first to get bicycle accident IDs
            clean_vehicules = self.clean_vehicules()
            clean_usagers = self.clean_usagers()
            clean_lieux = self.clean_lieux()
            clean_caracteristiques = self.clean_caracteristiques()
            
            # Save cleaned datasets
            clean_vehicules.to_csv(f'{year}/clean-vehicules-{year}.csv', index=False, sep=';')
            clean_usagers.to_csv(f'{year}/clean-usagers-{year}.csv', index=False, sep=';')
            clean_lieux.to_csv(f'{year}/clean-lieux-{year}.csv', index=False, sep=';')
            clean_caracteristiques.to_csv(f'{year}/clean-caracteristiques-{year}.csv', index=False, sep=';')
            
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
    for i in range(2023,2024):
        print(i)
        # Create cleaner instance
        cleaner = AccidentDataCleaner()
        
        # Load and process data
        cleaner.load_data(year=i)
        stats = cleaner.process_all_data(year=i)
        
        # Print summary statistics
        print("\nSummary Statistics:")
        for key, value in stats.items():
            print(f"{key}: {value}")

if __name__ == "__main__":
    main()