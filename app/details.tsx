/**
 * DetailsScreen Component
 * 
 * Displays detailed information about a selected item (stadium, bike parking, or car parking).
 * Allows managing favorites and linking parkings to stadiums.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, XStack, YStack } from 'tamagui';

import { useFavorites } from '../context/FavoritesContext';
import { AngersAPI } from '../services/api';

/**
 * Main Details Screen.
 */
export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addFavorite, removeFavorite, isFavorite, linkParking, unlinkParking, getLinkedParkings } = useFavorites();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingParkings, setLoadingParkings] = useState(false);
  const [nearbyParkings, setNearbyParkings] = useState<any[]>([]);
  
  if (!params.data) {
      return (
          <View flex={1} alignItems="center" justifyContent="center">
              <Text>Aucune donnée</Text>
              <TouchableOpacity onPress={() => router.back()}>
                  <Text color="#007AFF">Retour</Text>
              </TouchableOpacity>
          </View>
      );
  }

  const item = JSON.parse(params.data as string);
  const type = params.type as string; 

  /**
   * Generates a unique ID for the current item based on its type and available properties.
   */
  const getGeneratedId = () => {
      if (type === 'stadium') return item.nom;
      if (type === 'bike') return item.id_box || item.nom_parkng;
      if (type === 'car') return item.id || item.id_parking || item.nom;
      return JSON.stringify(item);
  };
  
  const itemId = getGeneratedId();
  const isFav = isFavorite(itemId);

  /**
   * Toggles the favorite status of the current item.
   */
  const toggleFavorite = async () => {
      if (isFav) {
          removeFavorite(itemId);
      } else {
          await addFavorite(item, type as any);
          
          if (type === 'stadium') {
              Alert.alert(
                  "Ajouté aux favoris",
                  "Voulez-vous assigner un parking (voiture ou vélo) à ce lieu ?",
                  [
                      { text: "Non, plus tard", style: "cancel" },
                      { text: "Oui, choisir", onPress: openParkingSelection }
                  ]
              );
          }
      }
  };

  /**
   * Opens the modal to select a parking to link to the facility.
   * Fetches nearby parkings and sorts them by distance.
   */
  const openParkingSelection = async () => {
      setModalVisible(true);
      setLoadingParkings(true);
      try {
          const [cars, bikes] = await Promise.all([
              AngersAPI.getCarParkings(),
              AngersAPI.getBikeParkings()
          ]);
          
          const targetLat = item.geo_point_2d?.lat;
          const targetLon = item.geo_point_2d?.lon;

          let allParkings: any[] = [
              ...cars.results.map(c => ({...c, _type: 'car', _raw: c})), 
              ...bikes.results.map(b => ({...b, _type: 'bike', _raw: b}))
            ];

          if (targetLat && targetLon) {
              allParkings = allParkings.map(p => {
                 let plat, plon;
                 if (p.geo_point_2d && typeof p.geo_point_2d === 'object') {
                     plat = p.geo_point_2d.lat;
                     plon = p.geo_point_2d.lon;
                 } else if (p.ylat && p.xlong) {
                     plat = parseFloat(p.ylat as string);
                     plon = parseFloat(p.xlong as string);
                 }
                 
                 if (!plat || !plon) return { ...p, _dist: 99999 };

                 const dist = Math.sqrt(Math.pow(plat - targetLat, 2) + Math.pow(plon - targetLon, 2));
                 return { ...p, _dist: dist };
              }).sort((a, b) => a._dist - b._dist);
          }
          
          setNearbyParkings(allParkings.slice(0, 50));
      } catch (e) {
          Alert.alert("Erreur", "Impossible de charger les parkings");
      } finally {
          setLoadingParkings(false);
      }
  };

  /**
   * Links a selected parking to the current favorite item.
   * @param parking The selected parking object.
   * @param pType The type of parking (car or bike).
   */
  const handleLinkParking = (parking: any, pType: 'car' | 'bike') => {
      linkParking(itemId, parking, pType);
      Alert.alert("Succès", `${pType === 'car' ? 'Parking' : 'Vélo'} assigné au favori !`);
      setModalVisible(false);
  };

  const APP_GREEN = '#2f855a'; 
  const APP_BLUE = '#007AFF'; 

  /**
   * Returns theme colors and icons based on the item type.
   */
  const getTheme = () => {
      if (type === 'stadium') return { primary: APP_GREEN, icon: 'dumbbell', lib: FontAwesome5, label: 'Sport' };
      if (type === 'bike') return { primary: APP_GREEN, icon: 'bicycle', lib: FontAwesome, label: 'Vélo' };
      
      return { 
          primary: APP_GREEN, 
          icon: 'car', 
          lib: FontAwesome,
          label: 'Parking'
      };
  };
  
  const theme = getTheme();
  const IconLib = theme.lib;

  /**
   * Returns the display title for the item.
   */
  const getTitle = () => {
      if (type === 'bike') return (item as any).nom_parkng || "Abri vélo";
      return item.nom || "Lieu sans nom";
  };

  /**
   * Returns a description string for the item.
   */
  const getDescription = () => {
    if (type === 'stadium') return item.type || "Installation sportive";
    if (type === 'bike') return `${item.capacite} places vélo`;
    return `${item.nb_places} places - ${item.gratuit === 'VRAI' ? 'Gratuit' : 'Payant'}`;
  };

  return (
    <View flex={1} backgroundColor="white">
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
        
        <XStack paddingHorizontal="$2" paddingVertical="$2" alignItems="center" justifyContent="space-between">
            <TouchableOpacity 
                onPress={() => router.back()} 
                style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}
            >
                <FontAwesome name="chevron-left" size={18} color={APP_BLUE} />
                <Text fontFamily="Montserrat" color={APP_BLUE} fontSize="$4" marginLeft="$2" fontWeight="500">
                    Retour
                </Text>
            </TouchableOpacity>

            {type === 'stadium' && (
                <TouchableOpacity onPress={toggleFavorite} style={{ padding: 12, marginRight: 8 }}>
                    <FontAwesome name={isFav ? "heart" : "heart-o"} size={26} color={isFav ? "#e11d48" : APP_GREEN} />
                </TouchableOpacity>
            )}
        </XStack>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 10 }}>
            
            <XStack marginBottom="$6" marginTop="$2" alignItems="flex-start">
                 <View 
                    width={52} height={52} 
                    borderRadius={14} 
                    backgroundColor={theme.primary + '15'} 
                    alignItems="center" justifyContent="center"
                    marginRight="$4"
                >
                    <IconLib name={theme.icon as any} size={22} color={theme.primary} />
                </View>
                <YStack flex={1} space="$1">
                     <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$6" lineHeight={28} color="$gray12">
                        {getTitle()}
                     </Text>
                     <Text fontFamily="Montserrat" color="$gray10" fontSize="$4" fontWeight="500">
                        {getDescription()}
                     </Text>
                </YStack>
            </XStack>

            <YStack space="$5">
                {type === 'stadium' && (
                    <>
                        <InfoSection title="Localisation">
                            <InfoRowSimple label="Adresse" value={item.adresse} />
                            <InfoRowSimple label="Quartier" value={item.quartier} />
                        </InfoSection>
                        <InfoSection title="Détails techniques">
                            <InfoRowSimple label="Type de sol" value={item.sol} />
                            <InfoRowSimple label="Éclairage" value={item.eclairage} />
                            <InfoRowSimple label="Accès PMR" value={item.acces_handicap} />
                        </InfoSection>

                        {isFav && (
                            <InfoSection title="Parkings associés">
                                {getLinkedParkings(itemId).length > 0 ? (
                                    getLinkedParkings(itemId).map((p, i) => (
                                        <XStack key={i} justifyContent="space-between" alignItems="center" paddingVertical="$2" borderBottomWidth={1} borderBottomColor="$gray3">
                                            <XStack alignItems="center" space="$3" flex={1}>
                                                <FontAwesome name={p.type && p.type.includes('lo') ? "bicycle" : "car"} size={16} color={APP_GREEN} />
                                                <Text fontFamily="Montserrat" fontSize="$4" color="$gray12" numberOfLines={1}>{p.nom}</Text>
                                            </XStack>
                                            <TouchableOpacity onPress={() => unlinkParking(itemId, p.id)} style={{ padding: 4 }}>
                                                <FontAwesome name="times-circle" size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </XStack>
                                    ))
                                ) : (
                                    <Text fontFamily="Montserrat" fontSize="$3" color="$gray10" fontStyle="italic">Aucun parking associé</Text>
                                )}
                                <TouchableOpacity 
                                    onPress={openParkingSelection}
                                    style={{ 
                                        marginTop: 12, 
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        backgroundColor: '#f0f9ff', 
                                        padding: 10, 
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: APP_BLUE + '40'
                                    }}
                                >
                                    <FontAwesome name="plus-circle" size={16} color={APP_BLUE} />
                                    <Text fontFamily="Montserrat" color={APP_BLUE} fontWeight="600" marginLeft="$2">Ajouter un parking favori</Text>
                                </TouchableOpacity>
                            </InfoSection>
                        )}
                    </>
                )}

                {type === 'bike' && (
                    <>
                         <InfoSection title="Localisation">
                             <InfoRowSimple label="Adresse" value={item.voie} />
                         </InfoSection>
                         <InfoSection title="Caractéristiques">
                             <InfoRowSimple label="Type d'abri" value={item.type} />
                             <InfoRowSimple label="Accès" value={item.acces} />
                             <InfoRowSimple label="Sécurisé" value={item.type?.includes('SECURISE') ? 'Oui' : 'Non'} />
                         </InfoSection>
                    </>
                )}

                {type === 'car' && (
                    <>
                        <InfoSection title="Général">
                            <InfoRowSimple label="Adresse" value={item.adresse} />
                            <InfoRowSimple label="Horaires" value={(item.horaires_ouverture || item.horaires_fermeture) ? `${item.horaires_ouverture} - ${item.horaires_fermeture}` : null} />
                             <InfoRowSimple label="Hauteur max" value={item.hauteur_max ? `${item.hauteur_max}cm` : null} />
                        </InfoSection>

                        <InfoSection title="Capacité">
                             <InfoRowSimple label="Places totales" value={item.nb_places} isBold />
                             <InfoRowSimple label="Places PMR" value={item.nb_pmr} />
                             <InfoRowSimple label="Bornes recharge" value={item.nb_voitures_electriques} />
                        </InfoSection>

                        {item.gratuit === 'FAUX' && (
                             <InfoSection title="Tarifs (indicatif)">
                                <XStack justifyContent="space-between" marginBottom="$1">
                                    <Text fontFamily="Montserrat" color="$gray11">1h</Text>
                                    <Text fontFamily="Montserrat" fontWeight="600">{item.tarif_1h ? `${item.tarif_1h}€` : '-'}</Text>
                                </XStack>
                                <XStack justifyContent="space-between" marginBottom="$1">
                                    <Text fontFamily="Montserrat" color="$gray11">2h</Text>
                                    <Text fontFamily="Montserrat" fontWeight="600">{item.tarif_2h ? `${item.tarif_2h}€` : '-'}</Text>
                                </XStack>
                                <XStack justifyContent="space-between" marginBottom="$1">
                                    <Text fontFamily="Montserrat" color="$gray11">3h</Text>
                                    <Text fontFamily="Montserrat" fontWeight="600">{item.tarif_3h ? `${item.tarif_3h}€` : '-'}</Text>
                                </XStack>
                                <XStack justifyContent="space-between" marginBottom="$1">
                                    <Text fontFamily="Montserrat" color="$gray11">4h</Text>
                                    <Text fontFamily="Montserrat" fontWeight="600">{item.tarif_4h ? `${item.tarif_4h}€` : '-'}</Text>
                                </XStack>
                                <XStack justifyContent="space-between">
                                    <Text fontFamily="Montserrat" color="$gray11">24h</Text>
                                    <Text fontFamily="Montserrat" fontWeight="600">{item.tarif_24h ? `${item.tarif_24h}€` : '-'}</Text>
                                </XStack>
                             </InfoSection>
                        )}
                    </>
                )}
            </YStack>

        </ScrollView>

        <View padding="$4" paddingBottom={Platform.OS === 'ios' ? 20 : 20} backgroundColor="white">
            <TouchableOpacity 
                 onPress={() => {
                     let lat, lon;
                     if (type === 'stadium' || type === 'bike') {
                         lat = item.geo_point_2d?.lat;
                         lon = item.geo_point_2d?.lon;
                     } else { // Car
                          if (typeof item.geo_point_2d === 'string') {
                              const parts = item.geo_point_2d.split(',');
                              lat = parseFloat(parts[0]);
                              lon = parseFloat(parts[1]);
                          } else if (item.geo_point_2d) {
                              lat = item.geo_point_2d.lat;
                              lon = item.geo_point_2d.lon;
                          } else {
                              lat = parseFloat(item.ylat);
                              lon = parseFloat(item.xlong);
                          }
                     }

                     if (lat && lon) {
                        router.dismiss();
                        router.replace({ pathname: '/(tabs)/map' as any, params: { focusLat: lat, focusLon: lon, focusType: type } });
                     } else {
                         router.back();
                     }
                 }}
                 style={{
                     backgroundColor: theme.primary,
                     paddingVertical: 16,
                     borderRadius: 12,
                     flexDirection: 'row',
                     alignItems: 'center',
                     justifyContent: 'center',
                 }}
            >
                 <IconLib name={theme.icon as any} size={16} color="white" style={{marginRight: 8}} />
                 <Text color="white" fontFamily="Montserrat" fontWeight="bold" fontSize="$4">
                     Voir sur la carte
                 </Text>
            </TouchableOpacity>
        </View>

        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
                <View backgroundColor="white" borderTopLeftRadius={20} borderTopRightRadius={20} height="80%" padding="$4">
                    <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
                         <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$5">Choisir un parking</Text>
                         <TouchableOpacity onPress={() => setModalVisible(false)}>
                             <FontAwesome name="times" size={20} color="#666" />
                         </TouchableOpacity>
                    </XStack>

                    {loadingParkings ? (
                        <View flex={1} alignItems="center" justifyContent="center">
                            <ActivityIndicator size="large" color={APP_GREEN} />
                            <Text marginTop="$2">Recherche des parkings à proximité...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={nearbyParkings}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 15,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#f0f0f0'
                                    }}
                                    onPress={() => handleLinkParking(item._raw, item._type)}
                                >
                                    <View 
                                        width={40} height={40} borderRadius={20} 
                                        backgroundColor={item._type === 'bike' ? '#eff6ff' : '#f0fff4'} 
                                        alignItems="center" justifyContent="center" marginRight="$3"
                                    >
                                        <FontAwesome name={item._type === 'bike' ? 'bicycle' : 'car'} size={16} color={item._type === 'bike' ? '#3182ce' : '#2f855a'} />
                                    </View>
                                    <View flex={1}>
                                        <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$4">
                                            {item._type === 'bike' ? item.nom_parkng : item.nom}
                                        </Text>
                                        <Text color="$gray10" fontSize="$3">
                                            {Math.round(item._dist * 111000)}m • {item._type === 'bike' ? `${item.capacite} places` : `${item.nb_places} places`}
                                        </Text>
                                    </View>
                                    <FontAwesome name="plus-circle" size={24} color={APP_GREEN} />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
        
      </SafeAreaView>
    </View>
  );
}

/**
 * Helper component for displaying an information section with a title and content.
 */
function InfoSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <YStack marginBottom="$4">
            <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$4" color="$gray12" marginBottom="$3">
                {title}
            </Text>
            <YStack space="$2">
                {children}
            </YStack>
        </YStack>
    )
}

/**
 * Helper component for displaying a simple information row (label + value).
 */
function InfoRowSimple({ label, value, isBold = false }: { label: string, value: any, isBold?: boolean }) {
    if (!value || value === 'null') return null;
    return (
        <XStack justifyContent="space-between" alignItems="center">
            <Text fontFamily="Montserrat" fontSize="$4" color="$gray11">{label}</Text>
            <Text fontFamily="Montserrat" fontSize="$4" color="$gray12" fontWeight={isBold ? "bold" : "400"} flex={1} textAlign="right" numberOfLines={2}>
                {value}
            </Text>
        </XStack>
    );
}
