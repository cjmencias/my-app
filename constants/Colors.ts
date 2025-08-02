/**
 * Beautiful light theme colors for the app
 * Designed for a modern, clean, and friendly appearance
 */

const tintColorLight = '#007AFF'; // iOS Blue
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1D1D1F',           // Rich black for text
    background: '#FFFFFF',      // Pure white background
    tint: tintColorLight,       // iOS Blue for interactive elements
    icon: '#8E8E93',           // Light gray for icons
    tabIconDefault: '#8E8E93',  // Light gray for inactive tabs
    tabIconSelected: tintColorLight, // Blue for active tabs
    
    // Additional colors for better theming
    surface: '#F2F2F7',        // Light gray surface
    surfaceSecondary: '#E5E5EA', // Slightly darker surface
    border: '#D1D1D6',         // Light border color
    placeholder: '#8E8E93',    // Placeholder text
    success: '#34C759',        // Green for success states
    warning: '#FF9500',        // Orange for warnings
    error: '#FF3B30',          // Red for errors
    info: '#007AFF',           // Blue for info
    
    // Card and container colors
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E5EA',
    inputBackground: '#F2F2F7',
    inputBorder: '#D1D1D6',
    
    // Semantic colors
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF2D92',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,
    
    // Additional colors for dark mode
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    border: '#38383A',
    placeholder: '#8E8E93',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#64D2FF',
    
    // Card and container colors
    cardBackground: '#1C1C1E',
    cardBorder: '#38383A',
    inputBackground: '#1C1C1E',
    inputBorder: '#38383A',
    
    // Semantic colors
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    accent: '#FF375F',
  },
};
