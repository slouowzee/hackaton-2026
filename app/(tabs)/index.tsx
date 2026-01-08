/**
 * DashboardScreen Component
 * 
 * Displays the main dashboard including weather information, quick actions,
 * and a list of favorite places.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { H2, ScrollView, Text, View, XStack, YStack } from 'tamagui';
import { useFavorites } from '../../context/FavoritesContext';

interface WeatherData {
    temp: number;
    code: number;
    desc: string;
}

/**
 * Returns weather description and icon based on weather code.
 * @param code The weather code from the API.
 */
const getWeatherDesc = (code: number) => {
    if (code === 0) return { label: 'Ciel dégagé', icon: 'sun-o' };
    if (code === 1 || code === 2 || code === 3) return { label: 'Partiellement nuageux', icon: 'cloud' };
    if (code >= 45 && code <= 48) return { label: 'Brouillard', icon: 'align-justify' };
    if (code >= 51 && code <= 67) return { label: 'Pluie', icon: 'tint' };
    if (code >= 71) return { label: 'Neige', icon: 'snowflake-o' };
    if (code >= 95) return { label: 'Orage', icon: 'bolt' };
    return { label: 'Météo variable', icon: 'cloud' };
};

/**
 * Main Dashboard Screen.
 */
export default function DashboardScreen() {
  const { favorites } = useFavorites();
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=47.47&longitude=-0.55&current_weather=true')
        .then(res => res.json())
        .then(data => {
            if (data.current_weather) {
                const w = data.current_weather;
                const info = getWeatherDesc(w.weathercode);
                setWeather({
                    temp: w.temperature,
                    code: w.weathercode,
                    desc: info.label
                });
            }
        })
        .catch(err => console.error("Weather error", err));
  }, []);

  const weatherInfo = weather ? getWeatherDesc(weather.code) : { label: 'Chargement...', icon: 'spinner' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" space="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                    <Text color="$gray10" fontSize="$2" fontFamily="Montserrat">Bonjour,</Text>
                    <H2 color="$color" fontSize="$6" fontWeight="800" fontFamily="Montserrat">Prêt à bouger ?</H2>
                </YStack>
            </XStack>

            <View 
                borderRadius="$4" 
                overflow="hidden"
                backgroundColor="#e0f2fe" // Light Blue
                borderColor="#bae6fd"
                borderWidth={1}
                padding="$4"
            >
                <XStack alignItems="center" justifyContent="space-between">
                    <YStack>
                        <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$5" color="#0369a1">Météo à Angers</Text>
                        <Text fontFamily="Montserrat" color="#0c4a6e" fontSize="$3" marginTop="$1">
                            {weather ? weather.desc : 'Mise à jour...'}
                        </Text>
                        {weather && weather.temp < 10 && (
                            <Text fontSize="$2" color="#0369a1" marginTop="$2" fontStyle="italic">Couvrez-vous bien ! 🧣</Text>
                        )}
                        {weather && weather.code >= 51 && (
                            <Text fontSize="$2" color="#0369a1" marginTop="$2" fontStyle="italic">Prenez un imperméable ! ☔️</Text>
                        )}
                    </YStack>
                    
                    <YStack alignItems="center">
                        {weather ? (
                            <>
                                <FontAwesome name={weatherInfo.icon as any} size={32} color="#0284c7" />
                                <Text fontFamily="Montserrat" fontWeight="bold" fontSize="$6" color="#0284c7" marginTop="$2">
                                    {weather.temp}°C
                                </Text>
                            </>
                        ) : (
                            <ActivityIndicator color="#0284c7" />
                        )}
                    </YStack>
                </XStack>
            </View>

            <Text color="$gray11" fontWeight="600" marginTop="$2" fontFamily="Montserrat">Mes Favoris</Text>
            
            {favorites.length === 0 ? (
                <View 
                    padding="$6" 
                    borderWidth={2} 
                    borderColor="$gray3" 
                    borderStyle="dashed" 
                    borderRadius="$4" 
                    alignItems="center" 
                    justifyContent="center"
                    space="$3"
                >
                     <View width={60} height={60} backgroundColor="$green2" borderRadius="$10" alignItems="center" justifyContent="center">
                        <FontAwesome name="bicycle" size={24} color="#10b981" />
                     </View>
                     <Text textAlign="center" color="$gray10" fontSize="$3">Vous n'avez pas encore de lieux favoris.</Text>
                </View>
            ) : (
                <YStack space="$3">
                    {favorites.map((fav) => (
                        <TouchableOpacity 
                            key={fav.id}
                            onPress={() => router.push({ pathname: '/details' as any, params: { data: JSON.stringify(fav.data), type: fav.type } })}
                        >
                            <View pointerEvents="none" padding="$4" borderRadius="$4" backgroundColor="$gray1" borderWidth={1} borderColor="$gray4">
                                <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                                    <XStack space="$3" alignItems="center">
                                        <View width={40} height={40} backgroundColor="#10b981" borderRadius="$10" alignItems="center" justifyContent="center">
                                            <FontAwesome name="trophy" size={20} color="white" />
                                        </View>
                                        <YStack flex={1}>
                                            <Text fontWeight="700" fontSize="$4" color="$color" fontFamily="Montserrat" numberOfLines={1}>{fav.data.nom}</Text>
                                            <Text fontSize="$2" color="$gray10" fontFamily="Montserrat">Installation sportive</Text>
                                        </YStack>
                                    </XStack>
                                </XStack>
                                
                                {fav.linkedParkings.length > 0 ? (
                                    <YStack marginTop="$2" padding="$3" backgroundColor="white" borderRadius="$3" borderWidth={1} borderColor="$gray3">
                                        <Text fontSize="$2" fontWeight="600" color="$gray10" marginBottom="$2" fontFamily="Montserrat">Parkings associés ({fav.linkedParkings.length}) :</Text>
                                        {fav.linkedParkings.map((parking, index) => (
                                            <XStack key={index} space="$2" alignItems="center" paddingVertical="$1">
                                                <FontAwesome name={parking.type && parking.type.includes('Vélo') ? 'bicycle' : 'car'} size={14} color="#6b7280" />
                                                <Text fontSize="$3" color="$gray11" fontFamily="Montserrat" numberOfLines={1} flex={1}>{parking.nom}</Text>
                                            </XStack>
                                        ))}
                                    </YStack>
                                ) : (
                                    <Text fontSize="$2" color="$gray9" marginTop="$2" fontStyle="italic">Aucun parking associé.</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </YStack>
            )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}


