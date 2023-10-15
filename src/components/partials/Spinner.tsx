import { Loader2Icon } from "lucide-react";
import { twMerge } from "tailwind-merge";

const Spinner = ({ className }: { className?: string }) => {
  return <Loader2Icon className={twMerge("animate-spin-fast", className)} />;
};

export { Spinner };
