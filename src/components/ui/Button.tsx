import { VariantProps, cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { forwardRef } from 'react';

const buttonVariants = cva(
  [
    'flex items-center gap-x-3 rounded-md transition-all',
    'font-medium tracking-tight',
    'disabled:opacity-90',
  ],
  {
    variants: {
      size: {
        normal: 'px-4 py-3 text-sm',
        showcase: 'px-6 py-4 text-lg disabled:scale-100',
      },
      variant: {
        primary: 'bg-indigo-500 text-white hover:bg-indigo-400',
        secondary:
          'bg-transparent text-black hover:bg-indigo-500/10 hover:text-indigo-400 focus:ring-indigo-400/40 dark:text-white',
        danger: 'bg-red-500 text-white hover:bg-red-400 focus:ring-red-400/50',
        modrinth:
          'text-white bg-[hsl(155,58%,38%)] hover:bg-[hsl(155,58%,48%)] focus:ring-[hsla(155,58%,38%,60%)]',
        sky: 'text-white bg-sky-500 hover:bg-sky-400 focus:ring-sky-500/60',
        fuchsia:
          'text-white bg-fuchsia-500 hover:bg-fuchsia-400 focus:ring-fuchsia-500/60',
        green:
          'text-white bg-green-500 hover:bg-green-400 focus:ring-green-500/60',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'normal',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={twMerge(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };