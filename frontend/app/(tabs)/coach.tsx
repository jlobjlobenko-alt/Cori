import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';
import { getTranslation } from '../../src/i18n/translations';
import { getTotalDeliveries, getTotalEarnings, getMonthlyRank } from '../../src/utils/helpers';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function CoachScreen() {
  const store = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const t = (key: any) => getTranslation(store.language, key);

  const totalDeliveries = getTotalDeliveries(store.shifts);
  const totalEarnings = getTotalEarnings(store.shifts);
  const monthlyRank = getMonthlyRank(totalDeliveries, store.longestStreak);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText.trim(),
          context: {
            currentStreak: store.currentStreak,
            longestStreak: store.longestStreak,
            totalDeliveries,
            totalEarnings,
            monthlyRank: t(monthlyRank),
            language: store.language,
          },
        }),
      });

      const data = await response.json();

      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I could not process your request.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, coachMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error connecting to the coach. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.coachMessage,
      ]}
    >
      {!message.isUser && (
        <View style={styles.coachAvatar}>
          <Ionicons name="fitness" size={20} color="#FF6B35" />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.coachBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.coachText,
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="fitness" size={32} color="#FF6B35" />
        </View>
        <View>
          <Text style={styles.title}>{t('aiCoach')}</Text>
          <Text style={styles.subtitle}>AI Productivity Assistant</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 && (
            <View style={styles.introContainer}>
              <View style={styles.introIcon}>
                <Ionicons name="chatbubbles" size={48} color="#FF6B35" />
              </View>
              <Text style={styles.introText}>{t('coachIntro')}</Text>
              
              {/* Quick Prompts */}
              <View style={styles.quickPrompts}>
                <TouchableOpacity
                  style={styles.quickPrompt}
                  onPress={() => setInputText('Give me motivation for today!')}
                >
                  <Ionicons name="flash" size={16} color="#FF6B35" />
                  <Text style={styles.quickPromptText}>Motivate me!</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickPrompt}
                  onPress={() => setInputText('What are my best working hours?')}
                >
                  <Ionicons name="time" size={16} color="#FF6B35" />
                  <Text style={styles.quickPromptText}>Best hours?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickPrompt}
                  onPress={() => setInputText('How can I extend my streak?')}
                >
                  <Ionicons name="flame" size={16} color="#FF6B35" />
                  <Text style={styles.quickPromptText}>Extend streak</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickPrompt}
                  onPress={() => setInputText('Analyze my productivity patterns')}
                >
                  <Ionicons name="analytics" size={16} color="#FF6B35" />
                  <Text style={styles.quickPromptText}>Analyze me</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {messages.map(renderMessage)}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.coachAvatar}>
                <Ionicons name="fitness" size={20} color="#FF6B35" />
              </View>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color="#FF6B35" />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('askCoach')}
            placeholderTextColor="#8892B0"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() && !isLoading ? '#FFFFFF' : '#8892B0'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#8892B0',
    fontSize: 14,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  introContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  introIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  introText: {
    color: '#8892B0',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  quickPromptText: {
    color: '#FF6B35',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  coachMessage: {
    justifyContent: 'flex-start',
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 4,
  },
  coachBubble: {
    backgroundColor: '#1A1A2E',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  coachText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  loadingBubble: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1A1A2E',
  },
});
