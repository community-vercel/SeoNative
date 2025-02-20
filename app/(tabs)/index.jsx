import LoginScreen from './login';
import WebsiteManagementScreen from './website';
import EditWebsiteScreen from './editWebsite';
import RegisterScreen from './register';
import WebCrawlingScreen from './webCrawling';
import SeoAuditScreen from './seoAudit';
import CrawlHistoryScreen from './crawlHistory';
import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AddWebsiteScreen from './wesiteadd';
import HomePage from './addwe';
import LighthouseReportsScreen from './seoDash';
import Toast from 'react-native-toast-message';
import ForgotPasswordScreen from './forgot';
import ResetPasswordScreen from './reset';
import * as Linking from 'expo-linking';


const Stack = createStackNavigator();
const linking = {
  prefixes: ['http://localhost:8081', 'myapp://'],
  config: {

    screens: {
      ForgotPasswordScreen: 'forgot', // Ensure the screen name matches
      ResetPassword: 'reset/:uid/:token',
      // other routes
    },


  },
  
};
export default function App() {

  return (

      <Stack.Navigator initialRouteName="login" linking={linking}>
        <Stack.Screen name="home" component={HomePage} />
        <Stack.Screen name="AddWebsite" component={AddWebsiteScreen} />
        <Stack.Screen name="Edit" component={EditWebsiteScreen} />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="register" component={RegisterScreen} />
        <Stack.Screen name="Website Management" component={WebsiteManagementScreen} />
        <Stack.Screen name="crawl" component={WebCrawlingScreen} />
        <Stack.Screen name="SeoAudit" component={SeoAuditScreen} />
        <Stack.Screen name="CrawlHistory" component={CrawlHistoryScreen} />
        <Stack.Screen name="SeoDash" component={LighthouseReportsScreen} />
        <Stack.Screen name="forgot" component={ForgotPasswordScreen} />
        <Stack.Screen name="reset" component={ResetPasswordScreen} />


      </Stack.Navigator>
  );
}