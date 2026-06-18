import { useAuth } from "@/lib/auth";
import { useAppColors } from "@/lib/theme";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import addIco from "../icons/add.png";
import calendarIco from "../icons/calendar.png";
import profileIco from "../icons/profile.png";
import referencesIco from "../icons/references.png";
import settingsIco from "../icons/settings.png";

interface BottomNavProps {
  onNavigate?: (key: string) => void;
}

export default function BottomNav({ onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const colors = useAppColors();
  const { isGuest } = useAuth();

  const [activeTab, setActiveTab] = useState("add");

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/AccountPage")) setActiveTab("profile");
    else if (pathname.startsWith("/pill_sched")) setActiveTab("calendar");
    else if (pathname.startsWith("/page1")) setActiveTab("add");
    else if (pathname.startsWith("/DiseaseDirectory"))
      setActiveTab("directory");
    else if (pathname.startsWith("/Settings")) setActiveTab("settings");
  }, [pathname]);

  const allTabs = [
    { key: "profile", label: "Profile", icon: profileIco, guestAllowed: false },
    {
      key: "calendar",
      label: "Pill Schedule",
      icon: calendarIco,
      guestAllowed: false,
    },
    {
      key: "add",
      label: "Consult",
      icon: addIco,
      center: true,
      guestAllowed: true,
    },
    {
      key: "directory",
      label: "Directory",
      icon: referencesIco,
      guestAllowed: true,
    },
    {
      key: "settings",
      label: "Settings",
      icon: settingsIco,
      guestAllowed: true,
    },
  ];

  const tabs = isGuest ? allTabs.filter((t) => t.guestAllowed) : allTabs;

  const handleTabPress = (key: string) => {
    const tab = allTabs.find((t) => t.key === key);

    if (isGuest && !tab?.guestAllowed) {
      Alert.alert("Log in required", "Please log in to access this feature.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log In", onPress: () => router.replace("/LogInPage") },
      ]);
      return;
    }

    setActiveTab(key);

    onNavigate?.(key);

    const path = pathname;
    const target =
      key === "profile"
        ? "/AccountPage"
        : key === "calendar"
          ? "/pill_sched"
          : key === "add"
            ? "/page1"
            : key === "directory"
              ? "/DiseaseDirectory"
              : key === "settings"
                ? "/Settings"
                : null;

    if (!target) return;
    if (path && path.startsWith(target)) return;

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
      case "directory":
        router.push("/DiseaseDirectory");
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
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.navBg,
        },
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

              <Text
                style={[
                  styles.centerLabel,
                  activeTab === tab.key && styles.centerActiveLabel,
                  { color: colors.white },
                ]}
              >
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
                    { tintColor: colors.white },
                    activeTab === tab.key && styles.activeNavIcon,
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.label,
                  activeTab === tab.key && styles.activeLabel,
                  {
                    color:
                      activeTab === tab.key
                        ? colors.white
                        : "rgba(255,255,255,0.75)",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ),
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
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
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
    paddingHorizontal: 10,
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
    fontSize: 10,
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
    shadowOffset: { width: 0, height: 6 },
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
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  centerActiveLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
