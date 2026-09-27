import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

interface MerilChatBotModalProps {
  visible: boolean;
  onClose: () => void;
}

const KNOWLEDGE_BASE: { keywords: string[]; answer: string }[] = [
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

export const MerilChatBotModal: React.FC<MerilChatBotModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your Meril MedTech AI Assistant. Ask me anything about our vascular interventions, orthopedic robotics, surgical solutions, or diagnostic analyzers.',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const getBotResponse = (query: string): string => {
    const q = query.toLowerCase();
    for (const entry of KNOWLEDGE_BASE) {
      if (entry.keywords.some((k) => q.includes(k))) {
        return entry.answer;
      }
    }
    return 'Meril delivers advanced solutions across Vascular Interventions (Myval, MeRes100), Robotics (MISSO, Cuvis), Endo-Surgery, and IVD Diagnostics. You can ask for specific product details or technical documentation.';
  };

  const handleSend = (userQuery?: string) => {
    const textToSend = userQuery || inputText;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
    };

    const replyText = getBotResponse(textToSend);
    const botMsg: Message = {
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
        style={styles.modalOverlay}
      >
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.botIconCircle}>
                <Ionicons name="sparkles" size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Meril MedTech AI</Text>
                <Text style={styles.headerStatus}>● Online Knowledge Base</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.pillsRow}>
            {['Myval THV', 'MeRes100 BRS', 'MISSO Robotics', 'IVD Analyzers'].map((pill, i) => (
              <TouchableOpacity
                key={i}
                style={styles.pill}
                onPress={() => handleSend(`Tell me about ${pill}`)}
              >
                <Text style={styles.pillText}>{pill}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.messagesScroll}>
            {messages.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.messageBubble,
                  item.sender === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about Myval, MISSO, sutures..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
              <Ionicons name="send" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '82%',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  botIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007b8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f2930',
  },
  headerStatus: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#e6f4f6',
    borderWidth: 1,
    borderColor: '#007b8a',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007b8a',
  },
  messagesScroll: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 14,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007b8a',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: '#0f2930',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f2930',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#007b8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MerilChatBotModal;