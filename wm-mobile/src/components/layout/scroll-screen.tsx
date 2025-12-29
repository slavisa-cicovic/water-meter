import { ReactNode } from "react";
import { ScrollView, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import AppBar from "@src/components/layout/app-bar";

type ScrollScreenProps = {
  title: string;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const CONTENT_PADDING_BOTTOM = 32;

export default function ScrollScreen({ title, children, contentContainerStyle }: ScrollScreenProps) {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomPadding = CONTENT_PADDING_BOTTOM + tabBarHeight + insets.bottom;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppBar title={title} />
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle, { paddingBottom: bottomPadding }]}
        scrollIndicatorInsets={{ bottom: bottomPadding }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  content: { padding: 20, paddingBottom: CONTENT_PADDING_BOTTOM },
});
