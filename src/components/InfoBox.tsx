import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../utils/styles';
import { LocationData } from '../types/types';

interface InfoBoxProps {
  location: LocationData | null;
}

export const InfoBox: React.FC<InfoBoxProps> = ({ location }) => {
  if (!location) return null;

  const { coords } = location;

  return (
    <View style={styles.infoBox}>
      <Text style={styles.sectionTitle}>📊 Informações de Localização</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Text style={styles.infoLabel}>Latitude</Text>
          </View>
          <Text style={styles.infoValue}>
            {coords.latitude.toFixed(6)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Text style={styles.infoLabel}>Longitude</Text>
          </View>
          <Text style={styles.infoValue}>
            {coords.longitude.toFixed(6)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Text style={styles.infoLabel}>Precisão</Text>
          </View>
          <Text style={styles.infoValue}>
            {coords.accuracy?.toFixed(0)}m
          </Text>
        </View>
        
        {coords.altitude && (
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoLabel}>Altitude</Text>
            </View>
            <Text style={styles.infoValue}>
              {coords.altitude.toFixed(0)}m
            </Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Text style={styles.infoLabel}>Data/Hora</Text>
          </View>
          <Text style={styles.infoValue}>
            {new Date(location.timestamp).toLocaleString('pt-BR')}
          </Text>
        </View>
      </View>
    </View>
  );
};