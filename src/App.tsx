// src/App.tsx
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
  Text,
} from 'react-native';
import * as Location from 'expo-location';
import { LocationAccuracy } from 'expo-location';
import { LocationData, AddressData, Region } from './types/types';
import { useReverseGeocode } from './hooks/useReverseGeocode';
import { styles } from './utils/styles';
import { LocationButton } from './components/LocationButton';
import { MapComponent } from './components/MapComponent';
import { InfoBox } from './components/InfoBox';
import { AddressBox } from './components/AddressBox';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import { WelcomeCard } from './components/WelcomeCard';

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
    let locData: LocationData | null = null;
    let addr: AddressData | null = null;
    
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
                reject(new Error(`Erro de geolocalização: ${error.message}`));
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        });

        locData = {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? 0,
            altitude: position.coords.altitude ?? null,
            heading: position.coords.heading ?? null,
            speed: position.coords.speed ?? null,
          },
          timestamp: position.timestamp || Date.now(),
        };

        setLocation(locData);
        setMarkerCoords({
          latitude: locData.coords.latitude,
          longitude: locData.coords.longitude,
        });

        const newRegion: Region = {
          latitude: locData.coords.latitude,
          longitude: locData.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: (0.03 * window.width) / window.height,
        };
        setMapRegion(newRegion);

        addr = await lookup(locData.coords.latitude, locData.coords.longitude);
        setAddress(addr);

        // Animação do mapa no Web (se disponível)
        if (mapRef.current) {
          mapRef.current.animateCamera({
            center: {
              latitude: locData.coords.latitude,
              longitude: locData.coords.longitude,
            },
            zoom: 15,
          });
        }

      } else {
        // Mobile: usa Expo Location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão Necessária',
            'Habilite as permissões de localização nas configurações para obter sua posição atual.',
            [{ text: 'OK' }]
          );
          setLoadingLocation(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: LocationAccuracy.High,
        });

        locData = {
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? 0,
            altitude: pos.coords.altitude ?? null,
            heading: pos.coords.heading ?? null,
            speed: pos.coords.speed ?? null,
          },
          timestamp: pos.timestamp,
        };

        setLocation(locData);
        setMarkerCoords({
          latitude: locData.coords.latitude,
          longitude: locData.coords.longitude,
        });

        const newRegion: Region = {
          latitude: locData.coords.latitude,
          longitude: locData.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: (0.03 * window.width) / window.height,
        };
        setMapRegion(newRegion);

        addr = await lookup(locData.coords.latitude, locData.coords.longitude);
        setAddress(addr);

        // Animação do mapa no mobile
        if (mapRef.current) {
          mapRef.current.animateCamera({
            center: {
              latitude: locData.coords.latitude,
              longitude: locData.coords.longitude,
            },
            zoom: 15,
          });
        }
      }

      if (locData && addr) {
        console.log('✅ Localização obtida com sucesso:', {
          lat: locData.coords.latitude.toFixed(6),
          lng: locData.coords.longitude.toFixed(6),
          endereço: addr.formatted,
          precisão: `${locData.coords.accuracy.toFixed(0)}m`,
        });
      }
    } catch (err: any) {
      console.error('❌ Erro na localização:', err);
      const errorMessage = err?.message || 'Erro desconhecido ao obter localização';
      setError(errorMessage);
      
      if (Platform.OS === 'web') {
        Alert.alert('Erro de Localização', errorMessage);
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapPress = async (event: any) => {
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setMarkerCoords({ latitude, longitude });
      
      // Atualiza região do mapa
      const newRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01 * window.width / window.height,
      };
      setMapRegion(newRegion);

      // Busca novo endereço
      const newAddress = await lookup(latitude, longitude);
      setAddress(newAddress);
      
      // Cria dados de localização simulados para o InfoBox
      setLocation({
        coords: {
          latitude,
          longitude,
          accuracy: 5, // Precisão simulada
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
    <SafeAreaView style={styles.container}>
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
        />
        
        <LoadingIndicator 
          loading={loadingLocation || loadingGeo}
          message={loadingLocation ? 'Obtendo localização...' : 'Buscando endereço...'}
        />
        
        <ErrorDisplay 
          error={error || reverseGeoError} 
          onRetry={handleGetCurrentLocation} 
        />
        
        <MapComponent 
          region={mapRegion} 
          markerCoords={markerCoords} 
          address={address ?? undefined}
          onMapPress={handleMapPress} 
        />
        
        <InfoBox location={location} />
        <AddressBox address={address} loading={loadingGeo} />
        
        <View style={styles.footer}>
          

            Feito com ❤️ usando React Native, Expo e LocationIQ
            {"\n"}© 2025 - GeoLocationPOC
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}