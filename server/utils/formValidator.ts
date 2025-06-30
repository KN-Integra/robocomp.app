export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{9}$|^\+?[0-9]{10,15}$/
  return phoneRegex.test(phone)
}

export function isValidPostalCode(postalCode: string): boolean {
  // TODO: SPRAWDZIĆ CZY CZASAMI NIE TRZEBA TO USUNĄĆ BO RÓŻNE KRAJE RÓŻNY KOD POCZTOWY?
  const postalCodeRegex = /^[0-9]{2}-[0-9]{3}$/
  return postalCodeRegex.test(postalCode)
}
