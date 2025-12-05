'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutCostSummary from './CheckoutCostSummary';
import OrderConfirmationModal from './OrderConfirmationModal';
import DesktopCartSummary from './DesktopCartSummary';
import OrderReviewSection from './OrderReviewSection';
import { DeliveryOptionsSection } from './DeliveryOptionsSection';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import InsufficientStockModal from '@/components/InsufficientStockModal';
import ErrorModal from '@/components/ErrorModal';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectClient, type UserAddress } from '@/store/clientSlice';
import {
  setCheckoutFormData,
  setSelectedPlace,
  setAddressId,
  setCartToken,
  setSelectedShipment,
  selectSelectedPlace,
  type Place,
} from '@/store/checkoutSlice';
import { createAddress } from '@/utils/addressService';
import { getCart } from '@/utils/cartStorage';
import {
  createBackendCart,
  repriceCart,
  isRepriceError,
  updateCartWithRepriceData,
  removeOutOfStockVariants,
  getAvailableCartItems,
} from '@/utils/checkoutCart';
import type { CartItem } from '@/types/cart';
import { API_URL } from '@/config/env';

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
  const dispatch = useAppDispatch();
  const client = useAppSelector(selectClient);
  const selectedPlace = useAppSelector(selectSelectedPlace);
  const [selectedCountry, setSelectedCountry] = useState('Bolivia');
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showOrderConfirmationModal, setShowOrderConfirmationModal] =
    useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('');
  const [modalType, setModalType] = useState<'countryCode' | 'country'>(
    'countryCode'
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [departments, setDepartments] = useState<Place[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1); // 1: Detalles, 2: Método de envío, 3: Pago
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // Cart validation state
  const [isValidatingCart, setIsValidatingCart] = useState(true);
  const [showInsufficientStockModal, setShowInsufficientStockModal] =
    useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState<CartItem[]>([]);
  const [hasRemainingItems, setHasRemainingItems] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);

  // Address selection state
  const [selectedAddressOption, setSelectedAddressOption] = useState<
    'new' | number
  >('new');
  const [isFormReadOnly, setIsFormReadOnly] = useState(false);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);

  // Step labels - shared between mobile and desktop
  const stepLabels = {
    1: 'Detalles del destinatario',
    2: 'Método de envío',
    3: 'Pago',
  };

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

  // Helper function to normalize place names
  const normalizePlaceName = (place: string): string => {
    return place
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to populate form with address data
  const populateFormWithAddress = useCallback((address: UserAddress) => {
    const placeName = normalizePlaceName(address.place.place);
    setSelectedCountry(address.country);

    if (address.type === 'national') {
      setFormData((prev) => ({
        ...prev,
        country: address.country,
        departamento: placeName,
        cityProvince: address.city,
        detailedAddress: address.address,
        city: '',
        streetNumber: '',
        postalCode: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        country: address.country,
        city: address.city,
        streetNumber: address.address,
        postalCode: address.postal_code || '',
        departamento: '',
        cityProvince: '',
        detailedAddress: '',
      }));
    }
  }, []);

  // Populate form data with client information and addresses
  useEffect(() => {
    if (client) {
      setFormData((prev) => ({
        ...prev,
        email: client.email || '',
        name: client.name || '',
        phone: client.phone || '',
      }));

      // Populate user addresses if they exist
      if (client.address && client.address.length > 0) {
        setUserAddresses(client.address);
        // Select first address by default
        const firstAddress = client.address[0];
        setSelectedAddressOption(firstAddress.id);
        populateFormWithAddress(firstAddress);
        setIsFormReadOnly(true);
        // Store the address ID in Redux immediately
        dispatch(setAddressId(firstAddress.id));
      }
    }
  }, [client, dispatch, populateFormWithAddress]);

  // Fetch departments/places on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const response = await fetch(`${API_URL}places`);
        const data: Place[] = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        setDepartments([]);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Helper function to generate address label (first 2 words of address)
  const getAddressLabel = (address: UserAddress): string => {
    const addressWords = address.address.split(' ').slice(0, 2).join(' ');
    const placeName = normalizePlaceName(address.place.place);
    return `${addressWords} - ${placeName}`;
  };

  // Handle address dropdown selection
  const handleAddressSelection = (value: string) => {
    if (value === 'new') {
      setSelectedAddressOption('new');
      setIsFormReadOnly(false);
      // Clear form fields
      setFormData((prev) => ({
        ...prev,
        country: 'Bolivia',
        departamento: '',
        cityProvince: '',
        detailedAddress: '',
        city: '',
        streetNumber: '',
        postalCode: '',
      }));
      setSelectedCountry('Bolivia');
      // Clear address ID from Redux
      dispatch(setAddressId(0));
    } else {
      const addressId = parseInt(value, 10);
      const selectedAddr = userAddresses.find((addr) => addr.id === addressId);
      if (selectedAddr) {
        setSelectedAddressOption(addressId);
        setIsFormReadOnly(true);
        populateFormWithAddress(selectedAddr);
        // Store address ID in Redux
        dispatch(setAddressId(selectedAddr.id));
      }
    }
  };

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

  // Validate cart on component mount
  useEffect(() => {
    const validateCart = async () => {
      try {
        setIsValidatingCart(true);

        // Get cart from localStorage
        const localCart = getCart();

        // Check if cart is empty
        if (!localCart.items || localCart.items.length === 0) {
          router.push('/');
          return;
        }

        // Transform cart items to API format
        const cartApiRequest = {
          items: localCart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        };

        // Step 1: Create cart in backend
        const cartResponse = await createBackendCart(cartApiRequest.items);

        // Step 2: Get repricing and validate stock
        const repriceResponse = await repriceCart(cartResponse.token);

        // Check if there's insufficient stock
        if (isRepriceError(repriceResponse)) {
          const outOfStockVariantIds = repriceResponse.variants;
          const availableItems = getAvailableCartItems(outOfStockVariantIds);

          // Get the out of stock items for display
          const outOfStockCartItems = localCart.items.filter((item) =>
            outOfStockVariantIds.includes(item.variantId)
          );

          setOutOfStockItems(outOfStockCartItems);
          setHasRemainingItems(availableItems.length > 0);
          setShowInsufficientStockModal(true);
          setIsValidatingCart(false);
        } else {
          // Success: Update local cart with backend-validated prices
          updateCartWithRepriceData(repriceResponse);
          // Store cart token in Redux
          dispatch(setCartToken(cartResponse.token));
          setIsValidatingCart(false);
        }
      } catch (error) {
        console.error('Cart validation error:', error);
        setIsValidatingCart(false);
        setErrorMessage(
          'Unable to validate your cart. Please check your connection and try again.'
        );
        setShowErrorModal(true);
      }
    };

    validateCart();
  }, [router, dispatch]);

  // Handle proceeding without out-of-stock items
  const handleProceedWithoutOutOfStock = async () => {
    try {
      setShowInsufficientStockModal(false);
      setIsValidatingCart(true);

      // Remove out of stock items
      const outOfStockVariantIds = outOfStockItems.map(
        (item) => item.variantId
      );
      removeOutOfStockVariants(outOfStockVariantIds);

      // Get updated cart
      const updatedCart = getCart();

      if (updatedCart.items.length === 0) {
        router.push('/');
        return;
      }

      // Recreate cart with remaining items
      const cartApiRequest = {
        items: updatedCart.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const cartResponse = await createBackendCart(cartApiRequest.items);

      const repriceResponse = await repriceCart(cartResponse.token);

      if (isRepriceError(repriceResponse)) {
        // If still issues, show error
        setIsValidatingCart(false);
        setErrorMessage(
          'Unable to process remaining items. Please try again or contact support.'
        );
        setShowErrorModal(true);
      } else {
        // Success: Update cart and continue
        updateCartWithRepriceData(repriceResponse);
        setIsValidatingCart(false);
      }
    } catch (error) {
      console.error('Error proceeding without out-of-stock items:', error);
      setIsValidatingCart(false);
      setErrorMessage(
        'An error occurred while updating your cart. Please try again.'
      );
      setShowErrorModal(true);
    }
  };

  // Handle going to homepage
  const handleGoToHomepage = () => {
    router.push('/');
  };

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

  const handleContinue = async () => {
    if (validateForm()) {
      try {
        setIsCreatingAddress(true);

        // Store form data in Redux
        dispatch(setCheckoutFormData(formData));

        // Find and store the selected place with its shipments
        let selectedPlaceData: Place | undefined;
        if (selectedCountry === 'Bolivia' && formData.departamento) {
          selectedPlaceData = departments.find(
            (dept) => normalizePlaceName(dept.place) === formData.departamento
          );
          if (selectedPlaceData) {
            dispatch(setSelectedPlace(selectedPlaceData));
          }
        }

        // Check if user selected an existing address
        if (
          selectedAddressOption !== 'new' &&
          typeof selectedAddressOption === 'number'
        ) {
          // Using existing address - address ID already stored in Redux
          // No need to call address API
          setCurrentStep(2);
          setShowDeliveryModal(true);
        } else {
          // Creating new address - call API
          // Prepare address data for API
          const isBoliva = selectedCountry === 'Bolivia';
          const addressData: {
            address: string;
            city: string;
            country: string;
            type: 'national' | 'international';
            postal_code?: string;
            place?: number;
          } = {
            address: isBoliva
              ? formData.detailedAddress
              : `${formData.streetNumber}`,
            city: isBoliva ? formData.cityProvince : formData.city,
            country: selectedCountry,
            type: isBoliva ? 'national' : 'international',
          };

          // Add postal_code for international addresses
          if (!isBoliva && formData.postalCode) {
            addressData.postal_code = formData.postalCode;
          }

          // Add place for Bolivia addresses
          if (isBoliva && selectedPlaceData) {
            addressData.place = selectedPlaceData.id;
          }

          // Call address API
          const addressResponse = await createAddress(addressData);

          // Store address ID in Redux
          dispatch(setAddressId(addressResponse.id));

          // Form is valid, show delivery modal and update step
          setCurrentStep(2);
          setShowDeliveryModal(true);
        }
      } catch (error) {
        console.error('Error creating address:', error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save your address. Please try again.'
        );
        setShowErrorModal(true);
      } finally {
        setIsCreatingAddress(false);
      }
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleDeliveryOptionSelect = (
    shipmentId: number,
    shipmentName: string
  ) => {
    // Find the full shipment object
    const shipment = selectedPlace?.shipments.find((s) => s.id === shipmentId);
    if (shipment) {
      dispatch(setSelectedShipment(shipment));
    }
    setSelectedDeliveryMethod(shipmentName);
    setShowDeliveryModal(false);
    setCurrentStep(3); // Move to payment step
    setShowOrderConfirmationModal(true);
  };

  const handleBackToDelivery = () => {
    setShowOrderConfirmationModal(false);
    setCurrentStep(2); // Back to delivery step
    setShowDeliveryModal(true);
  };

  return (
    <>
      {/* Loading Screen */}
      {isValidatingCart && <LoadingScreen />}

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        errorMessage={errorMessage}
        onGoHome={handleGoToHomepage}
      />

      {/* Insufficient Stock Modal */}
      <InsufficientStockModal
        isOpen={showInsufficientStockModal}
        outOfStockItems={outOfStockItems}
        hasRemainingItems={hasRemainingItems}
        onProceed={handleProceedWithoutOutOfStock}
        onGoHome={handleGoToHomepage}
      />

      {/* Authentication Guard */}
      {!client ? (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Inicia sesión para continuar
            </h2>
            <p className="text-gray-600 mb-8">
              Necesitas iniciar sesión para completar tu compra
            </p>
            <GoogleLoginButton />
          </div>
        </div>
      ) : (
        <>
          {/* Store Navbar for Desktop */}
          <div className="hidden lg:block bg-white">
            <nav
              className="w-full flex items-center justify-between"
              style={{
                padding: '0.6rem 1rem',
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl md:text-3xl font-extrabold tracking-widest select-none text-black">
                  MONERO
                </span>
              </div>
            </nav>
            {/* Full width black line */}
            <div
              className="w-full"
              style={{ backgroundColor: 'black', padding: '0.5px' }}
            ></div>
          </div>

          {/* Desktop Layout */}
          <div
            className="hidden lg:flex min-h-screen bg-white"
            style={{ minHeight: 'calc(100vh - 60px)' }}
          >
            {/* Left Content Area - 80% */}
            <div className="flex-1" style={{ width: '80%' }}>
              {/* Centered Content */}
              <div className="flex justify-center" style={{ padding: '2rem' }}>
                <div style={{ maxWidth: '600px', width: '100%' }}>
                  {/* Desktop Step Indicator */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div className="flex items-center" style={{ gap: '1rem' }}>
                      {/* Step 1: Detalles del destinatario */}
                      <div className="flex items-center">
                        <span
                          style={{
                            color: currentStep >= 1 ? '#000' : '#9ca3af',
                            fontSize: '0.875rem',
                            fontWeight: currentStep === 1 ? '600' : '400',
                          }}
                        >
                          {stepLabels[1]}
                        </span>
                      </div>

                      {/* Arrow */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ color: '#9ca3af' }}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>

                      {/* Step 2: Método de envío */}
                      <div className="flex items-center">
                        <span
                          style={{
                            color: currentStep >= 2 ? '#000' : '#9ca3af',
                            fontSize: '0.875rem',
                            fontWeight: currentStep === 2 ? '600' : '400',
                          }}
                        >
                          {stepLabels[2]}
                        </span>
                      </div>

                      {/* Arrow */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ color: '#9ca3af' }}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>

                      {/* Step 3: Pago */}
                      <div className="flex items-center">
                        <span
                          style={{
                            color: currentStep >= 3 ? '#000' : '#9ca3af',
                            fontSize: '0.875rem',
                            fontWeight: currentStep === 3 ? '600' : '400',
                          }}
                        >
                          {stepLabels[3]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Content Based on Current Step */}
                  {currentStep === 1 && (
                    <>
                      {/* Recipient Details Section */}
                      <div style={{ marginBottom: '2rem' }}>
                        <h2
                          className="font-semibold"
                          style={{
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem',
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          Llena los datos del destinatario
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
                              border: errors.name
                                ? '1px solid #ef4444'
                                : '1px solid #d1d5db',
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
                            readOnly
                            className="w-full border rounded-lg bg-gray-50 cursor-not-allowed"
                            style={{
                              padding: '0.75rem',
                              border: '1px solid #d1d5db',
                              fontSize: '1rem',
                              color: '#6b7280',
                            }}
                            placeholder="ejemplo@correo.com"
                          />
                          <p
                            style={{
                              color: '#6b7280',
                              fontSize: '0.75rem',
                              marginTop: '0.25rem',
                            }}
                          >
                            Este correo está vinculado a tu cuenta
                          </p>
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
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {/* Country Code Selector */}
                            <button
                              onClick={() => {
                                setModalType('countryCode');
                                setShowCountryCodeModal(true);
                              }}
                              className="border rounded-lg flex items-center justify-center"
                              style={{
                                padding: '0.75rem',
                                minWidth: '80px',
                                border: '1px solid #d1d5db',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                              }}
                            >
                              {formData.countryCode}
                            </button>

                            {/* Phone Number Input */}
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

                      {/* Shipping Address Section */}
                      <div style={{ marginBottom: '2rem' }}>
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

                        {/* Address Selection Dropdown (if user has addresses) */}
                        {userAddresses.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <label
                              className="block font-medium"
                              style={{
                                fontSize: '0.9rem',
                                marginBottom: '0.5rem',
                                color: '#374151',
                              }}
                            >
                              Seleccionar dirección
                            </label>
                            <select
                              value={selectedAddressOption}
                              onChange={(e) =>
                                handleAddressSelection(e.target.value)
                              }
                              className="w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              style={{
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                fontSize: '1rem',
                              }}
                            >
                              <option value="new">Nueva dirección</option>
                              {userAddresses.map((address) => (
                                <option key={address.id} value={address.id}>
                                  {getAddressLabel(address)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

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
                            onClick={() => {
                              if (!isFormReadOnly) {
                                setModalType('country');
                                setShowCountryCodeModal(true);
                              }
                            }}
                            className="w-full border rounded-lg flex items-center justify-between"
                            style={{
                              padding: '0.75rem',
                              border: '1px solid #d1d5db',
                              fontSize: '1rem',
                              backgroundColor: isFormReadOnly
                                ? '#f3f4f6'
                                : 'white',
                              cursor: isFormReadOnly
                                ? 'not-allowed'
                                : 'pointer',
                              textAlign: 'left',
                              opacity: isFormReadOnly ? 0.6 : 1,
                            }}
                            disabled={isFormReadOnly}
                          >
                            <span>{selectedCountry}</span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{ color: '#6b7280' }}
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                        </div>

                        {/* Conditional Fields Based on Selected Country */}
                        {selectedCountry === 'Bolivia' ? (
                          <>
                            {/* Department Selection for Bolivia */}
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
                                  errors.departamento
                                    ? 'error-field border-red-500'
                                    : ''
                                }`}
                                style={{
                                  padding: '0.75rem',
                                  border: errors.departamento
                                    ? '1px solid #ef4444'
                                    : '1px solid #d1d5db',
                                  fontSize: '1rem',
                                  backgroundColor: isFormReadOnly
                                    ? '#f3f4f6'
                                    : 'white',
                                  opacity: isFormReadOnly ? 0.6 : 1,
                                }}
                                disabled={
                                  isLoadingDepartments || isFormReadOnly
                                }
                              >
                                <option value="">
                                  {isLoadingDepartments
                                    ? 'Cargando...'
                                    : 'Selecciona un departamento'}
                                </option>
                                {departments.map((dept) => (
                                  <option
                                    key={dept.id}
                                    value={normalizePlaceName(dept.place)}
                                  >
                                    {normalizePlaceName(dept.place)}
                                  </option>
                                ))}
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
                                  errors.cityProvince
                                    ? 'error-field border-red-500'
                                    : ''
                                }`}
                                style={{
                                  padding: '0.75rem',
                                  border: errors.cityProvince
                                    ? '1px solid #ef4444'
                                    : '1px solid #d1d5db',
                                  fontSize: '1rem',
                                  backgroundColor: isFormReadOnly
                                    ? '#f3f4f6'
                                    : 'white',
                                  opacity: isFormReadOnly ? 0.6 : 1,
                                }}
                                placeholder="Ej. Santa Cruz, La Paz, Cochabamba"
                                readOnly={isFormReadOnly}
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
                                  errors.detailedAddress
                                    ? 'error-field border-red-500'
                                    : ''
                                }`}
                                style={{
                                  padding: '0.75rem',
                                  border: errors.detailedAddress
                                    ? '1px solid #ef4444'
                                    : '1px solid #d1d5db',
                                  fontSize: '1rem',
                                  backgroundColor: isFormReadOnly
                                    ? '#f3f4f6'
                                    : 'white',
                                  opacity: isFormReadOnly ? 0.6 : 1,
                                }}
                                placeholder="Calle, número, barrio, referencias adicionales..."
                                readOnly={isFormReadOnly}
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
                                  errors.city
                                    ? 'error-field border-red-500'
                                    : ''
                                }`}
                                style={{
                                  padding: '0.75rem',
                                  border: errors.city
                                    ? '1px solid #ef4444'
                                    : '1px solid #d1d5db',
                                  fontSize: '1rem',
                                  backgroundColor: isFormReadOnly
                                    ? '#f3f4f6'
                                    : 'white',
                                  opacity: isFormReadOnly ? 0.6 : 1,
                                }}
                                placeholder="Ingresa tu ciudad"
                                readOnly={isFormReadOnly}
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

                            {/* Street Number and Postal Code */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1rem',
                              }}
                            >
                              <div>
                                <label
                                  className="block font-medium"
                                  style={{
                                    fontSize: '0.9rem',
                                    marginBottom: '0.5rem',
                                    color: '#374151',
                                  }}
                                >
                                  Número de calle
                                </label>
                                <input
                                  type="text"
                                  name="streetNumber"
                                  value={formData.streetNumber}
                                  onChange={handleInputChange}
                                  className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.streetNumber
                                      ? 'error-field border-red-500'
                                      : ''
                                  }`}
                                  style={{
                                    padding: '0.75rem',
                                    border: errors.streetNumber
                                      ? '1px solid #ef4444'
                                      : '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: isFormReadOnly
                                      ? '#f3f4f6'
                                      : 'white',
                                    opacity: isFormReadOnly ? 0.6 : 1,
                                  }}
                                  placeholder="123"
                                  readOnly={isFormReadOnly}
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

                              <div>
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
                                    errors.postalCode
                                      ? 'error-field border-red-500'
                                      : ''
                                  }`}
                                  style={{
                                    padding: '0.75rem',
                                    border: errors.postalCode
                                      ? '1px solid #ef4444'
                                      : '1px solid #d1d5db',
                                    fontSize: '1rem',
                                    backgroundColor: isFormReadOnly
                                      ? '#f3f4f6'
                                      : 'white',
                                    opacity: isFormReadOnly ? 0.6 : 1,
                                  }}
                                  placeholder="12345"
                                  readOnly={isFormReadOnly}
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
                            </div>
                          </>
                        )}

                        {/* Continue Button */}
                        <button
                          onClick={handleContinue}
                          disabled={isCreatingAddress}
                          className="w-full font-bold flex items-center justify-center"
                          style={{
                            backgroundColor: isCreatingAddress
                              ? '#6b7280'
                              : '#000',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '0.375rem',
                            fontSize: '1rem',
                            cursor: isCreatingAddress
                              ? 'not-allowed'
                              : 'pointer',
                            border: 'none',
                            marginTop: '2rem',
                            opacity: isCreatingAddress ? 0.7 : 1,
                          }}
                        >
                          {isCreatingAddress ? (
                            <>
                              <svg
                                className="animate-spin"
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  marginRight: '0.5rem',
                                }}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Guardando...
                            </>
                          ) : (
                            'Continuar'
                          )}
                        </button>
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      {/* Delivery Method Section */}
                      <div style={{ marginBottom: '2rem' }}>
                        <h2
                          className="font-semibold"
                          style={{
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem',
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          {stepLabels[2]}
                        </h2>

                        {/* Delivery Options */}
                        <DeliveryOptionsSection
                          selectedCountry={selectedCountry}
                          onDeliveryOptionSelect={handleDeliveryOptionSelect}
                          isMobile={false}
                          shipments={selectedPlace?.shipments || []}
                        />

                        {/* Back Button */}
                        <div
                          className="flex justify-center"
                          style={{ marginTop: '1.5rem' }}
                        >
                          <button
                            onClick={() => setCurrentStep(1)}
                            className="text-gray-600 hover:text-black transition-colors"
                            style={{
                              fontSize: '0.875rem',
                              textDecoration: 'underline',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            ← Volver a detalles del destinatario
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      {/* Payment Section */}
                      <div style={{ marginBottom: '2rem' }}>
                        <h2
                          className="font-semibold"
                          style={{
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem',
                            color: '#374151',
                            fontWeight: 'bold',
                          }}
                        >
                          Por favor revisa tu orden
                        </h2>

                        <OrderReviewSection
                          selectedDeliveryMethod={selectedDeliveryMethod}
                          selectedCountry={selectedCountry}
                          formData={formData}
                          onConfirmOrder={() =>
                            setShowOrderConfirmationModal(true)
                          }
                          onBackToDelivery={handleBackToDelivery}
                          showBackButton={true}
                          showConfirmButton={true}
                          showSectionTitles={true}
                          showPaymentMethod={true}
                          showTerms={true}
                          hasAcceptedTerms={hasAcceptedTerms}
                          onTermsChange={setHasAcceptedTerms}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Cart Summary - 20% */}
            <div style={{ width: '20%' }}>
              <DesktopCartSummary
                selectedCountry={selectedCountry}
                selectedDeliveryMethod={selectedDeliveryMethod}
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Mobile Top Bar */}
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
                  {stepLabels[1]}
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
                      border: errors.name
                        ? '1px solid #ef4444'
                        : '1px solid #d1d5db',
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
                    readOnly
                    className="w-full border rounded-lg bg-gray-50 cursor-not-allowed"
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      fontSize: '1rem',
                      color: '#6b7280',
                    }}
                    placeholder="ejemplo@correo.com"
                  />
                  <p
                    style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    Este correo está vinculado a tu cuenta
                  </p>
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

                {/* Address Selection Dropdown (if user has addresses) */}
                {userAddresses.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      className="block font-medium"
                      style={{
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem',
                        color: '#374151',
                      }}
                    >
                      Seleccionar dirección
                    </label>
                    <select
                      value={selectedAddressOption}
                      onChange={(e) => handleAddressSelection(e.target.value)}
                      className="w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="new">Nueva dirección</option>
                      {userAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {getAddressLabel(address)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                      if (!isFormReadOnly) {
                        setModalType('country');
                        setShowCountryCodeModal(true);
                      }
                    }}
                    className="w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between hover:bg-gray-50"
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      fontSize: '1rem',
                      backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                      cursor: isFormReadOnly ? 'not-allowed' : 'pointer',
                      opacity: isFormReadOnly ? 0.6 : 1,
                    }}
                    disabled={isFormReadOnly}
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
                        backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                        opacity: isFormReadOnly ? 0.6 : 1,
                      }}
                      disabled={isLoadingDepartments || isFormReadOnly}
                    >
                      <option value="">
                        {isLoadingDepartments
                          ? 'Cargando...'
                          : 'Selecciona un departamento'}
                      </option>
                      {departments.map((dept) => (
                        <option
                          key={dept.id}
                          value={normalizePlaceName(dept.place)}
                        >
                          {normalizePlaceName(dept.place)}
                        </option>
                      ))}
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
                          errors.cityProvince
                            ? 'error-field border-red-500'
                            : ''
                        }`}
                        style={{
                          padding: '0.75rem',
                          border: errors.cityProvince
                            ? '1px solid #ef4444'
                            : '1px solid #d1d5db',
                          fontSize: '1rem',
                          backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                          opacity: isFormReadOnly ? 0.6 : 1,
                        }}
                        placeholder="Ej. Santa Cruz, La Paz, Cochabamba"
                        readOnly={isFormReadOnly}
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
                          errors.detailedAddress
                            ? 'error-field border-red-500'
                            : ''
                        }`}
                        style={{
                          padding: '0.75rem',
                          border: errors.detailedAddress
                            ? '1px solid #ef4444'
                            : '1px solid #d1d5db',
                          fontSize: '1rem',
                          backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                          opacity: isFormReadOnly ? 0.6 : 1,
                        }}
                        placeholder="Calle, número, barrio, referencias adicionales..."
                        readOnly={isFormReadOnly}
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
                          backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                          opacity: isFormReadOnly ? 0.6 : 1,
                        }}
                        placeholder="Nombre de la ciudad"
                        readOnly={isFormReadOnly}
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
                          errors.streetNumber
                            ? 'error-field border-red-500'
                            : ''
                        }`}
                        style={{
                          padding: '0.75rem',
                          border: errors.streetNumber
                            ? '1px solid #ef4444'
                            : '1px solid #d1d5db',
                          fontSize: '1rem',
                          backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                          opacity: isFormReadOnly ? 0.6 : 1,
                        }}
                        placeholder="Calle Principal 123"
                        readOnly={isFormReadOnly}
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
                          backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                          opacity: isFormReadOnly ? 0.6 : 1,
                        }}
                        placeholder="Código postal"
                        readOnly={isFormReadOnly}
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
                disabled={isCreatingAddress}
                className="w-full font-bold flex items-center justify-center"
                style={{
                  backgroundColor: isCreatingAddress ? '#6b7280' : '#000',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  cursor: isCreatingAddress ? 'not-allowed' : 'pointer',
                  border: 'none',
                  opacity: isCreatingAddress ? 0.7 : 1,
                }}
              >
                {isCreatingAddress ? (
                  <>
                    <svg
                      className="animate-spin"
                      style={{
                        width: '20px',
                        height: '20px',
                        marginRight: '0.5rem',
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Continuar'
                )}
              </button>
            </div>
          </div>

          {/* Modals - Shared between Mobile and Desktop */}

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
              <div
                className="flex-1 overflow-y-auto"
                style={{ padding: '2rem' }}
              >
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
                <DeliveryOptionsSection
                  selectedCountry={selectedCountry}
                  onDeliveryOptionSelect={handleDeliveryOptionSelect}
                  isMobile={true}
                  shipments={selectedPlace?.shipments || []}
                />
              </div>

              {/* Checkout Cost Summary */}
              <CheckoutCostSummary
                subtotal={59.98}
                selectedCountry={selectedCountry}
                deliveryCost={0}
              />
            </div>
          )}

          {/* Order Confirmation Modal */}
          <OrderConfirmationModal
            isOpen={showOrderConfirmationModal}
            onClose={() => setShowOrderConfirmationModal(false)}
            onBackToDelivery={handleBackToDelivery}
            selectedCountry={selectedCountry}
            selectedDeliveryMethod={selectedDeliveryMethod}
            formData={formData}
          />
        </>
      )}
    </>
  );
};

export default CheckoutPage;
