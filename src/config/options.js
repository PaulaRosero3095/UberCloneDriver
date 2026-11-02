// src/config/options.js
// AI-assisted: see docs/AI_LOG.md #3
// Options for the dropdown lists of the registration form.

export const GENDER_OPTIONS = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Otro' },
  { value: 'undisclosed', label: 'Prefiero no decirlo' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

// Same categories the passenger chooses (keys match PRICING.categoryMultiplier)
export const CATEGORY_OPTIONS = [
  { value: 'economy', label: 'Económico' },
  { value: 'xl', label: 'XL' },
  { value: 'premium', label: 'Premium' },
];

export const COLOR_OPTIONS = [
  'Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Otro',
].map((name) => ({ value: name.toLowerCase(), label: name }));
