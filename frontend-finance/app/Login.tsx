import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type UserRole = 'admin' | 'staff';

interface User {
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

// Define user roles and credentials
const USERS: Record<UserRole, User> = {
  admin: {
    username: 'admin',
    password: '123456',
    role: 'admin',
    name: 'Jonathan Vincent'
  },
  staff: {
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    name: 'Staff Marco'
  }
};

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch('https://backendreact-production-e680.up.railway.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (typeof window !== 'undefined') {
          // Untuk web, redirect ke /home
          window.location.href = `/home?userRole=${encodeURIComponent(data.role)}&userName=${encodeURIComponent(data.name)}`;
        } else {
          // Untuk mobile, tetap pakai router.replace
          router.replace({
            pathname: "/(app)/home",
            params: {
              userRole: data.role,
              userName: data.name
            }
          });
        }
      } else {
        setError(data.error || "Username atau password salah");
      }
    } catch (err) {
      setError("Gagal terhubung ke server");
    }
  };

  return (
    <LinearGradient
      colors={['#ADD8E6', '#87CEEB', '#6495ED']}
      style={styles.gradientBackground}
    >
      <View style={styles.card}>
        <Image source={require('../assets/images/LOGO-2.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setError(""); // Clear error when typing
          }}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(""); // Clear error when typing
          }}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: "#1b3a4f",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  }
});
