import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';

interface GoogleAuthProps {
  clientId: string;
}

interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export default function GoogleAuth({ clientId }: GoogleAuthProps) {
  console.log('GoogleAuth component loaded with clientId:', clientId);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for stored token on component mount
  useEffect(() => {
    if (Platform.OS === 'web') {
      const storedToken = localStorage.getItem('google_access_token');
      if (storedToken) {
        console.log('Found stored access token');
        fetchUserInfo(storedToken);
        // Clear the token after using it
        localStorage.removeItem('google_access_token');
      }
    }
  }, []);

  const signInWithGoogle = () => {
    console.log('Starting Google sign-in...');
    setLoading(true);

    // Create OAuth URL that redirects to our callback route
    const redirectUri = 'http://localhost:3000/auth/callback';
    const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
    
    console.log('=== OAuth Configuration ===');
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    console.log('Scope:', scope);
    
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(scope)}&` +
      `include_granted_scopes=true`;

    console.log('Full auth URL:', authUrl);
    
    // Show detailed info before proceeding
    const message = `Client ID: ${clientId}\n\nRedirect URI: ${redirectUri}\n\nMake sure:\n1. You have a WEB APPLICATION client (not Android/iOS)\n2. The redirect URI above is added to your Google Console\n3. You've saved the changes\n\nProceed with sign-in?`;
    
    if (confirm(message)) {
      // Open in same window for web
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        // For mobile, open in external browser
        Linking.openURL(authUrl).catch(err => {
          console.error('Failed to open URL:', err);
          Alert.alert('Error', 'Failed to open authentication page');
          setLoading(false);
        });
      }
    } else {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (token: string) => {
    console.log('Fetching user info with token...');
    setLoading(true);
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userInfo = await response.json();
        console.log('User info received:', userInfo);
        setUser(userInfo);
      } else {
        const errorText = await response.text();
        console.log('Failed to fetch user info:', response.status, errorText);
        Alert.alert('Error', 'Invalid token or failed to fetch user information');
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
    // Clear any stored tokens
    if (Platform.OS === 'web') {
      localStorage.removeItem('google_access_token');
    }
  };

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome, {user.name}!</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Button title="Sign Out" onPress={signOut} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        title={loading ? "Signing in..." : "Sign in with Google"}
        onPress={signInWithGoogle}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
});
