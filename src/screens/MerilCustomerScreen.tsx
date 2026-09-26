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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
     1. LOGIN SCREEN
  ==================================================== */
  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.loginSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f7f8" />
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

            <View style={styles.supportBadge}>
              <Text style={styles.supportBadgeText}>🔒 ISO 13485 & HIPAA Compliant Healthcare Portal</Text>
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
            {item.type === 'service' ? (
              <MaterialCommunityIcons name="wrench-outline" size={18} color="#007b8a" />
            ) : item.type === 'warranty' ? (
              <MaterialCommunityIcons name="shield-check-outline" size={18} color="#007b8a" />
            ) : item.type === 'order' ? (
              <MaterialCommunityIcons name="flask-outline" size={18} color="#007b8a" />
            ) : (
              <Ionicons name="document-text-outline" size={18} color="#007b8a" />
            )}
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
     4. MY MACHINES SUB-PAGE
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
     5. SERVICE MANAGEMENT & SOS
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
        {loadingService && <ActivityIndicator size="small" color="#007b8a" />}
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
     6. LIVE ENGINEER TRACKING (MAP)
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
     7. REAGENTS MODULE
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
          {loadingReagents && <ActivityIndicator size="small" color="#007b8a" />}
        </View>

        {items.map((reagent) => (
          <View key={reagent.id} style={styles.recordCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.recordTitle}>{reagent.name}</Text>
              <Text style={[styles.statNumber, { fontSize: 14, color: '#007b8a' }]}>
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
     8. SHOP & CATALOGUE MODULE
  ==================================================== */
  const renderShopPage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Equipment Catalogue</Text>
      <Text style={styles.pageSubHeader}>Explore next-generation clinical pathology platforms.</Text>
      <View style={styles.recordCard}>
        <Text style={styles.recordTitle}>Meril Quant-Mate 800 (High-Throughput)</Text>
        <Text style={styles.recordSubtitle}>Automated Clinical Chemistry Analyzer • 800 tests/hr</Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: 10 }]}
          onPress={() => Alert.alert('Quote Requested', 'A Meril representative will contact you.')}
        >
          <Text style={styles.primaryBtnText}>Request Institutional Quotation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ====================================================
     9. WARRANTY & AMC MODULE
  ==================================================== */
  const renderWarrantyPage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Warranty & Annual Maintenance</Text>
      <Text style={styles.pageSubHeader}>Coverage policies and preventive schedule compliance.</Text>
      <View style={styles.recordCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.recordTitle}>Comprehensive AMC Gold</Text>
          <View style={[styles.statusTag, styles.statusSuccess]}>
            <Text style={styles.statusTagText}>Active</Text>
          </View>
        </View>
        <Text style={styles.recordSubtitle}>Coverage: 3 Analyzers (Parts, Labor & Sensors)</Text>
        <Text style={styles.metaItem}>Valid through: 15 Dec 2027</Text>
      </View>
    </View>
  );

  /* ====================================================
     10. SERVICE TRACKING TIMELINE
  ==================================================== */
  const renderTrackingPage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Active Service Ticket Timeline</Text>
      <Text style={styles.pageSubHeader}>
        Real-time telemetry for ticket #{liveTicket?.ticketId ?? 'MER-90214'}.
      </Text>
      <View style={styles.recordCard}>
        <Text style={styles.recordTitle}>Status: {liveTicket?.status ?? 'In Progress'}</Text>
        <Text style={styles.metaItem}>1. Dispatched: 10:15 AM</Text>
        <Text style={styles.metaItem}>
          2. Field Transit: ETA {liveTicket?.assignedEngineer?.etaMins ?? 25} Mins
        </Text>
        <Text style={styles.metaItem}>3. Calibration: Pending Arrival</Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: 12 }]}
          onPress={() => setCurrentScreen('engineerTracking')}
        >
          <Text style={styles.primaryBtnText}>View GPS Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ====================================================
     11. FEEDBACK MODULE
  ==================================================== */
  const renderFeedbackPage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Technician Feedback</Text>
      <Text style={styles.pageSubHeader}>Rate recent service satisfaction for ticket closure.</Text>
      <View style={styles.recordCard}>
        <Text style={styles.recordTitle}>
          Specialist: {liveTicket?.assignedEngineer?.name ?? 'Rajesh Sharma'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginVertical: 12 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)}>
              <Ionicons
                name={star <= feedbackRating ? 'star' : 'star-outline'}
                size={26}
                color="#f59e0b"
              />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={[
            styles.textInput,
            { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8 },
          ]}
          placeholder="Write your feedback..."
          value={feedbackText}
          onChangeText={setFeedbackText}
        />
        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: 12 }]}
          onPress={() => {
            Alert.alert('Feedback Submitted', 'Thank you for rating our service!');
            setCurrentScreen('overview');
          }}
        >
          <Text style={styles.primaryBtnText}>Submit Rating</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ====================================================
     12. TRAINING & LEARNING
  ==================================================== */
  const renderTrainingPage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>SOPs & Training Manuals</Text>
      <Text style={styles.pageSubHeader}>Digital guides and clinical operating procedures.</Text>
      {['Quant-Mate 400 Calibration Video', 'Daily Optical Sensor Maintenance', 'Reagent Storage Protocol'].map(
        (doc, index) => (
          <View key={index} style={styles.recordCard}>
            <Text style={styles.recordTitle}>{doc}</Text>
            <TouchableOpacity
              style={[styles.outlinedBtn, { marginTop: 8 }]}
              onPress={() => Alert.alert('Resource', `Opening ${doc}`)}
            >
              <Text style={styles.outlinedBtnText}>Download PDF / Video 📖</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );

  /* ====================================================
     13. SERVICE AUDIT REPORTS
  ==================================================== */
  const renderReportsPage = () => (
    <View style={styles.subPageContainer}>
      <Text style={styles.pageHeader}>Service & Audit Reports</Text>
      <Text style={styles.pageSubHeader}>Download signed ISO and NABL compliance certificates.</Text>
      {['Q3 Preventive Calibration Certificate', 'Annual Electrical Safety Audit 2026', 'Optical QC Alignment Report'].map(
        (rep, idx) => (
          <View key={idx} style={styles.recordCard}>
            <Text style={styles.recordTitle}>{rep}</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 8 }]}
              onPress={() => Alert.alert('Report', `Downloading ${rep}...`)}
            >
              <Text style={styles.primaryBtnText}>Download Signed PDF 📄</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );

  /* ====================================================
     PRIMARY BLUEPRINT OVERVIEW (Matches Wireframe Layout)
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons
            name="shield-alert"
            size={18}
            color={sosActive ? '#be123c' : '#007b8a'}
          />
          <Text style={[styles.ctaButtonText, sosActive && { color: '#be123c' }]}>
            {sosActive ? 'SOS ACTIVE • CANCEL REQUEST' : 'CTA BUTTON : 4-HR EMERGENCY SOS'}
          </Text>
        </View>
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
              Meril Life Sciences • Advancing Healthcare
            </Text>
            <View style={styles.livePill}>
              <Text style={styles.livePillText}>INNOVATION</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Dedicated to advancing healthcare solutions that improve patient outcomes.
          </Text>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80',
            }}
            style={styles.imageMain}
          />
          <View style={styles.imageOverlayTag}>
            <Text style={styles.imageOverlayText}>MERIL MEDTECH INNOVATION</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 5. DUAL ACTION BUTTONS (BUTTON | BUTTON) */}
      <View style={styles.dualButtonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          activeOpacity={0.85}
          onPress={() => setCurrentScreen('service')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="construct-outline" size={16} color="#ffffff" />
            <Text style={styles.actionBtnPrimaryText}>BUTTON: Book Service</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary]}
          activeOpacity={0.85}
          onPress={() => setCurrentScreen('engineerTracking')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location-outline" size={16} color="#0f2930" />
            <Text style={styles.actionBtnSecondaryText}>BUTTON: Track Live</Text>
          </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="key-outline" size={15} color="#475569" />
            <Text style={styles.otpLabel}>Verification OTP:</Text>
          </View>
          <Text style={styles.otpValue}>{liveTicket?.verificationOtp ?? '5892'}</Text>
        </View>

        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.cardMiniBtn}
            onPress={() => Alert.alert('Call', `Dialing ${engineer?.phone ?? '+91 98200 11223'}`)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="call-outline" size={14} color="#ffffff" />
              <Text style={styles.cardMiniBtnText}>Voice Call</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cardMiniBtn, { backgroundColor: '#16a34a' }]}
            onPress={() => Alert.alert('WhatsApp', 'Opening encrypted chat...')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="whatsapp" size={15} color="#ffffff" />
              <Text style={styles.cardMiniBtnText}>WhatsApp</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </>
  );

  /* ====================================================
     MAIN APP SHELL (Top Bar, Body, & Tab Bar)
  ==================================================== */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* 1. STATUS BAR */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      

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
            <Text style={styles.topBarTitle}>MERIL ONE</Text>
            <Text style={styles.topBarSub}>Apollo Lab • MER-882190</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => setCurrentScreen('notifications')}
          >
            <Ionicons name="notifications-outline" size={18} color="#0f2930" />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileBadgeBtn}
            onPress={() => setCurrentScreen('profile')}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
              }}
              style={styles.topAvatar}
            />
          </TouchableOpacity>
        </View>
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

        {/* View Routing */}
        {currentScreen === 'overview' && renderOverviewPage()}
        {currentScreen === 'notifications' && renderNotificationsPage()}
        {currentScreen === 'profile' && renderProfilePage()}
        {currentScreen === 'machines' && renderMachinesPage()}
        {currentScreen === 'service' && renderServicePage()}
        {currentScreen === 'engineerTracking' && renderEngineerTrackingPage()}
        {currentScreen === 'reagents' && renderReagentsPage()}
        {currentScreen === 'shop' && renderShopPage()}
        {currentScreen === 'warranty' && renderWarrantyPage()}
        {currentScreen === 'tracking' && renderTrackingPage()}
        {currentScreen === 'feedback' && renderFeedbackPage()}
        {currentScreen === 'training' && renderTrainingPage()}
        {currentScreen === 'reports' && renderReportsPage()}
      </ScrollView>

      {/* 8. TAB BAR (5 ICONS FROM @expo/vector-icons) */}
      <View style={styles.tabBar}>
        <Text style={styles.tabBarHeader}>TAB BAR</Text>
        <View style={styles.tabIconsRow}>
          {[
            {
              id: 'overview' as ScreenType,
              label: 'Home',
              renderIcon: (color: string) => <Ionicons name="home-outline" size={20} color={color} />,
            },
            {
              id: 'machines' as ScreenType,
              label: 'Analyzers',
              renderIcon: (color: string) => (
                <MaterialCommunityIcons name="microscope" size={20} color={color} />
              ),
            },
            {
              id: 'service' as ScreenType,
              label: 'Service',
              renderIcon: (color: string) => (
                <MaterialCommunityIcons name="hammer-wrench" size={20} color={color} />
              ),
            },
            {
              id: 'engineerTracking' as ScreenType,
              label: 'Tracking',
              renderIcon: (color: string) => (
                <MaterialCommunityIcons name="crosshairs-gps" size={20} color={color} />
              ),
            },
            {
              id: 'profile' as ScreenType,
              label: 'Profile',
              renderIcon: (color: string) => <Ionicons name="person-outline" size={20} color={color} />,
            },
          ].map((tab) => {
            const isSelected = currentScreen === tab.id;
            const iconColor = isSelected ? '#007b8a' : '#64748b';
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => setCurrentScreen(tab.id)}
              >
                <View style={[styles.tabSquare, isSelected && styles.tabSquareActive]}>
                  {tab.renderIcon(iconColor)}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  statusBarText: {
    color: '#0f2930',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBarCenterTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  /* 2. Top Bar */
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  topBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#007b8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
  },
  topBarTitle: {
    color: '#0f2930',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topBarSub: {
    color: '#64748b',
    fontSize: 10,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
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
  profileBadgeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#007b8a',
  },
  topAvatar: {
    width: '100%',
    height: '100%',
  },

  /* Back Button */
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButtonText: {
    color: '#007b8a',
    fontWeight: '700',
    fontSize: 12,
  },

  /* 3. CTA Button */
  ctaButton: {
    borderWidth: 1.5,
    borderColor: '#007b8a',
    backgroundColor: '#e6f4f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  ctaButtonActive: {
    borderColor: '#e11d48',
    backgroundColor: '#ffe4e6',
  },
  ctaButtonText: {
    color: '#007b8a',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  /* 4. Header + Image Block */
  headerImageBlock: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerTitle: {
    color: '#0f2930',
    fontSize: 15,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  livePill: {
    borderWidth: 1,
    borderColor: '#007b8a',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#e6f4f6',
  },
  livePillText: {
    color: '#007b8a',
    fontSize: 9.5,
    fontWeight: '800',
  },
  imageWrapper: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#f8fafc',
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
    borderColor: '#e2e8f0',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  imageOverlayText: {
    color: '#0f2930',
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  actionBtnPrimary: {
    backgroundColor: '#007b8a',
    borderColor: '#007b8a',
  },
  actionBtnSecondary: {
    backgroundColor: '#ffffff',
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnSecondaryText: {
    color: '#0f2930',
    fontSize: 12,
    fontWeight: '700',
  },

  /* 6. Text Lines */
  textLinesBlock: {
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  textLineLong: {
    height: 3,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    width: '100%',
    marginBottom: 6,
  },
  textLineMedium: {
    height: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    width: '65%',
    marginBottom: 8,
  },
  statusDescription: {
    color: '#64748b',
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },

  /* 7. Card */
  cardContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderSmall: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTitle: {
    color: '#0f2930',
    fontSize: 14.5,
    fontWeight: '800',
    marginTop: 2,
  },
  cardBadge: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
  },
  cardBadgeText: {
    color: '#007b8a',
    fontSize: 10,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#64748b',
    fontSize: 11.5,
    marginTop: 4,
  },
  otpStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 10,
  },
  otpLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
  },
  otpValue: {
    color: '#007b8a',
    fontSize: 16,
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
    backgroundColor: '#007b8a',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMiniBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* 8. Tab Bar */
  tabBar: {
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 18 : 8,
    paddingHorizontal: 10,
  },
  tabBarHeader: {
    color: '#64748b',
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSquareActive: {
    borderColor: '#007b8a',
    backgroundColor: '#e6f4f6',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#007b8a',
  },

  /* Sub-Page Styles */
  subPageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pageHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f2930',
  },
  pageSubHeader: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 3,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f2930',
  },
  recordSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
  },
  metaItem: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: '#007b8a',
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
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  outlinedBtnText: {
    color: '#334155',
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
    backgroundColor: '#dcfce7',
  },
  statusWarning: {
    backgroundColor: '#fef3c7',
  },
  statusTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803d',
  },
  statusTagTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007b8a',
    backgroundColor: '#e6f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007b8a',
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
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
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
    color: '#be123c',
  },
  emergencyTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#be123c',
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emergencyDesc: {
    fontSize: 11,
    color: '#881337',
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
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  otpBannerTitle: {
    fontSize: 10.5,
    color: '#0e7490',
    fontWeight: '600',
  },
  otpNumber: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#0891b2',
    marginVertical: 2,
  },
  otpNote: {
    fontSize: 10,
  },
  liveMapWrapper: {
    position: 'relative',
    height: 260,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  floatingEtaPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15, 41, 48, 0.92)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  floatingEtaText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  floatingEtaSub: {
    color: '#94a3b8',
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
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  engineerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  etaHighlight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d97706',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f2930',
    marginBottom: 8,
  },
  profileHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#0f2930',
  },
  verifiedTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803d',
  },
  profileIdText: {
    fontSize: 11,
    color: '#007b8a',
    marginTop: 2,
  },
  profileInfoList: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoKey: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 12.5,
    color: '#0f2930',
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#be123c',
    fontSize: 12,
    fontWeight: '700',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  notifCardUnread: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 3.5,
    borderLeftColor: '#007b8a',
  },
  notifIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f2930',
  },
  notifTime: {
    fontSize: 10,
    color: '#64748b',
  },
  notifDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
  },
  markReadText: {
    fontSize: 10.5,
    color: '#0284c7',
    fontWeight: '700',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
  },

  /* Login Styles */
  loginSafeArea: {
    flex: 1,
    backgroundColor: '#f0f7f8',
  },
  loginContainer: {
    flex: 1,
  },
  loginScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 26,
  },
  loginBrandCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007b8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loginBrandImage: {
    width: 32,
    height: 32,
    tintColor: '#ffffff',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f2930',
    letterSpacing: 1,
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f2930',
  },
  cardSub: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 3,
    marginBottom: 18,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#007b8a',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0f2930',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  sendOtpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
  },
  sendOtpText: {
    fontSize: 11.5,
    color: '#0284c7',
    fontWeight: '700',
  },
  loginBtn: {
    backgroundColor: '#007b8a',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '800',
  },
  loginFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  loginFooterText: {
    fontSize: 12,
    color: '#64748b',
  },
  loginFooterLink: {
    fontSize: 12,
    color: '#007b8a',
    fontWeight: '700',
  },
  supportBadge: {
    alignItems: 'center',
    marginTop: 24,
  },
  supportBadgeText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});

export default MerilCustomerScreen;