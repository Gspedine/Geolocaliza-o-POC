import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  View,
  Text,
} from 'react-native';
import * as Location from 'expo-location';
import { LocationAccuracy } from 'expo-location';
import { LocationData, AddressData, Region } from '@appTypes/types';
import { useReverseGeocode } from '@hooks/useReverseGeocode';
import { styles } from '@utils/styles';
import { LocationButton } from '@components/LocationButton';
import { MapComponent } from '@components/MapComponent';
import { InfoBox } from '@components/InfoBox';
import { AddressBox } from '@components/AddressBox';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { LoadingIndicator } from '@components/LoadingIndicator';
import { WelcomeCard } from '@components/WelcomeCard';

const window = Dimensions.get('window');

export default function App() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [markerCoords, setMarkerCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { lookup, loading: loadingGeo, error: reverseGeoError } = useReverseGeocode();
  const mapRef = useRef<any>(null);

  // Handle localização com suporte Web
  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    setError(null);
    try {
      // Web: usa geolocation do browser
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          throw new Error('Geolocalização não suportada neste navegador');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                reject(new Error('Permissão de localização negada pelo usuário'));
              } else if (error.code === error.POSITION_UNAVAILABLE) {
                reject(new Error('Informações de localização não disponíveis'));
              } else if (error.code === error.TIMEOUT) {
                reject(new Error('Tempo de espera da localização esgotado'));
              } else {
                reject(new Error('Erro desconhecido ao obter localização'));
              }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        });

        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } else {
        // Native: usa expo-location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permissão de localização negada');
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: LocationAccuracy.High,
        });

        return {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }
    } catch (err: any) {
      const errorMessage = err?.message ?? 'Erro ao obter localização';
      console.error('Erro ao obter localização:', errorMessage);
      setError(errorMessage);
      Alert.alert('Erro de Localização', errorMessage);
      return null;
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleConfirmLocation = async (coords: { latitude: number; longitude: number }) => {
    setLoadingLocation(true);
    setError(null);
    try {
      const newRegion: Region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01 * window.width / window.height,
      };
      setMapRegion(newRegion);
      setMarkerCoords(coords);

      const newAddress = await lookup(coords.latitude, coords.longitude);
      setAddress(newAddress);

      setLocation({
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: 5,
          altitude: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });

      console.log('🗺️ Localização confirmada:', {
        latitude: coords.latitude.toFixed(6),
        longitude: coords.longitude.toFixed(6),
      });
    } catch (err: any) {
      const errorMessage = err?.message ?? 'Erro ao processar localização';
      console.error('Erro ao confirmar localização:', errorMessage);
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapPress = async (event: any) => {
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setMarkerCoords({ latitude, longitude });
      
      const newRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01 * window.width / window.height,
      };
      setMapRegion(newRegion);

      const newAddress = await lookup(latitude, longitude);
      setAddress(newAddress);
      
      setLocation({
        coords: {
          latitude,
          longitude,
          accuracy: 5,
          altitude: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
      
      console.log('🗺️ Mapa pressionado:', { latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) });
    } catch (err: any) {
      console.error('Erro ao processar clique no mapa:', err);
      setError(err.message || 'Erro ao buscar endereço');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeCard />
        
        <LocationButton 
          onPress={handleGetCurrentLocation} 
          loading={loadingLocation}
          disabled={loadingGeo}
          onConfirm={handleConfirmLocation}
        />
        
        <LoadingIndicator 
          loading={loadingLocation || loadingGeo}
          message={loadingLocation ? 'Obtendo localização...' : 'Buscando endereço...'}
        />
        
        <ErrorDisplay 
          error={error || reverseGeoError} 
          onRetry={handleGetCurrentLocation} 
        />
             
        <InfoBox location={location} />
        <AddressBox address={address} loading={loadingGeo} />
        
        <View style={styles.footer}>
          <Text>
            Feito com ❤️ usando React Native, Expo e LocationIQ
            {"\n"}© 2025 - GeoLocationPOC
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}