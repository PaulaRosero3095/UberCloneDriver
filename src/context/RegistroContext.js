// src/context/RegistroContext.js
// AI-assisted: see docs/AI_LOG.md #3
// Holds the registration form shared by the 3 tabs, its errors and the submit state.
// Concept: Context + useMemo (derived errors) + useCallback (stable handlers).

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { registerDriver } from '../services/driverService';
import {
  INITIAL_VALUES,
  SECTION_FIELDS,
  requiresTechnicalReview,
  validateDocuments,
  validatePersonal,
  validateVehicle,
} from '../utils/validators';

const RegistroContext = createContext(null);

export function RegistroProvider({ children }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({}); // fields the user already visited
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState('draft'); // draft | submitting | submitted
  const [submitError, setSubmitError] = useState('');
  const [driverId, setDriverId] = useState(null);

  // Errors of every section, recalculated only when the values change
  const errors = useMemo(
    () => ({
      personal: validatePersonal(values),
      vehicle: validateVehicle(values),
      documents: validateDocuments(values),
    }),
    [values]
  );

  const isSectionValid = useCallback(
    (section) => Object.keys(errors[section]).length === 0,
    [errors]
  );

  const allValid = useMemo(
    () => Object.keys(errors).every((section) => Object.keys(errors[section]).length === 0),
    [errors]
  );

  const techReviewRequired = useMemo(() => requiresTechnicalReview(values.year), [values.year]);

  // Changes a value (text fields: the error appears later, on blur)
  const update = useCallback((name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
  }, []);

  const touch = useCallback((name) => {
    setTouched((previous) => (previous[name] ? previous : { ...previous, [name]: true }));
  }, []);

  // Changes a value and marks it as visited (dropdowns, dates, photos, checkbox)
  const pick = useCallback((name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setTouched((previous) => ({ ...previous, [name]: true }));
  }, []);

  // When the user leaves a tab, every field of that tab shows its error
  const touchSection = useCallback((section) => {
    setTouched((previous) => {
      const next = { ...previous };
      SECTION_FIELDS[section].forEach((field) => {
        next[field] = true;
      });
      return next;
    });
  }, []);

  // The error is only visible after the user visited the field (or tried to submit)
  const getError = useCallback(
    (section, name) => (touched[name] || submitAttempted ? errors[section][name] || '' : ''),
    [errors, touched, submitAttempted]
  );

  const sectionHasVisibleErrors = useCallback(
    (section) => SECTION_FIELDS[section].some((name) => getError(section, name) !== ''),
    [getError]
  );

  const submit = useCallback(async () => {
    setSubmitAttempted(true);
    if (!allValid) return false;

    setStatus('submitting');
    setSubmitError('');
    try {
      const id = await registerDriver(values);
      setDriverId(id);
      setStatus('submitted');
      return true;
    } catch (error) {
      setSubmitError('No pudimos enviar tu registro. Revisa tu conexión e inténtalo de nuevo.');
      setStatus('draft');
      return false;
    }
  }, [allValid, values]);

  const value = useMemo(
    () => ({
      values,
      errors,
      status,
      submitError,
      driverId,
      allValid,
      techReviewRequired,
      isSectionValid,
      update,
      touch,
      pick,
      touchSection,
      getError,
      sectionHasVisibleErrors,
      submit,
    }),
    [
      values, errors, status, submitError, driverId, allValid, techReviewRequired,
      isSectionValid, update, touch, pick, touchSection, getError, sectionHasVisibleErrors, submit,
    ]
  );

  return <RegistroContext.Provider value={value}>{children}</RegistroContext.Provider>;
}

export function useRegistro() {
  const context = useContext(RegistroContext);
  if (!context) throw new Error('useRegistro must be used inside <RegistroProvider>');
  return context;
}
