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
import QRPaymentModal from '@/components/QRPaymentModal';
import CardPaymentModal from '@/components/CardPaymentModal';
import PaymentMethodSelectionSection, {
  type PaymentMethodId,
} from './PaymentMethodSelectionSection';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectClient, type UserAddress } from '@/store/clientSlice';
import {
  setCheckoutFormData,
  setSelectedPlace,
  setAddressId,
  setCartToken,
  setSelectedShipment,
  setCheckoutCartItems,
  setRepriceData,
  setFedexRates,
  setSelectedFedexService,
  selectSelectedPlace,
  selectSelectedShipment,
  selectAddressId,
  selectCartToken,
  selectFedexServices,
  selectFedexShippingToken,
  selectRepriceData,
  selectSelectedFedexService,
  type Place,
  type FedexService,
  type RepriceData,
} from '@/store/checkoutSlice';
import {
  createAddress,
  formatAddressLabel,
  normalizePlaceName,
} from '@/utils/addressService';
import { getCart } from '@/utils/cartStorage';
import { clearCart } from '@/utils/cartStorage';
import {
  createBackendCart,
  repriceCart,
  isRepriceError,
  updateCartWithRepriceData,
  removeOutOfStockVariants,
  getAvailableCartItems,
} from '@/utils/checkoutCart';
import {
  createOrder,
  generateQR,
  checkForWomenItems,
} from '@/utils/orderService';
import { getFedexRates, buildFedexRecipient } from '@/utils/shippingRates';
import { FEATURE_FLAGS } from '@/config/features';
import { saveGuestOrderAccess } from '@/utils/guestOrderAccess';
import { type CybersourceBilling } from '@/services/cybersourceService';
import { buildCybersourceBilling } from '@/utils/cybersourcePayment';
import type { CartItem } from '@/types/cart';
import { API_URL } from '@/config/env';
import { GenderStorage } from '@/utils/genderStorage';
import './checkout.css';
import { AuthStorage } from '@/utils/authStorage';
import { completeLoginWithToken } from '@/services/sessionService';

// Types for country data
interface Country {
  name: string;
  code: string;
  dialCode: string;
}

