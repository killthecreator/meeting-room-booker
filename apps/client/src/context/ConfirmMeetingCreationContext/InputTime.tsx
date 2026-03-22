import type { InputHTMLAttributes } from "react";
import { CONFIG } from "../../config";

type InputTimeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className" | "required" | "step"
>;

export default function InputTime(props: InputTimeProps) {
  return (
    <input
      type="time"
      className="flex-1 rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 shadow-sm transition-colors duration-150 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/40"
      step={CONFIG.TIME_STEP * 60}
      required
      {...props}
    />
  );
}
