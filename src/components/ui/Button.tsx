import { cva, VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  [
    "flex items-center gap-x-3 rounded-md transition-colors",
    "font-medium font-display",
    "disabled:opacity-90",
  ],
  {
    variants: {
      size: {
        normal: "px-4 py-3 text-sm",
        showcase: "px-6 py-4 text-lg disabled:scale-100",
      },
      variant: {
        primary: "bg-christmas-green text-white hover:bg-christmas-green",
        privileged:
          "bg-christmas-light-green text-white hover:bg-christmas-light-green focus:ring-christmas-light-green",
        secondary:
          "bg-transparent text-black hover:bg-christmas-green/10 hover:text-christmas-light-green focus:ring-christmas-light-green dark:text-white",
        danger: "bg-christmas-red text-white hover:bg-christmas-red focus:ring-christmas-red",
        modrinth:
          "text-white bg-[hsl(155,58%,38%)] hover:bg-[hsl(155,58%,48%)] focus:ring-[hsl(155,58%,38%)]",
        sky: "text-white bg-sky-500 hover:bg-sky-400 focus:ring-sky-500",
        fuchsia: "text-white bg-fuchsia-500 hover:bg-fuchsia-400 focus:ring-fuchsia-500",
        green: "text-white bg-green-500 hover:bg-green-400 focus:ring-green-500",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "normal",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={twMerge(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});

Button.displayName = "Button";

export { Button, buttonVariants };
