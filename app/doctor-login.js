import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView,
  Platform, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn,
  FadeOut
} from "react-native-reanimated";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "../styles/doctor.styles";

const API_BASE_URL = 'https://handsome-nena-mignon.ngrok-free.dev';

export default function DoctorLogin() {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const rotate = useSharedValue(0);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regSpecialization, setRegSpecialization] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const flipCard = () => {
    rotate.value = withTiming(isFlipped ? 0 : 180, { duration: 600 });
    setIsFlipped(!isFlipped);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotate.value}deg` },
    ],
    backfaceVisibility: "hidden",
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotate.value + 180}deg` },
    ],
    backfaceVisibility: "hidden",
    position: "absolute",
  }));

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-reg/doctor-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save doctor data for the dashboard
        await AsyncStorage.setItem('doctor_id', data.doctor_id);
        await AsyncStorage.setItem('doctor_name', data.name);
        await AsyncStorage.setItem('doctor_specialization', data.specialization);

        Alert.alert("Success", "Login Successful");
        router.replace("/doctor-dashboard");
      } else {
        Alert.alert("Login Failed", data.detail || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login Check Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regMobile || !regSpecialization || !regPassword || !regConfirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: regName,
        email: regEmail,
        mobile: regMobile,
        password: regPassword,
        confirm_password: regConfirmPassword,
        specialization: regSpecialization,
      };

      const response = await fetch(`${API_BASE_URL}/api/doctor-reg/doctor-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Registration Successful. Please Login.");
        flipCard();
        // Clear registration form
        setRegName("");
        setRegEmail("");
        setRegMobile("");
        setRegSpecialization("");
        setRegPassword("");
        setRegConfirmPassword("");
      } else {
        Alert.alert("Registration Failed", data.detail || "Could not register");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!forgotEmail || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor-reg/doctor/update/${forgotEmail}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Password updated successfully. Please Login.");
        setIsForgotPassword(false);
        setForgotEmail("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        Alert.alert("Update Failed", data.detail || "Could not update password");
      }
    } catch (error) {
      console.error("Update Password Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#020617', '#071a2f', '#001a33']}
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#020617",
          },
          headerTintColor: "#00f2ff",
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {isForgotPassword ? (
                <Animated.View
                  entering={FadeIn.duration(500)}
                  exiting={FadeOut.duration(500)}
                  style={styles.card}
                >
                  <Text style={styles.title}>Reset Password</Text>

                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    style={styles.input}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                  />

                  <TextInput
                    placeholder="New Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />

                  <TextInput
                    placeholder="Confirm New Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    style={styles.input}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                  />

                  <Pressable style={styles.button} onPress={handleUpdatePassword} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.buttonText}>Update Password</Text>
                    )}
                  </Pressable>

                  <Pressable onPress={() => setIsForgotPassword(false)} disabled={loading}>
                    <Text style={styles.switchText}>Back to Login</Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <>
                  <Animated.View
                    style={[styles.card, frontStyle, { zIndex: isFlipped ? 0 : 1 }]}
                    pointerEvents={isFlipped ? "none" : "auto"}
                  >
                    <Text style={styles.title}>Doctor Login</Text>

                    <TextInput
                      placeholder="Email"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      style={styles.input}
                      value={loginEmail}
                      onChangeText={setLoginEmail}
                    />

                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                      style={styles.input}
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                    />

                    <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
                      {loading ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <Text style={styles.buttonText}>Login</Text>
                      )}
                    </Pressable>

                    <Pressable onPress={flipCard} disabled={loading}>
                      <Text style={styles.switchText}>New Doctor? Register</Text>
                    </Pressable>
                    <Pressable onPress={() => setIsForgotPassword(true)} disabled={loading}>
                      <Text style={styles.switchText}>Forgot Password?</Text>
                    </Pressable>
                  </Animated.View>

                  <Animated.View
                    style={[styles.card, backStyle, { zIndex: isFlipped ? 1 : 0 }]}
                    pointerEvents={isFlipped ? "auto" : "none"}
                  >
                    <Text style={styles.title}>Doctor Register</Text>

                    <TextInput
                      placeholder="Full Name"
                      placeholderTextColor="#94a3b8"
                      style={styles.input}
                      value={regName}
                      onChangeText={setRegName}
                    />

                    <TextInput
                      placeholder="Email"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      style={styles.input}
                      value={regEmail}
                      onChangeText={setRegEmail}
                    />

                    <TextInput
                      placeholder="Mobile Number"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      maxLength={10}
                      style={styles.input}
                      value={regMobile}
                      onChangeText={setRegMobile}
                    />

                    <TextInput
                      placeholder="Specialization"
                      placeholderTextColor="#94a3b8"
                      style={styles.input}
                      value={regSpecialization}
                      onChangeText={setRegSpecialization}
                    />

                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                      style={styles.input}
                      value={regPassword}
                      onChangeText={setRegPassword}
                    />

                    <TextInput
                      placeholder="Confirm Password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                      style={styles.input}
                      value={regConfirmPassword}
                      onChangeText={setRegConfirmPassword}
                    />

                    <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
                      {loading ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <Text style={styles.buttonText}>Register</Text>
                      )}
                    </Pressable>

                    <Pressable onPress={flipCard} disabled={loading}>
                      <Text style={styles.switchText}>Already have account? Login</Text>
                    </Pressable>
                  </Animated.View>
                </>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <StatusBar style="light" />
    </LinearGradient>
  );
}
