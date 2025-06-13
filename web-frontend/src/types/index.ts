// Tenant Configuration Types
export interface TenantConfig {
  id: string;
  tenantKey: string;
  name: string;
  domain: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Landing Page Types
export interface LandingPageConfig {
  id?: number;
  hotelTitle: string;
  welcomeHeading: string;
  welcomeSubtitle: string;
  assistantPrompt: string;
  assistantButtonText: string;
  primaryColor: string;
  secondaryColor: string;
  bannerRotationInterval?: number;
  active?: boolean;
  banners: LandingPageBanner[];
  serviceShortcuts: ServiceShortcut[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LandingPageBanner {
  id?: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  displayOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceShortcut {
  id?: number;
  serviceName: string;
  displayName: string;
  description?: string;
  iconName: string;
  colorCode: string;
  linkUrl: string;
  displayOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LandingPageConfigResponse {
  config: LandingPageConfig | null;
  banners: LandingPageBanner[];
  shortcuts: ServiceShortcut[];
}

// Check-in Types
export interface CheckinRecord {
  id: number;
  reservation: Reservation;
  guestEmail: string;
  status: CheckinStatus;
  passportImagePath?: string;
  passportData?: string;
  passportVerified?: boolean;
  faceioResponse?: string;
  livenessVerified?: boolean;
  verificationErrors?: string;
  startedAt: string;
  checkedInAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum CheckinStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PASSPORT_UPLOADED = 'PASSPORT_UPLOADED',
  PASSPORT_VERIFIED = 'PASSPORT_VERIFIED',
  PENDING_FACE_VERIFICATION = 'PENDING_FACE_VERIFICATION',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface PassportStatusResponse {
  checkinId: number;
  status: string;
  passportUploaded: boolean;
  passportVerified: boolean;
  passportData?: PassportData;
  errors?: string;
}

export interface PassportData {
  documentType: string;
  countryCode: string;
  surname: string;
  givenNames: string;
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  sex: string;
  expirationDate: string;
  personalNumber?: string;
}

export interface LivenessStartResponse {
  faceIOAppId: string;
  checkinId: number;
  sessionId: string;
}

// Hotel and Reservation Types
export interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string;
  description?: string;
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  imageUrl?: string;
  rating?: number;
  amenities?: string[];
}

export interface Reservation {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  numberOfGuests: number;
  numberOfRooms: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentTransactionId?: string;
  specialRequests?: string;
  hotel: Hotel;
  room?: Room;
  createdAt: string;
  updatedAt: string;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export interface Room {
  id: number;
  roomNumber: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  bedCount: number;
  status: RoomStatus;
  description?: string;
  amenities?: string[];
  hotel: Hotel;
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_ORDER = 'OUT_OF_ORDER'
}

export interface ReservationRequest {
  hotelId: number;
  roomId?: number;
  fullName: string;
  email: string;
  phone: string;
  numberOfGuests: number;
  numberOfRooms: number;
  checkInDate: string;
  checkOutDate: string;
  paymentMethod: string;
  specialRequests?: string;
}

export interface HotelSearchParams {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

// Chat Types
export interface ChatMessage {
  id?: string;
  sessionId: string;
  content: string;
  sender: MessageSender;
  timestamp: string;
  type: MessageType;
  metadata?: MessageMetadata;
}

export enum MessageSender {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  ACTION = 'ACTION',
  QUICK_REPLY = 'QUICK_REPLY'
}

export interface MessageMetadata {
  imageUrl?: string;
  actionType?: string;
  actionData?: any;
  confidence?: number;
  quickReplies?: QuickReply[];
}

export interface QuickReply {
  text: string;
  value: string;
  action?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  report?: string;
  metadata?: MessageMetadata;
  suggestions?: string[];
  actions?: ChatAction[];
}

export interface ChatAction {
  type: string;
  label: string;
  data: any;
}

export interface ImageUploadResponse {
  imageUrl: string;
  messageId: string;
}

// Auth Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

// Common Types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Chat Widget Props
export interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  initialMessage?: string;
}

// Landing Page Props
export interface LandingPageProps {
  config?: LandingPageConfig;
  banners?: LandingPageBanner[];
  shortcuts?: ServiceShortcut[];
}

// Form Types
export interface SearchFormData {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: any;
}

// Navigation Types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

// Theme Types
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
}

// Hotel Information Configuration Types
export interface HotelInfo {
  id?: number;
  tenantId?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  operatingHours: OperatingHours;
  amenities: string[];
  policies: HotelPolicies;
  location: {
    latitude?: number;
    longitude?: number;
    city: string;
    country: string;
    timezone: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface OperatingHours {
  reception: string;
  restaurant: string;
  spa: string;
  pool: string;
  gym?: string;
  roomService?: string;
  concierge?: string;
}

export interface HotelPolicies {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  petPolicy?: string;
  smokingPolicy?: string;
  childrenPolicy?: string;
}
