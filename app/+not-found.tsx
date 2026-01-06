import { Link, Stack } from 'expo-router';
import { H4, Paragraph, YStack } from 'tamagui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <H4 fontWeight="bold">This screen doesn't exist.</H4>

        <Link href="/" style={{ marginTop: 15 }}>
          <Paragraph color="$blue10" paddingVertical="$4">
            Go to home screen!
          </Paragraph>
        </Link>
      </YStack>
    </>
  );
}
