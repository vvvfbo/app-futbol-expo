import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Send, ArrowLeft } from 'lucide-react-native';
import { useChat } from '@/hooks/chat-context';
import { useAuth } from '@/hooks/auth-context';
import { ChatMessage } from '@/types';

const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatMessageDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Hoy';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  }
};

const MessageBubble = ({ message, isFromCurrentUser }: { 
  message: ChatMessage; 
  isFromCurrentUser: boolean; 
}) => {
  return (
    <View style={[
      styles.messageContainer,
      isFromCurrentUser ? styles.sentMessageContainer : styles.receivedMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        isFromCurrentUser ? styles.sentMessage : styles.receivedMessage
      ]}>
        <Text style={[
          styles.messageText,
          isFromCurrentUser ? styles.sentMessageText : styles.receivedMessageText
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          isFromCurrentUser ? styles.sentMessageTime : styles.receivedMessageTime
        ]}>
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const DateSeparator = ({ date }: { date: string }) => (
  <View style={styles.dateSeparatorContainer}>
    <View style={styles.dateSeparatorLine} />
    <Text style={styles.dateSeparatorText}>{date}</Text>
    <View style={styles.dateSeparatorLine} />
  </View>
);

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const { 
    currentChat, 
    messages, 
    sendMessage, 
    selectChat,
    markMessagesAsRead 
  } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (chatId && chatId !== currentChat?.id) {
      selectChat(chatId);
    }
  }, [chatId, currentChat?.id, selectChat]);

  useEffect(() => {
    if (chatId) {
      markMessagesAsRead(chatId);
    }
  }, [chatId, markMessagesAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isLoading) return;
    
    const textToSend = messageText.trim();
    setMessageText('');
    setIsLoading(true);
    
    try {
      await sendMessage(textToSend);
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      setMessageText(textToSend);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    if (!user) return null;
    
    const isFromCurrentUser = item.senderId === user.id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const currentDate = formatMessageDate(item.timestamp);
    const previousDate = previousMessage ? formatMessageDate(previousMessage.timestamp) : null;
    const showDateSeparator = currentDate !== previousDate;
    
    return (
      <>
        {showDateSeparator && <DateSeparator date={currentDate} />}
        <MessageBubble 
          message={item} 
          isFromCurrentUser={isFromCurrentUser} 
        />
      </>
    );
  };

  const getOtherParticipantName = () => {
    if (!currentChat || !user) return 'Chat';
    
    const otherParticipant = currentChat.participants.find(id => id !== user.id);
    if (!otherParticipant) return 'Chat';
    
    const otherUserData = currentChat.participantsData[otherParticipant];
    return otherUserData ? `${otherUserData.nombre} ${otherUserData.apellidos}`.trim() : 'Usuario';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: getOtherParticipantName(),
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Lista de mensajes */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
          onLayout={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />
        
        {/* Input de mensaje */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#9CA3AF"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!messageText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isLoading}
            >
              <Send 
                size={20} 
                color={(!messageText.trim() || isLoading) ? '#9CA3AF' : '#FFFFFF'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardContainer: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginVertical: 2,
  },
  sentMessageContainer: {
    alignItems: 'flex-end',
  },
  receivedMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sentMessage: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#FFFFFF',
  },
  receivedMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  sentMessageTime: {
    color: '#DBEAFE',
    textAlign: 'right',
  },
  receivedMessageTime: {
    color: '#9CA3AF',
    textAlign: 'left',
  },
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
});