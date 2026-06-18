import { getPreference } from "@/lib/sync";
import { useAppColors } from '@/lib/theme';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import BottomNav from "../components/BottomNav";
import StepBar from "../components/StepBar";
import { AssessmentResult, DiseaseScore } from "../engine/types";

const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
    low: { label: "Mild — Monitor at home", color: "#10B981" },
    moderate: { label: "Moderate — Consider seeing a doctor", color: "#F59E0B" },
    high: { label: "Serious — See a doctor soon", color: "#EF4444" },
    emergency: { label: "🚨 Emergency — Seek help now", color: "#DC2626" },
};

function getSeverity(confidence: number, isEmergency: boolean) {
    if (isEmergency) return SEVERITY_LABELS.emergency;
    if (confidence >= 0.8) return SEVERITY_LABELS.high;
    if (confidence >= 0.6) return SEVERITY_LABELS.moderate;
    return SEVERITY_LABELS.low;
}

function getStoppedReasonText(reason: AssessmentResult["stoppedReason"]) {
    switch (reason) {
        case "threshold_met":
            return "A confident match was found.";
        case "max_questions":
            return "Maximum questions reached.";
        case "no_more_questions":
            return "All relevant questions were asked.";
    }
}

export default function ResultsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const result = useMemo<AssessmentResult | null>(() => {
        if (!params.result) return null;
        try {
            return JSON.parse(decodeURIComponent(params.result as string));
        } catch {
            return null;
        }
    }, [params.result]);

    const [confidencePref, setConfidencePref] = useState<'strict' | 'normal' | 'possibles'>('normal');
    const colors = useAppColors();

    useEffect(() => {
        let mounted = true;
        (async () => {
            const pref = (await getPreference('confidence')) as 'strict' | 'normal' | 'possibles' | null;
            if (mounted && pref) setConfidencePref(pref);
        })();
        return () => { mounted = false; };
    }, []);

    const handleBottomNav = (key: string) => {
        if (key === "calendar") router.push("/pill_sched");
    };

    if (!result) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
                <View style={styles.errorWrapper}>
                    <Text style={[styles.errorText, { color: colors.text }]}>No results found.</Text>
                    <TouchableOpacity onPress={() => router.push("/page1")}>
                        <Text style={[styles.retryText, { color: colors.primary }]}>Start Over</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const threshold = confidencePref === 'strict' ? 0.8 : confidencePref === 'normal' ? 0.6 : 0.5;
    const filteredMatches = result.topMatches.filter((m) => m.confidence >= threshold);
    const top = filteredMatches[0] ?? result.topMatches[0];
    const severity = getSeverity(top?.confidence ?? 0, result.isEmergency);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <View style={styles.topSection}>
                <StepBar step={3} total={3} />
                <Text style={[styles.title, { color: colors.text }]}>ASSESSMENT{"\n"}COMPLETE</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>
                    {getStoppedReasonText(result.stoppedReason)}{" "}
                    {result.totalQuestionsAsked} question
                    {result.totalQuestionsAsked !== 1 ? "s" : ""} asked.
                </Text>
            </View>

            {/* Emergency Banner */}
            {result.isEmergency && (
                <View style={styles.emergencyBanner}>
                    <Text style={styles.emergencyText}>
                        🚨 Please seek emergency medical attention immediately.
                    </Text>
                </View>
            )}

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Severity indicator */}
                <View style={[styles.severityCard, { borderColor: severity.color, backgroundColor: colors.elementBg }]}>
                    <Text style={[styles.severityText, { color: severity.color }]}>
                        {severity.label}
                    </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>POSSIBLE CONDITIONS</Text>
                <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
                    ⚠️ This is not a medical diagnosis. Always consult a healthcare
                    professional.
                </Text>

                {filteredMatches.length === 0 && (
                    <Text style={{ color: colors.textMuted, marginVertical: 8 }}>No conditions meet the selected confidence threshold.</Text>
                )}

                {filteredMatches.map((match: DiseaseScore, index: number) => (
                    <View key={match.disease} style={[styles.conditionCard, { borderColor: colors.textMuted }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.rankBadge, { backgroundColor: colors.primary }]}>
                                <Text style={[styles.rankText, { color: colors.white }]}>#{index + 1}</Text>
                            </View>
                            <Text style={[styles.diseaseName, { color: colors.text }]}>{match.disease}</Text>
                            <Text style={[styles.matchPercentage, { color: colors.primary }]}>
                                {Math.round(match.confidence * 100)}%
                            </Text>
                        </View>

                        {/* Confidence bar */}
                        <View style={styles.barTrack}>
                            <View
                                style={[
                                    styles.barFill,
                                    {
                                        width: `${Math.round(match.confidence * 100)}%`,
                                        backgroundColor:
                                            index === 0 ? colors.primary : colors.border,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                {/* Find clinic — show if moderate or above */}
                {(top?.confidence ?? 0) >= 0.6 && (
                    <TouchableOpacity
                        style={[styles.clinicBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                        onPress={() => router.push("/map")}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.clinicBtnText, { color: colors.white }]}>📍 Find Nearest Clinic</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => router.push("/page1")}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.retryBtnText, { color: colors.white }]}>Start New Assessment</Text>
                </TouchableOpacity>
            </View>

            <BottomNav onNavigate={handleBottomNav} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    errorWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    errorText: { fontSize: 16 },
    retryText: { fontSize: 14, fontWeight: "700" },

    topSection: {
        paddingHorizontal: 22,
        paddingTop: 10,
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: "900",
        lineHeight: 34,
        marginTop: 12,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18,
    },

    emergencyBanner: {
        marginHorizontal: 22,
        backgroundColor: "#FEE2E2",
        borderRadius: 10,
        padding: 12,
        marginBottom: 4,
    },
    emergencyText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#DC2626",
        textAlign: "center",
    },

    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 22,
        paddingTop: 8,
        paddingBottom: 16,
    },

    severityCard: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        alignItems: "center",
    },
    severityText: {
        fontSize: 15,
        fontWeight: "800",
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "900",
        marginBottom: 6,
    },
    disclaimer: {
        fontSize: 12,
        color: "#6B7280",
        lineHeight: 17,
        marginBottom: 14,
    },

    conditionCard: {
        borderWidth: 2,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    rankText: { fontSize: 12, fontWeight: "900" },
    diseaseName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "900",
    },
    matchPercentage: {
        fontSize: 14,
        fontWeight: "700",
    },
    barTrack: {
        height: 6,
        backgroundColor: "#F3F4F6",
        borderRadius: 3,
        overflow: "hidden",
    },
    barFill: {
        height: 6,
        borderRadius: 3,
    },

    footer: {
        paddingHorizontal: 22,
        paddingTop: 10,
        paddingBottom: 10,
        gap: 10,
    },
    clinicBtn: {
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 5,
    },
    clinicBtnText: {
        fontSize: 16,
        fontWeight: "800",
    },
    retryBtn: {
        backgroundColor: "#6B7280",
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
    },
    retryBtnText: {
        fontSize: 16,
        fontWeight: "800",
    },
});
