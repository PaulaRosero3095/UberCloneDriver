// src/utils/validators.js
// AI-assisted: see docs/AI_LOG.md #3
// Pure validation functions. Each one returns an error message; '' means valid.

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PLATE_RE = /^[A-Z]{3}\d{3}$/; // Colombian car plate: ABC123

export const MIN_AGE = 18;
export const MIN_YEAR = 1950; // sanity limit so "0001" is not accepted
export const TECH_REVIEW_AFTER_YEARS = 5; // didactic rule: older cars need the technical review

// ---------- Form model ----------
export const INITIAL_VALUES = {
  // personal data
  photo: null,
  fullName: '',
  documentId: '',
  phone: '',
  birthDate: null,
  gender: '',
  email: '',
  language: 'es',
  // vehicle
  category: '',
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  capacity: '',
  vehiclePhoto: null,
  // documents and payments
  licenseNumber: '',
  licensePhoto: null,
  licenseExpiry: null,
  soatPhoto: null,
  soatExpiry: null,
  techReviewPhoto: null,
  techReviewExpiry: null,
  mercadoPagoEmail: '',
  acceptedTerms: false,
};

export const SECTION_FIELDS = {
  personal: ['photo', 'fullName', 'documentId', 'phone', 'birthDate', 'gender', 'email', 'language'],
  vehicle: ['category', 'plate', 'brand', 'model', 'year', 'color', 'capacity', 'vehiclePhoto'],
  documents: [
    'licenseNumber', 'licensePhoto', 'licenseExpiry', 'soatPhoto', 'soatExpiry',
    'techReviewPhoto', 'techReviewExpiry', 'mercadoPagoEmail', 'acceptedTerms',
  ],
};

export const SECTION_LABELS = {
  personal: 'Datos personales',
  vehicle: 'Vehículo',
  documents: 'Documentos',
};

// ---------- Helpers ----------
export const normalizePlate = (value) => String(value || '').toUpperCase().replace(/\s/g, '');

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function calculateAge(birthDate, today = new Date()) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

export function requiresTechnicalReview(year, currentYear = new Date().getFullYear()) {
  if (!/^\d{4}$/.test(String(year))) return false;
  return currentYear - Number(year) >= TECH_REVIEW_AFTER_YEARS;
}

// ---------- Field validators ----------
export function validateFullName(value) {
  const v = String(value || '').trim();
  if (!v) return 'Ingresa tu nombre completo.';
  if (v.length > 50) return 'Máximo 50 caracteres.';
  if (!NAME_RE.test(v)) return 'Solo letras y espacios.';
  return '';
}

export function validateDocumentId(value) {
  const v = String(value || '').trim();
  if (!v) return 'Ingresa tu documento de identidad.';
  if (!/^\d{6,10}$/.test(v)) return 'Debe tener entre 6 y 10 dígitos (solo números).';
  return '';
}

export function validatePhone(value) {
  const v = String(value || '').trim();
  if (!v) return 'Ingresa tu número de celular.';
  if (!/^\d{10}$/.test(v)) return 'Debe tener exactamente 10 dígitos (solo números).';
  return '';
}

export function validateBirthDate(date, today = new Date()) {
  if (!date) return 'Selecciona tu fecha de nacimiento.';
  if (calculateAge(date, today) < MIN_AGE) return `Debes tener al menos ${MIN_AGE} años.`;
  return '';
}

export function validateEmail(value, emptyMessage = 'Ingresa tu correo electrónico.') {
  const v = String(value || '').trim();
  if (!v) return emptyMessage;
  if (!EMAIL_RE.test(v)) return 'Ingresa un correo válido (ej. nombre@dominio.com).';
  return '';
}

export function validateSelect(value, message) {
  return value ? '' : message;
}

export function validatePlate(value) {
  const v = normalizePlate(value);
  if (!v) return 'Ingresa la placa del vehículo.';
  if (!PLATE_RE.test(v)) return 'Formato de placa inválido. Usa 3 letras y 3 números (ej. ABC123).';
  return '';
}

export function validateShortText(value, emptyMessage, max = 30) {
  const v = String(value || '').trim();
  if (!v) return emptyMessage;
  if (v.length > max) return `Máximo ${max} caracteres.`;
  return '';
}

