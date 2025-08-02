import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Oops!',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1D1D1F',
      }} />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>Page Not Found</ThemedText>
          <ThemedText style={styles.message}>
            Sorry, the page you're looking for doesn't exist.
          </ThemedText>
          <Link href="/" style={styles.link}>
            <ThemedView style={styles.linkButton}>
              <ThemedText style={styles.linkText}>← Go to Home</ThemedText>
            </ThemedView>
          </Link>
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    maxWidth: 400,
    width: '100%',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#1D1D1F',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#8E8E93',
    marginBottom: 24,
    lineHeight: 24,
  },
  link: {
    width: '100%',
  },
  linkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
