/**
 * Unified Input Validation Utilities for BillionBiz Authentication & Onboarding
 */

export interface ContactValidationResult {
  isValid: boolean;
  type: 'email' | 'phone' | 'empty' | 'invalid';
  cleanValue: string;
  errorMessage?: string;
}

/**
 * Validates user identifier (email or mobile number) strictly:
 * - Phone numbers must have EXACTLY 10 subscriber digits (e.g. Indian standard or international 10-digit).
 * - Email addresses must conform to RFC standard email regex with valid TLD.
 */
export function validateContactInput(
  rawInput: string,
  countryDialCode = '+91'
): ContactValidationResult {
  const trimmed = (rawInput || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      type: 'empty',
      cleanValue: '',
      errorMessage: 'Please enter your mobile number or email.'
    };
  }

  const hasLettersOrAt = /[a-zA-Z@]/.test(trimmed);

  if (hasLettersOrAt) {
    // Email mode validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    
    // Check basic structure and valid TLD (at least 2 letters)
    if (!emailRegex.test(trimmed) || !trimmed.includes('.') || trimmed.endsWith('.')) {
      return {
        isValid: false,
        type: 'email',
        cleanValue: trimmed,
        errorMessage: 'Please enter a valid email address (e.g. name@example.com).'
      };
    }

    const parts = trimmed.split('@');
    if (parts.length !== 2 || !parts[1].includes('.')) {
      return {
        isValid: false,
        type: 'email',
        cleanValue: trimmed,
        errorMessage: 'Please enter a valid email address (e.g. name@example.com).'
      };
    }

    const tld = parts[1].split('.').pop();
    if (!tld || tld.length < 2) {
      return {
        isValid: false,
        type: 'email',
        cleanValue: trimmed,
        errorMessage: 'Please enter a valid email address with a valid domain extension.'
      };
    }

    return {
      isValid: true,
      type: 'email',
      cleanValue: trimmed.toLowerCase()
    };
  } else {
    // Phone mode validation
    const pureDigits = trimmed.replace(/[^0-9]/g, '');
    const cleanCountry = countryDialCode.replace(/[^0-9]/g, '');

    let localSubscriberDigits = pureDigits;

    // If string starts with the country dial code and total digits match country + 10
    if (cleanCountry && localSubscriberDigits.startsWith(cleanCountry) && localSubscriberDigits.length === cleanCountry.length + 10) {
      localSubscriberDigits = localSubscriberDigits.slice(cleanCountry.length);
    } else if (localSubscriberDigits.startsWith('0') && localSubscriberDigits.length === 11) {
      // Strip leading 0 trunk prefix
      localSubscriberDigits = localSubscriberDigits.slice(1);
    } else if (localSubscriberDigits.length > 10 && cleanCountry && localSubscriberDigits.startsWith(cleanCountry)) {
      localSubscriberDigits = localSubscriberDigits.slice(cleanCountry.length);
    }

    // Strict validation: Subscriber number MUST be exactly 10 digits
    if (localSubscriberDigits.length !== 10) {
      return {
        isValid: false,
        type: 'phone',
        cleanValue: trimmed,
        errorMessage: `Please enter a valid 10-digit mobile number (${localSubscriberDigits.length} entered).`
      };
    }

    // Format as standard E.164 (+CountryCodeDigits)
    const formattedDialCode = countryDialCode.startsWith('+') ? countryDialCode : `+${countryDialCode}`;
    const e164Phone = `${formattedDialCode}${localSubscriberDigits}`;

    return {
      isValid: true,
      type: 'phone',
      cleanValue: e164Phone
    };
  }
}

/**
 * Validates verification code (must be exactly 6 numeric digits)
 */
export function validateOtpCode(code: string): { isValid: boolean; errorMessage?: string } {
  const cleanCode = (code || '').replace(/[^0-9]/g, '');
  if (!cleanCode) {
    return { isValid: false, errorMessage: 'Please enter the 6-digit verification code.' };
  }
  if (cleanCode.length !== 6) {
    return { isValid: false, errorMessage: `Verification code must be 6 digits (${cleanCode.length}/6 entered).` };
  }
  return { isValid: true };
}

/**
 * Validates store setup details (merchant name, business name, domain slug, optional password)
 */
export function validateStoreDetails(
  fullName: string,
  storeName: string,
  slug: string,
  password?: string
): { isValid: boolean; errorMessage?: string } {
  const cleanFullName = (fullName || '').trim();
  if (!cleanFullName) {
    return { isValid: false, errorMessage: 'Please enter your merchant / personal name.' };
  }
  if (cleanFullName.length < 2) {
    return { isValid: false, errorMessage: 'Merchant name must be at least 2 characters long.' };
  }

  const cleanStoreName = (storeName || '').trim();
  if (!cleanStoreName) {
    return { isValid: false, errorMessage: 'Please enter your store or business name.' };
  }
  if (cleanStoreName.length < 2) {
    return { isValid: false, errorMessage: 'Store name must be at least 2 characters long.' };
  }

  const cleanSlug = (slug || '').trim().toLowerCase();
  if (!cleanSlug || cleanSlug.length < 3) {
    return { isValid: false, errorMessage: 'Storefront web address (slug) must be at least 3 characters.' };
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(cleanSlug)) {
    return {
      isValid: false,
      errorMessage: 'Storefront web address can only contain lowercase letters, numbers, and hyphens (cannot start or end with a hyphen).'
    };
  }

  // Password is optional: only validate length if provided
  const cleanPassword = (password || '').trim();
  if (cleanPassword.length > 0 && cleanPassword.length < 6) {
    return { isValid: false, errorMessage: 'Password must be at least 6 characters long if provided.' };
  }

  return { isValid: true };
}
