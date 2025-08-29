export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{9}$|^\+?[0-9]{10,15}$/
  return phoneRegex.test(phone)
}

export function isValidPostalCode(postalCode: string, countryCode: string = 'US'): boolean {
  // TODO: Check if this validation should be removed or revised because different countries have different postal code formats.
  const postalCodeRegexes: { [key: string]: RegExp } = {
    // Default to US if no country code is provided
    // Poland: XX-XXX
    PL: /^[0-9]{2}-[0-9]{3}$/,
    // USA: 12345 or 12345-6789
    US: /^\d{5}(-\d{4})?$/,
    // Canada: A1A 1A1 or A1A1A1
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    // UK: A9 9AA, A99 9AA, AA9 9AA, AA99 9AA, A9A 9AA, A99A 9AA, AA9A 9AA, AA99A 9AA
    GB: /^([A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/
    // Add more countries as needed
  }

  const regex = postalCodeRegexes[countryCode] || postalCodeRegexes.US

  return regex.test(postalCode)
}
