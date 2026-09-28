import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type ScreenType =
  | 'overview'
  | 'login'
  | 'machines'
  | 'service'
  | 'reagents'
  | 'shop'
  | 'warranty'
  | 'tracking'
  | 'feedback'
  | 'training'
  | 'notifications'
  | 'profile'
  | 'engineerTracking'
  | 'reports';

interface TicketData {
  ticketId: string;
  analyzer: string;
  issueType: string;
  status: string;
  slaTarget: string;
  assignedEngineer: {
    name: string;
    role: string;
    etaMins: number;
    phone: string;
    distanceKm: number;
  };
  verificationOtp: string;
}

interface ReagentItem {
  id: string;
  name: string;
  sku: string;
  price: number;
}

/* ====================================================
   BUILT-IN MERIL AI CHATBOT MODAL
==================================================== */
interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

interface MerilChatBotModalProps {
  visible: boolean;
  onClose: () => void;
}

const AI_KNOWLEDGE_BASE = [
  {
    keywords: ['myval', 'valve', 'aortic', 'thv', 'stenosis'],
    answer:
      "Myval THV series is India's first indigenously developed transcatheter aortic heart valve system for treating severe aortic stenosis, offering precise sizing and low hemodynamic gradients.",
  },
  {
    keywords: ['meres', 'meres100', 'scaffold', 'brs', 'stent'],
    answer:
      "MeRes100 is the world's first 100-micron bioresorbable vascular scaffold (BRS), engineered to provide temporary vessel support and dissolve completely in coronary arteries over time.",
  },
  {
    keywords: ['robot', 'robotic', 'misso', 'cuvis', 'ortho', 'joint', 'knee'],
    answer:
      'Meril Orthopedics features MISSO and Cuvis robotic-assisted surgical systems for high-precision knee and hip joint replacements with personalized CT pre-planning.',
  },
  {
    keywords: ['endo', 'suture', 'mesh', 'stapler', 'hemostat', 'sealant'],
    answer:
      'Meril Endo-Surgery provides absorbable/non-absorbable surgical sutures, tissue sealants, absorbable hemostats, surgical meshes for hernia repair, and mechanical staplers.',
  },
  {
    keywords: ['ivd', 'diagnostics', 'analyzer', 'reagent', 'elisa', 'quant-mate', 'autochem'],
    answer:
      'Meril In-Vitro Diagnostics (IVD) covers clinical chemistry analyzers (AutoChem, Quant-Mate), hematology platforms, ELISA kits, and rapid diagnostic testing strips.',
  },
  {
    keywords: ['support', 'service', 'emergency', 'sos', 'engineer'],
    answer:
      'For technical emergencies or analyzer breakdown, activate the 4-Hour Emergency SOS in the Meril One app or connect with your field specialist.',
  },
];

const MerilChatBotModal: React.FC<MerilChatBotModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your Meril MedTech AI Assistant. Ask me anything about our vascular interventions, orthopedic robotics, surgical solutions, or diagnostic analyzers.',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const getBotResponse = (query: string): string => {
    const q = query.toLowerCase();
    for (const entry of AI_KNOWLEDGE_BASE) {
      if (entry.keywords.some((k) => q.includes(k))) {
        return entry.answer;
      }
    }
    return 'Meril delivers advanced solutions across Vascular Interventions (Myval, MeRes100), Robotics (MISSO, Cuvis), Endo-Surgery, and IVD Diagnostics. You can ask for specific product details or technical documentation.';
  };

  const handleSend = (userQuery?: string) => {
    const textToSend = userQuery || inputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
    };

    const replyText = getBotResponse(textToSend);
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: replyText,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (!userQuery) setInputText('');
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'flex-end' }}
      >
        <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '82%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#e2e8f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#007b8a', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="sparkles" size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f2930' }}>Meril MedTech AI</Text>
                <Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '600' }}>● Online Knowledge Base</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', padding: 10, gap: 6, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderColor: '#f1f5f9', flexWrap: 'wrap' }}>
            {['Myval THV', 'MeRes100 BRS', 'MISSO Robotics', 'IVD Analyzers'].map((pill, i) => (
              <TouchableOpacity
                key={i}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: '#e6f4f6', borderWidth: 1, borderColor: '#007b8a' }}
                onPress={() => handleSend(`Tell me about ${pill}`)}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#007b8a' }}>{pill}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {messages.map((item) => (
              <View
                key={item.id}
                style={{
                  maxWidth: '82%',
                  padding: 12,
                  borderRadius: 14,
                  alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: item.sender === 'user' ? '#007b8a' : '#f1f5f9',
                  borderWidth: item.sender === 'user' ? 0 : 1,
                  borderColor: '#e2e8f0',
                }}
              >
                <Text style={{ fontSize: 13, lineHeight: 18, color: item.sender === 'user' ? '#ffffff' : '#0f2930' }}>
                  {item.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderColor: '#e2e8f0', gap: 8 }}>
            <TextInput
              style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, color: '#0f2930' }}
              placeholder="Ask about Myval, MISSO, sutures..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#007b8a', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => handleSend()}
            >
              <Ionicons name="send" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ====================================================
   MAIN COMPONENT
