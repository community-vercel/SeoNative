import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Button, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import {API_URL,SERVER_URL} from "@env"
import { Platform } from 'react-native';


const EditWebsiteScreen = ({ route, navigation }) => {
  const { websiteId } = route.params;
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationFile, setVerificationFile] = useState(null);
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/get-websites/${websiteId}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setWebsiteUrl(response.data.url);
        setVerificationMethod(response.data.verification_method);
        setVerificationToken(response.data.verification_meta);
      } catch (error) {
        console.error('Error fetching website:', error);
      }
    };
    fetchWebsite();
  }, [websiteId]);

  const handleUpdateWebsite = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`http://127.0.0.1:8000/update-websites/${websiteId}/`, 
        { url: websiteUrl,
        verification_file:verificationFile &&  verificationFile?verificationFile.assets[0].file:null,
             verification_method: verificationMethod,
              verification_token: verificationToken }, 
        { headers: { Authorization: `Token ${token}` } }
      );
      Alert.alert('Success', 'Website updated successfully');
      navigation.goBack(); // Go back to Home after updating the website
    } catch (error) {
      console.error('Error updating website:', error);
      Alert.alert('Error', 'Failed to update website');
    }
  };

  const handleDeleteWebsite = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/delete-websites/${websiteId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      Alert.alert('Success', 'Website deleted successfully');
      navigation.goBack(); // Go back to Home after deleting the website
    } catch (error) {
      console.error('Error deleting website:', error);
      Alert.alert('Error', 'Failed to delete website');
    }
  };
    const pickDocument = async () => {
      let result = await DocumentPicker.getDocumentAsync({});
  
        setVerificationFile(result
        );
      
    };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Website</Text>
      
      <TextInput
        style={styles.input}
        value={websiteUrl}
        onChangeText={setWebsiteUrl}
        placeholder="Enter Website URL"
        placeholderTextColor="#888"
        autoCapitalize="none"
      />

      <Text style={styles.subHeader}>Verification Method</Text>
      <View style={styles.segmentContainer}>
        <TouchableOpacity 
          style={[styles.segmentButton, verificationMethod === 'meta' && styles.selectedSegment]} 
          onPress={() => setVerificationMethod('meta')}
        >
          <Text style={styles.segmentText}>Meta Tag</Text>
        </TouchableOpacity>
      
            <TouchableOpacity 
                      style={[styles.segmentButton, verificationMethod === 'file' && styles.selectedSegment]} 
                      onPress={() => setVerificationMethod('file')}
                    >
                      <Text style={styles.segmentText}>File Upload</Text>
                    </TouchableOpacity>
     
      </View>

      {verificationMethod === 'meta' && (
        <TextInput
          style={styles.input}
          value={verificationToken}
          onChangeText={setVerificationToken}
          placeholder="Enter Verification Token"
          placeholderTextColor="#888"
          autoCapitalize="none"
        />
      )}
      
            {verificationMethod === 'file' && (
              <>
                <Button title="Pick Verification File" onPress={pickDocument} />
                {verificationFile && <Text style={styles.fileName}>{verificationFile.assets[0].name}</Text>}
              </>
            )}

      <TouchableOpacity style={styles.button} onPress={handleUpdateWebsite}>
        <Text style={styles.buttonText}>Update Website</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteWebsite}>
        <Text style={styles.buttonText}>Delete Website</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fa', flexGrow: 1 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#343a40', marginBottom: 20, textAlign: 'center' },
  subHeader: { fontSize: 18, color: '#495057', marginBottom: 10 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 20, 
    backgroundColor: '#fff', 
    fontSize: 16 
  },
  segmentContainer: { 
    flexDirection: 'row', 
    marginBottom: 20, 
    justifyContent: 'space-around' 
  },
  segmentButton: { 
    backgroundColor: '#e9ecef', 
    padding: 10, 
    borderRadius: 8, 
    flex: 1, 
    alignItems: 'center' 
  },
  selectedSegment: { backgroundColor: '#007bff' },
  segmentText: { color: '#495057', fontWeight: 'bold' },
  button: { 
    backgroundColor: '#007bff', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10 ,
    marginTop: 20
  },
  deleteButton: { backgroundColor: '#dc3545' },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold', 
  }
});

export default EditWebsiteScreen;
