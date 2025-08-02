import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform, TextInput, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

// Simple map locations for demo
const DEMO_LOCATIONS = [
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
  { name: 'Denver, CO', lat: 39.7392, lng: -104.9903 },
];

export default function LocationPicker({ title, onLocationSelect, initialAddress = '', showError = false }: LocationPickerProps) {
  const [address, setAddress] = useState(initialAddress);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const isFieldEmpty = !address.trim();
  const shouldShowError = showError && isFieldEmpty;

  const handleAddressChange = (text: string) => {
    setAddress(text);
    // Auto-generate coordinates as user types
    if (text.trim()) {
      const mockCoordinates = generateMockCoordinates(text);
      setSelectedLocation(mockCoordinates);
      onLocationSelect(text, mockCoordinates);
    } else {
      setSelectedLocation(null);
      onLocationSelect('', { latitude: 0, longitude: 0 });
    }
  };

  const generateMockCoordinates = (address: string): LocationCoordinates => {
    // Simple hash function to generate consistent coordinates for same address
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      const char = address.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Generate coordinates within reasonable bounds (US-focused for demo)
    const lat = 37.0 + (Math.abs(hash % 1000) / 1000) * 10; // 37-47 latitude
    const lng = -122.0 - (Math.abs(hash % 2000) / 2000) * 50; // -122 to -172 longitude
    
    return {
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6))
    };
  };

  const openMapPicker = () => {
    setShowMapModal(true);
  };

  const selectLocationFromMap = (location: typeof DEMO_LOCATIONS[0]) => {
    const coordinates = { latitude: location.lat, longitude: location.lng };
    setAddress(location.name);
    setSelectedLocation(coordinates);
    onLocationSelect(location.name, coordinates);
    setShowMapModal(false);
    
    Alert.alert('Location Selected!', `📍 ${location.name}`);
  };

  const useCurrentLocation = () => {
    const currentLocation = {
      latitude: 37.7749,
      longitude: -122.4194
    };
    const currentAddress = 'San Francisco, CA';
    
    setAddress(currentAddress);
    setSelectedLocation(currentLocation);
    onLocationSelect(currentAddress, currentLocation);
    
    Alert.alert('Current Location', `📍 Using: ${currentAddress}`);
  };

  const renderMapModal = () => (
    <Modal
      visible={showMapModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={styles.modalHeader}>
          <ThemedText type="title" style={styles.modalTitle}>Select Location</ThemedText>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowMapModal(false)}
          >
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.mapContainer}>
          <ThemedText style={styles.mapInstructions}>
            Choose a location from the list below:
          </ThemedText>
          
          {DEMO_LOCATIONS.map((location, index) => (
            <TouchableOpacity
              key={index}
              style={styles.locationItem}
              onPress={() => selectLocationFromMap(location)}
            >
              <ThemedView style={styles.locationItemContent}>
                <ThemedText style={styles.locationName}>📍 {location.name}</ThemedText>
                <ThemedText style={styles.locationCoords}>
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>

        <ThemedView style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowMapModal(false)}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.label, shouldShowError && styles.labelError]}>{title} *</ThemedText>
      
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, shouldShowError && styles.inputError]}
          value={address}
          onChangeText={handleAddressChange}
          placeholder="Enter address or select from map"
          placeholderTextColor="#999"
        />
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={openMapPicker}
        >
          <ThemedText style={styles.iconButtonText}>🗺️</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={useCurrentLocation}
        >
          <ThemedText style={styles.iconButtonText}>📍</ThemedText>
        </TouchableOpacity>
      </View>

      {shouldShowError && (
        <ThemedText style={styles.errorText}>This field is required</ThemedText>
      )}

      {selectedLocation && address && (
        <ThemedView style={styles.locationInfo}>
          <ThemedText style={styles.locationTitle}>✅ {address}</ThemedText>
          <ThemedText style={styles.coordinatesText}>
            {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
          </ThemedText>
        </ThemedView>
      )}

      {renderMapModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  labelError: {
    color: '#FF3B30',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Platform.OS === 'web' ? '#fff' : 'transparent',
    color: '#000',
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  iconButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  locationInfo: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d5a2d',
    marginBottom: 2,
  },
  coordinatesText: {
    fontSize: 11,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#fff' : undefined,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  mapContainer: {
    flex: 1,
    padding: 20,
  },
  mapInstructions: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  locationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  locationItemContent: {
    padding: 16,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    opacity: 0.6,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
