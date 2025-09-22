import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import { useChat } from '@/hooks/chat-context';
import { useAuth } from '@/hooks/auth-context';
import { Chat } from '@/types';

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 168) { // 7 días
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short' 
    });
  } else {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }
};

const ChatListItem = ({ chat, onPress }: { chat: Chat; onPress: () => void }) => {
  const { user } = useAuth();
  const { getUnreadCount } = useChat();
  
  if (!user) return null;
  
  // Obtener datos del otro participante
  const otherParticipant = chat.participants.find(id => id !== user.id);
  const otherUserData = otherParticipant ? chat.participantsData[otherParticipant] : null;
  
  const unreadCount = getUnreadCount(chat.id);
  const isFromCurrentUser = chat.lastMessageSenderId === user.id;
  
  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {otherUserData?.nombre?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {otherUserData ? `${otherUserData.nombre} ${otherUserData.apellidos}`.trim() : 'Usuario'}
          </Text>
          {chat.lastTimestamp && (
            <Text style={styles.chatTime}>
              {formatTime(chat.lastTimestamp)}
            </Text>
          )}
        </View>
        
        <View style={styles.lastMessageContainer}>
          <Text 
            style={[
              styles.lastMessage,
              unreadCount > 0 && !isFromCurrentUser && styles.unreadMessage
            ]} 
            numberOfLines={1}
          >
            {isFromCurrentUser && 'Tú: '}
            {chat.lastMessage || 'Sin mensajes'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ChatsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { 
    chats, 
    isLoading, 
    loadChats, 
    selectChat, 
    searchChats,
    getTotalUnreadCount 
  } = useChat();
  const { user } = useAuth();

  const filteredChats = searchQuery ? searchChats(searchQuery) : chats;
  const totalUnread = getTotalUnreadCount();

  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user?.id, loadChats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadChats();
    } catch (error) {
      console.error('Error refreshing chats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleChatPress = async (chat: Chat) => {
    try {
      await selectChat(chat.id);
      router.push(`/chat/${chat.id}`);
    } catch (error) {
      console.error('Error selecting chat:', error);
      // TODO: Mostrar modal de error en lugar de Alert
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MessageCircle size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No tienes conversaciones</Text>
      <Text style={styles.emptySubtitle}>
        Inicia una conversación con otros entrenadores desde sus perfiles
      </Text>
    </View>
  );

  const renderChatItem = ({ item }: { item: Chat }) => (
    <ChatListItem 
      chat={item} 
      onPress={() => handleChatPress(item)} 
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{
          title: `Chats${totalUnread > 0 ? ` (${totalUnread})` : ''}`,
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversaciones..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Lista de chats */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={filteredChats.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});