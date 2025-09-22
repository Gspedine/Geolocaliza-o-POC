import React from 'react';
import { Platform } from 'react-native';
import { WebMapWrapper } from './WebMapWrapper';
import { NativeMapRenderer } from './NativeMapRenderer';
import { MapComponentProps } from '../types/types';
import { styles as globalStyles } from '../utils/styles';

export const MapComponent: React.FC<MapComponentProps> = ({ 
  region, 
  markerCoords, 
  address, 
  onMapPress 
}) => {
  // Web: Usa Google Maps
  if (Platform.OS === 'web') {
    return (
      <WebMapWrapper 
        region={region} 
        markerCoords={markerCoords} 
        address={address} 
        onMapPress={onMapPress}
        style={globalStyles.mapContainer}
      />
    );
  }

  // Mobile: Usa mapa nativo
  return <NativeMapRenderer 
    region={region} 
    markerCoords={markerCoords} 
    address={address}
    onMapPress={onMapPress} 
  />;
};