// src/screens/PagoMercadoPagoScreen.js
// AI-assisted: see docs/AI_LOG.md #14
// Mercado Pago Checkout Pro inside a WebView. When the checkout redirects to our return URL
// we ask the backend to verify the payment with Mercado Pago and show the result.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import Boton from '../components/Boton';
import { PAYMENT_RETURN_URL } from '../config/backend';
import { useDriver } from '../context/DriverContext';
import { confirmPayment, createPaymentPreference } from '../services/paymentService';
import { colors, fontSize, spacing } from '../theme';

export default function PagoMercadoPagoScreen({ route, navigation }) {
  const { tripId } = route.params;
  const { driverId } = useDriver();
  const [initPoint, setInitPoint] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | checkout | verifying | approved | failed
  const [error, setError] = useState('');
  const verifying = useRef(false);

  const start = useCallback(async () => {
    setPhase('loading');
    setError('');
    try {
      const { initPoint: url } = await createPaymentPreference(tripId, driverId);
      setInitPoint(url);
      setPhase('checkout');
    } catch (e) {
      console.warn('createPaymentPreference failed:', e);
      setError('No pudimos iniciar el pago. Revisa que el backend esté encendido.');
      setPhase('failed');
    }
  }, [tripId, driverId]);

  useEffect(() => {
    start();
  }, [start]);

  const verify = useCallback(async () => {
    if (verifying.current) return;
    verifying.current = true;
    setPhase('verifying');
    try {
      // Mercado Pago may take a moment to register the payment: try a few times
      for (let i = 0; i < 5; i += 1) {
        const { status } = await confirmPayment(tripId, driverId);
        if (status === 'approved') {
          setPhase('approved');
          return;
        }
        if (status === 'rejected') break;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      setError('El pago no fue aprobado.');
      setPhase('failed');
    } catch (e) {
      console.warn('confirmPayment failed:', e);
      setError('No pudimos verificar el pago.');
      setPhase('failed');
    } finally {
      verifying.current = false;
    }
  }, [tripId, driverId]);

  // Stop the WebView from opening our return URL (it does not exist) and verify instead
  const onShouldStart = (request) => {
    if (request.url.startsWith(PAYMENT_RETURN_URL)) {
      verify();
      return false;
    }
    return true;
  };

  if (phase === 'checkout') {
    return (
      <WebView
        source={{ uri: initPoint }}
        onShouldStartLoadWithRequest={onShouldStart}
        startInLoadingState
        renderLoading={() => <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.primary} />}
        setSupportMultipleWindows={false}
      />
    );
  }

  return (
    <View style={styles.center}>
      {phase === 'loading' || phase === 'verifying' ? (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.text}>{phase === 'loading' ? 'Preparando el pago...' : 'Verificando el pago...'}</Text>
        </>
      ) : null}
      {phase === 'approved' ? (
        <>
          <Text style={styles.title}>Pago aprobado</Text>
          <Text style={styles.text}>El saldo ya se acreditó a tu cuenta.</Text>
          <View style={styles.spacer} />
          <Boton title="Continuar" onPress={() => navigation.navigate('Cobro', { paid: true })} />
        </>
      ) : null}
      {phase === 'failed' ? (
        <>
          <Text style={styles.title}>No se completó el pago</Text>
          <Text style={styles.text}>{error}</Text>
          <View style={styles.spacer} />
          <Boton title="Intentar de nuevo" onPress={start} />
          <View style={styles.spacer} />
          <Boton title="Volver" variant="outline" onPress={() => navigation.goBack()} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.lg },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, textAlign: 'center' },
  text: { fontSize: fontSize.md, color: colors.textSoft, textAlign: 'center', marginTop: spacing.sm },
  spacer: { height: spacing.md },
});
