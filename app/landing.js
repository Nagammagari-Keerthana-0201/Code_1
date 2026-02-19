import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import WaterBackground from '../components/WaterBackground';
import { styles } from '../styles/landing.styles';

import { useRouter } from 'expo-router';

const TypewriterText = ({ text, style, speed = 60, pause = 1000 }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        let timeout;

        if (!isDeleting && index < text.length) {
            timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text.charAt(index));
                setIndex(index + 1);
            }, speed);
        }
        else if (!isDeleting && index === text.length) {
            timeout = setTimeout(() => {
                setIsDeleting(true);
            }, pause);
        }
        else if (isDeleting && index > 0) {
            timeout = setTimeout(() => {
                setDisplayedText((prev) => prev.slice(0, -1));
                setIndex(index - 1);
            }, speed / 2);
        }
        else if (isDeleting && index === 0) {
            setIsDeleting(false);
        }

        return () => clearTimeout(timeout);
    }, [index, isDeleting, text]);

    return <Text style={style}>{displayedText}</Text>;
};


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
const SvgDoctor = ({ size = 28, color = "#94a3b8" }) => (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <Path
            d="M32 8c-8 0-14 6-14 14v4c0 4 2 8 6 10v4h16v-4c4-2 6-6 6-10v-4c0-8-6-14-14-14z"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M16 56c0-8 8-12 16-12s16 4 16 12"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <Path
            d="M22 44v6M42 44v6"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
        />
    </Svg>
);

