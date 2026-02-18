import { ServiceType, PackageDetails } from "@/types";

/**
 * Quote estimation utility.
 * Calculates shipping cost estimates based on package details and service type.
 *
 * This is a simplified estimation model. In production, you would integrate
 * with actual carrier APIs or use more sophisticated pricing algorithms.
 */

// Base rates per service type (per kg)
const BASE_RATES: Record<ServiceType, number> = {
  [ServiceType.ECONOMY]: 3.5,
  [ServiceType.STANDARD]: 5.0,
  [ServiceType.EXPRESS]: 12.0,
  [ServiceType.PRIORITY]: 15.0,
  [ServiceType.SAME_DAY]: 25.0,
  [ServiceType.NEXT_DAY]: 18.0,
  [ServiceType.OVERNIGHT]: 20.0,
};

// Dimensional weight divisor (standard industry value)
const DIM_WEIGHT_DIVISOR = 5000; // cm³ to kg conversion

// Service type multipliers for additional fees
const SERVICE_MULTIPLIERS: Record<ServiceType, number> = {
  [ServiceType.ECONOMY]: 0.8,
  [ServiceType.STANDARD]: 1.0,
  [ServiceType.EXPRESS]: 1.5,
  [ServiceType.PRIORITY]: 1.8,
  [ServiceType.SAME_DAY]: 2.5,
  [ServiceType.NEXT_DAY]: 2.0,
  [ServiceType.OVERNIGHT]: 2.2,
};

// Minimum charges per service type
const MINIMUM_CHARGES: Record<ServiceType, number> = {
  [ServiceType.ECONOMY]: 10.0,
  [ServiceType.STANDARD]: 15.0,
  [ServiceType.EXPRESS]: 35.0,
  [ServiceType.PRIORITY]: 45.0,
  [ServiceType.SAME_DAY]: 75.0,
  [ServiceType.NEXT_DAY]: 50.0,
  [ServiceType.OVERNIGHT]: 60.0,
};

// Insurance rate (percentage of declared value)
const INSURANCE_RATE = 0.02; // 2%

// Handling fee for high-value items (value > $1000)
const HIGH_VALUE_HANDLING_FEE = 25.0;
const HIGH_VALUE_THRESHOLD = 1000;

interface EstimationResult {
  baseCharge: number;
  dimensionalWeight: number;
  chargeableWeight: number;
  insuranceFee: number;
  handlingFee: number;
  totalEstimate: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

/**
 * Calculate dimensional weight from package dimensions.
 * Dimensional weight = (L × W × H) / divisor
 */
export function calculateDimensionalWeight(dimensions: {
  length: number;
  width: number;
  height: number;
}): number {
  const { length, width, height } = dimensions;
  return (length * width * height) / DIM_WEIGHT_DIVISOR;
}

/**
 * Get the chargeable weight (higher of actual vs dimensional weight).
 */
export function getChargeableWeight(
  actualWeight: number,
  dimensions: { length: number; width: number; height: number }
): number {
  const dimWeight = calculateDimensionalWeight(dimensions);
  return Math.max(actualWeight, dimWeight);
}

/**
 * Calculate estimated shipping cost.
 * Uses the higher of actual weight vs dimensional weight for pricing.
 */
export function calculateEstimate(
  packageDetails: PackageDetails,
  serviceType: ServiceType
): EstimationResult {
  const { weight, dimensions, value } = packageDetails;

  // Calculate weights
  const dimensionalWeight = calculateDimensionalWeight(dimensions);
  const chargeableWeight = Math.max(weight, dimensionalWeight);

  // Base charge calculation
  const baseRate = BASE_RATES[serviceType];
  const multiplier = SERVICE_MULTIPLIERS[serviceType];
  let baseCharge = chargeableWeight * baseRate * multiplier;

  // Apply minimum charge
  const minimumCharge = MINIMUM_CHARGES[serviceType];
  baseCharge = Math.max(baseCharge, minimumCharge);

  // Insurance fee (based on declared value)
  const declaredValue = value || 0;
  const insuranceFee = declaredValue * INSURANCE_RATE;

  // Handling fee for high-value items
  const handlingFee = declaredValue > HIGH_VALUE_THRESHOLD ? HIGH_VALUE_HANDLING_FEE : 0;

  // Total estimate
  const totalEstimate = baseCharge + insuranceFee + handlingFee;

  // Build breakdown
  const breakdown: { label: string; amount: number }[] = [
    { label: "Shipping charge", amount: baseCharge },
    { label: "Insurance (2%)", amount: insuranceFee },
  ];

  if (handlingFee > 0) {
    breakdown.push({ label: "High-value handling", amount: handlingFee });
  }

  return {
    baseCharge: Math.round(baseCharge * 100) / 100,
    dimensionalWeight: Math.round(dimensionalWeight * 100) / 100,
    chargeableWeight: Math.round(chargeableWeight * 100) / 100,
    insuranceFee: Math.round(insuranceFee * 100) / 100,
    handlingFee: Math.round(handlingFee * 100) / 100,
    totalEstimate: Math.round(totalEstimate * 100) / 100,
    breakdown,
  };
}

/**
 * Get a quick estimate without detailed breakdown.
 */
export function getQuickEstimate(
  weight: number,
  dimensions: { length: number; width: number; height: number },
  serviceType: ServiceType
): number {
  const chargeableWeight = getChargeableWeight(weight, dimensions);
  const baseRate = BASE_RATES[serviceType];
  const multiplier = SERVICE_MULTIPLIERS[serviceType];
  const minimumCharge = MINIMUM_CHARGES[serviceType];

  const estimate = Math.max(chargeableWeight * baseRate * multiplier, minimumCharge);
  return Math.round(estimate * 100) / 100;
}

/**
 * Get estimated delivery time based on service type.
 */
export function getEstimatedDeliveryDays(serviceType: ServiceType): {
  min: number;
  max: number;
} {
  switch (serviceType) {
    case ServiceType.SAME_DAY:
      return { min: 0, max: 1 };
    case ServiceType.NEXT_DAY:
      return { min: 1, max: 2 };
    case ServiceType.OVERNIGHT:
      return { min: 1, max: 2 };
    case ServiceType.EXPRESS:
      return { min: 1, max: 3 };
    case ServiceType.PRIORITY:
      return { min: 2, max: 4 };
    case ServiceType.STANDARD:
      return { min: 5, max: 10 };
    case ServiceType.ECONOMY:
      return { min: 10, max: 21 };
    default:
      return { min: 5, max: 10 };
  }
}

/**
 * Calculate estimated delivery date from today.
 * Returns a date-only string (YYYY-MM-DD) in UTC.
 */
export function calculateEstimatedDeliveryDate(serviceType: ServiceType): string {
  const { max } = getEstimatedDeliveryDays(serviceType);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + max);
  return deliveryDate.toISOString().split("T")[0];
}
