// Service to interact with Angers Loire Métropole Open Data API (Opendatasoft)
// Base URL: https://data.angers.fr/api/explore/v2.1/catalog/datasets

const BASE_URL = 'https://data.angers.fr/api/explore/v2.1/catalog/datasets';

export interface GeoPoint {
  lon: number;
  lat: number;
}

export interface AngersRecord<T> {
  results: T[];
  total_count: number;
}

// ---- DATASETS TYPES ----

export interface Stadium {
  nom: string;
  type: string;
  adresse: string;
  geo_point_2d: GeoPoint;
  quartier?: string;
  acces_handicap?: string;
}

export interface BikeParking {
  id_box: string;
  nom: string; // e.g. "ABRI 3"
  capacite: string; // e.g. "10"
  type: string; // "ABRI COLLECTIF", "BOX VELO SECURISE"
  acces: string; // "LIBRE", "ABONNEMENT"
  geo_point_2d: GeoPoint;
  voie?: string; 
}

export interface ParkingLot {
  id: string; // "49007-P-003"
  nom: string; // "Parking Fleur d'Eau Les Halles"
  type_usagers: string; // "tous"
  gratuit: string; // "FAUX" or "VRAI"
  nb_places: number;
  nb_pr?: number; // Places rapidos ?
  nb_pmr?: number; // Places PMR
  nb_voitures_electriques?: number;
  nb_velo?: number;
  type_ouvrage?: string;
  info?: string | null;
  geo_point_2d?: GeoPoint;
  ylat?: number;
  xlong?: number;
  id_parking: string; // "Republique"
}

// Helper to fetch all pages
const fetchAllPages = async <T>(datasetId: string): Promise<AngersRecord<T>> => {
  let allResults: T[] = [];
  let offset = 0;
  const limit = 100; // Max allowed by API per page
  let totalCount = 0;
  
  try {
    // First call to get total count and first batch
    while (true) {
        const url = `${BASE_URL}/${datasetId}/records?limit=${limit}&offset=${offset}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${datasetId}: ${response.statusText}`);
        
        const data: AngersRecord<T> = await response.json();
        allResults = [...allResults, ...data.results];
        totalCount = data.total_count;

        // Break if we have all records or if no results returned (safety)
        if (allResults.length >= totalCount || data.results.length === 0) {
            break;
        }
        
        offset += limit;
    }
  } catch (error) {
    console.error(`Error fetching all pages for ${datasetId}:`, error);
  }

  return { results: allResults, total_count: totalCount };
};

export const AngersAPI = {
  /**
   * Fetch sports facilities (stadiums, fields, etc.)
   */
  getStadiums: async (): Promise<AngersRecord<Stadium>> => {
    return fetchAllPages<Stadium>('angers_stadium');
  },

  /**
   * Fetch bike parking spots
   */
  getBikeParkings: async (): Promise<AngersRecord<BikeParking>> => {
    return fetchAllPages<BikeParking>('parking-velo-angers');
  },

  /**
   * Fetch car parking lots
   */
  getCarParkings: async (): Promise<AngersRecord<ParkingLot>> => {
    return fetchAllPages<ParkingLot>('angers_stationnement');
  },
};
