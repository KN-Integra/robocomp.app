export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{9}$|^\+?[0-9]{10,15}$/
  return phoneRegex.test(phone)
}

export function isValidPostalCode(postalCode: string, countryCode: string = 'PL'): boolean {
  // TODO: SPRAWDZIĆ CZY CZASAMI NIE TRZEBA TO USUNĄĆ BO RÓŻNE KRAJE RÓŻNY KOD POCZTOWY?
  const postalCodeRegexes: { [key: string]: RegExp } = {  
    'PL': /^[0-9]{2}-[0-9]{3}$/, // Poland: XX-XXX  
    'US': /^\d{5}(-\d{4})?$/,    // USA: 12345 or 12345-6789  
    'CA': /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, // Canada: A1A 1A1  
    'GB': /^([A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/, // UK: SW1A 1AA  
    // Add more country regexes as needed  
  }

  const regex = postalCodeRegexes[countryCode] || postalCodeRegexes['PL']  

  return regex.test(postalCode)
}
