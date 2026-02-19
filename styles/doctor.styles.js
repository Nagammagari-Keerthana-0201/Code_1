 import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    padding: 25,
    borderRadius: 20,

    shadowColor: "#00f2ff",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },

  title: {
    color: "#00f2ff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#00f2ff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },

  switchText: {
    color: "#00f2ff",
    textAlign: "center",
    marginTop: 20,
  },
});
