/**
 * Register Screen
 *
 * Allows new users to create an account using email and password.
 * Includes form validation for email format and password matching.
 */
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, TextInput } from 'react-native'
import { Button, H2, Image, Input, ScrollView, Separator, Spinner, Text, View, XStack, YStack } from 'tamagui'
import { supabase } from '../../lib/supabase'

/**
 * RegisterScreen Component
 *
 * Handles user registration via Supabase authentication.
 *
 * @returns {JSX.Element} The rendered registration screen.
 */
export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /**
   * Validates the registration form inputs.
   *
   * @returns {boolean} True if the form is valid, otherwise false.
   */
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        Alert.alert('Erreur', 'Veuillez entrer une adresse email valide.')
        return false
    }

    if (password.length < 8) {
        Alert.alert('Sécurité', 'Le mot de passe doit contenir au moins 8 caractères.')
        return false
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.')
      return false
    }

    return true
  }

  /**
   * Registers a new user with email and password.
   */
  async function signUpWithEmail() {
    if (!validateForm()) return

    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert('Erreur', error.message)
    } else {
      router.replace('/onboarding/step1')
    }
    setLoading(false)
  }

  return (
    <View flex={1} backgroundColor="white">
      <View height={320} width="100%" position="relative">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2000' }} 
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
        <ScrollView showsVerticalScrollIndicator={false}>
            <H2 textAlign="center" marginBottom="$3" fontFamily="Montserrat" color="$color" fontWeight="800">S'inscrire</H2>
            
            <YStack space="$3">
                <Input 
                    placeholder="Email" 
                    autoCapitalize="none" 
                    value={email}
                    onChangeText={setEmail}
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
                        value={password}
                        onChangeText={setPassword}
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

                <View width="100%" height={50} justifyContent="center">
                    <TextInput 
                        placeholder="Confirmer le mot de passe" 
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
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
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        icon={<FontAwesome name={showConfirmPassword ? "eye" : "eye-slash"} size={20} color="#9ca3af" />}
                    />
                </View>
            </YStack>
            
            <Button 
            onPress={signUpWithEmail} 
            backgroundColor="#10b981"
            color="white"
            borderRadius="$4"
            height={50}
            marginTop="$4"
            disabled={loading}
            icon={loading ? <Spinner color="white" /> : undefined}
            fontFamily="Montserrat"
            fontWeight="bold"
            >
            {loading ? 'Inscription...' : "S'inscrire"}
            </Button>

            <XStack alignItems="center" gap="$3" marginVertical="$4">
                <Separator />
                <Text color="$gray8" fontSize="$3" fontFamily="Montserrat">Ou s'inscrire avec</Text>
                <Separator />
            </XStack>

            <XStack justifyContent="center" gap="$4" marginBottom="$8">
                <SocialButton image="https://freelogopng.com/images/all_img/1657952440google-logo-png-transparent.png" />
                <SocialButton image="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png" />
                <SocialButton image="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png" />
            </XStack>
        </ScrollView>
      </YStack>
    </View>
  )
}

function SocialButton({ image }: { image: string }) {
    return (
        <Button 
            size="$5" 
            circular 
            backgroundColor="white"
            borderWidth={1}
            borderColor="$gray4"
            pressStyle={{ backgroundColor: '$gray2', scale: 0.97 }}
            onPress={() => Alert.alert('Fonctionnalité à venir', 'L\'inscription sociale sera bientôt disponible via Supabase.')}
        >
             <Image source={{ uri: image }} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Button>
    )
}
