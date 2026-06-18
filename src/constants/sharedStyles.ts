import { useAppColors } from "@/lib/theme";
import { StyleSheet } from "react-native";

export default function useSharedStyles() {
  const colors = useAppColors();

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 100,
      paddingBottom: 130,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: 2,
      textAlign: "center",
      marginBottom: 60,
    },
    formContainer: {
      marginBottom: 40,
    },
    label: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.text,
      marginBottom: 20,
      backgroundColor: colors.elementBg,
    },
    bottomContainer: {
      alignItems: "center",
      marginTop: "auto",
    },
    button: {
      backgroundColor: colors.primaryDark,
      paddingVertical: 16,
      paddingHorizontal: 40,
      borderRadius: 14,
      width: "100%",
      alignItems: "center",
      marginBottom: 20,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "800",
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    footerText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    footerLink: {
      fontSize: 13,
      color: colors.primaryDark,
      fontWeight: "800",
    },
  });
}
