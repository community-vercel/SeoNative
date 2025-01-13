import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL,SERVER_URL} from "@env"
import { Platform } from 'react-native';


export default function WebsiteManagementScreen() {
  const [websites, setWebsites] = useState([]);
  const [newWebsite, setNewWebsite] = useState('');
  const apiUrl = Platform.OS === 'android' ? API_URL : SERVER_URL;

  useEffect(() => {
    const fetchWebsites = async () => {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${apiUrl} /api/websites/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWebsites(response.data);
    };
    fetchWebsites();
  }, []);

  const addWebsite = async () => {
    const token = await AsyncStorage.getItem('token');
    await axios.post(
      `${apiUrl} /api/websites/`,
      { url: newWebsite },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNewWebsite('');
    fetchWebsites();
  };

  return (
    <View>
      <TextInput placeholder="Add Website" value={newWebsite} onChangeText={setNewWebsite} />
      <Button title="Add" onPress={addWebsite} />
      <FlatList
        data={websites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text>{item.url}</Text>}
      />
    </View>
  );
}
