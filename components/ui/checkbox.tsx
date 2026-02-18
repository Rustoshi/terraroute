"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={checkboxId}
        className="inline-flex items-center gap-2 cursor-pointer"
      >
        <div className="relative">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(
              "peer sr-only",
              className
            )}
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded border border-gray-300 bg-white",
              "peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-1",
              "peer-checked:bg-blue-600 peer-checked:border-blue-600",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "transition-colors duration-200"
            )}
          >
            <Check
              className={cn(
                "h-full w-full text-white p-0.5 opacity-0",
                "peer-checked:opacity-100"
              )}
            />
          </div>
          <Check
            className="absolute inset-0 h-full w-full text-white p-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none"
          />
        </div>
        {label && (
          <span className="text-sm text-gray-700 select-none">{label}</span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
