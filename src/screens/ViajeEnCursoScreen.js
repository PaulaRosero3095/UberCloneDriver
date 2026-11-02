import React from 'react';
import ScreenPlaceholder from '../components/ScreenPlaceholder';
import { useTrip } from '../context/TripContext';

export default function ViajeEnCursoScreen() {
  const { activeTrip } = useTrip();
  return (
    <ScreenPlaceholder
      title="Viaje en curso"
      subtitle={activeTrip ? `Estado: ${activeTrip.status}` : 'Cargando viaje...'}
    />
  );
}