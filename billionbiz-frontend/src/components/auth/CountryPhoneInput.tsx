import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';

export interface Country {
  code: string;
  iso: string;
  flag: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: '+91', iso: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+1', iso: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', iso: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+971', iso: 'AE', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+65', iso: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+61', iso: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', iso: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', iso: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+966', iso: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+81', iso: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+60', iso: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+1', iso: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+31', iso: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+34', iso: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+39', iso: 'IT', flag: '🇮🇹', name: 'Italy' },
];

interface CountryPhoneInputProps {
  value: string;
  onChange: (value: string, isEmail: boolean, formattedValue: string, country?: Country) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  onCountryChange?: (country: Country) => void;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter your mobile number or email',
  autoFocus = false,
  disabled = false,
  className = '',
  id,
  onCountryChange
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default India (+91)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Phone detection: ONLY when value has numeric digits and no alphabet / @ characters
  const trimmed = value.trim();
  const hasDigits = /[0-9]/.test(trimmed);
  const hasLettersOrAt = /[a-zA-Z@]/.test(trimmed);
  const isPhone = !hasLettersOrAt && hasDigits;

  // Auto-detect country code if typed with +
  useEffect(() => {
    if (isPhone && trimmed.startsWith('+')) {
      for (const country of COUNTRIES) {
        if (trimmed.startsWith(country.code)) {
          setSelectedCountry(country);
          onCountryChange?.(country);
          break;
        }
      }
    }
  }, [trimmed, isPhone, onCountryChange]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const curTrimmed = raw.trim();
    const curHasDigits = /[0-9]/.test(curTrimmed);
    const curHasLettersOrAt = /[a-zA-Z@]/.test(curTrimmed);
    const curIsPhone = !curHasLettersOrAt && curHasDigits;
    const curIsEmail = !curIsPhone;

    let formatted = curTrimmed;
    if (curIsPhone && curTrimmed.length > 0) {
      const cleanDigits = curTrimmed.replace(/[^0-9+]/g, '');
      if (cleanDigits.startsWith('+')) {
        formatted = cleanDigits;
      } else {
        formatted = `${selectedCountry.code}${cleanDigits}`;
      }
    }

    onChange(raw, curIsEmail, formatted, selectedCountry);
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    onCountryChange?.(country);

    if (isPhone && trimmed.length > 0) {
      const cleanDigits = trimmed.replace(/[^0-9]/g, '');
      let phoneBody = cleanDigits;
      for (const c of COUNTRIES) {
        const codeDigits = c.code.replace('+', '');
        if (cleanDigits.startsWith(codeDigits)) {
          phoneBody = cleanDigits.slice(codeDigits.length);
          break;
        }
      }
      const formatted = `${country.code}${phoneBody}`;
      onChange(phoneBody, false, formatted, country);
    } else {
      onChange(value, !isPhone, value, country);
    }

    inputRef.current?.focus();
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery) ||
    c.iso.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', width: '100%' }} className={className}>
      <div className="auth-input-wrapper">
        {/* Country code prefix & selector: ONLY rendered when typing mobile numbers */}
        {isPhone && (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="country-select-btn"
              title="Select country code"
              aria-label="Select country code"
            >
              <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{selectedCountry.flag}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedCountry.code}</span>
              <ChevronDown style={{ width: 14, height: 14, color: '#94a3b8' }} />
            </button>

            {/* Dropdown Menu: Positioned strictly ABOVE the input box */}
            {isDropdownOpen && (
              <div className="country-dropdown-menu">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Globe style={{ width: 14, height: 14, color: '#2563eb' }} />
                  <span>Select Country</span>
                </div>
                <div className="country-search-box">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country or code..."
                    className="country-search-input"
                    autoFocus
                  />
                </div>
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {filteredCountries.map((c) => (
                    <button
                      key={`${c.iso}-${c.code}`}
                      type="button"
                      onClick={() => selectCountry(c)}
                      className="country-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.05rem' }}>{c.flag}</span>
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>{c.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.75rem' }}>
                        <span>{c.code}</span>
                        {selectedCountry.iso === c.iso && (
                          <Check style={{ width: 14, height: 14, color: '#2563eb' }} />
                        )}
                      </div>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                      No matching countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clean Input Field */}
        <input
          ref={inputRef}
          id={id}
          type={isPhone ? 'tel' : 'text'}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className="auth-input"
          style={!isPhone ? { paddingLeft: '1rem' } : undefined}
          autoComplete="username"
        />
      </div>
    </div>
  );
};
