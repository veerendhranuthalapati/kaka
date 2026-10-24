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
};

export type VehicleInput = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

export type VehicleUpdateInput = Omit<VehicleInput, "quantity">;

export type VehicleSearchParams = {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type ApiErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };
};
