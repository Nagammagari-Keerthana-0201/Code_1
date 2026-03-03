import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "../styles/profile.styles";
import { Config } from "../constants/Config";

const API_BASE_URL = Config.API_BASE_URL;

export default function UpdateProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile_number: "",
        specialization: "",
        password: "",
        confirm_password: ""
    });

    useEffect(() => {
        const loadInitialData = async () => {
            const email = await AsyncStorage.getItem('doctor_email');
            const name = await AsyncStorage.getItem('doctor_name');
            const spec = await AsyncStorage.getItem('doctor_specialization');
            setFormData(prev => ({
                ...prev,
                email: email || "",
                name: name || "",
                specialization: spec || ""
            }));
        };
        loadInitialData();
    }, []);

    const handleSave = async () => {
        const email = await AsyncStorage.getItem('doctor_email');
        if (!formData.name || !formData.mobile_number || !formData.specialization) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        if (formData.password && formData.password !== formData.confirm_password) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                mobile_number: formData.mobile_number,
                specialization: formData.specialization,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            const response = await fetch(`${API_BASE_URL}/api/doctor-reg/doctor/update/${email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                // Update AsyncStorage with new name/spec
                await AsyncStorage.setItem('doctor_name', formData.name);
                await AsyncStorage.setItem('doctor_specialization', formData.specialization);

                Alert.alert("Success", "Profile updated successfully", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("Error", result.detail || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update profile error:", error);
            Alert.alert("Error", "Failed to save changes. Check your connection.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' }]}>
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

            {submitting && (
                <View style={styles.loadingMask}>
                    <ActivityIndicator size="large" color="#00f2ff" />
                </View>
            )}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Update Profile</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.formContainer}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color="#00f2ff" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#64748b"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="call-outline" size={20} color="#00f2ff" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.mobile_number}
                                    onChangeText={(text) => setFormData({ ...formData, mobile_number: text })}
                                    placeholder="Enter mobile number"
                                    placeholderTextColor="#64748b"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Specialization</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="medical-outline" size={20} color="#00f2ff" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.specialization}
                                    onChangeText={(text) => setFormData({ ...formData, specialization: text })}
                                    placeholder="e.g. Cardiologist"
                                    placeholderTextColor="#64748b"
                                />
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Security</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password (Optional)</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#00f2ff" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    placeholder="Leave blank to keep current"
                                    placeholderTextColor="#64748b"
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        {formData.password.length > 0 && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#00f2ff" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.confirm_password}
                                        onChangeText={(text) => setFormData({ ...formData, confirm_password: text })}
                                        placeholder="Confirm new password"
                                        placeholderTextColor="#64748b"
                                        secureTextEntry
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={submitting}
                        >
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}
