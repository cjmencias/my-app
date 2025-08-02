import React, { useState, useEffect } from 'react';
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

// Demo locations for fallback
const DEMO_LOCATIONS = [
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
];

// Free OpenStreetMap component with geolocation
const OpenStreetMapComponent = ({ onLocationSelect, onClose }: { 
  onLocationSelect: (address: string, coordinates: LocationCoordinates) => void;
  onClose: () => void;
}) => {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  useEffect(() => {
    // Load Leaflet CSS and JS (completely free!)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      // First get location, then initialize map
      getCurrentLocationForMap();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  const getCurrentLocationForMap = () => {
    if (navigator.geolocation) {
      console.log('Requesting location permission...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log('Location permission granted:', coords);
          setUserLocation(coords);
          setLocationPermission('granted');
          // Initialize map with user's location
          initMap(coords);
        },
        (error) => {
          console.log('Location permission denied or failed:', error.message);
          setLocationPermission('denied');
          // Initialize map with default location
          initMap(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.log('Geolocation not supported');
      setLocationPermission('denied');
      initMap(null);
    }
  };

  const initMap = (initialLocation: LocationCoordinates | null) => {
    const L = (window as any).L;
    
    // Use user location if available, otherwise default to San Francisco
    const mapCenter = initialLocation ? 
      [initialLocation.latitude, initialLocation.longitude] : 
      [37.7749, -122.4194];
    
    const initialZoom = initialLocation ? 13 : 10;
    
    console.log('Initializing map at:', mapCenter);
    
    // Create map
    const map = L.map('leaflet-map').setView(mapCenter, initialZoom);

    // Add free OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marker: any = null;
    let userLocationMarker: any = null;

    // Add user location marker if available
    if (initialLocation) {
      userLocationMarker = L.marker([initialLocation.latitude, initialLocation.longitude], {
        icon: L.divIcon({
          html: '<div style="background: #34C759; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">📍</div>',
          iconSize: [20, 20],
          className: 'current-location-marker'
        })
      }).addTo(map);
      
      userLocationMarker.bindPopup('📍 Your Current Location');
    }

    // Add click listener to map
    map.on('click', async (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Remove previous marker
      if (marker) {
        map.removeLayer(marker);
      }
      
      // Add new marker
      marker = L.marker([lat, lng]).addTo(map);
      
      // Get address using free Nominatim service
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        marker.bindPopup(`📍 ${address}`).openPopup();
        
        setTimeout(() => {
          onLocationSelect(address, { latitude: lat, longitude: lng });
          onClose();
        }, 1000);
        
      } catch (error) {
        console.error('Geocoding failed:', error);
        const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        marker.bindPopup(`📍 ${coords}`).openPopup();
        
        setTimeout(() => {
          onLocationSelect(coords, { latitude: lat, longitude: lng });
          onClose();
        }, 1000);
      }
    });

    // Add search and current location functionality
    const searchInput = document.getElementById('map-search-input') as HTMLInputElement;
    const searchButton = document.getElementById('map-search-button') as HTMLButtonElement;
    const currentLocationButton = document.getElementById('map-current-location-button') as HTMLButtonElement;
    
    const performSearch = async () => {
      const query = searchInput.value.trim();
      if (!query) return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
        );
        const data = await response.json();
        
        if (data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          map.setView([lat, lng], 15);
          
          if (marker) {
            map.removeLayer(marker);
          }
          
          marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(`📍 ${result.display_name}`).openPopup();
          
          setTimeout(() => {
            onLocationSelect(result.display_name, { latitude: lat, longitude: lng });
            onClose();
          }, 1500);
        } else {
          alert('Location not found. Please try a different search term.');
        }
      } catch (error) {
        console.error('Search failed:', error);
        alert('Search failed. Please try again.');
      }
    };

    const useCurrentLocationOnMap = async () => {
      if (locationPermission === 'denied') {
        alert('Location access was denied. Please enable location services in your browser settings and refresh the page.');
        return;
      }

      if (!userLocation) {
        // Try to get location again
        console.log('Trying to get current location...');
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              console.log('Got current location:', coords);
              setUserLocation(coords);
              
              // Move map to current location
              map.setView([coords.latitude, coords.longitude], 15);
              
              // Add/update user location marker
              if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
              }
              
              userLocationMarker = L.marker([coords.latitude, coords.longitude], {
                icon: L.divIcon({
                  html: '<div style="background: #34C759; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">📍</div>',
                  iconSize: [20, 20],
                  className: 'current-location-marker'
                })
              }).addTo(map);
              
              // Get address and select it
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`
                );
                const data = await response.json();
                const address = data.display_name || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
                
                onLocationSelect(address, coords);
                onClose();
              } catch (error) {
                console.error('Failed to get address for current location:', error);
                const coordsString = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
                onLocationSelect(coordsString, coords);
                onClose();
              }
            },
            (error) => {
              console.error('Failed to get current location:', error);
              let message = 'Unable to get your current location. ';
              
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  message += 'Please allow location access in your browser settings.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  message += 'Location information is unavailable.';
                  break;
                case error.TIMEOUT:
                  message += 'Location request timed out. Please try again.';
                  break;
                default:
                  message += 'An unknown error occurred.';
                  break;
              }
              
              alert(message);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 60000
            }
          );
        } else {
          alert('Geolocation is not supported by this browser.');
        }
        return;
      }

      // Use existing location
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}&addressdetails=1`
        );
        const data = await response.json();
        const address = data.display_name || `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`;
        
        onLocationSelect(address, userLocation);
        onClose();
      } catch (error) {
        console.error('Failed to get address for current location:', error);
        const coords = `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`;
        onLocationSelect(coords, userLocation);
        onClose();
      }
    };

    if (searchButton) {
      searchButton.onclick = performSearch;
    }
    
    if (searchInput) {
      searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
          performSearch();
        }
      };
    }

    if (currentLocationButton) {
      currentLocationButton.onclick = useCurrentLocationOnMap;
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            id="map-search-input"
            type="text"
            placeholder="Search for a location..."
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <button
            id="map-search-button"
            style={{
              padding: '10px 15px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔍
          </button>
          <button
            id="map-current-location-button"
            style={{
              padding: '10px 15px',
              backgroundColor: locationPermission === 'granted' ? '#34C759' : locationPermission === 'denied' ? '#FF3B30' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title={
              locationPermission === 'granted' ? 'Use your current location' : 
              locationPermission === 'denied' ? 'Location access denied - click to try again' :
              'Getting location permission...'
            }
          >
            📍
          </button>
        </div>
        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
          💡 Search, click the map, or use your current location 
          {locationPermission === 'granted' && ' (✅ detected)'}
          {locationPermission === 'denied' && ' (❌ access denied)'}
          {locationPermission === 'pending' && ' (⏳ requesting permission...)'}
        </p>
      </div>
      <div id="leaflet-map" style={{ flex: 1 }} />
    </div>
  );
};

export default function LocationPicker({ title, onLocationSelect, initialAddress = '', showError = false }: LocationPickerProps) {
  const [address, setAddress] = useState(initialAddress);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const isFieldEmpty = !address.trim();
  const shouldShowError = showError && isFieldEmpty;

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCurrentLocation(coords);
          console.log('Current location detected for', title, ':', coords);
        },
        (error) => {
          console.log('Geolocation error for', title, ':', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  };

  const handleAddressChange = (text: string) => {
    setAddress(text);
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
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      const char = address.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const lat = 37.0 + (Math.abs(hash % 1000) / 1000) * 10;
    const lng = -122.0 - (Math.abs(hash % 2000) / 2000) * 50;
    
    return {
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6))
    };
  };

  const openMapPicker = () => {
    if (Platform.OS === 'web') {
      setShowMapModal(true);
    } else {
      Alert.alert(
        'Select Location',
        'Choose from popular cities:',
        [
          ...DEMO_LOCATIONS.map(location => ({
            text: location.name,
            onPress: () => selectCity(location.name, location.lat, location.lng)
          })),
          { text: 'Cancel', style: 'cancel' as const }
        ]
      );
    }
  };

  const selectCity = (cityName: string, lat: number, lng: number) => {
    const coordinates = { latitude: lat, longitude: lng };
    setAddress(cityName);
    setSelectedLocation(coordinates);
    onLocationSelect(cityName, coordinates);
    Alert.alert('Location Selected!', `📍 ${cityName}`);
  };

  const handleMapLocationSelect = (selectedAddress: string, coordinates: LocationCoordinates) => {
    setAddress(selectedAddress);
    setSelectedLocation(coordinates);
    onLocationSelect(selectedAddress, coordinates);
    Alert.alert('Location Selected!', `📍 ${selectedAddress}`);
  };

  const useCurrentLocation = async () => {
    if (!currentLocation) {
      setIsGettingLocation(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setCurrentLocation(coords);
            
            // Get address for current location
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`
              );
              const data = await response.json();
              const currentAddress = data.display_name || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
              
              setAddress(currentAddress);
              setSelectedLocation(coords);
              onLocationSelect(currentAddress, coords);
              
              Alert.alert('Current Location Found!', `📍 ${currentAddress}`);
            } catch (error) {
              console.error('Failed to get address:', error);
              const coordsString = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
              setAddress(coordsString);
              setSelectedLocation(coords);
              onLocationSelect(coordsString, coords);
              
              Alert.alert('Current Location Found!', `📍 ${coordsString}`);
            }
            setIsGettingLocation(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setIsGettingLocation(false);
            Alert.alert(
              'Location Access Denied',
              'Please allow location access in your browser settings, or enter an address manually.',
              [{ text: 'OK' }]
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
      } else {
        setIsGettingLocation(false);
        Alert.alert('Location Not Supported', 'Your browser does not support location services.');
      }
    } else {
      // Use already detected location
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&addressdetails=1`
        );
        const data = await response.json();
        const currentAddress = data.display_name || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
        
        setAddress(currentAddress);
        setSelectedLocation(currentLocation);
        onLocationSelect(currentAddress, currentLocation);
        
        Alert.alert('Current Location Used!', `📍 ${currentAddress}`);
      } catch (error) {
        console.error('Failed to get address:', error);
        const coordsString = `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
        setAddress(coordsString);
        setSelectedLocation(currentLocation);
        onLocationSelect(coordsString, currentLocation);
        
        Alert.alert('Current Location Used!', `📍 ${coordsString}`);
      }
    }
  };

  const renderMapModal = () => (
    <Modal
      visible={showMapModal}
      animationType="slide"
      presentationStyle="fullScreen"
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

        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <OpenStreetMapComponent 
              onLocationSelect={handleMapLocationSelect}
              onClose={() => setShowMapModal(false)}
            />
          ) : (
            <ThemedView style={styles.fallbackContainer}>
              <ThemedText style={styles.fallbackText}>
                Interactive maps are available on web. Please use the city selection or enter address manually.
              </ThemedText>
            </ThemedView>
          )}
        </View>
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
          placeholder="Enter address or use location services"
          placeholderTextColor="#999"
        />
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={openMapPicker}
        >
          <ThemedText style={styles.iconButtonText}>🗺️</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.iconButton, 
            isGettingLocation && styles.iconButtonLoading,
            currentLocation && styles.iconButtonActive
          ]} 
          onPress={useCurrentLocation}
          disabled={isGettingLocation}
        >
          <ThemedText style={styles.iconButtonText}>
            {isGettingLocation ? '⏳' : '📍'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {shouldShowError && (
        <ThemedText style={styles.errorText}>This field is required</ThemedText>
      )}

      {currentLocation && !selectedLocation && (
        <ThemedText style={styles.locationHint}>
          💡 Current location detected - tap 📍 to use it
        </ThemedText>
      )}

      {selectedLocation && address && (
        <ThemedView style={styles.locationInfo}>
          <ThemedText style={styles.locationTitle}>✅ {address}</ThemedText>
          <ThemedText style={styles.coordinatesText}>
            {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            {currentLocation && 
             Math.abs(selectedLocation.latitude - currentLocation.latitude) < 0.001 && 
             Math.abs(selectedLocation.longitude - currentLocation.longitude) < 0.001 && 
             ' (Current Location)'}
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
  iconButtonLoading: {
    backgroundColor: '#ccc',
  },
  iconButtonActive: {
    backgroundColor: '#34C759',
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
  locationHint: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 4,
    fontStyle: 'italic',
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
    backgroundColor: '#fff',
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
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
});
