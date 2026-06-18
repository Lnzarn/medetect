import BottomNav from "@/components/BottomNav";
import { CLUSTERS } from "@/engine/clusters";
import { getAllDiseases } from "@/lib/sync";
import { useAppColors } from "@/lib/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ALL_KEY = "__all__";

function getClusterForDisease(disease: string): {
  label: string;
  emoji: string;
  key: string;
} {
  for (const cluster of CLUSTERS) {
    if (cluster.key === "general") continue;
    if (cluster.diseases.includes(disease)) {
      return {
        label: cluster.label,
        emoji: cluster.emoji ?? "🏥",
        key: cluster.key,
      };
    }
  }
  return { label: "General", emoji: "❓", key: "general" };
}

export default function DiseaseDirectory() {
  const router = useRouter();
  const colors = useAppColors();

  const [diseases, setDiseases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<string>(ALL_KEY);

  useEffect(() => {
    let mounted = true;
    getAllDiseases()
      .then((d) => {
        if (mounted) setDiseases(d);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const clusterTabs = useMemo(() => {
    const used = new Set<string>();
    diseases.forEach((d) => {
      const c = getClusterForDisease(d);
      used.add(c.key);
    });
    const tabs = [{ key: ALL_KEY, label: "All", emoji: "📋" }];
    CLUSTERS.forEach((c) => {
      if (used.has(c.key)) {
        tabs.push({ key: c.key, label: c.label, emoji: c.emoji ?? "🏥" });
      }
    });
    return tabs;
  }, [diseases]);

  const filtered = useMemo(() => {
    if (selectedCluster === ALL_KEY) return diseases;
    return diseases.filter(
      (d) => getClusterForDisease(d).key === selectedCluster,
    );
  }, [diseases, selectedCluster]);

  const isDark = colors.text === "#FFFFFF";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Disease Directory</Text>
        <Text style={styles.headerSub}>
          {loading ? "Loading..." : `${diseases.length} diseases available`}
        </Text>
      </View>

      {!loading && (
        <View
          style={[styles.filterWrapper, { backgroundColor: colors.background }]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {clusterTabs.map((tab) => {
              const active = selectedCluster === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setSelectedCluster(tab.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.elementBg,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipEmoji}>{tab.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: active ? "#FFFFFF" : colors.textMuted },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading diseases...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No diseases found in this category.
            </Text>
          ) : (
            filtered.map((disease) => {
              const cluster = getClusterForDisease(disease);
              return (
                <TouchableOpacity
                  key={disease}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/DiseaseDetail",
                      params: { disease },
                    })
                  }
                  activeOpacity={0.75}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardEmoji}>{cluster.emoji}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {disease}
                    </Text>
                    <Text
                      style={[styles.cardCluster, { color: colors.textMuted }]}
                    >
                      {cluster.label}
                    </Text>
                  </View>
                  <Text
                    style={[styles.cardChevron, { color: colors.textMuted }]}
                  >
                    ›
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  filterWrapper: {
    paddingTop: 14,
    paddingBottom: 6,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardLeft: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(26,63,139,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  cardCluster: {
    fontSize: 12,
    marginTop: 2,
  },
  cardChevron: {
    fontSize: 22,
    fontWeight: "300",
    marginLeft: 8,
  },
});
