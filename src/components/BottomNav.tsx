import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Assuming these paths are correct relative to where you saved the code originally.
// If this file is in a different folder now, adjust these imports!
import profileIco from "../icons/profile.png";
import calendarIco from "../icons/calendar.png";
import addIco from "../icons/add.png";
import navigationIco from "../icons/navigation.png";
import settingsIco from "../icons/settings.png";

export default function BottomNav({ onNavigate }: { onNavigate?: (key: string) => void }) {
  const insets = useSafeAreaInsets();
  
  const tabs = [
    { key: "profile", icon: profileIco },
    { key: "calendar", icon: calendarIco },
    { key: "add", icon: addIco, center: true },
    { key: "navigation", icon: navigationIco },
    { key: "settings", icon: settingsIco },
  ];

  return (
    <View style={[styles.bottomNavContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bottomNavBar}>
        {tabs.map((tab) =>
          tab.center ? (
            <View key={tab.key} style={styles.bottomNavItemCenter}>
              <TouchableOpacity
                style={styles.bottomNavCenterBtn}
                onPress={() => onNavigate?.(tab.key)}
                activeOpacity={0.8}
              >
                <Image source={tab.icon} style={styles.bottomNavCenterIconImg} />
                <View style={styles.bottomNavPlusBadge}>
                  <Text style={styles.bottomNavPlusText}>+</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              key={tab.key}
              style={styles.bottomNavItem}
              onPress={() => onNavigate?.(tab.key)}
              activeOpacity={0.7}
            >
               <Image source={tab.icon} style={styles.bottomNavIconImg} />
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    backgroundColor: "#1A3F8B",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
  },
  bottomNavBar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  bottomNavIconImg: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    tintColor: "#FFFFFF" 
  },
  bottomNavItemCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -32,
  },
  bottomNavCenterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },
  bottomNavCenterIconImg: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  bottomNavPlusBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1A3F8B",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavPlusText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "900",
    lineHeight: 14,
  },
});