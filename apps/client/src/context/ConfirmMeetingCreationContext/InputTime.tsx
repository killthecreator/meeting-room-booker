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
      className="border-secondary-200 text-secondary-900 focus:border-primary-400 focus:ring-primary-100 flex-1 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-150 focus:ring-2 focus:outline-none"
      step={CONFIG.TIME_STEP * 60}
      required
      {...props}
    />
  );
}
