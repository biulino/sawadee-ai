import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, Platform, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Stack } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

const occupancyData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [65, 75, 80, 85, 90, 88],
      color: (opacity = 1) => `rgba(106, 65, 189, ${opacity})`,
      strokeWidth: 2
    }
  ],
  legend: ["Occupancy Rate (%)"]
};

const revenueData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      data: [35000, 42000, 50000, 55000, 65000, 60000],
      color: (opacity = 1) => `rgba(74, 109, 167, ${opacity})`,
    }
  ],
  legend: ["Monthly Revenue (₺)"]
};

const reservationSourceData = {
  labels: ["Web", "Mobile", "Phone", "Agencies", "Other"],
  data: [0.38, 0.32, 0.12, 0.15, 0.03]
};

const colors = ['#6a41bd', '#4A6DA7', '#5F50E3', '#8083FF', '#9D6AE3'];

export default function AdminScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderDashboardContent = () => (
    <View style={styles.dashboardContainer}>
      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardContent}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(106, 65, 189, 0.15)' }]}>
              <Ionicons name="bed-outline" size={28} color="#6a41bd" />
            </View>            <View style={styles.cardTextContainer}>
              <ThemedText style={styles.cardNumber}>125</ThemedText>
              <ThemedText style={styles.cardLabel}>Total Rooms</ThemedText>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <ThemedText style={styles.cardFooterText}>Active: 112</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardContent}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(74, 109, 167, 0.15)' }]}>
              <Ionicons name="calendar-outline" size={28} color="#4A6DA7" />
            </View>            <View style={styles.cardTextContainer}>
              <ThemedText style={styles.cardNumber}>78</ThemedText>
              <ThemedText style={styles.cardLabel}>Reservations</ThemedText>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <ThemedText style={styles.cardFooterText}>This Month: +12%</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardContent}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(46, 189, 133, 0.15)' }]}>
              <Ionicons name="cash-outline" size={28} color="#2EBD85" />
            </View>            <View style={styles.cardTextContainer}>
              <ThemedText style={styles.cardNumber}>₺60K</ThemedText>
              <ThemedText style={styles.cardLabel}>Revenue</ThemedText>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <ThemedText style={styles.cardFooterText}>This Month: +8%</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardContent}>
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(255, 159, 67, 0.15)' }]}>
              <Ionicons name="people-outline" size={28} color="#FF9F43" />
            </View>            <View style={styles.cardTextContainer}>
              <ThemedText style={styles.cardNumber}>92%</ThemedText>
              <ThemedText style={styles.cardLabel}>Satisfaction</ThemedText>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <ThemedText style={styles.cardFooterText}>165 Reviews</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Occupancy Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Occupancy Rate</ThemedText>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#6a41bd' }]} />
              <ThemedText style={styles.legendText}>2023</ThemedText>
            </View>
          </View>
        </View>
        <LineChart
          data={occupancyData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#6a41bd'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Revenue Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Monthly Revenue</ThemedText>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4A6DA7' }]} />
              <ThemedText style={styles.legendText}>2023</ThemedText>
            </View>
          </View>
        </View>
        <BarChart
          data={revenueData}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix="₺"
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(74, 109, 167, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            barPercentage: 0.6,
          }}
          style={styles.chart}
        />
      </View>

      {/* Reservation Source Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <ThemedText style={styles.chartTitle}>Reservation Channels</ThemedText>
        </View>
        <PieChart
          data={reservationSourceData.labels.map((label, index) => ({
            name: label,
            population: reservationSourceData.data[index] * 100,
            color: colors[index],
            legendFontColor: '#7F7F7F',
            legendFontSize: 12
          }))}
          width={screenWidth - 40}
          height={180}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />
      </View>

      {/* Recent Reservations */}
      <View style={styles.recentReservations}>
        <View style={styles.sectionHeader}>          <ThemedText style={styles.sectionTitle}>Recent Reservations</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.seeAllButton}>See All</ThemedText>
          </TouchableOpacity>
        </View>

        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.reservationItem}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/' + (10 + item) + '.jpg' }} 
              style={styles.guestImage} 
            />
            <View style={styles.reservationDetails}>              <ThemedText style={styles.guestName}>Guest {item}</ThemedText>
              <ThemedText style={styles.reservationInfo}>Room {105 + item} • 3 Nights • 2 Guests</ThemedText>
            </View>
            <View style={styles.reservationStatus}>
              <View style={styles.statusBadge}>                <ThemedText style={styles.statusText}>Confirmed</ThemedText>
              </View>
              <ThemedText style={styles.reservationDate}>Jun 24, 2023</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  useEffect(() => {
    // Ekranın tam ekran olmasını sağlamak için
    StatusBar.setBarStyle('light-content');
    Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent');
    Platform.OS === 'android' && StatusBar.setTranslucent(true);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
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
              <View style={styles.headerTitleContainer}>
                <Ionicons name="business-outline" size={20} color="#fff" style={styles.headerIcon} />
                <ThemedText style={styles.headerTitle}>Hotel Management</ThemedText>
              </View>
              <TouchableOpacity style={styles.headerAction}>
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'dashboard' && styles.activeTabItem]}
          onPress={() => setActiveTab('dashboard')}>
          <Ionicons 
            name="stats-chart" 
            size={20} 
            color={activeTab === 'dashboard' ? '#6a41bd' : '#666'} />          <ThemedText style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'rooms' && styles.activeTabItem]}
          onPress={() => setActiveTab('rooms')}>
          <Ionicons 
            name="bed-outline" 
            size={20} 
            color={activeTab === 'rooms' ? '#6a41bd' : '#666'} />          <ThemedText style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>
            Rooms
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'reservations' && styles.activeTabItem]}
          onPress={() => setActiveTab('reservations')}>
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={activeTab === 'reservations' ? '#6a41bd' : '#666'} />          <ThemedText style={[styles.tabText, activeTab === 'reservations' && styles.activeTabText]}>
            Reservations
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'settings' && styles.activeTabItem]}
          onPress={() => setActiveTab('settings')}>
          <Ionicons 
            name="settings-outline" 
            size={20} 
            color={activeTab === 'settings' ? '#6a41bd' : '#666'} />          <ThemedText style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {activeTab === 'dashboard' && renderDashboardContent()}
        {activeTab !== 'dashboard' && (
          <View style={styles.centeredContent}>
            <Ionicons name="construct-outline" size={60} color="#ccc" />
            <ThemedText style={styles.comingSoonText}>This section is under development</ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 0,
    marginTop: 0,
  },
  headerContainer: {
    width: '100%',
    paddingTop: 0,
    marginTop: 0,
    backgroundColor: 'transparent',
  },
  headerGradient: {
    width: '100%',
    paddingTop: StatusBar.currentHeight || (Platform.OS === 'ios' ? 50 : 0),
    paddingBottom: 15,
  },
  safeArea: {
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 8,
  },
  headerTitleContainer: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerAction: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#6a41bd',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#6a41bd',
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  dashboardContainer: {
    padding: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
  },
  cardFooter: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cardFooterText: {
    fontSize: 12,
    color: '#666',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  recentReservations: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    fontSize: 13,
    color: '#6a41bd',
  },
  reservationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  guestImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reservationDetails: {
    flex: 1,
  },
  guestName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reservationInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reservationStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: 'rgba(46, 189, 133, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#2EBD85',
    fontWeight: 'bold',
  },
  reservationDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  }
}); 