import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAppColors, useTheme } from '@/lib/theme';

import arrowIcon from "../icons/arrow.png";
import logoutIcon from "../icons/logout.png";
import referencesIcon from "../icons/references.png";
import settingsProfileIcon from "../icons/settings_profile.png";

import {
    canSync,
    getLastSynced,
    getPreference,
    setPreference,
    syncDiseaseData,
} from "@/lib/sync";
import BottomNav from "../components/BottomNav";

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
    const textColor = isDestructive ? '#FF3B30' : colors.text;

    return (
        <TouchableOpacity
            style={[styles.menuItem, hideBorder && { borderBottomWidth: 0, borderBottomColor: 'transparent' }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.6 : 1}
        >
            {icon && (
                <View style={styles.menuIconWrap}>
                    <Image source={icon} style={styles.menuIconImg} />
                </View>
            )}

            <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>

            {!isDestructive && onPress && <Image source={arrowIcon} style={styles.arrowImg} />}
        </TouchableOpacity>
    );
};

export default function SettingsPage() {
    const router = useRouter();
    const colors = useAppColors();
    const { isDark, setDark } = useTheme();

    const [syncing, setSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<string | null>(null);
    const [canDoSync, setCanDoSync] = useState(true);

    const [confidence, setConfidence] = useState<'strict' | 'normal' | 'possibles'>('normal');

    useEffect(() => {
        async function load() {
            const last = await getLastSynced();
            setLastSynced(last);
            const syncOk = await canSync();
            setCanDoSync(syncOk.can);

            const pref = (await getPreference('confidence')) as
                | 'strict'
                | 'normal'
                | 'possibles'
                | null;
            if (pref) setConfidence(pref);
        }
        load();
    }, []);

    const handleSync = async () => {
        if (syncing) return;

        try {
            const ok = await canSync();
            if (!ok.can) {
                Alert.alert('Sync blocked', `Last sync was: ${ok.lastSynced ?? 'unknown'}. You can sync once every 24 hours.`);
                return;
            }

            setSyncing(true);
            await syncDiseaseData(false);
            const last = await getLastSynced();
            setLastSynced(last);
            const syncOk = await canSync();
            setCanDoSync(syncOk.can);
            Alert.alert('Sync complete', 'Disease database updated successfully.');
        } catch (e) {
            console.error(e);
            Alert.alert('Sync failed', 'An error occurred while syncing.');
        } finally {
            setSyncing(false);
        }
    };

    const handleSetConfidence = async (val: 'strict' | 'normal' | 'possibles') => {
        setConfidence(val);
        await setPreference('confidence', val);
    };

    const handleToggleTheme = (val: boolean) => {
        setDark(val);
    };

    const handleLogout = () => {
        router.replace('/LogInPage');
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>SETTINGS</Text>

                <View style={styles.menuGroup}>
                    {/* Dark mode */}
                    <View style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                        <Text style={[styles.menuText, { fontSize: 16, color: colors.text }]}>Dark Mode</Text>
                        <Switch value={isDark} onValueChange={handleToggleTheme} />
                    </View>

                    {/* Confidence Level header (no separator between header and options) */}
                    <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                        <Text style={[styles.menuText, { fontSize: 16, color: colors.text }]}>Confidence Level</Text>
                    </View>

                    {/* Confidence radio options (single-line) */}
                    <View style={[styles.menuItem, { borderBottomWidth: 1, justifyContent: 'flex-start', borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => handleSetConfidence('strict')} style={[styles.radioBtn, { paddingVertical: 8, paddingHorizontal: 6 }]}>
                            <View
                                style={[
                                    styles.radioCircle,
                                    { borderColor: colors.border },
                                    confidence === 'strict' && { backgroundColor: colors.primary, borderColor: colors.primary },
                                ]}
                            />
                            <Text style={[styles.radioLabel, { color: colors.text }]}>Strict — 80%+</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSetConfidence('normal')} style={[styles.radioBtn, { marginLeft: 18, paddingVertical: 8, paddingHorizontal: 6 }]}>
                            <View style={[styles.radioCircle, { borderColor: colors.border }, confidence === 'normal' && { backgroundColor: colors.primary, borderColor: colors.primary }]} />
                            <Text style={[styles.radioLabel, { color: colors.text }]}>Normal — 60%+</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSetConfidence('possibles')} style={[styles.radioBtn, { marginLeft: 18, paddingVertical: 8, paddingHorizontal: 6 }]}>
                            <View style={[styles.radioCircle, { borderColor: colors.border }, confidence === 'possibles' && { backgroundColor: colors.primary, borderColor: colors.primary }]} />
                            <Text style={[styles.radioLabel, { color: colors.text }]}>Possibles — 50%+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Update Account */}
                    <MenuItem
                        icon={settingsProfileIcon}
                        text="Update Account"
                        onPress={() => router.push('/AccountPage')}
                    />

                    {/* References */}
                    <MenuItem
                        icon={referencesIcon}
                        text="References"
                        onPress={() => console.log('Go to References')}
                        hideBorder={false}
                    />

                    {/* Sync button centered with last-sync below */}
                    <View style={{ paddingVertical: 18, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <TouchableOpacity
                            onPress={handleSync}
                            disabled={!canDoSync || syncing}
                            style={[styles.syncBtn, { backgroundColor: colors.primary }, !canDoSync && styles.syncBtnDisabled]}
                            activeOpacity={0.85}
                        >
                            {syncing ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={[styles.syncBtnText, { color: colors.white }]}>Sync disease database</Text>
                            )}
                        </TouchableOpacity>

                        <Text style={[styles.lastSyncText, { color: colors.textMuted }]}>Last sync: {lastSynced ? new Date(lastSynced).toLocaleString() : 'Never'}</Text>
                    </View>

                    {/* Log out */}
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
        textTransform: 'uppercase',
        marginBottom: 40,
    },
    menuGroup: {
        marginBottom: 32,
        backgroundColor: 'transparent',
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
    radioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    radioCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#9CA3AF',
    },
    radioChecked: {},
    radioLabel: {
        fontSize: 13,
    },
    syncBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 220,
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncBtnDisabled: {
        opacity: 0.5,
    },
    syncBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    lastSyncText: {
        marginTop: 8,
        fontSize: 13,
    },
    arrowImg: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        marginLeft: 8,
    },
});
