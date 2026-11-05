// src/screens/registro/DatosPersonalesScreen.js
// AI-assisted: see docs/AI_LOG.md #3
// Registration tab 1: personal data.

import React, { useEffect } from 'react';

import CampoTexto from '../../components/CampoTexto';
import CampoSelect from '../../components/CampoSelect';
import CampoFecha from '../../components/CampoFecha';
import CampoFoto from '../../components/CampoFoto';
import FormScroll from '../../components/FormScroll';
import { GENDER_OPTIONS, LANGUAGE_OPTIONS } from '../../config/options';
import { useRegistro } from '../../context/RegistroContext';
import { MIN_AGE } from '../../utils/validators';

const today = new Date();
const eighteenYearsAgo = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());

export default function DatosPersonalesScreen({ navigation }) {
  const { values, update, touch, pick, touchSection, getError } = useRegistro();
  const error = (name) => getError('personal', name);

  // Concept: useEffect with cleanup. When the user leaves the tab, show its errors.
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => touchSection('personal'));
    return unsubscribe;
  }, [navigation, touchSection]);

  return (
    <FormScroll title="Datos personales" subtitle="Todos los campos son obligatorios.">
      <CampoFoto
        label="Foto de perfil"
        uri={values.photo}
        onChange={(uri) => pick('photo', uri)}
        error={error('photo')}
      />

      <CampoTexto
        label="Nombre completo"
        value={values.fullName}
        onChangeText={(text) => update('fullName', text)}
        onBlur={() => touch('fullName')}
        error={error('fullName')}
        placeholder="Ej. Juan Pérez"
        maxLength={50}
        autoCapitalize="words"
      />

      <CampoTexto
        label="Documento de identidad"
        value={values.documentId}
        onChangeText={(text) => update('documentId', text.replace(/\D/g, ''))}
        onBlur={() => touch('documentId')}
        error={error('documentId')}
        placeholder="6 a 10 dígitos"
        keyboardType="number-pad"
        maxLength={10}
      />

      <CampoTexto
        label="Número de celular"
        value={values.phone}
        onChangeText={(text) => update('phone', text.replace(/\D/g, ''))}
        onBlur={() => touch('phone')}
        error={error('phone')}
        placeholder="10 dígitos"
        keyboardType="number-pad"
        maxLength={10}
      />

      <CampoFecha
        label="Fecha de nacimiento"
        value={values.birthDate}
        onChange={(date) => pick('birthDate', date)}
        error={error('birthDate')}
        initialDate={eighteenYearsAgo}
        maximumDate={today}
      />

      <CampoSelect
        label="Género"
        value={values.gender}
        onValueChange={(value) => pick('gender', value)}
        options={GENDER_OPTIONS}
        error={error('gender')}
      />

      <CampoTexto
        label="Correo electrónico"
        value={values.email}
        onChangeText={(text) => update('email', text)}
        onBlur={() => touch('email')}
        error={error('email')}
        placeholder="nombre@dominio.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <CampoSelect
        label="Idioma"
        value={values.language}
        onValueChange={(value) => pick('language', value)}
        options={LANGUAGE_OPTIONS}
        error={error('language')}
      />
    </FormScroll>
  );
}