==================================================== */
export const MerilCustomerScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('overview');
  const [clientId, setClientId] = useState('MER-882190');
  const [phoneOrPass, setPhoneOrPass] = useState('password123');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [sosActive, setSosActive] = useState(false);
  const [chatBotOpen, setChatBotOpen] = useState(false);

  const OTP_EXPIRY_SECONDS = 30;
  const [currentOtp, setCurrentOtp] = useState('5892');
  const [otpTimeLeft, setOtpTimeLeft] = useState(OTP_EXPIRY_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          const autoRolledOtp = Math.floor(1000 + Math.random() * 9000).toString();
          setCurrentOtp(autoRolledOtp);
          return OTP_EXPIRY_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [unreadCount, setUnreadCount] = useState(4);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const [liveTicket, setLiveTicket] = useState<TicketData | null>(null);
  const [liveReagents, setLiveReagents] = useState<ReagentItem[]>([]);
  const [loadingService, setLoadingService] = useState(false);
  const [loadingReagents, setLoadingReagents] = useState(false);

  const getBaseUrl = () => {
    return Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : 'https://customer-app-eight-mu.vercel.app';
  };

  const fetchServiceData = async () => {
    setLoadingService(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/service`);
      const data = await res.json();
      if (data?.activeTickets && data.activeTickets.length > 0) {
        setLiveTicket(data.activeTickets[0]);
      }
    } catch (err) {
      console.warn('Fallback service data used:', err);
    } finally {
      setLoadingService(false);
    }
  };

  const fetchReagentsData = async () => {
    setLoadingReagents(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/reagents`);
      const data = await res.json();
      if (data?.reagents && data.reagents.length > 0) {
        setLiveReagents(data.reagents);
      }
    } catch (err) {
      console.warn('Fallback reagents data used:', err);
    } finally {
      setLoadingReagents(false);
    }
  };

  useEffect(() => {
    if (currentScreen !== 'login') {
      fetchServiceData();
      fetchReagentsData();
    }
  }, [currentScreen]);

  const handleLogin = async () => {
    if (!clientId.trim() || !phoneOrPass.trim()) {
      Alert.alert('Missing Fields', 'Please enter your registered credentials.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, password: phoneOrPass }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setCurrentScreen('overview');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (err) {
      setCurrentScreen('overview');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        setCurrentScreen('login');
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => setCurrentScreen('login') },
      ]);
    }
  };

  const notificationsList = [
    {
      id: '1',
      title: 'Engineer Dispatched',
      desc: `${liveTicket?.assignedEngineer?.name ?? 'Rajesh Sharma'} is en route for ticket #${liveTicket?.ticketId ?? 'MER-90214'}.`,
      time: '10m ago',
      unread: true,
    },
    {
      id: '2',
      title: 'AMC Expiry Notice',
      desc: 'AutoChem II maintenance contract renewal due in 28 days.',
      time: '2h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Reagent Order Shipped',
      desc: 'Batch #MER-CH-012 has left the regional diagnostic hub.',
      time: 'Yesterday',
      unread: true,
    },
    {
      id: '4',
      title: 'Preventive Calibration Complete',
      desc: 'Signed calibration audit report is ready for download.',
      time: '3d ago',
      unread: false,
    },
  ];

  const engineer = liveTicket?.assignedEngineer;

  /* ====================================================
      1. LOGIN SCREEN
  ==================================================== */
  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.loginSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f7f8" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.loginContainer}>
          <ScrollView contentContainerStyle={styles.loginScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.loginHeader}>
              <View style={styles.loginBrandCircle}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png' }}
                  style={styles.loginBrandImage}
                />
              </View>
              <Text style={styles.loginTitle}>MERIL ONE</Text>
              <Text style={styles.loginSubtitle}>Customer & Lab Diagnostic Portal</Text>
            </View>

            <View style={styles.loginCard}>
              <Text style={styles.cardHeading}>Sign In to Account</Text>
              <Text style={styles.cardSub}>Enter your hospital / diagnostic center credentials</Text>

              <View style={styles.tabToggle}>
                <TouchableOpacity
                  style={[styles.tabButton, loginMethod === 'password' && styles.tabButtonActive]}
                  onPress={() => setLoginMethod('password')}
                >
                  <Text style={[styles.tabText, loginMethod === 'password' && styles.tabTextActive]}>Password</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, loginMethod === 'otp' && styles.tabButtonActive]}
                  onPress={() => {
                    setLoginMethod('otp');
                    setOtpSent(false);
                  }}
                >
                  <Text style={[styles.tabText, loginMethod === 'otp' && styles.tabTextActive]}>Phone OTP</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>LAB / CLIENT ID</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. MER-882190"
                  placeholderTextColor="#94a3b8"
                  value={clientId}
                  onChangeText={setClientId}
                  autoCapitalize="characters"
                />
              </View>

              <Text style={styles.inputLabel}>
                {loginMethod === 'password' ? 'ACCESS PASSWORD' : 'PHONE / VERIFICATION CODE'}
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name={loginMethod === 'password' ? 'lock-closed-outline' : 'phone-portrait-outline'}
                  size={18}
                  color="#64748b"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder={loginMethod === 'password' ? 'Enter password' : 'Enter 6-digit OTP'}
                  placeholderTextColor="#94a3b8"
                  value={phoneOrPass}
                  onChangeText={setPhoneOrPass}
                  secureTextEntry={loginMethod === 'password'}
                />
                {loginMethod === 'otp' && (
                  <TouchableOpacity
                    style={styles.sendOtpBtn}
                    onPress={() => {
                      setOtpSent(true);
                      Alert.alert('OTP Dispatched', 'Verification code sent to registered number.');
                    }}
                  >
                    <Text style={styles.sendOtpText}>{otpSent ? 'Resend' : 'Send Code'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.loginBtnText}>Enter Portal →</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ====================================================
      2. NOTIFICATIONS SUB-PAGE
  ==================================================== */
  const renderNotificationsPage = () => (
    <View style={styles.subPageContainer}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageHeader}>Notifications</Text>
          <Text style={styles.pageSubHeader}>Service alerts, reagent orders & warranty notices.</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={() => setUnreadCount(0)}>
            <Text style={styles.markReadText}>Mark Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notificationsList.map((item) => (
        <View key={item.id} style={[styles.notifCard, item.unread && styles.notifCardUnread]}>
          <View style={styles.notifIconCircle}>
            <Ionicons name="notifications-outline" size={18} color="#007b8a" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            <Text style={styles.notifDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  /* ====================================================
      3. PROFILE SUB-PAGE
  ==================================================== */
  const renderProfilePage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Laboratory Profile</Text>
      <Text style={styles.pageSubHeader}>Hospital credentials and registered account session.</Text>

      <View style={styles.profileHeroCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
          }}
          style={styles.profileAvatarLarge}
        />
        <View style={styles.profileHeroText}>
          <Text style={styles.profileName}>Apollo Diagnostic Center</Text>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>✓ Verified Client</Text>
          </View>
          <Text style={styles.profileIdText}>Client ID: {clientId}</Text>
        </View>
      </View>

      <View style={styles.stackedButtonGroup}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('machines')}>
          <Text style={styles.primaryBtnText}>View Registered Machines</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sign Out of Session 🚪</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ====================================================
      4. MACHINES SUB-PAGE
  ==================================================== */
  const renderMachinesPage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Registered Analyzers (3)</Text>
      <Text style={styles.pageSubHeader}>Manage lab instruments, serial logs, and preventive maintenance.</Text>

      {[
        {
          name: liveTicket?.analyzer ?? 'Meril Quant-Mate 400',
          sn: 'MQM-2024-8841',
          status: 'Operational',
          nextPM: '15 Oct 2026',
          warranty: 'Till Nov 2027',
          image:
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&auto=format&fit=crop&q=80',
        },
      ].map((machine, i) => (
        <View key={i} style={styles.recordCard}>
          <View style={styles.machineCardTop}>
            <Image source={{ uri: machine.image }} style={styles.machineThumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.recordTitle}>{machine.name}</Text>
              <Text style={styles.recordSubtitle}>S/N: {machine.sn}</Text>
              <Text style={styles.metaItem}>🗓 Next: {machine.nextPM}</Text>
              <Text style={styles.metaItem}>🛡 {machine.warranty}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('service')}>
            <Text style={styles.primaryBtnText}>Book Service</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  /* ====================================================
      5. SERVICE PAGE
  ==================================================== */
  const renderServicePage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Service & SOS Support</Text>
      <Text style={styles.pageSubHeader}>Dispatch Meril field specialists or schedule routine visits.</Text>

      <View style={styles.emergencyBox}>
        <View style={styles.emergencyHeader}>
          <Text style={styles.emergencyTitle}>🚨 Emergency SOS</Text>
          <Text style={styles.emergencyTime}>4-Hr Target</Text>
        </View>
        <Text style={styles.emergencyDesc}>Trigger an immediate field escalation if analyzer failure halts diagnostics.</Text>
        <TouchableOpacity
          style={[styles.sosActionBtn, sosActive && styles.sosActiveBtn]}
          onPress={() => {
            setSosActive(!sosActive);
            Alert.alert(sosActive ? 'SOS Cancelled' : 'SOS Dispatched', 'Priority alert state updated.');
          }}
        >
          <Text style={styles.sosActionBtnText}>{sosActive ? 'CANCEL ACTIVE SOS' : 'TRIGGER EMERGENCY SOS'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.recordCard, { marginTop: 14 }]}>
        <Text style={styles.recordTitle}>Active Request: {liveTicket ? liveTicket.ticketId : 'MER-90214'}</Text>
        <Text style={styles.metaItem}>Engineer: {liveTicket?.assignedEngineer?.name ?? 'Rajesh Sharma'}</Text>
        <View style={styles.otpBanner}>
          <Text style={styles.otpBannerTitle}>Service Closure OTP</Text>
          <Text style={styles.otpNumber}>{currentOtp}</Text>
          <Text style={styles.otpNote}>Auto-refreshes in {otpTimeLeft}s.</Text>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('engineerTracking')}>
          <Text style={styles.primaryBtnText}>Track Engineer Location 📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ====================================================
      6. GPS TRACKING PAGE
  ==================================================== */
  const renderEngineerTrackingPage = () => {
    const googleMapUrl = 'https://maps.google.com/maps?q=19.088,72.889&hl=en&z=15&output=embed';

    return (
      <View style={styles.subPageContainer}>
        <Text style={styles.pageHeader}>Live GPS Telemetry</Text>
        <Text style={styles.pageSubHeader}>Real-time technician transit and corridor routing.</Text>

        <View style={styles.liveMapWrapper}>
          {Platform.OS === 'web' ? (
            // @ts-ignore
            <iframe
              title="Google Maps Live Tracking"
              src={googleMapUrl}
              style={{ width: '100%', height: 260, border: 'none', borderRadius: 12 }}
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80',
              }}
              style={styles.mapImage}
            />
          )}
        </View>

        <View style={[styles.recordCard, { marginTop: 12 }]}>
          <Text style={styles.recordTitle}>{engineer?.name ?? 'Rajesh Sharma'}</Text>
          <Text style={styles.metaItem}>ETA {engineer?.etaMins ?? 25} Mins Away (Distance: 3.4 km)</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 10 }]}
            onPress={() => Alert.alert('Dialing Specialist', 'Connecting call...')}
          >
            <Text style={styles.primaryBtnText}>📞 Voice Call Specialist</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ====================================================
      7. REAGENTS PAGE
  ==================================================== */
  const renderReagentsPage = () => {
    const defaultReagents: ReagentItem[] = [
      { id: '1', name: 'Meril SGOT / AST Clinical Pack', sku: 'MER-CH-012', price: 4850 },
      { id: '2', name: 'Direct Creatinine Kinetic Assay', sku: 'MER-CH-044', price: 3200 },
    ];
    const items = liveReagents.length > 0 ? liveReagents : defaultReagents;

    return (
      <View style={styles.subPageContainer}>
        <Text style={styles.pageHeader}>Reagent Ordering</Text>
        <Text style={styles.pageSubHeader}>Original Meril assays, calibrators and controls.</Text>

        {items.map((reagent) => (
          <View key={reagent.id} style={styles.recordCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.recordTitle}>{reagent.name}</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#007b8a' }}>₹{reagent.price}</Text>
            </View>
            <Text style={styles.recordSubtitle}>SKU: {reagent.sku} • In Stock</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => Alert.alert('Order Placed', `${reagent.name} added to next shipment.`)}
            >
              <Text style={styles.primaryBtnText}>Reorder Assays 📦</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  /* ====================================================
      OTHER SUB-PAGES
  ==================================================== */
  const renderGenericSubPage = (title: string, desc: string) => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>{title}</Text>
      <Text style={styles.pageSubHeader}>{desc}</Text>
      <View style={styles.recordCard}>
        <Text style={styles.recordTitle}>Standard Meril Module</Text>
        <Text style={styles.metaItem}>Operational and connected to active regional server.</Text>
      </View>
    </View>
  );

  /* ====================================================
      OVERVIEW DASHBOARD
  ==================================================== */
  const renderOverviewPage = () => (
    <>
      <TouchableOpacity
        style={[styles.ctaButton, sosActive && styles.ctaButtonActive]}
        activeOpacity={0.85}
        onPress={() => {
          setSosActive(!sosActive);
          Alert.alert(sosActive ? 'SOS Disengaged' : 'Emergency SOS Dispatched');
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="alert-circle-outline" size={18} color={sosActive ? '#be123c' : '#007b8a'} />
          <Text style={[styles.ctaButtonText, sosActive && { color: '#be123c' }]}>
            {sosActive ? 'SOS ACTIVE • CANCEL REQUEST' : 'CTA BUTTON : 4-HR EMERGENCY SOS'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerImageBlock}
        activeOpacity={0.9}
        onPress={() => setCurrentScreen('machines')}
      >
        <View style={styles.headerContainer}>
          <View style={styles.rowBetween}>
            <Text style={styles.headerTitle}>Meril Life Sciences • Advancing Healthcare</Text>
            <View style={styles.livePill}>
              <Text style={styles.livePillText}>INNOVATION</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Dedicated to advancing healthcare solutions that improve patient outcomes.</Text>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80' }}
            style={styles.imageMain}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.dualButtonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={() => setCurrentScreen('service')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="construct-outline" size={16} color="#ffffff" />
            <Text style={styles.actionBtnPrimaryText}>BUTTON: Book Service</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary]}
          onPress={() => setCurrentScreen('engineerTracking')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location-outline" size={16} color="#0f2930" />
            <Text style={styles.actionBtnSecondaryText}>BUTTON: Track Live</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardHeaderSmall}>ASSIGNED SPECIALIST</Text>
            <Text style={styles.cardTitle}>{engineer?.name ?? 'Rajesh Sharma'}</Text>
          </View>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>ETA {engineer?.etaMins ?? 25} MINS</Text>
          </View>
        </View>

        <View style={styles.otpStrip}>
          <Text style={styles.otpLabel}>Verification OTP:</Text>
          <Text style={styles.otpValue}>{currentOtp}</Text>
        </View>

        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.cardMiniBtn}
            onPress={() => Alert.alert('Dialing Specialist', 'Connecting voice call...')}
          >
            <Text style={styles.cardMiniBtnText}>📞 Voice Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cardMiniBtn, { backgroundColor: '#16a34a' }]}
            onPress={() => Alert.alert('Connecting Specialist', 'Opening chat...')}
          >
            <Text style={styles.cardMiniBtnText}>💬 Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  /* ====================================================
      APP SHELL
  ==================================================== */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* TOP HEADER */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarBrand} onPress={() => setCurrentScreen('overview')}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>M</Text>
          </View>
          <View>
            <Text style={styles.topBarTitle}>MERIL ONE</Text>
            <Text style={styles.topBarSub}>Apollo Lab • MER-882190</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity style={styles.aiHeaderBtn} onPress={() => setChatBotOpen(true)}>
            <Ionicons name="sparkles" size={15} color="#007b8a" />
            <Text style={styles.aiHeaderBtnText}>Ask AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationBtn} onPress={() => setCurrentScreen('notifications')}>
            <Ionicons name="notifications-outline" size={18} color="#0f2930" />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileBadgeBtn} onPress={() => setCurrentScreen('profile')}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80' }}
              style={styles.topAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentScreen !== 'overview' && (
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('overview')}>
            <Text style={styles.backButtonText}>← Back to Overview</Text>
          </TouchableOpacity>
        )}

        {currentScreen === 'overview' && renderOverviewPage()}
        {currentScreen === 'notifications' && renderNotificationsPage()}
        {currentScreen === 'profile' && renderProfilePage()}
        {currentScreen === 'machines' && renderMachinesPage()}
        {currentScreen === 'service' && renderServicePage()}
        {currentScreen === 'engineerTracking' && renderEngineerTrackingPage()}
        {currentScreen === 'reagents' && renderReagentsPage()}
        {currentScreen === 'shop' && renderGenericSubPage('Equipment Catalogue', 'Explore next-generation clinical platforms.')}
        {currentScreen === 'warranty' && renderGenericSubPage('Warranty & AMC', 'Coverage policies and preventive compliance.')}
        {currentScreen === 'tracking' && renderGenericSubPage('Service Tracking', 'Timeline updates on active service tickets.')}
        {currentScreen === 'feedback' && renderGenericSubPage('Technician Feedback', 'Rate recent service satisfaction.')}
        {currentScreen === 'training' && renderGenericSubPage('SOPs & Training', 'Digital guides and clinical operating procedures.')}
        {currentScreen === 'reports' && renderGenericSubPage('Service Reports', 'Download signed ISO and NABL compliance certificates.')}
      </ScrollView>

      {/* BOTTOM TAB BAR */}
      <View style={styles.tabBar}>
        <View style={styles.tabIconsRow}>
          {[
            { id: 'overview' as ScreenType, label: 'Home', icon: 'home-outline' },
            { id: 'machines' as ScreenType, label: 'Analyzers', icon: 'fitness-outline' },
            { id: 'service' as ScreenType, label: 'Service', icon: 'construct-outline' },
            { id: 'engineerTracking' as ScreenType, label: 'Tracking', icon: 'navigate-outline' },
            { id: 'profile' as ScreenType, label: 'Profile', icon: 'person-outline' },
          ].map((tab) => {
            const isSelected = currentScreen === tab.id;
            const iconColor = isSelected ? '#007b8a' : '#64748b';
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => setCurrentScreen(tab.id)}
              >
                <View style={[styles.tabSquare, isSelected && styles.tabSquareActive]}>
                  <Ionicons name={tab.icon as any} size={20} color={iconColor} />
                </View>
                <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.floatingAiBtn} onPress={() => setChatBotOpen(true)}>
        <Ionicons name="sparkles" size={16} color="#ffffff" />
        <Text style={styles.floatingAiText}>Ask AI</Text>
      </TouchableOpacity>

      {/* CHATBOT MODAL */}
      <MerilChatBotModal visible={chatBotOpen} onClose={() => setChatBotOpen(false)} />
    </SafeAreaView>
  );
};

