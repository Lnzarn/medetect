import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
    }
  }

  async function handleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View>
      <Text>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#000"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#000"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#000000" /> : <Text>Login</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#000000" /> : <Text>Sign Up</Text>}
      </TouchableOpacity>
    </View>
  );
}
