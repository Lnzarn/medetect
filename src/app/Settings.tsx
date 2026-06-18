import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth";
import { useAppColors, useTheme } from "@/lib/theme";

import arrowIcon from "../icons/arrow.png";
import logoutIcon from "../icons/logout.png";
import referencesIcon from "../icons/references.png";
import settingsProfileIcon from "../icons/settings_profile.png";

import {
  canSync,
  getLastSynced,
  getPreference,
  setPreference,
  syncAll,
} from "@/lib/sync";
import BottomNav from "../components/BottomNav";

type SyncInterval = "12h" | "24h" | "72h" | "168h" | "720h";

const SYNC_INTERVAL_OPTIONS: { value: SyncInterval; label: string }[] = [
  { value: "12h", label: "Every 12 hours" },
  { value: "24h", label: "Every 24 hours" },
  { value: "72h", label: "Every 3 days" },
  { value: "168h", label: "Every week" },
  { value: "720h", label: "Every month" },
];

const MenuItem = ({
  icon,
  text,
  onPress,
  isDestructive = false,
  hideBorder = false,
}: {
  icon?: any;
  text: string;
  onPress?: () => void;
  isDestructive?: boolean;
  hideBorder?: boolean;
}) => {
  const colors = useAppColors();
  const textColor = isDestructive ? "#FF3B30" : colors.text;

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        hideBorder && {
          borderBottomWidth: 0,
          borderBottomColor: "transparent",
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      {icon && (
        <View style={styles.menuIconWrap}>
          <Image source={icon} style={styles.menuIconImg} />
        </View>
      )}

      <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>

      {!isDestructive && onPress && (
        <Image source={arrowIcon} style={styles.arrowImg} />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsPage() {
  const router = useRouter();
  const colors = useAppColors();
  const { isDark, setDark } = useTheme();
  const { signOut, isGuest, session } = useAuth();

  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [canDoSync, setCanDoSync] = useState(true);
  const [syncIntervalHours, setSyncIntervalHours] = useState<number>(24);
  const [confidence, setConfidence] = useState<
    "strict" | "normal" | "possibles"
  >("normal");
  const [syncInterval, setSyncInterval] = useState<SyncInterval>("24h");

  useEffect(() => {
    async function load() {
      const last = await getLastSynced();
      setLastSynced(last);
      const syncOk = await canSync();
      setCanDoSync(syncOk.can);
      setSyncIntervalHours(syncOk.intervalHours);

      const pref = (await getPreference("confidence")) as
        | "strict"
        | "normal"
        | "possibles"
        | null;
      if (pref) setConfidence(pref);

      const interval = (await getPreference(
        "sync_interval",
      )) as SyncInterval | null;
      if (interval) setSyncInterval(interval);
    }
    load();
  }, []);

  const handleSync = async () => {
    if (syncing) return;
    try {
      const ok = await canSync();
      if (!ok.can) {
        const intervalLabel =
          SYNC_INTERVAL_OPTIONS.find((o) => o.value === syncInterval)?.label ??
          "every 24 hours";
        Alert.alert(
          "Sync blocked",
          `Last sync was: ${ok.lastSynced ?? "unknown"}.\nYou can sync ${intervalLabel.toLowerCase()}.`,
        );
        return;
      }
      setSyncing(true);
      await syncAll(session?.user?.id ?? "", false);
      const last = await getLastSynced();
      setLastSynced(last);
      const syncOk = await canSync();
      setCanDoSync(syncOk.can);
      setSyncIntervalHours(syncOk.intervalHours);
      Alert.alert("Sync complete", "Disease database updated successfully.");
    } catch (e) {
      console.error(e);
      Alert.alert("Sync failed", "An error occurred while syncing.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSetConfidence = async (
    val: "strict" | "normal" | "possibles",
  ) => {
    setConfidence(val);
    await setPreference("confidence", val);
  };

  const handleSetSyncInterval = async (val: SyncInterval) => {
    setSyncInterval(val);
    await setPreference("sync_interval", val);
    const syncOk = await canSync();
    setCanDoSync(syncOk.can);
    setSyncIntervalHours(syncOk.intervalHours);
  };

  const handleLogout = () => {
    Alert.alert(
      isGuest ? "Leave guest session?" : "Log out?",
      isGuest
        ? "You will be taken back to the login screen."
        : "You will be logged out and taken to the login screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isGuest ? "Leave" : "Log Out",
          style: "destructive",
          onPress: () => {
            setTimeout(() => signOut(), 100);
          },
        },
      ],
    );
  };

  const nextSyncLabel = (() => {
    if (!lastSynced) return "Never synced";
    const next = new Date(
      new Date(lastSynced).getTime() + syncIntervalHours * 60 * 60 * 1000,
    );
    return `Next sync: ${next.toLocaleString()}`;
  })();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: colors.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          SETTINGS
        </Text>

        {isGuest && (
          <View
            style={[
              styles.guestBanner,
              {
                backgroundColor: colors.primary + "18",
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.guestBannerText, { color: colors.primary }]}>
              You're browsing as a guest. Log in to access all features.
            </Text>
            <TouchableOpacity onPress={() => signOut()}>
              <Text style={[styles.guestBannerLink, { color: colors.primary }]}>
                Log In →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.menuGroup}>
          <View
            style={[
              styles.menuItem,
              { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text
              style={[styles.menuText, { fontSize: 16, color: colors.text }]}
            >
              Dark Mode
            </Text>
            <Switch value={isDark} onValueChange={setDark} />
          </View>

          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <Text
              style={[styles.menuText, { fontSize: 16, color: colors.text }]}
            >
              Confidence Level
            </Text>
          </View>
          <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
            Strict asks more questions and needs a stronger match before
            concluding. Possibles wraps up sooner with broader results.
          </Text>

          <View
            style={[
              styles.menuItem,
              {
                borderBottomWidth: 1,
                justifyContent: "flex-start",
                borderBottomColor: colors.border,
              },
            ]}
          >
            {(
              [
                { val: "strict", label: "Strict" },
                { val: "normal", label: "Normal" },
                { val: "possibles", label: "Possibles" },
              ] as const
            ).map(({ val, label }, i) => (
              <TouchableOpacity
                key={val}
                onPress={() => handleSetConfidence(val)}
                style={[
                  styles.radioBtn,
                  i > 0 && { marginLeft: 18 },
                  { paddingVertical: 8, paddingHorizontal: 6 },
                ]}
              >
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: colors.border },
                    confidence === val && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                />
                <Text style={[styles.radioLabel, { color: colors.text }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <Text
              style={[styles.menuText, { fontSize: 16, color: colors.text }]}
            >
              Auto-Sync Interval
            </Text>
          </View>
          <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
            How often the disease database is automatically refreshed in the
            background.
          </Text>

          <View
            style={[
              styles.intervalGrid,
              {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                paddingBottom: 16,
              },
            ]}
          >
            {SYNC_INTERVAL_OPTIONS.map(({ value, label }) => {
              const active = syncInterval === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleSetSyncInterval(value)}
                  style={[
                    styles.intervalChip,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active
                        ? colors.primary + "18"
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.intervalChipText,
                      { color: active ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!isGuest && (
            <MenuItem
              icon={settingsProfileIcon}
              text="Update Account"
              onPress={() => router.push("/AccountPage")}
            />
          )}

          <MenuItem
            icon={referencesIcon}
            text="References"
            onPress={() => console.log("Go to References")}
            hideBorder={false}
          />

          <View
            style={{
              paddingVertical: 18,
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={handleSync}
              disabled={!canDoSync || syncing}
              style={[
                styles.syncBtn,
                { backgroundColor: colors.primary },
                !canDoSync && styles.syncBtnDisabled,
              ]}
              activeOpacity={0.85}
            >
              {syncing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.syncBtnText, { color: colors.white }]}>
                  Sync disease database
                </Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.lastSyncText, { color: colors.textMuted }]}>
              Last sync:{" "}
              {lastSynced ? new Date(lastSynced).toLocaleString() : "Never"}
            </Text>
            {lastSynced && (
              <Text style={[styles.lastSyncText, { color: colors.textMuted }]}>
                {nextSyncLabel}
              </Text>
            )}
          </View>

          <MenuItem
            icon={logoutIcon}
            text={isGuest ? "Leave guest session" : "Log out"}
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
  safeArea: { flex: 1 },
  content: {
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 40,
  },
  guestBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 6,
  },
  guestBannerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  guestBannerLink: {
    fontSize: 13,
    fontWeight: "700",
  },
  menuGroup: {
    marginBottom: 32,
    backgroundColor: "transparent",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuIconWrap: {
    width: 24,
    height: 24,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconImg: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  sectionHint: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 17,
  },
  radioBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  radioLabel: { fontSize: 13 },
  intervalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 4,
  },
  intervalChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  intervalChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  syncBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  syncBtnDisabled: { opacity: 0.5 },
  syncBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  lastSyncText: {
    marginTop: 4,
    fontSize: 13,
  },
  arrowImg: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    marginLeft: 8,
  },
});
