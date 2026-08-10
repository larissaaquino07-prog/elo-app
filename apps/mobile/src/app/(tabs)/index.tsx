import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useThemeColors } from "@/theme/useThemeColors";
import { spacing, radii, typography } from "@/theme/tokens";
import { PrototypeBanner } from "@/components/PrototypeBanner";

// Canned replies only — no Anthropic/OpenAI call exists yet. Written to
// roughly match PROMPT_ENGINE.md §1–2's tone (professional-warm, brief
// corrections, never robotic) so the *feel* is representative, not the
// actual reasoning. See PROTOTYPE.md.
const CANNED_COACH_REPLIES = [
  "Got it — \"I am agree\" is close, but in English we don't use \"am\" with \"agree\": just \"I agree with that plan.\" Want to try the sentence again?",
  "That's a really natural way to put it. In a performance-review context, you could also say \"I'd like to build on that point\" — a touch more formal, same idea.",
  "Nice. Quick one: it's \"I've been working here for three years,\" not \"since three years\" — \"since\" wants a point in time, \"for\" wants a duration. Keep going, you were on a roll.",
];

type Message = {
  id: string;
  sender: "user" | "coach";
  text: string;
};

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

const VOICE_STATE_LABEL: Record<VoiceState, string> = {
  idle: "Tap to speak",
  listening: "Listening",
  thinking: "Coach is thinking",
  speaking: "Coach is speaking",
};

let nextId = 0;
function makeId() {
  nextId += 1;
  return `msg-${nextId}`;
}

export default function CoachScreen() {
  const colors = useThemeColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: makeId(),
      sender: "coach",
      text: "Hey Julia — ready to pick up where we left off, or want to start with something new today?",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const replyIndex = useRef(0);
  const listRef = useRef<FlatList<Message>>(null);

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text || isThinking) return;

    setMessages((prev) => [...prev, { id: makeId(), sender: "user", text }]);
    setDraft("");
    setIsThinking(true);

    // Simulated "thinking" delay — stands in for a real Claude API round
    // trip (ARCHITECTURE.md §5.1), which does not exist in this prototype.
    setTimeout(() => {
      const reply =
        CANNED_COACH_REPLIES[replyIndex.current % CANNED_COACH_REPLIES.length] ??
        "Let's keep going — tell me more.";
      replyIndex.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: makeId(), sender: "coach", text: reply },
      ]);
      setIsThinking(false);
      requestAnimationFrame(() =>
        listRef.current?.scrollToEnd({ animated: true })
      );
    }, 1100);

    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true })
    );
  }, [draft, isThinking]);

  const cycleVoiceState = useCallback(() => {
    setVoiceState((current) => {
      switch (current) {
        case "idle":
          return "listening";
        case "listening":
          return "thinking";
        case "thinking":
          return "speaking";
        case "speaking":
        default:
          return "idle";
      }
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrototypeBanner />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <MessageBubble message={item} colors={colors} />
        )}
        ListFooterComponent={
          isThinking ? (
            <Animated.View entering={FadeInUp.duration(200)}>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textTertiary, marginLeft: spacing.lg },
                ]}
              >
                Coach is thinking…
              </Text>
            </Animated.View>
          ) : null
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.composer,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <VoiceControl
            state={voiceState}
            colors={colors}
            onPress={cycleVoiceState}
          />

          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message your coach…"
            placeholderTextColor={colors.textTertiary}
            style={[
              typography.body,
              styles.input,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            multiline
            accessibilityLabel="Message composer"
          />

          <Pressable
            onPress={sendMessage}
            disabled={!draft.trim() || isThinking}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  draft.trim() && !isThinking
                    ? colors.accentPrimary
                    : colors.border,
              },
            ]}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBubble({
  message,
  colors,
}: {
  message: Message;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const isUser = message.sender === "user";
  return (
    // DESIGN_SYSTEM.md §6 — "Message appearing: quick fade + slight rise,
    // 200ms, easeOut".
    <Animated.View
      entering={FadeInUp.duration(200)}
      style={[
        styles.bubbleRow,
        { justifyContent: isUser ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.accentPrimary : colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            typography.body,
            { color: isUser ? "#FFFFFF" : colors.textPrimary },
          ]}
        >
          {message.text}
        </Text>
      </View>
    </Animated.View>
  );
}

function VoiceControl({
  state,
  colors,
  onPress,
}: {
  state: VoiceState;
  colors: ReturnType<typeof useThemeColors>;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // DESIGN_SYSTEM.md §6 — "Voice state change: spring, response 0.4 /
    // damping 0.8". Reanimated's spring model (mass/stiffness/damping)
    // doesn't take SwiftUI's response/damping pair directly; this is a
    // reasonable hand-tuned approximation of the same "alive, not
    // mechanical" feel, not a literal unit conversion.
    scale.value = withSpring(1.15, { damping: 8, stiffness: 180 }, () => {
      scale.value = withSpring(1, { damping: 8, stiffness: 180 });
    });
    onPress();
  };

  const stateColor =
    state === "idle"
      ? colors.surfaceElevated
      : state === "listening"
        ? colors.accentPrimary
        : state === "thinking"
          ? colors.accentWarm
          : colors.success;

  return (
    <View style={styles.voiceControlWrapper}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={VOICE_STATE_LABEL[state]}
          style={[
            styles.voiceControl,
            { backgroundColor: stateColor, borderColor: colors.border },
          ]}
        >
          <Text style={styles.voiceControlIcon}>🎙</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubble: {
    maxWidth: "80%",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.button,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  voiceControlWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  voiceControl: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceControlIcon: {
    fontSize: 20,
  },
});
