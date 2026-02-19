import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "../styles/doctordashboard.styles";

const API_BASE_URL = 'https://handsome-nena-mignon.ngrok-free.dev';

export default function DoctorDashboard() {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [doctorName, setDoctorName] = useState("Doctor");
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const id = await AsyncStorage.getItem('doctor_id');
            const name = await AsyncStorage.getItem('doctor_name');
            if (name) setDoctorName(name);

            if (!id) {
                router.replace("/doctor-login");
                return;
            }
            const response = await fetch(`${API_BASE_URL}/api/doctor-dashboard/doctor/${id}/appointments`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            const data = await response.json();
            setAppointments(data.appointments || []);
        } catch (error) {
            console.error("Fetch stats error:", error);
            setAppointments([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setIsRefreshing(true);
        fetchDashboardData();
    }, []);

    const handleClose = (appt) => {
        setSelectedAppt(appt);
        setRemarks("");
        setModalVisible(true);
    };

    const submitCloseTicket = async () => {
        if (!remarks.trim()) {
            Alert.alert("Error", "Please enter remarks before closing.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/doctor-dashboard/appointment/${selectedAppt.appointment_id}/close`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ remarks })
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Appointment closed successfully.");
                setModalVisible(false);
                fetchDashboardData(); // Refresh list
            } else {
                Alert.alert("Error", result.detail || "Failed to close appointment.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Something went wrong. Check network/backend.");
        } finally {
            setSubmitting(false);
        }
    };

    const stats = [
        { id: 1, title: "Total Patients", value: appointments.length.toString(), icon: "users", color: "#4ade80", bgColor: "rgba(74, 222, 128, 0.1)" },
        { id: 2, title: "Stable", value: appointments.filter(a => a.severity === 'LOW').length.toString(), icon: "heart", color: "#60a5fa", bgColor: "rgba(96, 165, 250, 0.1)" },
        { id: 3, title: "High Severity", value: appointments.filter(a => a.severity === 'HIGH').length.toString(), icon: "heartbeat", color: "#f87171", bgColor: "rgba(248, 113, 113, 0.1)" },
        { id: 4, title: "Scheduled", value: appointments.filter(a => a.status === 'scheduled').length.toString(), icon: "calendar", color: "#fbbf24", bgColor: "rgba(251, 191, 36, 0.1)" },
    ];

    const getStatusColor = (severity) => {
        switch (severity) {
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            case 'LOW': return '#10b981';
            default: return '#94a3b8';
        }
    };

    const renderStatCard = (item) => (
        <View key={item.id} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                <FontAwesome5 name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statTitle}>{item.title}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#00f2ff" />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#020617', '#0f172a', '#1e293b']}
            style={styles.container}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Good Morning,</Text>
                    <Text style={styles.doctorName}>{doctorName}</Text>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={() => router.replace("/doctor-login")}>
                    <Ionicons name="log-out-outline" size={24} color="#f87171" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#00f2ff" />}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                </View>

                <View style={styles.statsGrid}>
                    {stats.map(renderStatCard)}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Appointments</Text>
                </View>

                {/* Scheduled Appointments */}
                <View style={styles.patientList}>
                    {appointments.filter(a => a.status === 'scheduled').length === 0 ? (
                        <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>No scheduled appointments.</Text>
                    ) : (
                        appointments.filter(a => a.status === 'scheduled').map((appt) => (
                            <TouchableOpacity
                                key={appt.appointment_id}
                                style={styles.patientCard}
                                onPress={() => handleClose(appt)}
                            >
                                <View style={styles.patientInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.patientName}>{appt.patient_name}</Text>

                                        {/* Risk Badge */}
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appt.severity) + '20', marginRight: 8 }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(appt.severity) }]}>
                                                {appt.severity} Risk
                                            </Text>
                                        </View>

                                        {/* Status Badge */}
                                        <View style={[styles.statusBadge, { backgroundColor: '#fbbf2420' }]}>
                                            <Text style={[styles.statusText, { color: '#fbbf24' }]}>
                                                Scheduled
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.patientDetails}>
                                        {appt.patient_mobile} • {appt.place}, {appt.district} • {appt.disease}
                                    </Text>

                                    <View style={styles.visitRow}>
                                        <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.visitTime}> {new Date(appt.appointment_date).toLocaleString()}</Text>
                                    </View>
                                </View>

                                <View style={styles.arrowContainer}>
                                    <Ionicons name="chevron-forward" size={20} color="#868686ff" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Closed Appointments</Text>
                </View>

                {/* Closed Appointments */}
                <View style={styles.patientList}>
                    {appointments.filter(a => a.status === 'completed').length === 0 ? (
                        <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>No closed appointments.</Text>
                    ) : (
                        appointments.filter(a => a.status === 'completed').map((appt) => (
                            <TouchableOpacity key={appt.appointment_id} style={[styles.patientCard, { opacity: 0.7 }]}>
                                <View style={styles.patientInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.patientName}>{appt.patient_name}</Text>

                                        {/* Risk Badge */}
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appt.severity) + '20', marginRight: 8 }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(appt.severity) }]}>
                                                {appt.severity} Risk
                                            </Text>
                                        </View>

                                        {/* Status Badge */}
                                        <View style={[styles.statusBadge, { backgroundColor: '#94a3b820' }]}>
                                            <Text style={[styles.statusText, { color: '#94a3b8' }]}>
                                                Closed
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.patientDetails}>
                                        {appt.patient_mobile} • {appt.place}, {appt.district} • {appt.disease}
                                    </Text>

                                    <View style={styles.visitRow}>
                                        <Ionicons name="checkmark-circle-outline" size={14} color="#4ade80" />
                                        <Text style={styles.visitTime}> Completed</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Close Ticket Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: '85%', backgroundColor: '#1e293b', borderRadius: 16, padding: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 10 }}>Close Appointment</Text>
                        <Text style={{ color: '#94a3b8', marginBottom: 20 }}>Patient: {selectedAppt?.patient_name}</Text>

                        <TextInput
                            style={{
                                width: '100%',
                                backgroundColor: '#0f172a',
                                color: 'white',
                                padding: 12,
                                borderRadius: 8,
                                height: 100,
                                textAlignVertical: 'top',
                                marginBottom: 20
                            }}
                            placeholder="Enter remarks..."
                            placeholderTextColor="#64748b"
                            value={remarks}
                            onChangeText={setRemarks}
                            multiline
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{ flex: 1, backgroundColor: '#334155', padding: 12, borderRadius: 8, marginRight: 10, alignItems: 'center' }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={submitCloseTicket}
                                disabled={submitting}
                                style={{ flex: 1, backgroundColor: submitting ? '#0e7490' : '#00f2ff', padding: 12, borderRadius: 8, marginLeft: 10, alignItems: 'center' }}
                            >
                                {submitting ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: '#0f172a', fontWeight: 'bold' }}>Submit</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}
