import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,Animated,Easing } from 'react-native';
// import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Progress from 'react-native-progress';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {API_URL,SERVER_URL} from "@env"
import { Platform } from 'react-native';


const WebCrawlingScreen = ({ route, navigation }) => {
  const { websiteId } = route.params;
  const [pages, setPages] = useState([]);
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [progress, setProgress] = useState(0); // Track progress
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  const spinValue = useRef(new Animated.Value(0)).current; // For spinning effect
  const glowValue = useRef(new Animated.Value(1)).current; // For pulsating effect

  const messages = [
    { range: [0, 20], message: "Initializing..." },
    { range: [20, 50], message: "Fetching Pages..." },
    { range: [50, 80], message: "Crawling Website..." },
    { range: [80, 100], message: "Finalizing Results..." },
  ];

  // Update message based on progress
  useEffect(() => {
    const updateMessage = () => {
      for (let i = 0; i < messages.length; i++) {
        if (progress >= messages[i].range[0] && progress < messages[i].range[1]) {
          setLoadingMessage(messages[i].message);
          break;
        }
      }
    };

    updateMessage(); // Call the updateMessage function whenever progress changes
  }, [progress]);

  // Simulate Progress for Demo
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) return prev + 10;
        clearInterval(interval);
        return 100;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/crawl-websites/${websiteId}/crawl/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setPages(response.data.pages);
        setProgress(50); // Update progress to 50% after pages are fetched
      } catch (error) {
        setError(error.response ? error.response.data.error : 'An unknown error occurred');
        console.error('Error fetching pages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [websiteId]);

  // Animate Circular Progress
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowValue, {
          toValue: 1.5,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(glowValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Web Crawling & Page Scanning</Text>
      {error && <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.circularContainer,
              {
                transform: [{ rotate: spin }],
                opacity: glowValue,
              },
            ]}
          >
            <Progress.Circle
              progress={progress / 100}
              size={150}
              showsText={true}
              color={progress < 20 ? '#C7D3D4FF' : progress < 80 ? '#27ae60' : '#3498da'}
              borderWidth={2}
              thickness={8}
              formatText={() => `${Math.round(progress)}%`}
            />
          </Animated.View>
          <Text style={styles.loadingText}>{loadingMessage}</Text>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <FlatList
          data={pages}
          keyExtractor={(item) => item.url}
          renderItem={({ item }) => (
            <View style={styles.pageItem}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('PageDetails', { pageUrl: item.url })} 
                style={styles.pageContent}
              >
                <Text style={styles.pageUrl}>{item.url}</Text>
                <View style={styles.statusContainer}>
                  {/* <Ionicons name="ios-checkbox-outline" size={20} color={item.status === 'sucess' ? '#28a745' : '#ffc107'} /> */}
                  <Text style={[styles.pageStatus, item.status === 'success' ? styles.statusCrawled : styles.statusPending]}>{item.status}</Text>
                </View>
                <Text style={styles.pageTitle}>Title : <Text style={styles.pageValue}>{item.title || 'N/A'}</Text></Text>
                <Text style={styles.pageDescription}>Description : <Text style={styles.pageValue}>{item.description || 'N/A'}</Text></Text>
                <Text style={styles.pageKeywords}>Keywords : <Text style={styles.pageValue}>{item.keywords || 'N/A'}</Text></Text>
                <Text style={styles.pageH1}>H1 : <Text style={styles.pageValue}>{item.h1 || 'N/A'}</Text></Text>
                <Text style={styles.pageH2}>H2 : <Text style={styles.pageValue}>{item.h2 || 'N/A'}</Text></Text>
                <Text style={styles.pageH3}>H3 : <Text style={styles.pageValue}>{item.h3 || 'N/A'}</Text></Text>
                <Text style={styles.pageCreatedAt}>Created At : <Text style={styles.pageValue}>{item.created_at}</Text></Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
    paddingBottom: 40,
    height:33,

  },
  
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
    textAlign: 'center',
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#343a40',
  },
  pageItem: {
    backgroundColor: '#ffffff',
    marginBottom: 15,
    borderRadius: 8,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pageContent: {
    paddingBottom: 10,
  },
  pageUrl: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  pageStatus: {
    fontSize: 14,
    marginLeft: 5,
  },
  statusCrawled: {
    color: '#28a745',
  },
  statusPending: {
    color: '#ffc107',
  },
  pageTitle: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  pageDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  pageKeywords: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  pageH1: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  pageH2: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  pageH3: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  pageCreatedAt: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  pageValue: {
    fontWeight: 'normal',
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  circularContainer: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 10,
    fontWeight: "bold",
  },
  successText: {
    fontSize: 20,
    color: "green",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  pageCard: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pageText: {
    fontSize: 16,
    color: "#333",
  },
});

export default WebCrawlingScreen;