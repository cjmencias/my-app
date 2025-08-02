import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import GoogleAuthSDK from '@/components/GoogleAuthSDK';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleUserChange = (userData: any) => {
    setUser(userData);
  };

  const navigateToBooking = () => {
    router.push('/booking');
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
        {/* Show booking button above auth component when user is signed in */}
        {user && (
          <ThemedView style={styles.bookingSection}>
            <TouchableOpacity style={styles.bookingButton} onPress={navigateToBooking}>
              <ThemedText style={styles.bookingButtonText}>📦 Book Parcel Delivery</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        
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
  bookingSection: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  bookingButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
