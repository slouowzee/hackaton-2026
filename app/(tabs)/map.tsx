/**
 * MapScreen Component
 * 
 * Displays an interactive map of Angers with markers for sports facilities, 
 * bike parkings, and car parkings. Includes filtering capabilities, search functionality,
 * and a list view mode.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView as RNScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Text, View } from 'tamagui';
import { AngersAPI, BikeParking, ParkingLot, Stadium } from '../../services/api';

const FILTERS = [
    { id: 'all', label: 'Tout', icon: 'map' },
    { id: 'football', label: 'Football', icon: 'soccer-ball-o' },
    { id: 'tennis', label: 'Tennis', icon: 'circle-o' },
    { id: 'basket', label: 'Basket', icon: 'dribbble' },
    { id: 'handball', label: 'Handball', icon: 'circle' },
    { id: 'parking_car', label: 'Parking', icon: 'car' },
    { id: 'parking_free', label: 'Gratuit', icon: 'tag' },
    { id: 'parking_bike', label: 'Vélo', icon: 'bicycle' },
];

/**
 * Main Map Screen component.
 */
export default function MapScreen() {
  const router = useRouter();
  const { focusLat, focusLon, focusType } = useLocalSearchParams();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    if (focusLat && focusLon && mapRef.current) {
        const lat = parseFloat(focusLat as string);
        const lon = parseFloat(focusLon as string);

        if (focusType) {
            setCategory('all'); 
            setSelectedSports([]);
            setSubType(null);
            setParkingCost('all');
            setSearchQuery('');
        }

        if (!isNaN(lat) && !isNaN(lon)) {
             setTimeout(() => {
                mapRef.current?.animateToRegion({
                    latitude: lat,
                    longitude: lon,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                }, 1000);
             }, 500);
        }
    }
  }, [focusLat, focusLon, focusType]);
  
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [bikeParkings, setBikeParkings] = useState<BikeParking[]>([]);
  const [carParkings, setCarParkings] = useState<ParkingLot[]>([]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [category, setCategory] = useState<'all' | 'sports' | 'parking'>('all');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [subType, setSubType] = useState<string | null>(null);
  const [parkingCost, setParkingCost] = useState<'all' | 'free' | 'paid'>('all');

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  const sportTypes = useMemo(() => {
    const raw = stadiums.map(s => s.type).filter(t => t);
    return Array.from(new Set(raw)).sort();
  }, [stadiums]);

  const mapRef = useRef<MapView>(null);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  /**
   * Toggles the search bar visibility with animation.
   * @param open Boolean indicating whether to open or close the search bar.
   */
  const toggleSearch = (open: boolean) => {
      if (open) {
          setIsSearchOpen(true);
          setViewMode('map'); 
          
          Animated.parallel([
              Animated.timing(searchAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: false,
                  easing: Easing.out(Easing.poly(3))
              }),
              Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 400,
                  delay: 100,
                  useNativeDriver: true,
              })
          ]).start();
      } else {
          Keyboard.dismiss();
          Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(searchAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
                easing: Easing.in(Easing.poly(3)),
            })
          ]).start(() => {
              setIsSearchOpen(false);
          });
      }
  };

  /**
   * Switches the view mode to list with an animation.
   */
  const enableListView = () => {
      toggleSearch(false);
      setTimeout(() => {
          setViewMode('list');
          Animated.spring(listAnim, {
              toValue: 1,
              useNativeDriver: true,
          }).start();
      }, 300);
  };

  /**
   * Closes the list view and returns to map mode.
   */
  const closeListView = () => {
      Animated.timing(listAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
      }).start(() => setViewMode('map'));
  };

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

    loadData();
  }, []);

  /**
   * Fetches stadiums and parking data from the API.
   */
  const loadData = async () => {
    const [stadiumsData, bikesData, carsData] = await Promise.all([
        AngersAPI.getStadiums(), 
        AngersAPI.getBikeParkings(),
        AngersAPI.getCarParkings()
    ]);
    
    setStadiums(stadiumsData.results);
    setBikeParkings(bikesData.results);
    setCarParkings(carsData.results);
  };

  /**
   * Computes the filtered lists of stadiums, bike parkings, and car parkings based on current filters and search query.
   */
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    const matchesQuery = (text: string | null | undefined) => {
        if (!text) return false;
        return !query || text.toLowerCase().includes(query);
    };

    const showSports = category === 'all' || category === 'sports';
    const filteredStadiums = showSports ? stadiums.filter(s => {
        if (!matchesQuery(s.nom + ' ' + s.type)) return false;
        
        if (category === 'sports' && selectedSports.length > 0) {
            return selectedSports.includes(s.type);
        }
        return true;
    }) : [];

    const showParking = category === 'all' || category === 'parking';
    const filteredBikes = (showParking && (!subType || subType === 'bike')) ? bikeParkings.filter(b => {
        return matchesQuery(b.nom_parkng);
    }) : [];

    const filteredCars = (showParking && (!subType || subType === 'car')) ? carParkings.filter(p => {
        if (!matchesQuery(p.nom)) return false;
        
        if (category === 'parking' && subType === 'car') {
             const isFree = p.gratuit === 'VRAI';
             if (parkingCost === 'free' && !isFree) return false;
             if (parkingCost === 'paid' && isFree) return false;
        }
        return true;
    }) : [];

    return { stadiums: filteredStadiums, bikes: filteredBikes, cars: filteredCars };

  }, [stadiums, bikeParkings, carParkings, searchQuery, category, selectedSports, subType, parkingCost]);


  const ANGERS_REGION = {
    latitude: 47.4736,
    longitude: -0.5542,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  /**
   * Handles map region changes to restrict movement within Angers borders.
   * @param region The new region after change.
   */
  const handleRegionChange = (region: Region) => {
    const MAX_LAT_DIFF = 0.05;
    const MAX_LON_DIFF = 0.05;

    if (
        Math.abs(region.latitude - ANGERS_REGION.latitude) > MAX_LAT_DIFF ||
        Math.abs(region.longitude - ANGERS_REGION.longitude) > MAX_LON_DIFF
    ) {
        mapRef.current?.animateToRegion(ANGERS_REGION, 500);
    }
  };

  /**
   * Recenters the map on the user's current location or Angers if permission denied.
   */
  const handleRecenter = async () => {
        if (location) {
            mapRef.current?.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        } else {
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
            showsMyLocationButton={false} 
            userInterfaceStyle='light'
            onRegionChangeComplete={handleRegionChange}
        >
            {filteredData.stadiums.map((s, index) => (
                <Marker
                    key={`stadium-${index}`}
                    coordinate={{ latitude: s.geo_point_2d.lat, longitude: s.geo_point_2d.lon }}
                    tracksViewChanges={false}
                >
                    <View backgroundColor="$green9" padding="$2" borderRadius={20} borderWidth={2} borderColor="white">
                         <FontAwesome5 name="dumbbell" size={14} color="white" />
                    </View>
                    <Callout onPress={() => router.push({ pathname: '/details' as any, params: { data: JSON.stringify(s), type: 'stadium' } })}>
                        <View padding="$2" minWidth={150}>
                            <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$3" marginBottom="$1">{s.nom}</Text>
                            <Text fontFamily="Montserrat" fontSize="$2" marginBottom="$2">{s.type}</Text>
                            <Text color="$blue10" fontSize="$2" fontWeight="bold">Voir détails</Text>
                        </View>
                    </Callout>
                </Marker>
            ))}

            {filteredData.bikes.map((b, index) => (
                <Marker
                    key={`bike-${index}`}
                    coordinate={{ latitude: b.geo_point_2d.lat, longitude: b.geo_point_2d.lon }}
                    tracksViewChanges={false}
                >
                     <View backgroundColor="$blue8" padding="$2" borderRadius={20} borderWidth={2} borderColor="white">
                         <FontAwesome name="bicycle" size={16} color="white" />
                    </View>
                    <Callout onPress={() => router.push({ pathname: '/details' as any, params: { data: JSON.stringify(b), type: 'bike' } })}>
                        <View padding="$2" minWidth={150}>
                            <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$3" marginBottom="$1">{b.nom_parkng}</Text>
                            <Text fontFamily="Montserrat" fontSize="$2" marginBottom="$2">{b.capacite} places</Text>
                            <Text color="$blue10" fontSize="$2" fontWeight="bold">Voir détails</Text>
                        </View>
                    </Callout>
                </Marker>
            ))}

            {filteredData.cars.map((p, index) => {
                let lat: number | undefined;
                let lon: number | undefined;

                if (p.geo_point_2d && typeof p.geo_point_2d === 'object') {
                    lat = p.geo_point_2d.lat;
                    lon = p.geo_point_2d.lon;
                } else {
                    if (p.ylat) lat = typeof p.ylat === 'string' ? parseFloat(p.ylat) : p.ylat;
                    if (p.xlong) lon = typeof p.xlong === 'string' ? parseFloat(p.xlong) : p.xlong;
                }

                if (!lat || !lon) return null;

                const isFree = p.gratuit === 'VRAI';
                
                return (
                    <Marker
                        key={`parking-${index}`}
                        coordinate={{ latitude: lat, longitude: lon }}
                        tracksViewChanges={false}
                    >
                        <View 
                            backgroundColor={isFree ? "$green9" : "$orange9"} 
                            padding="$2" 
                            borderRadius={20} 
                            borderWidth={2} 
                            borderColor="white"
                        >
                            <FontAwesome name="car" size={14} color="white" />
                        </View>
                        <Callout onPress={() => router.push({ pathname: '/details' as any, params: { data: JSON.stringify(p), type: 'car' } })}>
                            <View padding="$2" minWidth={150}>
                                <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$3" marginBottom="$1">{p.nom}</Text>
                                <Text fontFamily="Montserrat" fontSize="$2" marginBottom="$2">{p.nb_places} places - {isFree ? 'Gratuit' : 'Payant'}</Text>
                                <Text color="$blue10" fontSize="$2" fontWeight="bold">Voir détails</Text>
                            </View>
                        </Callout>
                    </Marker>
                );
            })}
        </MapView>

        <TouchableOpacity
            onPress={handleRecenter}
            style={{
                position: 'absolute',
                bottom: 20, 
                left: 20,
                width: 50,
                height: 50,
                backgroundColor: 'white',
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            <FontAwesome name="location-arrow" size={24} color="#2f855a" />
        </TouchableOpacity>

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
            <TouchableOpacity onPress={() => setIsLegendOpen(!isLegendOpen)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: isLegendOpen ? 5 : 0 }}>
                <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$3">Légende</Text>
                <FontAwesome name={isLegendOpen ? "chevron-down" : "chevron-up"} size={12} color="#666" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            
            {isLegendOpen && (
                <>
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
                </>
            )}
        </View>

        {viewMode === 'list' && (
            <Animated.View style={{
                position: 'absolute',
                left: 0, right: 0, bottom: 0,
                height: Dimensions.get('window').height * 0.5,
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 10,
                transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }]
            }}>
                <View padding="$3" borderBottomWidth={1} borderBottomColor="$gray4" flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$4">Résultats ({filteredData.stadiums.length + filteredData.bikes.length + filteredData.cars.length})</Text>
                    <TouchableOpacity onPress={closeListView}>
                        <FontAwesome name="times" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    contentContainerStyle={{ padding: 15 }}
                    data={[
                        ...filteredData.stadiums.map(s => ({ ...s, dataType: 'stadium' })),
                        ...filteredData.bikes.map(b => ({ ...b, dataType: 'bike', nom: b.nom_parkng })),
                        ...filteredData.cars.map(c => ({ ...c, dataType: 'car' }))
                    ]}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => {
                        const anyItem = item as any;
                        const isStadium = item.dataType === 'stadium';
                        const isBike = item.dataType === 'bike';
                        const isCar = item.dataType === 'car';
                        
                        let subtitle = "";
                        if (isStadium) subtitle = anyItem.type;
                        else if (isBike) subtitle = `${anyItem.capacite} places`;
                        else if (isCar) subtitle = `${anyItem.nb_places} places`;
                        
                        let iconBg = '#f0f0f0';
                        let iconName = 'dot-circle-o';
                        let iconColor = 'white';
                        let IconComponent = FontAwesome;

                        if (isStadium) {
                            iconBg = '$green9';
                            iconName = 'dumbbell';
                            IconComponent = FontAwesome5;
                        } else if (isBike) {
                            iconBg = '$blue8';
                            iconName = 'bicycle';
                            IconComponent = FontAwesome;
                        } else if (isCar) {
                            const isFree = anyItem.gratuit === 'VRAI';
                            iconBg = isFree ? '$green9' : '$orange9';
                            iconName = 'car';
                            IconComponent = FontAwesome;
                        }

                        return (
                         <TouchableOpacity 
                            onPress={() => router.push({ pathname: '/details' as any, params: { data: JSON.stringify(item), type: item.dataType } })}
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                paddingVertical: 12, 
                                borderBottomWidth: 1, 
                                borderBottomColor: '#f0f0f0' 
                            }}
                        >
                            <View 
                                width={40} 
                                height={40} 
                                borderRadius={20} 
                                backgroundColor={iconBg} 
                                alignItems="center" 
                                justifyContent="center" 
                                marginRight="$3"
                            >
                                <IconComponent 
                                    name={iconName as any} 
                                    size={16} 
                                    color={iconColor} 
                                />
                            </View>
                            <View flex={1}>
                                <Text fontFamily="Montserrat" fontWeight="600" fontSize="$3">{anyItem.nom}</Text>
                                <Text fontFamily="Montserrat" color="$gray10" fontSize="$2" numberOfLines={1}>
                                    {subtitle}
                                </Text>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color="#ccc" />
                        </TouchableOpacity>
                    )}}
                />
            </Animated.View>
        )}

        <Animated.View
            style={{
                position: "absolute",
                backgroundColor: "white",
                shadowColor: "black",
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
                zIndex: 100,
                overflow: 'hidden',
                top: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }),
                left: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
                right: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
                height: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [55, Dimensions.get('window').height] }),
                borderRadius: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                paddingTop: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }),
                paddingHorizontal: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 20] }),
            }}
        >
            {!isSearchOpen ? (
                 <TouchableOpacity 
                    activeOpacity={1}
                    onPress={() => toggleSearch(true)}
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <FontAwesome name="search" size={18} color="#666" style={{ marginRight: 10 }} />
                    <Text color="$gray10" fontFamily="Montserrat">
                        {searchQuery ? searchQuery : (category !== 'all' ? `Filtre: ${category === 'sports' ? (subType || 'Tous sports') : (category === 'parking' ? (subType === 'car' ? 'Parking Voiture' : (subType === 'bike' ? 'Vélo' : 'Tous parkings')) : 'Tout')}` : "Rechercher un terrain, une salle...")}
                    </Text>
                </TouchableOpacity>
            ) : (
                 <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                    <View flexDirection="row" alignItems="center" marginBottom="$4">
                        <View 
                            flex={1} 
                            flexDirection="row" 
                            alignItems="center" 
                            backgroundColor="$gray2" 
                            borderRadius="$4" 
                            paddingHorizontal="$3" 
                            height={50}
                        >
                            <FontAwesome name="search" size={18} color="#666" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, fontFamily: 'Montserrat', fontSize: 16, height: '100%' }}
                                placeholder="Rechercher un lieu, un sport..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                             {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <FontAwesome name="times-circle" size={18} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => toggleSearch(false)} style={{ marginLeft: 15 }}>
                            <Text color="$blue10" fontFamily="Montserrat" fontWeight="bold">Fermer</Text>
                        </TouchableOpacity>
                    </View>

                    <View flexDirection="row" marginBottom="$4">
                        {['all', 'sports', 'parking'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => { setCategory(cat as any); setSubType(null); setParkingCost('all'); }}
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    backgroundColor: category === cat ? '#2f855a' : '#f0f0f0',
                                    borderRadius: 20,
                                    marginRight: 10,
                                }}
                            >
                                <Text color={category === cat ? 'white' : '#333'} fontWeight="bold" fontFamily="Montserrat">
                                    {cat === 'all' ? 'Tout' : (cat === 'sports' ? 'Sports' : 'Parkings')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {category === 'sports' && (
                        <View style={{ flex: 1 }}>
                            <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$4" marginBottom="$2">Type de terrain</Text>
                            <RNScrollView 
                                horizontal={false}
                                showsVerticalScrollIndicator={false} 
                                contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 20 }}
                            >
                                {sportTypes.map(type => {
                                    const isSelected = selectedSports.includes(type);
                                    return (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => {
                                                if (isSelected) {
                                                    setSelectedSports(selectedSports.filter(s => s !== type));
                                                } else {
                                                    setSelectedSports([...selectedSports, type]);
                                                }
                                            }}
                                            style={{
                                                backgroundColor: isSelected ? '#2f855a' : '#f0f0f0',
                                                paddingVertical: 8,
                                                paddingHorizontal: 12,
                                                borderRadius: 15,
                                                marginBottom: 5
                                            }}
                                        >
                                            <Text color={isSelected ? 'white' : '#333'} fontFamily="Montserrat" fontSize="$2">
                                                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </RNScrollView>
                        </View>
                    )}

                    {category === 'parking' && (
                        <View style={{ flex: 1 }}>
                             <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$4" marginBottom="$3">Type de stationnement</Text>
                             <View flexDirection="row" marginBottom="$4" gap="$3">
                                <TouchableOpacity 
                                    onPress={() => { setSubType(subType === 'car' ? null : 'car'); }} 
                                    style={{ 
                                        flex: 1, 
                                        backgroundColor: subType === 'car' ? '#e6fffa' : '#f7fafc', 
                                        padding: 15, 
                                        borderRadius: 12, 
                                        alignItems: 'center', 
                                        borderWidth: 2, 
                                        borderColor: subType === 'car' ? '#2f855a' : '#e2e8f0',
                                    }}>
                                    <FontAwesome name="car" size={24} color={subType === 'car' ? '#2f855a' : '#a0aec0'} />
                                    <Text marginTop="$2" fontFamily="Montserrat" fontWeight="bold" color={subType === 'car' ? '#2f855a' : '#4a5568'}>Voiture</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => { setSubType(subType === 'bike' ? null : 'bike'); }} 
                                    style={{ 
                                        flex: 1, 
                                        backgroundColor: subType === 'bike' ? '#e6fffa' : '#f7fafc', 
                                        padding: 15, 
                                        borderRadius: 12, 
                                        alignItems: 'center', 
                                        borderWidth: 2, 
                                        borderColor: subType === 'bike' ? '#2f855a' : '#e2e8f0'
                                    }}>
                                    <FontAwesome name="bicycle" size={24} color={subType === 'bike' ? '#2f855a' : '#a0aec0'} />
                                    <Text marginTop="$2" fontFamily="Montserrat" fontWeight="bold" color={subType === 'bike' ? '#2f855a' : '#4a5568'}>Vélo</Text>
                                </TouchableOpacity>
                             </View>

                             {subType === 'car' && (
                                 <View marginTop="$2">
                                     <Text fontFamily="Montserrat" fontWeight="600" fontSize="$3" marginBottom="$2" color="$gray11">Options</Text>
                                     <View flexDirection="row" justifyContent="space-between" backgroundColor="#f0f0f0" borderRadius="$3" padding="$1">
                                         {['all', 'free', 'paid'].map((opt) => (
                                             <TouchableOpacity
                                                key={opt}
                                                onPress={() => setParkingCost(opt as any)}
                                                style={{
                                                    flex: 1,
                                                    paddingVertical: 10,
                                                    alignItems: 'center',
                                                    backgroundColor: parkingCost === opt ? 'white' : 'transparent',
                                                    borderRadius: 8,
                                                    shadowColor: parkingCost === opt ? '#000' : 'transparent',
                                                    shadowOpacity: parkingCost === opt ? 0.1 : 0,
                                                    shadowRadius: 2,
                                                    elevation: parkingCost === opt ? 2 : 0,
                                                }}
                                             >
                                                 <Text fontFamily="Montserrat" fontSize="$3" fontWeight={parkingCost === opt ? 'bold' : 'normal'}>
                                                     {opt === 'all' ? 'Tous' : (opt === 'free' ? 'Gratuit' : 'Payant')}
                                                 </Text>
                                             </TouchableOpacity>
                                         ))}
                                     </View>
                                 </View>
                             )}
                        </View>
                    )}

                     <View style={{ position: 'absolute', bottom: 110, left: 20, right: 20 }}>
                        <TouchableOpacity 
                            onPress={enableListView}
                            style={{
                                backgroundColor: '#2f855a',
                                padding: 15,
                                borderRadius: 10,
                                alignItems: 'center',
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.30,
                                shadowRadius: 4.65,
                                elevation: 8,
                            }}
                        >
                            <Text color="white" fontFamily="Montserrat" fontWeight="bold" fontSize="$4">
                                Voir les résultats ({filteredData.stadiums.length + filteredData.bikes.length + filteredData.cars.length})
                            </Text>
                        </TouchableOpacity>
                     </View>
                    
                    </KeyboardAvoidingView>
                 </Animated.View>
            )}
        </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
