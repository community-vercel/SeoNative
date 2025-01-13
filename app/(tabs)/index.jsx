import LoginScreen from './screens/login';
import WebsiteManagementScreen from './screens/website';
import EditWebsiteScreen from './screens/editWebsite';
import RegisterScreen from './screens/register';
import WebCrawlingScreen from './screens/webCrawling';
import SeoAuditScreen from './screens/seoAudit';
import CrawlHistoryScreen from './screens/crawlHistory';
import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AddWebsiteScreen from './screens/wesiteadd';
import HomePage from './screens/addwe';
import LighthouseReportsScreen from './screens/seoDash';

const Stack = createStackNavigator();

export default function App() {
  return (

      <Stack.Navigator initialRouteName="login">
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

      </Stack.Navigator>
  );
}