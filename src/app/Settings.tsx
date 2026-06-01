import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import logoutIcon from "../icons/logout.png";
import referencesIcon from "../icons/references.png";
import settingsProfileIcon from "../icons/settings_profile.png";
import arrowIcon from "../icons/arrow.png";

import BottomNav from "../components/BottomNav";

const MenuItem = ({
  icon,
  text,
  onPress,
  isDestructive = false,
  hideBorder = false,
}: {
  icon: any;
  text: string;
  onPress: () => void;
  isDestructive?: boolean;
  hideBorder?: boolean;
}) => {
  const textColor = isDestructive ? '#FF3B30' : '#1C1C1E';

  return (
    <TouchableOpacity
      style={[styles.menuItem, hideBorder && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.menuIconWrap}>
        <Image source={icon} style={styles.menuIconImg} />
      </View>

      <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
      
      {!isDestructive && <Image source={arrowIcon} style={styles.arrowImg} />}
    </TouchableOpacity>
  );
};

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = () => {
    console.log('Logging out...');
    router.replace('/LogInPage');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>SETTINGS</Text>

        <View style={styles.menuGroup}>
          <MenuItem
            icon={settingsProfileIcon}
            text="Update Account"
            onPress={() => router.push('/AccountPage')}
          />
          <MenuItem
            icon={referencesIcon}
            text="References"
            onPress={() => console.log('Go to References')}
            hideBorder={true}
          />
        </View>

        <View style={styles.menuGroup}>
          <MenuItem
            icon={logoutIcon}
            text="Log out"
            onPress={handleLogout}
            isDestructive={true}
            hideBorder={true}
          />
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#000000',
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  menuGroup: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconWrap: {
    width: 24,
    height: 24,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconImg: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  arrowImg: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginLeft: 8,
  },
});