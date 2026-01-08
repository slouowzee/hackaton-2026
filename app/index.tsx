import { Session } from '@supabase/supabase-js'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Spinner, View } from 'tamagui'
import { supabase } from '../lib/supabase'

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check Initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      handleNavigation(session)
    })

    // 2. Écoute les changements (connexion, déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      handleNavigation(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNavigation = (session: Session | null) => {
    if (session) {
      // @ts-ignore: Route existe bien mais Expo Router n'a pas encore régénéré les types
      router.replace('/(tabs)')
    } else {
      router.replace('/(auth)/login')
    }
  }

  // Écran de chargement minimal pendant la décision
  return (
    <View flex={1} alignItems="center" justifyContent="center" backgroundColor="white">
       <Spinner size="large" color="$green10" />
    </View>
  )
}