export function validateYear(value, currentYear = new Date().getFullYear()) {
  const v = String(value || '').trim();
  if (!v) return 'Ingresa el año del vehículo.';
  if (!/^\d{4}$/.test(v)) return 'Debe tener 4 dígitos.';
  const n = Number(v);
  if (n > currentYear) return `El año no puede ser mayor a ${currentYear}.`;
  if (n < MIN_YEAR) return `El año no puede ser menor a ${MIN_YEAR}.`;
  return '';
}

export function validateCapacity(value, category) {
  const v = String(value || '').trim();
  if (!v) return 'Ingresa la capacidad de pasajeros.';
  if (!/^\d+$/.test(v)) return 'Solo números.';
  const n = Number(v);
  if (n < 1) return 'Debe ser al menos 1.';
  if (n > 20) return 'Máximo 20 pasajeros.';
  if (category === 'xl' && n < 6) return 'La categoría XL exige mínimo 6 pasajeros.';
  return '';
}

export function validatePhoto(uri, message) {
  return uri ? '' : message;
}

export function validateLicenseNumber(value) {
  const v = String(value || '').trim();
  if (!v) return 'Ingresa el número de tu licencia.';
  if (!/^\d{6,15}$/.test(v)) return 'Debe tener entre 6 y 15 dígitos (solo números).';
  return '';
}

// The expiry date must be AFTER today
export function validateExpiry(date, emptyMessage, today = new Date()) {
  if (!date) return emptyMessage;
  if (startOfDay(date) <= startOfDay(today)) return 'La fecha de vencimiento debe ser posterior a hoy.';
  return '';
}

export function validateTerms(accepted) {
  return accepted ? '' : 'Debes aceptar los términos y condiciones.';
}

// ---------- Section validators (return only the fields that have an error) ----------
const compact = (errors) =>
  Object.fromEntries(Object.entries(errors).filter(([, message]) => message));

export function validatePersonal(v, today = new Date()) {
  return compact({
    photo: validatePhoto(v.photo, 'Agrega tu foto de perfil.'),
    fullName: validateFullName(v.fullName),
    documentId: validateDocumentId(v.documentId),
    phone: validatePhone(v.phone),
    birthDate: validateBirthDate(v.birthDate, today),
    gender: validateSelect(v.gender, 'Selecciona tu género.'),
    email: validateEmail(v.email),
    language: validateSelect(v.language, 'Selecciona un idioma.'),
  });
}

export function validateVehicle(v) {
  return compact({
    category: validateSelect(v.category, 'Selecciona la categoría.'),
    plate: validatePlate(v.plate),
    brand: validateShortText(v.brand, 'Ingresa la marca.'),
    model: validateShortText(v.model, 'Ingresa el modelo.'),
    year: validateYear(v.year),
    color: validateSelect(v.color, 'Selecciona el color.'),
    capacity: validateCapacity(v.capacity, v.category),
    vehiclePhoto: validatePhoto(v.vehiclePhoto, 'Agrega una foto donde se vea la placa.'),
  });
}

export function validateDocuments(v, today = new Date()) {
  const needsReview = requiresTechnicalReview(v.year);
  return compact({
    licenseNumber: validateLicenseNumber(v.licenseNumber),
    licensePhoto: validatePhoto(v.licensePhoto, 'Agrega la foto de tu licencia.'),
    licenseExpiry: validateExpiry(v.licenseExpiry, 'Selecciona el vencimiento de la licencia.', today),
    soatPhoto: validatePhoto(v.soatPhoto, 'Agrega la foto del SOAT.'),
    soatExpiry: validateExpiry(v.soatExpiry, 'Selecciona el vencimiento del SOAT.', today),
    techReviewPhoto: needsReview
      ? validatePhoto(v.techReviewPhoto, 'Agrega la foto de la revisión técnico-mecánica.')
      : '',
    techReviewExpiry: needsReview
      ? validateExpiry(v.techReviewExpiry, 'Selecciona el vencimiento de la revisión.', today)
      : '',
    mercadoPagoEmail: validateEmail(v.mercadoPagoEmail, 'Ingresa el correo de tu cuenta de Mercado Pago.'),
    acceptedTerms: validateTerms(v.acceptedTerms),
  });
}
