import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    greeting: {
        fontSize: 14,
        color: "#94a3b8",
        fontFamily: "System",
    },
    doctorName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#f8fafc",
        letterSpacing: 0.5,
    },
    profileButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        borderWidth: 2,
        borderColor: "rgba(0, 242, 255, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    profileImage: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    notificationDot: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        backgroundColor: "#ef4444",
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: "#020617",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#e2e8f0",
    },
    seeAllText: {
        color: "#00f2ff",
        fontSize: 13,
        fontWeight: "600",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statCard: {
        width: "48%", // Grid layout: 2 cards per row with gap
        backgroundColor: "rgba(30, 41, 59, 0.6)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    statContent: {
        //
    },
    statValue: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#f8fafc",
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: "#94a3b8",
        fontWeight: "500",
    },
    patientList: {
        //
    },
    patientCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.03)",
    },
    patientImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    patientInfo: {
        flex: 1,
        marginLeft: 15,
    },
    nameRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    patientName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#f1f5f9",
    },
    patientDetails: {
        fontSize: 13,
        color: "#94a3b8",
        marginBottom: 6,
    },
    visitRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    visitTime: {
        fontSize: 12,
        color: "#64748b",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    arrowContainer: {
        paddingLeft: 10,
    }
});