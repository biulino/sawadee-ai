import React from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, ImageBackground, TextInput, ScrollView, SafeAreaView, Platform, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Colors } from '@/constants/Colors';
import apiService, { Hotel } from './services/api';

// Get screen dimensions
const screenWidth = Dimensions.get('window').width;

// Extended hotel interface with UI-specific properties
interface ExtendedHotel extends Hotel {
  type?: string;
  rating?: number;
  features?: string[];
}

// Recommendation interface
interface Recommendation {
  hotel_id: number;
  hotel_name: string;
  room_id: number;
  room_name: string;
  room_type: string;
  price: number;
  price_per_night?: number;
  capacity: number;
  city: string;
  address: string;
  location?: string;
  predicted_rating: number;
  rating?: number;
  image_url?: string;
  recommendation_reason?: string;
  base_score: number;
  recommendation_type: string;
  amenities: {
    wifi: boolean;
    minibar: boolean;
    tv: boolean;
    balcony: boolean;
  } | string[];
  detailed_explanation: {
    explanation: string;
    best_matching_room: string;
    hotel_name: string;
    predicted_score: number;
    room_matches: Array<{
      matches: string[];
      mismatches: string[];
    }>;
  };
}

interface RecommendationResponse {
  ai_powered: boolean;
  recommendations: Recommendation[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface PriceRange {
  id: string;
  label: string;
  range: string;
  min: number;
  max: number;
}

type SortOption = 'none' | 'price-asc' | 'price-desc' | 'rating-desc';

const cities = [
  { id: '1', name: 'Urgup' },
  { id: '2', name: 'Goreme' },
  { id: '3', name: 'Nevsehir' },
  { id: '4', name: 'Avanos' },
  { id: '5', name: 'Uchisar' },
];

const amenities = [
  { id: '1', name: 'Free Wi-Fi' },
  { id: '2', name: 'Pool' },
  { id: '3', name: 'Spa' },
  { id: '4', name: 'Restaurant' },
  { id: '5', name: 'Bar' },
  { id: '6', name: 'Jacuzzi' },
  { id: '7', name: 'Fitness Center' },
];

const personCounts = [
  { id: '1', count: '1 Person' },
  { id: '2', count: '2 People' },
  { id: '3', count: '3 People' },
  { id: '4', count: '4 People' },
  { id: '5', count: '5+ People' },
];

const categories: Category[] = [
  { id: '1', name: 'Cave Hotels', icon: 'business-outline' },
  { id: '2', name: 'Balloon View', icon: 'partly-sunny-outline' },
  { id: '3', name: 'Thermal', icon: 'water-outline' },
  { id: '4', name: 'Nature', icon: 'leaf-outline' },
  { id: '5', name: 'Historic', icon: 'time-outline' },
  { id: '6', name: 'Luxury', icon: 'star-outline' },
];

const priceRanges: PriceRange[] = [
  { id: '1', label: 'Budget', range: '₺', min: 0, max: 1500 },
  { id: '2', label: 'Mid-range', range: '₺₺', min: 1500, max: 2500 },
  { id: '3', label: 'Premium', range: '₺₺₺', min: 2500, max: 5000 },
  { id: '4', label: 'Luxury', range: '₺₺₺₺', min: 5000, max: 100000 },
];

export default function KesfetScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [ratings, setRatings] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPersonCount, setSelectedPersonCount] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('none');
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  // States for API data - using ExtendedHotel
  const [hotels, setHotels] = useState<ExtendedHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for recommended hotels
  const [recommendedHotelIds, setRecommendedHotelIds] = useState<number[]>([]);
    // State for AI recommendation loading
  const [aiLoading, setAiLoading] = useState(false);
  
  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);
  
  // Function to fetch hotels from API
  const fetchHotels = async () => {
    try {
      setLoading(true);
      setAiLoading(true); // AI yüklemesini de başlat
      
      const data = await apiService.getHotelsByCity('Nevşehir');
        // Adding UI specific properties first
      const extendedData = data.map(hotel => ({
        ...hotel,
        type: 'Hotel',
        rating: 4.7,
        features: ['Free Wi-Fi', 'Parking', 'AC']
      }));
      
      setHotels(extendedData);
      setError(null);
      
      // Simulate AI recommendation loading after hotels are set
      setTimeout(() => {
        try {          // Randomly mark 2-4 hotels as "recommended"
          const totalHotels = data.length;
          const numberOfRecommendations = Math.min(Math.floor(Math.random() * 3) + 2, totalHotels);
          
          // Otellerin ID'lerini karıştır ve bir kısmını önerilen olarak seç
          const shuffledIds = [...data.map(hotel => hotel.id)].sort(() => 0.5 - Math.random());
          const selectedIds = shuffledIds.slice(0, numberOfRecommendations);
          setRecommendedHotelIds(selectedIds);        } catch (aiError) {
          console.error('AI recommendation selection error:', aiError);
          // Even if there's an error, finish loading
        } finally {
          setAiLoading(false);
          setLoading(false); // Ana yüklemeyi AI simülasyonu bittikten sonra bitir
        }
      }, 1500); // AI işlemi için 1.5 saniye beklet
      
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('An error occurred while loading hotels. Please try again.');
      setLoading(false); // Hata durumunda da yüklemeyi bitir
      setAiLoading(false);
    }
  };
  
  // Function to get active filter summary text
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedPriceRange) count++;
    if (ratings) count++;
    count += selectedCities.length;
    count += selectedAmenities.length;
    if (selectedPersonCount) count++;
    return count;
  };
    // Get text summary of active filters to display
  const getActiveFiltersText = () => {
    const activeFilters: string[] = [];
    
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.id === selectedPriceRange);
      if (range) activeFilters.push(range.label);
    }
    
    if (ratings) {
      activeFilters.push(`${ratings}+ Puan`);
    }
    
    selectedCities.forEach(cityId => {
      const city = cities.find(c => c.id === cityId);
      if (city) activeFilters.push(city.name);
    });
    
    selectedAmenities.forEach(amenityId => {
      const amenity = amenities.find(a => a.id === amenityId);
      if (amenity) activeFilters.push(amenity.name);
    });
    
    if (selectedPersonCount) {
      const person = personCounts.find(p => p.id === selectedPersonCount);
      if (person) activeFilters.push(person.count);
    }
    
    return activeFilters;
  };
  
  // The sorted hotels function now uses our API data
  const getSortedHotels = (hotelsData: ExtendedHotel[]) => {
    // Önce önerilen otelleri en başa al
    let sortedList = [...hotelsData].sort((a, b) => {
      const aIsRecommended = recommendedHotelIds.includes(a.id);
      const bIsRecommended = recommendedHotelIds.includes(b.id);
      
      if (aIsRecommended && !bIsRecommended) return -1;
      if (!aIsRecommended && bIsRecommended) return 1;
      
      // İkisi de önerilen veya önerilmeyen ise normal sıralama yap
      return a.id - b.id;
    });
    
    // Eğer kullanıcı başka bir sıralama seçtiyse, o sıralamayı uygula
    // ama önerilen oteller yine en başta kalmalı
    if (sortOption !== 'none') {
      // Önerilen ve önerilmeyen otelleri ayır
      const recommended = sortedList.filter(hotel => recommendedHotelIds.includes(hotel.id));
      const others = sortedList.filter(hotel => !recommendedHotelIds.includes(hotel.id));
      
      // Önerilmeyen otelleri seçilen kritere göre sırala
      others.sort((a, b) => {
        if (sortOption === 'price-asc') {
          return a.pricePerNight - b.pricePerNight;
        } else if (sortOption === 'price-desc') {
          return b.pricePerNight - a.pricePerNight;
        } else if (sortOption === 'rating-desc' && a.rating && b.rating) {
          return b.rating - a.rating;
        }
        return 0;
      });
      
      // Önerilen otelleri de kendi içlerinde sırala
      recommended.sort((a, b) => {
        if (sortOption === 'price-asc') {
          return a.pricePerNight - b.pricePerNight;
        } else if (sortOption === 'price-desc') {
          return b.pricePerNight - a.pricePerNight;
        } else if (sortOption === 'rating-desc' && a.rating && b.rating) {
          return b.rating - a.rating;
        }
        return 0;
      });
      
      // Önce önerilen sonra diğer oteller
      sortedList = [...recommended, ...others];
    }
    
    return sortedList;
  };
  
  // Get text representation of sort option
  const getSortOptionText = () => {
    switch (sortOption) {      case 'price-asc':
        return 'Lowest Price';
      case 'price-desc':
        return 'Highest Price';
      case 'rating-desc':
        return 'Highest Rating';
      default:
        return 'Sort';
    }
  };
  
  // Cycle through sort options
  const toggleSortOption = () => {
    if (sortOption === 'none') {
      setSortOption('price-asc');
    } else if (sortOption === 'price-asc') {
      setSortOption('price-desc');
    } else if (sortOption === 'price-desc') {
      setSortOption('rating-desc');
    } else {
      setSortOption('none');
    }
    setShowSortOptions(false);
  };
    // Filter hotels based on selected criteria
  const filteredHotels = hotels.filter(hotel => {
    // İsim veya lokasyon araması
    const matchesSearch = searchQuery === '' || 
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hotel.type && hotel.type.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Kategorilere göre filtreleme
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.some(categoryId => {
        const category = categories.find(c => c.id === categoryId);
        return category ? (hotel.type && hotel.type.includes(category.name)) : false;
      });
    
    // Fiyat aralığı filtresi
    const matchesPrice = !selectedPriceRange || 
      (parseFloat(hotel.pricePerNight.toString()) >= priceRanges[parseInt(selectedPriceRange)-1].min && 
        parseFloat(hotel.pricePerNight.toString()) <= priceRanges[parseInt(selectedPriceRange)-1].max);
    
    // Değerlendirme filtresi
    const matchesRating = !ratings || (hotel.rating && hotel.rating >= ratings);
    
    // Şehir filtresi
    const matchesCity = selectedCities.length === 0 || 
      selectedCities.some(cityId => {
        const city = cities.find(c => c.id === cityId);
        return city ? hotel.city.includes(city.name) : false;
      });
    
    // Özellik filtresi (örnek: wifi, havuz, vb.)
    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every(amenityId => {
        const amenity = amenities.find(a => a.id === amenityId);
        return amenity ? (hotel.features && hotel.features.includes(amenity.name)) : false;
      });
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesCity && matchesAmenities;
  });
  
  // Apply sorting after filtering
  const sortedAndFilteredHotels = getSortedHotels(filteredHotels);
  
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  
  const toggleCity = (cityId: string) => {
    if (selectedCities.includes(cityId)) {
      setSelectedCities(selectedCities.filter(id => id !== cityId));
    } else {
      setSelectedCities([...selectedCities, cityId]);
    }
  };
  
  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      setSelectedAmenities(selectedAmenities.filter(id => id !== amenityId));
    } else {
      setSelectedAmenities([...selectedAmenities, amenityId]);
    }
  };
  
  const navToHotelDetail = (hotelId: number) => {
    router.push({
      pathname: '/rezervasyon',
      params: { 
        hotelId: hotelId 
      }
    });
  };
  
  // Hotel card renderer
  const renderHotelCard = ({ item }: { item: ExtendedHotel }) => {
    // Otel önerilen oteller arasında mı kontrol et
    const isRecommended = recommendedHotelIds.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.hotelCard, isRecommended && styles.recommendedHotelCard]}
        activeOpacity={0.9}
        onPress={() => navToHotelDetail(item.id)}
      >
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Ionicons name="sparkles" size={14} color="#fff" />
            <ThemedText style={styles.recommendedText}>AI Recommendation</ThemedText>
          </View>
        )}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80' }}
          style={styles.hotelImage}
          imageStyle={[styles.hotelImageStyle, isRecommended && styles.recommendedHotelImage]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          >
            <View style={styles.hotelImageContent}>
              <View style={styles.priceTag}>
                <ThemedText style={styles.priceText}>{item.pricePerNight}₺</ThemedText>
                <ThemedText style={styles.priceNightText}>/ night</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
        
        <View style={styles.hotelCardContent}>
          <View style={styles.hotelCardHeader}>
            <ThemedText style={styles.hotelName}>{item.name}</ThemedText>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.ratingText}>{item.rating || 4.7}</ThemedText>
            </View>
          </View>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <ThemedText style={styles.locationText}>{item.city}</ThemedText>
          </View>
          
          <View style={styles.amenitiesRow}>
            {item.availableRooms && (
              <View style={styles.amenityTag}>
                <Ionicons name="bed-outline" size={14} color="#4A6DA7" />
                <ThemedText style={styles.amenityText}>{item.availableRooms} Rooms</ThemedText>
              </View>
            )}
            <View style={styles.amenityTag}>
              <Ionicons name="wifi-outline" size={14} color="#4A6DA7" />
              <ThemedText style={styles.amenityText}>WiFi</ThemedText>
            </View>
            {isRecommended && (
              <View style={[styles.amenityTag, styles.recommendedAmenityTag]}>
                <Ionicons name="sparkles" size={14} color="#fff" />
                <ThemedText style={styles.recommendedAmenityText}>AI Recommendation</ThemedText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Fixed header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#4A6DA7', '#6a41bd']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <ThemedText style={styles.headerTitle}>Discover Hotels</ThemedText>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
      
      {/* Main content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Arama ve Filtre */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hotels, locations or amenities"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        
        {/* AI Önerileri Yükleniyor Göstergesi */}
        {aiLoading && (
          <View style={styles.aiLoadingContainer}>
            <View style={styles.aiLoadingContent}>
              <Ionicons name="sparkles" size={24} color="#6a41bd" />
              <ThemedText style={styles.aiLoadingText}>Preparing AI Recommendations...</ThemedText>
              <ActivityIndicator size="small" color="#6a41bd" style={styles.aiLoadingSpinner} />
            </View>
          </View>
        )}
        
        {/* Filtreleme Butonu */}
        <View style={styles.filterTabContainer}>
          <TouchableOpacity 
            style={[styles.filterTab, showFilters && styles.activeFilterTab]}
            onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="funnel-outline" size={18} color={showFilters ? "#fff" : "#4a6da7"} />
            <ThemedText style={[styles.filterTabText, showFilters && styles.activeFilterTabText]}>
              Filter {getActiveFilterCount() > 0 ? `(${getActiveFilterCount()})` : ''}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterTab, sortOption !== 'none' && styles.activeFilterTab]}
            onPress={() => setShowSortOptions(!showSortOptions)}>
            <Ionicons name="swap-vertical-outline" size={18} color={sortOption !== 'none' ? "#fff" : "#4a6da7"} />
            <ThemedText style={[styles.filterTabText, sortOption !== 'none' && styles.activeFilterTabText]}>
              {getSortOptionText() === 'Sort' ? 'Sort' : '✓ ' + getSortOptionText()}
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Sort Options Popup */}
        {showSortOptions && (
          <View style={styles.sortOptionsContainer}>
            <TouchableOpacity
              style={[styles.sortOptionItem, sortOption === 'price-asc' && styles.activeSortOption]}
              onPress={() => {
                setSortOption('price-asc');
                setShowSortOptions(false);
              }}>
              <Ionicons 
                name="arrow-up" 
                size={16} 
                color={sortOption === 'price-asc' ? "#fff" : "#4a6da7"} />
              <ThemedText style={[styles.sortOptionText, sortOption === 'price-asc' && styles.activeSortOptionText]}>
                Lowest Price First
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.sortOptionItem, sortOption === 'price-desc' && styles.activeSortOption]}
              onPress={() => {
                setSortOption('price-desc');
                setShowSortOptions(false);
              }}>
              <Ionicons 
                name="arrow-down" 
                size={16} 
                color={sortOption === 'price-desc' ? "#fff" : "#4a6da7"} />
              <ThemedText style={[styles.sortOptionText, sortOption === 'price-desc' && styles.activeSortOptionText]}>
                Highest Price First
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.sortOptionItem, sortOption === 'rating-desc' && styles.activeSortOption]}
              onPress={() => {
                setSortOption('rating-desc');
                setShowSortOptions(false);
              }}>
              <Ionicons 
                name="star" 
                size={16} 
                color={sortOption === 'rating-desc' ? "#fff" : "#4a6da7"} />
              <ThemedText style={[styles.sortOptionText, sortOption === 'rating-desc' && styles.activeSortOptionText]}>
                Highest Rated First
              </ThemedText>
            </TouchableOpacity>
            
            {sortOption !== 'none' && (
              <TouchableOpacity
                style={styles.clearSortButton}
                onPress={() => {
                  setSortOption('none');
                  setShowSortOptions(false);
                }}>
                <Ionicons name="close-circle-outline" size={16} color="#666" />
                <ThemedText style={styles.clearSortText}>Clear Sort</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Aktif Filtreler */}
        {getActiveFilterCount() > 0 && !showFilters && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.activeFiltersScrollView}
            contentContainerStyle={styles.activeFiltersContainer}>
            {getActiveFiltersText().map((filter, index) => (
              <View key={index} style={styles.activeFilterChip}>
                <ThemedText style={styles.activeFilterText}>{filter}</ThemedText>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.clearAllFiltersButton}
              onPress={() => {
                setSelectedCategories([]);
                setSelectedPriceRange(null);
                setRatings(null);
                setSearchQuery('');
                setSelectedCities([]);
                setSelectedAmenities([]);
                setSelectedPersonCount(null);
              }}>
              <ThemedText style={styles.clearAllFiltersText}>Clear</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        )}
        
        {/* Filtreler Panel */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <ThemedText style={styles.filterSectionTitle}>Price Range</ThemedText>
            <View style={styles.priceRangeContainer}>
              {priceRanges.map(range => (
                <TouchableOpacity 
                  key={range.id}
                  style={[
                    styles.priceRangeButton, 
                    selectedPriceRange === range.id && styles.selectedPriceRange
                  ]}
                  onPress={() => selectedPriceRange === range.id 
                    ? setSelectedPriceRange(null) 
                    : setSelectedPriceRange(range.id)}>
                  <ThemedText style={selectedPriceRange === range.id ? styles.selectedRangeText : styles.priceRangeText}>
                    {range.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            
            <ThemedText style={styles.filterSectionTitle}>Minimum Rating</ThemedText>
            <View style={styles.ratingContainer}>
              {[null, 3, 4, 4.5].map((rating, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.ratingButton, 
                    ratings === rating && styles.selectedRating
                  ]}
                  onPress={() => ratings === rating ? setRatings(null) : setRatings(rating)}>
                  <ThemedText style={ratings === rating ? styles.selectedRatingText : styles.ratingButtonText}>
                    {rating === null ? 'All' : rating+'+'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.advancedFiltersButton}
              onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <ThemedText style={styles.advancedFiltersButtonText}>
                {showAdvancedFilters ? 'Hide Advanced Filters' : 'Advanced Filters'}
              </ThemedText>
              <Ionicons 
                name={showAdvancedFilters ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#4a6da7" />
            </TouchableOpacity>
            
            {showAdvancedFilters && (
              <>
                <ThemedText style={styles.filterSectionTitle}>City</ThemedText>
                <View style={styles.filterChipsContainer}>
                  {cities.map(city => (
                    <TouchableOpacity 
                      key={city.id}
                      style={[
                        styles.filterChip, 
                        selectedCities.includes(city.id) && styles.selectedFilterChip
                      ]}
                      onPress={() => toggleCity(city.id)}>
                      <ThemedText style={selectedCities.includes(city.id) ? styles.selectedFilterChipText : styles.filterChipText}>
                        {city.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <ThemedText style={styles.filterSectionTitle}>Amenities</ThemedText>
                <View style={styles.filterChipsContainer}>
                  {amenities.map(amenity => (
                    <TouchableOpacity 
                      key={amenity.id}
                      style={[
                        styles.filterChip, 
                        selectedAmenities.includes(amenity.id) && styles.selectedFilterChip
                      ]}
                      onPress={() => toggleAmenity(amenity.id)}>
                      <ThemedText style={selectedAmenities.includes(amenity.id) ? styles.selectedFilterChipText : styles.filterChipText}>
                        {amenity.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <ThemedText style={styles.filterSectionTitle}>Number of Guests</ThemedText>
                <View style={styles.filterChipsContainer}>
                  {personCounts.map(person => (
                    <TouchableOpacity 
                      key={person.id}
                      style={[
                        styles.filterChip, 
                        selectedPersonCount === person.id && styles.selectedFilterChip
                      ]}
                      onPress={() => selectedPersonCount === person.id 
                        ? setSelectedPersonCount(null) 
                        : setSelectedPersonCount(person.id)}>
                      <ThemedText style={selectedPersonCount === person.id ? styles.selectedFilterChipText : styles.filterChipText}>
                        {person.count}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            
            <View style={styles.filterActionsContainer}>
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSelectedCategories([]);
                  setSelectedPriceRange(null);
                  setRatings(null);
                  setSearchQuery('');
                  setSelectedCities([]);
                  setSelectedAmenities([]);
                  setSelectedPersonCount(null);
                }}>
                <ThemedText style={styles.clearFiltersText}>Clear Filters</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}>
                <ThemedText style={styles.applyFiltersText}>Apply</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Otel Listesi */}
        <View style={styles.hotelsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A6DA7" />
              <ThemedText style={styles.loadingText}>Loading hotels...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <TouchableOpacity style={styles.retryButton} onPress={fetchHotels}>
                <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={getSortedHotels(hotels)}
              renderItem={renderHotelCard}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.hotelsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#888" />
                  <ThemedText style={styles.emptyText}>No hotels found</ThemedText>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    width: '100%',
    height: Platform.OS === 'ios' ? 150 : 110,
    backgroundColor: '#4a6da7',
  },
  headerGradient: {
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 8,
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
    marginTop: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  filterTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: '#4a6da7',
  },
  filterTabText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#4a6da7',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 80,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCategoryItem: {
    backgroundColor: 'rgba(74, 109, 167, 0.15)',
    borderColor: '#4A6DA7',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategoryIconContainer: {
    backgroundColor: '#4A6DA7',
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
    color: '#4A6DA7',
  },
  aiSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 16,
    marginHorizontal: 15,
    marginBottom: 15,
    marginTop: 5,
    overflow: 'hidden',
    shadowColor: '#6a41bd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(106, 65, 189, 0.15)',
    height: 60,
  },
  aiIconContainer: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTextContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  aiArrowContainer: {
    width: 30,
    height: '100%',
    backgroundColor: '#6a41bd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSearchTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6a41bd',
  },
  aiSearchSubtitle: {
    fontSize: 12,
    color: '#666',
    opacity: 0.8,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  hotelCard: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  hotelImage: {
    height: 180,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 12,
  },
  hotelImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  hotelFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  featureTag: {
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(74, 109, 167, 0.15)',
  },
  featureText: {
    fontSize: 12,
    color: '#4a6da7',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  priceNightText: {
    fontSize: 12,
    color: 'white',
  },
  bookButton: {
    marginTop: 10,
  },
  bookButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 15,
  },
  clearFiltersButtonLarge: {
    backgroundColor: '#4a6da7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  clearFiltersTextLarge: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sortOptionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  activeSortOption: {
    backgroundColor: '#4a6da7',
  },
  sortOptionText: {
    marginLeft: 10,
    fontSize: 14,
  },
  activeSortOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  clearSortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 5,
  },
  clearSortText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  advancedFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  advancedFiltersButtonText: {
    color: '#4a6da7',
    fontWeight: '500',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  priceRangeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedPriceRange: {
    backgroundColor: '#4a6da7',
    borderColor: '#4a6da7',
  },
  priceRangeText: {
    fontSize: 14,
  },
  selectedRangeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  ratingButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedRating: {
    backgroundColor: '#4a6da7',
    borderColor: '#4a6da7',
  },
  ratingButtonText: {
    fontSize: 14,
  },
  selectedRatingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearFiltersButton: {
    padding: 10,
  },
  clearFiltersText: {
    color: '#666',
    fontSize: 14,
  },
  applyFiltersButton: {
    backgroundColor: '#4a6da7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyFiltersText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeFiltersScrollView: {
    marginBottom: 15,
    marginHorizontal: 15,
  },
  activeFiltersContainer: {
    paddingRight: 15,
    flexDirection: 'row',
  },
  activeFilterChip: {
    backgroundColor: '#e8f0ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d5e3ff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterText: {
    fontSize: 13,
    color: '#4a6da7',
  },
  clearAllFiltersButton: {
    backgroundColor: 'rgba(255,100,100,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,100,100,0.2)',
  },
  clearAllFiltersText: {
    fontSize: 13,
    color: '#ff6464',
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedFilterChip: {
    backgroundColor: '#4a6da7',
    borderColor: '#4a6da7',
  },
  filterChipText: {
    fontSize: 13,
  },
  selectedFilterChipText: {
    color: '#fff',
    fontWeight: '500',
  },
  hotelsContainer: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  hotelsList: {
    padding: 15,
  },
  imageGradient: {
    flex: 1,
    borderRadius: 16,
  },
  hotelImageContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  priceTag: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  hotelCardContent: {
    padding: 15,
  },
  hotelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityTag: {
    backgroundColor: '#f0f5ff',
    padding: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  amenityText: {
    fontSize: 12,
    color: '#4a6da7',
  },
  aiPlannerCard: {
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#6a41bd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  aiPlannerGradient: {
    width: '100%',
  },
  aiPlannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  aiPlannerImage: {
    width: 100,
    height: 130,
    resizeMode: 'cover',
  },
  aiPlannerTextContainer: {
    flex: 1,
    padding: 15,
  },
  aiPlannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  aiPlannerDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
    lineHeight: 18,
  },
  aiPlannerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiPlannerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  aiAgentButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#6a41bd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
  aiAgentButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  recommendationsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  refreshButton: {
    padding: 5,
  },
  recommendationsList: {
    paddingLeft: 15,
    paddingRight: 5,
  },
  recommendationsLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 180,
  },
  recommendationsLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6a41bd',
    textAlign: 'center',
  },
  recommendationsErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 180,
  },
  recommendationsErrorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  recommendationsRetryButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#6a41bd',
    borderRadius: 8,
  },
  recommendationsRetryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noRecommendationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: screenWidth - 30,
    height: 180,
  },
  noRecommendationsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  recommendationCard: {
    width: 280,
    height: 220,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6a41bd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  recommendationImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recommendationImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recommendationImageContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  recommendationCardContent: {
    flex: 1,
    padding: 15,
  },
  recommendationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationReasonContainer: {
    marginTop: 10,
  },
  recommendationReason: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  recommendedHotelCard: {
    borderWidth: 2,
    borderColor: '#6a41bd',
    shadowColor: '#6a41bd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  recommendedHotelImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#6a41bd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  recommendedAmenityTag: {
    backgroundColor: '#6a41bd',
  },
  recommendedAmenityText: {
    color: '#fff',
  },
  aiLoadingContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 65, 189, 0.3)',
    backgroundColor: 'rgba(106, 65, 189, 0.05)',
    overflow: 'hidden',
  },
  aiLoadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'center',
  },
  aiLoadingText: {
    marginLeft: 10,
    color: '#6a41bd',
    fontWeight: '500',
    fontSize: 14,
  },
  aiLoadingSpinner: {
    marginLeft: 10,
  },
}); 
