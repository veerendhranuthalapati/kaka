export type DemoCatalogEntry = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  year: number;
  odometerKm: number;
  engineCc: number | null;
  powerBhp: number;
  torqueNm: number;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  fuelEconomyKmpl: number | null;
  color: string;
  owners: number;
  vin: null;
  seats: number;
  rangeKm: number | null;
  batteryKwh: number | null;
  description: string;
  features: string[];
};

function entry(
  partial: Omit<DemoCatalogEntry, "vin" | "features"> & { features: string[] },
): DemoCatalogEntry {
  return { ...partial, vin: null };
}

const commonFeatures = [
  "ABS",
  "Air conditioning",
  "Bluetooth",
  "Backup camera",
  "Cruise control",
];

export const DEMO_VEHICLE_CATALOG: DemoCatalogEntry[] = [
  entry({ make: "Toyota", model: "RAV4", category: "SUV", price: 34999, quantity: 4, year: 2023, odometerKm: 18200, engineCc: 2487, powerBhp: 203, torqueNm: 247, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "AWD", fuelEconomyKmpl: 13.5, color: "Silver", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Compact SUV with a roomy cabin and balanced road manners.", features: [...commonFeatures, "Lane assist", "Apple CarPlay"] }),
  entry({ make: "Honda", model: "CR-V", category: "SUV", price: 36499, quantity: 1, year: 2022, odometerKm: 28400, engineCc: 1996, powerBhp: 190, torqueNm: 243, fuelType: "PETROL", transmission: "CVT", drivetrain: "AWD", fuelEconomyKmpl: 12.8, color: "White", owners: 2, seats: 5, rangeKm: null, batteryKwh: null, description: "Family SUV known for comfort and practical storage.", features: [...commonFeatures, "Heated seats", "Roof rails"] }),
  entry({ make: "Hyundai", model: "Tucson", category: "SUV", price: 32999, quantity: 3, year: 2024, odometerKm: 0, engineCc: 1999, powerBhp: 187, torqueNm: 264, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "AWD", fuelEconomyKmpl: 12.2, color: "Grey", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "New crossover with modern styling and driver aids.", features: [...commonFeatures, "Wireless charging", "LED headlights"] }),
  entry({ make: "Ford", model: "Explorer", category: "SUV", price: 41999, quantity: 0, year: 2021, odometerKm: 45200, engineCc: 2993, powerBhp: 300, torqueNm: 420, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "AWD", fuelEconomyKmpl: 9.8, color: "Blue", owners: 2, seats: 7, rangeKm: null, batteryKwh: null, description: "Three-row SUV suited to longer trips and towing.", features: [...commonFeatures, "Third row", "Trailer sway control"] }),
  entry({ make: "Toyota", model: "Camry", category: "Sedan", price: 32999, quantity: 3, year: 2022, odometerKm: 18400, engineCc: 2487, powerBhp: 203, torqueNm: 247, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "FWD", fuelEconomyKmpl: 14.2, color: "Silver", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Mid-size sedan with a quiet cabin and smooth ride.", features: [...commonFeatures, "Dual-zone climate", "Keyless entry"] }),
  entry({ make: "Honda", model: "Civic", category: "Sedan", price: 27999, quantity: 5, year: 2023, odometerKm: 9200, engineCc: 1996, powerBhp: 158, torqueNm: 187, fuelType: "PETROL", transmission: "CVT", drivetrain: "FWD", fuelEconomyKmpl: 15.0, color: "Red", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Compact sedan with agile handling and good fuel use.", features: [...commonFeatures, "Sport mode", "Sunroof"] }),
  entry({ make: "Hyundai", model: "Elantra", category: "Sedan", price: 24999, quantity: 1, year: 2021, odometerKm: 36800, engineCc: 1999, powerBhp: 147, torqueNm: 179, fuelType: "PETROL", transmission: "CVT", drivetrain: "FWD", fuelEconomyKmpl: 14.8, color: "Black", owners: 2, seats: 5, rangeKm: null, batteryKwh: null, description: "Efficient sedan with straightforward tech and comfort.", features: [...commonFeatures, "Android Auto", "Blind-spot alert"] }),
  entry({ make: "BMW", model: "3 Series", category: "Sedan", price: 45999, quantity: 2, year: 2022, odometerKm: 22100, engineCc: 1998, powerBhp: 255, torqueNm: 400, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "RWD", fuelEconomyKmpl: 12.5, color: "White", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Sport sedan with rear-wheel drive balance.", features: [...commonFeatures, "Parking sensors", "Navigation"] }),
  entry({ make: "Mercedes-Benz", model: "C-Class", category: "Sedan", price: 47999, quantity: 0, year: 2023, odometerKm: 11200, engineCc: 1991, powerBhp: 255, torqueNm: 400, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "RWD", fuelEconomyKmpl: 12.0, color: "Silver", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Premium sedan focused on comfort and refinement.", features: [...commonFeatures, "Ambient lighting", "Power seats"] }),

  entry({ make: "Volkswagen", model: "Golf", category: "Hatchback", price: 27999, quantity: 4, year: 2019, odometerKm: 54800, engineCc: 1395, powerBhp: 147, torqueNm: 250, fuelType: "PETROL", transmission: "DCT", drivetrain: "FWD", fuelEconomyKmpl: 15.1, color: "Grey", owners: 2, seats: 5, rangeKm: null, batteryKwh: null, description: "Versatile hatch with tidy dimensions and solid build.", features: [...commonFeatures, "Split-fold rear", "Rain sensors"] }),
  entry({ make: "Suzuki", model: "Swift", category: "Hatchback", price: 18999, quantity: 6, year: 2020, odometerKm: 41200, engineCc: 1197, powerBhp: 82, torqueNm: 113, fuelType: "PETROL", transmission: "MANUAL", drivetrain: "FWD", fuelEconomyKmpl: 16.5, color: "Orange", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Light city hatch that is easy to park and run.", features: [...commonFeatures, "ISOFIX mounts", "Touchscreen"] }),
  entry({ make: "Hyundai", model: "i20", category: "Hatchback", price: 19999, quantity: 3, year: 2024, odometerKm: 0, engineCc: 1197, powerBhp: 88, torqueNm: 115, fuelType: "PETROL", transmission: "MANUAL", drivetrain: "FWD", fuelEconomyKmpl: 16.0, color: "Blue", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "New supermini with updated safety kit.", features: [...commonFeatures, "Rear parking sensors", "LED DRLs"] }),
  entry({ make: "Mazda", model: "Mazda3", category: "Hatchback", price: 26999, quantity: 2, year: 2021, odometerKm: 33200, engineCc: 1998, powerBhp: 150, torqueNm: 213, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "FWD", fuelEconomyKmpl: 14.0, color: "Red", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Stylish hatch with attentive steering feel.", features: [...commonFeatures, "Head-up display", "Bose audio"] }),
  entry({ make: "Toyota", model: "Yaris", category: "Hatchback", price: 21999, quantity: 7, year: 2023, odometerKm: 6800, engineCc: 1490, powerBhp: 116, torqueNm: 185, fuelType: "HYBRID", transmission: "CVT", drivetrain: "FWD", fuelEconomyKmpl: 18.0, color: "White", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Small hybrid hatch aimed at urban driving.", features: [...commonFeatures, "Regen braking", "Eco mode"] }),

  entry({ make: "Ford", model: "F-150", category: "Truck", price: 48999, quantity: 1, year: 2020, odometerKm: 45200, engineCc: 3496, powerBhp: 400, torqueNm: 678, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "FOUR_WD", fuelEconomyKmpl: 9.4, color: "Blue", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Full-size pickup with strong towing capability.", features: [...commonFeatures, "Bed liner", "Tow package"] }),
  entry({ make: "Toyota", model: "Hilux", category: "Truck", price: 42999, quantity: 3, year: 2022, odometerKm: 38900, engineCc: 2755, powerBhp: 204, torqueNm: 500, fuelType: "DIESEL", transmission: "AUTOMATIC", drivetrain: "FOUR_WD", fuelEconomyKmpl: 11.0, color: "White", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Durable pickup built for rough roads and loads.", features: [...commonFeatures, "Diff lock", "Steel wheels"] }),
  entry({ make: "Chevrolet", model: "Silverado", category: "Truck", price: 46999, quantity: 2, year: 2021, odometerKm: 50100, engineCc: 5328, powerBhp: 355, torqueNm: 617, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "FOUR_WD", fuelEconomyKmpl: 8.8, color: "Black", owners: 2, seats: 5, rangeKm: null, batteryKwh: null, description: "Large pickup with a spacious cab and bed.", features: [...commonFeatures, "Trailer brake", "Running boards"] }),
  entry({ make: "Ram", model: "1500", category: "Truck", price: 49999, quantity: 0, year: 2023, odometerKm: 15400, engineCc: 3600, powerBhp: 305, torqueNm: 556, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "FOUR_WD", fuelEconomyKmpl: 9.0, color: "Grey", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Comfort-oriented truck with coil-spring rear suspension.", features: [...commonFeatures, "Bed step", "Power tailgate"] }),

  entry({ make: "Ford", model: "Mustang", category: "Coupe", price: 44999, quantity: 2, year: 2022, odometerKm: 19800, engineCc: 5038, powerBhp: 450, torqueNm: 529, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "RWD", fuelEconomyKmpl: 9.2, color: "Red", owners: 1, seats: 4, rangeKm: null, batteryKwh: null, description: "Iconic pony car with V8 performance.", features: [...commonFeatures, "Launch control", "Limited-slip diff"] }),
  entry({ make: "Chevrolet", model: "Camaro", category: "Coupe", price: 42999, quantity: 1, year: 2021, odometerKm: 26700, engineCc: 6162, powerBhp: 455, torqueNm: 617, fuelType: "PETROL", transmission: "MANUAL", drivetrain: "RWD", fuelEconomyKmpl: 8.5, color: "Yellow", owners: 1, seats: 4, rangeKm: null, batteryKwh: null, description: "Muscle coupe with sharp handling for its class.", features: [...commonFeatures, "Performance exhaust", "Recaro seats"] }),
  entry({ make: "BMW", model: "4 Series", category: "Coupe", price: 52999, quantity: 3, year: 2023, odometerKm: 8900, engineCc: 1998, powerBhp: 255, torqueNm: 400, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "RWD", fuelEconomyKmpl: 12.0, color: "Black", owners: 1, seats: 4, rangeKm: null, batteryKwh: null, description: "Two-door coupe with gran coupe practicality options.", features: [...commonFeatures, "M Sport brakes", "Harman Kardon"] }),
  entry({ make: "Toyota", model: "GR86", category: "Coupe", price: 31999, quantity: 4, year: 2024, odometerKm: 0, engineCc: 2387, powerBhp: 228, torqueNm: 250, fuelType: "PETROL", transmission: "MANUAL", drivetrain: "RWD", fuelEconomyKmpl: 11.5, color: "White", owners: 1, seats: 4, rangeKm: null, batteryKwh: null, description: "Lightweight rear-drive coupe for enthusiasts.", features: [...commonFeatures, "Track mode", "Alloy pedals"] }),

  entry({ make: "Tesla", model: "Model 3", category: "EV", price: 45999, quantity: 2, year: 2023, odometerKm: 8200, engineCc: null, powerBhp: 283, torqueNm: 420, fuelType: "ELECTRIC", transmission: "AUTOMATIC", drivetrain: "RWD", fuelEconomyKmpl: null, color: "Pearl White", owners: 1, seats: 5, rangeKm: 513, batteryKwh: 60, description: "Battery electric sedan with fast charging access.", features: [...commonFeatures, "Autopilot", "Heat pump", "Glass roof"] }),
  entry({ make: "Hyundai", model: "Ioniq 5", category: "EV", price: 38999, quantity: 1, year: 2024, odometerKm: 0, engineCc: null, powerBhp: 225, torqueNm: 350, fuelType: "ELECTRIC", transmission: "AUTOMATIC", drivetrain: "RWD", fuelEconomyKmpl: null, color: "Blue", owners: 1, seats: 5, rangeKm: 480, batteryKwh: 77.4, description: "Retro-styled EV with roomy interior and 800V charging.", features: [...commonFeatures, "Vehicle-to-load", "Heated steering"] }),
  entry({ make: "Nissan", model: "Leaf", category: "EV", price: 29999, quantity: 3, year: 2022, odometerKm: 24100, engineCc: null, powerBhp: 148, torqueNm: 320, fuelType: "ELECTRIC", transmission: "AUTOMATIC", drivetrain: "FWD", fuelEconomyKmpl: null, color: "Silver", owners: 1, seats: 5, rangeKm: 270, batteryKwh: 40, description: "Compact EV hatch for city commuting.", features: [...commonFeatures, "e-Pedal", "CHAdeMO port"] }),
  entry({ make: "Kia", model: "EV6", category: "EV", price: 41999, quantity: 0, year: 2023, odometerKm: 12500, engineCc: null, powerBhp: 320, torqueNm: 605, fuelType: "ELECTRIC", transmission: "AUTOMATIC", drivetrain: "AWD", fuelEconomyKmpl: null, color: "Green", owners: 1, seats: 5, rangeKm: 506, batteryKwh: 77.4, description: "Crossover EV with strong acceleration and range.", features: [...commonFeatures, "Augmented reality HUD", "Fast charge"] }),

  entry({ make: "Volvo", model: "V60", category: "Wagon", price: 44999, quantity: 2, year: 2021, odometerKm: 35600, engineCc: 1969, powerBhp: 250, torqueNm: 350, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "AWD", fuelEconomyKmpl: 11.8, color: "Grey", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Premium wagon with a large load bay.", features: [...commonFeatures, "Power tailgate", "Pilot assist"] }),
  entry({ make: "Subaru", model: "Outback", category: "Wagon", price: 33999, quantity: 1, year: 2022, odometerKm: 22100, engineCc: 2498, powerBhp: 182, torqueNm: 239, fuelType: "PETROL", transmission: "CVT", drivetrain: "AWD", fuelEconomyKmpl: 11.9, color: "Green", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Raised wagon with standard all-wheel drive.", features: [...commonFeatures, "X-Mode", "Roof bars"] }),
  entry({ make: "Audi", model: "A4 Avant", category: "Wagon", price: 46999, quantity: 3, year: 2020, odometerKm: 48200, engineCc: 1984, powerBhp: 190, torqueNm: 320, fuelType: "PETROL", transmission: "AUTOMATIC", drivetrain: "AWD", fuelEconomyKmpl: 12.3, color: "Black", owners: 2, seats: 5, rangeKm: null, batteryKwh: null, description: "Quattro wagon blending comfort and cargo space.", features: [...commonFeatures, "Virtual cockpit", "Matrix LED"] }),
  entry({ make: "Skoda", model: "Octavia Combi", category: "Wagon", price: 29999, quantity: 5, year: 2023, odometerKm: 14300, engineCc: 1498, powerBhp: 150, torqueNm: 250, fuelType: "PETROL", transmission: "DCT", drivetrain: "FWD", fuelEconomyKmpl: 14.5, color: "Blue", owners: 1, seats: 5, rangeKm: null, batteryKwh: null, description: "Practical estate with a very large boot.", features: [...commonFeatures, "Split folding", "Parking assist"] }),

  entry({ make: "Toyota", model: "RAV4 Hybrid", category: "SUV", price: 39999, quantity: 2, year: 2024, odometerKm: 0, engineCc: 2487, powerBhp: 219, torqueNm: 221, fuelType: "PLUG_IN_HYBRID", transmission: "CVT", drivetrain: "AWD", fuelEconomyKmpl: 18.6, color: "White", owners: 1, seats: 5, rangeKm: 68, batteryKwh: 18.1, description: "Plug-in hybrid SUV with electric-only commuting range.", features: [...commonFeatures, "Hybrid drive", "Safety Sense"] }),
];
