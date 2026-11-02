// src/screens/registro/VehiculoScreen.js
// AI-assisted: see docs/AI_LOG.md #3
// Registration tab 2: vehicle.

import React, { useEffect } from 'react';

import CampoTexto from '../../components/CampoTexto';
import CampoSelect from '../../components/CampoSelect';
import CampoFoto from '../../components/CampoFoto';
import FormScroll from '../../components/FormScroll';
import { CATEGORY_OPTIONS, COLOR_OPTIONS } from '../../config/options';
import { useRegistro } from '../../context/RegistroContext';
import { normalizePlate } from '../../utils/validators';

export default function VehiculoScreen({ navigation }) {
  const { values, update, touch, pick, touchSection, getError } = useRegistro();
  const error = (name) => getError('vehicle', name);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => touchSection('vehicle'));
    return unsubscribe;
  }, [navigation, touchSection]);

  return (
    <FormScroll title="Vehículo" subtitle="Datos del carro con el que vas a trabajar.">
      <CampoSelect
        label="Categoría"
        value={values.category}
        onValueChange={(value) => pick('category', value)}
        options={CATEGORY_OPTIONS}
        error={error('category')}
      />

      <CampoTexto
        label="Placa"
        value={values.plate}
        // The plate is converted to uppercase BEFORE it is validated
        onChangeText={(text) => update('plate', normalizePlate(text))}
        onBlur={() => touch('plate')}
        error={error('plate')}
        placeholder="ABC123"
        maxLength={6}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <CampoTexto
        label="Marca"
        value={values.brand}
        onChangeText={(text) => update('brand', text)}
        onBlur={() => touch('brand')}
        error={error('brand')}
        placeholder="Ej. Chevrolet"
        maxLength={30}
      />

      <CampoTexto
        label="Modelo"
        value={values.model}
        onChangeText={(text) => update('model', text)}
        onBlur={() => touch('model')}
        error={error('model')}
        placeholder="Ej. Spark GT"
        maxLength={30}
      />

      <CampoTexto
        label="Año"
        value={values.year}
        onChangeText={(text) => update('year', text.replace(/\D/g, ''))}
        onBlur={() => touch('year')}
        error={error('year')}
        placeholder="Ej. 2020"
        keyboardType="number-pad"
        maxLength={4}
      />

      <CampoSelect
        label="Color"
        value={values.color}
        onValueChange={(value) => pick('color', value)}
        options={COLOR_OPTIONS}
        error={error('color')}
      />

      <CampoTexto
        label="Capacidad de pasajeros"
        value={values.capacity}
        onChangeText={(text) => update('capacity', text.replace(/\D/g, ''))}
        onBlur={() => touch('capacity')}
        error={error('capacity')}
        placeholder={values.category === 'xl' ? 'Mínimo 6 para XL' : 'Ej. 4'}
        keyboardType="number-pad"
        maxLength={2}
      />

      <CampoFoto
        label="Foto del vehículo"
        hint="Debe verse la placa."
        uri={values.vehiclePhoto}
        onChange={(uri) => pick('vehiclePhoto', uri)}
        error={error('vehiclePhoto')}
      />
    </FormScroll>
  );
}
