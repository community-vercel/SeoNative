import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_URL, SERVER_URL } from "@env";
import { Platform } from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

  const handlePasswordReset = async () => {
    try {
      const response = await axios.post(`${apiUrl}/password-reset/`, { email });
      Toast.show({
        type: 'success',
        text1: 'Check your email',
        text2: response.data.message,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: error.response?.data?.error || 'Something went wrong!',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forgot Password</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        style={styles.input}
        keyboardType="email-address"
      />
      <Button title="Reset Password" onPress={handlePasswordReset} color="#007bff" />
      <Text style={styles.footerText} onPress={() => navigation.goBack()}>
        Back to Login
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    height: 45,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 12,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  footerText: { marginTop: 20, textAlign: 'center', color: '#007bff' },
});

export default ForgotPasswordScreen;