import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, ImageBackground, Dimensions, TouchableOpacity, ScrollView, Modal, Platform, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Animated } from 'react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Collapsible } from '@/components/Collapsible';
import { Colors } from '@/constants/Colors';

const WIDTH = Dimensions.get('window').width;

export default function HomeScreen() {
  const router = useRouter();
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Date states
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  
  // Animation values
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleBorderRadius = useRef(new Animated.Value(150)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Date picker handlers
  const onCheckInChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || checkInDate;
    setShowCheckInPicker(Platform.OS === 'ios');
    setCheckInDate(currentDate);
    
    // If check-out date is before check-in date, update it
    if (checkOutDate < currentDate) {
      setCheckOutDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)); // day after check-in
    }
  };
  
  const onCheckOutChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || checkOutDate;
    setShowCheckOutPicker(Platform.OS === 'ios');
    setCheckOutDate(currentDate);
  };
  
  // Format date as DD.MM.YYYY
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  // Navigate to search with params
  const handleSearch = () => {
    router.push({
      pathname: '/kesfet',
      params: { 
        searchQuery: searchText,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString()
      }
    });
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#4A6DA7', '#6a41bd']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View>                <Text style={styles.welcomeText}>Hello 👋</Text>
                <Text style={styles.headerTitle}>Where Would You Like to Go?</Text>
              </View>
              <View style={styles.headerButtonsContainer}>
                <TouchableOpacity 
                  style={styles.adminButton}
                  onPress={() => router.push('/admin')}>
                  <Ionicons name="settings-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileButton}>
                  <Ionicons name="person-circle-outline" size={36} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={24} color="#4A6DA7" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hotels, cities or regions"
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          
          <View style={styles.datePickerContainer}>
            <TouchableOpacity 
              style={styles.datePickerButton}
              activeOpacity={0.7}
              onPress={() => setShowCheckInPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4A6DA7" style={styles.dateIcon} />
              <View style={styles.dateTextContainer}>
                <Text style={styles.datePickerLabel}>Check-in Date</Text>
                <Text style={styles.datePickerValue}>{formatDate(checkInDate)}</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.datePickerSeparator} />
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              activeOpacity={0.7}
              onPress={() => setShowCheckOutPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4A6DA7" style={styles.dateIcon} />
              <View style={styles.dateTextContainer}>
                <Text style={styles.datePickerLabel}>Check-out Date</Text>
                <Text style={styles.datePickerValue}>{formatDate(checkOutDate)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Otel Ara Butonu */}
          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.8}
            onPress={() => {
              if (checkInDate && checkOutDate) {
                router.push({
                  pathname: '/kesfet',
                  params: { 
                    searchQuery: searchText,
                    checkInDate: checkInDate.toISOString(),
                    checkOutDate: checkOutDate.toISOString()
                  }
                });
              } else {
                Alert.alert('Warning', 'Please select check-in and check-out dates.');
              }
            }}
          >
            <Text style={styles.searchButtonText}>Search Hotels</Text>
            <Ionicons name="search" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Date pickers */}
        {showCheckInPicker && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showCheckInPicker}
            onRequestClose={() => setShowCheckInPicker(false)}
          >
            <TouchableOpacity 
              style={styles.datePickerModalOverlay}
              activeOpacity={1}
              onPress={() => setShowCheckInPicker(false)}
            >
              <View style={styles.datePickerModalContent}>
                <DateTimePicker
                  testID="checkInDatePicker"
                  value={checkInDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      onCheckInChange(event, selectedDate);
                      setShowCheckInPicker(false);
                    }
                  }}
                  minimumDate={new Date()}
                />                <TouchableOpacity 
                  style={styles.datePickerDoneButton}
                  onPress={() => setShowCheckInPicker(false)}
                >
                  <Text style={styles.datePickerDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
        
        {showCheckOutPicker && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showCheckOutPicker}
            onRequestClose={() => setShowCheckOutPicker(false)}
          >
            <TouchableOpacity 
              style={styles.datePickerModalOverlay}
              activeOpacity={1}
              onPress={() => setShowCheckOutPicker(false)}
            >
              <View style={styles.datePickerModalContent}>
                <DateTimePicker
                  testID="checkOutDatePicker"
                  value={checkOutDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      onCheckOutChange(event, selectedDate);
                      setShowCheckOutPicker(false);
                    }
                  }}
                  minimumDate={new Date(checkInDate.getTime() + 86400000)} // +1 day from check-in
                />                <TouchableOpacity 
                  style={styles.datePickerDoneButton}
                  onPress={() => setShowCheckOutPicker(false)}
                >
                  <Text style={styles.datePickerDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Simplified Section Below Hotel Search */}
        <View style={styles.mainContent}>
          {/* Combined Assistant Section */}
          <View style={styles.assistantCard}>
            <View style={styles.assistantHeader}>
              <View style={styles.assistantIconContainer}>
                <Ionicons name="sparkles" size={28} color="#6a41bd" />
              </View>              <View style={styles.assistantTitleContainer}>
                <Text style={styles.assistantTitle}>AI Assistant</Text>
                <Text style={styles.assistantSubtitle}>Personalized Hotel Recommendations</Text>
              </View>
            </View>            <Text style={styles.assistantDescription}>
              Our AI assistant provides personalized hotel recommendations. It helps you find the best hotels that match your budget, preferences, and requests.
            </Text>
            <TouchableOpacity 
              style={styles.assistantButton}
              onPress={() => router.push("/ai-assistant")}>
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconContainer}>
                  <Ionicons name="sparkles" size={24} color="#fff" />
                </View>
                <View style={styles.buttonTextContainer}>                  <Text style={styles.assistantButtonText}>Find Hotels with AI</Text>
                  <Text style={styles.assistantButtonSubtext}>Click for personalized hotel recommendations</Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>          {/* Popular Destinations - Simplified */}
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsScrollContent}>
            {[              { id: 1, name: 'Cappadocia', price: '1.899₺' },
              { id: 2, name: 'Istanbul', price: '2.199₺' },
              { id: 3, name: 'Antalya', price: '1.599₺' }
            ].map((destination) => (
              <TouchableOpacity 
                key={destination.id} 
                style={styles.destinationCard}
                onPress={() => router.push('/kesfet')}>
                <ImageBackground
                  source={{ uri: `https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=1920&auto=format&fit=crop` }}
                  style={styles.destinationImage}
                  imageStyle={styles.destinationImageStyle}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.destinationGradient}>
                    <Text style={styles.destinationName}>{destination.name}</Text>
                    <Text style={styles.destinationPrice}>From {destination.price} per night</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Keşfet Butonu - Simplified */}
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/kesfet')}>
            <Text style={styles.exploreButtonText}>Explore All Hotels</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Sesli Asistan Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showVoiceAssistant}
          onRequestClose={() => setShowVoiceAssistant(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Voice Assistant</ThemedText>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowVoiceAssistant(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
                <ThemedText style={styles.voiceAssistantText}>
                How can I help you?
              </ThemedText>
              
              <ThemedText style={styles.voiceAssistantSuggestion}>
                For example: "Find cave hotels in Cappadocia for 2 people", "Find rooms for next weekend"
              </ThemedText>
              
              <TouchableOpacity style={styles.voiceMicButton}>
                <Ionicons name="mic" size={36} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  profileButton: {
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  searchContainer: {
    marginBottom: 15,
    paddingHorizontal: 20,
    marginTop: -35,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateIcon: {
    marginRight: 8,
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  datePickerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  datePickerSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
  },
  searchButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 0,
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  assistantCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(106, 65, 189, 0.15)',
    shadowColor: '#6a41bd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  assistantIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(106, 65, 189, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assistantTitleContainer: {
    flex: 1,
  },
  assistantTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6a41bd',
    marginBottom: 2,
  },
  assistantSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  assistantDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    color: '#555',
  },
  assistantButton: {
    backgroundColor: '#6a41bd',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6a41bd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  assistantButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  assistantButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  destinationsScrollContent: {
    paddingBottom: 10,
  },
  destinationCard: {
    width: 240,
    height: 180,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  destinationImageStyle: {
    borderRadius: 16,
  },
  destinationGradient: {
    padding: 15,
    height: '50%',
    justifyContent: 'flex-end',
  },
  destinationName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  destinationPrice: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  exploreButton: {
    backgroundColor: '#4A6DA7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    shadowColor: '#4A6DA7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    height: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 5,
  },
  voiceAssistantText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  voiceAssistantSuggestion: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  voiceMicButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6a41bd',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  datePickerDoneButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginTop: 10,
  },
  datePickerDoneButtonText: {
    color: '#4A6DA7',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 