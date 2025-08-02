// Force light mode for a cleaner, brighter appearance
export function useColorScheme() {
  return 'light' as const;
}

// If you want to re-enable automatic dark/light mode detection later, 
// uncomment the line below and comment out the function above:
// export { useColorScheme } from 'react-native';
