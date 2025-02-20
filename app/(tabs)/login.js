import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL,SERVER_URL} from "@env"
const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

export default function LoginScreen({navigation}) {
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
console.log("Env",API_URL)

const handleLogin = async () => {
  try {
    const response = await axios.post(`${apiUrl}/login/`, {
      username,
      password,
    }, {         
      withCredentials: true
    });
console.log("data",response.data);
    await AsyncStorage.setItem('token', response.data.token);
    navigation.navigate('home');
    
    Toast.show({
      type: 'success',
      text1: 'Login Successful',
      text2: `Welcome back, ${username}! 🎉`,
    });

  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Login Failed',
      text2: 'Invalid username or password. Please try again.',
    });
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Login</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} color="#1e90ff" />
      
      <Text style={styles.footerText}>
        Don't have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('register' )}>
          Register
        </Text>
      </Text>
      <Text style={styles.footerText}>
        Forgot Password?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('forgot')}>
          Reset
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingLeft: 12,
    backgroundColor: '#fff',
  },
  footerText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#777',
  },
  link: {
    color: '#1e90ff',
    fontWeight: 'bold',
  },
});