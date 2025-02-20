import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import {API_URL,SERVER_URL} from "@env"
import { Platform } from 'react-native';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LighthouseReportsScreen = ({ route }) => {
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;
  
  const { websiteId } = route.params;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamically adjust the number of charts in a row based on screen width
  const isPhone = screenWidth < 768; // Check if the screen width is less than 768px (i.e., a phone)

  const fetchReports = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${apiUrl}/seo-dashwebsites/${websiteId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);
  const [crawlHistoryData, setCrawlHistoryData] = useState([]);

  useEffect(() => {
    
    const fetchCrawlHistory = async () => {
      const token = await AsyncStorage.getItem('token');

      console.log("Hiii")
      try {
        const response = await fetch(`${apiUrl}/crawl-history/${websiteId}/`,{
          headers: { Authorization: `Token ${token}` }
        });
        const data = await response.json();

        setCrawlHistoryData(data.crawl_history);
      } catch (error) {
        console.error('Error fetching crawl history:', error);
      }
    };
    
    fetchCrawlHistory();
  }, [websiteId]);
  console.log(reports.map((item) => item.performance_score * 100));

  const uniqueLabels = Array.from(new Set(reports.map((item) => item.website)));

  const chartData = {
    labels: uniqueLabels,
    datasets: [
      {
        data: reports.map((item) => item.performance_score * 100), // [85, 75, 95]
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: reports.map((item) => item.seo_score * 100), // [90, 85, 80]
        color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: reports.map((item) => item.accessibility_score * 100), // [80, 95, 70]
        color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };
  const performanceAvg = reports.reduce((acc, item) => acc + item.performance_score, 0) / reports.length;
  const seoAvg = reports.reduce((acc, item) => acc + item.seo_score, 0) / reports.length;
  const accessibilityAvg = reports.reduce((acc, item) => acc + item.accessibility_score, 0) / reports.length;
  
  const pieChartData = [
    {
      name: 'Performance',
      population: performanceAvg, // Actual average for Performance
      color: '#ff6384',
      legendFontColor: 'rgb(255, 230, 230)',
      legendFontSize: 15,
    },
    {
      name: 'SEO',
      population: seoAvg, // Actual average for SEO
      color: '#36a2eb',
      legendFontColor: 'rgb(255, 230, 230)',
      legendFontSize: 15,
    },
    {
      name: 'Accessibility',
      population: accessibilityAvg, // Actual average for Accessibility
      color: '#4bc0c0',
      legendFontColor: 'rgb(255, 230, 230)',
      legendFontSize: 15,
    },
  ];
  

  const lineChartData = {
    labels: isPhone?reports.map((item) => {
      const date = new Date(item.created_at);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${formattedDate}`;
    }):reports.map((item) => {
        const date = new Date(item.created_at);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${formattedDate}, ${formattedTime}`;
    
    }),
    datasets: [
      {
        data: reports.map((item) => item.performance_score * 100),
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
      },
    ],
  };
  const renderCrawlHistoryItem = ({ item }) => (
    <View style={{  backgroundColor: '#fff',
      padding: 10,
      margin: 5,
      borderRadius: 8,
      elevation: 2, // Adds shadow on Android
      shadowColor: '#000', // Adds shadow on iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      width:isPhone?'97%':'49%'
      }}>
      <Text style={styles.historyTitle}>Page URL: {item.page.url}</Text>
      <Text style={styles.historyInfo}>Page Title: {item.page.title || 'N/A'}</Text>
      <Text style={styles.historyInfo}>Page Description: {item.page.description || 'N/A'}</Text>
      <Text style={styles.historyInfo}>Keywords: {item.page.keywords || 'N/A'}</Text>
      <Text style={styles.historyInfo}>Status: {item.page.status}</Text>
      <Text style={styles.historyInfo}>SEO Score: {item.page.seo_score || 'N/A'}</Text>
      <Text style={styles.historyInfo}>Accessibility Score: {item.page.accessibility_score || 'N/A'}</Text>
      <Text style={styles.historyInfo}>Timestamp: {new Date(item.timestamp).toLocaleString()}</Text>
      
      <View style={styles.websiteContainer}>
        <Text style={styles.websiteTitle}>Website Info:</Text>
        <Text style={styles.websiteInfo}>Website URL: {item.website.url}</Text>
        <Text style={styles.websiteInfo}>Website Status: {item.website.status}</Text>
        <Text style={styles.websiteInfo}>Verification Method: {item.website.verification_method}</Text>
      </View>
    </View>
  );


  const renderReport = ({ item }) => (
<View style={styles.card}>
  <Text style={styles.formd}>Screen  :  {item.form_factor.toUpperCase() }</Text>


  {/* Performance Score */}
  <View style={styles.scoreRow}>
    <Text style={[styles.text, styles.label]}>Performance Score:</Text>
    <Text style={[styles.text, styles.performanceScore]}>
      {item.performance_score*100}
    </Text>
  </View>

  {/* SEO Score */}
  <View style={styles.scoreRow}>
    <Text style={[styles.text, styles.label]}>SEO Score:</Text>
    <Text style={[styles.text, styles.seoScore]}>{item.seo_score*100}</Text>
  </View>

  {/* Accessibility Score */}
  <View style={styles.scoreRow}>
    <Text style={[styles.text, styles.label]}>Accessibility Score:</Text>
    <Text style={[styles.text, styles.accessibilityScore]}>
      {item.accessibility_score*100}
    </Text>
  </View>

  {/* Detailed Metrics */}
  <Text style={[styles.text, styles.metric]}>
    <Text style={styles.bold}>First Contentful Paint:</Text> {item.first_contentful_paint}
  </Text>
  <Text style={[styles.text, styles.metric]}>
    <Text style={styles.bold}>Largest Contentful Paint:</Text> {item.largest_contentful_paint}
  </Text>
  <Text style={[styles.text, styles.metric]}>
    <Text style={styles.bold}>Total Blocking Time:</Text> {item.total_blocking_time}
  </Text>
  <Text style={[styles.text, styles.metric]}>
    <Text style={styles.bold}>Cumulative Layout Shift:</Text> {item.cumulative_layout_shift}
  </Text>
  <Text style={[styles.text, styles.metric]}>
    <Text style={styles.bold}>Speed Index:</Text> {item.speed_index}
  </Text>

  {/* Date */}
  <Text style={styles.date}>
    <Text style={styles.bold}>Created At:</Text> {item.created_at}
  </Text>
</View>
  );

  return (
<ScrollView  contentContainerStyle={{ flexGrow: 1,height:screenHeight }}>
{loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
        <View>
        <View style={styles.container}>
          <Text style={styles.title}>Full Report </Text>
          <Text style={styles.header}>{reports[0]?.website|| 'Unknown Website'}</Text>

          <View
          style={[
            styles.chartContainer,
            { flexDirection: isPhone ? 'column' : 'row' } // Stack charts vertically on phones, horizontally on larger screens
          ]}
        >
          <View style={styles.chartWrapper}>
            <BarChart
              data={chartData}
              width={isPhone ? screenWidth - 40 : screenWidth / 3 - 20} // Adjust chart width based on screen size
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              style={styles.chart}
            />
          </View>

          <View style={styles.chartWrapper}>
            <LineChart
              data={lineChartData}
              width={isPhone ? screenWidth - 40 : screenWidth / 3 - 20}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              style={styles.chart}
            />
          </View>

          <View style={styles.chartWrapper}>
            <PieChart
              data={pieChartData}
              width={isPhone ? screenWidth - 40 : screenWidth / 3 - 20}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              style={styles.chart}
            />
           <View style={styles.avgContainer}>
        <Text style={styles.avgText}>Performance: {(performanceAvg * 100).toFixed(2)}%</Text>
        <Text style={styles.avgText}>SEO Average: {(seoAvg * 100).toFixed(2)}%</Text>
        <Text style={styles.avgText}>Accessibility: {(accessibilityAvg * 100).toFixed(2)}%</Text>
      </View>
      
          </View>
       
        </View>
        

        <FlatList
            data={reports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReport}
            horizontal={false}
            numColumns={isPhone ? 1 : 5} // One card per row on phones
            columnWrapperStyle={isPhone ? null : styles.row} // Apply row style only if more than 1 column
            />
     
           
      
     <FlatList
      data={crawlHistoryData}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderCrawlHistoryItem}
      horizontal={false}
      numColumns={isPhone ? 1 : 2} // Set 1 column for phones, 3 columns for larger screens
      columnWrapperStyle={isPhone ? null : styles.row} // Styling for the row when not on a phone
    />
  </View>
       
        </View>
        </>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa',flexGrow:1},
// scroll:{height:'100%'},
// scroll: {  padding: 3, backgroundColor: '#f8f9fa',height:isPhone ?"142%":"108%" },

row: { justifyContent: 'space-between', marginBottom: 10 }, // Space between columns

card: {
    backgroundColor: '#ffffff',
    padding: 26,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderColor: '#f1f1f1',  // Subtle border for professionalism
    borderWidth: 1, // Soft border
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'center',
    color: '#007bff',  // Highlighting the website name
  },
  formd: {

    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,

    alignSelf: 'center',
    color: 'green',
  },
  text: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',  // Make labels bold for emphasis
    color: '#343a40',
  },
  performanceScore: {
    color: '#ff6384', // Red for performance (can use a gradient color for professional look)
  },
  seoScore: {
    color: '#36a2eb', // Blue for SEO
  },
  accessibilityScore: {
    color: '#4bc0c0', // Green for accessibility
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 20,

  },
  metric: {
    fontSize: 14,
    color: '#6c757d',
  

  },
  bold: {
    fontWeight: '700', // Emphasize labels like "First Contentful Paint"
  },
  date: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 10,
  },
  
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  chartContainer: {
    flexDirection: 'row',  // Default to row layout (on larger screens)
    flexWrap: 'wrap', // Allow wrapping to next line if there isn't enough space
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  chartWrapper: {
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
    gap:20,
    marginBottom: 80, // Space between charts when stacked vertically
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  avgContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    width: '80%', // Ensures that the space is proportionate

  },
  avgText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    padding: 10,
    width: '90%', // Optional: Ensures the texts take up enough space for better alignment

    backgroundColor: '#fff',
    borderRadius: 10,
   
    // shadowOffset: { width: 0, height: 4 },
    // shadowRadius: 4,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  dataContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dataText: {
    fontSize: 14,
  },
  historyItemContainer: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 5,
    borderRadius: 8,
    elevation: 2, // Adds shadow on Android
    shadowColor: '#000', // Adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    width:'49%'
  },
  historyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyInfo: {
    fontSize: 14,
    marginVertical: 2,
  },
  websiteContainer: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  websiteTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  websiteInfo: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default LighthouseReportsScreen