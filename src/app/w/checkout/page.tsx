'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutCostSummary from './CheckoutCostSummary';

// Types for country data
interface Country {
  name: string;
  code: string;
  dialCode: string;
}

interface APICountry {
  name: {
    common: string;
  };
  cca2: string;
  idd?: {
    root?: string;
    suffixes?: string[];
  };
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  departamento?: string;
  cityProvince?: string;
  detailedAddress?: string;
  city?: string;
  streetNumber?: string;
  postalCode?: string;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState('Bolivia');
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [modalType, setModalType] = useState<'countryCode' | 'country'>(
    'countryCode'
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+591',
    country: 'Bolivia',
    departamento: '',
    cityProvince: '',
    detailedAddress: '',
    city: '',
    streetNumber: '',
    postalCode: '',
  });

  // Fetch countries on component mount
  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        // Using REST Countries API for country data
        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,cca2,idd'
        );
        const data: APICountry[] = await response.json();

        const countryList = data
          .filter((country: APICountry) => country.idd?.root)
          .map((country: APICountry) => ({
            name: country.name.common,
            code: country.cca2,
            dialCode: country.idd!.root! + (country.idd!.suffixes?.[0] || ''),
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(countryList);
        setFilteredCountries(countryList);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        // Fallback data
        const fallbackCountries = [
          { name: 'Bolivia', code: 'BO', dialCode: '+591' },
          { name: 'Argentina', code: 'AR', dialCode: '+54' },
          { name: 'Brasil', code: 'BR', dialCode: '+55' },
          { name: 'Chile', code: 'CL', dialCode: '+56' },
          { name: 'Perú', code: 'PE', dialCode: '+51' },
        ];
        setCountries(fallbackCountries);
        setFilteredCountries(fallbackCountries);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSearchCountries = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.dialCode.includes(query)
    );
    setFilteredCountries(filtered);
  };

  const handleCountryCodeSelect = (country: Country) => {
    if (modalType === 'countryCode') {
      setFormData((prev) => ({
        ...prev,
        countryCode: country.dialCode,
      }));
    } else {
      // Country selection
      setSelectedCountry(country.name);
      setFormData((prev) => ({
        ...prev,
        country: country.name,
      }));
    }
    setShowCountryCodeModal(false);
    setSearchQuery('');
    setFilteredCountries(countries);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Por favor ingresa un correo electrónico válido';
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de teléfono es obligatorio';
    } else {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Por favor ingresa un número de teléfono válido';
      } else if (formData.phone.replace(/[^0-9]/g, '').length < 7) {
        newErrors.phone = 'El número de teléfono debe tener al menos 7 dígitos';
      }
    }

    // Address validation based on country
    if (selectedCountry === 'Bolivia') {
      if (!formData.departamento.trim()) {
        newErrors.departamento = 'El departamento es obligatorio';
      }
      if (!formData.cityProvince.trim()) {
        newErrors.cityProvince = 'La ciudad/provincia es obligatoria';
      }
      if (!formData.detailedAddress.trim()) {
        newErrors.detailedAddress = 'La dirección detallada es obligatoria';
      } else if (formData.detailedAddress.trim().length < 10) {
        newErrors.detailedAddress =
          'La dirección debe ser más detallada (mínimo 10 caracteres)';
      }
    } else {
      if (!formData.city.trim()) {
        newErrors.city = 'La ciudad es obligatoria';
      }
      if (!formData.streetNumber.trim()) {
        newErrors.streetNumber = 'La calle y número son obligatorios';
      }
      if (!formData.postalCode.trim()) {
        newErrors.postalCode = 'El código postal es obligatorio';
      } else {
        const postalCodeRegex = /^[A-Za-z0-9\-\s]+$/;
        if (!postalCodeRegex.test(formData.postalCode)) {
          newErrors.postalCode = 'Por favor ingresa un código postal válido';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Form is valid, show delivery modal
      setShowDeliveryModal(true);
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: 'var(--nav-height, 60px)',
      }}
    >
      {/* Top Bar */}
      <div
        className="fixed top-0 left-0 right-0 bg-white flex items-center border-b z-40"
        style={{
          height: 'var(--nav-height, 60px)',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 1rem',
        }}
      >
        {/* Back Arrow */}
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center hover:bg-gray-100 rounded-full"
          style={{
            width: '40px',
            height: '40px',
            marginRight: '1rem',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Title */}
        <h1
          className="font-semibold text-center flex-1"
          style={{ fontSize: '1.1rem' }}
        >
          Información de envío
        </h1>

        {/* Empty space for balance (no X button) */}
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Form Content */}
      <div style={{ padding: '2rem' }}>
        {/* Recipient Details Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2
            className="font-semibold"
            style={{
              fontSize: '1rem',
              marginBottom: '1.5rem',
              color: '#374151',
            }}
          >
            Detalles del destinatario
          </h2>

          {/* Name Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              className="block font-medium"
              style={{
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                color: '#374151',
              }}
            >
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'error-field border-red-500' : ''
              }`}
              style={{
                padding: '0.75rem',
                border: errors.name ? '1px solid #ef4444' : '1px solid #d1d5db',
                fontSize: '1rem',
              }}
              placeholder="Ingresa tu nombre completo"
            />
            {errors.name && (
              <p
                style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                }}
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              className="block font-medium"
              style={{
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                color: '#374151',
              }}
            >
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'error-field border-red-500' : ''
              }`}
              style={{
                padding: '0.75rem',
                border: errors.email
                  ? '1px solid #ef4444'
                  : '1px solid #d1d5db',
                fontSize: '1rem',
              }}
              placeholder="ejemplo@correo.com"
            />
            {errors.email && (
              <p
                style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                }}
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Number Input with Country Code */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              className="block font-medium"
              style={{
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                color: '#374151',
              }}
            >
              Número de teléfono
            </label>
            <div className="flex" style={{ gap: '0.5rem' }}>
              {/* Country Code Button */}
              <button
                type="button"
                onClick={() => {
                  setModalType('countryCode');
                  setShowCountryCodeModal(true);
                }}
                className="border rounded-lg flex items-center justify-center hover:bg-gray-50"
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  minWidth: '80px',
                  fontSize: '1rem',
                }}
              >
                {formData.countryCode}
              </button>

              {/* Phone Input */}
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`flex-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'error-field border-red-500' : ''
                }`}
                style={{
                  padding: '0.75rem',
                  border: errors.phone
                    ? '1px solid #ef4444'
                    : '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
                placeholder="70000000"
              />
            </div>
            {errors.phone && (
              <p
                style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                }}
              >
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Delivery Address Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2
            className="font-semibold"
            style={{
              fontSize: '1rem',
              marginBottom: '1.5rem',
              color: '#374151',
            }}
          >
            Dirección de entrega
          </h2>

          {/* Country Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              className="block font-medium"
              style={{
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                color: '#374151',
              }}
            >
              País
            </label>
            <button
              type="button"
              onClick={() => {
                setModalType('country');
                setShowCountryCodeModal(true);
              }}
              className="w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between hover:bg-gray-50"
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                fontSize: '1rem',
                backgroundColor: 'white',
              }}
            >
              <span>{selectedCountry}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#9ca3af' }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Departamento Selection for Bolivia */}
          {selectedCountry === 'Bolivia' && (
            <div style={{ marginBottom: '1rem' }}>
              <label
                className="block font-medium"
                style={{
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem',
                  color: '#374151',
                }}
              >
                Departamento
              </label>
              <select
                name="departamento"
                value={formData.departamento}
                onChange={handleInputChange}
                className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.departamento ? 'error-field border-red-500' : ''
                }`}
                style={{
                  padding: '0.75rem',
                  border: errors.departamento
                    ? '1px solid #ef4444'
                    : '1px solid #d1d5db',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                }}
              >
                <option value="">Selecciona un departamento</option>
                <option value="La Paz">La Paz</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Tarija">Tarija</option>
                <option value="Beni">Beni</option>
                <option value="Pando">Pando</option>
              </select>
              {errors.departamento && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem',
                  }}
                >
                  {errors.departamento}
                </p>
              )}
            </div>
          )}

          {/* Conditional Fields Based on Country */}
          {selectedCountry === 'Bolivia' ? (
            <>
              {/* City/Province for Bolivia */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  className="block font-medium"
                  style={{
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  Ciudad / Provincia
                </label>
                <input
                  type="text"
                  name="cityProvince"
                  value={formData.cityProvince}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cityProvince ? 'error-field border-red-500' : ''
                  }`}
                  style={{
                    padding: '0.75rem',
                    border: errors.cityProvince
                      ? '1px solid #ef4444'
                      : '1px solid #d1d5db',
                    fontSize: '1rem',
                  }}
                  placeholder="Ej. Santa Cruz, La Paz, Cochabamba"
                />
                {errors.cityProvince && (
                  <p
                    style={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.cityProvince}
                  </p>
                )}
              </div>

              {/* Detailed Address for Bolivia */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  className="block font-medium"
                  style={{
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  Dirección detallada
                </label>
                <textarea
                  name="detailedAddress"
                  value={formData.detailedAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.detailedAddress ? 'error-field border-red-500' : ''
                  }`}
                  style={{
                    padding: '0.75rem',
                    border: errors.detailedAddress
                      ? '1px solid #ef4444'
                      : '1px solid #d1d5db',
                    fontSize: '1rem',
                  }}
                  placeholder="Calle, número, barrio, referencias adicionales..."
                />
                {errors.detailedAddress && (
                  <p
                    style={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.detailedAddress}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* City for Other Countries */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  className="block font-medium"
                  style={{
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.city ? 'error-field border-red-500' : ''
                  }`}
                  style={{
                    padding: '0.75rem',
                    border: errors.city
                      ? '1px solid #ef4444'
                      : '1px solid #d1d5db',
                    fontSize: '1rem',
                  }}
                  placeholder="Nombre de la ciudad"
                />
                {errors.city && (
                  <p
                    style={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Street and Number for Other Countries */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  className="block font-medium"
                  style={{
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  Calle y número
                </label>
                <input
                  type="text"
                  name="streetNumber"
                  value={formData.streetNumber}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.streetNumber ? 'error-field border-red-500' : ''
                  }`}
                  style={{
                    padding: '0.75rem',
                    border: errors.streetNumber
                      ? '1px solid #ef4444'
                      : '1px solid #d1d5db',
                    fontSize: '1rem',
                  }}
                  placeholder="Calle Principal 123"
                />
                {errors.streetNumber && (
                  <p
                    style={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.streetNumber}
                  </p>
                )}
              </div>

              {/* Postal Code for Other Countries */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  className="block font-medium"
                  style={{
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  Código postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.postalCode ? 'error-field border-red-500' : ''
                  }`}
                  style={{
                    padding: '0.75rem',
                    border: errors.postalCode
                      ? '1px solid #ef4444'
                      : '1px solid #d1d5db',
                    fontSize: '1rem',
                  }}
                  placeholder="Código postal"
                />
                {errors.postalCode && (
                  <p
                    style={{
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full font-bold"
          style={{
            backgroundColor: '#000',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Continuar
        </button>
      </div>

      {/* Country Code Modal */}
      {showCountryCodeModal && (
        <div
          className="fixed inset-0 bg-white z-50 flex flex-col"
          style={{
            paddingTop: 'var(--nav-height, 60px)',
          }}
        >
          {/* Modal Top Bar */}
          <div
            className="fixed top-0 left-0 right-0 bg-white flex items-center border-b z-50"
            style={{
              height: 'var(--nav-height, 60px)',
              borderBottom: '1px solid #e5e7eb',
              padding: '0 1rem',
            }}
          >
            {/* Empty space for balance */}
            <div style={{ width: '40px' }}></div>

            {/* Title */}
            <h2
              className="font-semibold text-center flex-1"
              style={{ fontSize: '1.1rem' }}
            >
              {modalType === 'countryCode' ? 'Country code' : 'País'}
            </h2>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowCountryCodeModal(false);
                setSearchQuery('');
                setFilteredCountries(countries);
              }}
              className="flex items-center justify-center hover:bg-gray-100 rounded-full"
              style={{
                width: '40px',
                height: '40px',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto" style={{ padding: '2rem' }}>
            {/* Search Input */}
            <div className="relative" style={{ marginBottom: '1rem' }}>
              <div
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: '#9ca3af' }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchCountries}
                placeholder="Search"
                className="w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{
                  padding: '0.75rem 0.75rem 0.75rem 3rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  backgroundColor: '#f9fafb',
                }}
              />
            </div>

            {/* Countries List */}
            {isLoadingCountries ? (
              <div
                className="flex items-center justify-center"
                style={{ padding: '2rem' }}
              >
                <p style={{ color: '#6b7280' }}>Loading countries...</p>
              </div>
            ) : (
              <div>
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountryCodeSelect(country)}
                    className="w-full text-left hover:bg-gray-50 flex items-center justify-between"
                    style={{
                      padding: '1rem 0',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '1rem', color: '#374151' }}>
                      {country.name}
                    </span>
                    {modalType === 'countryCode' && (
                      <span style={{ fontSize: '1rem', color: '#6b7280' }}>
                        ({country.dialCode})
                      </span>
                    )}
                  </button>
                ))}

                {filteredCountries.length === 0 && searchQuery && (
                  <div
                    className="text-center"
                    style={{ padding: '2rem', color: '#6b7280' }}
                  >
                    No countries found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Method Modal */}
      {showDeliveryModal && (
        <div
          className="fixed inset-0 bg-white z-50 flex flex-col"
          style={{
            paddingTop: 'var(--nav-height, 60px)',
          }}
        >
          {/* Modal Top Bar */}
          <div
            className="fixed top-0 left-0 right-0 bg-white flex items-center border-b z-50"
            style={{
              height: 'var(--nav-height, 60px)',
              borderBottom: '1px solid #e5e7eb',
              padding: '0 1rem',
            }}
          >
            {/* Back Arrow */}
            <button
              onClick={() => setShowDeliveryModal(false)}
              className="flex items-center justify-center hover:bg-gray-100 rounded-full"
              style={{
                width: '40px',
                height: '40px',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Title */}
            <h2
              className="font-semibold flex-1"
              style={{ fontSize: '1.1rem', marginLeft: '1rem' }}
            >
              Método de envío
            </h2>

            {/* Empty space for balance */}
            <div style={{ width: '40px' }}></div>
          </div>

          {/* Modal Content */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ padding: '1.5rem', paddingBottom: '8rem' }}
          >
            {selectedCountry === 'Bolivia' ? (
              /* Bolivia Delivery Options */
              <div>
                {/* Envío a terminal */}
                <div
                  className="border rounded-lg hover:bg-gray-50 cursor-pointer"
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1rem',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div
                        className="font-bold"
                        style={{
                          fontSize: '1rem',
                          color: '#374151',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Envío a terminal
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Recibelo en 24 horas
                      </div>
                      <div
                        className="font-bold"
                        style={{ fontSize: '1rem', color: '#374151' }}
                      >
                        Bs. 30
                      </div>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: '#9ca3af' }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>

                {/* Envío a domicilio */}
                <div
                  className="border rounded-lg hover:bg-gray-50 cursor-pointer"
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1rem',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div
                        className="font-bold"
                        style={{
                          fontSize: '1rem',
                          color: '#374151',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Envío a domicilio
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Recibelo en 48 horas
                      </div>
                      <div
                        className="font-bold"
                        style={{ fontSize: '1rem', color: '#374151' }}
                      >
                        Bs. 50
                      </div>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: '#9ca3af' }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>

                {/* Envío a provincia */}
                <div
                  className="border rounded-lg hover:bg-gray-50 cursor-pointer"
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1rem',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div
                        className="font-bold"
                        style={{
                          fontSize: '1rem',
                          color: '#374151',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Envío a provincia
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Recibelo en 72 horas
                      </div>
                      <div
                        className="font-bold"
                        style={{ fontSize: '1rem', color: '#374151' }}
                      >
                        Bs. 50
                      </div>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: '#9ca3af' }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>

                {/* Envío por avión */}
                <div
                  className="border rounded-lg hover:bg-gray-50 cursor-pointer"
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div
                        className="font-bold"
                        style={{
                          fontSize: '1rem',
                          color: '#374151',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Envío por avión
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Recibelo lo más pronto posible hasta su domicilio
                      </div>
                      <div
                        className="font-bold"
                        style={{ fontSize: '1rem', color: '#374151' }}
                      >
                        Bs. 60
                      </div>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: '#9ca3af' }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              /* Other Countries DHL Option */
              <div>
                <div
                  className="border rounded-lg hover:bg-gray-50 cursor-pointer"
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div
                        className="font-bold"
                        style={{
                          fontSize: '1rem',
                          color: '#374151',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Envío por DHL
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Tiempo determinado por DHL
                      </div>
                      <div
                        className="font-bold"
                        style={{ fontSize: '1rem', color: '#374151' }}
                      >
                        Costo determinado por DHL cuando lo recibas
                      </div>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: '#9ca3af' }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Cost Summary */}
          <CheckoutCostSummary
            subtotal={59.98}
            selectedCountry={selectedCountry}
            deliveryCost={0}
          />
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
