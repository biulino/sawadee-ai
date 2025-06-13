import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import apiService, { Hotel, Room, ReservationRequest } from './services/api';

export default function ReservationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hotelId = typeof params.hotelId === 'string' ? parseInt(params.hotelId) : 1;
  const { width } = Dimensions.get('window');

  // States for hotel data
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reservation states
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(new Date().setDate(new Date().getDate() + 2)));
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [extraServices, setExtraServices] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  
  // Guest info states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Reservation status
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch hotel and rooms data
  useEffect(() => {
    fetchHotelAndRooms();
  }, [hotelId]);
  
  const fetchHotelAndRooms = async () => {
    try {
      setLoading(true);
      const hotelData = await apiService.getHotelById(hotelId);
      setHotel(hotelData);
      
      const roomsData = await apiService.getRoomsByHotelId(hotelId);
      setRooms(roomsData);
      
      if (roomsData.length > 0) {
        setSelectedRoom(roomsData[0].id);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching hotel data:', err);
      setError('Otel bilgilerini yüklerken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy', { locale: tr });
  };
  
  const formatApiDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };
  
  const toggleExtraService = (service: string) => {
    if (extraServices.includes(service)) {
      setExtraServices(extraServices.filter(s => s !== service));
    } else {
      setExtraServices([...extraServices, service]);
    }
  };
  
  const calculateNights = () => {
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const getSelectedRoomData = () => {
    return rooms.find(room => room.id === selectedRoom);
  };
  
  const calculateTotalPrice = () => {
    const selectedRoomData = getSelectedRoomData();
    const roomPrice = selectedRoomData?.pricePerNight || (hotel?.pricePerNight || 0);
    return roomPrice * calculateNights() + (extraServices.length * 250);
  };
  
  const handleReservation = async () => {    if (!fullName || !email || !phone) {
      Alert.alert('Warning', 'Please fill in all required fields.');
      return;
    }
    
    if (!selectedRoom) {
      Alert.alert('Warning', 'Please select a room.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const reservationData: ReservationRequest = {
        fullName,
        email,
        phone,
        numberOfGuests: guestCount,
        specialRequests,
        checkInDate: formatApiDate(checkInDate),
        checkOutDate: formatApiDate(checkOutDate),
        numberOfRooms: 1,
        hotelId,
        roomId: selectedRoom,
        paymentMethod: 'CREDIT_CARD'
      };
        console.log('Sent data:', JSON.stringify(reservationData, null, 2));
      
      await apiService.createReservation(reservationData);
      
      Alert.alert(
        'Success',
        'Your reservation has been created successfully!',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (err: any) {
      console.error('Reservation error:', err);
        let errorMessage = 'An error occurred while creating the reservation.';
      if (err.response && err.response.data) {
        console.log('API error response:', JSON.stringify(err.response.data, null, 2));
        errorMessage += '\n\nError details: ' + JSON.stringify(err.response.data);
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If loading, show loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6DA7" />
        <ThemedText style={styles.loadingText}>Loading hotel information...</ThemedText>
      </View>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchHotelAndRooms}
        >
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }
  
  // If no hotel data
  if (!hotel) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Hotel not found</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Reservation</ThemedText>
        </View>
        
        {/* Hotel Info */}
        <View style={styles.hotelInfoContainer}>
          <Image 
            source={{ 
              uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80' 
            }} 
            style={styles.hotelImage} 
          />
          <View style={styles.hotelOverlay}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <ThemedText style={styles.ratingText}>4.8</ThemedText>
            </View>
          </View>
          <View style={styles.hotelDetails}>
            <ThemedText style={styles.hotelName}>{hotel.name}</ThemedText>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <ThemedText style={styles.locationText}>{hotel.city}</ThemedText>
            </View>
            <ThemedText style={styles.hotelDescription}>{hotel.description || "Our luxury cave hotel in the heart of Cappadocia offers a unique accommodation experience, blending historical and natural texture with modern comfort."}</ThemedText>
          </View>
        </View>
          {/* AI Suggestion */}
        {aiSuggestions && (
          <View style={styles.aiSuggestionContainer}>
            <View style={styles.aiSuggestionHeader}>
              <Ionicons name="bulb-outline" size={22} color="#6a41bd" />
              <ThemedText style={styles.aiSuggestionTitle}>AI Recommendation</ThemedText>
              <TouchableOpacity onPress={() => setAiSuggestions(false)}>
                <Ionicons name="close-circle" size={22} color="#6a41bd" />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.aiSuggestionText}>
              For the best experience based on your preferences, we recommend selecting {rooms.length > 0 ? <ThemedText style={{fontWeight: 'bold'}}>{rooms[0].name || 'Standard Room'}</ThemedText> : null}. Balloon tours and Turkish bath services are very popular this season.
            </ThemedText>
          </View>
        )}
          {/* Date Selection */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Reservation Date</ThemedText>
          <View style={styles.datePickerRow}>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowCheckInPicker(!showCheckInPicker)}>
              <Ionicons name="calendar-outline" size={20} color="#4a6da7" />
              <View>
                <ThemedText style={styles.datePickerLabel}>Check-in Date</ThemedText>
                <ThemedText style={styles.datePickerValue}>{formatDate(checkInDate)}</ThemedText>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowCheckOutPicker(!showCheckOutPicker)}>
              <Ionicons name="calendar-outline" size={20} color="#4a6da7" />
              <View>
                <ThemedText style={styles.datePickerLabel}>Check-out Date</ThemedText>
                <ThemedText style={styles.datePickerValue}>{formatDate(checkOutDate)}</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          
          {Platform.OS === 'ios' ? (
            <>
              {showCheckInPicker && (
                <DateTimePicker
                  value={checkInDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    const currentDate = selectedDate || checkInDate;
                    setShowCheckInPicker(false);
                    setCheckInDate(currentDate);
                    
                    // Çıkış tarihi giriş tarihinden önce ise ayarla
                    if (currentDate > checkOutDate) {
                      const newCheckOutDate = new Date(currentDate);
                      newCheckOutDate.setDate(currentDate.getDate() + 1);
                      setCheckOutDate(newCheckOutDate);
                    }
                  }}
                />
              )}
              {showCheckOutPicker && (
                <DateTimePicker
                  value={checkOutDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date(checkInDate.getTime() + 86400000)} // Giriş tarihinden en az 1 gün sonra
                  onChange={(event, selectedDate) => {
                    setShowCheckOutPicker(false);
                    if (selectedDate) setCheckOutDate(selectedDate);
                  }}
                />
              )}
            </>
          ) : (
            <>
              {showCheckInPicker && (
                <DateTimePicker
                  value={checkInDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowCheckInPicker(false);
                    if (selectedDate) {
                      setCheckInDate(selectedDate);
                      
                      // Çıkış tarihi giriş tarihinden önce ise ayarla
                      if (selectedDate > checkOutDate) {
                        const newCheckOutDate = new Date(selectedDate);
                        newCheckOutDate.setDate(selectedDate.getDate() + 1);
                        setCheckOutDate(newCheckOutDate);
                      }
                    }
                  }}
                />
              )}
              {showCheckOutPicker && (
                <DateTimePicker
                  value={checkOutDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date(checkInDate.getTime() + 86400000)} // Giriş tarihinden en az 1 gün sonra
                  onChange={(event, selectedDate) => {
                    setShowCheckOutPicker(false);
                    if (selectedDate) setCheckOutDate(selectedDate);
                  }}
                />
              )}
            </>
          )}
        </View>
        
        {/* Oda Seçimi */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Oda Seçimi</ThemedText>
            <View style={styles.roomIndicatorContainer}>
              <Ionicons name="swap-horizontal" size={16} color="#4a6da7" />
              <ThemedText style={styles.swipeIndicatorText}>Kaydırın</ThemedText>
            </View>
          </View>
          
          <View style={styles.roomCarouselContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomSelectionContainer}
              snapToInterval={Dimensions.get('window').width - 100} // Otomatik hizalanma için
              decelerationRate="fast"
              pagingEnabled={false}>
              
              {rooms.map((room, index) => (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.roomCard,
                    selectedRoom === room.id && styles.roomCardSelected
                  ]}
                  onPress={() => setSelectedRoom(room.id)}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F2ZSUyMGhvdGVsfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80' }}
                    style={styles.roomImage}
                  />
                  <View style={styles.roomInfo}>
                    <ThemedText style={styles.roomName}>{room.name || `Oda ${room.roomNumber}`}</ThemedText>
                    <ThemedText style={styles.roomDetails}>{room.capacity || 2} Kişilik</ThemedText>
                    <View style={styles.roomPriceContainer}>
                      <ThemedText style={styles.roomPrice}>{room.pricePerNight || hotel.pricePerNight}₺</ThemedText>
                      <ThemedText style={styles.roomPriceUnit}>/ gece</ThemedText>
                    </View>
                  </View>
                  {selectedRoom === room.id && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Oda sayısı göstergesi */}
          {rooms.length > 1 && (
            <View style={styles.roomPaginationContainer}>
              {rooms.map((room, index) => (
                <View 
                  key={`dot-${room.id}`} 
                  style={[
                    styles.paginationDot,
                    selectedRoom === room.id && styles.paginationDotActive
                  ]} 
                />
              ))}
            </View>
          )}
        </View>
        
        {/* Misafir Bilgileri */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Misafir Bilgileri</ThemedText>
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Adınız Soyadınız *</ThemedText>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Adınız ve soyadınız"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>E-posta Adresiniz *</ThemedText>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-posta adresiniz"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Telefon Numaranız *</ThemedText>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="5xx xxx xx xx"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Özel İstekleriniz</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={specialRequests}
                onChangeText={setSpecialRequests}
                placeholder="Oda özellikleri, yemek tercihleri, vb."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
        
        {/* Ödeme Özeti */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Ödeme Özeti</ThemedText>
          <View style={styles.paymentSummaryContainer}>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Oda Ücreti ({calculateNights()} Gece)</ThemedText>
              <ThemedText style={styles.paymentValue}>{(hotel.pricePerNight * calculateNights()).toFixed(2)}₺</ThemedText>
            </View>
            {extraServices.length > 0 && (
              <View style={styles.paymentRow}>
                <ThemedText style={styles.paymentLabel}>Ekstra Hizmetler</ThemedText>
                <ThemedText style={styles.paymentValue}>{(extraServices.length * 250).toFixed(2)}₺</ThemedText>
              </View>
            )}
            <View style={styles.totalRow}>
              <ThemedText style={styles.totalLabel}>Toplam</ThemedText>
              <ThemedText style={styles.totalValue}>{calculateTotalPrice().toFixed(2)}₺</ThemedText>
            </View>
          </View>
        </View>
        
        {/* Rezervasyon Butonu */}
        <TouchableOpacity 
          style={styles.reservationButton}
          onPress={handleReservation}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <ThemedText style={styles.reservationButtonText}>Rezervasyon Yap</ThemedText>
          )}
        </TouchableOpacity>
        
        {/* Add extra padding at the bottom for iOS */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  hotelInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  hotelImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  hotelOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  hotelDetails: {
    padding: 15,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  hotelDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  aiSuggestionContainer: {
    backgroundColor: 'rgba(106, 65, 189, 0.1)',
    borderRadius: 8,
    padding: 15,
    margin: 15,
    marginTop: 0,
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  aiSuggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6a41bd',
    flex: 1,
    marginLeft: 5,
  },
  aiSuggestionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    padding: 12,
    width: '48%',
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  datePickerValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  roomIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeIndicatorText: {
    fontSize: 12,
    color: '#4a6da7',
    marginLeft: 4,
  },
  roomCarouselContainer: {
    position: 'relative',
  },
  roomSelectionContainer: {
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 30, // Sağda daha fazla boşluk bırakarak daha fazla oda olduğunu gösterelim
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
    marginRight: 15,
    width: Dimensions.get('window').width - 60, // Ekran genişliğinden biraz küçük
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  roomCardSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#f0fff0',
  },
  roomImage: {
    width: 100,
    height: 100,
  },
  roomInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomDetails: {
    fontSize: 14,
    color: '#666',
  },
  roomPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a6da7',
  },
  roomPriceUnit: {
    fontSize: 12,
    color: '#666',
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  formContainer: {
    marginTop: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    padding: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  paymentSummaryContainer: {
    marginTop: 15,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#444',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6DA7',
  },
  reservationButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 15 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reservationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A6DA7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4A6DA7',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  roomPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4CAF50',
    width: 12,
    height: 8,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 10 : 0,
  },
}); 