/**
 * Home Screen
 *
 * This file serves as the main entry point after authentication status is determined.
 * It handles the initial session check and redirection to either the authorized tabs or the login screen.
 */
import { Session } from '@supabase/supabase-js'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Spinner, View } from 'tamagui'
import { supabase } from '../lib/supabase'

/**
 * HomeScreen Component
 *
 * Checks for an active Supabase session and redirects the user accordingly.
 * Displays a loading spinner while the session status is being determined.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      handleNavigation(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      handleNavigation(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNavigation = (session: Session | null) => {
    if (session) {
      // @ts-ignore: Route exists but types might not be regenerated
      router.replace('/(tabs)')
    } else {
      router.replace('/(auth)/login')
    }
  }

  return (
    <View flex={1} alignItems="center" justifyContent="center" backgroundColor="white">
       <Spinner size="large" color="$green10" />
    </View>
  )
}
