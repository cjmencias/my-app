import React, { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import GoogleAuthSDK from '@/components/GoogleAuthSDK';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export default function HomeScreen() {
  const [user, setUser] = useState<UserInfo | null>(null);

  const handleUserChange = (userData: UserInfo | null) => {
    setUser(userData);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.logo}
        />
        
        {user ? (
          <>
            <ThemedText type="title" style={styles.title}>
              Welcome back, {user.name}!
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              You're successfully signed in to my-app
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText type="title" style={styles.title}>Welcome to my-app</ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign in with your Google account to get started
            </ThemedText>
          </>
        )}
      </ThemedView>

      <ThemedView style={styles.authSection}>
        <GoogleAuthSDK 
          clientId="904244077655-sj7458lm19tcsbei2heslgi93e62564f.apps.googleusercontent.com" 
          onUserChange={handleUserChange}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    height: 120,
    width: 180,
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
    marginHorizontal: 20,
  },
  authSection: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
});
