export const BUTTON_VARIANTS = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' }
] as const;

export const BUTTON_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
] as const;

export const BUTTON_WIDTHS = [
  { value: 'auto', label: 'Auto' },
  { value: 'full', label: 'Full Width' },
  { value: 'custom', label: 'Custom' }
] as const;

export const BUTTON_ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' }
] as const;

export const LINK_TARGETS = [
  { value: '_self', label: 'Same Tab' },
  { value: '_blank', label: 'New Tab' }
] as const;

export type ButtonVariant = typeof BUTTON_VARIANTS[number]['value'];
export type ButtonSize = typeof BUTTON_SIZES[number]['value'];
export type LinkTarget = typeof LINK_TARGETS[number]['value'];

export const getButtonDefaultStyles = (variant: ButtonVariant) => {
  const baseStyles = {
    fontSize: '1rem',
    fontWeight: '500',
    textAlign: 'center' as const,
    padding: { top: 12, right: 24, bottom: 12, left: 24 },
    margin: { top: 0, right: 0, bottom: 16, left: 0 },
    border: { width: 0, style: 'solid', color: 'transparent', radius: 6 },
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
      };
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: '#6b7280',
        textColor: '#ffffff',
      };
    case 'outline':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        textColor: '#3b82f6',
        border: { ...baseStyles.border, width: 1, color: '#3b82f6' },
      };
    case 'ghost':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        textColor: '#374151',
      };
    default:
      return baseStyles;
  }
};

export const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return {
        fontSize: '0.875rem',
        padding: { top: 8, right: 16, bottom: 8, left: 16 },
      };
    case 'medium':
      return {
        fontSize: '1rem',
        padding: { top: 12, right: 24, bottom: 12, left: 24 },
      };
    case 'large':
      return {
        fontSize: '1.125rem',
        padding: { top: 16, right: 32, bottom: 16, left: 32 },
      };
    default:
      return {
        fontSize: '1rem',
        padding: { top: 12, right: 24, bottom: 12, left: 24 },
      };
  }
};
