import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { styles } from '../styles/landing.styles';
import { Audio } from 'expo-av';
import { File, Paths } from 'expo-file-system';
import WaterBackground from '../components/WaterBackground';
import { LinearGradient } from 'expo-linear-gradient';

const SvgMic = ({ size = 28, color = "#00f2ff" }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                fill={color}
            />
            <Path
                d="M19 10v2a7 7 0 0 1-14 0v-2"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M12 19v4M8 23h8"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    </View>
);

const API_BASE_URL = 'https://ripely-unmacerated-ishaan.ngrok-free.dev';
const VAD_THRESHOLD = -40;
const SILENCE_DURATION = 1200;

const LANG_MAP = {
    "en-IN": { code: "en", locale: "en-IN", name: "English" },
    "te-IN": { code: "te", locale: "te-IN", name: "తెలుగు" },
    "hi-IN": { code: "hi", locale: "hi-IN", name: "हिन्दी" },
    "or-IN": { code: "or", locale: "or-IN", name: "ଓଡ଼ିଆ" },
};

export default function LandingPage() {
    console.log('--- Landing Page Component Rendered (V2) ---');
    const [messages, setMessages] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [language, setLanguage] = useState("en-IN");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [manualInput, setManualInput] = useState("");
    const scrollViewRef = useRef();
    const recordingRef = useRef(null);
    const vadIntervalRef = useRef(null);
    const speechStartedRef = useRef(false);
    const silenceStartRef = useRef(null);
    const wsRef = useRef(null);
    const sessionIdRef = useRef(null);
    const passiveListeningRef = useRef(false);

    const generateUUID = () => {
        return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    };

    // WebSocket setup
    const connectWebSocket = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        const wsUrl = `wss://dannielle-zonal-defiantly.ngrok-free.dev/ws/audio`;
        console.log('Connecting to WebSocket:', wsUrl);

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                // Send init message
                const initMsg = JSON.stringify({
                    type: "init",
                    session_id: sessionIdRef.current,
                    lang: LANG_MAP[language]?.code || "en"
                });
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(initMsg);
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'text') {
                        console.log('Received text from backend:', data.text);
                        addMessage({ sender: 'bot', text: data.text });
                    }

                    if (data.type === 'audio') {
                        playBase64Audio(data.audio);
                    }
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                    console.log('Raw message:', event.data);
                }
            };

            ws.onerror = (error) => {
                console.warn('WebSocket connection failed', error.message);
            };

            ws.onclose = () => {
                console.log('WebSocket closed');
                if (wsRef.current === ws) {
                    wsRef.current = null;
                }
            };
        } catch (error) {
            console.warn('Failed to create WebSocket:', error.message);
        }
    };

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const addMessage = (message) => {
        setMessages(prev => [...prev, { id: Date.now(), ...message }]);
    };

    const playBase64Audio = async (base64Data) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (!base64Data) {
                    console.error('No base64 audio data provided');
                    reject(new Error('No audio data'));
                    return;
                }

                console.log(' Playing audio, length:', base64Data.length);

                // Create a temporary file URI
                const file = new File(Paths.cache, `temp_audio_${Date.now()}.wav`);

                await file.write(base64Data, { encoding: 'base64' });

                console.log('Audio file created:', file.uri);

                // Create and play sound
                const { sound } = await Audio.Sound.createAsync(
                    { uri: file.uri },
                    { shouldPlay: true }
                );

                // Wait for playback to finish
                sound.setOnPlaybackStatusUpdate(async (status) => {
                    if (status.didJustFinish) {
                        console.log('Audio playback finished');
                        await sound.unloadAsync();
                        try {
                            await file.delete();
                        } catch { }
                        resolve();
                    }
                });


                // Timeout fallback
                setTimeout(async () => {
                    console.log('Audio playback timeout');
                    try {
                        await sound.unloadAsync();
                    } catch { }

                    try {
                        if (await file.exists()) {
                            await file.delete();
                        }
                    } catch { }

                    resolve();
                }, 30000);

            } catch (error) {
                console.error('Audio playback failed:', error);
                reject(error);
            }
        });
    };

    // Start session - call welcome and menu APIs
    const handleStartSession = async () => {
        if (sessionStarted) {
            stopSession();
            return;
        }

        try {
            setIsProcessing(true);
            sessionIdRef.current = generateUUID();
            const normalizedLang = LANG_MAP[language]?.code || "en";

            addMessage({ sender: 'system', text: '=========== New Session ===========' });

            // Connect WebSocket if not connected
            connectWebSocket();

            // Step 1: Call welcome API
            console.log('Calling welcome API...');
            const welcomeResponse = await fetch(`https://ripely-unmacerated-ishaan.ngrok-free.dev/api/collect/voice-welcome`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lang: normalizedLang
                })
            });

            const textResponse = await welcomeResponse.text();
            console.log('Welcome API response status:', welcomeResponse.status);
            let welcomeData;
            try {
                welcomeData = JSON.parse(textResponse);
            } catch (e) {
                console.error('Failed to parse welcome API response:', e);
                if (textResponse.includes('Tunnel')) {
                    throw new Error('Ngrok tunnel issue: ' + textResponse);
                }
                throw new Error('Invalid JSON response from server');
            }
            const welcomeText = welcomeData?.ask?.advice_text || "Welcome!";
            addMessage({ sender: 'bot', text: welcomeText });

            // Play welcome audio if available
            const welcomeAudio = welcomeData?.ask?.audio_base64;
            if (welcomeAudio) {
                await playBase64Audio(welcomeAudio);
            }

            setSessionStarted(true);
            setIsProcessing(false);

            // Start passive listening immediately after welcome
            await startPassiveListening();

        } catch (error) {
            console.error('Session start failed:', error);
            Alert.alert('Error', 'Failed to start session. Please try again.');
            setIsProcessing(false);
        }
    };

    // Handle number selection
    // Start passive listening (continuous recording with VAD)
    const startPassiveListening = async () => {
        console.log('Starting passive listening...');
        passiveListeningRef.current = true;

        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission Required', 'Microphone permission is required');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            setIsRecording(true);

            const { recording } = await Audio.Recording.createAsync(
                {
                    android: {
                        extension: '.wav',
                        sampleRate: 16000,
                        numberOfChannels: 1,
                        bitRate: 128000,
                    },
                    ios: {
                        extension: '.wav',
                        sampleRate: 16000,
                        numberOfChannels: 1,
                        bitRate: 128000,
                        linearPCMBitDepth: 16,
                        linearPCMIsBigEndian: false,
                        linearPCMIsFloat: false,
                    },
                    isMeteringEnabled: true,
                },
                null,
                150
            );

            recordingRef.current = recording;
            speechStartedRef.current = false;
            silenceStartRef.current = null;

            startVADLoop();

        } catch (error) {
            console.error('Failed to start passive listening:', error);
            passiveListeningRef.current = false;
            setIsRecording(false);
        }
    };

    // VAD loop
    const startVADLoop = () => {
        console.log('Starting VAD loop...');
        vadIntervalRef.current = setInterval(async () => {
            if (!recordingRef.current) return;

            const status = await recordingRef.current.getStatusAsync();
            if (status.metering === undefined) return;

            const volume = status.metering;

            // Speech detected
            if (volume > VAD_THRESHOLD) {
                silenceStartRef.current = null;

                if (!speechStartedRef.current) {
                    speechStartedRef.current = true;
                    console.log('Speech START');
                    addMessage({ sender: 'user', text: 'Listening...' });
                }
            }
            // Silence detected
            else {
                if (!silenceStartRef.current) {
                    silenceStartRef.current = Date.now();
                }

                if (
                    speechStartedRef.current &&
                    Date.now() - silenceStartRef.current > SILENCE_DURATION
                ) {
                    console.log('Speech END');
                    await stopAndProcessAudio();
                }
            }
        }, 150);
    };

    // Stop recording and process audio
    const stopAndProcessAudio = async () => {
        clearInterval(vadIntervalRef.current);

        if (!recordingRef.current) return;

        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;

            console.log('Recording finished:', uri);

            // Process the audio
            await processAudioFile(uri);

            // Reset VAD state
            speechStartedRef.current = false;
            silenceStartRef.current = null;

            // Restart recording for next turn if still in passive mode
            if (passiveListeningRef.current) {
                await startPassiveListening();
            }

        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };

    // Process audio file (translate + send to ai-booking)
    const processAudioFile = async (audioUri) => {
        try {
            setIsProcessing(true);
            const normalizedLang = LANG_MAP[language]?.code || "en";

            // Step 1: Translate audio
            console.log('Calling translate API...');
            const formData = new FormData();
            formData.append('audio', {
                uri: audioUri,
                name: 'recording.wav',
                type: 'audio/wav',
            });
            formData.append('lang', normalizedLang);

            const translateResponse = await fetch(`https://ripely-unmacerated-ishaan.ngrok-free.dev/api/transulate/translate`, {
                method: 'POST',
                body: formData,
            });

            const translateData = await translateResponse.json();
            const asrText = translateData?.translation?.asr || translateData?.translation || "";

            if (!asrText) {
                setIsProcessing(false);
                return;
            }

            // Determine text to send
            let textToSend = asrText;
            if (normalizedLang !== "en" && translateData?.translation?.translation) {
                textToSend = translateData.translation.translation;
            }

            // Update last message with actual text
            setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.text === 'Listening...') {
                    newMessages[lastIndex].text = asrText;
                }
                return newMessages;
            });

            // Step 2: Send to voice API
            console.log('Calling voice API...');

            const voiceResponse = await fetch(`https://ripely-unmacerated-ishaan.ngrok-free.dev/api/collect/voice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    user_input: textToSend,
                    lang: normalizedLang,
                }),
            });

            const voiceData = await voiceResponse.json();
            console.log('Voice API response:', voiceData?.ask?.advice_text);

            const botResponse = voiceData?.ask?.advice_text || voiceData?.text || "";

            if (botResponse) {
                addMessage({ sender: 'bot', text: botResponse });
            }
            // console.log('Voice API response:', voiceData?.ask?.audio_base64);

            // Play bot audio if available
            if (voiceData?.ask?.audio_base64) {
                await playBase64Audio(voiceData.ask.audio_base64);
            }

            setIsProcessing(false);

        } catch (error) {
            console.error('Audio processing failed:', error);
            setIsProcessing(false);
        }
    };

    const stopSession = () => {
        console.log('Stopping session...');

        passiveListeningRef.current = false;
        clearInterval(vadIntervalRef.current);

        if (recordingRef.current) {
            recordingRef.current.stopAndUnloadAsync().catch(() => { });
            recordingRef.current = null;
        }

        setIsRecording(false);
        setSessionStarted(false);
        sessionIdRef.current = null;
    };

    return (
        <LinearGradient
            colors={['#020617', '#071a2f', '#001a33']}
            style={{ flex: 1 }}
        >
            <WaterBackground />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Health Care Assistant</Text>
            </View>
            <ScrollView
                ref={scrollViewRef}
                style={[styles.chatArea, { backgroundColor: 'transparent' }]}
                contentContainerStyle={{ paddingBottom: 20 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', marginTop: 100 }}>
                        <Text style={styles.title}>Welcome</Text>
                        <Text style={styles.subtitle}>Select language and tap mic to start</Text>
                    </View>
                ) : (
                    messages.map(msg => (
                        <View
                            key={msg.id}
                            style={msg.sender === 'user' ? styles.userBubble :
                                msg.sender === 'system' ? styles.systemBubble :
                                    styles.botBubble}
                        >
                            <Text style={msg.sender === 'user' ? styles.userText :
                                msg.sender === 'system' ? styles.systemText :
                                    styles.botText}>
                                {msg.text}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>

            <View style={styles.languageArea}>
                <Text style={styles.languageLabel}>Select Language:</Text>
                <Pressable
                    style={styles.languageButton}
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                >
                    <Text style={styles.languageButtonText}>
                        {LANG_MAP[language]?.name || "Select Language"}
                    </Text>
                </Pressable>

                {dropdownOpen && (
                    <View style={styles.languageDropdown}>
                        {Object.entries(LANG_MAP).map(([key, val]) => (
                            <Pressable
                                key={key}
                                style={styles.languageOption}
                                onPress={() => {
                                    setLanguage(key);
                                    setDropdownOpen(false);
                                }}
                            >
                                <Text style={styles.languageOptionText}>{val.name}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.bottomArea}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

                    <TextInput
                        value={manualInput}
                        onChangeText={setManualInput}
                        placeholder="Type Instead..."
                        placeholderTextColor="#9ca3af"
                        onSubmitEditing={() => {
                            if (manualInput.trim()) {
                                processManualText(manualInput);
                                setManualInput("");
                            }
                        }}
                        style={[styles.inputContainer, { flex: 1 }]}
                    />
                    <Pressable
                        style={[styles.micButton, sessionStarted && styles.micButtonRecording]}
                        onPress={handleStartSession}
                        disabled={isProcessing}
                    >
                        <SvgMic size={32} color={sessionStarted ? "#ffffff" : "#7dd3fc"} />
                    </Pressable>

                </View>
            </View>
            <StatusBar style="light" />
        </LinearGradient>
    );
}