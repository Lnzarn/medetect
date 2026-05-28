import { StyleSheet } from 'react-native';
import Colors from './colors';

// Reusable style blocks shared across multiple screens
const sharedStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 80,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.black,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 60,
  },
  formContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.black,
    marginBottom: 20,
    backgroundColor: Colors.white,
  },
  bottomContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  button: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '60%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: Colors.grey,
  },
  footerLink: {
    fontSize: 13,
    color: Colors.primaryDark,
    fontWeight: '800',
  },
});

export default sharedStyles;
