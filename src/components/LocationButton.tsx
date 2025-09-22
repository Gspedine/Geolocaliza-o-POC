import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { styles } from '../utils/styles';

interface LocationButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const LocationButton: React.FC<LocationButtonProps> = ({ 
  onPress, 
  loading, 
  disabled = false 
}) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          styles.button,
          (loading || disabled) && { opacity: 0.6 }
        ]}
        onPress={onPress}
        disabled={loading || disabled}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>📍 Obter Localização Atual</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};