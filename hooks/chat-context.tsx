import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './auth-context';
import { useNotifications } from './notifications-context';
import { Chat, ChatMessage, User } from '@/types';

// Mock AsyncStorage para desarrollo
const mockStorage = {
  async getItem(key: string): Promise<string | null> {
    if (!key?.trim() || key.length > 200) return null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key.trim());
      }
      return null;
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (!key?.trim() || key.length > 200 || !value?.trim() || value.length > 50000) return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key.trim(), value.trim());
      }
    } catch {
      // Silently fail
    }
  },
};

// Mock Firebase functions para el chat
interface MockChatData {
  chats: Map<string, Chat>;
  messages: Map<string, ChatMessage[]>;
}

const mockChatData: MockChatData = {
  chats: new Map(),
  messages: new Map(),
};

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  isLoading: boolean;
  
  // Gestión de chats
  loadChats: () => Promise<void>;
  createOrGetChat: (otherUserId: string, otherUserData: Partial<User>) => Promise<Chat>;
  selectChat: (chatId: string) => Promise<void>;
  
  // Gestión de mensajes
  sendMessage: (text: string, metadata?: any) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  markMessagesAsRead: (chatId: string) => Promise<void>;
  
  // Utilidades
  getUnreadCount: (chatId?: string) => number;
  getTotalUnreadCount: () => number;
  searchChats: (query: string) => Chat[];
}