const API_BASE_URL = 'https://handsome-nena-mignon.ngrok-free.dev';
const VAD_THRESHOLD = -30;
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
    const [isWaitingForBot, setIsWaitingForBot] = useState(false);
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
    const isBotSpeakingRef = useRef(false);
    const isWaitingForBotRef = useRef(false);
    const router = useRouter();

    const generateUUID = () => {
        return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    };

    // WebSocket setup
    const connectWebSocket = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        const wsUrl = `ws://handsome-nena-mignon.ngrok-free.dev/ws/audio`;
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

            ws.onmessage = async (event) => {
                try {
                    if (typeof event.data !== 'string') return;

                    // If it doesn't start with {, ignore it as non-JSON (e.g. server crash string)
                    if (!event.data.trim().startsWith("{")) {
                        console.warn("Non-JSON WS response received:", event.data.substring(0, 100));
                        return;
                    }

                    let data;
                    try {
                        data = JSON.parse(event.data);
                    } catch (e) {
                        console.warn('Invalid JSON from WebSocket:', event.data.substring(0, 100));
                        return;
                    }

                    if (data.success && data.translation) {
                        const asrText = data.translation.asr || "";
                        const translationText = data.translation.translation || asrText;
                        const normalizedLang = LANG_MAP[language]?.code || "en";

                        // Update UI with what the user said
                        setMessages(prev => {
                            const newMessages = [...prev];
                            const lastIndex = newMessages.length - 1;
                            if (newMessages[lastIndex]?.text === 'Listening...') {
                                newMessages[lastIndex].text = asrText;
                            }
                            return newMessages;
                        });

                        setIsProcessing(true); // Lock it
                        // Call the voice data collector API
                        const voiceResponse = await fetch(`${API_BASE_URL}/api/collect/voice`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'ngrok-skip-browser-warning': 'true'
                            },
                            body: JSON.stringify({
                                session_id: sessionIdRef.current,
                                user_input: translationText,
                                lang: normalizedLang,
                            }),
                        });

                        const voiceData = await voiceResponse.json();

                        // Normalize response format:
                        // 1. { ask: { advice_text, audio_base64 } } -> Intermediate
                        // 2. { response: { advice_text, audio_base64 }, hospitals } -> Final (Medium/High)
                        // 3. { advice_text, audio_base64 } -> Final (Low Severity)

                        const askObj = voiceData?.ask || voiceData?.response || voiceData;
                        const botResponse = askObj?.advice_text || voiceData?.text || "";
                        const audioBase64 = askObj?.audio_base64 || null;
                        const hospitals = voiceData?.hospitals || [];

                        if (botResponse) {
                            addMessage({ sender: 'bot', text: botResponse, hospitals: hospitals });
                        }

                        if (audioBase64) {
                            await playBase64Audio(audioBase64);
                        } else {
                            // If no audio, resume listening immediately
                            isWaitingForBotRef.current = false;
                            setIsWaitingForBot(false);
                        }

                        // Restart passive listening ONLY after bot is done
                        if (passiveListeningRef.current) {
                            await startPassiveListening();
                        }

                        setIsProcessing(false);
                    }

                    if (data.type === 'audio' && data.audio) {
                        playBase64Audio(data.audio);
                    }
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                    setIsProcessing(false);
                    isWaitingForBotRef.current = false;
                    setIsWaitingForBot(false);
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
        if (message.text) {
            message.text = message.text.replace(/\*\*/g, '');
        }
        setMessages(prev => [...prev, { id: Date.now(), ...message }]);
    };

    const playBase64Audio = async (base64Data) => {
        isBotSpeakingRef.current = true;
        return new Promise(async (resolve, reject) => {
            let hasFinished = false;

            const cleanupAndResolve = (source) => {
                if (hasFinished) return;
                hasFinished = true;

                console.log(`Audio cleanup triggered by: ${source}`);

                setTimeout(() => {
                    isBotSpeakingRef.current = false;
                    isWaitingForBotRef.current = false;
                    setIsWaitingForBot(false);
                    resolve();
                }, 1000);
            };

            try {
                if (!base64Data) {
                    console.error('No base64 audio data provided');
                    reject(new Error('No audio data'));
                    return;
                }

                console.log(' Playing audio, length:', base64Data.length);

                const fileUri = `${FileSystem.cacheDirectory}temp_audio_${Date.now()}.wav`;

                await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                    encoding: 'base64'
                });

                console.log('Audio file created:', fileUri);

                // Create and play sound
                const { sound } = await Audio.Sound.createAsync(
                    { uri: fileUri },
                    { shouldPlay: true }
                );

                // Wait for playback to finish
                sound.setOnPlaybackStatusUpdate(async (status) => {
                    if (status.didJustFinish) {
                        await sound.unloadAsync();
                        try {
                            await FileSystem.deleteAsync(fileUri, { idempotent: true });
                        } catch { }

                        cleanupAndResolve('playback_finish');
                    }
                });

                // Safety fallback for very long advice - 120 seconds
                setTimeout(async () => {
                    if (hasFinished) return;
                    try {
                        await sound.unloadAsync();
                        await FileSystem.deleteAsync(fileUri, { idempotent: true });
                    } catch { }
                    cleanupAndResolve('safety_timeout');
                }, 120000);

            } catch (error) {
                console.error('Audio playback failed:', error);
                isBotSpeakingRef.current = false;
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
            const welcomeResponse = await fetch(`${API_BASE_URL}/api/collect/voice-welcome`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
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
            if (!recordingRef.current || isBotSpeakingRef.current || isWaitingForBotRef.current) return;

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

        isWaitingForBotRef.current = true;
        setIsWaitingForBot(true);

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
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };

    // Process audio file (send via WebSocket)
    const processAudioFile = async (audioUri) => {
        try {
            setIsProcessing(true);
            const normalizedLang = LANG_MAP[language]?.code || "en";

            // Read file as base64
            const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
                encoding: 'base64',
            });

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                console.log('Sending audio via WebSocket...');
                wsRef.current.send(JSON.stringify({
                    audio: audioBase64,
                    lang: normalizedLang,
                    session_id: sessionIdRef.current
                }));
            } else {
                console.warn('WebSocket not open, falling back to POST');
                // ... fallback to fetch if needed or reconnect
                connectWebSocket();
            }

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


    const processManualText = async (text) => {
        if (!text.trim()) return;

        // Ensure session exists
        if (!sessionIdRef.current) {
            sessionIdRef.current = generateUUID();
            setSessionStarted(true);
        }

        const normalizedLang = LANG_MAP[language]?.code || "en";
        const isEnglish = normalizedLang === "en";

        // Add user message immediately
        addMessage({ sender: 'user', text: text });
        setIsProcessing(true);

        try {
            let finalText = text;

            // 1. Translate if not English
            if (!isEnglish) {
                console.log(`Translating from ${normalizedLang} to en...`);
                // Use the text-translate endpoint
                const transResponse = await fetch(`${API_BASE_URL}/api/transulate/text-translate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({
                        text: text,
                        source_lang: normalizedLang,
                        target_lang: "en"
                    }),
                });

                const transData = await transResponse.json();
                if (transData.translation) {
                    finalText = transData.translation;
                    console.log('Translated text:', finalText);
                } else {
                    console.warn('Translation failed, using original text');
                }
            }

            // 2. Send to Voice API (with translated text)
            const voiceResponse = await fetch(`${API_BASE_URL}/api/collect/voice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    user_input: finalText,
                    lang: normalizedLang,
                }),
            });

            const voiceData = await voiceResponse.json();

            const askObj = voiceData?.ask || voiceData?.response || voiceData;
            const botResponse = askObj?.advice_text || voiceData?.text || "";
            const audioBase64 = askObj?.audio_base64 || null;
            const hospitals = voiceData?.hospitals || [];

            if (botResponse) {
                addMessage({ sender: 'bot', text: botResponse, hospitals: hospitals });
            }

            if (audioBase64) {
                await playBase64Audio(audioBase64);
            }
        } catch (error) {
            console.error('Manual text processing failed:', error);
            Alert.alert('Error', 'Failed to process text.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <LinearGradient
            colors={['#020617', '#071a2f', '#001a33']}
            style={{ flex: 1 }}
        >
            <WaterBackground />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Health Care Assistant</Text>

                <Pressable
                    style={styles.doctorIconWrapper}
                    onPress={() => {
                        router.push("/doctor-login");
                    }}
                >
                    <SvgDoctor />
                </Pressable>

            </View>

            <ScrollView
                ref={scrollViewRef}
                style={[styles.chatArea, { backgroundColor: 'transparent' }]}
                contentContainerStyle={{ paddingBottom: 20 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', marginTop: 100 }}>
                        <TypewriterText
                            text=" Welcome"
                            style={styles.title}
                            speed={60}
                            pause={1500}
                        />
                        <Text style={styles.subtitle}>
                            Choose Your Language and tap mic to start
                        </Text>
                    </View>
                ) : (
                    messages.map(msg => (
                        <View key={msg.id}>
                            <View
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
                            {msg.hospitals && msg.hospitals.length > 0 && (
                                <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                                    <Text style={{ color: '#00f2ff', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                                        📍 Nearest Hospitals:
                                    </Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {msg.hospitals.map((h, i) => (
                                            <Pressable
                                                key={i}
                                                style={{
                                                    backgroundColor: 'rgba(0, 242, 255, 0.1)',
                                                    borderWidth: 1,
                                                    borderColor: '#00f2ff',
                                                    borderRadius: 12,
                                                    padding: 12,
                                                    marginRight: 10,
                                                    minWidth: 150
                                                }}
                                                onPress={() => {
                                                    // Use Linking to open URL
                                                    import('react-native').then(({ Linking }) => {
                                                        Linking.openURL(h.link);
                                                    }).catch(err => console.error("Couldn't load page", err));
                                                }}
                                            >
                                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{h.name}</Text>
                                                <Text style={{ color: '#00f2ff', fontSize: 12, marginTop: 4 }}>Open Maps →</Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
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
                        style={{
                            backgroundColor: manualInput.trim() ? '#2563eb' : '#334155', // Blue if active, dark gray if disabled
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 8
                        }}
                        onPress={() => {
                            if (manualInput.trim()) {
                                processManualText(manualInput);
                                setManualInput("");
                            }
                        }}
                        disabled={!manualInput.trim()}
                    >
                        <Text style={{ color: manualInput.trim() ? 'white' : '#94a3b8', fontWeight: 'bold' }}>Send</Text>
                    </Pressable>
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