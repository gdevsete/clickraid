// Document type detection and utilities for BR + AR

const CUIT_PREFIXES = [20, 23, 24, 27, 30, 33, 34];

export function detectDocType(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    const prefix = parseInt(digits.slice(0, 2), 10);
    if (CUIT_PREFIXES.includes(prefix)) return 'cuit';
    return 'cpf';
  }
  if (digits.length >= 7 && digits.length <= 8) return 'dni';
  return 'unknown';
}

export function isValidCPF(value) {
  const n = value.replace(/\D/g, '');
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(n[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r >= 10) r = 0;
  if (r !== parseInt(n[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(n[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r >= 10) r = 0;
  return r === parseInt(n[10]);
}

export function isValidCUIT(value) {
  const n = value.replace(/\D/g, '');
  if (n.length !== 11) return false;
  const prefix = parseInt(n.slice(0, 2), 10);
  return CUIT_PREFIXES.includes(prefix);
}

export function isValidDNI(value) {
  const n = value.replace(/\D/g, '');
  return n.length >= 7 && n.length <= 8;
}

export function isValidDoc(value) {
  const type = detectDocType(value);
  if (type === 'cpf') return isValidCPF(value);
  if (type === 'cuit') return isValidCUIT(value);
  if (type === 'dni') return isValidDNI(value);
  // Accept any doc with at least 6 characters
  return value.replace(/\D/g, '').length >= 6;
}

export function maskDoc(value) {
  // Allow digits, dots, dashes, slashes
  const clean = value.replace(/[^\d.\-\/]/g, '');
  const digits = clean.replace(/\D/g, '');

  const type = detectDocType(clean);

  if (type === 'cpf') {
    const d = digits.slice(0, 11);
    if (d.length > 9) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    if (d.length > 6) return d.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    if (d.length > 3) return d.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    return d;
  }

  if (type === 'cuit') {
    const d = digits.slice(0, 11);
    if (d.length > 10) return d.replace(/(\d{2})(\d{8})(\d{1})/, '$1-$2-$3');
    if (d.length > 2) return d.replace(/(\d{2})(\d{0,8})/, '$1-$2');
    return d;
  }

  if (type === 'dni') {
    return digits.slice(0, 8);
  }

  // Unknown — just limit to 15 chars and allow whatever they type
  return clean.slice(0, 15);
}

export function docLabel(value) {
  const type = detectDocType(value);
  if (type === 'cuit') return 'CUIT';
  if (type === 'dni') return 'DNI';
  return 'CPF';
}

// Generates a mathematically valid CPF (for gateway use when customer has foreign doc)
export function generateValidCPF() {
  // Avoid all-same-digit sequences that CPF validation rejects
  let digits;
  do {
    digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));
  } while (new Set(digits).size === 1);

  let sum = digits.reduce((acc, v, i) => acc + v * (10 - i), 0);
  let d1 = (sum * 10) % 11;
  if (d1 >= 10) d1 = 0;

  sum = [...digits, d1].reduce((acc, v, i) => acc + v * (11 - i), 0);
  let d2 = (sum * 10) % 11;
  if (d2 >= 10) d2 = 0;

  return [...digits, d1, d2].join('');
}

// Returns a valid CPF string for the payment gateway.
// If the customer document is already a valid CPF, returns it.
// Otherwise generates a valid one.
export function getGatewayCPF(docValue) {
  if (isValidCPF(docValue)) return docValue.replace(/\D/g, '');
  return generateValidCPF();
}
