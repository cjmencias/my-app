import React, { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true); // Start with loading true
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // First, try to restore user from localStorage
      restoreUserFromStorage();
      // Then load Google script
      loadGoogleScript();
    }
  }, []);

  // Notify parent when user state changes
  useEffect(() => {
    if (onUserChange) {
      onUserChange(user);
    }
  }, [user, onUserChange]);

  const restoreUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('google_user');
      const storedTokenExpiry = localStorage.getItem('google_token_expiry');
      
      if (storedUser && storedTokenExpiry) {
        const expiryTime = parseInt(storedTokenExpiry);
        const currentTime = Date.now();
        
        // Check if token is still valid (with 5 minute buffer)
        if (currentTime < expiryTime - 300000) { // 5 minutes buffer
          const userData = JSON.parse(storedUser);
          console.log('Restored user from storage:', userData);
          setUser(userData);
          setLoading(false);
          return;
        } else {
          // Token expired, clear storage
          console.log('Stored token expired, clearing storage');
          clearStoredAuth();
        }
      }
    } catch (error) {
      console.error('Error restoring user from storage:', error);
      clearStoredAuth();
    }
    setLoading(false);
  };

  const clearStoredAuth = () => {
    localStorage.removeItem('google_user');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('google_access_token');
  };

  const storeUserData = (userData: UserInfo, expiresIn: number = 3600) => {
    try {
      // Store user data
      localStorage.setItem('google_user', JSON.stringify(userData));
      
      // Store expiry time (current time + expires_in seconds)
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem('google_token_expiry', expiryTime.toString());
      
      console.log('User data stored, expires at:', new Date(expiryTime));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

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
    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      setLoading(false);
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
    setLoading(false);
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
      
      // Store user data with default 1 hour expiry
      storeUserData(userInfo, 3600);
      
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
          // Store the access token for potential future use
          localStorage.setItem('google_access_token', tokenResponse.access_token);
          
          await fetchUserInfo(tokenResponse.access_token, tokenResponse.expires_in);
        } else {
          Alert.alert('Error', 'No access token received');
          setLoading(false);
        }
      },
    }).requestAccessToken();
  };

  const fetchUserInfo = async (token: string, expiresIn: number = 3600) => {
    console.log('Fetching user info with token...');
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userInfo = await response.json();
        console.log('User info received:', userInfo);
        
        // Store user data with actual expiry time
        storeUserData(userInfo, expiresIn);
        
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
    
    // Clear stored data
    clearStoredAuth();
    
    // Clear React state
    setUser(null);
    
    // Optionally revoke Google token
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    Alert.alert('Signed Out', 'You have been successfully signed out.');
  };

  // Show loading state while checking stored auth
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>⏳ Checking authentication...</ThemedText>
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
          disabled={!isGoogleLoaded || loading}
        />
      </ThemedView>
      {!isGoogleLoaded && !loading && (
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
    color: '#8E8E93',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loading: {
    fontSize: 12,
    marginTop: 10,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
