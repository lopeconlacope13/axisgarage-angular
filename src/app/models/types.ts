/**
 * Modelos de datos (DTOs) de Axis Garage.
 * Refleja exactamente las respuestas del backend Spring Boot.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

export class LoginRequest {
  email    = '';
  password = '';
}

export class AuthResponse {
  token   = '';
  message = '';
}

export class RegisterRequest {
  firstName = '';
  lastName  = '';
  email     = '';
  password  = '';
}

// ─── User ─────────────────────────────────────────────────────────────────────

export class UserDTO {
  id        = 0;
  username  = '';
  firstName = '';
  lastName  = '';
  email     = '';
  /** Nombre del archivo de imagen de perfil en el servidor (null si no tiene) */
  image: string | null = null;
}

/**
 * Resumen de usuario para el panel de administración.
 * Refleja exactamente el UserSummaryDTO del backend.
 * Solo el ADMIN ve esta información.
 */
export class UserSummary {
  id        = 0;
  username  = '';
  email     = '';
  firstName = '';
  lastName  = '';
  enabled   = true;
  /** Nombres de los roles asignados, ej: ["ROLE_USER"] o ["ROLE_MANAGER"] */
  roles: string[] = [];
}

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export class OwnerDTO {
  id       = 0;
  name     = '';
  lastName = '';
  email    = '';
  phone    = '';
}

export class VehicleDTO {
  id              = 0;
  brand           = '';
  model           = '';
  productionYear  = 0;
  pricePerDay     = 0;
  engineType      = '';
  horsePower      = 0;
  torqueNm        = 0;
  transmission    = '';
  drivetrain      = '';
  fuelType        = '';
  zeroToHundred   = 0;
  description     = '';
  available       = true;
  images:  string[]  = [];
  ownerDTO: OwnerDTO = new OwnerDTO();
  categoryId   = 0;
  categoryName = '';
  locationId   = 0;
  locationName = '';
}

// ─── Location ─────────────────────────────────────────────────────────────────

export class LocationDTO {
  id         = 0;
  name       = '';
  city       = '';
  address    = '';
  postalCode = '';
  country    = '';
  phone      = '';
  email      = '';
}

// ─── Category ─────────────────────────────────────────────────────────────────

export class VehicleCategoryDTO {
  id          = 0;
  name        = '';
  description = '';
}

// ─── Renter ───────────────────────────────────────────────────────────────────

export class RenterDTO {
  id       = 0;
  name     = '';
  lastName = '';
  email    = '';
  dni      = '';
  phone    = '';
}

// ─── Reservation ──────────────────────────────────────────────────────────────

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export class ReservationDTO {
  id           = 0;
  startDate    = '';
  endDate      = '';
  totalPrice   = 0;
  status: ReservationStatus = 'PENDING';
  vehicleId    = 0;
  renterId     = 0;
  vehicleModel = '';
  renterName   = '';
}

// ─── Coverage ─────────────────────────────────────────────────────────────────

export type CoverageType = 'STANDARD' | 'PREMIUM' | 'TOTAL';

export class CoverageDTO {
  id            = 0;
  type: CoverageType = 'STANDARD';
  totalPrice    = 0;
  reservationId = 0;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export class ReviewDTO {
  id                = 0;
  rating            = 5;
  comment           = '';
  reservationId     = 0;
  renterId          = 0;
  reservationString = '';
  renterName        = '';
  // Marca y modelo del vehículo asociado a la reserva (viene del backend desde ReviewMapper)
  vehicleModel      = '';
}

// ─── DamageReport ─────────────────────────────────────────────────────────────

export type DamageReportType = 'PRE' | 'POST';

export class DamageReportDTO {
  id            = 0;
  type: DamageReportType = 'PRE';
  description   = '';
  reportedDate  = '';
  imageUrl      = '';
  reservationId = 0;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export class InvoiceDTO {
  id            = 0;
  invoiceNumber = '';
  issueDate     = '';
  baseAmount    = 0;
  taxRate       = 0.21;
  taxAmount     = 0;
  totalAmount   = 0;
  paymentMethod = '';
  notes         = '';
  reservationId = 0;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export class Page<T> {
  content:       T[]  = [];
  totalElements: number = 0;
  totalPages:    number = 0;
  number:        number = 0;
  size:          number = 0;
}
