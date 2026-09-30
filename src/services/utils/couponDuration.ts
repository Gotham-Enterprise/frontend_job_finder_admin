const MONTH_PRESETS = [1, 3, 6, 12] as const;

export const COUPON_DURATION_MONTH_PRESETS = MONTH_PRESETS;

export const formatCouponDurationTable = (
  duration?: string | null,
  durationInMonths?: number | null
): string => {
  if (duration === 'repeating' && durationInMonths) {
    const unit = durationInMonths === 1 ? 'month' : 'months';
    return `Repeating (${durationInMonths} ${unit})`;
  }
  if (!duration) return 'N/A';
  return duration.charAt(0).toUpperCase() + duration.slice(1);
};

export const formatCouponDurationCheckout = (
  duration?: string | null,
  durationInMonths?: number | null
): string | null => {
  if (duration === 'forever') return 'Applies to every invoice';
  if (duration === 'once') return 'Applies to the first invoice only';
  if (duration === 'repeating' && durationInMonths) {
    const unit = durationInMonths === 1 ? 'month' : 'months';
    return `Applies for ${durationInMonths} ${unit}`;
  }
  return null;
};
