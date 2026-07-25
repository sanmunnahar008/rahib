// Bengali Month Names
export const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

/**
 * Formats a number with Indian numbering system (e.g. 1,25,000) using English digits
 */
export function formatBnNumber(n: number | string | null | undefined): string {
  if (n === null || n === undefined || isNaN(Number(n))) return '0';
  const num = Math.abs(Number(n));
  const isNegative = Number(n) < 0;

  const parts = num.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian numbering pattern: last 3 digits, then groups of 2
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    integerPart = `${formattedOthers},${lastThree}`;
  }

  const result = decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
  return isNegative ? `-${result}` : result;
}

/**
 * Formats currency in BDT taka (e.g. "৳ 1,25,000.00")
 */
export function formatBnCurrency(n: number | string | null | undefined): string {
  if (n === null || n === undefined || isNaN(Number(n))) return '৳ 0.00';
  const num = Number(n);
  const fixed = num.toFixed(2);
  const parts = fixed.split('.');
  const intFormatted = formatBnNumber(Number(parts[0]));
  return `৳ ${intFormatted}.${parts[1]}`;
}

/**
 * Formats date into Bengali month with English digits (e.g. "25 জুলাই 2026")
 */
export function formatBnDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  const monthName = BENGALI_MONTHS[monthIndex] || '';
  return `${day} ${monthName} ${year}`;
}
