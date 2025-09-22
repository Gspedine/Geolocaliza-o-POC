import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { styles } from '../utils/styles';
import { AddressData } from '../types/types';

interface AddressBoxProps {
  address: AddressData | null;
  loading?: boolean;
}

export const AddressBox: React.FC<AddressBoxProps> = ({ 
  address, 
  loading = false 
}) => {
  const [copying, setCopying] = useState(false);

  if (!address) return null;

  const handleCopy = async () => {
    if (copying) return;
    
    try {
      setCopying(true);
      await Clipboard.setStringAsync(address.formatted);
      Alert.alert('Sucesso', 'Endereço copiado para a área de transferência!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao copiar endereço');
    } finally {
      setCopying(false);
    }
  };

  const renderAddressComponents = () => {
    const components = [
      { label: 'Rua', value: address.road, icon: '🏠' },
      { label: 'Bairro', value: address.neighbourhood, icon: '🏘️' },
      { label: 'Cidade', value: address.city, icon: '🏙️' },
      { label: 'Estado', value: address.state, icon: '🌟' },
      { label: 'CEP', value: address.postcode, icon: '📮' },
    ];

    const validComponents = components.filter(comp => comp.value);

    if (validComponents.length === 0) return null;

    return (
      <View style={styles.componentsContainer}>
        <View style={styles.componentsHeader}>
          <Text style={styles.componentsTitle}>Componentes do Endereço</Text>
          <Text style={styles.componentsCount}>
            {validComponents.length} componentes
          </Text>
        </View>
        <View style={styles.componentsGrid}>
          {validComponents.map((comp, index) => (
            <View key={index} style={styles.componentRow}>
              <Text style={styles.componentIcon}>{comp.icon}</Text>
              <Text style={styles.componentLabel}>{comp.label}:</Text>
              <Text style={styles.componentValue}>{comp.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.addressBox}>
      <View style={styles.formattedAddressContainer}>
        <View style={styles.formattedAddressHeader}>
          <Text style={styles.formattedAddressIcon}>📍</Text>
          <Text style={styles.formattedAddressLabel}>Endereço Completo</Text>
        </View>
        <Text style={styles.formattedAddress}>
          {loading ? 'Carregando endereço...' : address.formatted}
        </Text>
      </View>

      {renderAddressComponents()}

      <View style={styles.originalContainer}>
        <View style={styles.originalHeader}>
          <Text style={styles.originalLabel}>Endereço Original (OpenStreetMap)</Text>
          <Text style={styles.originalSource}>LocationIQ</Text>
        </View>
        <Text style={styles.originalAddress}>
          {address.display_name}
        </Text>
      </View>

      <TouchableOpacity 
        style={[
          styles.copyButton, 
          copying && { opacity: 0.7 }
        ]} 
        onPress={handleCopy}
        disabled={copying}
      >
        {copying ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.copyButtonText}>📋 Copiar Endereço</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};