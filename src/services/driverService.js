// src/services/driverService.js
// AI-assisted: see docs/AI_LOG.md #3
// The ONLY place that talks to Firestore about drivers.
// Bank or card numbers are never stored: the payment gateway handles them.

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

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
