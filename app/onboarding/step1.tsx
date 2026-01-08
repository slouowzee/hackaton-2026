import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button, H2, Image, Input, Label, ScrollView, Spinner, Text, View, XStack, YStack } from 'tamagui';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

type TransportMode = Database['public']['Tables']['profiles']['Row']['preferred_transport_mode'];

export default function OnboardingStep1() {
  const [username, setUsername] = useState('');
  const [transportMode, setTransportMode] = useState<TransportMode>('walk');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!username.trim()) {
      Alert.alert('Oups', 'Merci de choisir un pseudo !');
      return;
    }

    setLoading(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            Alert.alert('Erreur', 'Session expirée.');
            router.replace('/(auth)/login');
            return;
        }

        // Save collected data
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: session.user.id,
                username: username,
                preferred_transport_mode: transportMode,
                email: session.user.email,
            });

        if (error) throw error;

        // Navigate to dashboard
        // @ts-ignore
        router.replace('/(tabs)');

    } catch (error: any) {
        Alert.alert('Erreur', error.message);
    } finally {
        setLoading(false);
    }
  };

  const TransportOption = ({ mode, label, icon }: { mode: TransportMode, label: string, icon: string }) => {
    const isSelected = transportMode === mode;
    return (
      <Button
        theme={isSelected ? "green" : "gray"}
        onPress={() => setTransportMode(mode)}
        width="30%"
        height={100}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        padding="$2"
        borderWidth={2}
        borderColor={isSelected ? '$green8' : 'transparent'}
      >
        <Text fontSize={30} marginBottom="$2">{icon}</Text>
        <Text fontSize="$3" textAlign="center" color={isSelected ? 'white' : '$gray11'} fontFamily="Montserrat">
            {label}
        </Text>
      </Button>
    );
  };

  return (
    <View flex={1} backgroundColor="white">
      {/* Hero Image */}
      <View height={300} width="100%" position="relative">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1502054824840-5f8d4fe01ae1?q=80&w=2000' }} 
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
         <View 
            position="absolute" 
            bottom={0} 
            left={0} 
            right={0} 
            height={40} 
            backgroundColor="white" 
            borderTopLeftRadius={30} 
            borderTopRightRadius={30} 
        />
      </View>

      <YStack 
        flex={1} 
        marginTop="$-4" 
        backgroundColor="white" 
        borderTopLeftRadius={30} 
        borderTopRightRadius={30} 
        paddingHorizontal="$5"
        space="$4"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
            <YStack space="$4" paddingBottom="$8" paddingTop="$4">
                <H2 fontFamily="Montserrat" textAlign="center">Bienvenue</H2>
                <Text textAlign="center" color="$gray10" fontFamily="Montserrat">
                    Quelques infos pour commencer.
                </Text>

                <YStack space="$2" marginTop="$4">
                    <Label htmlFor="username" fontFamily="Montserrat" fontWeight="bold">Ton pseudo</Label>
                    <Input
                        id="username"
                        size="$4"
                        placeholder="Ex: TheFlash"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </YStack>

                <YStack space="$2">
                    <Label fontFamily="Montserrat" fontWeight="bold">Ton mode de transport</Label>
                    <XStack justifyContent="space-between" space="$2">
                        <TransportOption mode="walk" label="Marche" icon="🚶" />
                        <TransportOption mode="bike" label="Vélo" icon="🚲" />
                        <TransportOption mode="car" label="Voiture" icon="🚗" />
                    </XStack>
                </YStack>

                <Button 
                    theme="green" 
                    size="$5" 
                    onPress={handleFinish} 
                    marginTop="$8"
                    fontFamily="Montserrat"
                    disabled={loading}
                    icon={loading ? <Spinner /> : undefined}
                >
                    Terminer
                </Button>
            </YStack>
        </ScrollView>
      </YStack>
    </View>
  );
}
