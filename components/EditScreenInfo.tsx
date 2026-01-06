import React from 'react';
import { Paragraph, SizableText, YStack } from 'tamagui';

import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <YStack>
      <YStack alignItems="center" marginHorizontal="$10">
        <Paragraph
          textAlign="center"
          size="$4"
          lineHeight="$5"
          color="$color"
          marginBottom="$3"
        >
          Open up the code for this screen:
        </Paragraph>

        <YStack
          borderRadius="$3"
          marginVertical="$2"
          paddingHorizontal="$2"
          backgroundColor="$backgroundHover"
        >
          <MonoText>{path}</MonoText>
        </YStack>

        <Paragraph
          textAlign="center"
          size="$4"
          lineHeight="$5"
          color="$color"
          marginTop="$3"
        >
          Change any of the text, save the file, and your app will automatically update.
        </Paragraph>
      </YStack>

      <YStack marginTop="$4" marginHorizontal="$5" alignItems="center">
        <ExternalLink
          style={{ paddingVertical: 15 }}
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet"
        >
          <SizableText textAlign="center" color="$blue10">
            Tap here if your app doesn't automatically update after making changes
          </SizableText>
        </ExternalLink>
      </YStack>
    </YStack>
  );
}
