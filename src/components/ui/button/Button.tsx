import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; 
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "warning" | "outline" | "outlinePrimary" | "secondary" | "ghost" | "link" | "disabled" | "text-primary"; // Button variant
  startIcon?: ReactNode; 
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "default",
  variant = "default",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {  const buttonStyles = {
    variants: {      variant: {
        default:
          'bg-primary text-primary-foreground text-white shadow hover:bg-primary/90 [&>svg]:text-primary-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow hover:bg-destructive/90',
        warning: 'bg-warning text-warning-foreground shadow hover:bg-warning/90',
        outline: 'border bg-transparent hover:bg-transparent hover:shadow',
        outlinePrimary:
          'peer border border-primary bg-transparent hover:bg-transparent text-primary [&>svg]:fill-primary',
        secondary: 'bg-secondary text-secondary-foreground shadow hover:bg-secondary/80',
        ghost: '',
        link: 'text-primary underline-offset-4 hover:underline',
        'text-primary': 'bg-primary text-white hover:bg-primary/90',
        disabled: 'text-white bg-[#CAD1D8]',
      },
      size: {
        default: 'h-[45px] rounded-sm px-7',
        sm: 'h-[45px] w-[100px] rounded-sm px-3 text-xs',
        lg: 'h-10 rounded-sm px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium gap-2 transition ${className} ${
        buttonStyles.variants.size[size]
      } ${buttonStyles.variants.variant[disabled ? "disabled" : variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