const SUPPORTED_COUNTRIES: Country[] = [
  { name: 'Alemania', code: 'DE', dialCode: '+49' },
  { name: 'Argentina', code: 'AR', dialCode: '+54' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591' },
  { name: 'Brasil', code: 'BR', dialCode: '+55' },
  { name: 'Canadá', code: 'CA', dialCode: '+1' },
  { name: 'Chile', code: 'CL', dialCode: '+56' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506' },
  { name: 'El Salvador', code: 'SV', dialCode: '+503' },
  { name: 'España', code: 'ES', dialCode: '+34' },
  { name: 'Estados Unidos', code: 'US', dialCode: '+1' },
  { name: 'Francia', code: 'FR', dialCode: '+33' },
  { name: 'México', code: 'MX', dialCode: '+52' },
  { name: 'Perú', code: 'PE', dialCode: '+51' },
];

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  departamento?: string;
  cityProvince?: string;
  detailedAddress?: string;
  billingCI?: string;
  billingName?: string;
  city?: string;
  streetNumber?: string;
  stateProvince?: string;
  postalCode?: string;
}

// Region lists for supported countries (display label + ISO-3166-2 code)
const REGION_CODES: Record<string, { code: string; name: string }[]> = {
  AR: [
    { code: 'C', name: 'Ciudad Autónoma de Buenos Aires' },
    { code: 'B', name: 'Buenos Aires' },
    { code: 'K', name: 'Catamarca' },
    { code: 'H', name: 'Chaco' },
    { code: 'U', name: 'Chubut' },
    { code: 'X', name: 'Córdoba' },
    { code: 'W', name: 'Corrientes' },
    { code: 'E', name: 'Entre Ríos' },
    { code: 'P', name: 'Formosa' },
    { code: 'Y', name: 'Jujuy' },
    { code: 'L', name: 'La Pampa' },
    { code: 'F', name: 'La Rioja' },
    { code: 'M', name: 'Mendoza' },
    { code: 'N', name: 'Misiones' },
    { code: 'Q', name: 'Neuquén' },
    { code: 'R', name: 'Río Negro' },
    { code: 'A', name: 'Salta' },
    { code: 'J', name: 'San Juan' },
    { code: 'D', name: 'San Luis' },
    { code: 'Z', name: 'Santa Cruz' },
    { code: 'S', name: 'Santa Fe' },
    { code: 'G', name: 'Santiago del Estero' },
    { code: 'V', name: 'Tierra del Fuego' },
    { code: 'T', name: 'Tucumán' },
  ],
  CL: [
    { code: 'AI', name: 'Aisén del General Carlos Ibáñez del Campo' },
    { code: 'AN', name: 'Antofagasta' },
    { code: 'AR', name: 'Araucanía' },
    { code: 'AP', name: 'Arica y Parinacota' },
    { code: 'AT', name: 'Atacama' },
    { code: 'BI', name: 'Biobío' },
    { code: 'CO', name: 'Coquimbo' },
    { code: 'LI', name: 'Libertador General Bernardo O’Higgins' },
    { code: 'LL', name: 'Los Lagos' },
    { code: 'LR', name: 'Los Ríos' },
    { code: 'MA', name: 'Magallanes y de la Antártica Chilena' },
    { code: 'ML', name: 'Maule' },
    { code: 'RM', name: 'Región Metropolitana de Santiago' },
    { code: 'TA', name: 'Tarapacá' },
    { code: 'VS', name: 'Valparaíso' },
  ],
  BR: [
    { code: 'AC', name: 'Acre' },
    { code: 'AL', name: 'Alagoas' },
    { code: 'AP', name: 'Amapá' },
    { code: 'AM', name: 'Amazonas' },
    { code: 'BA', name: 'Bahia' },
    { code: 'CE', name: 'Ceará' },
    { code: 'DF', name: 'Distrito Federal' },
    { code: 'ES', name: 'Espírito Santo' },
    { code: 'GO', name: 'Goiás' },
    { code: 'MA', name: 'Maranhão' },
    { code: 'MT', name: 'Mato Grosso' },
    { code: 'MS', name: 'Mato Grosso do Sul' },
    { code: 'MG', name: 'Minas Gerais' },
    { code: 'PA', name: 'Pará' },
    { code: 'PB', name: 'Paraíba' },
    { code: 'PR', name: 'Paraná' },
    { code: 'PE', name: 'Pernambuco' },
    { code: 'PI', name: 'Piauí' },
    { code: 'RJ', name: 'Rio de Janeiro' },
    { code: 'RN', name: 'Rio Grande do Norte' },
    { code: 'RS', name: 'Rio Grande do Sul' },
    { code: 'RO', name: 'Rondônia' },
    { code: 'RR', name: 'Roraima' },
    { code: 'SC', name: 'Santa Catarina' },
    { code: 'SP', name: 'São Paulo' },
    { code: 'SE', name: 'Sergipe' },
    { code: 'TO', name: 'Tocantins' },
  ],
  PE: [
    { code: 'AC', name: 'Amazonas' },
    { code: 'AN', name: 'Ancash' },
    { code: 'AP', name: 'Apurímac' },
    { code: 'AR', name: 'Arequipa' },
    { code: 'AM', name: 'Áncash' },
    { code: 'AY', name: 'Ayacucho' },
    { code: 'CJ', name: 'Cajamarca' },
    { code: 'CL', name: 'Callao' },
    { code: 'CU', name: 'Cusco' },
    { code: 'HV', name: 'Huancavelica' },
    { code: 'HU', name: 'Huánuco' },
    { code: 'IC', name: 'Ica' },
    { code: 'JL', name: 'Junín' },
    { code: 'LP', name: 'La Libertad' },
    { code: 'LM', name: 'Lima' },
    { code: 'LR', name: 'Lambayeque' },
    { code: 'MO', name: 'Moquegua' },
    { code: 'PA', name: 'Pasco' },
    { code: 'PI', name: 'Piura' },
    { code: 'PU', name: 'Puno' },
    { code: 'SM', name: 'San Martín' },
    { code: 'TA', name: 'Tacna' },
    { code: 'TU', name: 'Tumbes' },
  ],
  DE: [
    { code: 'BW', name: 'Baden-Württemberg' },
    { code: 'BY', name: 'Baviera' },
    { code: 'BE', name: 'Berlín' },
    { code: 'BB', name: 'Brandeburgo' },
    { code: 'HB', name: 'Bremen' },
    { code: 'HH', name: 'Hamburgo' },
    { code: 'HE', name: 'Hesse' },
    { code: 'MV', name: 'Mecklemburgo-Pomerania Occidental' },
    { code: 'NI', name: 'Baja Sajonia' },
    { code: 'NW', name: 'Renania del Norte-Westfalia' },
    { code: 'RP', name: 'Renania-Palatinado' },
    { code: 'SL', name: 'Sarre' },
    { code: 'SN', name: 'Sajonia' },
    { code: 'ST', name: 'Sajonia-Anhalt' },
    { code: 'SH', name: 'Schleswig-Holstein' },
    { code: 'TH', name: 'Turingia' },
  ],
  ES: [
    { code: 'A', name: 'Alicante' },
    { code: 'AB', name: 'Albacete' },
    { code: 'AL', name: 'Almería' },
    { code: 'VI', name: 'Álava' },
    { code: 'O', name: 'Asturias' },
    { code: 'AV', name: 'Ávila' },
    { code: 'BA', name: 'Badajoz' },
    { code: 'PM', name: 'Islas Baleares' },
    { code: 'B', name: 'Barcelona' },
    { code: 'BI', name: 'Bizkaia' },
    { code: 'BU', name: 'Burgos' },
    { code: 'CC', name: 'Cáceres' },
    { code: 'CA', name: 'Cádiz' },
    { code: 'S', name: 'Cantabria' },
    { code: 'CS', name: 'Castellón' },
    { code: 'CE', name: 'Ceuta' },
    { code: 'CR', name: 'Ciudad Real' },
    { code: 'CO', name: 'Córdoba' },
    { code: 'C', name: 'A Coruña' },
    { code: 'CU', name: 'Cuenca' },
    { code: 'GI', name: 'Girona' },
    { code: 'GR', name: 'Granada' },
    { code: 'GU', name: 'Guadalajara' },
    { code: 'SS', name: 'Gipuzkoa' },
    { code: 'H', name: 'Huelva' },
    { code: 'HU', name: 'Huesca' },
    { code: 'J', name: 'Jaén' },
    { code: 'LE', name: 'León' },
    { code: 'L', name: 'Lleida' },
    { code: 'LO', name: 'La Rioja' },
    { code: 'GC', name: 'Las Palmas' },
    { code: 'LU', name: 'Lugo' },
    { code: 'M', name: 'Madrid' },
    { code: 'MA', name: 'Málaga' },
    { code: 'ML', name: 'Melilla' },
    { code: 'MU', name: 'Murcia' },
    { code: 'NA', name: 'Navarra' },
    { code: 'OR', name: 'Ourense' },
    { code: 'P', name: 'Palencia' },
    { code: 'PO', name: 'Pontevedra' },
    { code: 'SA', name: 'Salamanca' },
    { code: 'TF', name: 'Santa Cruz de Tenerife' },
    { code: 'SG', name: 'Segovia' },
    { code: 'SE', name: 'Sevilla' },
    { code: 'SO', name: 'Soria' },
    { code: 'T', name: 'Tarragona' },
    { code: 'TE', name: 'Teruel' },
    { code: 'TO', name: 'Toledo' },
    { code: 'V', name: 'Valencia' },
    { code: 'VA', name: 'Valladolid' },
    { code: 'Z', name: 'Zaragoza' },
    { code: 'ZA', name: 'Zamora' },
  ],
  US: [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'DC', name: 'Distrito de Columbia' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawái' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Luisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Míchigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Misisipi' },
    { code: 'MO', name: 'Misuri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'Nuevo Hampshire' },
    { code: 'NJ', name: 'Nueva Jersey' },
    { code: 'NM', name: 'Nuevo México' },
    { code: 'NY', name: 'Nueva York' },
    { code: 'NC', name: 'Carolina del Norte' },
    { code: 'ND', name: 'Dakota del Norte' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregón' },
    { code: 'PA', name: 'Pensilvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'Carolina del Sur' },
    { code: 'SD', name: 'Dakota del Sur' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'Virginia Occidental' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
  ],
  MX: [
    { code: 'AGU', name: 'Aguascalientes' },
    { code: 'BCN', name: 'Baja California' },
    { code: 'BCS', name: 'Baja California Sur' },
    { code: 'CAM', name: 'Campeche' },
    { code: 'CHP', name: 'Chiapas' },
    { code: 'CHH', name: 'Chihuahua' },
    { code: 'CMX', name: 'Ciudad de México' },
    { code: 'COA', name: 'Coahuila' },
    { code: 'COL', name: 'Colima' },
    { code: 'DUR', name: 'Durango' },
    { code: 'GUA', name: 'Guanajuato' },
    { code: 'GRO', name: 'Guerrero' },
    { code: 'HID', name: 'Hidalgo' },
    { code: 'JAL', name: 'Jalisco' },
    { code: 'MEX', name: 'Estado de México' },
    { code: 'MIC', name: 'Michoacán' },
    { code: 'MOR', name: 'Morelos' },
    { code: 'NAY', name: 'Nayarit' },
    { code: 'NLE', name: 'Nuevo León' },
    { code: 'OAX', name: 'Oaxaca' },
    { code: 'PUE', name: 'Puebla' },
    { code: 'QUE', name: 'Querétaro' },
    { code: 'ROO', name: 'Quintana Roo' },
    { code: 'SLP', name: 'San Luis Potosí' },
    { code: 'SIN', name: 'Sinaloa' },
    { code: 'SON', name: 'Sonora' },
    { code: 'TAB', name: 'Tabasco' },
    { code: 'TAM', name: 'Tamaulipas' },
    { code: 'TLA', name: 'Tlaxcala' },
    { code: 'VER', name: 'Veracruz' },
    { code: 'YUC', name: 'Yucatán' },
    { code: 'ZAC', name: 'Zacatecas' },
  ],
  SV: [
    { code: 'AH', name: 'Ahuachapán' },
    { code: 'CA', name: 'Cabañas' },
    { code: 'CH', name: 'Chalatenango' },
    { code: 'CU', name: 'Cuscatlán' },
    { code: 'LI', name: 'La Libertad' },
    { code: 'MO', name: 'Morazán' },
    { code: 'PA', name: 'La Paz' },
    { code: 'SA', name: 'Santa Ana' },
    { code: 'SM', name: 'San Miguel' },
    { code: 'SO', name: 'Sonsonate' },
    { code: 'SS', name: 'San Salvador' },
    { code: 'SV', name: 'San Vicente' },
    { code: 'UN', name: 'La Unión' },
    { code: 'US', name: 'Usulután' },
  ],
  CR: [
    { code: 'A', name: 'Alajuela' },
    { code: 'C', name: 'Cartago' },
    { code: 'G', name: 'Guanacaste' },
    { code: 'H', name: 'Heredia' },
    { code: 'L', name: 'Limón' },
    { code: 'P', name: 'Puntarenas' },
    { code: 'SJ', name: 'San José' },
  ],
  FR: [
    { code: 'ARA', name: 'Auvernia-Ródano-Alpes' },
    { code: 'BFC', name: 'Borgoña-Franco Condado' },
    { code: 'BRE', name: 'Bretaña' },
    { code: 'CVL', name: 'Centro-Valle del Loira' },
    { code: 'COR', name: 'Córcega' },
    { code: 'GES', name: 'Gran Este' },
    { code: 'HDF', name: 'Alta Francia' },
    { code: 'IDF', name: 'Isla de Francia' },
    { code: 'NOR', name: 'Normandía' },
    { code: 'NAQ', name: 'Nueva Aquitania' },
    { code: 'OCC', name: 'Occitania' },
    { code: 'PDL', name: 'Países del Loira' },
    { code: 'PAC', name: 'Provenza-Alpes-Costa Azul' },
    { code: 'GP', name: 'Guadalupe' },
    { code: 'GF', name: 'Guayana Francesa' },
    { code: 'MQ', name: 'Martinica' },
    { code: 'RE', name: 'Reunión' },
    { code: 'YT', name: 'Mayotte' },
  ],
  CA: [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'Columbia Británica' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'Nuevo Brunswick' },
    { code: 'NL', name: 'Terranova y Labrador' },
    { code: 'NT', name: 'Territorios del Noroeste' },
    { code: 'NS', name: 'Nueva Escocia' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Isla del Príncipe Eduardo' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukón' },
  ],
};
const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const client = useAppSelector(selectClient);
  const isGuestUser = client?.email === 'guest@moneroget.com';
  const selectedPlace = useAppSelector(selectSelectedPlace);
  const selectedShipment = useAppSelector(selectSelectedShipment);
  const addressId = useAppSelector(selectAddressId);
  const cartToken = useAppSelector(selectCartToken);
  const fedexServices = useAppSelector(selectFedexServices);
  const fedexShippingToken = useAppSelector(selectFedexShippingToken);
  const reduxRepriceData = useAppSelector(selectRepriceData);
  const selectedFedexService = useAppSelector(selectSelectedFedexService);
  const [selectedCountry, setSelectedCountry] = useState('Bolivia');
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showOrderConfirmationModal, setShowOrderConfirmationModal] =
    useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodId | null>(null);
  const [modalType, setModalType] = useState<'countryCode' | 'country'>(
    'countryCode',
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [departments, setDepartments] = useState<Place[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1); // 1: Detalles, 2: Método de envío, 3: Método de pago, 4: Pago
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  // Manage simulated navigation steps in browser history so back/forward stays inside checkout
  const goToStep = useCallback((step: 1 | 2 | 3 | 4, replace = false) => {
    setCurrentStep(step);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('checkoutStep', String(step));
      const href = url.pathname + url.search + url.hash;
      const state = { checkoutStep: step };
      if (replace) {
        window.history.replaceState(state, '', href);
      } else {
        window.history.pushState(state, '', href);
      }
    } catch (e) {
      // ignore if window or URL not available
    }
  }, []);

  useEffect(() => {
    // Always start on step 1 when the page loads or reloads
    try {
      const url = new URL(window.location.href);
      setCurrentStep(1);
      // Replace initial state so popstate works predictably
      window.history.replaceState(
        { checkoutStep: 1 },
        '',
        url.pathname + '?checkoutStep=1' + url.hash,
      );
    } catch (e) {
      // ignore
    }

    const onPop = (ev: PopStateEvent) => {
      const stateStep = (ev.state && (ev.state as any).checkoutStep) || null;
      if (stateStep && stateStep >= 1 && stateStep <= 4) {
        const step = stateStep as 1 | 2 | 3 | 4;
        setCurrentStep(step);
        // Sync mobile modals with step
        if (window.innerWidth < 1024) {
          if (step === 2) {
            setShowDeliveryModal(true);
            setShowPaymentMethodModal(false);
            setShowOrderConfirmationModal(false);
          } else if (step === 3) {
            setShowDeliveryModal(false);
            setShowPaymentMethodModal(true);
            setShowOrderConfirmationModal(false);
          } else if (step === 4) {
            setShowDeliveryModal(false);
            setShowPaymentMethodModal(false);
            setShowOrderConfirmationModal(true);
          } else {
            setShowDeliveryModal(false);
            setShowPaymentMethodModal(false);
            setShowOrderConfirmationModal(false);
          }
        }
      } else {
        // fallback to URL param
        try {
          const url = new URL(window.location.href);
          const stepParam = url.searchParams.get('checkoutStep');
          const s = stepParam ? Number(stepParam) : 1;
          setCurrentStep(s as 1 | 2 | 3 | 4);
        } catch (err) {
          setCurrentStep(1);
        }
      }
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Cart validation state
  const [isValidatingCart, setIsValidatingCart] = useState(true);
  const [showInsufficientStockModal, setShowInsufficientStockModal] =
    useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState<CartItem[]>([]);
  const [availableItems, setAvailableItems] = useState<CartItem[]>([]);
  const [hasRemainingItems, setHasRemainingItems] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  const [isFetchingShippingRates, setIsFetchingShippingRates] = useState(false);
  const [isRepricing, setIsRepricing] = useState(false);

  // Address selection state
  const [selectedAddressOption, setSelectedAddressOption] = useState<
    'new' | number
  >('new');
  const [isFormReadOnly, setIsFormReadOnly] = useState(false);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);

  // Cart reprice data state
  const [repriceData, setLocalRepriceData] = useState<RepriceData | null>(null);

  // Desktop QR modal state
  const [showDesktopQRModal, setShowDesktopQRModal] = useState(false);
  const [qrImageBase64, setQrImageBase64] = useState<string>('');
  const [qrGloss, setQrGloss] = useState<string>('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string>('');
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  // Desktop card payment modal state
  const [showDesktopCardModal, setShowDesktopCardModal] = useState(false);
  const [cybersourceOrderId, setCybersourceOrderId] = useState<number | null>(
    null,
  );
  const [cardPaymentAmount, setCardPaymentAmount] = useState<string>('0.00');
  const [cardBilling, setCardBilling] = useState<CybersourceBilling | null>(
    null,
  );

  // Step labels - shared between mobile and desktop
  const stepLabels = {
    1: 'Detalles del destinatario',
    2: 'Método de envío',
    3: 'Método de pago',
    4: 'Pago',
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+591',
    country: 'Bolivia',
    countryIso: 'BO',
    departamento: '',
    cityProvince: '',
    detailedAddress: '',
    // Billing fields
    billingCI: '',
    billingComplemento: '',
    billingName: '',
    city: '',
    streetNumber: '',
    stateProvince: '',
    postalCode: '',
  });

  // Helper function to populate form with address data
  const populateFormWithAddress = useCallback((address: UserAddress) => {
    setSelectedCountry(address.country);

    if (address.type === 'national') {
      const placeName = address.place
        ? normalizePlaceName(address.place.place)
        : '';
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
      // Parse phone number to split country code and phone
      let phoneNumber = '';
      let countryCode = '+591'; // Default for Bolivia

      if (client.phone) {
        const phoneMatch = client.phone.match(/^(\+\d+)\s*(.*)$/);
        if (phoneMatch) {
          countryCode = phoneMatch[1]; // e.g., "+591", "+54", "+1", etc.
          phoneNumber = phoneMatch[2]; // e.g., "79301442"
        } else {
          // If no country code in phone, use the entire phone as number
          phoneNumber = client.phone;
        }
      }

      // If this is a guest user, do NOT auto-fill name or email and emulate no addresses
      if (isGuestUser) {
        setFormData((prev) => ({
          ...prev,
          email: '',
          name: '',
          phone: '',
          countryCode: '+591',
        }));

        // Emulate guest with no saved addresses
        setUserAddresses([]);
        setSelectedAddressOption('new');
        setIsFormReadOnly(false);
        dispatch(setAddressId(0));
      } else {
        setFormData((prev) => ({
          ...prev,
          email: client.email || '',
          name: client.name || '',
          phone: phoneNumber,
          countryCode: countryCode,
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
    if (address.type === 'international' || !address.place) {
      // For international addresses, show address and city
      const addressWords = address.address.split(' ').slice(0, 2).join(' ');
      return `${addressWords} - ${address.city}`;
    }
    return formatAddressLabel(address.address, address.place.place);
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

  // Use the supported destination list for both country and calling-code selectors.
  React.useEffect(() => {
    setCountries(SUPPORTED_COUNTRIES);
    setFilteredCountries(SUPPORTED_COUNTRIES);
    setIsLoadingCountries(false);
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
            outOfStockVariantIds.includes(item.variantId),
          );

          setOutOfStockItems(outOfStockCartItems);
          setAvailableItems(availableItems);
          setHasRemainingItems(availableItems.length > 0);
          setShowInsufficientStockModal(true);
          setIsValidatingCart(false);
        } else {
          // Success: Update local cart with backend-validated prices
          updateCartWithRepriceData(repriceResponse);

          // Load updated cart from localStorage and dispatch to Redux
          const updatedCart = getCart();
          dispatch(setCheckoutCartItems(updatedCart.items));
          dispatch(setRepriceData(repriceResponse));

          // Store cart token in Redux
          dispatch(setCartToken(cartResponse.token));
          // Store reprice data for local state (can be removed later)
          setLocalRepriceData(repriceResponse);
          setIsValidatingCart(false);
        }
      } catch (error) {
        console.error('Cart validation error:', error);
        setIsValidatingCart(false);
        setErrorMessage(
          'Unable to validate your cart. Please check your connection and try again.',
        );
        setShowErrorModal(true);
      }
    };

    validateCart();
  }, [router, dispatch]);

  // Handle proceeding without out-of-stock items
  const handleProceedWithoutOutOfStock = () => {
    // Remove out of stock items from cart
    const outOfStockVariantIds = outOfStockItems.map((item) => item.variantId);
    removeOutOfStockVariants(outOfStockVariantIds);

    // Close modal and reload page to restart validation flow
    setShowInsufficientStockModal(false);
    window.location.reload();
  };

  // Handle canceling purchase - clear cart and go to gender page
  const handleCancelPurchase = () => {
    clearCart();
    const lastGender = GenderStorage.getGender();
    router.push(`/${lastGender}`);
  };

  // Handle going to homepage
  const handleGoToHomepage = () => {
    const lastGender = GenderStorage.getGender();
    router.push(`/${lastGender}`);
  };

  // Continue as guest: store redirect, call guest API, complete session with token
  const handleGuestContinue = async () => {
    setIsGuestLoading(true);
    try {
      AuthStorage.storeRedirectUrl(window.location.href);

      const res = await fetch(`${API_URL}auth/guest`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        setShowErrorModal(true);
        setErrorMessage('No se pudo continuar como invitado');
        return;
      }

      if (data.token) {
        await completeLoginWithToken(data.token, dispatch);
        const redirectUrl = AuthStorage.getAndClearRedirectUrl() || '/';
        router.push(redirectUrl);
      } else {
        setShowErrorModal(true);
        setErrorMessage('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Guest login error:', err);
      setShowErrorModal(true);
      setErrorMessage('Error al continuar como invitado');
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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

  // When a region is selected from REGION_CODES, mirror its name into `city`
  useEffect(() => {
    if (!formData.countryIso || !formData.stateProvince) return;
    const regions = REGION_CODES[formData.countryIso];
    if (!regions) return;
    const found = regions.find((r) => r.code === formData.stateProvince);
    if (found && formData.city !== found.name) {
      setFormData((prev) => ({ ...prev, city: found.name }));
    }
  }, [formData.countryIso, formData.stateProvince]);

  const handleSearchCountries = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.dialCode.includes(query),
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
        countryIso: country.code,
        stateProvince: '',
        city: '',
      }));
    }
    setShowCountryCodeModal(false);
    setSearchQuery('');
    setFilteredCountries(countries);
  };

  const validateForm = (): boolean => {
    console.debug('validateForm input', formData);
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
      if (!formData.stateProvince.trim()) {
        newErrors.stateProvince = 'El estado/provincia es obligatorio';
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

    // Billing validation
    if (!formData.billingCI || !formData.billingCI.trim()) {
      newErrors.billingCI =
        selectedCountry === 'Bolivia'
          ? 'CI/NIT es obligatorio'
          : 'Documento de identidad es obligatorio';
    }
    if (!formData.billingName || !formData.billingName.trim()) {
      newErrors.billingName = 'El nombre para la factura es obligatorio';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.debug('validateForm result', { isValid, errors: newErrors });
    return isValid;
  };

  const handleContinue = async () => {
    console.debug('handleContinue invoked', {
      selectedCountry,
      selectedAddressOption,
    });
    if (validateForm()) {
      console.debug('handleContinue: validation passed');
      try {
        setIsCreatingAddress(true);
        console.debug('handleContinue: setIsCreatingAddress(true)');

        // Store form data in Redux
        dispatch(setCheckoutFormData(formData));

        // Find and store the selected place with its shipments
        let selectedPlaceData: Place | undefined;
        if (selectedCountry === 'Bolivia' && formData.departamento) {
          selectedPlaceData = departments.find(
            (dept) => normalizePlaceName(dept.place) === formData.departamento,
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
          console.debug('handleContinue: creating address', addressData);
          const addressResponse = await createAddress(addressData);

          // Store address ID in Redux
          dispatch(setAddressId(addressResponse.id));
          console.debug('handleContinue: address created', addressResponse.id);
        }

        setIsCreatingAddress(false);
        console.debug('handleContinue: setIsCreatingAddress(false)');

        // International addresses need FedEx rates before advancing to step 2
        if (selectedCountry !== 'Bolivia') {
          if (!cartToken) {
            throw new Error(
              'No se encontró el carrito. Por favor recarga la página.',
            );
          }
          setIsFetchingShippingRates(true);
          console.debug('handleContinue: fetching FedEx rates');
          const ratesResponse = await getFedexRates(
            cartToken,
            buildFedexRecipient(formData),
          );
          console.debug('handleContinue: fetched FedEx rates', {
            token: ratesResponse.fedexShippingToken,
            servicesCount: ratesResponse.services?.length,
          });
          dispatch(
            setFedexRates({
              token: ratesResponse.fedexShippingToken,
              services: ratesResponse.services,
            }),
          );
          setIsFetchingShippingRates(false);
          console.debug('handleContinue: setIsFetchingShippingRates(false)');
        }

        // Form is valid, update step (desktop will show step 2, mobile needs modal)
        goToStep(2);
        console.debug('handleContinue: goToStep(2)');
        // Only show modal on mobile (desktop uses currentStep to render content)
        if (window.innerWidth < 1024) {
          setShowDeliveryModal(true);
          console.debug('handleContinue: setShowDeliveryModal(true)');
        }
      } catch (error) {
        console.error('Error preparing shipping step:', error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save your address. Please try again.',
        );
        setShowErrorModal(true);
      } finally {
        setIsCreatingAddress(false);
        setIsFetchingShippingRates(false);
      }
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector(
        '.checkout-input--error, .checkout-select--error, .checkout-textarea--error',
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleDeliveryOptionSelect = (
    shipmentId: number,
    shipmentName: string,
  ) => {
    // Find the full shipment object
    const shipment = selectedPlace?.shipments.find((s) => s.id === shipmentId);
    if (shipment) {
      dispatch(setSelectedShipment(shipment));
    }
    setSelectedDeliveryMethod(shipmentName);
    setShowDeliveryModal(false);
    goToStep(3); // Move to payment method selection step (and push history)
    // Only show modal on mobile (desktop uses currentStep to render content)
    if (window.innerWidth < 1024) {
      setShowPaymentMethodModal(true);
    }
  };

  const handleFedexServiceSelect = (service: FedexService) => {
    // Store the selected FedEx service with its price
    dispatch(setSelectedFedexService(service));

    // Set the delivery method to display in order review
    setSelectedDeliveryMethod(service.serviceName);

    // Move to step 3 (payment method selection)
    goToStep(3);

    // On mobile, show the payment method modal
    if (window.innerWidth < 1024) {
      setShowDeliveryModal(false);
      setShowPaymentMethodModal(true);
    }
  };

  const handleBackToDelivery = () => {
    setShowPaymentMethodModal(false);
    goToStep(2); // Back to delivery step (and push history)
    // Only show modal on mobile (desktop uses currentStep to render content)
    if (window.innerWidth < 1024) {
      setShowDeliveryModal(true);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethodId) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodModal(false);
    goToStep(4); // Move to order review step (and push history)
    // Only show modal on mobile (desktop uses currentStep to render content)
    if (window.innerWidth < 1024) {
      setShowOrderConfirmationModal(true);
    }
  };

  const handleBackToPaymentMethod = () => {
    setShowOrderConfirmationModal(false);
    goToStep(3); // Back to payment method step (and push history)
    // Only show modal on mobile (desktop uses currentStep to render content)
    if (window.innerWidth < 1024) {
      setShowPaymentMethodModal(true);
    }
  };

  const handleConfirmOrder = async () => {
    if (!hasAcceptedTerms) return;
    if (!addressId || (!cartToken && !fedexShippingToken)) {
      setOrderError('Missing required order information. Please try again.');
      return;
    }

    // Prevent order creation if women's section is disabled and cart has women's items
    if (!FEATURE_FLAGS.WOMEN_ENABLED) {
      try {
        const cart = getCart();
        const hasWomen = await checkForWomenItems(cart.items);
        if (hasWomen) {
          setOrderError(
            'La compra está temporalmente deshabilitada para prendas de categoría mujeres.',
          );
          return;
        }
      } catch (e) {
        // ignore errors and continue
      }
    }

    try {
      setIsCreatingOrder(true);
      setOrderError('');

      // Step 1: Create the order
      const orderResponse = await createOrder({
        items: fedexShippingToken || cartToken || '',
        name: formData.name,
        phone: `${formData.countryCode} ${formData.phone}`,
        payment_type: selectedPaymentMethod === 'card' ? 'card_online' : 'qr',
        selectedServiceType: selectedFedexService
          ? selectedFedexService.serviceType
          : undefined,
        email: formData.email,
        billing: {
          ci: formData.billingCI,
          name: formData.billingName,
          phone: `${formData.countryCode} ${formData.phone}`,
          email: formData.email,
          complemento: formData.billingComplemento || undefined,
          codigoTipoDocumentoIdentidad: 1,
        },
        shipment: selectedShipment ? selectedShipment.id : undefined,
        address: addressId,
      });

      setCreatedOrderId(orderResponse.id);

      if (selectedPaymentMethod === 'card') {
        // Card flow: reuse the store order as the Cybersource reference (same backend now, no separate reservation call)
        const total =
          (repriceData ? parseFloat(repriceData.total || '0') : 0) +
          (selectedFedexService
            ? selectedFedexService.amountBOB
            : parseFloat(selectedShipment?.price || '0'));
        const totalPrice = total.toFixed(2);

        const billing = buildCybersourceBilling({
          name: formData.name,
          email: formData.email,
          selectedCountry,
          detailedAddress: formData.detailedAddress,
          cityProvince: formData.cityProvince,
          departamento: formData.departamento,
          city: formData.city,
          streetNumber: formData.streetNumber,
          postalCode: formData.postalCode,
          isLoggedIn: !!client && !isGuestUser,
        });

        setCybersourceOrderId(orderResponse.id);
        setCardPaymentAmount(totalPrice);
        setCardBilling(billing);
        setShowDesktopCardModal(true);
      } else {
        // QR flow: generate the QR code for the store order
        const qrResponse = await generateQR(orderResponse.id);
        setQrImageBase64(qrResponse.qr);
        setQrGloss(qrResponse.gloss || '');
        setShowDesktopQRModal(true);
      }
    } catch (error) {
      console.error('Error creating order or preparing payment:', error);
      setOrderError(
        error instanceof Error
          ? error.message
          : 'Unable to create order. Please try again.',
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentConfirmed = () => {
    const orderId = createdOrderId;
    setShowDesktopQRModal(false);
    setCreatedOrderId(null);
    // Redirect to order confirmation page with order ID
    if (orderId) {
      try {
        if (isGuestUser) {
          saveGuestOrderAccess(orderId);
        }
      } catch (e) {
        // ignore localStorage errors
      }
      router.push(`/w/checkout/order-confirmed?orderId=${orderId}`);
    }
  };

  const handleCardPaymentBeforeRedirect = () => {
    // Save guest order access before the browser navigates away to Cybersource
    if (createdOrderId && isGuestUser) {
      try {
        saveGuestOrderAccess(createdOrderId);
      } catch (e) {
        // ignore localStorage errors
      }
    }
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
        availableItems={availableItems}
        hasRemainingItems={hasRemainingItems}
        onProceed={handleProceedWithoutOutOfStock}
        onCancel={handleCancelPurchase}
      />

      {/* Authentication Guard */}
      {!client ? (
        <div className="checkout-auth-guard">
          <div className="checkout-auth-guard__content">
            <h2 className="checkout-auth-guard__title">
              Inicia sesión para continuar
            </h2>
            <p className="checkout-auth-guard__subtitle">
              Necesitas iniciar sesión para completar tu compra
            </p>
            <GoogleLoginButton />
            <button
              type="button"
              className="checkout-guest-link"
              onClick={handleGuestContinue}
              disabled={isGuestLoading}
            >
              {isGuestLoading ? 'Cargando...' : 'Continuar sin iniciar sesión'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Store Navbar for Desktop */}
          <div className="checkout-desktop-nav">
            <nav className="checkout-desktop-nav__inner">
              <div className="checkout-desktop-nav__left">
                <span
                  onClick={() => {
                    const lastGender = GenderStorage.getGender();
                    router.push(`/${lastGender}`);
                  }}
                  className="checkout-desktop-nav__logo"
                >
                  MONERO
                </span>
              </div>
            </nav>
            {/* Full width black line */}
            <div className="checkout-desktop-nav__divider"></div>
          </div>

          {/* Desktop Layout */}
          <div className="checkout-desktop-layout">
            {/* Left Content Area - 80% */}
            <div className="checkout-desktop-panel">
              {/* Centered Content */}
              <div className="checkout-desktop-centered">
                <div style={{ maxWidth: '600px', width: '100%' }}>
                  {/* Desktop Step Indicator */}
                  <div className="checkout-step-indicator">
                    {/* Step 1: Detalles del destinatario */}
                    <div className="checkout-step-item">
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
                    <div className="checkout-step-item">
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

                    {/* Step 3: Método de pago */}
                    <div className="checkout-step-item">
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

                    {/* Step 4: Pago */}
                    <div className="checkout-step-item">
                      <span
                        style={{
                          color: currentStep >= 4 ? '#000' : '#9ca3af',
                          fontSize: '0.875rem',
                          fontWeight: currentStep >= 4 ? '600' : '400',
                        }}
                      >
                        {stepLabels[4]}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Content Based on Current Step */}
                  {currentStep === 1 && (
                    <>
                      {/* Recipient Details Section */}
                      <div className="checkout-section">
                        <h2 className="checkout-section-title">
                          Llena los datos del destinatario
                        </h2>
                        {/* Name Input */}
                        <div className="checkout-field">
                          <label className="checkout-label">
                            Nombre completo
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`checkout-input ${errors.name ? 'checkout-input--error' : ''}`}
                            placeholder="Ingresa tu nombre completo"
                          />
                          {errors.name && (
                            <p className="checkout-error-text">{errors.name}</p>
                          )}
                        </div>

                        {/* Email Input */}
                        <div className="checkout-field">
                          <label className="checkout-label">
                            Correo electrónico
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            readOnly={isFormReadOnly && !isGuestUser}
                            className={`checkout-input ${!isGuestUser ? 'checkout-input--email' : ''}`}
                            placeholder="ejemplo@correo.com"
                          />
                          <p className="checkout-hint-text">
                            Este correo está vinculado a tu cuenta
                          </p>
                          {errors.email && (
                            <p className="checkout-error-text">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        {/* Phone Number Input with Country Code */}
                        <div className="checkout-field">
                          <label className="checkout-label">
                            Número de teléfono
                          </label>
                          <div className="checkout-phone-row">
                            {/* Country Code Selector */}
                            <button
                              onClick={() => {
                                setModalType('countryCode');
                                setShowCountryCodeModal(true);
                              }}
                              className="checkout-phone-code-btn"
                            >
                              {formData.countryCode}
                            </button>

                            {/* Phone Number Input */}
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className={`checkout-input checkout-input--flex ${errors.phone ? 'checkout-input--error' : ''}`}
                              placeholder="70000000"
                            />
                          </div>
                          {errors.phone && (
                            <p className="checkout-error-text">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address Section */}
                      <div className="checkout-section">
                        <h2 className="checkout-section-title--sm">
                          Dirección de entrega
                        </h2>

                        {/* Address Selection Dropdown (if user has addresses) */}
                        {userAddresses.length > 0 && (
                          <div className="checkout-field">
                            <label className="checkout-label">
                              Seleccionar dirección
                            </label>
                            <select
                              value={selectedAddressOption}
                              onChange={(e) =>
                                handleAddressSelection(e.target.value)
                              }
                              className="checkout-select"
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
                        <div className="checkout-field">
                          <label className="checkout-label">País</label>
                          <button
                            onClick={() => {
                              if (!isFormReadOnly) {
                                setModalType('country');
                                setShowCountryCodeModal(true);
                              }
                            }}
                            className="checkout-country-btn"
                            style={{
                              backgroundColor: isFormReadOnly
                                ? '#f3f4f6'
                                : 'white',
                              opacity: isFormReadOnly ? 0.6 : 1,
                              cursor: isFormReadOnly
                                ? 'not-allowed'
                                : 'pointer',
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
                            <div className="checkout-field">
                              <label className="checkout-label">
                                Departamento
                              </label>
                              <select
                                name="departamento"
                                value={formData.departamento}
                                onChange={handleInputChange}
                                className={`checkout-select ${errors.departamento ? 'checkout-select--error' : ''}`}
                                style={{
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
                                <p className="checkout-error-text">
                                  {errors.departamento}
                                </p>
                              )}
                            </div>

                            {/* City/Province for Bolivia */}
                            <div className="checkout-field">
                              <label className="checkout-label">
                                Ciudad / Provincia
                              </label>
                              <input
                                type="text"
                                name="cityProvince"
                                value={formData.cityProvince}
                                onChange={handleInputChange}
                                className={`checkout-input ${errors.cityProvince ? 'checkout-input--error' : ''}`}
                                style={{
                                  backgroundColor: isFormReadOnly
                                    ? '#f3f4f6'
                                    : 'white',
                                  opacity: isFormReadOnly ? 0.6 : 1,
                                }}
                                placeholder="Ej. Santa Cruz, La Paz, Cochabamba"
                                readOnly={isFormReadOnly}
                              />
                              {errors.cityProvince && (
                                <p className="checkout-error-text">
                                  {errors.cityProvince}
                                </p>
                              )}
                            </div>

                            {/* Detailed Address for Bolivia */}
                            <div className="checkout-field">
                              <label className="checkout-label">
                                Dirección detallada
                              </label>
                              <textarea
                                name="detailedAddress"
                                value={formData.detailedAddress}
                                onChange={handleInputChange}
                                rows={3}
                                className={`checkout-textarea ${errors.detailedAddress ? 'checkout-textarea--error' : ''}`}
                                style={{
                                  backgroundColor: isFormReadOnly
                                    ? '#f3f4f6'
                                    : 'white',
                                  opacity: isFormReadOnly ? 0.6 : 1,
                                }}
                                placeholder="Calle, número, barrio, referencias adicionales..."
                                readOnly={isFormReadOnly}
                              />
                              {errors.detailedAddress && (
                                <p className="checkout-error-text">
                                  {errors.detailedAddress}
                                </p>
                              )}
                            </div>

                            {/* Billing Section */}
                            <div className="checkout-section">
                              <h2 className="checkout-section-title--sm">
                                Datos de facturación
                              </h2>

                              <div className="checkout-field">
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <div style={{ flex: 1 }}>
                                    <label className="checkout-label">
                                      CI/NIT
                                    </label>
                                    <input
                                      type="text"
                                      name="billingCI"
                                      value={formData.billingCI}
                                      onChange={handleInputChange}
                                      className={`checkout-input ${errors.billingCI ? 'checkout-input--error' : ''}`}
                                      placeholder="CI o NIT"
                                    />
                                    {errors.billingCI && (
                                      <p className="checkout-error-text">
                                        {errors.billingCI}
                                      </p>
                                    )}
                                  </div>
                                  <div
                                    style={{ width: '110px', flexShrink: 0 }}
                                  >
                                    <label className="checkout-label">
                                      Complemento
                                    </label>
                                    <input
                                      type="text"
                                      name="billingComplemento"
                                      value={formData.billingComplemento}
                                      onChange={handleInputChange}
                                      className="checkout-input"
                                      placeholder="Opcional"
                                      maxLength={4}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="checkout-field">
                                <label className="checkout-label">Nombre</label>
                                <input
                                  type="text"
                                  name="billingName"
                                  value={formData.billingName}
                                  onChange={handleInputChange}
                                  className={`checkout-input ${errors.billingName ? 'checkout-input--error' : ''}`}
                                  placeholder="Nombre para la factura"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* City for Other Countries - only show free-text city when no region list available */}
                            {!REGION_CODES[formData.countryIso || ''] && (
                              <div className="checkout-field">
                                <label className="checkout-label">Ciudad</label>
                                <input
                                  type="text"
                                  name="city"
                                  value={formData.city}
                                  onChange={handleInputChange}
                                  className={`checkout-input ${errors.city ? 'checkout-input--error' : ''}`}
                                  style={{
                                    backgroundColor: isFormReadOnly
                                      ? '#f3f4f6'
                                      : 'white',
                                    opacity: isFormReadOnly ? 0.6 : 1,
                                  }}
                                  placeholder="Ingresa tu ciudad"
                                  readOnly={isFormReadOnly}
                                />
                                {errors.city && (
                                  <p className="checkout-error-text">
                                    {errors.city}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* State/Province for Other Countries (required by FedEx) */}
                            <div className="checkout-field">
                              <label className="checkout-label">
                                Estado / Provincia
                              </label>
                              {REGION_CODES[formData.countryIso || ''] ? (
                                <select
                                  name="stateProvince"
                                  value={formData.stateProvince}
                                  onChange={handleInputChange}
                                  className={`checkout-input ${errors.stateProvince ? 'checkout-input--error' : ''}`}
                                  style={{
                                    backgroundColor: isFormReadOnly
                                      ? '#f3f4f6'
                                      : 'white',
                                    opacity: isFormReadOnly ? 0.6 : 1,
                                  }}
                                  disabled={isFormReadOnly}
                                >
                                  <option value="">
                                    Selecciona Estado / Provincia
                                  </option>
                                  {REGION_CODES[formData.countryIso || ''].map(
                                    (r) => (
                                      <option key={r.code} value={r.code}>
                                        {r.name} ({r.code})
                                      </option>
                                    ),
                                  )}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  name="stateProvince"
                                  value={formData.stateProvince}
                                  onChange={handleInputChange}
                                  className={`checkout-input ${errors.stateProvince ? 'checkout-input--error' : ''}`}
                                  style={{
                                    backgroundColor: isFormReadOnly
                                      ? '#f3f4f6'
                                      : 'white',
                                    opacity: isFormReadOnly ? 0.6 : 1,
                                  }}
                                  placeholder="Ej. NY, CA, Florida"
                                  readOnly={isFormReadOnly}
                                />
                              )}
                              {errors.stateProvince && (
                                <p className="checkout-error-text">
                                  {errors.stateProvince}
                                </p>
                              )}
                            </div>

                            {/* Street Number and Postal Code */}
                            <div className="checkout-grid-2">
                              <div>
                                <label className="checkout-label">
                                  Calle y número
                                </label>
                                <textarea
                                  name="streetNumber"
                                  value={formData.streetNumber}
                                  onChange={handleInputChange}
                                  className={`checkout-textarea ${errors.streetNumber ? 'checkout-textarea--error' : ''}`}
                                  style={{
                                    backgroundColor: isFormReadOnly
                                      ? '#f3f4f6'
                                      : 'white',
                                    opacity: isFormReadOnly ? 0.6 : 1,
                                    minHeight: '72px',
                                  }}
                                  placeholder="Calle y número, barrio, referencias..."
                                  readOnly={isFormReadOnly}
                                />
                                {errors.streetNumber && (
                                  <p className="checkout-error-text">
                                    {errors.streetNumber}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="checkout-label">
                                  Código postal
                                </label>
                                <input
                                  type="text"
                                  name="postalCode"
                                  value={formData.postalCode}
                                  onChange={handleInputChange}
                                  className={`checkout-input ${errors.postalCode ? 'checkout-input--error' : ''}`}
                                  style={{
                                    backgroundColor: isFormReadOnly
                                      ? '#f3f4f6'
                                      : 'white',
                                    opacity: isFormReadOnly ? 0.6 : 1,
                                  }}
                                  placeholder="12345"
                                  readOnly={isFormReadOnly}
                                />
                                {errors.postalCode && (
                                  <p className="checkout-error-text">
                                    {errors.postalCode}
                                  </p>
                                )}
                              </div>
                              {/* Billing Section for other countries */}
                              <div className="checkout-section">
                                <h2 className="checkout-section-title--sm">
                                  Datos de facturación
                                </h2>

                                <div className="checkout-field">
                                  <label className="checkout-label">
                                    {selectedCountry === 'Bolivia'
                                      ? 'CI/NIT'
                                      : 'DNI / ID'}
                                  </label>
                                  <input
                                    type="text"
                                    name="billingCI"
                                    value={formData.billingCI}
                                    onChange={handleInputChange}
                                    className={`checkout-input ${errors.billingCI ? 'checkout-input--error' : ''}`}
                                    placeholder={
                                      selectedCountry === 'Bolivia'
                                        ? 'CI o NIT'
                                        : 'DNI o ID'
                                    }
                                  />
                                </div>

                                <div className="checkout-field">
                                  <label className="checkout-label">
                                    Nombre
                                  </label>
                                  <input
                                    type="text"
                                    name="billingName"
                                    value={formData.billingName}
                                    onChange={handleInputChange}
                                    className={`checkout-input ${errors.billingName ? 'checkout-input--error' : ''}`}
                                    placeholder="Nombre para la factura"
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Continue Button */}
                        <button
                          onClick={handleContinue}
                          disabled={
                            isCreatingAddress || isFetchingShippingRates
                          }
                          className="checkout-submit-btn"
                        >
                          {isCreatingAddress || isFetchingShippingRates ? (
                            <>
                              <svg
                                className="checkout-spinner"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="checkout-spinner__circle"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="checkout-spinner__path"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              {isFetchingShippingRates
                                ? 'Cargando opciones de envío...'
                                : 'Guardando...'}
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
                      <div
                        className="checkout-section"
                        style={{
                          paddingBottom:
                            selectedCountry !== 'Bolivia' &&
                            fedexServices.length > 0
                              ? '7rem'
                              : undefined,
                        }}
                      >
                        <h2 className="checkout-section-title">
                          {stepLabels[2]}
                        </h2>

                        {/* Delivery Options */}
                        <DeliveryOptionsSection
                          selectedCountry={selectedCountry}
                          onDeliveryOptionSelect={handleDeliveryOptionSelect}
                          isMobile={false}
                          shipments={selectedPlace?.shipments || []}
                          fedexServices={fedexServices}
                          onFedexServiceSelect={handleFedexServiceSelect}
                        />

                        {/* Back Button */}
                        <div className="checkout-back-btn-wrapper">
                          <button
                            onClick={() => {
                              if (
                                typeof window !== 'undefined' &&
                                window.history &&
                                window.history.length > 0
                              ) {
                                window.history.back();
                              } else {
                                goToStep(1);
                              }
                            }}
                            className="checkout-back-btn"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="m15 18-6-6 6-6" />
                            </svg>
                            Volver a detalles del destinatario
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      {/* Payment Method Selection Section */}
                      <div className="checkout-section">
                        <h2 className="checkout-section-title">
                          Elige un método de pago
                        </h2>
                        {/* showing only the step title "Método de pago" per design */}

                        <PaymentMethodSelectionSection
                          onSelect={handlePaymentMethodSelect}
                          isMobile={false}
                          isFedexShipment={!!selectedFedexService}
                        />

                        {/* Back Button */}
                        <div className="checkout-back-btn-wrapper">
                          <button
                            onClick={() => {
                              if (
                                typeof window !== 'undefined' &&
                                window.history &&
                                window.history.length > 0
                              ) {
                                window.history.back();
                              } else {
                                handleBackToDelivery();
                              }
                            }}
                            className="checkout-back-btn"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="m15 18-6-6 6-6" />
                            </svg>
                            Volver a método de envío
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 4 && (
                    <>
                      {/* Payment Section */}
                      <div className="checkout-section">
                        <h2 className="checkout-section-title">
                          Por favor revisa tu orden
                        </h2>

                        <OrderReviewSection
                          selectedDeliveryMethod={selectedDeliveryMethod}
                          selectedCountry={selectedCountry}
                          formData={formData}
                          repriceData={reduxRepriceData || repriceData}
                          deliveryCost={
                            selectedFedexService
                              ? selectedFedexService.amountBOB
                              : selectedShipment
                                ? parseFloat(selectedShipment.price)
                                : 0
                          }
                          paymentMethod={selectedPaymentMethod ?? 'qr'}
                          onConfirmOrder={handleConfirmOrder}
                          onBackToDelivery={handleBackToPaymentMethod}
                          showBackButton={true}
                          showConfirmButton={true}
                          showSectionTitles={true}
                          showPaymentMethod={true}
                          showTerms={true}
                          hasAcceptedTerms={hasAcceptedTerms}
                          onTermsChange={setHasAcceptedTerms}
                          isCreatingOrder={isCreatingOrder}
                          orderError={orderError}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Cart Summary - 20% */}
            <div className="checkout-desktop-right">
              <DesktopCartSummary
                selectedCountry={selectedCountry}
                selectedDeliveryMethod={selectedDeliveryMethod}
                repriceData={reduxRepriceData || repriceData}
                deliveryCost={
                  selectedFedexService
                    ? selectedFedexService.amountBOB
                    : selectedShipment
                      ? parseFloat(selectedShipment.price)
                      : 0
                }
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="checkout-mobile">
            {/* Mobile Top Bar */}
            <div className="checkout-mobile-topbar">
              {/* Back Arrow */}
              <button
                onClick={() => router.back()}
                className="checkout-icon-btn"
                style={{ marginRight: '1rem' }}
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
              <h1 className="checkout-topbar-title">Información de envío</h1>

              {/* Close Button - Redirect to Last Gender Page */}
              <button
                onClick={() => {
                  const lastGender = GenderStorage.getGender();
                  router.push(`/${lastGender}`);
                }}
                className="checkout-icon-btn"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: '#374151' }}
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="checkout-mobile-form">
              {/* Recipient Details Section */}
              <div className="checkout-section">
                <h2 className="checkout-section-title--sm">{stepLabels[1]}</h2>

                {/* Name Input */}
                <div className="checkout-field">
                  <label className="checkout-label">Nombre completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`checkout-input ${errors.name ? 'checkout-input--error' : ''}`}
                    placeholder="Ingresa tu nombre completo"
                  />
                  {errors.name && (
                    <p className="checkout-error-text">{errors.name}</p>
                  )}
                </div>

                {/* Email Input */}
                <div className="checkout-field">
                  <label className="checkout-label">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={isFormReadOnly && !isGuestUser}
                    className={`checkout-input ${!isGuestUser ? 'checkout-input--email' : ''}`}
                    placeholder="ejemplo@correo.com"
                  />
                  <p className="checkout-hint-text">
                    Este correo está vinculado a tu cuenta
                  </p>
                  {errors.email && (
                    <p className="checkout-error-text">{errors.email}</p>
                  )}
                </div>

                {/* Phone Number Input with Country Code */}
                <div className="checkout-field">
                  <label className="checkout-label">Número de teléfono</label>
                  <div className="checkout-phone-row">
                    {/* Country Code Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalType('countryCode');
                        setShowCountryCodeModal(true);
                      }}
                      className="checkout-phone-code-btn"
                    >
                      {formData.countryCode}
                    </button>

                    {/* Phone Input */}
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`checkout-input checkout-input--flex ${errors.phone ? 'checkout-input--error' : ''}`}
                      placeholder="70000000"
                    />
                  </div>
                  {errors.phone && (
                    <p className="checkout-error-text">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Delivery Address Section */}
              <div style={{ marginBottom: '3rem' }}>
                <h2 className="checkout-section-title--sm">
                  Dirección de entrega
                </h2>

                {/* Address Selection Dropdown (if user has addresses) */}
                {userAddresses.length > 0 && (
                  <div className="checkout-field">
                    <label className="checkout-label">
                      Seleccionar dirección
                    </label>
                    <select
                      value={selectedAddressOption}
                      onChange={(e) => handleAddressSelection(e.target.value)}
                      className="checkout-select"
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
                <div className="checkout-field">
                  <label className="checkout-label">País</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isFormReadOnly) {
                        setModalType('country');
                        setShowCountryCodeModal(true);
                      }
                    }}
                    className="checkout-country-btn"
                    style={{
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
                  <div className="checkout-field">
                    <label className="checkout-label">Departamento</label>
                    <select
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleInputChange}
                      className={`checkout-select ${errors.departamento ? 'checkout-select--error' : ''}`}
                      style={{
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
                      <p className="checkout-error-text">
                        {errors.departamento}
                      </p>
                    )}
                  </div>
                )}

                {/* Conditional Fields Based on Country */}
                {selectedCountry === 'Bolivia' ? (
                  <>
                    {/* City/Province for Bolivia */}
                    <div className="checkout-field">
                      <label className="checkout-label">
                        Ciudad / Provincia
                      </label>
                      <input
                        type="text"
                        name="cityProvince"
                        value={formData.cityProvince}
                        onChange={handleInputChange}
                        className={`checkout-input ${errors.cityProvince ? 'checkout-input--error' : ''}`}
                        style={{
                          backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                          opacity: isFormReadOnly ? 0.6 : 1,
                        }}
                        placeholder="Ej. Santa Cruz, La Paz, Cochabamba"
                        readOnly={isFormReadOnly}
                      />
                      {errors.cityProvince && (
                        <p className="checkout-error-text">
                          {errors.cityProvince}
                        </p>
                      )}
                    </div>

                    {/* Detailed Address for Bolivia */}
                    <div className="checkout-field">
                      <label className="checkout-label">
                        Dirección detallada
                      </label>
                      <textarea
                        name="detailedAddress"
                        value={formData.detailedAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className={`checkout-textarea ${errors.detailedAddress ? 'checkout-textarea--error' : ''}`}
                        style={{
                          backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                          opacity: isFormReadOnly ? 0.6 : 1,
                        }}
                        placeholder="Calle, número, barrio, referencias adicionales..."
                        readOnly={isFormReadOnly}
                      />
                      {errors.detailedAddress && (
                        <p className="checkout-error-text">
                          {errors.detailedAddress}
                        </p>
                      )}
                    </div>
                    {/* Billing Section (mobile) */}
                    <div className="checkout-section">
                      <h2 className="checkout-section-title--sm">
                        Datos de facturación
                      </h2>

                      <div className="checkout-field">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <div style={{ flex: 1 }}>
                            <label className="checkout-label">
                              {selectedCountry === 'Bolivia'
                                ? 'CI/NIT'
                                : 'DNI / ID'}
                            </label>
                            <input
                              type="text"
                              name="billingCI"
                              value={formData.billingCI}
                              onChange={handleInputChange}
                              className={`checkout-input ${errors.billingCI ? 'checkout-input--error' : ''}`}
                              placeholder={
                                selectedCountry === 'Bolivia'
                                  ? 'CI o NIT'
                                  : 'DNI o ID'
                              }
                            />
                            {errors.billingCI && (
                              <p className="checkout-error-text">
                                {errors.billingCI}
                              </p>
                            )}
                          </div>
                          <div style={{ width: '110px', flexShrink: 0 }}>
                            <label className="checkout-label">
                              Complemento
                            </label>
                            <input
                              type="text"
                              name="billingComplemento"
                              value={formData.billingComplemento}
                              onChange={handleInputChange}
                              className="checkout-input"
                              placeholder="Opcional"
                              maxLength={4}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="checkout-field">
                        <label className="checkout-label">Nombre</label>
                        <input
                          type="text"
                          name="billingName"
                          value={formData.billingName}
                          onChange={handleInputChange}
                          className={`checkout-input ${errors.billingName ? 'checkout-input--error' : ''}`}
                          placeholder="Nombre para la factura"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* City for Other Countries - only show free-text city when no region list available */}
                    {!REGION_CODES[formData.countryIso || ''] && (
                      <div className="checkout-field">
                        <label className="checkout-label">Ciudad</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`checkout-input ${errors.city ? 'checkout-input--error' : ''}`}
                          style={{
                            backgroundColor: isFormReadOnly
                              ? '#f3f4f6'
                              : 'white',
                            opacity: isFormReadOnly ? 0.6 : 1,
                          }}
                          placeholder="Nombre de la ciudad"
                          readOnly={isFormReadOnly}
                        />
                        {errors.city && (
                          <p className="checkout-error-text">{errors.city}</p>
                        )}
                      </div>
                    )}

                    {/* Street and Number for Other Countries (combined textarea) */}
                    <div className="checkout-field">
                      <label className="checkout-label">Calle y número</label>
                      <textarea
                        name="streetNumber"
                        value={formData.streetNumber}
                        onChange={handleInputChange}
                        className={`checkout-textarea ${errors.streetNumber ? 'checkout-textarea--error' : ''}`}
                        style={{
                          backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                          opacity: isFormReadOnly ? 0.6 : 1,
                          minHeight: '72px',
                        }}
                        placeholder="Calle y número, barrio, referencias..."
                        readOnly={isFormReadOnly}
                      />
                      {errors.streetNumber && (
                        <p className="checkout-error-text">
                          {errors.streetNumber}
                        </p>
                      )}
                    </div>

                    {/* State/Province for Other Countries (required by FedEx) */}
                    <div className="checkout-field">
                      <label className="checkout-label">
                        Estado / Provincia
                      </label>
                      {REGION_CODES[formData.countryIso || ''] ? (
                        <select
                          name="stateProvince"
                          value={formData.stateProvince}
                          onChange={handleInputChange}
                          className={`checkout-input ${errors.stateProvince ? 'checkout-input--error' : ''}`}
                          style={{
                            backgroundColor: isFormReadOnly
                              ? '#f3f4f6'
                              : 'white',
                            opacity: isFormReadOnly ? 0.6 : 1,
                          }}
                          disabled={isFormReadOnly}
                        >
                          <option value="">
                            Selecciona Estado / Provincia
                          </option>
                          {REGION_CODES[formData.countryIso || ''].map((r) => (
                            <option key={r.code} value={r.code}>
                              {r.name} ({r.code})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="stateProvince"
                          value={formData.stateProvince}
                          onChange={handleInputChange}
                          className={`checkout-input ${errors.stateProvince ? 'checkout-input--error' : ''}`}
                          style={{
                            backgroundColor: isFormReadOnly
                              ? '#f3f4f6'
                              : 'white',
                            opacity: isFormReadOnly ? 0.6 : 1,
                          }}
                          placeholder="Ej. NY, CA, Florida"
                          readOnly={isFormReadOnly}
                        />
                      )}
                      {errors.stateProvince && (
                        <p className="checkout-error-text">
                          {errors.stateProvince}
                        </p>
                      )}
                    </div>

                    {/* Postal Code for Other Countries */}
                    <div className="checkout-field">
                      <label className="checkout-label">Código postal</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`checkout-input ${errors.postalCode ? 'checkout-input--error' : ''}`}
                        style={{
                          backgroundColor: isFormReadOnly ? '#f3f4f6' : 'white',
                          opacity: isFormReadOnly ? 0.6 : 1,
                        }}
                        placeholder="Código postal"
                        readOnly={isFormReadOnly}
                      />
                      {errors.postalCode && (
                        <p className="checkout-error-text">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                    {/* Billing Section for other countries (mobile) */}
                    <div className="checkout-section">
                      <h2 className="checkout-section-title--sm">
                        Datos de facturación
                      </h2>

                      <div className="checkout-field">
                        <label className="checkout-label">
                          {selectedCountry === 'Bolivia'
                            ? 'CI/NIT'
                            : 'DNI / ID'}
                        </label>
                        <input
                          type="text"
                          name="billingCI"
                          value={formData.billingCI}
                          onChange={handleInputChange}
                          className={`checkout-input ${errors.billingCI ? 'checkout-input--error' : ''}`}
                          placeholder={
                            selectedCountry === 'Bolivia'
                              ? 'CI o NIT'
                              : 'DNI o ID'
                          }
                        />
                        {errors.billingCI && (
                          <p className="checkout-error-text">
                            {errors.billingCI}
                          </p>
                        )}
                      </div>

                      <div className="checkout-field">
                        <label className="checkout-label">Nombre</label>
                        <input
                          type="text"
                          name="billingName"
                          value={formData.billingName}
                          onChange={handleInputChange}
                          className={`checkout-input ${errors.billingName ? 'checkout-input--error' : ''}`}
                          placeholder="Nombre para la factura"
                        />
                        {errors.billingName && (
                          <p className="checkout-error-text">
                            {errors.billingName}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={isCreatingAddress || isFetchingShippingRates}
                className="checkout-submit-btn"
              >
                {isCreatingAddress || isFetchingShippingRates ? (
                  <>
                    <svg
                      className="checkout-spinner"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="checkout-spinner__circle"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="checkout-spinner__path"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isFetchingShippingRates
                      ? 'Cargando opciones de envío...'
                      : 'Guardando...'}
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
            <div className="checkout-modal">
              {/* Modal Top Bar */}
              <div className="checkout-modal-topbar">
                {/* Empty space for balance */}
                <div className="checkout-modal-spacer"></div>

                {/* Title */}
                <h2 className="checkout-topbar-title">
                  {modalType === 'countryCode' ? 'Country code' : 'País'}
                </h2>

                {/* Close Button - Close modal */}
                <button
                  onClick={() => setShowCountryCodeModal(false)}
                  className="checkout-icon-btn"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: '#374151' }}
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="checkout-modal-body">
                {/* Search Input */}
                <div className="checkout-search-container">
                  <div className="checkout-search-icon">
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
                    className="checkout-search-input"
                  />
                </div>

                {/* Countries List */}
                {isLoadingCountries ? (
                  <div className="checkout-countries-loading">
                    <p style={{ color: '#6b7280' }}>Loading countries...</p>
                  </div>
                ) : (
                  <div>
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleCountryCodeSelect(country)}
                        className="checkout-country-list-btn"
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
                      <div className="checkout-countries-empty">
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
            <div className="checkout-modal">
              {/* Modal Top Bar */}
              <div className="checkout-modal-topbar">
                {/* Back Arrow */}
                <button
                  onClick={() => {
                    // emulate browser back so popstate handles step change and modal sync
                    if (
                      typeof window !== 'undefined' &&
                      window.history &&
                      window.history.length > 0
                    ) {
                      window.history.back();
                    } else {
                      setShowDeliveryModal(false);
                    }
                  }}
                  className="checkout-icon-btn"
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
                <h2 className="checkout-topbar-title--left">Método de envío</h2>

                {/* Close Button - Close modal */}
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="checkout-icon-btn"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: '#374151' }}
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div
                className="checkout-modal-body"
                style={{
                  paddingBottom:
                    selectedCountry !== 'Bolivia' && fedexServices.length > 0
                      ? '14rem'
                      : '8rem',
                }}
              >
                <DeliveryOptionsSection
                  selectedCountry={selectedCountry}
                  onDeliveryOptionSelect={handleDeliveryOptionSelect}
                  isMobile={true}
                  shipments={selectedPlace?.shipments || []}
                  fedexServices={fedexServices}
                  onFedexServiceSelect={handleFedexServiceSelect}
                />
              </div>

              {/* Checkout Cost Summary */}
              <CheckoutCostSummary
                subtotal={
                  repriceData ? parseFloat(repriceData.total || '0') : 0
                }
                selectedCountry={selectedCountry}
                deliveryCost={
                  selectedFedexService
                    ? selectedFedexService.amountBOB
                    : selectedShipment
                      ? parseFloat(selectedShipment.price)
                      : 0
                }
                repriceData={repriceData}
                showFedexCustomsDisclaimer={
                  selectedCountry !== 'Bolivia' && fedexServices.length > 0
                }
              />
            </div>
          )}

          {/* Payment Method Selection Modal */}
          {showPaymentMethodModal && (
            <div className="checkout-modal">
              {/* Modal Top Bar */}
              <div className="checkout-modal-topbar">
                {/* Back Arrow */}
                <button
                  onClick={() => {
                    // emulate browser back so popstate handles step change and modal sync
                    if (
                      typeof window !== 'undefined' &&
                      window.history &&
                      window.history.length > 0
                    ) {
                      window.history.back();
                    } else {
                      setShowPaymentMethodModal(false);
                    }
                  }}
                  className="checkout-icon-btn"
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
                <h2 className="checkout-topbar-title--left">Método de pago</h2>

                {/* Close Button - Close modal */}
                <button
                  onClick={() => setShowPaymentMethodModal(false)}
                  className="checkout-icon-btn"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: '#374151' }}
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div
                className="checkout-modal-body"
                style={{ paddingBottom: '8rem' }}
              >
                <PaymentMethodSelectionSection
                  onSelect={handlePaymentMethodSelect}
                  isMobile={true}
                  isFedexShipment={!!selectedFedexService}
                />
              </div>

              {/* Checkout Cost Summary */}
              <CheckoutCostSummary
                subtotal={
                  repriceData ? parseFloat(repriceData.total || '0') : 0
                }
                selectedCountry={selectedCountry}
                deliveryCost={
                  selectedFedexService
                    ? selectedFedexService.amountBOB
                    : selectedShipment
                      ? parseFloat(selectedShipment.price)
                      : 0
                }
                repriceData={repriceData}
              />
            </div>
          )}

          {/* Order Confirmation Modal */}
          <OrderConfirmationModal
            isOpen={showOrderConfirmationModal}
            onClose={() => setShowOrderConfirmationModal(false)}
            onBackToDelivery={handleBackToPaymentMethod}
            selectedCountry={selectedCountry}
            selectedDeliveryMethod={selectedDeliveryMethod}
            formData={formData}
            paymentMethod={selectedPaymentMethod ?? 'qr'}
          />

          {/* Desktop QR Payment Modal */}
          {showDesktopQRModal && createdOrderId && (
            <QRPaymentModal
              isOpen={showDesktopQRModal}
              onClose={() => setShowDesktopQRModal(false)}
              qrImageBase64={qrImageBase64}
              orderId={createdOrderId}
              onPaymentConfirmed={handlePaymentConfirmed}
              gloss={qrGloss}
            />
          )}

          {/* Desktop Card Payment Modal */}
          {showDesktopCardModal && cybersourceOrderId && cardBilling && (
            <CardPaymentModal
              isOpen={showDesktopCardModal}
              orderId={cybersourceOrderId}
              billing={cardBilling}
              onBeforeRedirect={handleCardPaymentBeforeRedirect}
            />
          )}
        </>
      )}
    </>
  );
};

export default CheckoutPage;
