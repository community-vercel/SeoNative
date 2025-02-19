import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Animated } from 'react-native';
import { View, Text, ScrollView, StyleSheet,ActivityIndicator,   Animated, TouchableOpacity,Easing } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Progress from 'react-native-progress';
import {API_URL,SERVER_URL} from "@env"
import { Platform } from 'react-native';


const SeoAuditScreen = ({ route, navigation }) => {
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

  const { websiteId } = route.params;
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lighthouseLoading, setLighthouseLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  const [formFactor, setFormFactor] = useState('mobile'); // Default to 'mobile'
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  const spinValue = useRef(new Animated.Value(0)).current; // For spinning effect
  const glowValue = useRef(new Animated.Value(1)).current; // For pulsating effect



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
  const getColor = (score) => {
    if (score *100 >= 90) return '#0cce6b'; // Green
    if (score * 100 >= 50) return '#ffa400'; // Orange
    return '#ff4e42'; // Red
  };
  useEffect(() => {
    fetchLighthouseReport();
  }, [formFactor]); // Dependency on formFactor ensures data is fetched only when formFactor changes

  // Render circular score
  const renderScore = (label, score) => {
    const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;

    return (
      <View style={styles.scoreContainer}>
        <AnimatedCircularProgress
          size={120} // Size of the circle
          width={12} // Thickness of the circle
          fill={validScore} // Score percentage
          tintColor={getColor(validScore)} // Dynamic color based on score
          backgroundColor="#e0e0e0" // Background color for the circle
          rotation={0} // Starting position of the progress
          lineCap="round" // Smoo
        >
          {() => (
            <Text style={[styles.scoreText, { color: getColor(validScore) }]}>
{validScore*100}            </Text>
          )}
        </AnimatedCircularProgress>
        <Text style={styles.label}>{label}</Text>
      </View>
    );
  };
  const [progress, setProgress] = useState(0);
  
  // Simulate loading progress for demo purposes
  const updateProgress = (currentProgress) => {
    if (currentProgress <= 100) {
      setProgress(currentProgress);
    }
  };

  // Simulate loading progress for demo purposes
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setProgress((prevProgress) => {
  //       if (prevProgress < 100) return prevProgress + 10;
  //       clearInterval(interval);
  //       return 100;
  //     });
  //   }, 7000); // Adjust the duration of the progress update (for demo purpose)

  //   return () => clearInterval(interval);
  // }, []);

  // Fetch audit data
  const messages = [
    { range: [0, 20], message: "Initializing..." },
    { range: [20, 50], message: "Fetching Audit Data..." },
    { range: [50, 80], message: "Fetching Lighthouse Reports..." },
    { range: [80, 100], message: "Finalizing Results.........." },
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
  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/audit-websites/${websiteId}/audit/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setAuditData(response.data);
        updateProgress(50); // Update progress when audit data is fetched
      } catch (error) {
        console.error('Error fetching audit data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditData();
  }, [websiteId]);

  // Fetch Lighthouse report
  const fetchLighthouseReport = async () => {
    setLighthouseLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/seo-websites/${websiteId}/lighthouse/?form_factor=desktop`, {
        headers: { Authorization: `Token ${token}` }
      });
      setAuditData(prevData => ({
        ...prevData,
        lighthouse: response.data
      }));
      updateProgress(100); // Update progress when lighthouse data is fetched
    } catch (error) {
      console.error('Error fetching Lighthouse report:', error);
    } finally {
      setLighthouseLoading(false);
    }
  };
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


  // Start fetching Lighthouse report once audit data is loaded
  useEffect(() => {
    if (!loading) {
      fetchLighthouseReport();
    }
  }, [loading]);
  // Render key performance metrics as a list
  const renderMetrics = (metrics) => {
    return (
      <View style={styles.metricsLighthouseContainer}>
        {Object.entries(metrics).map(([key, value], index) => (
          <View key={index} style={styles.metricItem}>
            <View style={styles.metricLabelContainer}>
              <Text style={styles.metricLabel}>
                {key.toUpperCase().replace(/_/g, ' ')}
              </Text>
            </View>
            <Text style={styles.metricValue}>{value}</Text>
          </View>
        ))}
      </View>
    );
  };


  // useEffect(() => {
  //   const fetchAuditData = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem('token');
  //       const response = await axios.get(`${apiUrl}         /audit-websites/${websiteId}/audit/`, {
  //         headers: { Authorization: `Token ${token}` }
  //       });
  //       setAuditData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching audit data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchAuditData();
  // }, [websiteId]);
  // const fetchLighthouseReport = async () => {
  //   setLighthouseLoading(true)
  //   try {
  //     const token = await AsyncStorage.getItem('token');
  //     const response = await axios.get(`${apiUrl}         /seo-websites/${websiteId}/lighthouse/?form_factor=${formFactor}`, {
  //       headers: { Authorization: `Token ${token}` }
  //     });
  //     setAuditData(prevData => ({
  //       ...prevData,
  //       lighthouse: response.data
  //     }));
  //   } catch (error) {
  //     console.error('Error fetching Lighthouse report:', error);
  //   } finally {
  //     setLighthouseLoading(false);
  //   }
  // };
// console.log("audit data",auditData)
//   useEffect(() => {
//     fetchLighthouseReport();
//   }, [formFactor]);


  return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.header}>SEO Audit & Evaluation</Text>
    {loading || lighthouseLoading ? (
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
              borderWidth={2}
              thickness={8}
              color={progress < 20 ? '#C7D3D4FF' : progress < 80 ? '#27ae60' : '#3498db'}
              formatText={() => `${Math.round(progress)}%`}
            />
          </Animated.View>
          <Text style={styles.loadingText}>{loadingMessage}</Text>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      
) : (
  auditData && !loading && !lighthouseLoading && (
        <View style={styles.rowContainer}>
          {/* Left Column: Audit Data */}
          <View style={styles.leftColumn}>
            {/* On-Page SEO Analysis Section */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>On-Page SEO Analysis</Text>
              <Text style={styles.subHeader}>Meta Tags</Text>
              <Text style={styles.text}>Title: <Text style={styles.value}>{auditData?.metaTags.title}</Text></Text>
              <Text style={styles.text}>Description: <Text style={styles.value}>{auditData.metaTags.description}</Text></Text>
              <Text style={styles.text}>Other Meta Tags: <Text style={styles.value}>{auditData.metaTags.other}</Text></Text>
            </View>
  
            {/* Headings Section */}
            <View style={styles.card}>
              <Text style={styles.subHeader}>Headings Structure</Text>
              <Text style={styles.text}>H1: <Text style={styles.value}>{auditData.headings.h1}</Text></Text>
              <Text style={styles.text}>H2: <Text style={styles.value}>{auditData.headings.h2}</Text></Text>
              <Text style={styles.text}>H3: <Text style={styles.value}>{auditData.headings.h3}</Text></Text>
            </View>
  
            {/* Content Quality Section */}
            <View style={styles.card}>
              <Text style={styles.subHeader}>Content Quality</Text>
              <Text style={styles.text}>Keyword Density: <Text style={styles.value}>{auditData.contentQuality.keywordDensity}</Text></Text>
              <Text style={styles.text}>Readability: <Text style={styles.value}>{auditData.contentQuality.readability}</Text></Text>
              <Text style={styles.text}>Duplicate Content: <Text style={styles.value}>{auditData.contentQuality.duplicateContent}</Text></Text>
            </View>
  
            {/* Image Optimization Section */}
            <View style={styles.card}>
              <Text style={styles.subHeader}>Image Optimization</Text>
              <Text style={styles.text}>Alt Attributes Missing: <Text style={styles.value}>{auditData.imageOptimization.missingAlt}</Text></Text>
              <Text style={styles.text}>Optimized: <Text style={styles.value}>{auditData.imageOptimization.optimizedAlt}</Text></Text>
              <Text style={styles.text}>Total: <Text style={styles.value}>{auditData.imageOptimization.totalImages}</Text></Text>
            </View>
  
            {/* Technical SEO Section */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Technical SEO Analysis</Text>
              <Text style={styles.subHeader}>Page Speed</Text>
              <Text style={styles.text}>Load Time: <Text style={styles.value}>{auditData.technicalSeo.pageSpeed}</Text></Text>
              <Text style={styles.subHeader}>Mobile-Friendliness</Text>
              <Text style={styles.text}>Responsive Design: <Text style={styles.value}>{auditData.technicalSeo.mobileFriendliness}</Text></Text>
              <Text style={styles.subHeader}>Schema Markup</Text>
              <Text style={styles.text}>Structured Data: <Text style={styles.value}>{auditData.technicalSeo.schemaMarkup}</Text></Text>
              <Text style={styles.subHeader}>Canonicalization</Text>
              <Text style={styles.text}>Canonical Tags: <Text style={styles.value}>{auditData.technicalSeo.canonicalization}</Text></Text>
              <Text style={styles.subHeader}>Robots.txt & XML Sitemaps</Text>
              <Text style={styles.text}>Robots.txt: <Text style={styles.value}>{auditData.technicalSeo.robotsTxt}</Text></Text>
              <Text style={styles.text}>XML Sitemaps: <Text style={styles.value}>{auditData.technicalSeo.xmlSitemaps}</Text></Text>
              <Text style={styles.subHeader}>Broken Links</Text>
              <Text style={styles.text}>404 Errors: <Text style={styles.value}>{auditData.technicalSeo.brokenLinks.join(', ')}</Text></Text>
            </View>
  
            {/* Security & Accessibility Section */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>Security & Accessibility</Text>
              <Text style={styles.subHeader}>HTTPS Implementation</Text>
              <Text style={styles.text}>HTTPS: <Text style={styles.value}>{auditData.security.https}</Text></Text>
              <Text style={styles.subHeader}>Accessibility Compliance</Text>
              <Text style={styles.text}>ARIA Roles: <Text style={styles.value}>{auditData.accessibility.ariaRoles}</Text></Text>
              <Text style={styles.text}>Contrast Ratio: <Text style={styles.value}>{auditData.accessibility.contrastRatio}</Text></Text>
            </View>
          </View>
  
          {/* Right Column: Lighthouse Report */}
          <View style={styles.rightColumn}>
            {
              auditData && auditData.lighthouse && (
                <View style={styles.lighthouseContainer}>
                  <Text style={styles.lighthouseHeader}>
                    {`Lighthouse Report | ${isMobile ? 'Mobile' : 'Desktop'}`}
                  </Text>
  
                  {/* Tabs for Mobile/Desktop */}
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[styles.tabButton, isMobile && styles.activeTab]}
                      onPress={() => {
                        setIsMobile(true); // Set tab to mobile
                        setFormFactor('mobile'); // Update form factor
                      }}
                    >
                      <Text style={[styles.tabText, isMobile && styles.activeTabText]}>Mobile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tabButton, !isMobile && styles.activeTab]}
                      onPress={() => {
                        setIsMobile(false); // Set tab to desktop
                        setFormFactor('desktop'); // Update form factor
                      }}
                    >
                      <Text style={[styles.tabText, !isMobile && styles.activeTabText]}>Desktop</Text>
                    </TouchableOpacity>
                  </View>
  
                  {/* Circular Metrics */}
                  <View style={styles.metricsContainer}>
                    {renderScore('Performance', auditData.lighthouse.scores.performance)}
                    {renderScore('Accessibility', auditData.lighthouse.scores.accessibility)}
                    {renderScore('SEO', auditData.lighthouse.scores.seo)}
                    <View>
                      <Text style={styles.metricsHeader}>Performance Metrics</Text>
                      {renderMetrics(auditData.lighthouse.metrics)}
                    </View>
                  </View>
                </View>
              )
            }
          </View>
        </View>
      )
    )}
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row', // Aligns children horizontally
    justifyContent: 'space-between', // Space out the columns
    flexWrap: 'wrap', // Allows wrapping for smaller screens
  },
  leftColumn: {
    flex: 1,
    marginRight: 16,
  },
  rightColumn: {
    flex: 1,
    marginLeft: 16,
  },
  container: { padding: 20, backgroundColor: '#f8f9fa', flexGrow: 1,height:30 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#007bff', marginBottom: 20, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 18, color: '#343a40' },
  sectionHeader: { fontSize: 24, fontWeight: 'bold', color: '#343a40', marginTop: 20, marginBottom: 10 },
  subHeader: { fontSize: 20, fontWeight: 'bold', color: '#495057', marginTop: 10, marginBottom: 5 },
  text: { fontSize: 16, color: '#495057', marginBottom: 5 },
  value: { fontWeight: 'normal', color: '#007bff' },
  card: {
    backgroundColor: '#ffffff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5
  },
  label: { marginTop: 5, fontSize: 12, color: '#333', textAlign: 'center' },
  lighthouseContainer: { alignItems: 'center' },
  lighthouseHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, textAlign: 'center', color: '#333' },
  lighthouseUrl: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 15 },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  tabButton: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, marginHorizontal: 5 },
  activeTab: { backgroundColor: '#007bff', borderColor: '#007bff' },
  tabText: { color: '#007bff' },
  lighthouseContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lighthouseHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  lighthouseUrl: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0cce6b',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    color: '#0cce6b',
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  metricsLighthouseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 3,
  },
  metricItem: {
    flexDirection: 'row', // Horizontal alignment for label and value
    justifyContent: 'space-between', // Space between label and value
    alignItems: 'center', // Center alignment vertically
    paddingVertical: 10, // Vertical padding between items
    borderBottomWidth: 1, // Divider for each metric
    borderBottomColor: '#e0e0e0', // Divider color
  },
  metricLabelContainer: {
    flex: 1, // Allow label to take more space
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
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
});

export default SeoAuditScreen;