/* ====================================================
   STYLES
==================================================== */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, maxWidth: 520, width: '100%', alignSelf: 'center' },
  topBar: { height: 56, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' },
  topBarBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#007b8a', alignItems: 'center', justifyContent: 'center' },
  brandBadgeText: { color: '#ffffff', fontWeight: '900', fontSize: 15 },
  topBarTitle: { color: '#0f2930', fontSize: 14.5, fontWeight: '800' },
  topBarSub: { color: '#64748b', fontSize: 10 },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  unreadBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#dc2626', borderRadius: 9, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  unreadBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
  profileBadgeBtn: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', borderWidth: 1.5, borderColor: '#007b8a' },
  topAvatar: { width: '100%', height: '100%' },
  aiHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e6f4f6', borderWidth: 1, borderColor: '#007b8a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  aiHeaderBtnText: { color: '#007b8a', fontSize: 12, fontWeight: '800' },
  floatingAiBtn: { position: 'absolute', bottom: 90, right: 24, backgroundColor: '#007b8a', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, zIndex: 9999, elevation: 8 },
  floatingAiText: { color: '#ffffff', fontSize: 12.5, fontWeight: '800' },
  backButton: { alignSelf: 'flex-start', backgroundColor: '#ffffff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  backButtonText: { color: '#007b8a', fontWeight: '700', fontSize: 12 },
  ctaButton: { borderWidth: 1.5, borderColor: '#007b8a', backgroundColor: '#e6f4f6', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 14 },
  ctaButtonActive: { borderColor: '#e11d48', backgroundColor: '#ffe4e6' },
  ctaButtonText: { color: '#007b8a', fontSize: 12.5, fontWeight: '800' },
  headerImageBlock: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 14, backgroundColor: '#ffffff' },
  headerContainer: { padding: 12, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  headerTitle: { color: '#0f2930', fontSize: 15, fontWeight: '800' },
  headerSubtitle: { color: '#64748b', fontSize: 11, marginTop: 2 },
  livePill: { borderWidth: 1, borderColor: '#007b8a', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: '#e6f4f6' },
  livePillText: { color: '#007b8a', fontSize: 9.5, fontWeight: '800' },
  imageWrapper: { height: 180, width: '100%', backgroundColor: '#f8fafc' },
  imageMain: { width: '100%', height: '100%', resizeMode: 'cover' },
  dualButtonRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 11, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionBtnPrimary: { backgroundColor: '#007b8a', borderColor: '#007b8a' },
  actionBtnSecondary: { backgroundColor: '#ffffff' },
  actionBtnPrimaryText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  actionBtnSecondaryText: { color: '#0f2930', fontSize: 12, fontWeight: '700' },
  cardContainer: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, backgroundColor: '#ffffff', marginBottom: 12 },
  cardHeaderSmall: { color: '#64748b', fontSize: 9.5, fontWeight: '700' },
  cardTitle: { color: '#0f2930', fontSize: 14.5, fontWeight: '800', marginTop: 2 },
  cardBadge: { borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#f8fafc' },
  cardBadgeText: { color: '#007b8a', fontSize: 10, fontWeight: '800' },
  otpStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginVertical: 10 },
  otpLabel: { color: '#475569', fontSize: 11, fontWeight: '500' },
  otpValue: { color: '#007b8a', fontSize: 16, fontWeight: '900', letterSpacing: 3 },
  cardActionRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  cardMiniBtn: { flex: 1, backgroundColor: '#007b8a', paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardMiniBtnText: { color: '#ffffff', fontSize: 11.5, fontWeight: '700' },
  tabBar: { borderTopWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 18 : 8, paddingHorizontal: 10 },
  tabIconsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center', gap: 3 },
  tabSquare: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  tabSquareActive: { borderColor: '#007b8a', backgroundColor: '#e6f4f6' },
  tabLabel: { color: '#64748b', fontSize: 8.5, fontWeight: '700' },
  tabLabelActive: { color: '#007b8a' },
  subPageContainer: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  pageHeader: { fontSize: 18, fontWeight: '800', color: '#0f2930' },
  pageSubHeader: { fontSize: 11.5, color: '#64748b', marginTop: 3, marginBottom: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordCard: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  recordTitle: { fontSize: 14, fontWeight: '700', color: '#0f2930' },
  recordSubtitle: { fontSize: 11.5, color: '#64748b', marginTop: 2 },
  metaItem: { fontSize: 11.5, color: '#475569', marginTop: 2 },
  primaryBtn: { backgroundColor: '#007b8a', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#ffffff', fontSize: 12.5, fontWeight: '700' },
  stackedButtonGroup: { flexDirection: 'column', gap: 8 },
  machineCardTop: { flexDirection: 'row', gap: 12 },
  machineThumb: { width: 60, height: 60, borderRadius: 6 },
  emergencyBox: { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3', borderRadius: 10, padding: 12 },
  emergencyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  emergencyTitle: { fontSize: 14, fontWeight: '800', color: '#be123c' },
  emergencyTime: { fontSize: 10, fontWeight: '700', color: '#be123c', backgroundColor: '#ffe4e6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  emergencyDesc: { fontSize: 11, color: '#881337', marginBottom: 10 },
  sosActionBtn: { backgroundColor: '#e11d48', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  sosActiveBtn: { backgroundColor: '#9f1239' },
  sosActionBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  otpBanner: { backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#a5f3fc', borderRadius: 8, padding: 10, marginVertical: 10, alignItems: 'center' },
  otpBannerTitle: { fontSize: 10.5, color: '#0e7490', fontWeight: '600' },
  otpNumber: { fontSize: 20, fontWeight: '900', letterSpacing: 4, color: '#0891b2', marginVertical: 2 },
  otpNote: { fontSize: 10 },
  liveMapWrapper: { height: 260, width: '100%', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  mapImage: { height: 260, width: '100%', borderRadius: 12 },
  profileHeroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, marginBottom: 16 },
  profileAvatarLarge: { width: 52, height: 52, borderRadius: 26 },
  profileHeroText: { flex: 1, marginLeft: 12 },
  profileName: { fontSize: 14.5, fontWeight: '800', color: '#0f2930' },
  verifiedTag: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 3 },
  verifiedTagText: { fontSize: 9, fontWeight: '700', color: '#15803d' },
  profileIdText: { fontSize: 11, color: '#007b8a', marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderColor: '#fecdd3', backgroundColor: '#fff1f2', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  logoutBtnText: { color: '#be123c', fontSize: 12, fontWeight: '700' },
  notifCard: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  notifCardUnread: { backgroundColor: '#ffffff', borderLeftWidth: 3.5, borderLeftColor: '#007b8a' },
  notifIconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 13, fontWeight: '700', color: '#0f2930' },
  notifTime: { fontSize: 10, color: '#64748b' },
  notifDesc: { fontSize: 11.5, color: '#475569', marginTop: 2 },
  markReadBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#e0f2fe', borderRadius: 6 },
  markReadText: { fontSize: 10.5, color: '#0284c7', fontWeight: '700' },
  loginSafeArea: { flex: 1, backgroundColor: '#f0f7f8' },
  loginContainer: { flex: 1 },
  loginScrollContent: { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 40, maxWidth: 480, width: '100%', alignSelf: 'center', justifyContent: 'center' },
  loginHeader: { alignItems: 'center', marginBottom: 26 },
  loginBrandCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#007b8a', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  loginBrandImage: { width: 32, height: 32, tintColor: '#ffffff' },
  loginTitle: { fontSize: 24, fontWeight: '900', color: '#0f2930', letterSpacing: 1 },
  loginSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  loginCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeading: { fontSize: 18, fontWeight: '800', color: '#0f2930' },
  cardSub: { fontSize: 12.5, color: '#64748b', marginTop: 3, marginBottom: 18 },
  tabToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 3, marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tabButtonActive: { backgroundColor: '#ffffff' },
  tabText: { fontSize: 12.5, color: '#64748b', fontWeight: '600' },
  tabTextActive: { color: '#007b8a', fontWeight: '700' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 },
  textInput: { flex: 1, fontSize: 13.5, color: '#0f2930', paddingVertical: Platform.OS === 'ios' ? 12 : 8 },
  sendOtpBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#e0f2fe', borderRadius: 6 },
  sendOtpText: { fontSize: 11.5, color: '#0284c7', fontWeight: '700' },
  loginBtn: { backgroundColor: '#007b8a', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  loginBtnText: { color: '#ffffff', fontSize: 14.5, fontWeight: '800' },
});