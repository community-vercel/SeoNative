import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL,SERVER_URL} from "@env"
import { Platform } from 'react-native';


const CrawlHistoryScreen = ({ route, navigation }) => {
  const { websiteId } = route.params;
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

  useEffect(() => {
    const fetchCrawlHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/crawl-history/`, {
          headers: { Authorization: `Token ${token}` },
          params: { website_id: websiteId }
        });
        setHistories(response.data.histories);
      } catch (error) {
        console.error('Error fetching crawl history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCrawlHistory();
  }, [websiteId]);

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyDate}>Date: {item.date}</Text>
      <Text style={styles.historyDetails}>Details: {item.details}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Crawl History</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading crawl history...</Text>
        </View>
      ) : (
        <FlatList
          data={histories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fa', flexGrow: 1 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#343a40', marginBottom: 20, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 18, color: '#343a40' },
  historyItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  historyDate: { fontSize: 18, color: '#212529', marginBottom: 5, fontWeight: 'bold' },
  historyDetails: { fontSize: 16, color: '#495057' },
});

export default CrawlHistoryScreen;
