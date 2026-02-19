import { StyleSheet } from 'react-native';



export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050b14',
    },
    header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    },
    doctorIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,242,255,0.08)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(0,242,255,0.2)",
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 30,
        fontWeight: '700',
        textAlign: 'center',
    },
    title: {
        color: '#ffffff',
        fontSize: 38,
        fontWeight: '700',
        textAlign: 'center',
        paddingTop: 55,
        letterSpacing: 0.5,
    },
    subtitle: {
        color: '#00f2ff',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
        marginTop: 15,
        lineHeight: 24,
        opacity: 0.9,
    },
    chatArea: {
        flex: 1,
        padding: 20,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#00f2ff22',
        padding: 12,
        borderRadius: 20,
        borderBottomRightRadius: 4,
        marginBottom: 10,
        maxWidth: '80%',
        borderWidth: 1,
        borderColor: '#00f2ff44',
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#1e293baa', // Semi-transparent
        padding: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        marginBottom: 10,
        maxWidth: '80%',
        borderWidth: 1,
        borderColor: '#ffffff11',
    },
    userText: {
        color: '#ffffff',
        fontSize: 16,
    },
    botText: {
        color: '#e2e8f0',
        fontSize: 16,
    },
    bottomArea: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 25,
        backgroundColor: '#0a1628cc',
    },
    inputContainer: {
        flex: 1,
        height: 70,
        backgroundColor: '#1f2937',
        color: '#fff',
        paddingHorizontal: 15,
        borderRadius: 35,
    },

    listening: {
        color: '#00f2ff',
        fontSize: 14,
        marginBottom: 15,
        fontStyle: 'italic',
        opacity: 0.8,
    },
    micButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#050b14',
        justifyContent: 'center',
        alignItems: 'center',
        // Neon Glow
        shadowColor: '#00f2ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 2,
        borderColor: '#00f2ff33',
    },
    micButtonRecording: {
        borderColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowRadius: 25,
    },
    micIcon: {
        fontSize: 30,
    },
    systemBubble: {
        alignSelf: 'center',
        backgroundColor: '#334155',
        padding: 8,
        borderRadius: 12,
        marginBottom: 10,
        maxWidth: '90%',
    },
    systemText: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    keyboardArea: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#0a1628',
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        gap: 10,
    },
    numberInput: {
        flex: 1,
        backgroundColor: '#1e293b',
        color: '#ffffff',
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#00f2ff44',
    },
    submitButton: {
        backgroundColor: '#00f2ff',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 12,
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#050b14',
        fontSize: 16,
        fontWeight: '700',
    },
    languageArea: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
        backgroundColor: '#0a1628cc',
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
    },

    languageLabel: {
        color: '#94a3b8',
        fontSize: 13,
        marginBottom: 6,
    },

    languageButton: {
        backgroundColor: '#1e293b',
        height: 48,
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#00f2ff33',
    },

    languageButtonText: {
        color: '#ffffff',
        fontSize: 15,
    },

    languageDropdown: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        backgroundColor: '#1e293b',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#00f2ff33',
        overflow: 'hidden',

        // subtle floating feel
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },

    languageOption: {
        paddingVertical: 12,
        paddingHorizontal: 15,
    },

    languageOptionText: {
        color: '#ffffff',
        fontSize: 15,
    },
});
