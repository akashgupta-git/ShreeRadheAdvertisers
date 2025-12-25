import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number in Indian rupee style (lakhs, crores)
 * Example: 1234567 -> "12,34,567"
 */
export function formatIndianRupee(amount: number): string {
  if (amount === 0) return "0";
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Convert to string and split by decimal
  const [integerPart, decimalPart] = absAmount.toString().split(".");
  
  // Format the integer part in Indian style
  let result = "";
  const len = integerPart.length;
  
  if (len <= 3) {
    result = integerPart;
  } else {
    // Last 3 digits
    result = integerPart.slice(-3);
    let remaining = integerPart.slice(0, -3);
    
    // Add pairs of digits from right to left
    while (remaining.length > 2) {
      result = remaining.slice(-2) + "," + result;
      remaining = remaining.slice(0, -2);
    }
    
    if (remaining.length > 0) {
      result = remaining + "," + result;
    }
  }
  
  // Add decimal part if exists
  if (decimalPart) {
    result += "." + decimalPart;
  }
  
  return (isNegative ? "-" : "") + result;
}

/**
 * Formats amount with ₹ symbol in Indian style
 */
export function formatRupee(amount: number): string {
  return `₹${formatIndianRupee(amount)}`;
}
