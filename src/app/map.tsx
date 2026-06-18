import { useAppColors } from "@/lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { CONFIG } from "../lib/config";

interface Hospital {
    id: string;
    name: string;
    lat: number;
    lng: number;
    distance: number;
    phone: string;
    address: string;
}

interface UserLocation {
    lat: number;
    lng: number;
}

const GOOGLE_MAPS_API_KEY = CONFIG.GOOGLE_MAPS_API_KEY;

// Mock hospital data - replace with real API calls if needed
const MOCK_HOSPITALS: Hospital[] = [
    {
        id: "1",
        name: "City General Hospital",
        lat: 40.7128,
        lng: -74.006,
        distance: 2.3,
        phone: "+1 (555) 123-4567",
        address: "123 Main St, New York, NY",
    },
    {
        id: "2",
        name: "Central Medical Center",
        lat: 40.758,
        lng: -73.9855,
        distance: 5.1,
        phone: "+1 (555) 234-5678",
        address: "456 Park Ave, New York, NY",
    },
    {
        id: "3",
        name: "Community Health Clinic",
        lat: 40.7489,
        lng: -73.968,
        distance: 1.8,
        phone: "+1 (555) 345-6789",
        address: "789 Broadway, New York, NY",
    },
];

export default function MapTab() {
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapViewRef = React.useRef<MapView>(null);
    const colors = useAppColors();

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ): number => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get user location and find nearest hospital
    const getUserLocation = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Request location permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setError("Location permission denied");
                setLoading(false);
                return;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const userLoc = {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            };
            setUserLocation(userLoc);

            // Calculate distances and find nearest hospital
            const hospitalsWithDistance = hospitals.map((hospital) => ({
                ...hospital,
                distance: calculateDistance(
                    userLoc.lat,
                    userLoc.lng,
                    hospital.lat,
                    hospital.lng
                ),
            }));

            const nearest = hospitalsWithDistance.reduce((prev, current) =>
                prev.distance < current.distance ? prev : current
            );

            setNearestHospital(nearest);
            setHospitals(hospitalsWithDistance);

            // Animate map to user location
            if (mapViewRef.current && userLoc) {
                mapViewRef.current.animateToRegion({
                    latitude: userLoc.lat,
                    longitude: userLoc.lng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }
        } catch (err: any) {
            console.error("Location error:", err);
            setError(err.message || "Failed to get location");
        } finally {
            setLoading(false);
        }
    }, [hospitals]);

    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]);

    // Open directions in native maps app
    const openDirections = () => {
        if (!userLocation || !nearestHospital) return;

        const scheme = `https://maps.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${nearestHospital.lat},${nearestHospital.lng}?key=${GOOGLE_MAPS_API_KEY}`;

        Linking.openURL(scheme).catch(() => {
            Alert.alert("Error", "Could not open maps application");
        });
    };

    // Call hospital
    const callHospital = () => {
        if (!nearestHospital) return;
        Linking.openURL(`tel:${nearestHospital.phone}`).catch(() => {
            Alert.alert("Error", "Could not make call");
        });
    };

    // Focus on nearest hospital
    const focusOnNearest = () => {
        if (nearestHospital && mapViewRef.current) {
            mapViewRef.current.animateToRegion({
                latitude: nearestHospital.lat,
                longitude: nearestHospital.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.primaryDark} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading map...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.centerContent}>
                    <MaterialCommunityIcons
                        name="alert-circle"
                        size={48}
                        color={colors.primaryDark}
                    />
                    <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primaryDark }]} onPress={getUserLocation}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Map */}
            <MapView
                ref={mapViewRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: userLocation?.lat || 40.7128,
                    longitude: userLocation?.lng || -74.006,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {/* User location marker */}
                {userLocation && (
                    <Marker
                        coordinate={{
                            latitude: userLocation.lat,
                            longitude: userLocation.lng,
                        }}
                        title="Your Location"
                        pinColor="blue"
                    />
                )}

                {/* Hospital markers */}
                {hospitals.map((hospital) => (
                    <Marker
                        key={hospital.id}
                        coordinate={{
                            latitude: hospital.lat,
                            longitude: hospital.lng,
                        }}
                        title={hospital.name}
                        description={hospital.address}
                        pinColor={
                            nearestHospital?.id === hospital.id ? "red" : "orange"
                        }
                    />
                ))}
            </MapView>

            {/* Floating action buttons */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primaryDark }]}
                onPress={focusOnNearest}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="target" size={24} color="white" />
            </TouchableOpacity>

            {/* Hospital Info Panel */}
            {nearestHospital && (
                <View style={styles.infoPanel}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={styles.infoPanelScroll}
                    >
                        <View style={styles.hospitalHeader}>
                            <View style={styles.hospitalTitleSection}>
                                <Text style={[styles.hospitalName, { color: colors.text }]}>{nearestHospital.name}</Text>
                                <View style={[styles.distanceTag, { backgroundColor: colors.primaryLight }]}>
                                    <MaterialCommunityIcons
                                        name="map-marker-distance"
                                        size={14}
                                        color={colors.primaryDark}
                                    />
                                    <Text style={[styles.distanceText, { color: colors.primaryDark }]}>
                                        {nearestHospital.distance.toFixed(1)} km
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name="map-marker"
                                size={20}
                                color={colors.primaryDark}
                            />
                            <Text style={[styles.addressText, { color: colors.text }]}>{nearestHospital.address}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name="phone"
                                size={20}
                                color={colors.primaryDark}
                            />
                            <Text style={[styles.phoneText, { color: colors.text }]}>{nearestHospital.phone}</Text>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                onPress={openDirections}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons
                                    name="directions"
                                    size={20}
                                    color="white"
                                />
                                <Text style={styles.actionButtonText}>Directions</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.callButton]}
                                onPress={callHospital}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="phone" size={20} color="white" />
                                <Text style={styles.actionButtonText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    map: {
        flex: 1,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: "600",
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: "center",
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    fab: {
        position: "absolute",
        bottom: 280,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    infoPanel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "40%",
        paddingHorizontal: 16,
        paddingVertical: 16,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoPanelScroll: {
        flex: 1,
    },
    hospitalHeader: {
        marginBottom: 12,
    },
    hospitalTitleSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    hospitalName: {
        fontSize: 18,
        fontWeight: "700",
        flex: 1,
    },
    distanceTag: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    distanceText: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    infoDivider: {
        height: 1,
        marginVertical: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    addressText: {
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
    },
    phoneText: {
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    directionsButton: {
        backgroundColor: "transparent",
    },
    callButton: {
        backgroundColor: "#4CAF50",
    },
    actionButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
});
