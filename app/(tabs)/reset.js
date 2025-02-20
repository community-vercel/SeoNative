import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { API_URL, SERVER_URL } from '@env';
import { Platform } from 'react-native';

const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

const ResetPasswordScreen = ({ route, navigation }) => {
  const { uid, token } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/password-reset-confirm/${uid}/${token}/`,
        { password }
      );
      Alert.alert('Success', 'Password has been reset');
      navigation.navigate('login');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reset Your Password</Text>
      <TextInput
        secureTextEntry
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button title="Reset Password" onPress={handleReset} color="#1e90ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingLeft: 12,
  },
});

export default ResetPasswordScreen;