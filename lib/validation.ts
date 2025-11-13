export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateName(name: string): string | null {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
}

export function validateNumber(value: number | string, fieldName: string, min?: number, max?: number): string | null {
  if (value === '' || value === null || value === undefined) return `${fieldName} is required`;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${fieldName} must be a valid number`;
  if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
  if (max !== undefined && num > max) return `${fieldName} must be at most ${max}`;
  return null;
}

export function validateYear(year: number | string): string | null {
  const currentYear = new Date().getFullYear();
  return validateNumber(year, 'Year', 1900, currentYear + 1);
}

export function validatePrice(price: string | number): string | null {
  return validateNumber(price, 'Price', 0);
}

