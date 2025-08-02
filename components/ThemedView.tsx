import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'surface' | 'card';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  type = 'default',
  ...otherProps 
}: ThemedViewProps) {
  let colorKey: 'background' | 'surface' | 'cardBackground' = 'background';
  
  if (type === 'surface') {
    colorKey = 'surface';
  } else if (type === 'card') {
    colorKey = 'cardBackground';
  }
  
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, colorKey);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
