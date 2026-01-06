import { Session } from '@supabase/supabase-js'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Button, H1, Text, View, YStack } from 'tamagui'
import { supabase } from '../lib/supabase'

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (!session) {
        router.replace('/(auth)/login')
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.replace('/(auth)/login')
      }
    })
  }, [])

  if (loading) {
     return <View flex={1} backgroundColor="$background" />
  }

  return (
    <View flex={1} alignItems="center" justifyContent="center" padding="$4" backgroundColor="$background">
      <YStack space="$4" alignItems="center">
        <H1>Bienvenue !</H1>
        <Text>Vous êtes connecté en tant que :</Text>
        <Text fontWeight="bold">{session?.user?.email}</Text>
        
        <Button 
          onPress={async () => {
            await supabase.auth.signOut()
          }} 
          themeInverse
        >
          Se déconnecter
        </Button>
      </YStack>
    </View>
  )
}
