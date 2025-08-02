import React, { useState, useEffect } from 'react';
import { Button, View, StyleSheet, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface GoogleAuthProps {
  clientId: string;
  onUserChange?: (user: UserInfo | null) => void;
}

interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export default function GoogleAuthSDK({ clientId, onUserChange }: GoogleAuthProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      loadGoogleScript();
    }
  }, []);

  // Notify parent when user state changes
  useEffect(() => {
    if (onUserChange) {
      onUserChange(user);
    }
  }, [user, onUserChange]);

  const loadGoogleScript = () => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services loaded');
      initializeGoogleAuth();
    };
    document.head.appendChild(script);
  };

  const initializeGoogleAuth = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      setIsGoogleLoaded(true);
      console.log('Google Auth initialized');
    }
  };

  const handleCredentialResponse = async (response: any) => {
    console.log('Credential response received');
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('User payload:', payload);
      
      const userInfo: UserInfo = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
      
      setUser(userInfo);
      setLoading(false);
    } catch (error) {
      console.error('Error processing credential:', error);
      Alert.alert('Error', 'Failed to process authentication');
      setLoading(false);
    }
  };

  const signInWithGoogle = () => {
    if (!isGoogleLoaded) {
      Alert.alert('Error', 'Google authentication not loaded yet');
      return;
    }

    console.log('Starting Google sign-in with popup...');
    setLoading(true);

    // Use Google's popup sign-in
    window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      callback: async (tokenResponse: any) => {
        console.log('Token response:', tokenResponse);
        if (tokenResponse.access_token) {
          await fetchUserInfo(tokenResponse.access_token);
        } else {
          Alert.alert('Error', 'No access token received');
          setLoading(false);
        }
      },
    }).requestAccessToken();
  };

  const fetchUserInfo = async (token: string) => {
    console.log('Fetching user info with token...');
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userInfo = await response.json();
        console.log('User info received:', userInfo);
        setUser(userInfo);
      } else {
        console.log('Failed to fetch user info:', response.status);
        Alert.alert('Error', 'Failed to fetch user information');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      Alert.alert('Error', 'Failed to fetch user information');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    console.log('Signing out user');
    setUser(null);
  };

  if (Platform.OS !== 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Google Sign-In with SDK is only available on web</ThemedText>
      </ThemedView>
    );
  }

  if (user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.userInfo}>
          <ThemedText style={styles.email}>{user.email}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.buttonContainer}>
          <Button title="Sign Out" onPress={signOut} color="#FF3B30" />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.buttonContainer}>
        <Button
          title={loading ? "Signing in..." : "Sign in with Google"}
          onPress={signInWithGoogle}
          disabled={loading || !isGoogleLoaded}
        />
      </ThemedView>
      {!isGoogleLoaded && (
        <ThemedText style={styles.loading}>Loading Google SDK...</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loading: {
    fontSize: 12,
    marginTop: 10,
    opacity: 0.6,
    textAlign: 'center',
  },
});
