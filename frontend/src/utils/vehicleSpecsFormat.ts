const numberFormatter = new Intl.NumberFormat("en-US");

export function formatKm(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  if (value === 0) return "New";
  return `${numberFormatter.format(value)} km`;
}

export function formatCc(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${numberFormatter.format(value)} cc`;
}

export function formatPower(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${numberFormatter.format(value)} bhp`;
}

export function formatTorque(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${numberFormatter.format(value)} Nm`;
}

export function formatEconomy(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(1)} km/l`;
}

export function formatSeats(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return String(value);
}

export function formatRange(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value} km`;
}

export function formatBattery(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value} kWh`;
}

export function formatYear(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return String(value);
}

const FUEL_LABELS: Record<string, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  ELECTRIC: "Electric",
  HYBRID: "Hybrid",
  PLUG_IN_HYBRID: "Plug-in hybrid",
  CNG: "CNG",
  LPG: "LPG",
};

const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automatic",
  CVT: "CVT",
  DCT: "DCT",
};

const DRIVETRAIN_LABELS: Record<string, string> = {
  FWD: "FWD",
  RWD: "RWD",
  AWD: "AWD",
  FOUR_WD: "4WD",
};

export function labelFuelType(value: string | null | undefined): string {
  if (!value) return "-";
  return FUEL_LABELS[value] ?? value;
}

export function labelTransmission(value: string | null | undefined): string {
  if (!value) return "-";
  return TRANSMISSION_LABELS[value] ?? value;
}

export function labelDrivetrain(value: string | null | undefined): string {
  if (!value) return "-";
  return DRIVETRAIN_LABELS[value] ?? value;
}
