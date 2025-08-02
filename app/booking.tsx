import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, TextInput, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import LocationPicker from '@/components/LocationPicker';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface ParcelDetails {
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  description: string;
  value: string;
}

interface BookingData {
  pickupLocation: string;
  pickupCoordinates?: LocationCoordinates;
  destination: string;
  destinationCoordinates?: LocationCoordinates;
  parcelDetails: ParcelDetails;
  deliveryType: 'standard' | 'express' | 'overnight';
}

export default function BookingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [showValidation, setShowValidation] = useState(false);
  const [booking, setBooking] = useState<BookingData>({
    pickupLocation: '',
    destination: '',
    parcelDetails: {
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
      },
      description: '',
      value: '',
    },
    deliveryType: 'standard',
  });

  // This screen should only be accessible when user is signed in
  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Access denied. Please sign in first.</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>← Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handlePickupLocationSelect = (address: string, coordinates: LocationCoordinates) => {
    setBooking(prev => ({
      ...prev,
      pickupLocation: address,
      pickupCoordinates: coordinates,
    }));
  };

  const handleDestinationSelect = (address: string, coordinates: LocationCoordinates) => {
    setBooking(prev => ({
      ...prev,
      destination: address,
      destinationCoordinates: coordinates,
    }));
  };

  const updateBooking = (field: keyof BookingData, value: any) => {
    setBooking(prev => ({ ...prev, [field]: value }));
  };

  const updateParcelDetails = (field: keyof ParcelDetails, value: any) => {
    setBooking(prev => ({
      ...prev,
      parcelDetails: { ...prev.parcelDetails, [field]: value }
    }));
  };

  const updateDimensions = (dimension: keyof ParcelDetails['dimensions'], value: string) => {
    setBooking(prev => ({
      ...prev,
      parcelDetails: {
        ...prev.parcelDetails,
        dimensions: { ...prev.parcelDetails.dimensions, [dimension]: value }
      }
    }));
  };

  const calculateEstimatedCost = () => {
    const weight = parseFloat(booking.parcelDetails.weight) || 0;
    let baseRate = booking.deliveryType === 'overnight' ? 25 : 
                   booking.deliveryType === 'express' ? 15 : 10;
    
    // Calculate distance-based pricing if coordinates are available
    if (booking.pickupCoordinates && booking.destinationCoordinates) {
      const distance = calculateDistance(
        booking.pickupCoordinates,
        booking.destinationCoordinates
      );
      const distanceCost = distance * 0.5; // $0.50 per km
      baseRate += distanceCost;
    }
    
    return (baseRate + (weight * 2)).toFixed(2);
  };

  const calculateDistance = (coord1: LocationCoordinates, coord2: LocationCoordinates) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(coord2.latitude - coord1.latitude);
    const dLon = deg2rad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(coord1.latitude)) *
        Math.cos(deg2rad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  // Validation helper functions
  const isFieldEmpty = (value: string) => !value.trim();
  
  const getFieldStyle = (value: string, isRequired: boolean = false) => {
    if (showValidation && isRequired && isFieldEmpty(value)) {
      return [styles.input, styles.inputError];
    }
    return styles.input;
  };

  const getLabelStyle = (value: string, isRequired: boolean = false) => {
    if (showValidation && isRequired && isFieldEmpty(value)) {
      return [styles.label, styles.labelError];
    }
    return styles.label;
  };

  const handleBooking = () => {
    // Show validation styling
    setShowValidation(true);
    
    // Validate required fields
    const requiredFields = [
      { field: booking.pickupLocation, name: 'Pickup location' },
      { field: booking.destination, name: 'Destination' },
      { field: booking.parcelDetails.weight, name: 'Weight' },
    ];

    const emptyFields = requiredFields.filter(({ field }) => isFieldEmpty(field));
    
    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(({ name }) => name).join(', ');
      Alert.alert(
        'Required Fields Missing', 
        `Please fill in the following required fields:\n\n• ${emptyFields.map(({ name }) => name).join('\n• ')}`
      );
      return;
    }

    const distanceInfo = booking.pickupCoordinates && booking.destinationCoordinates
      ? `\nDistance: ${calculateDistance(booking.pickupCoordinates, booking.destinationCoordinates).toFixed(1)} km`
      : '';

    // In a real app, you would send this to your backend
    Alert.alert(
      'Booking Confirmed!',
      `Hi ${user.name}!\n\nYour parcel delivery has been booked.\n\nFrom: ${booking.pickupLocation}\nTo: ${booking.destination}${distanceInfo}\nWeight: ${booking.parcelDetails.weight}kg\nEstimated Cost: $${calculateEstimatedCost()}\n\nConfirmation will be sent to: ${user.email}`,
      [{ text: 'OK', onPress: () => {
        // Reset form and validation state
        setShowValidation(false);
        setBooking({
          pickupLocation: '',
          destination: '',
          parcelDetails: {
            weight: '',
            dimensions: { length: '', width: '', height: '' },
            description: '',
            value: '',
          },
          deliveryType: 'standard',
        });
        router.back();
      }}]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>← Back to Home</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.userHeader}>
          <ThemedText type="title" style={styles.title}>Book Parcel Delivery</ThemedText>
          <ThemedText style={styles.userWelcome}>Booking for: {user.name}</ThemedText>
        </ThemedView>

        {/* Location Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Locations</ThemedText>
          
          <LocationPicker
            title="Pickup"
            onLocationSelect={handlePickupLocationSelect}
            initialAddress={booking.pickupLocation}
            showError={showValidation && isFieldEmpty(booking.pickupLocation)}
          />

          <LocationPicker
            title="Destination"
            onLocationSelect={handleDestinationSelect}
            initialAddress={booking.destination}
            showError={showValidation && isFieldEmpty(booking.destination)}
          />
        </ThemedView>

        {/* Parcel Details Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Parcel Details</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={getLabelStyle(booking.parcelDetails.weight, true)}>Weight (kg) *</ThemedText>
            <TextInput
              style={getFieldStyle(booking.parcelDetails.weight, true)}
              value={booking.parcelDetails.weight}
              onChangeText={(text) => updateParcelDetails('weight', text)}
              placeholder="0.0"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            {showValidation && isFieldEmpty(booking.parcelDetails.weight) && (
              <ThemedText style={styles.errorText}>This field is required</ThemedText>
            )}
          </ThemedView>

          <ThemedText style={styles.label}>Dimensions (cm)</ThemedText>
          <ThemedView style={styles.dimensionsRow}>
            <TextInput
              style={[styles.input, styles.dimensionInput]}
              value={booking.parcelDetails.dimensions.length}
              onChangeText={(text) => updateDimensions('length', text)}
              placeholder="Length"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, styles.dimensionInput]}
              value={booking.parcelDetails.dimensions.width}
              onChangeText={(text) => updateDimensions('width', text)}
              placeholder="Width"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, styles.dimensionInput]}
              value={booking.parcelDetails.dimensions.height}
              onChangeText={(text) => updateDimensions('height', text)}
              placeholder="Height"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={booking.parcelDetails.description}
              onChangeText={(text) => updateParcelDetails('description', text)}
              placeholder="Describe your parcel contents"
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Declared Value ($)</ThemedText>
            <TextInput
              style={styles.input}
              value={booking.parcelDetails.value}
              onChangeText={(text) => updateParcelDetails('value', text)}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </ThemedView>
        </ThemedView>

        {/* Delivery Type Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Delivery Type</ThemedText>
          
          <ThemedView style={styles.deliveryOptions}>
            {[
              { key: 'standard', label: 'Standard (3-5 days)', price: '+$10' },
              { key: 'express', label: 'Express (1-2 days)', price: '+$15' },
              { key: 'overnight', label: 'Overnight', price: '+$25' },
            ].map((option) => (
              <ThemedView key={option.key} style={styles.deliveryOption}>
                <Button
                  title={`${option.label} ${option.price}`}
                  onPress={() => updateBooking('deliveryType', option.key)}
                  color={booking.deliveryType === option.key ? '#007AFF' : '#999'}
                />
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Cost Estimate */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.costEstimate}>
            <ThemedText type="subtitle" style={styles.costText}>Estimated Cost: ${calculateEstimatedCost()}</ThemedText>
            {booking.pickupCoordinates && booking.destinationCoordinates && (
              <ThemedText style={styles.distanceText}>
                Distance: {calculateDistance(booking.pickupCoordinates, booking.destinationCoordinates).toFixed(1)} km
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        {/* Book Button */}
        <ThemedView style={styles.bookingButtonContainer}>
          <Button
            title="Book Delivery"
            onPress={handleBooking}
            color="#007AFF"
          />
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  userHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 5,
  },
  userWelcome: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  labelError: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Platform.OS === 'web' ? '#fff' : 'transparent',
    color: '#000',
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Platform.OS === 'web' ? '#fff' : 'transparent',
    color: '#000',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dimensionInput: {
    flex: 1,
  },
  deliveryOptions: {
    gap: 10,
  },
  deliveryOption: {
    marginBottom: 5,
  },
  costEstimate: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  costText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  distanceText: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  bookingButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});
