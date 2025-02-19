import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import {API_URL,SERVER_URL} from "@env"
import { Platform } from 'react-native';


const HomePage = ({ navigation }) => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions(); // Get the screen width dynamically
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

  const numColumns = width > 768 ? 3 : 2; // Show 3 columns on larger screens, 2 on smaller ones

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/get-websites/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setWebsites(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsites();
  }, []);

  const renderWebsiteItem = ({ item }) => (
    <View style={styles.websiteItem}>
      <Text style={styles.websiteUrl}>{item.url}</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('crawl', { websiteId: item.id })}
        >
          <FontAwesome5 name="spider" size={16} color="#fff" />
          <Text style={styles.buttonText}>Crawl</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SeoAudit', { websiteId: item.id })}
        >
          <FontAwesome5 name="search" size={16} color="#fff" />
          <Text style={styles.buttonText}>SEO Audit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SeoDash', { websiteId: item.id })}
        >
          <FontAwesome5 name="chart-line" size={16} color="#fff" />
          <Text style={styles.buttonText}>SEO Results</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Edit', { websiteId: item.id })}
        >
          <FontAwesome5 name="edit" size={16} color="#fff" />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CrawlHistory', { websiteId: item.id })}
        >
          <FontAwesome5 name="history" size={16} color="#fff" />
          <Text style={styles.buttonText}>Crawl History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statusButton}>
          <Text
            style={[
              styles.statusText,
              item.status === 'pending'
                ? styles.pending
                : item.status === 'approved'
                ? styles.approved
                : styles.rejected,
            ]}
          >
            {item.status === 'pending' ? 'Pending' : item.status === 'approved' ? 'Approved' : 'Rejected'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Welcome to SEO Dashboard</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddWebsite')}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Website</Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>Your Websites:</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading websites...</Text>
        </View>
      ) : (
        <FlatList
          data={websites}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          renderItem={renderWebsiteItem}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f4f6f8', flexGrow: 1,height:30 },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#00000040',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subHeader: { fontSize: 22, color: '#495057', marginTop: 20, marginBottom: 10 },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  row: { flex: 1, justifyContent: 'space-between' },
  websiteItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    flex: 1,
    margin: 5,
  },
  websiteUrl: { fontSize: 18, color: '#212529', marginBottom: 10, fontWeight: 'bold', textAlign: 'center' },
  buttonGroup: { flexDirection: 'column', justifyContent: 'space-between' },
  actionButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  statusButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 5,
    backgroundColor: '#e9ecef',
  },
  buttonText: { color: '#fff', fontSize: 14, marginLeft: 8 },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  pending: { color: 'orange' },
  approved: { color: 'green' },
  rejected: { color: 'red' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 18, color: '#6c757d' },
});

export default HomePage;