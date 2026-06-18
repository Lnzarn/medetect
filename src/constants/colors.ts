let THEME: 'light' | 'dark' = 'light';

export function setColorsTheme(isDark: boolean) {
  THEME = isDark ? 'dark' : 'light';
}

const Colors = {
  primary: '#1A3F8B',
  primaryDark: '#0D47A1',
  primaryLight: '#2C5FD4',
  lightBlue: '#D9E8F5',

  get white() {
    return THEME === 'dark' ? '#000000' : '#FFFFFF';
  },
  get black() {
    return THEME === 'dark' ? '#FFFFFF' : '#000000';
  },
  get text() {
    return THEME === 'dark' ? '#FFFFFF' : '#0D1B2A';
  },

  grey: '#6B7280',
  greyLight: '#9CA3AF',
  greyBorder: '#E5E7EB',
  greyTrack: '#D1D5DB',

  navBg: '#1A3F8B',
};

export default Colors;
