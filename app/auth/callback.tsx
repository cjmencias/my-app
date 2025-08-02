import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Get the URL fragment (everything after #)
    const hash = window.location.hash;
    console.log('Auth callback received hash:', hash);

    if (hash) {
      // Parse the access token from the hash
      const params = new URLSearchParams(hash.substring(1)); // Remove the #
      const accessToken = params.get('access_token');
      const error = params.get('error');

      if (error) {
        console.error('OAuth error:', error);
        alert(`Authentication error: ${error}`);
      } else if (accessToken) {
        console.log('Access token received:', accessToken.substring(0, 20) + '...');
        
        // Store the token in localStorage for the main app to use
        localStorage.setItem('google_access_token', accessToken);
        
        // Show success message and redirect
        alert('Authentication successful! Redirecting...');
        
        // Redirect back to the main app
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        console.log('No access token found in callback');
        alert('No access token received');
      }
    } else {
      console.log('No hash found in callback URL');
      alert('No authentication data received');
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Processing Authentication...</Text>
      <Text style={styles.subtitle}>Please wait while we complete your sign-in.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
