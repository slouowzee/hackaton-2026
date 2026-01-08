import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Text, View } from 'tamagui';
import { AngersAPI, BikeParking, ParkingLot, Stadium } from '../../services/api';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Data States
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [bikeParkings, setBikeParkings] = useState<BikeParking[]>([]);
  const [carParkings, setCarParkings] = useState<ParkingLot[]>([]);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

    // Fetch Open Data
    loadData();
  }, []);

  const loadData = async () => {
    // Parallel fetching for performance
    const [stadiumsData, bikesData, carsData] = await Promise.all([
        AngersAPI.getStadiums(), 
        AngersAPI.getBikeParkings(),
        AngersAPI.getCarParkings()
    ]);
    
    setStadiums(stadiumsData.results);
    setBikeParkings(bikesData.results);
    setCarParkings(carsData.results);
  };

  const ANGERS_REGION = {
    latitude: 47.4736,
    longitude: -0.5542,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const handleRegionChange = (region: Region) => {
    // Limits of Angers area to prevent wandering too far
    // Tighter limits (0.05) to keep user really focused on Angers only
    const MAX_LAT_DIFF = 0.05;
    const MAX_LON_DIFF = 0.05;

    if (
        Math.abs(region.latitude - ANGERS_REGION.latitude) > MAX_LAT_DIFF ||
        Math.abs(region.longitude - ANGERS_REGION.longitude) > MAX_LON_DIFF
    ) {
        // Softly animate back to center if user goes too far
        mapRef.current?.animateToRegion(ANGERS_REGION, 500);
    }
  };

    const handleRecenter = async () => {
        if (location) {
            mapRef.current?.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        } else {
             // Try to fetch location again if not available
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
                mapRef.current?.animateToRegion({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 500);
            }
        }
    };

  return (
    <View flex={1}>
        <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={ANGERS_REGION}
            minZoomLevel={12}
            maxZoomLevel={19}
            showsUserLocation={true}
            showsMyLocationButton={false} // Custom button used instead
            userInterfaceStyle='light'
            onRegionChangeComplete={handleRegionChange}
        >
            {/* Render Stadiums */}
            {stadiums.map((s, index) => (
                <Marker
                    key={`stadium-${index}`}
                    coordinate={{ latitude: s.geo_point_2d.lat, longitude: s.geo_point_2d.lon }}
                    title={s.nom}
                    description={s.type}
                    tracksViewChanges={false}
                >
                    <View backgroundColor="$green9" padding="$2" borderRadius={20} borderWidth={2} borderColor="white">
                         <FontAwesome5 name="dumbbell" size={14} color="white" />
                    </View>
                </Marker>
            ))}

            {/* Render Bike Parkings */}
            {bikeParkings.map((b, index) => (
                <Marker
                    key={`bike-${index}`}
                    coordinate={{ latitude: b.geo_point_2d.lat, longitude: b.geo_point_2d.lon }}
                    title={b.nom}
                    description={`Capacité: ${b.capacite} places`}
                    tracksViewChanges={false}
                >
                     <View backgroundColor="$blue8" padding="$2" borderRadius={20} borderWidth={2} borderColor="white">
                         <FontAwesome name="bicycle" size={16} color="white" />
                    </View>
                </Marker>
            ))}

            {/* Render Car Parkings */}
            {carParkings.map((p, index) => {
                // API workaround: data comes as strings for this specific dataset
                let lat: number | undefined;
                let lon: number | undefined;

                if (p.geo_point_2d && typeof p.geo_point_2d === 'object') {
                    lat = p.geo_point_2d.lat;
                    lon = p.geo_point_2d.lon;
                } else {
                    // Fallback to ylat/xlong which might be strings at runtime
                    if (p.ylat) lat = typeof p.ylat === 'string' ? parseFloat(p.ylat) : p.ylat;
                    if (p.xlong) lon = typeof p.xlong === 'string' ? parseFloat(p.xlong) : p.xlong;
                }

                if (!lat || !lon) return null;

                // User confirmed: only "VRAI" is free.
                const isFree = p.gratuit === 'VRAI';
                
                return (
                    <Marker
                        key={`parking-${index}`}
                        coordinate={{ latitude: lat, longitude: lon }}
                        title={p.nom}
                        description={`${p.nb_places} places - ${isFree ? 'Gratuit' : 'Payant'}`}
                        tracksViewChanges={false}
                    >
                         {/* Use consistent "Car" icon for both, distinguish by color */}
                        <View 
                            backgroundColor={isFree ? "$green9" : "$orange9"} 
                            padding="$2" 
                            borderRadius={20} 
                            borderWidth={2} 
                            borderColor="white"
                        >
                            <FontAwesome name="car" size={14} color="white" />
                        </View>
                    </Marker>
                );
            })}
        </MapView>

        {/* Legend */}
        <View 
            position="absolute" 
            bottom={30} 
            right={20} 
            backgroundColor="white" 
            borderRadius="$4" 
            padding="$3" 
            shadowColor="black" 
            shadowOpacity={0.1} 
            shadowRadius={4} 
            style={{ elevation: 4 }}
            space="$2"
        >
            <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$3" marginBottom="$1">Légende</Text>
            
            <View flexDirection="row" alignItems="center">
                <View width={24} height={24} backgroundColor="$green9" borderRadius={12} alignItems="center" justifyContent="center" marginRight="$2">
                    <FontAwesome5 name="dumbbell" size={10} color="white" />
                </View>
                <Text fontFamily="Montserrat" fontSize="$2" color="$gray11">Sport</Text>
            </View>

            <View flexDirection="row" alignItems="center">
                <View width={24} height={24} backgroundColor="$blue8" borderRadius={12} alignItems="center" justifyContent="center" marginRight="$2">
                    <FontAwesome name="bicycle" size={12} color="white" />
                </View>
                <Text fontFamily="Montserrat" fontSize="$2" color="$gray11">Vélos</Text>
            </View>

            <View flexDirection="row" alignItems="center">
                <View width={24} height={24} backgroundColor="$green9" borderRadius={12} alignItems="center" justifyContent="center" marginRight="$2">
                    <FontAwesome name="car" size={12} color="white" />
                </View>
                <Text fontFamily="Montserrat" fontSize="$2" color="$gray11">Parking Gratuit</Text>
            </View>

            <View flexDirection="row" alignItems="center">
                <View width={24} height={24} backgroundColor="$orange9" borderRadius={12} alignItems="center" justifyContent="center" marginRight="$2">
                    <FontAwesome name="car" size={12} color="white" />
                </View>
                <Text fontFamily="Montserrat" fontSize="$2" color="$gray11">Parking Payant</Text>
            </View>
        </View>

        {/* Recenter Button */}
        <View
            position="absolute"
            bottom={30}
            left={20}
            backgroundColor="white"
            width={50}
            height={50}
            borderRadius={25}
            alignItems="center"
            justifyContent="center"
            shadowColor="black"
            shadowOpacity={0.15}
            shadowRadius={5}
            style={{ elevation: 5 }}
            onPress={handleRecenter}
            pressStyle={{ opacity: 0.7 }}
        >
             <FontAwesome name="location-arrow" size={24} color="#2f855a" /> 
             {/* Using a green shade similar to main theme or just standard color */}
        </View>

        
        {/* Search Bar Overlay Placeholder */}
        <View 
            position="absolute" 
            top={60} 
            left={20} 
            right={20} 
            backgroundColor="white" 
            borderRadius="$4" 
            padding="$3" 
            shadowColor="black" 
            shadowOpacity={0.1} 
            shadowRadius={10} 
            style={{ elevation: 5 }}
        >
            <Text color="$gray10" fontFamily="Montserrat">Rechercher un terrain, une salle...</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
