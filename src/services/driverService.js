// src/services/driverService.js
// AI-assisted: see docs/AI_LOG.md #3
// The ONLY place that talks to Firestore about drivers.
// Bank or card numbers are never stored: the payment gateway handles them.

import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';

import { db } from '../config/firebase';
import { PRICING } from '../config/pricing';
import { toISODate } from '../utils/format';
import { uploadImage } from './imageService';

// Saves the registration with status "pending" until someone approves it
export async function registerDriver(values) {
  const [photoUrl, vehiclePhotoUrl, licensePhotoUrl, soatPhotoUrl, techReviewPhotoUrl] =
    await Promise.all([
      uploadImage(values.photo),
      uploadImage(values.vehiclePhoto),
      uploadImage(values.licensePhoto),
      uploadImage(values.soatPhoto),
      uploadImage(values.techReviewPhoto),
    ]);

  const payload = {
    personal: {
      fullName: values.fullName.trim(),
      documentId: values.documentId.trim(),
      phone: values.phone.trim(),
      birthDate: toISODate(values.birthDate),
      gender: values.gender,
      email: values.email.trim().toLowerCase(),
      language: values.language,
      photoUrl,
    },
    vehicle: {
      category: values.category,
      plate: values.plate,
      brand: values.brand.trim(),
      model: values.model.trim(),
      year: Number(values.year),
      color: values.color,
      capacity: Number(values.capacity),
      photoUrl: vehiclePhotoUrl,
    },
    documents: {
      licenseNumber: values.licenseNumber.trim(),
      licensePhotoUrl,
      licenseExpiry: toISODate(values.licenseExpiry),
      soatPhotoUrl,
      soatExpiry: toISODate(values.soatExpiry),
      techReviewPhotoUrl,
      techReviewExpiry: toISODate(values.techReviewExpiry),
      mercadoPagoEmail: values.mercadoPagoEmail.trim().toLowerCase(),
    },
    acceptedCommissionRate: PRICING.commissionRate,
    status: 'pending', // pending -> approved (changed by hand in the database)
    isAvailable: false,
    balance: 0,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'drivers'), payload);
  return ref.id;
}

// Real-time listener for one driver. Returns the unsubscribe function.
export function subscribeToDriver(driverId, onData, onError) {
  return onSnapshot(
    doc(db, 'drivers', driverId),
    (snapshot) => onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError
  );
}

// Availability switch (the screen only allows it when the driver is approved)
export async function setDriverAvailability(driverId, isAvailable) {
  await updateDoc(doc(db, 'drivers', driverId), { isAvailable });
}

// Last known position, so the backend / passengers can find the driver
export async function updateDriverLocation(driverId, { latitude, longitude }) {
  await updateDoc(doc(db, 'drivers', driverId), {
    location: { latitude, longitude },
    locationUpdatedAt: serverTimestamp(),
  });
}

// Profile edit: only the fields a driver may change. New photos (local URIs) are
// uploaded to Cloudinary; http URLs pass through untouched. Dotted paths keep the
// rest of the nested maps intact.
export async function updateDriverProfile(driverId, values) {
  const [photoUrl, vehiclePhotoUrl] = await Promise.all([
    uploadImage(values.photo),
    uploadImage(values.vehiclePhoto),
  ]);

  await updateDoc(doc(db, 'drivers', driverId), {
    'personal.fullName': values.fullName.trim(),
    'personal.phone': values.phone.trim(),
    'personal.email': values.email.trim().toLowerCase(),
    'personal.gender': values.gender,
    'personal.photoUrl': photoUrl,
    'vehicle.brand': values.brand.trim(),
    'vehicle.model': values.model.trim(),
    'vehicle.color': values.color,
    'vehicle.capacity': Number(values.capacity),
    'vehicle.photoUrl': vehiclePhotoUrl,
  });
}

// FCM device token, so the backend can push "new trip request" to this driver
export async function saveFcmToken(driverId, fcmToken) {
  await updateDoc(doc(db, 'drivers', driverId), {
    fcmToken,
    fcmTokenUpdatedAt: serverTimestamp(),
  });
}
