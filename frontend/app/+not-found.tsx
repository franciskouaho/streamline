import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.subtitle}>This page doesn't exist.</Text>
        <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>Go back home</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#ff7a5c",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});