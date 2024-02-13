import { twMerge } from "tailwind-merge";
import { type ReactNode } from "react";

export const Select = <T extends string>({
  name,
  value,
  currentValue,
  onCheck,
  children,
  className,
}: {
  name: string;
  value: T;
  currentValue: T;
  onCheck?: (v: T) => void | Promise<void>;
  className?: string;
  children?: ReactNode | ReactNode[];
}) => {
  return (
    <label
      className={twMerge(
        "flex w-full flex-col items-start gap-y-2 rounded-md p-4 hover:cursor-pointer",
        value === currentValue ? "bg-indigo-500 text-white" : "bg-neutral-100 dark:bg-neutral-800",
        className,
      )}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={value === currentValue}
        onChange={(ev) => {
          if (onCheck && ev.target.value) void onCheck(ev.target.value as T);
        }}
      />
      {children}
    </label>
  );
};
