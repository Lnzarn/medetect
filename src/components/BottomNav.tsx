import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import addIco from "../icons/add.png";
import calendarIco from "../icons/calendar.png";
import navigationIco from "../icons/navigation.png";
import profileIco from "../icons/profile.png";
import settingsIco from "../icons/settings.png";

interface BottomNavProps {
  onNavigate?: (key: string) => void;
}

export default function BottomNav({ onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("calendar");


  const tabs = [
    { key: "profile", label: "Profile", icon: profileIco },
    { key: "calendar", label: "Pill Schedule", icon: calendarIco },
    { key: "add", label: "Consult", icon: addIco, center: true },
    { key: "navigation", label: "Map", icon: navigationIco },
    { key: "settings", label: "Settings", icon: settingsIco },
  ];

  const handleTabPress = (key: string) => {
    setActiveTab(key);
    onNavigate?.(key);

    switch (key) {
      case "profile":
        router.push("/AccountPage");
        break;

      case "calendar":
        router.push("/pill_sched");
        break;

      case "add":
        router.push("/page1");
        break;

      case "navigation":
        // router.push("/MapPage");
        break;

      case "settings":
        router.push("/Settings");
        break;

      default:
        break;
    }
  };

  return (
    <View
      style={[
        styles.bottomNavContainer,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <View style={styles.bottomNavBar}>
        {tabs.map((tab) =>
          tab.center ? (
            <View key={tab.key} style={styles.centerContainer}>
              <TouchableOpacity
                style={styles.fabButton}
                onPress={() => handleTabPress(tab.key)}
                activeOpacity={0.85}
              >
                <Image source={tab.icon} style={styles.fabIcon} />
              </TouchableOpacity>

              <Text style={[styles.centerLabel, activeTab === tab.key && styles.centerActiveLabel]}>
                {tab.label}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  activeTab === tab.key && styles.activeIconContainer,
                ]}
              >
                <Image
                  source={tab.icon}
                  style={[
                    styles.navIcon,
                    activeTab === tab.key && styles.activeNavIcon,
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.label,
                  activeTab === tab.key && styles.activeLabel,
                ]}
              >
                {tab.label}
              </Text>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },

  bottomNavBar: {
    height: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },

  iconContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },

  activeIconContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  navIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    tintColor: "#FFFFFF",
  },

  activeNavIcon: {
    tintColor: "#FFFFFF",
  },

  label: {
    marginTop: 4,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },

  activeLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -38,
  },

  fabButton: {
    width: 68,
    height: 68,
    borderRadius: 34,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 4,
    borderColor: "#1A3F8B",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },

  fabIcon: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },

  centerLabel: {
    marginTop: 2,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },

  centerActiveLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
