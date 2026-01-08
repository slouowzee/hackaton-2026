import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, H2, ScrollView, Text, View, XStack, YStack } from 'tamagui';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" space="$4">
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                    <Text color="$gray10" fontSize="$2" fontFamily="Montserrat">Bonjour,</Text>
                    <H2 color="$color" fontSize="$6" fontWeight="800" fontFamily="Montserrat">Prêt à bouger ?</H2>
                </YStack>
            </XStack>

            {/* Quick Actions */}
            <Text color="$gray11" fontWeight="600" marginTop="$2" fontFamily="Montserrat">Mes Favoris</Text>
            
            {/* Empty State for Favorites */}
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
                 <Text textAlign="center" color="$gray10" fontSize="$3">Vous n'avez pas encore de trajets favoris.</Text>
                 <Button size="$3" theme="active" backgroundColor="#10b981" color="white" fontWeight="bold" fontFamily="Montserrat">
                    Ajouter un trajet
                 </Button>
            </View>

             <Text color="$gray11" fontWeight="600" marginTop="$2" fontFamily="Montserrat">Recherche Rapide</Text>
             <XStack space="$3" flexWrap="wrap">
                {['Tennis', 'Basket', 'Football', 'Natation'].map((sport) => (
                    <Button key={sport} backgroundColor="$gray2" color="$color" borderRadius="$10" size="$3" fontFamily="Montserrat">
                        {sport}
                    </Button>
                ))}
             </XStack>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
