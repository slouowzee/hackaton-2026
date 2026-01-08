/**
 * Angers Open Data API Service
 * 
 * Provides methods to fetch data from the Angers Loire Métropole Open Data API,
 * including stadiums, bike parkings, and car parking lots.
 * Base URL: https://data.angers.fr/api/explore/v2.1/catalog/datasets
 */

const BASE_URL = 'https://data.angers.fr/api/explore/v2.1/catalog/datasets';

export interface GeoPoint {
  lon: number;
  lat: number;
}

export interface AngersRecord<T> {
  results: T[];
  total_count: number;
}

export interface Stadium {
  nom: string;
  type: string;
  adresse: string;
  geo_point_2d: GeoPoint;
  quartier?: string;
  acces_handicap?: string;
  sol?: string;
  eclairage?: string;
}

export interface BikeParking {
  id_box?: string;
  nom_parkng: string;
  capacite: string; 
  type: string;
  acces: string;
  geo_point_2d: GeoPoint;
  voie?: string;
  gestion?: string;
  contexte?: string;
  date_maj?: string;
}

export interface ParkingLot {
  id: string;
  nom: string;
  adresse?: string;
  url?: string;
  type_usagers: string;
  gratuit: string; // "FAUX" or "VRAI"
  nb_places: number;
  nb_pr?: number;
  nb_pmr?: number;
  nb_voitures_electriques?: number;
  nb_velo?: number;
  hauteur_max?: string | number;
  tarif_1h?: number;
  tarif_2h?: number;
  tarif_3h?: number;
  tarif_4h?: number;
  tarif_24h?: number;
  horaires_ouverture?: string;
  horaires_fermeture?: string;
  accessibilite?: string;
  type_ouvrage?: string;
  info?: string | null;
  geo_point_2d?: GeoPoint | string; 
  ylat?: number | string;
  xlong?: number | string;
  id_parking: string;
}

/**
 * Helper to fetch all pages of a dataset from the API.
 * @param datasetId The ID of the dataset to fetch.
 */
const fetchAllPages = async <T>(datasetId: string): Promise<AngersRecord<T>> => {
  let allResults: T[] = [];
  let offset = 0;
  const limit = 100;
  let totalCount = 0;
  
  try {
    while (true) {
        const url = `${BASE_URL}/${datasetId}/records?limit=${limit}&offset=${offset}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${datasetId}: ${response.statusText}`);
        
        const data: AngersRecord<T> = await response.json();
        allResults = [...allResults, ...data.results];
        totalCount = data.total_count;

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
   * Fetches stadiums and other sports facilities.
   */
  getStadiums: async (): Promise<AngersRecord<Stadium>> => {
    return fetchAllPages<Stadium>('angers_stadium');
  },

  /**
   * Fetches bike parking spots (boxes and shelters).
   */
  getBikeParkings: async (): Promise<AngersRecord<BikeParking>> => {
    return fetchAllPages<BikeParking>('parking-velo-angers');
  },

  /**
   * Fetches car parking lots (free and paid).
   */
  getCarParkings: async (): Promise<AngersRecord<ParkingLot>> => {
    return fetchAllPages<ParkingLot>('angers_stationnement');
  },
};
