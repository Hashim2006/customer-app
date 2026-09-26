import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export const MerilCustomerScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('overview');

  // Form State
  const [clientId, setClientId] = useState('MER-882190');
  const [phoneOrPass, setPhoneOrPass] = useState('password123');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Core App State
  const [sosActive, setSosActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(4);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Live Backend Data States
  const [liveTicket, setLiveTicket] = useState<TicketData | null>(null);
  const [liveReagents, setLiveReagents] = useState<ReagentItem[]>([]);
  const [loadingService, setLoadingService] = useState(false);
  const [loadingReagents, setLoadingReagents] = useState(false);

  const getBaseUrl = () => {
    return Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : 'https://customer-app-eight-mu.vercel.app';
  };

  // Fetch Live Service Ticket from API
  const fetchServiceData = async () => {
    setLoadingService(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/service`);
      const data = await res.json();
      if (data?.activeTickets && data.activeTickets.length > 0) {
        setLiveTicket(data.activeTickets[0]);
      }
    } catch (err) {
      console.warn('Using local fallback for service tickets:', err);
    } finally {
      setLoadingService(false);
    }
  };

  // Fetch Live Reagents from API
  const fetchReagentsData = async () => {
    setLoadingReagents(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/reagents`);
      const data = await res.json();
      if (data?.reagents && data.reagents.length > 0) {
        setLiveReagents(data.reagents);
      }
    } catch (err) {
      console.warn('Using local fallback for reagents:', err);
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
      Alert.alert('Missing Fields', 'Please enter your registered Client/Lab ID and credentials.');
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
      console.warn('Backend offline, using fallback:', err);
      setCurrentScreen('overview');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out of Apollo Diagnostic Lab session?')) {
        setCurrentScreen('login');
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to log out of Apollo Diagnostic Lab session?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', style: 'destructive', onPress: () => setCurrentScreen('login') },
        ],
        { cancelable: true }
      );
    }
  };

  const notificationsList = [
    {
      id: '1',
      title: 'Engineer Dispatched',
      desc: `${liveTicket?.assignedEngineer?.name ?? 'Rajesh Sharma'} is en route for ticket #${liveTicket?.ticketId ?? 'MER-90214'}.`,
      time: '10m ago',
      type: 'service',
      unread: true,
    },
    {
      id: '2',
      title: 'AMC Expiry Notice',
      desc: 'AutoChem II maintenance contract renewal due in 28 days.',
      time: '2h ago',
      type: 'warranty',
      unread: true,
    },
    {
      id: '3',
      title: 'Reagent Order Shipped',
      desc: 'Batch #MER-CH-012 has left the regional diagnostic hub.',
      time: 'Yesterday',
      type: 'order',
      unread: true,
    },
    {
      id: '4',
      title: 'Preventive Calibration Complete',
      desc: 'Signed calibration audit report is ready for download.',
      time: '3d ago',
      type: 'report',
      unread: false,
    },
  ];

  const engineer = liveTicket?.assignedEngineer;

  /* ====================================================
     SUB-PAGE: LOGIN
  ==================================================== */
  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.loginSafeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#071520" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.loginContainer}
        >
          <ScrollView
            contentContainerStyle={styles.loginScrollContent}
            showsVerticalScrollIndicator={false}
          >
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
                  <Text style={[styles.tabText, loginMethod === 'password' && styles.tabTextActive]}>
                    Password
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, loginMethod === 'otp' && styles.tabButtonActive]}
                  onPress={() => {
                    setLoginMethod('otp');
                    setOtpSent(false);
                  }}
                >
                  <Text style={[styles.tabText, loginMethod === 'otp' && styles.tabTextActive]}>
                    Phone OTP
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>LAB / CLIENT ID</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefixIcon}>🏥</Text>
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
                <Text style={styles.inputPrefixIcon}>
                  {loginMethod === 'password' ? '🔒' : '📱'}
                </Text>
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

              <View style={styles.loginFooterRow}>
                <Text style={styles.loginFooterText}>Trouble signing in?</Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Emergency Meril Support',
                      'Call Toll Free: 1800-210-9900 or contact your assigned Meril field officer.'
                    )
                  }
                >
                  <Text style={styles.loginFooterLink}>Contact Helpdesk</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ====================================================
     SUB-PAGE: NOTIFICATIONS
  ==================================================== */
  const renderNotificationsPage = () => (
    <View style={styles.subPageContainer}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageHeader}>Notifications</Text>
          <Text style={styles.pageSubHeader}>
            Service alerts, reagent orders & warranty notices.
          </Text>
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
            <Text style={{ fontSize: 16 }}>
              {item.type === 'service'
                ? '🔧'
                : item.type === 'warranty'
                ? '🛡️'
                : item.type === 'order'
                ? '🧪'
                : '📄'}
            </Text>
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
     SUB-PAGE: PROFILE
  ==================================================== */
  const renderProfilePage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Laboratory Profile</Text>
      <Text style={styles.pageSubHeader}>
        Hospital credentials and registered account session.
      </Text>

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

      <Text style={styles.sectionHeading}>Facility Details</Text>
      <View style={styles.profileInfoList}>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Facility Name</Text>
          <Text style={styles.infoVal}>Apollo Healthcare Diagnostics Ltd.</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Authorized Lead</Text>
          <Text style={styles.infoVal}>Dr. Mohammad Hashim (Director)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Email Address</Text>
          <Text style={styles.infoVal}>director.lab@apollohealth.org</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Support Phone</Text>
          <Text style={styles.infoVal}>+91 98765 43210</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoKey}>Site Location</Text>
          <Text style={styles.infoVal}>Plot 42, Central Wing, Medical City, Mumbai, MH</Text>
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
     SUB-PAGE: MACHINES
  ==================================================== */
  const renderMachinesPage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Registered Analyzers (3)</Text>
      <Text style={styles.pageSubHeader}>
        Manage lab instruments, serial logs, and preventive maintenance.
      </Text>

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
        {
          name: 'Merilyzer AutoChem II',
          sn: 'MAC-2023-1092',
          status: 'Maintenance Due',
          nextPM: '28 Sep 2026',
          warranty: 'AMC Active',
          image:
            'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=300&auto=format&fit=crop&q=80',
        },
      ].map((machine, i) => (
        <View key={i} style={styles.recordCard}>
          <View style={styles.machineCardTop}>
            <Image source={{ uri: machine.image }} style={styles.machineThumb} />
            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.recordTitle}>{machine.name}</Text>
                <View
                  style={[
                    styles.statusTag,
                    machine.status === 'Operational' ? styles.statusSuccess : styles.statusWarning,
                  ]}
                >
                  <Text style={styles.statusTagText}>{machine.status}</Text>
                </View>
              </View>
              <Text style={styles.recordSubtitle}>S/N: {machine.sn}</Text>
              <Text style={styles.metaItem}>🗓 Next: {machine.nextPM}</Text>
              <Text style={styles.metaItem}>🛡 {machine.warranty}</Text>
            </View>
          </View>

          <View style={[styles.stackedButtonGroup, { marginTop: 12 }]}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('service')}>
              <Text style={styles.primaryBtnText}>Book Service</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlinedBtn}
              onPress={() => Alert.alert('Docs', `Manual for ${machine.name}`)}
            >
              <Text style={styles.outlinedBtnText}>Manual & Docs</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  /* ====================================================
     SUB-PAGE: SERVICE & SOS
  ==================================================== */
  const renderServicePage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Service & SOS Support</Text>
      <Text style={styles.pageSubHeader}>
        Dispatch Meril field specialists or schedule routine visits.
      </Text>

      <View style={styles.emergencyBox}>
        <View style={styles.emergencyHeader}>
          <Text style={styles.emergencyTitle}>🚨 Emergency SOS</Text>
          <Text style={styles.emergencyTime}>4-Hr Target</Text>
        </View>
        <Text style={styles.emergencyDesc}>
          Trigger an immediate field escalation if analyzer failure halts diagnostics.
        </Text>
        <TouchableOpacity
          style={[styles.sosActionBtn, sosActive && styles.sosActiveBtn]}
          onPress={() => {
            setSosActive(!sosActive);
            Alert.alert(
              sosActive ? 'SOS Cancelled' : 'SOS Dispatched',
              sosActive
                ? 'Your priority escalation has been cancelled.'
                : 'Meril Regional Dispatch notified. Specialist en route.'
            );
          }}
        >
          <Text style={styles.sosActionBtnText}>
            {sosActive ? 'CANCEL ACTIVE SOS' : 'TRIGGER EMERGENCY SOS'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.rowBetween, { marginTop: 20 }]}>
        <Text style={styles.sectionHeading}>Active Service Request</Text>
        {loadingService && <ActivityIndicator size="small" color="#38bdf8" />}
      </View>

      <View style={styles.recordCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.recordTitle}>
            Ticket #{liveTicket ? liveTicket.ticketId : 'MER-90214'}
          </Text>
          <Text style={styles.statusTagTextActive}>
            {liveTicket ? liveTicket.status : 'In Progress'}
          </Text>
        </View>
        <Text style={styles.recordSubtitle}>
          Analyzer: {liveTicket ? liveTicket.analyzer : 'Meril Quant-Mate 400'}
        </Text>
        <Text style={styles.metaItem}>
          Issue: {liveTicket ? liveTicket.issueType : 'Flow-cell optical sensor calibration error'}
        </Text>
        <Text style={styles.metaItem}>
          Engineer: {liveTicket?.assignedEngineer?.name ?? 'Rajesh Sharma'} (ETA{' '}
          {liveTicket?.assignedEngineer?.etaMins ?? 25}m)
        </Text>

        <View style={styles.otpBanner}>
          <Text style={styles.otpBannerTitle}>Service Closure Verification OTP</Text>
          <Text style={styles.otpNumber}>{liveTicket?.verificationOtp ?? '5892'}</Text>
          <Text style={styles.otpNote}>Share only after verification of repair.</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setCurrentScreen('engineerTracking')}
        >
          <Text style={styles.primaryBtnText}>Track Engineer Location 📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ====================================================
     SUB-PAGE: LIVE ENGINEER TRACKING (MAP)
  ==================================================== */
  const renderEngineerTrackingPage = () => {
    const labLat = 19.076;
    const labLng = 72.8777;
    const engLat = 19.088;
    const engLng = 72.889;
    const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${engLng - 0.03}%2C${engLat - 0.02}%2C${labLng + 0.03}%2C${labLat + 0.02}&layer=mapnik&marker=${engLat}%2C${engLng}`;

    return (
      <View style={styles.subPageContainer}>
        <Text style={styles.pageHeader}>Live Field Tracking</Text>
        <Text style={styles.pageSubHeader}>
          Real-time technician telemetry and route navigation.
        </Text>

        <View style={styles.recordCard}>
          <View style={styles.liveMapWrapper}>
            {Platform.OS === 'web' ? (
              // @ts-ignore
              <iframe
                title="Engineer Live Tracking"
                src={mapEmbedUrl}
                style={{ width: '100%', height: 260, border: 'none', borderRadius: 12 }}
              />
            ) : (
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80',
                }}
                style={styles.mapImage}
              />
            )}

            <View style={styles.floatingEtaPill}>
              <Text style={styles.floatingEtaText}>
                🛵 {engineer?.name ?? 'Rajesh Sharma'} is {engineer?.distanceKm ?? 3.4} km away
              </Text>
              <Text style={styles.floatingEtaSub}>
                ETA {engineer?.etaMins ?? 25} mins • Fast-Route SLA Active
              </Text>
            </View>
          </View>

          <View style={[styles.engineerCard, { marginTop: 12 }]}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
              }}
              style={styles.engineerPhoto}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.recordTitle}>{engineer?.name ?? 'Rajesh Sharma'}</Text>
                <View style={[styles.statusTag, styles.statusSuccess]}>
                  <Text style={styles.statusTagText}>GPS Connected</Text>
                </View>
              </View>
              <Text style={styles.recordSubtitle}>
                {engineer?.role ?? 'Senior Field Specialist'}
              </Text>
              <Text style={styles.etaHighlight}>
                ⏱ Expected Arrival: in {engineer?.etaMins ?? 25} Mins
              </Text>
            </View>
          </View>

          <View style={styles.stackedButtonGroup}>
            <TouchableOpacity
              style={styles.outlinedBtn}
              onPress={() =>
                Alert.alert('Calling', `Dialing ${engineer?.phone ?? '+91 98200 11223'}...`)
              }
            >
              <Text style={styles.outlinedBtnText}>📞 Voice Call Specialist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#16a34a' }]}
              onPress={() => Alert.alert('WhatsApp', 'Opening encrypted chat with specialist...')}
            >
              <Text style={styles.primaryBtnText}>💬 WhatsApp Specialist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  /* ====================================================
     SUB-PAGE: REAGENTS
  ==================================================== */
  const renderReagentsPage = () => {
    const defaultReagents: ReagentItem[] = [
      { id: '1', name: 'Meril SGOT / AST Clinical Pack', sku: 'MER-CH-012', price: 4850 },
      { id: '2', name: 'Direct Creatinine Kinetic Assay', sku: 'MER-CH-044', price: 3200 },
    ];
    const items = liveReagents.length > 0 ? liveReagents : defaultReagents;

    return (
      <View style={styles.subPageContainer}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageHeader}>Reagent Ordering</Text>
            <Text style={styles.pageSubHeader}>Original Meril assays, calibrators and controls.</Text>
          </View>
          {loadingReagents && <ActivityIndicator size="small" color="#38bdf8" />}
        </View>

        {items.map((reagent) => (
          <View key={reagent.id} style={styles.recordCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.recordTitle}>{reagent.name}</Text>
              <Text style={[styles.statNumber, { fontSize: 14, color: '#38bdf8' }]}>
                ₹{reagent.price.toLocaleString()}
              </Text>
            </View>
            <Text style={styles.recordSubtitle}>SKU: {reagent.sku} • In Stock</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 10 }]}
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
     MAIN BLUEPRINT OVERVIEW PAGE (Wireframe Match)
  ==================================================== */
  const renderOverviewPage = () => (
    <>
      {/* 3. CTA BUTTON */}
      <TouchableOpacity
        style={[styles.ctaButton, sosActive && styles.ctaButtonActive]}
        activeOpacity={0.85}
        onPress={() => {
          setSosActive(!sosActive);
          Alert.alert(
            sosActive ? 'SOS Disengaged' : 'Emergency SOS Dispatched',
            sosActive
              ? 'Priority breakdown protocol cancelled.'
              : 'Meril Regional Dispatch notified. Specialist en route.'
          );
        }}
      >
        <Text style={styles.ctaButtonText}>
          {sosActive ? '🚨 SOS ACTIVE • CANCEL REQUEST' : '🚨 CTA BUTTON : 4-HR EMERGENCY SOS'}
        </Text>
      </TouchableOpacity>

      {/* 4. HEADER + IMAGE BLOCK */}
      <TouchableOpacity
        style={styles.headerImageBlock}
        activeOpacity={0.9}
        onPress={() => setCurrentScreen('machines')}
      >
        <View style={styles.headerContainer}>
          <View style={styles.rowBetween}>
            <Text style={styles.headerTitle}>
              {liveTicket ? liveTicket.analyzer : 'Meril Quant-Mate 400'}
            </Text>
            <View style={styles.livePill}>
              <Text style={styles.livePillText}>{liveTicket?.status ?? 'OPERATIONAL'}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Clinical Chemistry Analyzer • S/N: MQM-2024-8841 (Click for details)
          </Text>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
            }}
            style={styles.imageMain}
          />
          <View style={styles.imageOverlayTag}>
            <Text style={styles.imageOverlayText}>LAB INSTRUMENT IMAGE</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 5. DUAL ACTION BUTTONS (BUTTON | BUTTON) */}
      <View style={styles.dualButtonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          activeOpacity={0.8}
          onPress={() => setCurrentScreen('service')}
        >
          <Text style={styles.actionBtnPrimaryText}>BUTTON: Book Service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary]}
          activeOpacity={0.8}
          onPress={() => setCurrentScreen('engineerTracking')}
        >
          <Text style={styles.actionBtnSecondaryText}>BUTTON: Track Live</Text>
        </TouchableOpacity>
      </View>

      {/* 6. CONTENT / DESCRIPTION LINES */}
      <View style={styles.textLinesBlock}>
        <View style={styles.textLineLong} />
        <View style={styles.textLineMedium} />
        <Text style={styles.statusDescription}>
          Active SLA Ticket #{liveTicket ? liveTicket.ticketId : 'MER-90214'} •{' '}
          {liveTicket ? liveTicket.issueType : 'Optical sensor calibration verified'}.
        </Text>
      </View>

      {/* 7. CARD */}
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.9}
        onPress={() => setCurrentScreen('engineerTracking')}
      >
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.cardHeaderSmall}>ASSIGNED SPECIALIST</Text>
            <Text style={styles.cardTitle}>{engineer?.name ?? 'Rajesh Sharma'}</Text>
          </View>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>ETA {engineer?.etaMins ?? 25} MINS</Text>
          </View>
        </View>

        <Text style={styles.cardSubtitle}>
          {engineer?.role ?? 'Senior Field Specialist'} • Distance: {engineer?.distanceKm ?? 3.4} km
        </Text>

        <View style={styles.otpStrip}>
          <Text style={styles.otpLabel}>Service Closure Verification OTP:</Text>
          <Text style={styles.otpValue}>{liveTicket?.verificationOtp ?? '5892'}</Text>
        </View>

        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.cardMiniBtn}
            onPress={() => Alert.alert('Call', `Dialing ${engineer?.phone ?? '+91 98200 11223'}`)}
          >
            <Text style={styles.cardMiniBtnText}>📞 Voice Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cardMiniBtn, { backgroundColor: '#16a34a' }]}
            onPress={() => Alert.alert('WhatsApp', 'Opening encrypted chat...')}
          >
            <Text style={styles.cardMiniBtnText}>💬 WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </>
  );

  /* ====================================================
     MAIN WRAPPER & TAB NAVIGATION
  ==================================================== */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* 1. STATUS BAR */}
      <StatusBar barStyle="light-content" backgroundColor="#071520" />
      <View style={styles.statusBarMock}>
        <Text style={styles.statusBarText}>09:41</Text>
        <Text style={styles.statusBarCenterTitle}>STATUS BAR</Text>
        <View style={styles.statusBarIcons}>
          <Text style={styles.statusBarIconText}>📶</Text>
          <Text style={styles.statusBarIconText}>🔋</Text>
        </View>
      </View>

      {/* 2. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarBrand}
          activeOpacity={0.8}
          onPress={() => setCurrentScreen('overview')}
        >
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>M</Text>
          </View>
          <View>
            <Text style={styles.topBarTitle}>TOP BAR: MERIL ONE</Text>
            <Text style={styles.topBarSub}>Apollo Diagnostic Lab (MER-882190)</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topBarMenuBtn}
          onPress={() => setCurrentScreen('notifications')}
        >
          <Text style={styles.bellIconEmoji}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE VIEW CONTAINER */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button for Sub-pages */}
        {currentScreen !== 'overview' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('overview')}
          >
            <Text style={styles.backButtonText}>← Back to Overview</Text>
          </TouchableOpacity>
        )}

        {/* View Router */}
        {currentScreen === 'overview' && renderOverviewPage()}
        {currentScreen === 'notifications' && renderNotificationsPage()}
        {currentScreen === 'profile' && renderProfilePage()}
        {currentScreen === 'machines' && renderMachinesPage()}
        {currentScreen === 'service' && renderServicePage()}
        {currentScreen === 'engineerTracking' && renderEngineerTrackingPage()}
        {currentScreen === 'reagents' && renderReagentsPage()}
      </ScrollView>

      {/* 8. TAB BAR (5 ICONS AS SHOWN IN WIREFRAME) */}
      <View style={styles.tabBar}>
        <Text style={styles.tabBarHeader}>TAB BAR</Text>
        <View style={styles.tabIconsRow}>
          {[
            { id: 'overview' as ScreenType, label: 'ICON', icon: '🏠', title: 'Home' },
            { id: 'machines' as ScreenType, label: 'ICON', icon: '🔬', title: 'Analyzers' },
            { id: 'service' as ScreenType, label: 'ICON', icon: '🔧', title: 'Service' },
            { id: 'engineerTracking' as ScreenType, label: 'ICON', icon: '📍', title: 'Tracking' },
            { id: 'profile' as ScreenType, label: 'ICON', icon: '👤', title: 'Profile' },
          ].map((tab) => {
            const isSelected = currentScreen === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => setCurrentScreen(tab.id)}
              >
                <View style={[styles.tabSquare, isSelected && styles.tabSquareActive]}>
                  <Text style={styles.tabSquareEmoji}>{tab.icon}</Text>
                </View>
                <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071520',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },

  /* 1. Status Bar */
  statusBarMock: {
    height: 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#0284c7',
    backgroundColor: '#05111a',
  },
  statusBarText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBarCenterTitle: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusBarIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBarIconText: {
    color: '#38bdf8',
    fontSize: 11,
  },

  /* 2. Top Bar */
  topBar: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderColor: '#0284c7',
    backgroundColor: '#0b1f2e',
  },
  topBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c725',
  },
  brandBadgeText: {
    color: '#38bdf8',
    fontWeight: '900',
    fontSize: 14,
  },
  topBarTitle: {
    color: '#38bdf8',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topBarSub: {
    color: '#94a3b8',
    fontSize: 9.5,
  },
  topBarMenuBtn: {
    padding: 6,
    position: 'relative',
  },
  bellIconEmoji: {
    fontSize: 18,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dc2626',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },

  /* Back Button */
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0b1f2e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  backButtonText: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 12,
  },

  /* 3. CTA Button */
  ctaButton: {
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    backgroundColor: '#0284c715',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  ctaButtonActive: {
    borderColor: '#f43f5e',
    backgroundColor: '#f43f5e20',
  },
  ctaButtonText: {
    color: '#38bdf8',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  /* 4. Header + Image Block */
  headerImageBlock: {
    borderWidth: 1.5,
    borderColor: '#0284c7',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#0b1f2e',
  },
  headerContainer: {
    padding: 12,
    borderBottomWidth: 1.5,
    borderColor: '#0284c7',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 10.5,
    marginTop: 2,
  },
  livePill: {
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#38bdf815',
  },
  livePillText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800',
  },
  imageWrapper: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#040d14',
  },
  imageMain: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlayTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(7, 21, 32, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  imageOverlayText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* 5. Dual Action Buttons */
  dualButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: '#0284c725',
  },
  actionBtnSecondary: {
    backgroundColor: '#071520',
  },
  actionBtnPrimaryText: {
    color: '#38bdf8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  actionBtnSecondaryText: {
    color: '#38bdf8',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* 6. Text Lines */
  textLinesBlock: {
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  textLineLong: {
    height: 3,
    backgroundColor: '#0284c7',
    borderRadius: 2,
    width: '100%',
    marginBottom: 6,
    opacity: 0.8,
  },
  textLineMedium: {
    height: 3,
    backgroundColor: '#0284c7',
    borderRadius: 2,
    width: '65%',
    marginBottom: 8,
    opacity: 0.6,
  },
  statusDescription: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  /* 7. Card */
  cardContainer: {
    borderWidth: 1.5,
    borderColor: '#0284c7',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#0b1f2e',
    marginBottom: 12,
  },
  cardHeaderSmall: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  cardBadge: {
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#0284c720',
  },
  cardBadgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
  },
  otpStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#071520',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0284c750',
    marginVertical: 10,
  },
  otpLabel: {
    color: '#94a3b8',
    fontSize: 10.5,
  },
  otpValue: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 3,
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  cardMiniBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  cardMiniBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  /* 8. Tab Bar */
  tabBar: {
    borderTopWidth: 1.5,
    borderColor: '#0284c7',
    backgroundColor: '#05111a',
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    paddingHorizontal: 10,
  },
  tabBarHeader: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tabIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
  },
  tabSquare: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0284c7',
    backgroundColor: '#071520',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSquareActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#0284c730',
  },
  tabSquareEmoji: {
    fontSize: 16,
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#38bdf8',
  },

  /* Sub-page Specific Styles */
  subPageContainer: {
    backgroundColor: '#0b1f2e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#0284c7',
  },
  pageHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  pageSubHeader: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 3,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordCard: {
    backgroundColor: '#071520',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0284c760',
    marginBottom: 12,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  recordSubtitle: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  metaItem: {
    fontSize: 11.5,
    color: '#cbd5e1',
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  outlinedBtn: {
    borderWidth: 1,
    borderColor: '#0284c7',
    backgroundColor: '#071520',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  outlinedBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  stackedButtonGroup: {
    flexDirection: 'column',
    gap: 8,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusSuccess: {
    backgroundColor: '#0284c725',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  statusWarning: {
    backgroundColor: '#fef3c720',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  statusTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#38bdf8',
  },
  statusTagTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
    backgroundColor: '#0284c720',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  machineCardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  machineThumb: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  emergencyBox: {
    backgroundColor: '#88133720',
    borderWidth: 1,
    borderColor: '#f43f5e',
    borderRadius: 10,
    padding: 12,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f43f5e',
  },
  emergencyTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f43f5e',
    backgroundColor: '#f43f5e20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emergencyDesc: {
    fontSize: 11,
    color: '#fda4af',
    marginBottom: 10,
    lineHeight: 15,
  },
  sosActionBtn: {
    backgroundColor: '#e11d48',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sosActiveBtn: {
    backgroundColor: '#9f1239',
  },
  sosActionBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  otpBanner: {
    backgroundColor: '#071520',
    borderWidth: 1,
    borderColor: '#0284c7',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  otpBannerTitle: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  otpNumber: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#38bdf8',
    marginVertical: 2,
  },
  otpNote: {
    fontSize: 10,
    color: '#64748b',
  },
  liveMapWrapper: {
    position: 'relative',
    height: 260,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0284c7',
    backgroundColor: '#040d14',
  },
  floatingEtaPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(7, 21, 32, 0.92)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  floatingEtaText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  floatingEtaSub: {
    color: '#38bdf8',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  mapImage: {
    height: 260,
    width: '100%',
    borderRadius: 12,
  },
  engineerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071520',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284c760',
  },
  engineerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  etaHighlight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  profileHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071520',
    borderWidth: 1,
    borderColor: '#0284c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  profileAvatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  profileHeroText: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  verifiedTag: {
    backgroundColor: '#0284c720',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38bdf8',
  },
  profileIdText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  profileInfoList: {
    backgroundColor: '#071520',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0284c760',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0284c730',
  },
  infoKey: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 12.5,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#f43f5e',
    backgroundColor: '#88133720',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: '700',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#071520',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0284c740',
    marginBottom: 10,
  },
  notifCardUnread: {
    borderColor: '#38bdf8',
    borderLeftWidth: 3.5,
    borderLeftColor: '#38bdf8',
  },
  notifIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0b1f2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  notifTime: {
    fontSize: 10,
    color: '#64748b',
  },
  notifDesc: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0284c725',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 6,
  },
  markReadText: {
    fontSize: 10.5,
    color: '#38bdf8',
    fontWeight: '700',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
  },

  /* Login Styles */
  loginSafeArea: {
    flex: 1,
    backgroundColor: '#071520',
  },
  loginContainer: {
    flex: 1,
  },
  loginScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginBrandCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0284c720',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loginBrandImage: {
    width: 28,
    height: 28,
    tintColor: '#38bdf8',
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 1,
  },
  loginSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  loginCard: {
    backgroundColor: '#0b1f2e',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#0284c7',
  },
  cardHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 16,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#071520',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0284c740',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#0284c7',
  },
  tabText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071520',
    borderWidth: 1,
    borderColor: '#0284c760',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputPrefixIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#ffffff',
    paddingVertical: 8,
  },
  sendOtpBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#0284c725',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 6,
  },
  sendOtpText: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '700',
  },
  loginBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  loginFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  loginFooterText: {
    fontSize: 11.5,
    color: '#64748b',
  },
  loginFooterLink: {
    fontSize: 11.5,
    color: '#38bdf8',
    fontWeight: '700',
  },
});

export default MerilCustomerScreen;