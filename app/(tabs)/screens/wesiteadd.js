import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Button, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import {API_URL,SERVER_URL} from "@env"
import { Platform } from 'react-native';


const AddWebsiteScreen = ({ navigation }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('meta');
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationFile, setVerificationFile] = useState(null);
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

  // Handle adding website
  const handleAddWebsite = async () => {
    try {
      const formData = new FormData();
      formData.append('url', websiteUrl);
      formData.append('verification_method', verificationMethod);
      const token = await AsyncStorage.getItem('token');  // Fetch token from AsyncStorage
      if (!token) {
        console.log('Token is not available');
        return;
      }
      // Append the file if the user selected file verification method
      if (verificationMethod === 'file' && verificationFile) {
        console.log("verificationFile", verificationFile)
        formData.append('verification_file', verificationFile.assets[0].file);
      ;
      } else {
        formData.append('verification_token', verificationToken);
      }

      // Send the form data with the file to the backend API
      const response = await axios.post(
        `${apiUrl}/add-websites/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log(response.config.headers);

      Alert.alert('Success', 'Website added successfully');
      navigation.navigate('home'); // Navigate directly to the 'Home' screen
    } catch (error) {
      console.error('Error adding website:', error);
      Alert.alert('Error', 'Failed to add website');
    }
  };

  // File picker for document selection
  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});

      setVerificationFile(result
      );
    
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Website</Text>
      
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

      <TouchableOpacity style={styles.button} onPress={handleAddWebsite}>
        <Text style={styles.buttonText}>Add Website</Text>
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
  fileName: { color: '#28a745', marginTop: 5 },
  button: { 
    backgroundColor: '#007bff', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10 ,
    marginTop: 20
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold', 
  }
});

export default AddWebsiteScreen;