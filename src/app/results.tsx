import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BottomNav from '../components/BottomNav';
import StepBar from '../components/StepBar';
import Colors from '../constants/colors';
import { getAllDiseaseSymptoms } from '../lib/sync';

interface DiseaseMatch {
    disease: string;
    matchPercentage: number;
    description: string;
}

export default function ResultsPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [conditions, setConditions] = useState<DiseaseMatch[]>([]);
    const [loading, setLoading] = useState(true);

    const selected = React.useMemo(() => {
        if (!params.selected) return [] as string[];
        try {
            return JSON.parse(decodeURIComponent(params.selected as string)) as string[];
        } catch {
            return [] as string[];
        }
    }, [params.selected]);

    useEffect(() => {
        const fetchMatchingDiseases = async () => {
            try {
                const diseaseSymptoms = await getAllDiseaseSymptoms();

                // Calculate match percentage for each disease
                const matches: DiseaseMatch[] = [];

                for (const disease in diseaseSymptoms) {
                    const symptoms = diseaseSymptoms[disease];
                    let totalProb = 0;
                    let matchCount = 0;

                    for (const symptom of selected) {
                        if (symptoms[symptom]) {
                            totalProb += symptoms[symptom];
                            matchCount += 1;
                        }
                    }

                    const matchPercentage = selected.length > 0
                        ? Math.round((matchCount / selected.length) * 100)
                        : 0;

                    if (matchPercentage > 0) {
                        matches.push({
                            disease,
                            matchPercentage,
                            description: `Condition matching ${matchCount} of your selected symptoms.`,
                        });
                    }
                }

                // Sort by match percentage descending
                matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

                // Take top 10 matches
                setConditions(matches.slice(0, 10));
            } catch (error) {
                console.error('Error fetching diseases:', error);
                setConditions([]);
            } finally {
                setLoading(false);
            }
        };

        if (selected.length > 0) {
            fetchMatchingDiseases();
        } else {
            setLoading(false);
        }
    }, [selected]);

    const handleYesClick = () => {
        alert('Assessment confirmed as exact match');
    };

    const handleNoneClick = () => {
        alert('Starting new assessment');
    };

    const handleBottomNav = (key: string) => {
        // Bottom nav handles routing
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

            <View style={styles.topSection}>
                <StepBar step={3} total={3} />
                <Text style={styles.title}>ASSESSMENT{'\n'}COMPLETE</Text>
                <Text style={styles.subtitle}>Based on your selected symptoms, here are the top matches.</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.sectionTitle}>POSSIBLE CONDITIONS</Text>

                {loading ? (
                    <Text style={styles.loadingText}>Loading results...</Text>
                ) : conditions.length === 0 ? (
                    <Text style={styles.emptyText}>No matching conditions found.</Text>
                ) : (
                    conditions.map((condition) => (
                        <View key={condition.disease} style={styles.conditionCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.diseaseName}>{condition.disease}</Text>
                                <Text style={styles.matchPercentage}>{condition.matchPercentage}% Match</Text>
                            </View>
                            <Text style={styles.description}>{condition.description}</Text>
                        </View>
                    ))
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.yesBtn}
                    onPress={handleYesClick}
                    activeOpacity={0.85}
                >
                    <Text style={styles.yesBtnText}>Yes, this is an exact match</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.noneBtn}
                    onPress={handleNoneClick}
                    activeOpacity={0.85}
                >
                    <Text style={styles.noneBtnText}>None of these matches</Text>
                </TouchableOpacity>
            </View>

            <BottomNav onNavigate={handleBottomNav} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.white },

    topSection: {
        paddingHorizontal: 22,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: Colors.white,
    },

    title: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.text,
        lineHeight: 34,
        marginTop: 12,
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },

    content: {
        flex: 1,
        backgroundColor: Colors.white,
    },

    contentContainer: {
        paddingHorizontal: 22,
        paddingTop: 12,
        paddingBottom: 16,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: Colors.text,
        marginBottom: 16,
    },

    conditionCard: {
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.greyLight,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    diseaseName: {
        fontSize: 16,
        fontWeight: '900',
        color: Colors.text,
    },

    matchPercentage: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },

    description: {
        fontSize: 13,
        color: Colors.text,
        lineHeight: 18,
    },

    footer: {
        paddingHorizontal: 22,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: Colors.white,
        gap: 10,
    },

    yesBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 5,
    },

    yesBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    noneBtn: {
        backgroundColor: '#6B7280',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    noneBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    loadingText: {
        fontSize: 14,
        color: Colors.text,
        textAlign: 'center',
        marginTop: 20,
    },

    emptyText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 20,
    },
});