export const [ChatProvider, useChat] = createContextHook<ChatState>(() => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { sendChatNotification } = useNotifications();

  // Cargar chats del usuario
  const loadChats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Cargar desde storage (mock)
      const storedChats = await mockStorage.getItem(`chats_${user.id}`);
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        setChats(parsedChats);
        
        // Actualizar mock data
        parsedChats.forEach((chat: Chat) => {
          if (chat && chat.id?.trim()) {
            mockChatData.chats.set(chat.id, chat);
          }
        });
      }
      
      console.log('✅ Chats loaded for user:', user.email);
    } catch (error) {
      console.error('❌ Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  // Cargar mensajes de un chat
  const loadMessages = useCallback(async (chatId: string) => {
    if (!chatId?.trim()) {
      console.error('Chat ID inválido');
      return;
    }
    try {
      setIsLoading(true);
      
      // Cargar desde mock data
      const chatMessages = mockChatData.messages.get(chatId) || [];
      
      // También intentar cargar desde storage
      const storedMessages = await mockStorage.getItem(`messages_${chatId}`);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        mockChatData.messages.set(chatId, parsedMessages);
        setMessages(parsedMessages);
      } else {
        setMessages(chatMessages);
      }
      
      console.log('💬 Mensajes cargados para chat:', chatId, chatMessages.length);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Marcar mensajes como leídos
  const markMessagesAsRead = useCallback(async (chatId: string) => {
    if (!user?.id || !chatId?.trim()) return;
    
    try {
      const chatMessages = mockChatData.messages.get(chatId) || [];
      const updatedMessages = chatMessages.map(message => ({
        ...message,
        readBy: message.readBy.includes(user.id) 
          ? message.readBy 
          : [...message.readBy, user.id]
      }));
      
      // Actualizar mock data
      mockChatData.messages.set(chatId, updatedMessages);
      
      // Guardar en storage
      await mockStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
      
      // Actualizar contador de no leídos del chat
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        const updatedChat: Chat = {
          ...chat,
          unreadCount: {
            ...chat.unreadCount,
            [user.id]: 0,
          },
        };
        
        const updatedChats = chats.map(c => c.id === chatId ? updatedChat : c);
        setChats(updatedChats);
        
        if (currentChat?.id === chatId) {
          setCurrentChat(updatedChat);
        }
        
        // Guardar chats actualizados
        await mockStorage.setItem(`chats_${user.id}`, JSON.stringify(updatedChats));
        mockChatData.chats.set(chatId, updatedChat);
      }
      
      // Actualizar mensajes si es el chat actual
      if (currentChat?.id === chatId) {
        setMessages(updatedMessages);
      }
      
      console.log('✅ Mensajes marcados como leídos:', chatId);
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  }, [user?.id, chats, currentChat]);

  // Crear o obtener chat existente
  const createOrGetChat = useCallback(async (otherUserId: string, otherUserData: Partial<User>): Promise<Chat> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      // Buscar chat existente
      const existingChat = chats.find(chat => 
        chat.participants.includes(user.id) && chat.participants.includes(otherUserId)
      );
      
      if (existingChat) {
        console.log('📱 Chat existente encontrado:', existingChat.id);
        return existingChat;
      }
      
      // Crear nuevo chat
      const chatId = `chat_${user.id}_${otherUserId}_${Date.now()}`;
      const newChat: Chat = {
        id: chatId,
        participants: [user.id, otherUserId],
        participantsData: {
          [user.id]: {
            nombre: user.nombre,
            apellidos: user.apellidos,
            email: user.email,
          },
          [otherUserId]: {
            nombre: otherUserData.nombre || 'Usuario',
            apellidos: otherUserData.apellidos || '',
            email: otherUserData.email || '',
          },
        },
        unreadCount: {
          [user.id]: 0,
          [otherUserId]: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Guardar en mock data
      mockChatData.chats.set(chatId, newChat);
      mockChatData.messages.set(chatId, []);
      
      // Actualizar estado local
      const updatedChats = [...chats, newChat];
      setChats(updatedChats);
      
      // Guardar en storage
      await mockStorage.setItem(`chats_${user.id}`, JSON.stringify(updatedChats));
      
      console.log('✅ Nuevo chat creado:', chatId);
      return newChat;
    } catch (error) {
      console.error('❌ Error creating/getting chat:', error);
      throw error;
    }
  }, [user, chats]);

  // Seleccionar chat actual
  const selectChat = useCallback(async (chatId: string) => {
    if (!chatId?.trim()) {
      console.error('Chat ID inválido');
      return;
    }
    
    try {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) {
        console.error('Chat no encontrado:', chatId);
        return;
      }
      
      setCurrentChat(chat);
      await loadMessages(chatId);
      await markMessagesAsRead(chatId);
      
      console.log('📱 Chat seleccionado:', chatId);
    } catch (error) {
      console.error('❌ Error selecting chat:', error);
    }
  }, [chats, loadMessages, markMessagesAsRead]);

  // Enviar mensaje
  const sendMessage = useCallback(async (text: string, metadata?: any) => {
    if (!user?.id || !currentChat) {
      console.error('Usuario o chat no disponible');
      return;
    }
    
    if (!text.trim()) {
      console.error('Mensaje vacío');
      return;
    }
    
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMessage: ChatMessage = {
        id: messageId,
        chatId: currentChat.id,
        senderId: user.id,
        senderName: `${user.nombre} ${user.apellidos}`.trim(),
        text: text.trim(),
        timestamp: new Date().toISOString(),
        readBy: [user.id], // El remitente ya lo ha "leído"
        type: 'text',
        metadata,
      };
      
      // Actualizar mensajes localmente
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Guardar en mock data
      mockChatData.messages.set(currentChat.id, updatedMessages);
      
      // Guardar en storage
      await mockStorage.setItem(`messages_${currentChat.id}`, JSON.stringify(updatedMessages));
      
      // Actualizar último mensaje del chat
      const updatedChat: Chat = {
        ...currentChat,
        lastMessage: text.trim(),
        lastMessageSenderId: user.id,
        lastTimestamp: newMessage.timestamp,
        updatedAt: newMessage.timestamp,
        unreadCount: {
          ...currentChat.unreadCount,
          // Incrementar contador para otros participantes
          ...Object.fromEntries(
            currentChat.participants
              .filter(id => id !== user.id)
              .map(id => [id, (currentChat.unreadCount[id] || 0) + 1])
          ),
        },
      };
      
      // Actualizar chat en estado local
      const updatedChats = chats.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      );
      setChats(updatedChats);
      setCurrentChat(updatedChat);
      
      // Guardar chats actualizados
      await mockStorage.setItem(`chats_${user.id}`, JSON.stringify(updatedChats));
      
      // Actualizar mock data
      mockChatData.chats.set(currentChat.id, updatedChat);
      
      console.log('✅ Mensaje enviado:', messageId);
      
      // Enviar notificación push al otro usuario
      const otherParticipant = currentChat.participants.find(id => id !== user.id);
      if (otherParticipant) {
        const senderName = `${user.nombre} ${user.apellidos}`.trim();
        await sendChatNotification(senderName, text.trim(), currentChat.id);
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }, [user, currentChat, messages, chats, sendChatNotification]);

  // Obtener contador de no leídos
  const getUnreadCount = useCallback((chatId?: string): number => {
    if (!user?.id) return 0;
    
    if (chatId?.trim()) {
      const chat = chats.find(c => c.id === chatId);
      return chat?.unreadCount[user.id] || 0;
    }
    
    return 0;
  }, [user?.id, chats]);

  // Obtener contador total de no leídos
  const getTotalUnreadCount = useCallback((): number => {
    if (!user?.id) return 0;
    
    return chats.reduce((total, chat) => {
      return total + (chat.unreadCount[user.id] || 0);
    }, 0);
  }, [user?.id, chats]);

  // Buscar chats
  const searchChats = useCallback((query: string): Chat[] => {
    if (!query.trim()) return chats;
    
    const searchTerm = query.toLowerCase().trim();
    return chats.filter(chat => {
      // Buscar en nombres de participantes
      const participantNames = Object.values(chat.participantsData)
        .map(p => `${p.nombre} ${p.apellidos}`.toLowerCase())
        .join(' ');
      
      // Buscar en último mensaje
      const lastMessage = chat.lastMessage?.toLowerCase() || '';
      
      return participantNames.includes(searchTerm) || lastMessage.includes(searchTerm);
    });
  }, [chats]);

  // Cargar chats al inicializar
  useEffect(() => {
    if (user?.id) {
      const timeoutId = setTimeout(() => {
        loadChats();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [user?.id, loadChats]);

  return useMemo(() => ({
    chats,
    currentChat,
    messages,
    isLoading,
    loadChats,
    createOrGetChat,
    selectChat,
    sendMessage,
    loadMessages,
    markMessagesAsRead,
    getUnreadCount,
    getTotalUnreadCount,
    searchChats,
  }), [
    chats,
    currentChat,
    messages,
    isLoading,
    loadChats,
    createOrGetChat,
    selectChat,
    sendMessage,
    loadMessages,
    markMessagesAsRead,
    getUnreadCount,
    getTotalUnreadCount,
    searchChats,
  ]);
});