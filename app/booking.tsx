import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, TextInput, Platform, TouchableOpacity, View, Text } from 'react-native';
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
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>← Back</ThemedText>
          </TouchableOpacity>
          
          <ThemedView style={styles.headerContent}>
            <ThemedText type="title" style={styles.title}>Book Delivery</ThemedText>
            <ThemedText type="caption" style={styles.userWelcome}>
              Booking for: {user.name}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.content}>
          {/* Location Section */}
          <ThemedView type="card" style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>📍 Locations</ThemedText>
            
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
          <ThemedView type="card" style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>📦 Parcel Details</ThemedText>
            
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={getLabelStyle(booking.parcelDetails.weight, true)}>Weight (kg) *</ThemedText>
              <TextInput
                style={getFieldStyle(booking.parcelDetails.weight, true)}
                value={booking.parcelDetails.weight}
                onChangeText={(text) => updateParcelDetails('weight', text)}
                placeholder="0.0"
                keyboardType="numeric"
                placeholderTextColor="#8E8E93"
              />
              {showValidation && isFieldEmpty(booking.parcelDetails.weight) && (
                <ThemedText style={styles.errorText}>This field is required</ThemedText>
              )}
            </ThemedView>

            <ThemedText style={styles.label}>Dimensions (cm)</ThemedText>
            <ThemedView style={styles.dimensionsRow}>
              <ThemedView style={styles.dimensionGroup}>
                <ThemedText style={styles.dimensionLabel}>Length</ThemedText>
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  value={booking.parcelDetails.dimensions.length}
                  onChangeText={(text) => updateDimensions('length', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#8E8E93"
                />
              </ThemedView>
              
              <ThemedView style={styles.dimensionGroup}>
                <ThemedText style={styles.dimensionLabel}>Width</ThemedText>
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  value={booking.parcelDetails.dimensions.width}
                  onChangeText={(text) => updateDimensions('width', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#8E8E93"
                />
              </ThemedView>
              
              <ThemedView style={styles.dimensionGroup}>
                <ThemedText style={styles.dimensionLabel}>Height</ThemedText>
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  value={booking.parcelDetails.dimensions.height}
                  onChangeText={(text) => updateDimensions('height', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#8E8E93"
                />
              </ThemedView>
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
                placeholderTextColor="#8E8E93"
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
                placeholderTextColor="#8E8E93"
              />
            </ThemedView>
          </ThemedView>

          {/* Delivery Type Section */}
          <ThemedView type="card" style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>🚚 Delivery Options</ThemedText>
            
            <ThemedView style={styles.deliveryOptions}>
              {[
                { key: 'standard', label: 'Standard', sublabel: '3-5 days', price: '$10', color: '#34C759' },
                { key: 'express', label: 'Express', sublabel: '1-2 days', price: '$15', color: '#FF9500' },
                { key: 'overnight', label: 'Overnight', sublabel: 'Next day', price: '$25', color: '#FF3B30' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.deliveryOption,
                    booking.deliveryType === option.key && styles.deliveryOptionSelected
                  ]}
                  onPress={() => updateBooking('deliveryType', option.key)}
                >
                  <View style={[styles.deliveryIcon, { backgroundColor: option.color }]}>
                    <ThemedText style={styles.deliveryIconText}>🚚</ThemedText>
                  </View>
                  <View style={styles.deliveryContent}>
                    <ThemedText type="defaultSemiBold" style={styles.deliveryLabel}>
                      {option.label}
                    </ThemedText>
                    <ThemedText type="caption" style={styles.deliverySublabel}>
                      {option.sublabel}
                    </ThemedText>
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.deliveryPrice}>
                    {option.price}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>

          {/* Cost Estimate */}
          <View style={styles.costEstimate}>
            <View style={styles.costHeader}>
              <Text style={styles.costIcon}>💰</Text>
              <Text style={styles.costLabel}>Estimated Total</Text>
            </View>
            <Text style={styles.costAmount}>${calculateEstimatedCost()}</Text>
            {booking.pickupCoordinates && booking.destinationCoordinates && (
              <View style={styles.costDetails}>
                <Text style={styles.distanceText}>
                  📏 Distance: {calculateDistance(booking.pickupCoordinates, booking.destinationCoordinates).toFixed(1)} km
                </Text>
              </View>
            )}
            <Text style={styles.costNote}>
              * Final price may vary based on actual package dimensions and delivery requirements
            </Text>
          </View>

          {/* Book Button */}
          <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
            <ThemedText style={styles.bookButtonText}>📦 Confirm Booking</ThemedText>
          </TouchableOpacity>
        </ThemedView>
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
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
    color: '#1D1D1F',
  },
  userWelcome: {
    color: '#8E8E93',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#1D1D1F',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  labelError: {
    color: '#FF3B30',
  },
  input: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 3,
    backgroundColor: '#FFF5F5',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap', // Allows wrapping on very small screens
  },
  dimensionGroup: {
    flex: 1,
    minWidth: 100, // Increased to accommodate full text
    maxWidth: 150, // Increased maximum width
  },
  dimensionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  dimensionInput: {
    textAlign: 'center',
    minHeight: 44, // Ensures good touch target
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  deliveryOptions: {
    gap: 12,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  deliveryOptionSelected: {
    borderColor: '#007AFF',
    borderWidth: 3,
    backgroundColor: '#E3F2FD', // Light blue background when selected
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryIconText: {
    fontSize: 18,
  },
  deliveryContent: {
    flex: 1,
    backgroundColor: 'transparent', // Ensure no background color
  },
  deliveryLabel: {
    color: '#000000',
    marginBottom: 2,
    fontSize: 16,
    fontWeight: '700',
  },
  deliverySublabel: {
    color: '#555555', // Slightly lighter for better contrast on blue background
    fontSize: 14,
    fontWeight: '500',
  },
  deliveryPrice: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  costEstimate: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  costIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  costLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  costAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#34C759',
    textAlign: 'center',
    marginBottom: 8,
  },
  costDetails: {
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  costNote: {
    fontSize: 11,
    color: '#888888',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 14,
  },
  bookButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#000000',
  },
  bookButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
  },
});
