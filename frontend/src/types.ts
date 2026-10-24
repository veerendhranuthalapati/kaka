export type Role = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type FuelType =
  | "PETROL"
  | "DIESEL"
  | "ELECTRIC"
  | "HYBRID"
  | "PLUG_IN_HYBRID"
  | "CNG"
  | "LPG";

export type TransmissionType = "MANUAL" | "AUTOMATIC" | "CVT" | "DCT";

export type DrivetrainType = "FWD" | "RWD" | "AWD" | "FOUR_WD";

export type VehicleSpecFields = {
  year: number | null;
  odometerKm: number | null;
  engineCc: number | null;
  powerBhp: number | null;
  torqueNm: number | null;
  fuelType: FuelType | null;
  transmission: TransmissionType | null;
  drivetrain: DrivetrainType | null;
  fuelEconomyKmpl: number | null;
  color: string | null;
  owners: number | null;
  vin: string | null;
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
} & VehicleSpecFields;

export type VehicleSpecInput = {
  year?: number | null;
  odometerKm?: number | null;
  engineCc?: number | null;
  powerBhp?: number | null;
  torqueNm?: number | null;
  fuelType?: FuelType | null;
  transmission?: TransmissionType | null;
  drivetrain?: DrivetrainType | null;
  fuelEconomyKmpl?: number | null;
  color?: string | null;
  owners?: number | null;
  vin?: string | null;
};

export type VehicleInput = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
} & VehicleSpecInput;

export type VehicleUpdateInput = Omit<VehicleInput, "quantity">;

export type VehicleSearchParams = {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: FuelType;
  minYear?: number;
  maxOdometerKm?: number;
};

export type ApiErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };
};
