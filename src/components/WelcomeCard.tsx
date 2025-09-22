import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../utils/styles';

export const WelcomeCard: React.FC = () => {
  const features = [
    { icon: '📍', text: 'Geolocalização em tempo real' },
    { icon: '🗺️', text: 'Mapas interativos multiplataforma' },
    { icon: '🇧🇷', text: 'Endereços formatados no padrão brasileiro' },
    { icon: '⚡', text: 'Rápido e otimizado para mobile e web' },
  ];

  return (
    <View style={styles.welcomeCard}>
      <Text style={styles.welcomeIcon}>🌍</Text>
      <Text style={styles.welcomeTitle}>Bem-vindo ao GeoLocationPOC!</Text>
      <Text style={styles.welcomeText}>
        Descubra sua localização atual com precisão e veja o endereço formatado no padrão brasileiro. 
        <Text style={styles.welcomeHighlight}> Funciona em iOS, Android e Web!</Text>
      </Text>
      
      <View style={styles.welcomeFeatures}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};