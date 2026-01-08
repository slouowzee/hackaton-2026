/**
 * FavoritesContext Provider
 * 
 * Manages the global state for favorite sports facilities and their attached parkings (car or bike).
 * Handles synchronization with Supabase backend.
 */

import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type FavoriteType = 'stadium' | 'bike' | 'car';

export interface FavoriteItem {
  id: string; // The sport facility ID (e.g. name or unique ID)
  type: FavoriteType;
  data: any; // Reconstructed object
  linkedParkings: any[]; // Array of parking objects
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: any, type: FavoriteType) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  linkParking: (parentFavId: string, parkingItem: any, parkingType: 'bike' | 'car') => Promise<void>;
  unlinkParking: (parentFavId: string, parkingId: string) => Promise<void>;
  getLinkedParkings: (parentFavId: string) => any[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/**
 * Favorites Provider component that wraps the app to provide favorite data.
 */
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchFavorites(session.user.id);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          fetchFavorites(session.user.id);
      } else {
          setFavorites([]);
      }
    });
  }, []);

  /**
   * Fetches favorite spots for a given user from Supabase and groups them by facility.
   * @param userId The ID of the user.
   */
  const fetchFavorites = async (userId: string) => {
    const { data, error } = await supabase
      .from('favorite_spots')
      .select('*')
      .eq('user_id', userId);

    if (error) {
        console.error("Error fetching favorites:", error);
        return;
    }

    const groupedMap = new Map<string, FavoriteItem>();

    data.forEach((row) => {
        const sportId = row.sport_facility_id || row.sport_facility_name;
        
        if (!groupedMap.has(sportId)) {
            groupedMap.set(sportId, {
                id: sportId,
                type: 'stadium',
                data: {
                    nom: row.sport_facility_name,
                    geo_point_2d: { lat: row.sport_facility_lat, lon: row.sport_facility_lng },
                    type: 'Installation sportive',
                },
                linkedParkings: []
            });
        }

        const group = groupedMap.get(sportId)!;

        if (row.preferred_parking_id && row.preferred_parking_name) {
            group.linkedParkings.push({
                nom: row.preferred_parking_name,
                nom_parkng: row.preferred_parking_name, 
                id: row.preferred_parking_id,
                dataType: row.preferred_parking_type,
                type: row.preferred_parking_type === 'bike' ? 'Box Vélo' : 'Parking',
            });
        }
    });

    setFavorites(Array.from(groupedMap.values()));
  };

  /**
   * Adds a new item to favorites.
   * @param item The facility item to add.
   * @param type The type of facility.
   */
  const addFavorite = async (item: any, type: FavoriteType) => {
    if (!session) return;
    const sportId = item.nom || item.id;

    if (favorites.some(f => f.id === sportId)) return;

    const { error } = await supabase
        .from('favorite_spots')
        .insert({
            user_id: session.user.id,
            sport_facility_id: sportId,
            sport_facility_name: item.nom,
            sport_facility_lat: item.geo_point_2d?.lat || 0,
            sport_facility_lng: item.geo_point_2d?.lon || 0,
            preferred_parking_id: null,
            preferred_parking_name: null,
            preferred_parking_type: null
        });

    if (error) {
        console.error("Error adding favorite:", error);
    } else {
        fetchFavorites(session.user.id);
    }
  };

  /**
   * Removes a favorite item by ID.
   * @param id The ID of the facility to remove.
   */
  const removeFavorite = async (id: string) => {
    if (!session) return;
    
    const { error } = await supabase
        .from('favorite_spots')
        .delete()
        .eq('user_id', session.user.id)
        .eq('sport_facility_id', id);

    if (error) console.error("Error removing", error);
    else fetchFavorites(session.user.id);
  };

  /**
   * Unlinks a specific parking from a sport facility favorite.
   * @param parentFavId The ID of the parent sport facility.
   * @param parkingId The ID of the parking to unlink.
   */
  const unlinkParking = async (parentFavId: string, parkingId: string) => {
      if (!session) return;

      const { error } = await supabase
        .from('favorite_spots')
        .delete()
        .eq('user_id', session.user.id)
        .eq('sport_facility_id', parentFavId)
        .eq('preferred_parking_id', parkingId);

      if (error) console.error("Error unlinking parking", error);
      else fetchFavorites(session.user.id);
  };

  /**
   * Links a parking (car or bike) to a sport facility favorite.
   * @param parentFavId The ID of the parent sport facility.
   * @param parkingItem The parking item to link.
   * @param parkingType The type of parking.
   */
  const linkParking = async (parentFavId: string, parkingItem: any, parkingType: 'bike' | 'car') => {
      const parent = favorites.find(f => f.id === parentFavId);
      if (!parent || !session) return;

      const parkingId = parkingItem.id || parkingItem.id_parking || parkingItem.id_box || parkingItem.nom_parkng;
      const parkingName = parkingItem.nom || parkingItem.nom_parkng;

      const { error } = await supabase.from('favorite_spots').insert({
          user_id: session.user.id,
          sport_facility_id: parent.id,
          sport_facility_name: parent.data.nom,
          sport_facility_lat: parent.data.geo_point_2d.lat,
          sport_facility_lng: parent.data.geo_point_2d.lon,
          preferred_parking_id: parkingId,
          preferred_parking_name: parkingName,
          preferred_parking_type: parkingType
      });

      if (error) console.error("Error linking parking", error);
      else fetchFavorites(session.user.id);
  };

  /**
   * Checks if an item is already in favorites.
   * @param id The ID of the item.
   */
  const isFavorite = (id: string) => {
    return favorites.some(f => f.id === id);
  };

  /**
   * Retrieves the list of linked parkings for a given facility.
   * @param parentFavId The ID of the facility.
   */
  const getLinkedParkings = (parentFavId: string) => {
    const parent = favorites.find(f => f.id === parentFavId);
    return parent ? parent.linkedParkings : [];
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, linkParking, unlinkParking, getLinkedParkings }}>
      {children}
    </FavoritesContext.Provider>
  );
};

/**
 * Custom hook to access the FavoritesContext.
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
