import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform, TextInput, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// 🔑 SECURE: API key from environment variable
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface LocationPickerProps {
  title: string;
  onLocationSelect: (address: string, coordinates: { latitude: number; longitude: number }) => void;
  initialAddress?: string;
  showError?: boolean;
}

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Google Maps component for web
const GoogleMapComponent = ({ onLocationSelect, onClose }: { 
  onLocationSelect: (address: string, coordinates: LocationCoordinates) => void;
  onClose: () => void;
}) => {
  useEffect(() => {
    // Check if API key is available
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not found. Please add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file');
      Alert.alert(
        'Configuration Error',
        'Google Maps API key not found. Please check your .env file.',
        [{ text: 'OK', onPress: onClose }]
      );
      return;
    }

    // Load Google Maps script with environment variable API key
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => {
      console.error('Failed to load Google Maps. Check your API key and billing settings.');
      Alert.alert(
        'Maps Error',
        'Failed to load Google Maps. Please check your API key and billing settings.',
        [{ text: 'OK', onPress: onClose }]
      );
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initMap = () => {
    const map = new (window as any).google.maps.Map(document.getElementById('google-map'), {
      center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      zoom: 10,
    });

    // Add click listener to map
    map.addListener('click', async (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Reverse geocode to get address
      const geocoder = new (window as any).google.maps.Geocoder();
      try {
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results[0]) {
          const address = response.results[0].formatted_address;
          onLocationSelect(address, { latitude: lat, longitude: lng });
          onClose();
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
        onLocationSelect(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, { latitude: lat, longitude: lng });
        onClose();
      }
    });

    // Add search box
    const searchBox = new (window as any).google.maps.places.SearchBox(
      document.getElementById('map-search-input')
    );

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        map.setCenter({ lat, lng });
        map.setZoom(15);
        
        onLocationSelect(place.formatted_address || place.name, { latitude: lat, longitude: lng });
        onClose();
      }
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <input
          id="map-search-input"
          type="text"
          placeholder="Search for a location..."
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
          💡 Search for an address or click anywhere on the map to select a location
        </p>
      </div>
      <div id="google-map" style={{ flex: 1 }} />
    </div>
  );
};

// Rest of component implementation...
export default function LocationPicker({ title, onLocationSelect, initialAddress = '', showError = false }: LocationPickerProps) {
  // Implementation would continue here...
  return <div>Secure Google Maps LocationPicker</div>;
}
