import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppBar from "@src/components/layout/app-bar";
import { MobileMessage } from "@src/api/types/mobile";
import { MobileService } from "@src/services/mobile.service";
import { useTranslation } from "@src/hooks/use-translation";
import { useFocusEffect } from "@react-navigation/native";
import { useMessagesStore } from "@src/state/messages-store";

const sortMessages = (items: MobileMessage[]) =>
  items.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

const MessageRow = memo(({ item }: { item: MobileMessage }) => (
  <View
    style={[
      styles.messageBubble,
      item.senderType === "mobile" ? styles.messageOutgoing : styles.messageIncoming,
    ]}
  >
    <Text style={styles.messageText}>{item.body}</Text>
    <Text style={styles.messageMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
  </View>
));

MessageRow.displayName = "MessageRow";

export default function MessagesScreen() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<MobileMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const setUnreadCount = useMessagesStore((state) => state.setUnreadCount);
  const listRef = useRef<FlatList<MobileMessage> | null>(null);

  const reversedMessages = useMemo(() => messages.slice().reverse(), [messages]);

  const loadMessages = useCallback(async (options?: { initial?: boolean }) => {
    const isInitial = options?.initial ?? false;
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    const result = await MobileService.getMessages();
    if (result.success) {
      const next = sortMessages(result.data.messages);
      setMessages((prev) => {
        const sameLength = prev.length === next.length;
        const sameLastId = prev[prev.length - 1]?.id === next[next.length - 1]?.id;
        return sameLength && sameLastId ? prev : next;
      });
      setUnreadCount(result.data.unreadCount ?? 0);
      setError(null);
    } else {
      setError(result.message);
    }
    if (isInitial) {
      setLoading(false);
    } else {
      setRefreshing(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    loadMessages({ initial: true });
  }, [loadMessages]);


  useFocusEffect(
    useCallback(() => {
      let active = true;
      const refresh = async () => {
        if (!active) return;
        await loadMessages();
      };
      refresh();
      const interval = setInterval(refresh, 30000);
      return () => {
        active = false;
        clearInterval(interval);
      };
    }, [loadMessages])
  );

  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 0);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const handleSend = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    const result = await MobileService.sendMessage(body);
    if (result.success) {
      setMessages((prev) => sortMessages([...prev, result.data.message]));
      setInput("");
      setError(null);
    } else {
      setError(result.message);
    }
    setSending(false);
  };


  const content = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color="#3a4c7a" />
        </View>
      );
    }
    if (messages.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t("messages.empty")}</Text>
        </View>
      );
    }
    return (
      <FlatList
        ref={listRef}
        data={reversedMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        inverted
        onContentSizeChange={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
        renderItem={({ item }) => <MessageRow item={item} />}
      />
    );
  }, [loading, reversedMessages, t]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <AppBar title={t("messages.title")} />
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <View style={styles.body}>
          {refreshing ? (
            <View style={styles.refreshHint}>
              <Text style={styles.refreshText}>Refreshing...</Text>
            </View>
          ) : null}
          {content}
        </View>
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t("messages.inputPlaceholder")}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending || !input.trim()}
          >
            <MaterialCommunityIcons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  keyboard: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 16 },
  refreshHint: { paddingTop: 8, paddingBottom: 4 },
  refreshText: { color: "#6b7aa6", fontSize: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingVertical: 16, gap: 12 },
  messageBubble: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  messageIncoming: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e6f3",
  },
  messageOutgoing: {
    alignSelf: "flex-end",
    backgroundColor: "#dbe7ff",
    width: "80%",
  },
  messageText: { color: "#1f2a44", fontSize: 14 },
  messageMeta: { color: "#6b7aa6", fontSize: 11, marginTop: 6 },
  composer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e1e6f3",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
    minHeight: 64,
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#e1e6f3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1f2a44",
    flex: 1,
    backgroundColor: "#ffffff",
  },
  sendButton: {
    alignSelf: "flex-end",
    backgroundColor: "#3a4c7a",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyText: { color: "#6b7aa6" },
  errorBox: { paddingHorizontal: 16, paddingTop: 8 },
  errorText: { color: "#d21f3c", fontSize: 12 },
});
