/**
 * Formats a rupee amount using Indian digit grouping (e.g. 125000 -> "₹1,25,000").
 * Implemented manually so it doesn't depend on Intl locale data availability in Hermes.
 */
export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  const negative = rounded < 0;
  const digits = Math.abs(rounded).toString();

  let grouped = digits;
  if (digits.length > 3) {
    const lastThree = digits.slice(-3);
    const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    grouped = `${rest},${lastThree}`;
  }

  return `${negative ? '-' : ''}₹${grouped}`;
}
