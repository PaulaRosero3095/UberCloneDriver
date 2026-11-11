// src/screens/PerfilScreen.js
// AI-assisted: see docs/AI_LOG.md #12
// Driver profile: editable personal data and vehicle, read-only identity and documents.

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Boton from '../components/Boton';
import CampoFoto from '../components/CampoFoto';
import CampoSelect from '../components/CampoSelect';
import CampoTexto from '../components/CampoTexto';
import FormScroll from '../components/FormScroll';
import { COLOR_OPTIONS, GENDER_OPTIONS } from '../config/options';
import { useDriver } from '../context/DriverContext';
import { updateDriverProfile } from '../services/driverService';
import { colors, fontSize, radius, spacing } from '../theme';
import {
  validateCapacity,
  validateEmail,
  validateFullName,
  validatePhone,
  validatePhoto,
  validateSelect,
  validateShortText,
} from '../utils/validators';
import { formatCOP } from '../utils/format';

const STATUS_LABELS = { pending: 'Pendiente de aprobación', approved: 'Aprobado' };
const CATEGORY_LABELS = { economy: 'Económico', xl: 'XL', premium: 'Premium' };

const toForm = (driver) => ({
  photo: driver.personal?.photoUrl || null,
  fullName: driver.personal?.fullName || '',
  phone: driver.personal?.phone || '',
  email: driver.personal?.email || '',
  gender: driver.personal?.gender || '',
  brand: driver.vehicle?.brand || '',
  model: driver.vehicle?.model || '',
  color: driver.vehicle?.color || '',
  capacity: String(driver.vehicle?.capacity ?? ''),
  vehiclePhoto: driver.vehicle?.photoUrl || null,
});

function validate(v, category) {
  const errors = {
    photo: validatePhoto(v.photo, 'Agrega tu foto de perfil.'),
    fullName: validateFullName(v.fullName),
    phone: validatePhone(v.phone),
    email: validateEmail(v.email),
    gender: validateSelect(v.gender, 'Selecciona tu género.'),
    brand: validateShortText(v.brand, 'Ingresa la marca.'),
    model: validateShortText(v.model, 'Ingresa el modelo.'),
    color: validateSelect(v.color, 'Selecciona el color.'),
    capacity: validateCapacity(v.capacity, category),
    vehiclePhoto: validatePhoto(v.vehiclePhoto, 'Agrega una foto del vehículo.'),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, m]) => m));
}

// "2027-03-01" -> { text, expired }
function expiryInfo(iso) {
  if (!iso) return { text: 'Sin fecha', expired: false };
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const expired = date <= new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return { text: `${iso} · ${expired ? 'Vencido' : 'Vigente'}`, expired };
}

function Info({ label, value, danger }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, danger && { color: colors.error }]}>{value}</Text>
    </View>
  );
}

export default function PerfilScreen() {
  const { driverId, driver } = useDriver();
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', ok: false });

  // Fill the form once when the driver document arrives (not on every snapshot,
  // so typing is never overwritten by the real-time listener).
  useEffect(() => {
    if (driver && !values) setValues(toForm(driver));
  }, [driver, values]);

  if (!driver || !values) {
    return (
      <FormScroll title="Perfil" subtitle="Cargando tus datos...">
        <View />
      </FormScroll>
    );
  }

  const set = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setMessage({ text: '', ok: false });
  };

  const save = async () => {
    const found = validate(values, driver.vehicle?.category);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setMessage({ text: 'Revisa los campos marcados.', ok: false });
      return;
    }
    setSaving(true);
    try {
      await updateDriverProfile(driverId, values);
      setMessage({ text: 'Perfil actualizado.', ok: true });
    } catch (e) {
      console.warn('updateDriverProfile failed:', e);
      setMessage({ text: 'No pudimos guardar los cambios. Inténtalo de nuevo.', ok: false });
    } finally {
      setSaving(false);
    }
  };

  const docs = driver.documents || {};
  const license = expiryInfo(docs.licenseExpiry);
  const soat = expiryInfo(docs.soatExpiry);
  const tech = expiryInfo(docs.techReviewExpiry);

  return (
    <FormScroll title="Perfil" subtitle="Edita tus datos y los de tu vehículo.">
      <View style={styles.card}>
        <Info label="Estado" value={STATUS_LABELS[driver.status] || driver.status} />
        <Info label="Saldo" value={formatCOP(driver.balance || 0)} />
        <Info label="Documento" value={driver.personal?.documentId || ''} />
        <Info label="Nacimiento" value={driver.personal?.birthDate || ''} />
      </View>

      <Text style={styles.section}>Datos personales</Text>
      <CampoFoto label="Foto de perfil" uri={values.photo} onChange={set('photo')} error={errors.photo} />
      <CampoTexto label="Nombre completo" value={values.fullName} onChangeText={set('fullName')} error={errors.fullName} />
      <CampoTexto label="Celular" value={values.phone} onChangeText={set('phone')} keyboardType="number-pad" maxLength={10} error={errors.phone} />
      <CampoTexto label="Correo electrónico" value={values.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <CampoSelect label="Género" value={values.gender} onValueChange={set('gender')} options={GENDER_OPTIONS} error={errors.gender} />

      <Text style={styles.section}>Vehículo</Text>
      <View style={styles.card}>
        <Info label="Placa" value={driver.vehicle?.plate || ''} />
        <Info label="Categoría" value={CATEGORY_LABELS[driver.vehicle?.category] || ''} />
        <Info label="Año" value={String(driver.vehicle?.year || '')} />
      </View>
      <CampoTexto label="Marca" value={values.brand} onChangeText={set('brand')} error={errors.brand} />
      <CampoTexto label="Modelo" value={values.model} onChangeText={set('model')} error={errors.model} />
      <CampoSelect label="Color" value={values.color} onValueChange={set('color')} options={COLOR_OPTIONS} error={errors.color} />
      <CampoTexto label="Capacidad de pasajeros" value={values.capacity} onChangeText={set('capacity')} keyboardType="number-pad" maxLength={2} error={errors.capacity} />
      <CampoFoto label="Foto del vehículo" uri={values.vehiclePhoto} onChange={set('vehiclePhoto')} error={errors.vehiclePhoto} />

      <Text style={styles.section}>Documentos</Text>
      <View style={styles.card}>
        <Info label="Licencia" value={license.text} danger={license.expired} />
        <Info label="SOAT" value={soat.text} danger={soat.expired} />
        {docs.techReviewExpiry ? (
          <Info label="Revisión técnico-mecánica" value={tech.text} danger={tech.expired} />
        ) : null}
        <Info label="Mercado Pago" value={docs.mercadoPagoEmail || ''} />
      </View>
      <Text style={styles.note}>Los documentos solo se actualizan con soporte.</Text>

      {!!message.text && (
        <Text style={[styles.message, { color: message.ok ? colors.accent : colors.error }]}>{message.text}</Text>
      )}
      <Boton title="Guardar cambios" onPress={save} loading={saving} />
    </FormScroll>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  infoLabel: { fontSize: fontSize.sm, color: colors.textSoft },
  infoValue: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, flexShrink: 1, textAlign: 'right' },
  note: { fontSize: fontSize.sm, color: colors.textSoft, marginBottom: spacing.md },
  message: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm, textAlign: 'center' },
});