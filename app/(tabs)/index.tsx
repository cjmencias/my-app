import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.container}>
        {/* Header Section */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/partial-react-logo.png')}
              style={styles.logo}
            />
          </ThemedView>
          
          {user ? (
            <ThemedView style={styles.welcomeSection}>
              <ThemedText type="title" style={styles.title}>
                Welcome back!
              </ThemedText>
              <ThemedText type="subtitle" style={styles.userName}>
                {user.name}
              </ThemedText>
              <ThemedText type="body" style={styles.subtitle}>
                Ready to send your next package?
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.welcomeSection}>
              <ThemedText type="title" style={styles.title}>
                Welcome to my-app
              </ThemedText>
              <ThemedText type="body" style={styles.subtitle}>
                Your trusted parcel delivery service
              </ThemedText>
              <ThemedText type="caption" style={styles.signInPrompt}>
                Sign in with your Google account to get started
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Main Content Card */}
        <ThemedView type="card" style={styles.mainCard}>
          {user && (
            <ThemedView style={styles.bookingSection}>
              <ThemedView style={styles.bookingHeader}>
                <ThemedText type="subtitle" style={styles.bookingTitle}>
                  Quick Actions
                </ThemedText>
                <ThemedText type="caption" style={styles.bookingDescription}>
                  Send packages anywhere, anytime
                </ThemedText>
              </ThemedView>
              
              <TouchableOpacity style={styles.bookingButton} onPress={navigateToBooking}>
                <ThemedView style={styles.bookingButtonContent}>
                  <ThemedView style={styles.bookingIcon}>
                    <ThemedText style={styles.bookingEmoji}>📦</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.bookingTextContainer}>
                    <ThemedText style={styles.bookingButtonText}>Book Parcel Delivery</ThemedText>
                    <ThemedText style={styles.bookingButtonSubtext}>Fast, reliable, secure</ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.bookingArrow}>→</ThemedText>
                </ThemedView>
              </TouchableOpacity>
            </ThemedView>
          )}

          {/* Auth Section */}
          <ThemedView style={styles.authSection}>
            <GoogleAuthSDK 
              clientId="904244077655-sj7458lm19tcsbei2heslgi93e62564f.apps.googleusercontent.com" 
              onUserChange={handleUserChange}
            />
          </ThemedView>
        </ThemedView>

        {/* Features Section (when not signed in) */}
        {!user && (
          <ThemedView style={styles.featuresSection}>
            <ThemedText type="subtitle" style={styles.featuresTitle}>
              Why choose my-app?
            </ThemedText>
            
            <ThemedView style={styles.featuresList}>
              <ThemedView style={styles.featureItem}>
                <ThemedText style={styles.featureIcon}>🚚</ThemedText>
                <ThemedView style={styles.featureContent}>
                  <ThemedText type="defaultSemiBold" style={styles.featureTitle}>Fast Delivery</ThemedText>
                  <ThemedText type="caption" style={styles.featureDescription}>Same-day and next-day options</ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={styles.featureItem}>
                <ThemedText style={styles.featureIcon}>📍</ThemedText>
                <ThemedView style={styles.featureContent}>
                  <ThemedText type="defaultSemiBold" style={styles.featureTitle}>Real-time Tracking</ThemedText>
                  <ThemedText type="caption" style={styles.featureDescription}>Know where your package is</ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={styles.featureItem}>
                <ThemedText style={styles.featureIcon}>🔒</ThemedText>
                <ThemedView style={styles.featureContent}>
                  <ThemedText type="defaultSemiBold" style={styles.featureTitle}>Secure & Insured</ThemedText>
                  <ThemedText type="caption" style={styles.featureDescription}>Your packages are protected</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    height: 80,
    width: 120,
  },
  welcomeSection: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#1D1D1F',
  },
  userName: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#007AFF',
  },
  subtitle: {
    textAlign: 'center',
    color: '#8E8E93',
    marginHorizontal: 20,
  },
  signInPrompt: {
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  mainCard: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  bookingSection: {
    marginBottom: 24,
  },
  bookingHeader: {
    marginBottom: 16,
  },
  bookingTitle: {
    marginBottom: 4,
    color: '#1D1D1F',
  },
  bookingDescription: {
    color: '#8E8E93',
  },
  bookingButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 3,
    borderColor: '#000000',
    marginVertical: 10,
  },
  bookingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  bookingEmoji: {
    fontSize: 28,
  },
  bookingTextContainer: {
    flex: 1,
  },
  bookingButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'left',
  },
  bookingButtonSubtext: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingArrow: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '900',
  },
  authSection: {
    alignItems: 'center',
  },
  featuresSection: {
    margin: 20,
    marginTop: 30, // Add proper top spacing
    paddingTop: 10, // Additional padding for better spacing
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 24, // Slightly more space below title
    marginTop: 8, // Small top margin for breathing room
    color: '#1D1D1F',
    fontSize: 22, // Slightly larger for better hierarchy
    fontWeight: '700', // Bolder for better emphasis
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: 2,
    color: '#1D1D1F',
  },
  featureDescription: {
    color: '#8E8E93',
  },
});
