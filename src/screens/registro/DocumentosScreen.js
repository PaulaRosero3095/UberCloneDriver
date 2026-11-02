import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Boton from '../../components/Boton';
import CampoCheck from '../../components/CampoCheck';
import CampoFecha from '../../components/CampoFecha';
import CampoFoto from '../../components/CampoFoto';
import CampoTexto from '../../components/CampoTexto';
import FormScroll from '../../components/FormScroll';
import { PRICING } from '../../config/pricing';
import { useRegistro } from '../../context/RegistroContext';
import { colors, fontSize, radius, spacing } from '../../theme';
import { formatPercent } from '../../utils/format';
import { SECTION_LABELS } from '../../utils/validators';

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

export default function DocumentosScreen({ navigation }) {
  const {
    values, update, touch, pick, touchSection, getError,
    allValid, isSectionValid, techReviewRequired, status, submitError, submit,
  } = useRegistro();
  const error = (name) => getError('documents', name);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => touchSection('documents'));
    return unsubscribe;
  }, [navigation, touchSection]);

  // Final state: the account waits for approval
  if (status === 'submitted') {
    return (
      <FormScroll>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>¡Registro enviado!</Text>
          <Text style={styles.successText}>
            Tu cuenta está en estado <Text style={styles.bold}>Pendiente de aprobación</Text>. No podrás
            ponerte Disponible hasta que sea aprobada.
          </Text>
          <Boton
            title="Ir al inicio"
            onPress={() =>
              navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Main' }] })
            }
          />
        </View>
      </FormScroll>
    );
  }

  const missingSections = Object.keys(SECTION_LABELS).filter((section) => !isSectionValid(section));

  return (
    <FormScroll title="Documentos y pagos" subtitle="Los documentos deben estar vigentes.">
      <Text style={styles.section}>Licencia de conducción</Text>
      <CampoTexto
        label="Número de licencia"
        value={values.licenseNumber}
        onChangeText={(text) => update('licenseNumber', text.replace(/\D/g, ''))}
        onBlur={() => touch('licenseNumber')}
        error={error('licenseNumber')}
        keyboardType="number-pad"
        maxLength={15}
      />
      <CampoFoto
        label="Foto de la licencia"
        uri={values.licensePhoto}
        onChange={(uri) => pick('licensePhoto', uri)}
        error={error('licensePhoto')}
      />
      <CampoFecha
        label="Vencimiento de la licencia"
        value={values.licenseExpiry}
        onChange={(date) => pick('licenseExpiry', date)}
        error={error('licenseExpiry')}
        minimumDate={tomorrow}
      />

      <Text style={styles.section}>SOAT</Text>
      <CampoFoto
        label="Foto del SOAT"
        uri={values.soatPhoto}
        onChange={(uri) => pick('soatPhoto', uri)}
        error={error('soatPhoto')}
      />
      <CampoFecha
        label="Vencimiento del SOAT"
        value={values.soatExpiry}
        onChange={(date) => pick('soatExpiry', date)}
        error={error('soatExpiry')}
        minimumDate={tomorrow}
      />

      <Text style={styles.section}>Revisión técnico-mecánica</Text>
      {techReviewRequired ? (
        <>
          <CampoFoto
            label="Foto de la revisión técnico-mecánica"
            uri={values.techReviewPhoto}
            onChange={(uri) => pick('techReviewPhoto', uri)}
            error={error('techReviewPhoto')}
          />
          <CampoFecha
            label="Vencimiento de la revisión"
            value={values.techReviewExpiry}
            onChange={(date) => pick('techReviewExpiry', date)}
            error={error('techReviewExpiry')}
            minimumDate={tomorrow}
          />
        </>
      ) : (
        <Text style={styles.note}>
          {values.year
            ? 'No aplica para el año de tu vehículo.'
            : 'Indica el año del vehículo en la pestaña "Vehículo" para saber si aplica.'}
        </Text>
      )}

      <Text style={styles.section}>Pagos</Text>
      <CampoTexto
        label="Correo de tu cuenta de Mercado Pago"
        value={values.mercadoPagoEmail}
        onChangeText={(text) => update('mercadoPagoEmail', text)}
        onBlur={() => touch('mercadoPagoEmail')}
        error={error('mercadoPagoEmail')}
        placeholder="Aquí recibirás tus pagos"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.note}>
        No guardamos números de cuenta ni de tarjeta. Los datos sensibles los maneja la pasarela de pago.
      </Text>

      <CampoCheck
        label={`Acepto los términos y condiciones. La plataforma cobra una comisión del ${formatPercent(
          PRICING.commissionRate
        )} sobre la tarifa de cada viaje.`}
        checked={values.acceptedTerms}
        onToggle={(checked) => pick('acceptedTerms', checked)}
        error={error('acceptedTerms')}
      />

      {!allValid && missingSections.length > 0 && (
        <Text style={styles.missing}>
          Te falta completar: {missingSections.map((section) => SECTION_LABELS[section]).join(', ')}.
        </Text>
      )}
      {!!submitError && <Text style={styles.submitError}>{submitError}</Text>}

      <Boton
        title="Enviar registro"
        onPress={submit}
        disabled={!allValid}
        loading={status === 'submitting'}
      />
    </FormScroll>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  note: { fontSize: fontSize.sm, color: colors.textSoft, marginBottom: spacing.md },
  missing: { fontSize: fontSize.sm, color: colors.error, marginBottom: spacing.sm },
  submitError: { fontSize: fontSize.sm, color: colors.error, marginBottom: spacing.sm },
  successCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  successTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  successText: { fontSize: fontSize.md, color: colors.textSoft, lineHeight: 22 },
  bold: { fontWeight: '800', color: colors.text },
});