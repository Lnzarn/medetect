import React, { createContext, useContext, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import BaseColors, { setColorsTheme } from '../constants/colors';
import { getPreference, setPreference } from './sync';

export const AppColors = {
    light: {
        background: '#FFFFFF',
        elementBg: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        text: BaseColors.text,
        textMuted: '#6B7280',
        navBg: BaseColors.primary,
        primary: BaseColors.primary,
        primaryDark: BaseColors.primaryDark,
        primaryLight: BaseColors.primaryLight,
        white: '#FFFFFF',
        black: '#000000',
    },
    dark: {
        background: '#050814',
        elementBg: '#0B1220',
        surface: '#0D1B2A',
        border: '#1F2937',
        text: '#FFFFFF',
        textMuted: '#7C85A0',
        navBg: BaseColors.primaryDark,
        primary: BaseColors.primaryLight,
        primaryDark: BaseColors.primary,
        primaryLight: '#60A5FA',
        white: '#FFFFFF',
        black: '#000000',
    },
} as const;

type ThemeCtx = {
    isDark: boolean;
    setDark: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeCtx>({ isDark: false, setDark: () => { } });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const t = await getPreference('theme');
            if (!mounted) return;
            const dark = t === 'dark';
            setIsDark(dark);
            // update colors module to reflect the theme for older components
            try { setColorsTheme(dark); } catch { }
            StatusBar.setBarStyle(dark ? 'light-content' : 'dark-content');
        })();
        return () => { mounted = false; };
    }, []);

    const setDark = async (v: boolean) => {
        setIsDark(v);
        try {
            await setPreference('theme', v ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme pref', e);
        }
        // update colors module to reflect the theme for older components
        try { setColorsTheme(v); } catch { }
        StatusBar.setBarStyle(v ? 'light-content' : 'dark-content');
    };

    return (
        <ThemeContext.Provider value={{ isDark, setDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

export function useAppColors() {
    const { isDark } = useContext(ThemeContext);
    return isDark ? AppColors.dark : AppColors.light;
}

export default ThemeContext;
