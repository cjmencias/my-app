import { Image } from 'expo-image';
import { Platform, StyleSheet, ScrollView } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.headerIcon}>
            <IconSymbol
              size={60}
              color="#007AFF"
              name="chevron.left.forwardslash.chevron.right"
            />
          </ThemedView>
          <ThemedText type="title" style={styles.title}>Explore</ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            Learn about the features and capabilities of this app
          </ThemedText>
        </ThemedView>

        {/* Content */}
        <ThemedView style={styles.content}>
          <ThemedText style={styles.description}>
            This app includes example code to help you get started with React Native and Expo.
          </ThemedText>

          <Collapsible title="📱 File-based routing">
            <ThemedText style={styles.collapsibleText}>
              This app has two screens:{' '}
              <ThemedText type="defaultSemiBold" style={styles.codeText}>app/(tabs)/index.tsx</ThemedText> and{' '}
              <ThemedText type="defaultSemiBold" style={styles.codeText}>app/(tabs)/explore.tsx</ThemedText>
            </ThemedText>
            <ThemedText style={styles.collapsibleText}>
              The layout file in <ThemedText type="defaultSemiBold" style={styles.codeText}>app/(tabs)/_layout.tsx</ThemedText>{' '}
              sets up the tab navigator.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="link">Learn more about routing</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="🌐 Cross-platform support">
            <ThemedText style={styles.collapsibleText}>
              You can open this project on Android, iOS, and the web. To open the web version, press{' '}
              <ThemedText type="defaultSemiBold" style={styles.codeText}>w</ThemedText> in the terminal running this project.
            </ThemedText>
          </Collapsible>

          <Collapsible title="🖼️ Images & Assets">
            <ThemedText style={styles.collapsibleText}>
              For static images, you can use the <ThemedText type="defaultSemiBold" style={styles.codeText}>@2x</ThemedText> and{' '}
              <ThemedText type="defaultSemiBold" style={styles.codeText}>@3x</ThemedText> suffixes to provide files for
              different screen densities.
            </ThemedText>
            <ThemedView style={styles.imageContainer}>
              <Image 
                source={require('@/assets/images/react-logo.png')} 
                style={styles.reactLogo} 
              />
            </ThemedView>
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="link">Learn more about images</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="🔤 Custom fonts">
            <ThemedText style={styles.collapsibleText}>
              Open <ThemedText type="defaultSemiBold" style={styles.codeText}>app/_layout.tsx</ThemedText> to see how to load{' '}
              <ThemedText style={[styles.collapsibleText, { fontFamily: 'SpaceMono' }]}>
                custom fonts such as this one.
              </ThemedText>
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
              <ThemedText type="link">Learn more about fonts</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="🎨 Light theme design">
            <ThemedText style={styles.collapsibleText}>
              This app uses a beautiful light theme with modern design principles. The{' '}
              <ThemedText type="defaultSemiBold" style={styles.codeText}>useColorScheme()</ThemedText> hook has been configured
              to always use light mode for a consistent, bright experience.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="link">Learn more about theming</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="✨ Animations & Effects">
            <ThemedText style={styles.collapsibleText}>
              This template includes examples of animated components. The{' '}
              <ThemedText type="defaultSemiBold" style={styles.codeText}>components/HelloWave.tsx</ThemedText> component uses
              the powerful <ThemedText type="defaultSemiBold" style={styles.codeText}>react-native-reanimated</ThemedText>{' '}
              library to create smooth animations.
            </ThemedText>
            {Platform.select({
              ios: (
                <ThemedText style={styles.collapsibleText}>
                  The app includes beautiful card layouts and smooth transitions for a native feel.
                </ThemedText>
              ),
            })}
          </Collapsible>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    color: '#1D1D1F',
  },
  subtitle: {
    textAlign: 'center',
    color: '#8E8E93',
    marginHorizontal: 20,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1D1D1F',
    marginBottom: 24,
    textAlign: 'center',
  },
  collapsibleText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1D1D1F',
    marginBottom: 12,
  },
  codeText: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#007AFF',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  reactLogo: {
    width: 100,
    height: 100,
  },
});
