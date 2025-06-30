export function isValidEmail(email: string): boolean {
  return email.length > 0
}

export function isValidPhone(phone: string): boolean {
  return phone.length > 0
}

export function isValidPostalCode(postalCode: string): boolean {
  return postalCode.length > 0
}
