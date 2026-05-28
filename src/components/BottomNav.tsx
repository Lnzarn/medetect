import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../constants/colors";

interface BottomNavProps {
  onNavigate?: (key: string) => void;
}

const TABS = [
  { key: "profile", icon: "🪪" },
  { key: "calendar", icon: "📅" },
  { key: "add", icon: "📋", center: true },
  { key: "navigation", icon: "➤" },
  { key: "settings", icon: "⚙️" },
];

export default function BottomNav({ onNavigate }: BottomNavProps) {
  return (
    <View style={styles.navBar}>
      {TABS.map((tab) =>
        tab.center ? (
          <View key={tab.key} style={styles.navItemCenter}>
            <TouchableOpacity
              style={styles.navCenterBtn}
              onPress={() => onNavigate?.(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.navCenterIcon}>📋</Text>
              <View style={styles.navPlusBadge}>
                <Text style={styles.navPlusText}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => onNavigate?.(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
          </TouchableOpacity>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 70,
    backgroundColor: Colors.navBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: Platform.OS === "ios" ? 8 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  navIcon: {
    fontSize: 20,
    color: Colors.white,
  },
  navItemCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26,
  },
  navCenterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },
  navCenterIcon: {
    fontSize: 22,
  },
  navPlusBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  navPlusText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: "900",
    lineHeight: 14,
  },
});
