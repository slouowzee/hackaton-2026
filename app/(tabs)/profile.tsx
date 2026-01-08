/**
 * Profile Screen
 *
 * Displays the user's profile information, including avatar, username, email, and preferred transport mode.
 * Allows the user to sign out of the application.
 */
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, H2, Separator, Spinner, Text, YStack } from 'tamagui';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * ProfileScreen Component
 *
 * Fetches and displays the current user's profile from Supabase.
 * Handles the logout process.
 *
 * @returns {JSX.Element} The rendered profile screen component.
 */
export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Error loading profile: ', error.message);
      }

      if (data) {
        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <YStack padding="$4" space="$4" alignItems="center">
        <H2 fontFamily="Montserrat" marginTop="$4">Mon Profil</H2>
        
        <Avatar circular size="$10">
          <Avatar.Image source={require('../../assets/images/placeholder.jpg')} />
          <Avatar.Fallback backgroundColor="$gray5" />
        </Avatar>
        
        {loading ? (
             <Spinner size="small" color="$green10"/>
        ) : (
            <>
                <Text fontSize="$5" fontWeight="bold" fontFamily="Montserrat">
                    {profile?.username || 'Utilisateur'}
                </Text>
                <Text color="$gray10" fontFamily="Montserrat">
                    {profile?.email}
                </Text>
                 <Text fontSize="$3" color="$gray8" fontFamily="Montserrat">
                    Mode préféré : {profile?.preferred_transport_mode === 'bike' ? 'Vélo 🚲' : profile?.preferred_transport_mode === 'car' ? 'Voiture 🚗' : 'Marche 🚶'}
                </Text>
            </>
        )}

        <Separator width="100%" marginVertical="$4" />

        <Button 
            onPress={handleLogout} 
            theme="red" 
            width="100%" 
            fontFamily="Montserrat"
            iconAfter={undefined}
        >
          Se déconnecter
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
