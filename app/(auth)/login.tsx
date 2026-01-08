/**
 * Login Screen
 *
 * Allows users to authenticate with their email and password.
 * Provides options for social logins (UI only for now).
 */
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Dimensions, TextInput } from 'react-native'
import { Button, H2, Image, Input, Separator, Spinner, Text, View, XStack, YStack } from 'tamagui'
import { supabase } from '../../lib/supabase'

const { width } = Dimensions.get('window')

/**
 * LoginScreen Component
 *
 * Manages the user login process via Supabase authentication.
 *
 * @returns {JSX.Element} The rendered login screen.
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  /**
   * Signs in the user using email and password.
   */
  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert('Erreur de connexion', error.message)
    } else {
      router.replace('/')
    }
    setLoading(false)
  }

  return (
    <View flex={1} backgroundColor="white">
      <View height={320} width="100%" position="relative">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2000' }} 
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View 
            position="absolute" 
            bottom={0} 
            left={0} 
            right={0} 
            height={60} 
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
        <H2 textAlign="center" marginBottom="$2" fontFamily="Montserrat" color="$color" fontWeight="800">Se connecter</H2>
        
        <YStack space="$3">
            <Input 
            placeholder="Email" 
            autoCapitalize="none" 
            onChangeText={(text) => setEmail(text)}
            value={email}
            keyboardType="email-address"
            backgroundColor="$gray2"
            borderColor="transparent"
            borderRadius="$4"
            height={50}
            />
            
            <View width="100%" height={50} justifyContent="center">
                <TextInput 
                    placeholder="Mot de passe" 
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    value={password}
                    style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: 9,
                        height: 50,
                        paddingHorizontal: 15,
                        paddingRight: 50,
                        fontFamily: 'Montserrat',
                        fontSize: 14,
                        color: 'black', 
                    }}
                />
                 <Button 
                    position="absolute"
                    right={0}
                    top={0}
                    bottom={0}
                    zIndex={10}
                    chromeless
                    onPress={() => setShowPassword(!showPassword)}
                    icon={<FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color="#9ca3af" />}
                />
            </View>
        </YStack>
        
        <Button 
          onPress={() => signInWithEmail()} 
          backgroundColor="#10b981"
          color="white"
          borderRadius="$4"
          height={50}
          marginTop="$2"
          disabled={loading}
          icon={loading ? <Spinner color="white" /> : undefined}
          fontFamily="Montserrat"
          fontWeight="bold"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>

        <XStack alignItems="center" gap="$3" marginVertical="$2">
            <Separator />
            <Text color="$gray8" fontSize="$3" fontFamily="Montserrat">Ou continuer avec</Text>
            <Separator />
        </XStack>

        <XStack justifyContent="center" gap="$4">
            <SocialButton image="https://freelogopng.com/images/all_img/1657952440google-logo-png-transparent.png" />
            <SocialButton image="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png" />
            <SocialButton image="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png" />
        </XStack>

      </YStack>
    </View>
  )
}

/**
 * SocialButton Component
 *
 * Renders a button for social login providers.
 *
 * @param {object} props - The component props.
 * @param {string} props.image - The URL of the social provider's logo.
 * @returns {JSX.Element} The rendered button component.
 */
function SocialButton({ image }: { image: string }) {
    return (
        <Button 
            size="$5" 
            circular 
            backgroundColor="white"
            borderWidth={1}
            borderColor="$gray4"
            pressStyle={{ backgroundColor: '$gray2', scale: 0.97 }}
            onPress={() => Alert.alert('Fonctionnalité à venir', 'La connexion sociale sera bientôt disponible via Supabase.')}
        >
            <Image source={{ uri: image }} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Button>
    )
}
