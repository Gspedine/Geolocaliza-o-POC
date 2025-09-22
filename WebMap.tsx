import React, { useEffect, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Platform } from 'react-native';
import { Region, AddressData } from './src/types/types';

interface WebMapProps {
  region: Region | null;
  markerCoords: { latitude: number; longitude: number } | null;
  address?: AddressData;
  onMapPress: (event: any) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -23.5505, // São Paulo como default
  lng: -46.6333
};

export default function WebMap({ 
  region, 
  markerCoords, 
  address, 
  onMapPress 
}: WebMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  // Obtém a API key do config do Expo
  const getGoogleMapsApiKey = () => {
    if (typeof window !== 'undefined') {
      // Tenta pegar do window (pode ser injetado pelo bundler)
      return (window as any).__GOOGLE_MAPS_API_KEY || 
             process.env.GOOGLE_MAPS_API_KEY ||
             // Fallback para app.json (não ideal para produção)
             'SUA_API_KEY_GOOGLE_MAPS_WEB';
    }
    return '';
  };

  const apiKey = getGoogleMapsApiKey();

  useEffect(() => {
    if (region && mapRef.current) {
      const newCenter = {
        lat: region.latitude,
        lng: region.longitude
      };
      mapRef.current.setCenter(newCenter);
      mapRef.current.setZoom(15);
    }
  }, [region]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      onMapPress({
        nativeEvent: {
          coordinate: { latitude: lat, longitude: lng }
        }
      });
    }
  };

  if (!apiKey || apiKey === 'SUA_API_KEY_GOOGLE_MAPS_WEB') {
    return (
      <View style={webStyles.errorContainer}>
        <Text style={webStyles.errorText}>
          🔑 Configure sua API Key do Google Maps em app.json
          {"\n\n"}web.config.googleMaps.apiKey
        </Text>
      </View>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={region ? { lat: region.latitude, lng: region.longitude } : center}
        zoom={region ? 15 : 10}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text',
              stylers: [{ visibility: 'on' }]
            }
          ]
        }}
      >
        {markerCoords && (
          <Marker
            position={{ lat: markerCoords.latitude, lng: markerCoords.longitude }}
            title="Localização Selecionada"
            label={
              address?.formatted 
                ? `${address.formatted.substring(0, 30)}${address.formatted.length > 30 ? '...' : ''}`
                : 'Clique para selecionar'
            }
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}

const webStyles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 20,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  }
});